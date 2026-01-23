import { Injectable, Res } from '@nestjs/common';
import { TypedConfigService } from '../typed-config/typed-config.service';
import { BlobServiceClient } from '@azure/storage-blob';
import * as archiver from 'archiver';
import { Response } from 'express';
import { PassThrough } from 'stream';

@Injectable()
export class StorageService {
  constructor(private typedConfigService: TypedConfigService) {}

  private async createZip(
    files: { name: string; buffer: Buffer }[],
  ): Promise<Buffer> {
    return new Promise<Buffer>((resolve, reject) => {
      const archive = archiver('zip', { zlib: { level: 9 } });
      const passThrough = new PassThrough();
      const chunks: Buffer[] = [];

      passThrough.on('data', (chunk) => chunks.push(chunk));
      passThrough.on('end', () => resolve(Buffer.concat(chunks)));
      passThrough.on('error', reject);
      archive.on('error', reject);

      archive.pipe(passThrough);

      try {
        for (const file of files) {
          archive.append(file.buffer, { name: file.name });
        }
        archive.finalize();
      } catch (err) {
        archive.abort();
        reject(err);
      }
    });
  }

  getBlobSasToken(): string {
    console.log(this.typedConfigService.storage);
    return this.typedConfigService.storage?.blobSasToken;
  }

  getBlobSasUrl(): string {
    return this.typedConfigService.storage?.blobSasUrl;
  }

  getBlobContainerName(): string {
    return this.typedConfigService.storage?.blobContainerName || 'data';
  }

  async uploadFilePath(
    folder: string,
    file: Buffer,
    filename: string,
    extension: string = 'png',
  ): Promise<string> {
    const blobSasUrl = this.getBlobSasUrl();
    const blobSasToken = this.getBlobSasToken();
    const containerName = this.getBlobContainerName();
    console.log(blobSasToken, blobSasUrl, containerName);
    const url = `${blobSasUrl}?${blobSasToken}`;
    const blobServiceClient = new BlobServiceClient(url);
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(
      `${folder}/${filename}.${extension}`,
    );

    const result = await blockBlobClient.uploadData(file, {
      blobHTTPHeaders: {
        blobContentType: `image/${extension}`,
      },
    });

    return result._response.request.url.split('?')[0];
  }

  async downloadBlobFolder(folder: string): Promise<Buffer> {
    const blobSasUrl = this.getBlobSasUrl();
    const blobSasToken = this.getBlobSasToken();
    const containerName = this.getBlobContainerName();
    const url = `${blobSasUrl}?${blobSasToken}`;
    const blobServiceClient = new BlobServiceClient(url);
    const containerClient = blobServiceClient.getContainerClient(containerName);

    const files: { name: string; buffer: Buffer }[] = [];
    const prefix = `${folder}/`;

    // console.log(' Downloading folder:', { folder, containerName, prefix });

    for await (const blob of containerClient.listBlobsFlat({
      prefix: `data/${prefix}`,
    })) {
      // console.log(' Found blob:', blob.name);
      const blobClient = containerClient.getBlobClient(blob.name);
      const download = await blobClient.download();

      // Remove folder prefix inside zip
      const zipPath = blob.name.replace(prefix, '');

      // Download the blob data as a buffer
      let buffer = Buffer.alloc(0);
      for await (const chunk of download.readableStreamBody!) {
        buffer = Buffer.concat([buffer, Buffer.from(chunk)]);
      }

      // console.log(`Added to zip: ${zipPath} (${buffer.length} bytes)`);
      files.push({ name: zipPath, buffer });
    }

    // console.log(`Creating zip with ${files.length} files`);
    return this.createZip(files);
  }
}
