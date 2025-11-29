import Groq from 'groq-sdk';

if (!process.env.GROQ_API_KEY) {
  throw new Error('GROQ_API_KEY environment variable is not set');
}

export const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Default model for story generation
export const DEFAULT_MODEL = 'llama-3.3-70b-versatile';

// Model configuration for different use cases
export const MODELS = {
  STORY_GENERATION: 'llama-3.3-70b-versatile', // Best for creative content
  QUESTION_GENERATION: 'llama-3.3-70b-versatile', // Good for structured Q&A
  FAST_RESPONSE: 'llama-3.1-8b-instant', // Quick responses for simple tasks
} as const;

export default groq;
