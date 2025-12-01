import Groq from 'groq-sdk';
import type {
  ReadingLevel,
  GeneratedStory,
  GeneratedQuestion,
  QuestionType,
} from '@/types';
import { READING_LEVEL_INFO } from '@/lib/constants';

// Initialize Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Model to use for generation
const MODEL = 'llama-3.3-70b-versatile';

/**
 * Generate a story tailored to the user's reading level and interests
 */
export async function generateStory(params: {
  readingLevel: ReadingLevel;
  themes?: string[];
  interests?: string[];
  difficultyMultiplier?: number;
  language?: string;
}): Promise<GeneratedStory> {
  const { 
    readingLevel, 
    themes = ['adventure'], 
    interests = [], 
    difficultyMultiplier = 1.0,
    language = 'fr'
  } = params;
  
  const levelInfo = READING_LEVEL_INFO[readingLevel];
  const [minWords, maxWords] = levelInfo.wordCountRange;
  
  // Adjust word count based on difficulty
  const targetWords = Math.round(
    (minWords + maxWords) / 2 * difficultyMultiplier
  );

  const interestsContext = interests.length > 0
    ? `The child is interested in: ${interests.join(', ')}.`
    : '';

  // Combiner tous les thèmes en une instruction claire
  const themesDescription = themes.length > 1
    ? `Combine these themes creatively: ${themes.join(', ')}. The story should blend elements from ALL these themes together.`
    : `Theme: ${themes[0]}`;

  const isFrench = language === 'fr';
  const languageInstruction = isFrench 
    ? 'Write the story in FRENCH (français). Use simple, clear French appropriate for children learning to read.'
    : 'Write the story in ENGLISH. Use simple, clear English appropriate for children learning to read.';

  const prompt = `You are a children's story writer creating an engaging, age-appropriate story.

Target Audience: ${levelInfo.description} (ages ${levelInfo.ageRange})
Reading Level: ${readingLevel}
${themesDescription}
${interestsContext}

IMPORTANT: ${languageInstruction}

Requirements:
- Write exactly ${targetWords} words (between ${minWords}-${maxWords})
- Use vocabulary appropriate for ${levelInfo.description}
- Keep sentences short and clear
- Include 3-5 vocabulary words that might be new but learnable
- Make the story engaging with a clear beginning, middle, and end
- The story should be positive and encouraging

Respond with ONLY valid JSON in this exact format (no markdown, no code blocks):
{
  "title": "${isFrench ? 'Titre de l\'histoire ici' : 'Story Title Here'}",
  "paragraphs": [
    "${isFrench ? 'Premier paragraphe de l\'histoire.' : 'First paragraph of the story.'}",
    "${isFrench ? 'Deuxième paragraphe...' : 'Second paragraph of the story.'}",
    "${isFrench ? 'Suite de l\'histoire...' : 'Third paragraph continues...'}",
    "${isFrench ? 'Quatrième paragraphe...' : 'Fourth paragraph...'}",
    "${isFrench ? 'Paragraphe final avec conclusion.' : 'Final paragraph with conclusion.'}"
  ],
  "vocabulary": [
    {
      "word": "${isFrench ? 'curieux' : 'curious'}",
      "definition": "${isFrench ? 'Qui veut apprendre ou découvrir de nouvelles choses' : 'Wanting to learn or know more about something'}",
      "example": "${isFrench ? 'Le chat curieux explorait chaque coin.' : 'The curious cat explored every corner.'}"
    }
  ],
  "theme": "${themes.join(', ')}"
}`;

  try {
    const completion = await groq.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: 'system',
          content: `You are a creative children's story writer. Always respond with valid JSON only, no markdown formatting or code blocks. Write all story content in ${isFrench ? 'French' : 'English'}.`,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.8,
      max_tokens: 2000,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No content in Groq response');
    }

    // Parse JSON response (handle potential markdown wrapping)
    let jsonContent = content.trim();
    if (jsonContent.startsWith('```')) {
      jsonContent = jsonContent.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
    }

    const story: GeneratedStory = JSON.parse(jsonContent);
    
    // Validate the response structure
    if (!story.title || !Array.isArray(story.paragraphs) || story.paragraphs.length === 0) {
      throw new Error('Invalid story structure from Groq');
    }

    return story;
  } catch (error) {
    console.error('Error generating story with Groq:', error);
    throw new Error('Failed to generate story. Please try again.');
  }
}

/**
 * Generate comprehension questions for a story
 */
