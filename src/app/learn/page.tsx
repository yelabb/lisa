'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Pause, Play, ChevronLeft, ChevronRight, Loader2, RefreshCw, Settings, Check, X } from 'lucide-react';
import { toast } from 'sonner';

import { useUserProgressStore, useReadingSessionStore } from '@/stores';
import { useGenerateStory, useAnswerQuestion, useCompleteStory, useStartSession } from '@/hooks';
import { WelcomeScreen, LanguageSelect, ThemeSelect, ReadyScreen } from '@/components/onboarding';
import { SettingsDialog } from '@/components/settings';
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
  const [showSettings, setShowSettings] = useState(false);
  const [answerFeedback, setAnswerFeedback] = useState<{
    isCorrect: boolean;
    explanation: string;
  } | null>(null);

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
    
    // Show feedback popup
    setAnswerFeedback({
      isCorrect,
      explanation: currentItem.explanation,
    });
    
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
      setAnswerFeedback(null);
      if (currentIndex < story.content.length - 1) {
        nextItem();
      } else {
        handleStoryComplete();
      }
    }, 2500);
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
        className="cursor-pointer border-b-2 border-dashed border-purple-400 hover:border-purple-600 hover:bg-purple-50 hover:text-purple-700 transition-all px-1 py-0.5 rounded-sm mx-0.5"
      >
        {word}
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
      <div className="min-h-screen bg-linear-to-b from-white to-purple-50/30 flex flex-col items-center justify-center p-4">
        <motion.div
          className="relative"
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        >
          <Sparkles size={56} className="text-purple-500" />
        </motion.div>
        <motion.p 
          className="mt-6 text-gray-600 font-medium text-lg text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {lisaMessage || (isFrench ? 'Je prépare ton histoire...' : 'Preparing your story...')}
        </motion.p>
        <motion.div
          className="mt-4 flex gap-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 bg-purple-400 rounded-full"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
            />
          ))}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-white to-gray-50/50 flex flex-col p-4 sm:p-6">
      {/* Settings button (discrete, top-right) */}
      <button
        onClick={() => setShowSettings(true)}
        className="fixed top-4 right-4 w-10 h-10 rounded-full bg-white/80 hover:bg-white shadow-sm hover:shadow-md flex items-center justify-center transition-all opacity-60 hover:opacity-100 z-30 backdrop-blur-sm"
        aria-label={isFrench ? 'Paramètres' : 'Settings'}
      >
        <Settings size={18} className="text-gray-600" />
      </button>

      {/* Settings dialog */}
      <SettingsDialog 
        isOpen={showSettings} 
        onClose={() => setShowSettings(false)} 
      />

      {/* Answer feedback popup - FIXED position at root level */}
      <AnimatePresence>
        {answerFeedback && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className={`fixed bottom-6 left-1/2 -translate-x-1/2 max-w-sm w-[calc(100%-2rem)] rounded-2xl shadow-2xl p-5 z-100 border-2 ${
              answerFeedback.isCorrect 
                ? 'bg-green-50 border-green-200' 
                : 'bg-amber-50 border-amber-200'
            }`}
          >
            <div className="flex items-start gap-4">
              {/* Icon with animation */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 15, delay: 0.1 }}
                className={`shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                  answerFeedback.isCorrect 
                    ? 'bg-green-500' 
                    : 'bg-amber-500'
                }`}
              >
                {answerFeedback.isCorrect ? (
                  <Check size={24} className="text-white" />
                ) : (
                  <X size={24} className="text-white" />
                )}
              </motion.div>
              
              <div className="flex-1 min-w-0">
                <motion.p 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 }}
                  className={`font-semibold text-base mb-1 ${
                    answerFeedback.isCorrect ? 'text-green-800' : 'text-amber-800'
                  }`}
                >
                  {answerFeedback.isCorrect 
                    ? (isFrench ? 'Bravo ! 🎉' : 'Well done! 🎉')
                    : (isFrench ? 'Pas tout à fait...' : 'Not quite...')
                  }
                </motion.p>
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.25 }}
                  className={`text-sm leading-relaxed ${
                    answerFeedback.isCorrect ? 'text-green-700' : 'text-amber-700'
                  }`}
                >
                  {answerFeedback.explanation}
                </motion.p>
              </div>
            </div>
            
            {/* Progress bar for auto-dismiss */}
            <motion.div 
              className={`absolute bottom-0 left-0 h-1 rounded-b-2xl ${
                answerFeedback.isCorrect ? 'bg-green-400' : 'bg-amber-400'
              }`}
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{ duration: 2.5, ease: 'linear' }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Live score indicator - FIXED position at root level */}
      {!isCompleted && currentScore.total > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="fixed top-4 left-4 z-30"
        >
          <div className="bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-md border border-gray-100 flex items-center gap-2">
            <span className="text-lg">
              {currentScore.correct === currentScore.total ? '⭐' : '📖'}
            </span>
            <span className="text-sm font-medium text-gray-700">
              {currentScore.correct}/{currentScore.total}
            </span>
          </div>
        </motion.div>
      )}

      <div className="w-full max-w-2xl mx-auto flex flex-col flex-1">
        {/* Header - compact et fixe */}
        <div className="text-center py-6 shrink-0">
          <div className="inline-flex items-center gap-2 text-sm text-gray-500 mb-4">
            <Sparkles size={14} className="text-purple-500" />
            <span className="font-medium">Lisa</span>
            {progress && (
              <span className="ml-2 px-2.5 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                {progress.currentLevel.replace('_', ' ')}
              </span>
            )}
          </div>
          
          <h1 className="text-xl sm:text-2xl font-medium text-gray-900 mb-3">
            {story.title}
          </h1>
          <div className="w-16 h-0.5 bg-linear-to-r from-transparent via-purple-300 to-transparent mx-auto" />
        </div>

        {/* Navigation hint */}
        <AnimatePresence>
          {showNavigationHint && !isQuestion && !isCompleted && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-center mb-4"
            >
              <p className="text-xs text-gray-500 bg-gray-100 inline-block px-3 py-1.5 rounded-full">
                {isFrench ? 'Clique sur les côtés pour naviguer ← →' : 'Click on the sides to navigate ← →'}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main content area - hauteur fixe pour éviter les sauts */}
        <div className="relative flex-1 flex min-h-[350px] sm:min-h-[400px]">
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
          <div className="flex-1 relative z-20 pointer-events-none flex items-center justify-center px-4 sm:px-12">
            <div className="pointer-events-auto w-full">
              <AnimatePresence mode="wait">
                {/* Text paragraph */}
                {currentItem && currentItem.type === 'text' && !isCompleted && (
                  <motion.div
                    key={`text-${currentIndex}`}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -16 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="text-center"
                  >
                    <p className="text-2xl sm:text-3xl leading-relaxed sm:leading-loose text-gray-800 font-normal tracking-wide">
                      {currentItem.text.split(' ').map((word, i) => renderWord(word, i))}
                    </p>
                  </motion.div>
                )}

                {/* Question */}
                {currentItem && currentItem.type === 'question' && !isCompleted && (
                  <motion.div
                    key={`question-${currentIndex}`}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <p className="text-xl sm:text-2xl text-gray-900 font-medium text-center mb-8">
                      {(currentItem as StoryQuestion).text}
                    </p>

                    <div className="space-y-3 max-w-lg mx-auto">
                      {(currentItem as StoryQuestion).options.map((option, index) => {
                        const question = currentItem as StoryQuestion;
                        let bgColor = 'bg-white hover:bg-gray-50';
                        let borderColor = 'border-gray-200 hover:border-gray-300';
                        let textColor = 'text-gray-700';
                        let shadow = 'shadow-sm hover:shadow';
                        let icon = null;

                        if (selectedAnswer !== null) {
                          shadow = 'shadow-none';
                          if (index === question.correctIndex) {
                            bgColor = 'bg-green-50';
                            borderColor = 'border-green-400';
                            textColor = 'text-green-800';
                            icon = <Check size={20} className="text-green-600 shrink-0" />;
                          } else if (index === selectedAnswer) {
                            bgColor = 'bg-red-50';
                            borderColor = 'border-red-400';
                            textColor = 'text-red-800';
                            icon = <X size={20} className="text-red-600 shrink-0" />;
                          } else {
                            bgColor = 'bg-gray-50';
                            borderColor = 'border-gray-100';
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
                            animate={
                              selectedAnswer !== null && index === (currentItem as StoryQuestion).correctIndex
                                ? { scale: [1, 1.02, 1] }
                                : {}
                            }
                            transition={{ duration: 0.3 }}
                            className={`w-full p-4 sm:p-5 rounded-xl border-2 ${borderColor} ${bgColor} ${textColor} ${shadow} text-left text-base sm:text-lg font-normal transition-all disabled:cursor-default flex items-center justify-between gap-3`}
                          >
                            <span>{option}</span>
                            {icon}
                          </motion.button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                {/* Story complete */}
                {isCompleted && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center space-y-6"
                  >
                    {/* Animated emoji celebration */}
                    <div className="relative">
                      <motion.div 
                        className="text-6xl sm:text-7xl"
                        initial={{ scale: 0, rotate: -20 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                      >
                        {currentScore.total > 0 && currentScore.correct / currentScore.total >= 0.8 ? '🌟' : 
                         currentScore.total > 0 && currentScore.correct / currentScore.total >= 0.5 ? '✨' : '📚'}
                      </motion.div>
                      
                      {/* Confetti effect for perfect score */}
                      {currentScore.total > 0 && currentScore.correct === currentScore.total && (
                        <>
                          {[...Array(6)].map((_, i) => (
                            <motion.span
                              key={i}
                              className="absolute text-2xl"
                              initial={{ opacity: 0, scale: 0 }}
                              animate={{ 
                                opacity: [0, 1, 0],
                                scale: [0, 1, 0.5],
                                x: [0, (i % 2 === 0 ? 1 : -1) * (30 + i * 15)],
                                y: [0, -40 - i * 10],
                              }}
                              transition={{ duration: 1, delay: 0.3 + i * 0.1 }}
                              style={{ left: '50%', top: '50%' }}
                            >
                              {['⭐', '✨', '🎉', '💫', '🌟', '🎊'][i]}
                            </motion.span>
                          ))}
                        </>
                      )}
                    </div>
                    
                    <motion.p 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="text-xl sm:text-2xl text-gray-800 font-medium"
                    >
                      {currentScore.total > 0 && currentScore.correct / currentScore.total >= 0.8
                        ? (isFrench ? 'Incroyable ! Tu es une vraie star !' : 'Amazing! You\'re a reading star!')
                        : currentScore.total > 0 && currentScore.correct / currentScore.total >= 0.5
                        ? (isFrench ? 'Bien joué ! Continue comme ça !' : 'Well done! Keep it up!')
                        : (isFrench ? 'Continue à t\'entraîner !' : 'Keep practicing!')}
                    </motion.p>
                    
                    {/* Score display with animation */}
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="flex items-center justify-center gap-3 flex-wrap"
                    >
                      <motion.span 
                        className="bg-purple-100 text-purple-700 px-4 py-2 rounded-full font-semibold text-base flex items-center gap-2"
                        whileHover={{ scale: 1.05 }}
                      >
                        <Check size={18} />
                        {currentScore.correct}/{currentScore.total}
                      </motion.span>
                      {progress && progress.currentStreak > 0 && (
                        <motion.span 
                          className="bg-orange-100 text-orange-700 px-4 py-2 rounded-full font-semibold text-base"
                          whileHover={{ scale: 1.05 }}
                        >
                          🔥 {progress.currentStreak} {isFrench ? 'jours' : 'days'}
                        </motion.span>
                      )}
                    </motion.div>
                    
                    <motion.button
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={handleNextStory}
                      disabled={generateStory.isPending}
                      className="inline-flex items-center gap-2 px-8 py-4 bg-purple-600 text-white rounded-xl text-base font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50 shadow-lg hover:shadow-xl mt-2"
                    >
                      {generateStory.isPending ? (
                        <>
                          <Loader2 size={18} className="animate-spin" />
                          {isFrench ? 'Chargement...' : 'Loading...'}
                        </>
                      ) : (
                        <>
                          <RefreshCw size={18} />
                          {isFrench ? 'Histoire suivante' : 'Next Story'}
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
                className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
              />
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.95 }}
                className="fixed bottom-8 left-1/2 -translate-x-1/2 max-w-md w-[calc(100%-2rem)] bg-white rounded-2xl shadow-2xl p-6 z-50 border border-gray-100"
              >
                <div className="text-center space-y-3">
                  <h3 className="text-xl font-semibold text-purple-600">
                    {showHint.word}
                  </h3>
                  <p className="text-gray-800 font-normal text-base">
                    {showHint.definition}
                  </p>
                  <p className="text-sm text-gray-500 italic bg-gray-50 rounded-lg p-3">
                    &ldquo;{showHint.example}&rdquo;
                  </p>
                  <button 
                    onClick={() => setShowHint(null)}
                    className="text-xs text-gray-400 hover:text-gray-600 mt-2"
                  >
                    {isFrench ? 'Fermer' : 'Close'}
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Progress indicator - plus visible */}
        {!isCompleted && (
          <div className="mt-8 sm:mt-12 flex justify-center gap-2 shrink-0">
            {story.content.map((item, index) => (
              <div
                key={index}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  item.type === 'question' ? 'w-6' : 'w-10'
                } ${
                  index < currentIndex 
                    ? 'bg-purple-400' 
                    : index === currentIndex 
                      ? 'bg-purple-500 scale-y-125' 
                      : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        )}

        {/* Navigation controls - toujours visibles pour éviter le saut de page */}
        {!isCompleted && currentIndex < story.content.length && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className={`mt-6 flex items-center justify-center gap-4 pb-4 shrink-0 transition-opacity ${
              selectedAnswer !== null ? 'opacity-40 pointer-events-none' : 'opacity-100'
            }`}
          >
            <motion.button
              onClick={previousItem}
              disabled={currentIndex === 0 || selectedAnswer !== null}
              whileHover={{ scale: currentIndex > 0 && selectedAnswer === null ? 1.05 : 1 }}
              whileTap={{ scale: currentIndex > 0 && selectedAnswer === null ? 0.95 : 1 }}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                currentIndex > 0 && selectedAnswer === null
                  ? 'bg-white hover:bg-gray-50 text-gray-700 shadow-md hover:shadow-lg border border-gray-200'
                  : 'bg-gray-100 text-gray-300 cursor-not-allowed'
              }`}
            >
              <ChevronLeft size={22} />
            </motion.button>

            <motion.button
              onClick={togglePause}
              disabled={selectedAnswer !== null}
              whileHover={{ scale: selectedAnswer === null ? 1.05 : 1 }}
              whileTap={{ scale: selectedAnswer === null ? 0.95 : 1 }}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
                selectedAnswer === null 
                  ? 'bg-purple-500 hover:bg-purple-600 text-white shadow-lg hover:shadow-xl' 
                  : 'bg-purple-300 text-white shadow-md cursor-not-allowed'
              }`}
            >
              {isPaused ? <Play size={24} /> : <Pause size={24} />}
            </motion.button>

            <motion.button
              onClick={nextItem}
              disabled={currentIndex >= story.content.length - 1 || selectedAnswer !== null}
              whileHover={{ scale: currentIndex < story.content.length - 1 && selectedAnswer === null ? 1.05 : 1 }}
              whileTap={{ scale: currentIndex < story.content.length - 1 && selectedAnswer === null ? 0.95 : 1 }}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                currentIndex < story.content.length - 1 && selectedAnswer === null
                  ? 'bg-white hover:bg-gray-50 text-gray-700 shadow-md hover:shadow-lg border border-gray-200'
                  : 'bg-gray-100 text-gray-300 cursor-not-allowed'
              }`}
            >
              <ChevronRight size={22} />
            </motion.button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
