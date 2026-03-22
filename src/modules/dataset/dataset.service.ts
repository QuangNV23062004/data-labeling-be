import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { basename } from 'path';
import { OnEvent, EventEmitter2 } from '@nestjs/event-emitter';
import { ProjectSnapshotRepository } from '../project-snapshot/project-snapshot.repository';
import { ProjectSnapshotEntity } from '../project-snapshot/project-snapshot.entity';
import { StorageService } from 'src/common/storage/storage.service';
import { NotificationType } from '../notification/enums/notification-types.enums';
import { NOTIFICATION_EVENTS } from '../notification/enums/notification-events.constants';
import { ExportRequestDto } from './dtos/export-request.dto';
import {
  ExportEmptySnapshotException,
  ExportJobNotFoundException,
  ExportJobNotReadyException,
  ExportSnapshotNotFoundException,
} from './exceptions/dataset-exceptions.exception';

type ExportStatus = 'PENDING' | 'DONE' | 'FAILED';

interface ExportCacheEntry {
  exportId: string;
  snapshotId: string;
  snapshotName: string;
  snapshotVersion: string;
  requestedById: string;
  status: ExportStatus;
  fileSize: number | null;
  zipBuffer: Buffer | null;
  error: string | null;
}

const CACHE_TTL_MS = 5 * 60 * 1000;
const SNAPSHOT_FILES_TTL_MS = 30 * 60 * 1000;
const DOWNLOAD_CONCURRENCY = 5;

/**
 * Runs `tasks` with at most `concurrency` in-flight at a time.
 * Each task is a zero-arg async factory so it is only started when a slot opens.
 * Settled results (fulfilled or rejected) are returned in input order.
 */
/**
 * Returns the safe basename of a filename, stripping any path separators
 * (both Unix and Windows) to prevent zip-slip attacks.
 */
function safeBasename(name: string): string {
  // basename() strips directory components; replace any remaining separators
  return basename(name).replace(/[\/\\]/g, '_') || 'file';
}

async function concurrentMap<T>(
  concurrency: number,
  tasks: (() => Promise<T>)[],
): Promise<PromiseSettledResult<T>[]> {
  const results: PromiseSettledResult<T>[] = new Array(tasks.length);
  let next = 0;

  async function worker(): Promise<void> {
    while (next < tasks.length) {
      const index = next++;
      try {
        results[index] = { status: 'fulfilled', value: await tasks[index]() };
      } catch (reason) {
        results[index] = { status: 'rejected', reason };
      }
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(concurrency, tasks.length) }, worker),
  );
  return results;
}

@Injectable()
export class DatasetService {
  private readonly exportCache = new Map<string, ExportCacheEntry>();
  // keyed by snapshotId → Map<fileUrl, { name, buffer }>
  private readonly snapshotFilesCache = new Map<
    string,
    Map<string, { name: string; buffer: Buffer }>
  >();

