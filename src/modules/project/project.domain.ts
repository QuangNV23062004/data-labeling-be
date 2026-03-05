import { Injectable } from '@nestjs/common';
import { ProjectEntity } from './project.entity';
import {
  ProjectCannotCompleteException,
  ProjectNotFoundException,
} from './exceptions/project-exceptions.exception';
import { ProjectStatus } from './enums/project-status.enums';
import { FileLabelEntity } from '../file-label/file-label.entity';
import { FileLabelStatusEnums } from '../file-label/enums/file-label.enums';
import { AnnotatorBreakdownItem } from 'src/types/annotator-breakdown-items.types';
import { ProjectAnnotatorErrorBreakdownRow } from 'src/types/project-annotator-break-down.types';
import { ProjectAnnotatorMetricsRow } from 'src/types/project-annotator-metric.types';
import { AccountRatingEntity } from '../account-rating/account-rating.entity';
import { AccountRatingHistoryEntity } from '../account-rating-history/account-rating-history.entity';

@Injectable()
export class ProjectDomain {
  validateProjectExists(project: ProjectEntity | null, id: string): void {
    if (!project) throw new ProjectNotFoundException(id);

    if (project.projectStatus === ProjectStatus.COMPLETED) {
      throw new ProjectCannotCompleteException(
        id,
        'Project is already completed',
      );
    }
  }

  validateProjectFileLabelsCanBeCompleted(
    fileLabels: FileLabelEntity[],
    id: string,
  ) {
    const hasOtherStatus = fileLabels.some(
      (label) =>
        label.status !== FileLabelStatusEnums.APPROVED &&
        label.status !== FileLabelStatusEnums.REASSIGNED,
    );
    if (hasOtherStatus) {
      //   console.log('Other file label');
      throw new ProjectCannotCompleteException(
        id,
        'only approved and reassigned file labels are allowed',
      );
    }
  }

  breakdownByAnnotator(
    breakdownRows: ProjectAnnotatorErrorBreakdownRow[],
  ): Map<string, AnnotatorBreakdownItem[]> {
    const breakdownByAnnotator = new Map<string, AnnotatorBreakdownItem[]>();
    for (const row of breakdownRows) {
      const arr = breakdownByAnnotator.get(row.annotatorId) ?? [];
      arr.push({
        errorTypeId: row.errorTypeId,
        name: row.name,
        description: row.description,
        severity: row.severity,
        scoreImpact: Number(row.scoreImpact ?? 0),
        count: Number(row.count ?? 0),
        totalImpact: Number(row.totalImpact ?? 0),
      });
      breakdownByAnnotator.set(row.annotatorId, arr);
    }
    return breakdownByAnnotator;
  }

  MapRatingEntitiesFromMetrics(
    metrics: ProjectAnnotatorMetricsRow[],
    existingByAccount: Map<string, AccountRatingEntity>,
    id: string,
  ): AccountRatingEntity[] {
    return metrics.map((m) => {
      const totalFileLabeled = Number(m.totalFileLabeled ?? 0);
      const totalPenalty = Number(m.totalPenalty ?? 0);
      const errorCount = Number(m.errorCount ?? 0);
      const score =
        totalFileLabeled > 0
          ? Math.max(0, Math.round(100 - totalPenalty / totalFileLabeled))
          : 0;

      const e =
        existingByAccount.get(m.annotatorId) ?? new AccountRatingEntity();
      e.accountId = m.annotatorId;
      e.projectId = id;
      e.ratingScore = score;
      e.errorCount = errorCount;
      e.totalFileLabeled = totalFileLabeled;
      e.feedbacks = e.feedbacks ?? '';
      return e;
    });
  }

  MapRatingHistoryEntitiesFromMetrics(
    metrics: ProjectAnnotatorMetricsRow[],
    savedByAccount: Map<string, AccountRatingEntity>,
    existingByAccount: Map<string, AccountRatingEntity>,
    id: string,
    breakdownByAnnotator: Map<string, AnnotatorBreakdownItem[]>,
  ): AccountRatingHistoryEntity[] {
    return metrics.map((m) => {
      const totalFileLabeled = Number(m.totalFileLabeled ?? 0);
      const totalPenalty = Number(m.totalPenalty ?? 0);
      const errorCount = Number(m.errorCount ?? 0);

      const saved = savedByAccount.get(m.annotatorId)!;
      const prev = existingByAccount.get(m.annotatorId)?.ratingScore ?? 0;

      const h = new AccountRatingHistoryEntity();
      h.accountRatingId = saved.id;
      h.previousRatingScore = prev;
      h.newRatingScore = saved.ratingScore;
      h.changeReason = `Project ${id} completed`;
      h.changedAt = new Date();
      h.reviewError = {
        totalFileLabeled,
        errorCount,
        totalPenalty,
        breakdown: breakdownByAnnotator.get(m.annotatorId) ?? [],
      };
      return h;
    });
  }
}