export async function generateQuestions(params: {
  story: GeneratedStory;
  readingLevel: ReadingLevel;
  numQuestions?: number;
  difficultyMultiplier?: number;
  language?: string;
}): Promise<GeneratedQuestion[]> {
  const { 
    story, 
    readingLevel, 
    numQuestions = 5, 
    difficultyMultiplier = 1.0,
    language = 'fr'
  } = params;
  
  const levelInfo = READING_LEVEL_INFO[readingLevel];
  const isFrench = language === 'fr';
  
  // Determine question type distribution based on reading level
  const questionTypes = getQuestionTypesForLevel(readingLevel);

  const languageInstruction = isFrench
    ? 'Write all questions, options, and explanations in FRENCH (français).'
    : 'Write all questions, options, and explanations in ENGLISH.';

  const prompt = `You are an educational content creator making reading comprehension questions.

Story Title: "${story.title}"
Story Content:
${story.paragraphs.map((p, i) => `[Paragraph ${i + 1}]: ${p}`).join('\n')}

Target Audience: ${levelInfo.description} (ages ${levelInfo.ageRange})
Difficulty Multiplier: ${difficultyMultiplier}x (1.0 is normal, higher is harder)

IMPORTANT: ${languageInstruction}

Create ${numQuestions} questions testing these skills: ${questionTypes.join(', ')}

Requirements:
- Questions should be age-appropriate and encouraging
- Include a mix of easy and slightly challenging questions
- Each question should have 4 options for multiple choice
- Provide clear, encouraging explanations
- Indicate which paragraph the question relates to

Respond with ONLY valid JSON in this exact format (no markdown, no code blocks):
{
  "questions": [
    {
      "questionText": "${isFrench ? 'Qu\'est-ce que le personnage principal a découvert?' : 'What did the main character discover?'}",
      "type": "MULTIPLE_CHOICE",
      "options": ["${isFrench ? 'Un papillon' : 'A butterfly'}", "${isFrench ? 'Un oiseau' : 'A bird'}", "${isFrench ? 'Une fleur' : 'A flower'}", "${isFrench ? 'Un lapin' : 'A rabbit'}"],
      "correctAnswer": "${isFrench ? 'Un papillon' : 'A butterfly'}",
      "correctIndex": 0,
      "explanation": "${isFrench ? 'Bravo! L\'histoire nous dit que le personnage a trouvé un beau papillon.' : 'Great job! The story tells us the character found a beautiful butterfly.'}",
      "difficulty": 1,
      "afterParagraph": 2
    }
  ]
}

Question types to use: MULTIPLE_CHOICE, TRUE_FALSE, VOCABULARY, INFERENCE, COMPREHENSION
Difficulty scale: 1 (easy) to 5 (expert)`;

  try {
    const completion = await groq.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: 'system',
          content: `You are an educational content creator. Always respond with valid JSON only, no markdown formatting or code blocks. Write all content in ${isFrench ? 'French' : 'English'}.`,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No content in Groq response');
    }

    // Parse JSON response
    let jsonContent = content.trim();
    if (jsonContent.startsWith('```')) {
      jsonContent = jsonContent.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
    }

    const result = JSON.parse(jsonContent);
    
    if (!result.questions || !Array.isArray(result.questions)) {
      throw new Error('Invalid questions structure from Groq');
    }

    // Validate and sanitize questions
    return result.questions.map((q: GeneratedQuestion, index: number) => ({
      questionText: q.questionText || `Question ${index + 1}`,
      type: validateQuestionType(q.type),
      options: Array.isArray(q.options) ? q.options.slice(0, 4) : ['Option A', 'Option B', 'Option C', 'Option D'],
      correctAnswer: q.correctAnswer || q.options?.[0] || 'Answer',
      correctIndex: typeof q.correctIndex === 'number' ? q.correctIndex : 0,
      explanation: q.explanation || (isFrench ? 'Bon essai!' : 'Good try!'),
      difficulty: Math.min(5, Math.max(1, q.difficulty || 1)),
      afterParagraph: Math.min(story.paragraphs.length - 1, Math.max(0, q.afterParagraph || index)),
    }));
  } catch (error) {
    console.error('Error generating questions with Groq:', error);
    throw new Error('Failed to generate questions. Please try again.');
  }
}

/**
 * Get appropriate question types based on reading level
 */
function getQuestionTypesForLevel(level: ReadingLevel): QuestionType[] {
  const baseTypes: QuestionType[] = ['MULTIPLE_CHOICE', 'VOCABULARY'];
  
  switch (level) {
    case 'BEGINNER':
    case 'EARLY':
      return baseTypes;
    case 'DEVELOPING':
      return [...baseTypes, 'TRUE_FALSE'];
    case 'INTERMEDIATE':
      return [...baseTypes, 'TRUE_FALSE', 'INFERENCE'];
    case 'ADVANCED':
    case 'PROFICIENT':
      return [...baseTypes, 'TRUE_FALSE', 'INFERENCE', 'SUMMARIZATION'];
    default:
      return baseTypes;
  }
}

/**
 * Validate and normalize question type
 */
function validateQuestionType(type: string): QuestionType {
  const validTypes: QuestionType[] = [
    'MULTIPLE_CHOICE',
    'TRUE_FALSE',
    'SHORT_ANSWER',
    'VOCABULARY',
    'INFERENCE',
    'SUMMARIZATION',
  ];
  
  const normalizedType = type?.toUpperCase().replace(/ /g, '_') as QuestionType;
  return validTypes.includes(normalizedType) ? normalizedType : 'MULTIPLE_CHOICE';
}

/**
 * Generate a word definition for vocabulary hints
 */
export async function generateWordDefinition(params: {
  word: string;
  context: string;
  readingLevel: ReadingLevel;
}): Promise<{ definition: string; example: string }> {
  const { word, context, readingLevel } = params;
  const levelInfo = READING_LEVEL_INFO[readingLevel];

  const prompt = `Define the word "${word}" for a child (${levelInfo.description}).

Context where the word appears: "${context}"

Provide:
1. A simple, child-friendly definition
2. A short example sentence

Respond with ONLY valid JSON:
{
  "definition": "Simple definition here",
  "example": "Example sentence using the word."
}`;

  try {
    const completion = await groq.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.5,
      max_tokens: 200,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No content in Groq response');
    }

    let jsonContent = content.trim();
    if (jsonContent.startsWith('```')) {
      jsonContent = jsonContent.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
    }

    return JSON.parse(jsonContent);
  } catch (error) {
    console.error('Error generating word definition:', error);
    return {
      definition: `A word related to ${context.slice(0, 30)}...`,
      example: `The word "${word}" is interesting!`,
    };
  }
}
