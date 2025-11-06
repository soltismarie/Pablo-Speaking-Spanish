
export enum Role {
  USER = 'user',
  MODEL = 'model',
}

export interface Message {
  role: Role;
  content: string;
}

export interface Exercise {
  question: string;
  answer: string;
  type: string;
}

export type ProficiencyLevel = 'B1' | 'B2' | 'C1' | 'C2';

export type TutorExpression = 'idle' | 'talking' | 'happy' | 'thinking';
