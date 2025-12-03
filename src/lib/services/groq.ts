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
import esMessages from '../../../messages/es.json';
import ptMessages from '../../../messages/pt.json';
import deMessages from '../../../messages/de.json';
import itMessages from '../../../messages/it.json';
import nlMessages from '../../../messages/nl.json';
import plMessages from '../../../messages/pl.json';
import trMessages from '../../../messages/tr.json';

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
  es: esMessages,
  pt: ptMessages,
  de: deMessages,
  it: itMessages,
  nl: nlMessages,
  pl: plMessages,
  tr: trMessages,
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
 * Clean and validate generated text to fix common issues
 */
function cleanGeneratedText(text: string): string {
  if (!text) return text;
  
  // Fix common issues with generated text
  const cleaned = text
    // Remove unwanted characters and fix spacing
    .replace(/\s+/g, ' ') // Multiple spaces to single space
    .replace(/\s([.,!?;:])/g, '$1') // Remove space before punctuation
    .replace(/([.,!?;:])\s*([a-zàâäéèêëïîôùûüÿœæçA-ZÀÂÄÉÈÊËÏÎÔÙÛÜŸŒÆÇ])/g, '$1 $2') // Add space after punctuation
    // Fix words with numbers/letters stuck together
    .replace(/([a-zàâäéèêëïîôùûüÿœæç])(\d)/gi, '$1 $2') // Letter followed by number
    .replace(/(\d)([a-zàâäéèêëïîôùûüÿœæç])/gi, '$1 $2') // Number followed by letter
    // Fix repeated punctuation
    .replace(/([.,!?;:])\1+/g, '$1')
    // Fix quotes and apostrophes - use escaped quotes
    .replace(/\s+'/g, "'") // Remove space before apostrophe
    .replace(/'\s+/g, "'") // Remove space after apostrophe
    .trim();
  
  return cleaned;
}

/**
 * Verify and correct spelling/grammar using AI
 */
async function verifyTextQuality(params: {
  text: string;
  language: string;
  context: 'story' | 'question' | 'word';
}): Promise<string> {
  const { text, language, context } = params;
  
  // Skip verification for very short text (likely already clean)
  if (text.length < 10) {
    return text;
  }
  
  // Get localized messages
  const t = getMessages(language).quality;
  
  // Get the appropriate prompt based on context
  const promptTemplates = {
    story: t.storyPrompt,
    question: t.questionPrompt,
    word: t.wordPrompt,
  };
  
  const prompt = promptTemplates[context].replace('{text}', text);

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
      temperature: 0.05, // Extremely low for minimal changes
      max_tokens: Math.ceil(text.length * 1.2), // Slight buffer for corrections
    });

    const correctedText = completion.choices[0]?.message?.content?.trim();
    if (!correctedText) {
      return text;
    }

    // More lenient similarity check - allow 20-200% size change
    const lengthRatio = correctedText.length / text.length;
    if (lengthRatio < 0.2 || lengthRatio > 2.5) {
      console.warn(`[QUALITY] Correction too different (${Math.round(lengthRatio * 100)}% size), keeping original`);
      return text;
    }

    // Calculate word-level similarity
    const originalWords = text.toLowerCase().split(/\s+/).length;
    const correctedWords = correctedText.toLowerCase().split(/\s+/).length;
    const wordRatio = correctedWords / originalWords;
    
    if (wordRatio < 0.5 || wordRatio > 1.8) {
      console.warn(`[QUALITY] Word count too different (${Math.round(wordRatio * 100)}%), keeping original`);
      return text;
    }

    // Log if correction was applied
    if (correctedText !== text) {
      console.log(`[QUALITY] ✓ Corrected: "${text.slice(0, 50)}..." → "${correctedText.slice(0, 50)}..."`);
    }

    return correctedText;
  } catch (error) {
    console.error('[QUALITY] Error during text verification:', error);
    return text; // Return original text if verification fails
  }
}

