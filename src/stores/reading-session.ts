import { create } from 'zustand';
import type { Story, ReadingSession, SessionAnswer, LisaState } from '@/types';

interface ReadingSessionState {
  // Current story state
  story: Story | null;
  currentIndex: number;
  isPaused: boolean;
  isLoading: boolean;
  error: string | null;

  // Session tracking
  session: ReadingSession | null;
  startTime: number | null;
  questionStartTime: number | null;
  
  // Answer tracking
  answers: SessionAnswer[];
  currentScore: { correct: number; total: number };

  // Lisa companion state
  lisaState: LisaState;
  lisaMessage: string | null;

  // Actions
  setStory: (story: Story) => void;
  startSession: (sessionId: string) => void;
  nextItem: () => void;
  previousItem: () => void;
  goToItem: (index: number) => void;
  togglePause: () => void;
  
  // Answer handling
  startQuestion: () => void;
  answerQuestion: (questionId: string, answer: string, correctIndex: number, selectedIndex: number) => void;
  
  // Lisa state
  setLisaState: (state: LisaState, message?: string) => void;

  // Session completion
  completeSession: () => {
    questionsAttempted: number;
    questionsCorrect: number;
    readingTimeSeconds: number;
    accuracy: number;
  };
  
  // Reset
  reset: () => void;
}

export const useReadingSessionStore = create<ReadingSessionState>((set, get) => ({
  // Initial state
  story: null,
  currentIndex: 0,
  isPaused: false,
  isLoading: false,
  error: null,

  session: null,
  startTime: null,
  questionStartTime: null,

  answers: [],
  currentScore: { correct: 0, total: 0 },

  lisaState: 'idle',
  lisaMessage: null,

  // Set the current story
  setStory: (story) => {
    set({
      story,
      currentIndex: 0,
      isPaused: false,
      answers: [],
      currentScore: { correct: 0, total: 0 },
      lisaState: 'reading',
      lisaMessage: 'Let\'s read this story together! 📖',
      error: null,
    });
  },

  // Start a new session
  startSession: (sessionId) => {
    set({
      session: {
        id: sessionId,
        storyId: get().story?.id || '',
        startedAt: new Date(),
        readingTimeSeconds: 0,
        questionsAttempted: 0,
        questionsCorrect: 0,
        answers: [],
      },
      startTime: Date.now(),
    });
  },

  // Navigate to next content item
  nextItem: () => {
    const { story, currentIndex } = get();
    if (!story) return;

    const maxIndex = story.content.length - 1;
    if (currentIndex < maxIndex) {
      const nextIndex = currentIndex + 1;
      const nextItem = story.content[nextIndex];
      
      set({
        currentIndex: nextIndex,
        lisaState: nextItem.type === 'question' ? 'thinking' : 'reading',
        lisaMessage: nextItem.type === 'question' 
          ? 'Take your time to answer! 🤔'
          : null,
      });

      // Start question timer if it's a question
      if (nextItem.type === 'question') {
        set({ questionStartTime: Date.now() });
      }
    }
  },

  // Navigate to previous content item
  previousItem: () => {
    const { currentIndex } = get();
    if (currentIndex > 0) {
      set({
        currentIndex: currentIndex - 1,
        isPaused: true,
      });
    }
  },

  // Go to specific item
  goToItem: (index) => {
    const { story } = get();
    if (!story) return;

    const maxIndex = story.content.length - 1;
    const safeIndex = Math.max(0, Math.min(index, maxIndex));
    
    set({
      currentIndex: safeIndex,
      isPaused: true,
    });
  },

  // Toggle pause
  togglePause: () => {
    set((state) => ({ isPaused: !state.isPaused }));
  },

  // Start timing a question
  startQuestion: () => {
    set({ questionStartTime: Date.now() });
  },

  // Handle answer submission
  answerQuestion: (questionId, answer, correctIndex, selectedIndex) => {
    const { questionStartTime, answers, currentScore } = get();
    
    const isCorrect = selectedIndex === correctIndex;
    const timeSpent = questionStartTime 
      ? Math.floor((Date.now() - questionStartTime) / 1000)
      : undefined;

    const newAnswer: SessionAnswer = {
      questionId,
      userAnswer: answer,
      isCorrect,
      timeSpentSeconds: timeSpent,
    };

    const newScore = {
      correct: currentScore.correct + (isCorrect ? 1 : 0),
      total: currentScore.total + 1,
    };

    // Update Lisa state based on answer
    const lisaState: LisaState = isCorrect ? 'success' : 'encouraging';
    const lisaMessage = isCorrect
      ? ['Great job! 🎉', 'You got it! ⭐', 'Excellent! 🌟'][Math.floor(Math.random() * 3)]
      : ['Good try! Keep going! 💪', 'That\'s okay, you\'re learning! 📚'][Math.floor(Math.random() * 2)];

    set({
      answers: [...answers, newAnswer],
      currentScore: newScore,
      questionStartTime: null,
      lisaState,
      lisaMessage,
    });
  },

  // Set Lisa companion state
  setLisaState: (state, message) => {
    set({
      lisaState: state,
      lisaMessage: message || null,
    });
  },

  // Complete the session and return stats
  completeSession: () => {
    const { startTime, currentScore } = get();
    
    const readingTimeSeconds = startTime
      ? Math.floor((Date.now() - startTime) / 1000)
      : 0;

    const accuracy = currentScore.total > 0
      ? currentScore.correct / currentScore.total
      : 0;

    // Update Lisa for celebration
    const lisaState: LisaState = accuracy >= 0.8 ? 'celebration' : accuracy >= 0.5 ? 'success' : 'encouraging';
    const lisaMessage = accuracy >= 0.8
      ? 'Amazing work! You\'re a reading star! 🌟'
      : accuracy >= 0.5
      ? 'Great effort! Keep practicing! 📖'
      : 'Good try! Every story makes you stronger! 💪';

    set({
      lisaState,
      lisaMessage,
    });

    return {
      questionsAttempted: currentScore.total,
      questionsCorrect: currentScore.correct,
      readingTimeSeconds,
      accuracy,
    };
  },

  // Reset session
  reset: () => {
    set({
      story: null,
      currentIndex: 0,
      isPaused: false,
      isLoading: false,
      error: null,
      session: null,
      startTime: null,
      questionStartTime: null,
      answers: [],
      currentScore: { correct: 0, total: 0 },
      lisaState: 'idle',
      lisaMessage: null,
    });
  },
}));
