export interface SingleAnswerData {
  questionId: string;
  answer: boolean;

  //store snapshot
  questionName?: string;
  questionDescription?: string;

  //extra notes
  notes?: string;
}
export interface AnswerData {
  answers: SingleAnswerData[];
}
