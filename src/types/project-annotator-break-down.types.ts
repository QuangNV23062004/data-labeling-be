export type ProjectAnnotatorErrorBreakdownRow = {
  annotatorId: string;
  errorTypeId: string;
  name: string;
  description: string | null;
  severity: string;
  scoreImpact: string;
  count: string;
  totalImpact: string;
};
