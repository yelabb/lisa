import { groq } from '@/lib/groq';
import { retryWithBackoff, AIGenerationError } from '@/lib/utils/error-handling';

export type QuestionType = 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'FILL_IN_BLANK' | 'SEQUENCING';

export interface QuestionOption {
  text: string;
  isCorrect: boolean;
}

export interface GeneratedQuestion {
  type: QuestionType;
  question: string;
  options?: QuestionOption[]; // For multiple choice
  correctAnswer?: string; // For fill-in-blank
  sequence?: string[]; // For sequencing
  explanation?: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  skillFocus: 'COMPREHENSION' | 'VOCABULARY' | 'INFERENCE' | 'SUMMARIZATION';
}

export interface GenerateQuestionsParams {
  storyTitle: string;
  storyContent: string;
  readingLevel: string;
  age: number;
  questionCount?: number;
}

/**
 * Generate comprehension questions for a story
 */
export async function generateQuestions(
  params: GenerateQuestionsParams
): Promise<GeneratedQuestion[]> {
  const {
    storyTitle,
    storyContent,
    readingLevel,
    age,
    questionCount = 4,
  } = params;

  const prompt = `You are an educational assessment expert creating comprehension questions for a ${age}-year-old child at ${readingLevel} reading level.

STORY TITLE: ${storyTitle}

STORY CONTENT:
${storyContent}

REQUIREMENTS:
- Generate ${questionCount} diverse questions that test different skills
- Include a mix of question types: multiple choice, true/false, and inference
- Questions should be age-appropriate and aligned with the reading level
- Focus on: comprehension, vocabulary, inference, and summarization
- Ensure correct answers are clearly the best choice
- Add distractors that are plausible but incorrect

SKILL DISTRIBUTION:
- ${Math.floor(questionCount / 2)} questions on COMPREHENSION (literal understanding)
- ${Math.floor(questionCount / 4)} questions on VOCABULARY (word meanings in context)
- ${Math.ceil(questionCount / 4)} questions on INFERENCE (reading between the lines)

FORMAT YOUR RESPONSE AS JSON ARRAY:
[
  {
    "type": "MULTIPLE_CHOICE",
    "question": "What did the main character do first?",
    "options": [
      { "text": "Option 1", "isCorrect": false },
      { "text": "Option 2", "isCorrect": true },
      { "text": "Option 3", "isCorrect": false },
      { "text": "Option 4", "isCorrect": false }
    ],
    "explanation": "Brief explanation of the answer",
    "difficulty": "EASY",
    "skillFocus": "COMPREHENSION"
  },
  {
    "type": "TRUE_FALSE",
    "question": "The story takes place at night.",
    "options": [
      { "text": "True", "isCorrect": false },
      { "text": "False", "isCorrect": true }
    ],
    "explanation": "Brief explanation",
    "difficulty": "EASY",
    "skillFocus": "COMPREHENSION"
  }
]

Generate ${questionCount} questions now:`;

  try {
    const result = await retryWithBackoff(async () => {
      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are an expert in educational assessment and reading comprehension for children. You create engaging, age-appropriate questions that help measure and improve reading skills. Always respond with valid JSON only.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.7,
        max_tokens: 2048,
        response_format: { type: 'json_object' },
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new AIGenerationError('No response from AI', true);
      }

      return response;
    }, 3, 1000);

    const parsed = JSON.parse(result);
    
    // Handle both array and object with questions property
    const questions = Array.isArray(parsed) ? parsed : parsed.questions || [];
    
    // Validate questions
    if (!Array.isArray(questions) || questions.length === 0) {
      throw new AIGenerationError('Invalid questions format from AI', false);
    }

    // Ensure all questions have required fields
    const validatedQuestions = questions.map((q: any) => ({
      type: q.type || 'MULTIPLE_CHOICE',
      question: q.question,
      options: q.options || [],
      correctAnswer: q.correctAnswer,
      sequence: q.sequence,
      explanation: q.explanation || '',
      difficulty: q.difficulty || 'MEDIUM',
      skillFocus: q.skillFocus || 'COMPREHENSION',
    }));

    return validatedQuestions;
  } catch (error) {
    console.error('Question generation error:', error);
    
    if (error instanceof AIGenerationError) {
      throw error;
    }
    
    throw new AIGenerationError('Failed to generate questions. Please try again.', true);
  }
}

/**
 * Validate a user's answer to a question
 */
export function validateAnswer(
  question: GeneratedQuestion,
  userAnswer: string | number
): { isCorrect: boolean; explanation: string } {
  let isCorrect = false;

  switch (question.type) {
    case 'MULTIPLE_CHOICE':
    case 'TRUE_FALSE':
      if (question.options && typeof userAnswer === 'number') {
        isCorrect = question.options[userAnswer]?.isCorrect || false;
      }
      break;

    case 'FILL_IN_BLANK':
      if (question.correctAnswer && typeof userAnswer === 'string') {
        // Normalize and compare
        const normalized = userAnswer.trim().toLowerCase();
        const correct = question.correctAnswer.trim().toLowerCase();
        isCorrect = normalized === correct;
      }
      break;

    case 'SEQUENCING':
      if (question.sequence && typeof userAnswer === 'string') {
        // Compare sequence arrays
        try {
          const userSequence = JSON.parse(userAnswer);
          isCorrect = JSON.stringify(userSequence) === JSON.stringify(question.sequence);
        } catch {
          isCorrect = false;
        }
      }
      break;
  }

  return {
    isCorrect,
    explanation: question.explanation || (isCorrect ? 'Correct!' : 'Not quite right. Try again!'),
  };
}