/**
 * Batch verify multiple texts at once to reduce API calls
 */
async function verifyTextsQuality(params: {
  texts: string[];
  language: string;
  context: 'story' | 'question' | 'word';
}): Promise<string[]> {
  const { texts, language, context } = params;
  
  // Filter out very short texts and track their indices
  const textsToVerify: Array<{ index: number; text: string }> = [];
  texts.forEach((text, index) => {
    if (text.length >= 10) {
      textsToVerify.push({ index, text });
    }
  });
  
  // If no texts need verification, return originals
  if (textsToVerify.length === 0) {
    return texts;
  }
  
  // Get localized messages
  const t = getMessages(language).quality;
  
  // Get the appropriate prompt based on context
  const promptTemplates = {
    story: t.storyPrompt,
    question: t.questionPrompt,
    word: t.wordPrompt,
  };
  
  // Format multiple texts with numbered markers
  const batchText = textsToVerify
    .map(({ index, text }) => `[${index}] ${text}`)
    .join('\n\n');
  
  const prompt = `${promptTemplates[context].replace('{text}', batchText)}\n\nIMPORTANT: Return ALL corrected texts in the SAME numbered format: [0] text1\n\n[1] text2\n\netc.`;

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
      temperature: 0.05,
      max_tokens: Math.ceil(batchText.length * 1.5),
    });

    const response = completion.choices[0]?.message?.content?.trim();
    if (!response) {
      return texts;
    }

    // Parse the numbered response
    const correctedMap = new Map<number, string>();
    const lines = response.split(/\n\n+/);
    
    for (const line of lines) {
      const match = line.match(/^\[(\d+)\]\s*(.+)$/);
      if (match) {
        const index = parseInt(match[1], 10);
        const correctedText = match[2].trim();
        correctedMap.set(index, correctedText);
      }
    }
    
    // Apply corrections, keeping originals if not in map
    const result = texts.map((original, index) => {
      if (original.length < 10) {
        return original; // Keep short texts as-is
      }
      
      const corrected = correctedMap.get(index);
      if (!corrected) {
        return original;
      }
      
      // Validate length ratio (80-120% to allow for minimal corrections)
      const lengthRatio = corrected.length / original.length;
      if (lengthRatio < 0.8 || lengthRatio > 1.2) {
        console.warn(`[QUALITY] Text [${index}] correction rejected (${Math.round(lengthRatio * 100)}% size)`);
        return original;
      }
      
      // Log if correction was applied
      if (corrected !== original) {
        console.log(`[QUALITY] ✓ [${index}] Corrected: "${original.slice(0, 40)}..." → "${corrected.slice(0, 40)}..."`);
      }
      
      return corrected;
    });
    
    console.log(`[QUALITY] Batch processed ${textsToVerify.length} texts in one call`);
    return result;
    
  } catch (error) {
    console.error('[QUALITY] Error during batch text verification:', error);
    return texts; // Return originals if verification fails
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

QUALITÉ DU TEXTE - TRÈS IMPORTANT:
- Vérifie TOUJOURS l'orthographe et la grammaire
- AUCUN mot avec des chiffres ou lettres collés (exemple: "auto5", "maison3")
- Ponctuation correcte avec espaces appropriés
- Pas de mots coupés ou mal formés
- Texte propre et professionnel

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
    console.log('[STORY] Verifying text quality (batch)...');

    // Batch verify all story texts at once
    const allStoryTexts = [story.title, ...story.paragraphs];
    const correctedTexts = await verifyTextsQuality({
      texts: allStoryTexts,
      language,
      context: 'story'
    });
    
    // Apply corrections
    story.title = cleanGeneratedText(correctedTexts[0]);
    story.paragraphs = correctedTexts.slice(1).map(cleanGeneratedText);
    
    // Clean vocabulary (no batch correction needed for short definitions)
    if (story.vocabulary && Array.isArray(story.vocabulary)) {
      story.vocabulary = story.vocabulary.map((vocab) => ({
        word: cleanGeneratedText(vocab.word),
        definition: cleanGeneratedText(vocab.definition),
        example: cleanGeneratedText(vocab.example),
      }));
    }

    console.log('[STORY] Text quality verification complete');

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

TEXT QUALITY - CRITICAL:
- ALWAYS check spelling and grammar
- NO words with numbers or letters stuck together (e.g., "book5", "house3")
- Correct punctuation with appropriate spacing
- No broken or malformed words
- Clean, professional text

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

    console.log('[QUESTIONS] Cleaning and verifying questions quality (batch)...');

    // Prepare all texts for batch verification
    const textsToVerify: string[] = [];
    const textIndices: Array<{ questionIndex: number; textType: 'question' | 'option' | 'answer' | 'explanation'; optionIndex?: number }> = [];
    
    const preparedQuestions = result.questions.map((q: GeneratedQuestion, index: number) => {
      const questionText = cleanGeneratedText(q.questionText || `Question ${index + 1}`);
      const options = Array.isArray(q.options) 
        ? q.options.slice(0, 4).map(opt => cleanGeneratedText(opt))
        : ['Option A', 'Option B', 'Option C', 'Option D'];
      const correctAnswer = cleanGeneratedText(q.correctAnswer || q.options?.[0] || 'Answer');
      const explanation = cleanGeneratedText(q.explanation || t.defaultExplanation);

      // Track indices for mapping back corrections
      textsToVerify.push(questionText);
      textIndices.push({ questionIndex: index, textType: 'question' });
      
      options.forEach((opt, optIndex) => {
        textsToVerify.push(opt);
        textIndices.push({ questionIndex: index, textType: 'option', optionIndex: optIndex });
      });
      
      textsToVerify.push(correctAnswer);
      textIndices.push({ questionIndex: index, textType: 'answer' });
      
      textsToVerify.push(explanation);
      textIndices.push({ questionIndex: index, textType: 'explanation' });

      return {
        questionText,
        type: validateQuestionType(q.type),
        options,
        correctAnswer,
        correctIndex: typeof q.correctIndex === 'number' ? q.correctIndex : 0,
        explanation,
        difficulty: Math.min(5, Math.max(1, q.difficulty || 1)),
        afterParagraph: Math.min(story.paragraphs.length - 1, Math.max(0, q.afterParagraph || index)),
      };
    });

    // Batch verify all question texts at once
    const correctedTexts = await verifyTextsQuality({
      texts: textsToVerify,
      language,
      context: 'question'
    });

    // Map corrections back to questions
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cleanedQuestions = preparedQuestions.map((q: any) => ({ ...q, options: [...q.options] }));
    
    textIndices.forEach((indexInfo, i) => {
      const corrected = correctedTexts[i];
      const q = cleanedQuestions[indexInfo.questionIndex];
      
      if (indexInfo.textType === 'question') {
        q.questionText = corrected;
      } else if (indexInfo.textType === 'option' && indexInfo.optionIndex !== undefined) {
        q.options[indexInfo.optionIndex] = corrected;
      } else if (indexInfo.textType === 'answer') {
        q.correctAnswer = corrected;
      } else if (indexInfo.textType === 'explanation') {
        q.explanation = corrected;
      }
    });

    console.log('[QUESTIONS] Text quality verification complete');
    
    return cleanedQuestions;
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
    
    // Clean the results
    const cleanedWord = cleanGeneratedText(result.word || params.word);
    const definition = cleanGeneratedText(result.definition || (language === 'fr' ? `Un mot super intéressant!` : `A super interesting word!`));
    const funFact = cleanGeneratedText(result.funFact || (language === 'fr' ? `C'est un mot qu'on utilise souvent!` : `It's a word we use often!`));
    
    return {
      word: cleanedWord,
      definition: await verifyTextQuality({ text: definition, language, context: 'word' }),
      funFact: await verifyTextQuality({ text: funFact, language, context: 'word' }),
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