  constructor(
    private readonly projectSnapshotRepository: ProjectSnapshotRepository,
    private readonly storageService: StorageService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async InitiateExport(
    snapshotId: string,
    config: ExportRequestDto,
    requestedById: string,
  ): Promise<{ exportId: string; status: ExportStatus }> {
    const snapshot = await this.projectSnapshotRepository.FindById(snapshotId);

    if (!snapshot) {
      throw new ExportSnapshotNotFoundException(snapshotId);
    }

    const files: any[] = snapshot.snapshotData?.files ?? [];
    if (files.length === 0) {
      throw new ExportEmptySnapshotException(snapshotId);
    }

    const exportId = randomUUID();
    const entry: ExportCacheEntry = {
      exportId,
      snapshotId: snapshot.id,
      snapshotName: snapshot.name,
      snapshotVersion: snapshot.version,
      requestedById,
      status: 'PENDING',
      fileSize: null,
      zipBuffer: null,
      error: null,
    };

    this.exportCache.set(exportId, entry);
    setTimeout(() => this.exportCache.delete(exportId), CACHE_TTL_MS);

    setImmediate(() => this.runExportJob(exportId, snapshot, config));

    return { exportId, status: 'PENDING' };
  }

  GetExportStatus(exportId: string): {
    exportId: string;
    status: ExportStatus;
    fileSize: number | null;
    error: string | null;
  } {
    const entry = this.exportCache.get(exportId);
    if (!entry) {
      throw new ExportJobNotFoundException(exportId);
    }
    return {
      exportId: entry.exportId,
      status: entry.status,
      fileSize: entry.fileSize,
      error: entry.error,
    };
  }

  DownloadExport(exportId: string): { buffer: Buffer; fileName: string } {
    const entry = this.exportCache.get(exportId);
    if (!entry) {
      throw new ExportJobNotFoundException(exportId);
    }
    if (entry.status !== 'DONE') {
      throw new ExportJobNotReadyException(exportId, entry.status);
    }
    if (!entry.zipBuffer) {
      throw new ExportJobNotReadyException(exportId, 'ALREADY_DOWNLOADED');
    }

    const buffer = entry.zipBuffer;
    const fileName =
      `${entry.snapshotName}-${entry.snapshotVersion}.zip`
        .replace(/\s+/g, '_')
        .replace(/[^a-zA-Z0-9._-]/g, '');

    entry.zipBuffer = null;

    return { buffer, fileName };
  }

  DeleteExport(exportId: string): void {
    if (!this.exportCache.has(exportId)) {
      throw new ExportJobNotFoundException(exportId);
    }
    this.exportCache.delete(exportId);
  }

  ClearAllExports(): { cleared: number } {
    const count = this.exportCache.size;
    this.exportCache.clear();
    return { cleared: count };
  }

  @OnEvent('snapshot.created')
  async handleSnapshotCreated(payload: { snapshotId: string }): Promise<void> {
    const snapshot = await this.projectSnapshotRepository.FindById(
      payload.snapshotId,
      true,
    );
    if (!snapshot) return;

    const files: any[] = snapshot.snapshotData?.files ?? [];
    const fileCache = new Map<string, { name: string; buffer: Buffer }>();

    await concurrentMap(
      DOWNLOAD_CONCURRENCY,
      files
        .filter((f) => f.url && (f.labels ?? []).length > 0)
        .map((f) => async () => {
          try {
            const buffer = await this.storageService.DownloadBlobByUrl(f.url);
            fileCache.set(f.url, { name: f.name, buffer });
          } catch {
            // skip files that fail; they will be downloaded on-demand in runExportJob
          }
        }),
    );

    this.snapshotFilesCache.set(payload.snapshotId, fileCache);
    setTimeout(
      () => this.snapshotFilesCache.delete(payload.snapshotId),
      SNAPSHOT_FILES_TTL_MS,
    );
  }

  private async runExportJob(
    exportId: string,
    snapshot: ProjectSnapshotEntity,
    config: ExportRequestDto,
  ): Promise<void> {
    const entry = this.exportCache.get(exportId);
    if (!entry) return;

    try {
      const json = this.serializeToJson(snapshot, config);
      const files: any[] = snapshot.snapshotData.files;
      const preDownloaded = this.snapshotFilesCache.get(snapshot.id);

      const zipEntries: { name: string; buffer: Buffer }[] = [
        { name: 'annotations.json', buffer: Buffer.from(json, 'utf-8') },
      ];
      const usedNames = new Set<string>(['annotations.json']);

      const uniqueZipName = (base: string): string => {
        if (!usedNames.has(base)) {
          usedNames.add(base);
          return base;
        }
        const dot = base.lastIndexOf('.');
        const stem = dot !== -1 ? base.slice(0, dot) : base;
        const ext = dot !== -1 ? base.slice(dot) : '';
        let counter = 1;
        let candidate: string;
        do {
          candidate = `${stem} (${counter++})${ext}`;
        } while (usedNames.has(candidate));
        usedNames.add(candidate);
        return candidate;
      };

      await concurrentMap(
        DOWNLOAD_CONCURRENCY,
        files
          .filter((file) => file.url && (file.labels ?? []).length > 0)
          .map((file) => async () => {
            try {
              const cached = preDownloaded?.get(file.url);
              const buffer = cached
                ? cached.buffer
                : await this.storageService.DownloadBlobByUrl(file.url);
              const entryName = uniqueZipName(`files/${safeBasename(file.name)}`);
              zipEntries.push({ name: entryName, buffer });
            } catch {
              // skip files that fail to download
            }
          }),
      );

      // annotations.json is always entry [0]; media files start at [1]
      if (zipEntries.length < 2) {
        throw new Error(
          'No files could be downloaded for this snapshot export',
        );
      }

      const zipBuffer = await this.storageService.CreateZip(zipEntries);
      entry.status = 'DONE';
      entry.zipBuffer = zipBuffer;
      entry.fileSize = zipBuffer.length;

      this.eventEmitter.emit(NOTIFICATION_EVENTS.CREATE, {
        accountId: entry.requestedById,
        title: 'Dataset export ready',
        content: `Your dataset export "${entry.snapshotName}-${entry.snapshotVersion}" is ready to download.`,
        additionalData: {
          type: NotificationType.DATASET_EXPORT_READY,
          exportId: entry.exportId,
          snapshotId: entry.snapshotId,
          fileSize: entry.fileSize,
        },
      });
    } catch (err) {
      entry.status = 'FAILED';
      entry.error = err instanceof Error ? err.message : String(err);
    }
  }

  private serializeToJson(
    snapshot: ProjectSnapshotEntity,
    config: ExportRequestDto,
  ): string {
    const files: any[] = snapshot.snapshotData.files;

    const categoriesMap = new Map<
      string,
      { id: string; name: string; color?: string }
    >();

    for (const file of files) {
      for (const label of file.labels ?? []) {
        if (!categoriesMap.has(label.labelId)) {
          const entry: { id: string; name: string; color?: string } = {
            id: label.labelId,
            name: label.labelName,
          };
          if (config.includeLabelColor !== false) {
            entry.color = label.labelColor;
          }
          categoriesMap.set(label.labelId, entry);
        }
      }
    }

    const categories = Array.from(categoriesMap.values());

    let totalAnnotations = 0;
    const samples = files
      .filter((file) => (file.labels ?? []).length > 0)
      .map((file) => {
      const annotations = (file.labels ?? []).map((label: any) => {
        totalAnnotations++;
        const annotation: Record<string, any> = {
          labelId: label.labelId,
          labelName: label.labelName,
        };
        if (config.includeAnnotatorInfo) {
          annotation.annotatorId = label.annotatorId;
          annotation.annotatorEmail = label.annotatorEmail;
        }
        if (config.includeReviewerInfo) {
          annotation.reviewerId = label.reviewerId ?? null;
          annotation.reviewerEmail = label.reviewerEmail ?? null;
        }
        return annotation;
      });

      const sample: Record<string, any> = {
        fileId: file.id,
        fileName: file.name,
        contentType: file.contentType ?? null,
        annotations,
      };

      if (config.includeFileUrl !== false) {
        sample.fileUrl = file.url;
      }

      return sample;
    });

    const output = {
      meta: {
        exportedAt: new Date().toISOString(),
        snapshotId: snapshot.id,
        snapshotVersion: snapshot.version,
        snapshotName: snapshot.name,
        exportFormat: 'JSON',
        totalSamples: samples.length,
        totalAnnotations,
      },
      categories,
      samples,
    };

    return JSON.stringify(output, null, 2);
  }
}

