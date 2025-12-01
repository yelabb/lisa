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
 * Choisir un thème aléatoire parmi les préférences de l'utilisateur
 */
function pickRandomTheme(themes: string[]): string {
  if (themes.length === 0) return 'adventure';
  return themes[Math.floor(Math.random() * themes.length)];
}

/**
 * Générer un seed unique pour garantir des histoires différentes
 */
function generateStorySeed(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 10);
  return `${timestamp}-${random}`;
}

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

  // CHOISIR UN SEUL THÈME AU HASARD
  const chosenTheme = pickRandomTheme(themes);
  
  // Générer un seed unique pour cette histoire
  const storySeed = generateStorySeed();
  
  const isFrench = language === 'fr';

  // Contexte des intérêts (un seul au hasard si plusieurs)
  const randomInterest = interests.length > 0 
    ? interests[Math.floor(Math.random() * interests.length)]
    : null;

  // PROMPT EN DEUX PHASES: D'abord générer les éléments créatifs, puis l'histoire
  const prompt = `You are an award-winning children's book author known for creating unique, surprising, and delightful stories.

STORY SEED: ${storySeed} (use this to ensure uniqueness)

YOUR MISSION: Create a completely ORIGINAL and UNEXPECTED story that a 10-year-old will love.

STEP 1 - INVENT UNIQUE ELEMENTS (be wildly creative):
First, invent these elements - make them ORIGINAL, don't use common tropes:
- A unique main character (NOT a princess, knight, or typical hero - think outside the box!)
- An unusual setting (NOT a castle, forest, or school - surprise me!)
- A creative problem or quest (NOT finding treasure or saving someone - be inventive!)
- A surprising twist (something the reader won't expect)

STEP 2 - WRITE THE STORY:
Theme to incorporate: ${chosenTheme}
${randomInterest ? `Child's interest to weave in: ${randomInterest}` : ''}
Reading level: ${readingLevel} (${levelInfo.description}, ages ${levelInfo.ageRange})
Target length: ${targetWords} words (${minWords}-${maxWords} range)
Language: ${isFrench ? 'FRENCH (français)' : 'ENGLISH'}

STYLE REQUIREMENTS for a ${levelInfo.ageRange} year old:
${readingLevel === 'BEGINNER' || readingLevel === 'EARLY' ? 
  '- Very short sentences (5-8 words)\n- Simple vocabulary\n- Repetition for reinforcement\n- 2-3 new words maximum' :
  readingLevel === 'DEVELOPING' || readingLevel === 'INTERMEDIATE' ?
  '- Mix of short and medium sentences\n- Some descriptive language\n- 3-4 new vocabulary words\n- Simple dialogue' :
  '- Varied sentence structure\n- Rich descriptive language\n- 4-5 challenging vocabulary words\n- Complex dialogue and emotions'}

CREATIVE MANDATES:
1. START with action or dialogue - NO "Once upon a time" or "Il était une fois"
2. Include at least one FUNNY moment (kids love to laugh!)
3. Add sensory details - what does it smell/sound/feel like?
4. The hero must ACTIVELY solve the problem (not get rescued)
5. End with something MEMORABLE - a joke, a surprise, or a touching moment
6. Make it feel FRESH - avoid clichés!

Respond with ONLY this JSON (no markdown, no code blocks):
{
  "title": "${isFrench ? 'Titre accrocheur et original' : 'Catchy original title'}",
  "paragraphs": [
    "${isFrench ? 'Accroche immédiate - action ou dialogue!' : 'Immediate hook - action or dialogue!'}",
    "${isFrench ? 'Développement du personnage et du monde' : 'Character and world development'}",
    "${isFrench ? 'Le problème ou défi apparaît' : 'The problem or challenge appears'}",
    "${isFrench ? 'Action et tentative de résolution' : 'Action and attempt to resolve'}",
    "${isFrench ? 'Conclusion mémorable!' : 'Memorable conclusion!'}"
  ],
  "vocabulary": [
    {
      "word": "${isFrench ? 'mot nouveau' : 'new word'}",
      "definition": "${isFrench ? 'définition simple pour enfant' : 'simple child-friendly definition'}",
      "example": "${isFrench ? 'Phrase exemple' : 'Example sentence'}"
    }
  ],
  "theme": "${chosenTheme}"
}`;

  try {
    const completion = await groq.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: 'system',
          content: `You are a creative genius who writes children's stories. Every story you create is completely unique and different from anything you've written before. You NEVER repeat ideas, characters, or plots. You write in ${isFrench ? 'French' : 'English'}. Always respond with valid JSON only.`,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 1.0, // Maximum creativity
      max_tokens: 2500,
      top_p: 0.95,
      frequency_penalty: 0.8, // Strongly discourage repetition
      presence_penalty: 0.8,  // Encourage new topics
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

    console.log(`[STORY] Generated: "${story.title}" (theme: ${chosenTheme}, seed: ${storySeed})`);

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
