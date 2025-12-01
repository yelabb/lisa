import Groq from 'groq-sdk';
import type {
  ReadingLevel,
  GeneratedStory,
  GeneratedQuestion,
  QuestionType,
} from '@/types';
import { difficultyToReadingLevel } from '@/types';
import { READING_LEVEL_INFO } from '@/lib/constants';

// Import messages directly for server-side use
import frMessages from '../../../messages/fr.json';
import enMessages from '../../../messages/en.json';

// Initialize Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Model to use for generation
const MODEL = 'meta-llama/llama-4-scout-17b-16e-instruct';

// Messages by locale
const messages: Record<string, typeof frMessages> = {
  fr: frMessages,
  en: enMessages,
};

/**
 * Get messages for a specific locale
 */
function getMessages(language: string) {
  return messages[language] || messages.fr;
}

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
 * Get style requirements based on reading level
 */
function getStyleRequirements(readingLevel: ReadingLevel, t: typeof frMessages.prompts): string {
  switch (readingLevel) {
    case 'BEGINNER':
    case 'EARLY':
      return t.styleBeginnerEarly;
    case 'DEVELOPING':
    case 'INTERMEDIATE':
      return t.styleDevelopingIntermediate;
    case 'ADVANCED':
    case 'PROFICIENT':
      return t.styleAdvanced;
    default:
      return t.styleDevelopingIntermediate;
  }
}

/**
 * Generate a story tailored to the user's reading level and interests
 */
