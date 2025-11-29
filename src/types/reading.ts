export interface StoryCard {
  id: string;
  content: string; // 2-3 sentences
  vocabularyWords?: VocabularyWord[];
  imageUrl?: string;
}

export interface VocabularyWord {
  word: string;
  definition: string;
  emoji?: string;
  position: { start: number; end: number };
}

export interface ReadingSettings {
  fontSize: 'small' | 'medium' | 'large' | 'xl';
  fontFamily: 'default' | 'dyslexic' | 'serif';
  theme: 'light' | 'dark' | 'sepia';
  lineSpacing: 'normal' | 'relaxed' | 'loose';
  showRuler: boolean;
  highlightCurrentLine: boolean;
}

export type QuestionType = 
  | 'multiple-choice'
  | 'true-false'
  | 'fill-in-blank'
  | 'sequencing'
  | 'short-answer'
  | 'vocabulary-match'
  | 'prediction';

export interface Question {
  id: string;
  type: QuestionType;
  question: string;
  options?: string[];
  correctAnswer: string | string[];
  hint?: string;
  explanation?: string;
}
