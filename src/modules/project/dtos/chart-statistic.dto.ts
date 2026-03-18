import { ProjectStatus } from '../enums/project-status.enums';

export class SingleChartStatisticDto {
  date: string; // e.g., '2024-01-01' for day mode, '2024-W01' for week mode, '2024-01' for month mode, '2024' for year mode
  projects: number;
  details: {
    [key in ProjectStatus]: number;
  };
}
