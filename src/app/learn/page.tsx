'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Pause, Play, ChevronLeft, ChevronRight, Loader2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

import { useUserProgressStore, useReadingSessionStore } from '@/stores';
import { useGenerateStory, useAnswerQuestion, useCompleteStory, useStartSession } from '@/hooks';
import { LisaCompanion } from '@/components/lisa';
import { WelcomeScreen, LanguageSelect, ThemeSelect, ReadyScreen } from '@/components/onboarding';
import type { WordHint, StoryQuestion } from '@/types';

// Onboarding steps
type OnboardingStep = 'welcome' | 'language' | 'themes' | 'ready' | 'complete';

export default function LearnPage() {
  // Stores
  const { 
    userId, 
    progress, 
    language,
    initializeUser, 
    setLanguage,
    setPreferences,
    completeOnboarding: markOnboardingComplete 
  } = useUserProgressStore();
  const {
    story,
    currentIndex,
    isPaused,
    currentScore,
    lisaState,
    lisaMessage,
    setStory,
    startSession,
    nextItem,
    previousItem,
    togglePause,
    answerQuestion: recordAnswer,
    setLisaState,
    completeSession,
    reset: resetSession,
  } = useReadingSessionStore();

  // Onboarding state
  const [onboardingStep, setOnboardingStep] = useState<OnboardingStep>('welcome');
  const [selectedThemes, setSelectedThemes] = useState<string[]>([]);

  // API hooks
  const generateStory = useGenerateStory();
  const answerQuestionMutation = useAnswerQuestion();
  const completeStoryMutation = useCompleteStory();
  const startSessionMutation = useStartSession();

  // Local state
  const [showHint, setShowHint] = useState<WordHint | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showNavigationHint, setShowNavigationHint] = useState(true);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);

  // Initialize user on mount
  useEffect(() => {
    initializeUser();
  }, [initializeUser]);

  // Check if onboarding is complete
  const hasCompletedOnboarding = progress?.hasCompletedOnboarding ?? false;

  // Determine initial onboarding step based on saved state - use useMemo to avoid effect setState
  const initialOnboardingStep = (): OnboardingStep => {
    if (hasCompletedOnboarding) {
      return 'complete';
    } else if (language) {
      return 'themes';
    }
    return 'welcome';
  };

  // Only set step on mount if needed
  useEffect(() => {
    const step = initialOnboardingStep();
    if (step !== onboardingStep) {
      queueMicrotask(() => {
        setOnboardingStep(step);
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasCompletedOnboarding, language]);

  // Onboarding handlers
  const handleWelcomeContinue = () => {
    setOnboardingStep('language');
  };

  const handleLanguageSelect = (lang: string) => {
    setLanguage(lang);
    setOnboardingStep('themes');
  };

  const handleThemesContinue = (themes: string[]) => {
    setSelectedThemes(themes);
    setOnboardingStep('ready');
  };

  const handleStartReading = () => {
    // Save preferences and mark onboarding complete
    setPreferences(selectedThemes, []);
    markOnboardingComplete('BEGINNER', 50);
    setOnboardingStep('complete');
  };

  // Load story when user is ready
  const loadNewStory = useCallback(async (excludeStoryId?: string) => {
    if (!progress) return;

    setLisaState('thinking', language === 'fr' 
      ? 'Je cherche une belle histoire pour toi...' 
      : 'Finding a great story for you...');
    
    try {
      const result = await generateStory.mutateAsync({
        readingLevel: progress.currentLevel,
        theme: progress.preferredThemes[0] || selectedThemes[0] || 'adventure',
        interests: progress.interests,
        difficultyMultiplier: progress.difficultyMultiplier,
        language: language || 'fr',
        excludeIds: excludeStoryId ? [excludeStoryId] : [],
      });

      setStory(result.story);
      setIsCompleted(false);
      setSelectedAnswer(null);

      // Start session
      const session = await startSessionMutation.mutateAsync(result.story.id);
      setSessionId(session.id);
      startSession(session.id);

      setLisaState('reading', language === 'fr' 
        ? 'Lisons ensemble! 📖' 
        : 'Let\'s read together! 📖');
      
      if (result.cached) {
        toast.info(language === 'fr' 
          ? 'On continue avec ton histoire sauvegardée' 
          : 'Continuing with a saved story');
      }
    } catch (error) {
      console.error('Failed to load story:', error);
      setLisaState('encouraging', language === 'fr' 
        ? 'Oups! Laisse-moi réessayer...' 
        : 'Oops! Let me try again...');
      toast.error(language === 'fr' 
        ? 'Impossible de charger l\'histoire. Réessaie!' 
        : 'Failed to load story. Please try again.');
    }
  }, [progress, selectedThemes, language, generateStory, setStory, startSessionMutation, startSession, setLisaState]);

  // Track if initial load has been triggered
  const hasTriggeredLoadRef = useRef(false);

  useEffect(() => {
    if (userId && progress && !story && !generateStory.isPending && !hasTriggeredLoadRef.current && onboardingStep === 'complete') {
      hasTriggeredLoadRef.current = true;
      // Defer to avoid synchronous setState in effect
      queueMicrotask(() => {
        loadNewStory();
      });
    }
  }, [userId, progress, story, generateStory.isPending, loadNewStory, onboardingStep]);

  // Handle story completion
  const handleStoryComplete = useCallback(async () => {
    if (!story || isCompleted) return;
    
    setIsCompleted(true);
    const stats = completeSession();
    
    // Send to server
    await completeStoryMutation.mutateAsync({
      storyId: story.id,
      sessionId: sessionId || undefined,
      questionsAttempted: stats.questionsAttempted,
      questionsCorrect: stats.questionsCorrect,
      readingTimeSeconds: stats.readingTimeSeconds,
    });

    const isFrench = language === 'fr';
    setLisaState(
      stats.accuracy >= 0.8 ? 'celebration' : 'success',
      stats.accuracy >= 0.8 
        ? (isFrench ? 'Incroyable! Tu es une vraie star! 🌟' : 'Amazing work! You\'re a reading star! 🌟')
        : (isFrench ? 'Super travail! Continue comme ça! 📖' : 'Great effort! Keep practicing! 📖')
    );
  }, [story, isCompleted, language, completeSession, completeStoryMutation, sessionId, setLisaState]);

  // Auto-progression timer
  useEffect(() => {
    if (!story || isPaused || isCompleted) return;
    
    const currentItem = story.content[currentIndex];
    if (!currentItem || currentItem.type === 'question' || selectedAnswer !== null) return;

    const timer = setTimeout(() => {
      if (currentIndex < story.content.length - 1) {
        nextItem();
      } else {
        handleStoryComplete();
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [currentIndex, isPaused, story, selectedAnswer, isCompleted, nextItem, handleStoryComplete]);

  // Hide navigation hint after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => setShowNavigationHint(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  // Handle word click for hints
  const handleWordClick = (word: string) => {
    if (!story) return;
    
    const hint = story.hints.find(h => 
      word.toLowerCase().includes(h.word.toLowerCase()) || 
      h.word.toLowerCase().includes(word.toLowerCase())
    );
    
    if (hint) {
      setShowHint(hint);
    }
  };

  // Handle answer selection
  const handleAnswerSelect = async (index: number) => {
    if (selectedAnswer !== null || !story) return;
    
    const currentItem = story.content[currentIndex] as StoryQuestion;
    if (currentItem.type !== 'question') return;

    setSelectedAnswer(index);
    const isCorrect = index === currentItem.correctIndex;
    
    // Record in store
    recordAnswer(
      currentItem.id,
      currentItem.options[index],
      currentItem.correctIndex,
      index
    );

    // Send to server
    answerQuestionMutation.mutate({
      questionId: currentItem.id,
      userAnswer: currentItem.options[index],
      isCorrect,
      questionType: currentItem.questionType,
      difficulty: currentItem.difficulty,
      sessionId: sessionId || undefined,
    });

    // Continue after delay
    setTimeout(() => {
      setSelectedAnswer(null);
      if (currentIndex < story.content.length - 1) {
        nextItem();
      } else {
        handleStoryComplete();
      }
    }, 3000);
  };

  // Handle next story
  const handleNextStory = () => {
    const currentStoryId = story?.id;
    resetSession();
    setSessionId(null);
    setIsCompleted(false);
    hasTriggeredLoadRef.current = false;
    loadNewStory(currentStoryId);
  };

  // Render word with possible hint
  const renderWord = (word: string, index: number) => {
    if (!story) return word + ' ';
    
    const hasHint = story.hints.some(h => 
      word.toLowerCase().includes(h.word.toLowerCase()) || 
      h.word.toLowerCase().includes(word.toLowerCase())
    );

    if (!hasHint) return word + ' ';

    return (
      <span
        key={index}
        onClick={() => handleWordClick(word)}
        className="cursor-pointer border-b-2 border-dotted border-purple-300 hover:border-purple-500 hover:bg-purple-50 transition-all px-0.5 rounded"
      >
        {word}{' '}
      </span>
    );
  };

  // ============================================
  // RENDER ONBOARDING SCREENS
  // ============================================
  if (onboardingStep !== 'complete') {
    return (
      <AnimatePresence mode="wait">
        {onboardingStep === 'welcome' && (
          <WelcomeScreen key="welcome" onContinue={handleWelcomeContinue} />
        )}
        {onboardingStep === 'language' && (
          <LanguageSelect key="language" onSelect={handleLanguageSelect} />
        )}
        {onboardingStep === 'themes' && (
          <ThemeSelect 
            key="themes" 
            language={language || 'fr'} 
            onContinue={handleThemesContinue} 
          />
        )}
        {onboardingStep === 'ready' && (
          <ReadyScreen 
            key="ready" 
            language={language || 'fr'} 
            onStart={handleStartReading} 
          />
        )}
      </AnimatePresence>
    );
  }

  // ============================================
  // RENDER MAIN READING EXPERIENCE
  // ============================================

  // Get current content item
  const currentItem = story?.content[currentIndex];
  const isQuestion = currentItem?.type === 'question';
  const isFrench = language === 'fr';

  // Loading state
  if (generateStory.isPending || !story) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <Sparkles size={48} className="text-purple-400" />
        </motion.div>
        <p className="mt-4 text-gray-500 font-light">
          {lisaMessage || (isFrench ? 'Je prépare ton histoire...' : 'Preparing your story...')}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      {/* Lisa Companion */}
      <LisaCompanion
        state={lisaState}
        message={lisaMessage ? { text: lisaMessage } : undefined}
        showMessage={!!lisaMessage}
      />

      <div className="w-full max-w-3xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 text-sm text-gray-400 mb-8">
            <Sparkles size={14} className="text-purple-400" />
            <span>Lisa</span>
            {progress && (
              <span className="ml-2 px-2 py-0.5 bg-purple-50 text-purple-600 rounded-full text-xs">
                {progress.currentLevel.replace('_', ' ')}
              </span>
            )}
          </div>
          
          <h1 className="text-2xl font-light text-gray-800 mb-2">
            {story.title}
          </h1>
          <div className="w-24 h-0.5 bg-linear-to-r from-transparent via-purple-200 to-transparent mx-auto" />
        </div>

        {/* Navigation hint */}
        <AnimatePresence>
          {showNavigationHint && !isQuestion && !isCompleted && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-center mb-6"
            >
              <p className="text-xs text-gray-400 font-light">
                Click on the sides to navigate ← →
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main content area */}
        <div className="relative min-h-[400px] flex">
          {/* Left click zone */}
          {!isQuestion && !isCompleted && currentIndex > 0 && selectedAnswer === null && (
            <button
              onClick={previousItem}
              className="absolute left-0 top-0 bottom-0 w-1/4 hover:bg-gray-50/50 transition-colors cursor-pointer z-10 group"
              aria-label="Previous"
            >
              <div className="absolute left-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                <ChevronLeft size={32} className="text-gray-300" />
              </div>
            </button>
          )}

          {/* Right click zone */}
          {!isQuestion && !isCompleted && currentIndex < story.content.length - 1 && selectedAnswer === null && (
            <button
              onClick={nextItem}
              className="absolute right-0 top-0 bottom-0 w-1/4 hover:bg-gray-50/50 transition-colors cursor-pointer z-10 group"
              aria-label="Next"
            >
              <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                <ChevronRight size={32} className="text-gray-300" />
              </div>
            </button>
          )}

          {/* Content */}
          <div className="flex-1 relative z-20 pointer-events-none">
            <div className="pointer-events-auto">
              <AnimatePresence mode="wait">
                {/* Text paragraph */}
                {currentItem && currentItem.type === 'text' && !isCompleted && (
                  <motion.div
                    key={`text-${currentIndex}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="text-center"
                  >
                    <p className="text-3xl leading-relaxed text-gray-700 font-light tracking-wide">
                      {currentItem.text.split(' ').map((word, i) => renderWord(word, i))}
                    </p>
                  </motion.div>
                )}

                {/* Question */}
                {currentItem && currentItem.type === 'question' && !isCompleted && (
                  <motion.div
                    key={`question-${currentIndex}`}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.4 }}
                    className="space-y-8"
                  >
                    <p className="text-2xl text-gray-800 font-light text-center mb-12">
                      {(currentItem as StoryQuestion).text}
                    </p>

                    <div className="space-y-3">
                      {(currentItem as StoryQuestion).options.map((option, index) => {
                        const question = currentItem as StoryQuestion;
                        let bgColor = 'bg-gray-50 hover:bg-gray-100';
                        let borderColor = 'border-gray-200';
                        let textColor = 'text-gray-700';

                        if (selectedAnswer !== null) {
                          if (index === question.correctIndex) {
                            bgColor = 'bg-green-50';
                            borderColor = 'border-green-200';
                            textColor = 'text-green-800';
                          } else if (index === selectedAnswer) {
                            bgColor = 'bg-red-50';
                            borderColor = 'border-red-200';
                            textColor = 'text-red-800';
                          } else {
                            bgColor = 'bg-gray-50';
                            textColor = 'text-gray-400';
                          }
                        }

                        return (
                          <motion.button
                            key={index}
                            onClick={() => handleAnswerSelect(index)}
                            disabled={selectedAnswer !== null}
                            whileHover={selectedAnswer === null ? { x: 4 } : {}}
                            whileTap={selectedAnswer === null ? { scale: 0.98 } : {}}
                            className={`w-full p-5 rounded-lg border ${borderColor} ${bgColor} ${textColor} text-left text-lg font-light transition-all disabled:cursor-default`}
                          >
                            {option}
                          </motion.button>
                        );
                      })}
                    </div>

                    {/* Explanation */}
                    {selectedAnswer !== null && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center"
                      >
                        <p className="text-sm text-gray-500 font-light">
                          {(currentItem as StoryQuestion).explanation}
                        </p>
                      </motion.div>
                    )}
                  </motion.div>
                )}

                {/* Story complete */}
                {isCompleted && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center space-y-8"
                  >
                    <div className="text-6xl mb-8">
                      {currentScore.total > 0 && currentScore.correct / currentScore.total >= 0.8 ? '🌟' : '✨'}
                    </div>
                    <p className="text-2xl text-gray-700 font-light">
                      {currentScore.total > 0 && currentScore.correct / currentScore.total >= 0.8
                        ? 'Amazing! You\'re a reading star!'
                        : 'Great job! Keep it up!'}
                    </p>
                    <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
                      <span>{currentScore.correct}/{currentScore.total} correct</span>
                      {progress && (
                        <>
                          <span>•</span>
                          <span>🔥 {progress.currentStreak} day streak</span>
                        </>
                      )}
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleNextStory}
                      disabled={generateStory.isPending}
                      className="inline-flex items-center gap-2 px-8 py-3 bg-gray-900 text-white rounded-lg text-sm font-light hover:bg-gray-800 transition-colors disabled:opacity-50"
                    >
                      {generateStory.isPending ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          Loading...
                        </>
                      ) : (
                        <>
                          <RefreshCw size={16} />
                          Next Story
                        </>
                      )}
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Hint tooltip */}
        <AnimatePresence>
          {showHint && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowHint(null)}
                className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
              />
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="fixed bottom-8 left-1/2 -translate-x-1/2 max-w-md w-full mx-4 bg-white rounded-2xl shadow-2xl p-6 z-50 border border-gray-100"
              >
                <div className="text-center space-y-3">
                  <h3 className="text-xl font-medium text-purple-600">
                    {showHint.word}
                  </h3>
                  <p className="text-gray-700 font-light">
                    {showHint.definition}
                  </p>
                  <p className="text-sm text-gray-500 italic">
                    &ldquo;{showHint.example}&rdquo;
                  </p>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Progress indicator */}
        {!isCompleted && (
          <div className="mt-16 flex justify-center gap-1.5">
            {story.content.map((_, index) => (
              <div
                key={index}
                className={`h-1 w-8 rounded-full transition-colors ${
                  index <= currentIndex ? 'bg-purple-300' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        )}

        {/* Navigation controls */}
        {!isCompleted && currentIndex < story.content.length && selectedAnswer === null && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-8 flex items-center justify-center gap-3"
          >
            <motion.button
              onClick={previousItem}
              disabled={currentIndex === 0}
              whileHover={{ scale: currentIndex > 0 ? 1.1 : 1 }}
              whileTap={{ scale: currentIndex > 0 ? 0.9 : 1 }}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                currentIndex > 0
                  ? 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  : 'bg-gray-50 text-gray-300 cursor-not-allowed'
              }`}
            >
              <ChevronLeft size={20} />
            </motion.button>

            <motion.button
              onClick={togglePause}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="w-12 h-12 rounded-full bg-purple-100 hover:bg-purple-200 text-purple-700 flex items-center justify-center transition-all"
            >
              {isPaused ? <Play size={20} /> : <Pause size={20} />}
            </motion.button>

            <motion.button
              onClick={nextItem}
              disabled={currentIndex >= story.content.length - 1}
              whileHover={{ scale: currentIndex < story.content.length - 1 ? 1.1 : 1 }}
              whileTap={{ scale: currentIndex < story.content.length - 1 ? 0.9 : 1 }}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                currentIndex < story.content.length - 1
                  ? 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  : 'bg-gray-50 text-gray-300 cursor-not-allowed'
              }`}
            >
              <ChevronRight size={20} />
            </motion.button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
