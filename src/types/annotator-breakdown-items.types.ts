export type AnnotatorBreakdownItem = {
  errorTypeId: string;
  name: string;
  description: string | null;
  severity: string;
  scoreImpact: number;
  count: number;
  totalImpact: number;
};
