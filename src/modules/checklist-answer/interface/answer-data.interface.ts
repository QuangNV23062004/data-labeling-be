export interface SingleAnswerData {
  questionId: string;
  answer: boolean;

  // Store snapshot of question state at time of answering
  questionName?: string;
  questionDescription?: string;
  questionIsRequired?: boolean;
  questionUpdatedAt?: Date; // Track question version/modification time

  // Extra notes
  notes?: string;
}
export interface AnswerData {
  answers: SingleAnswerData[] | [];
  notes?: string;
}