export async function generateStory(params: {
  difficultyMultiplier: number;
  themes?: string[];
  interests?: string[];
  language?: string;
}): Promise<GeneratedStory> {
  const { 
    difficultyMultiplier = 1.0,
    themes = ['adventure'], 
    interests = [], 
    language = 'fr'
  } = params;
  
  // Derive reading level from difficulty multiplier
  const readingLevel = difficultyToReadingLevel(difficultyMultiplier);
  
  // Get localized messages
  const t = getMessages(language).prompts;
  
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

  // Contexte des intérêts (un seul au hasard si plusieurs)
  const randomInterest = interests.length > 0 
    ? interests[Math.floor(Math.random() * interests.length)]
    : null;

  // Get style requirements for level
  const styleRequirements = getStyleRequirements(readingLevel, t);

  // Build the prompt using localized messages
  const prompt = `${t.intro}

STORY SEED: ${storySeed} (use this to ensure uniqueness)

YOUR MISSION: ${t.mission}

${t.step1Title}
${t.step1Instructions}

${t.step2Title}
${t.themeLabel} ${chosenTheme}
${randomInterest ? `${t.interestLabel} ${randomInterest}` : ''}
${t.levelLabel} ${readingLevel} (${levelInfo.description}, ages ${levelInfo.ageRange})
${t.lengthLabel} ${targetWords} ${t.wordsRange.replace('{min}', String(minWords)).replace('{max}', String(maxWords))}
${t.language}

${t.styleTitle.replace('{age}', levelInfo.ageRange)}
${styleRequirements}

${t.creativeMandatesTitle}
1. ${t.creativeMandate1}
2. ${t.creativeMandate2}
3. ${t.creativeMandate3}
4. ${t.creativeMandate4}
5. ${t.creativeMandate5}
6. ${t.creativeMandate6}

${t.jsonFormat}
{
  "title": "${t.jsonTitleHint}",
  "paragraphs": [
    "${t.jsonParagraphHints[0]}",
    "${t.jsonParagraphHints[1]}",
    "${t.jsonParagraphHints[2]}",
    "${t.jsonParagraphHints[3]}",
    "${t.jsonParagraphHints[4]}"
  ],
  "vocabulary": [
    {
      "word": "${t.jsonWordHint}",
      "definition": "${t.jsonDefinitionHint}",
      "example": "${t.jsonExampleHint}"
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
          content: t.systemRole,
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

    console.log(`[STORY] Generated: "${story.title}" (theme: ${chosenTheme}, seed: ${storySeed}, lang: ${language})`);

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
  difficultyMultiplier: number;
  numQuestions?: number;
  language?: string;
}): Promise<GeneratedQuestion[]> {
  const { 
    story, 
    difficultyMultiplier = 1.0,
    numQuestions = 5, 
    language = 'fr'
  } = params;
  
  // Derive reading level from difficulty
  const readingLevel = difficultyToReadingLevel(difficultyMultiplier);
  
  // Get localized messages
  const t = getMessages(language).questions;
  
  const levelInfo = READING_LEVEL_INFO[readingLevel];
  
  // Determine question type distribution based on reading level
  const questionTypes = getQuestionTypesForLevel(readingLevel);

  const prompt = `You are an educational content creator making reading comprehension questions.

Story Title: "${story.title}"
Story Content:
${story.paragraphs.map((p, i) => `[Paragraph ${i + 1}]: ${p}`).join('\n')}

Target Audience: ${levelInfo.description} (ages ${levelInfo.ageRange})
Difficulty Multiplier: ${difficultyMultiplier}x (1.0 is normal, higher is harder)

IMPORTANT: ${t.languageInstruction}

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
      "questionText": "${t.exampleText}",
      "type": "MULTIPLE_CHOICE",
      "options": ${JSON.stringify(t.exampleOptions)},
      "correctAnswer": "${t.exampleAnswer}",
      "correctIndex": 0,
      "explanation": "${t.exampleExplanation}",
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
          content: t.systemRole,
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
      explanation: q.explanation || t.defaultExplanation,
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

/**
 * Generate a fun, humorous explanation for any word
 * Designed to make kids laugh while learning
 */
export async function generateFunWordExplanation(params: {
  word: string;
  context: string;
  language?: string;
}): Promise<{ word: string; definition: string; funFact: string; emoji: string }> {
  const { word, context, language = 'fr' } = params;

  const prompts = {
    fr: `Tu es un professeur super drôle qui explique les mots aux enfants de manière hilarante et mémorable.

Mot à expliquer: "${word}"
${context ? `Contexte dans l'histoire: "${context}"` : ''}

Ton travail: Crée une explication DRÔLE et MÉMORABLE qui fera rire un enfant tout en lui apprenant quelque chose.

RÈGLES IMPORTANTES:
1. La définition doit être simple mais avec une touche d'humour
2. Le funFact doit être soit une vraie info surprenante, soit une comparaison drôle, soit une blague
3. Choisis un emoji qui correspond parfaitement au mot ou à ton explication drôle
4. Garde tout court et percutant (2-3 phrases max par champ)
5. Utilise des comparaisons que les enfants comprennent (jeux vidéo, bonbons, animaux, super-héros)

Exemples de style:
- Pour "courage": "C'est quand tu manges les brocolis même si tu préférerais des bonbons. Ou quand tu dis bonjour à quelqu'un de nouveau!"
- Pour "délicieux": "Tellement bon que tes papilles font la danse de la victoire! 🕺"
- Pour "rapide": "Comme Flash, mais en moins rouge et avec plus de devoirs à faire."

Réponds UNIQUEMENT avec ce JSON (pas de markdown):
{
  "word": "${word}",
  "definition": "explication simple avec touche d'humour",
  "funFact": "fait rigolo ou comparaison drôle",
  "emoji": "🎯"
}`,
    en: `You are a super funny teacher who explains words to kids in hilarious and memorable ways.

Word to explain: "${word}"
${context ? `Context in the story: "${context}"` : ''}

Your job: Create a FUNNY and MEMORABLE explanation that will make a child laugh while teaching them something.

IMPORTANT RULES:
1. The definition should be simple but with a touch of humor
2. The funFact should be either a real surprising fact, a funny comparison, or a joke
3. Choose an emoji that perfectly matches the word or your funny explanation
4. Keep everything short and punchy (2-3 sentences max per field)
5. Use comparisons kids understand (video games, candy, animals, superheroes)

Style examples:
- For "courage": "It's when you eat broccoli even though you'd rather have candy. Or when you say hello to someone new!"
- For "delicious": "So good that your taste buds do the victory dance! 🕺"
- For "fast": "Like Flash, but less red and with more homework to do."

Respond ONLY with this JSON (no markdown):
{
  "word": "${word}",
  "definition": "simple explanation with humor touch",
  "funFact": "funny fact or silly comparison",
  "emoji": "🎯"
}`
  };

  const prompt = prompts[language as keyof typeof prompts] || prompts.fr;

  try {
    const completion = await groq.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: 'system',
          content: language === 'fr' 
            ? 'Tu es un professeur super drôle qui adore faire rire les enfants. Réponds toujours en JSON valide sans formatage markdown.'
            : 'You are a super funny teacher who loves making kids laugh. Always respond with valid JSON without markdown formatting.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.9, // High creativity for humor
      max_tokens: 300,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No content in Groq response');
    }

    let jsonContent = content.trim();
    if (jsonContent.startsWith('```')) {
      jsonContent = jsonContent.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
    }

    const result = JSON.parse(jsonContent);
    
    return {
      word: result.word || word,
      definition: result.definition || (language === 'fr' ? `Un mot super intéressant!` : `A super interesting word!`),
      funFact: result.funFact || (language === 'fr' ? `C'est un mot qu'on utilise souvent!` : `It's a word we use often!`),
      emoji: result.emoji || '✨',
    };
  } catch (error) {
    console.error('Error generating fun word explanation:', error);
    // Fallback with pre-made fun responses
    const fallbacks = {
      fr: {
        word,
        definition: `C'est un mot que même les adultes trouvent parfois compliqué! 🤓`,
        funFact: `Fun fact: tu viens de cliquer dessus, donc tu es curieux. C'est super! 🌟`,
        emoji: '📚',
      },
      en: {
        word,
        definition: `It's a word that even adults sometimes find tricky! 🤓`,
        funFact: `Fun fact: you just clicked on it, so you're curious. That's awesome! 🌟`,
        emoji: '📚',
      },
    };
    return fallbacks[language as keyof typeof fallbacks] || fallbacks.fr;
  }
}
