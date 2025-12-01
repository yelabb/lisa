'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Pause, Play, ChevronLeft, ChevronRight, Loader2, RefreshCw, Settings, Check, X, Shuffle } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

import { useUserProgressStore, useReadingSessionStore } from '@/stores';
import { useGenerateStory, useAnswerQuestion, useCompleteStory, useStartSession } from '@/hooks';
import { WelcomeScreen, LanguageSelect, ThemeSelect, ReadyScreen } from '@/components/onboarding';
import { SettingsDialog } from '@/components/settings';
import type { WordHint, StoryQuestion } from '@/types';

// Onboarding steps
type OnboardingStep = 'welcome' | 'language' | 'themes' | 'ready' | 'complete';

export default function LearnPage() {
  // i18n
  const tStory = useTranslations('story');
  const tFeedback = useTranslations('feedback');
  const tCommon = useTranslations('common');
  const tSettings = useTranslations('settings');

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
  // Feedback intégré comme une étape de l'histoire
  const [showFeedbackStep, setShowFeedbackStep] = useState<{
    isCorrect: boolean;
    explanation: string;
  } | null>(null);
  // Progress tracking for auto-scroll
  const [scrollProgress, setScrollProgress] = useState(0);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [currentReadingTime, setCurrentReadingTime] = useState(5000);

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
    markOnboardingComplete();
    setOnboardingStep('complete');
  };

  // Load story when user is ready
  const loadNewStory = useCallback(async (excludeStoryId?: string) => {
    if (!progress) return;

    setLisaState('thinking', tStory('generating'));
    
    try {
      // Utiliser tous les thèmes préférés de l'utilisateur
      const userThemes = progress.preferredThemes.length > 0 
        ? progress.preferredThemes 
        : (selectedThemes.length > 0 ? selectedThemes : ['adventure']);
      
      const result = await generateStory.mutateAsync({
        difficultyMultiplier: progress.difficultyMultiplier,
        themes: userThemes, // Passer TOUS les thèmes
        interests: progress.interests,
        language: language || 'fr',
        excludeIds: excludeStoryId ? [excludeStoryId] : [],
      });

      // Filtrer les questions invalides avant d'afficher l'histoire
      const filteredContent = result.story.content.filter((item) => {
        if (item.type !== 'question') return true;
        const q = item as StoryQuestion;
        const isValid = !!(
          q.text &&
          q.options &&
          Array.isArray(q.options) &&
          q.options.length >= 2 &&
          typeof q.correctIndex === 'number' &&
          q.correctIndex >= 0 &&
          q.correctIndex < q.options.length
        );
        if (!isValid) {
          console.warn('Filtering out invalid question:', q);
        }
        return isValid;
      });

      setStory({ ...result.story, content: filteredContent });
      setIsCompleted(false);
      setSelectedAnswer(null);
      setShowFeedbackStep(null);

      // Start session
      const session = await startSessionMutation.mutateAsync(result.story.id);
      setSessionId(session.id);
      startSession(session.id);

      setLisaState('reading', tStory('letsRead'));
      
      if (result.cached) {
        // Indique que c'est une histoire du cache (fallback car génération échouée)
        toast.info(tStory('connectionIssue'));
      }
    } catch (error) {
      console.error('Failed to load story:', error);
      setLisaState('encouraging', tStory('tryAgain'));
      toast.error(tStory('loadError'));
    }
  }, [progress, selectedThemes, language, generateStory, setStory, startSessionMutation, startSession, setLisaState, tStory]);

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

    setLisaState(
      stats.accuracy >= 0.8 ? 'celebration' : 'success',
      stats.accuracy >= 0.8 
        ? tFeedback('amazingWork')
        : tFeedback('greatEffort')
    );
  }, [story, isCompleted, completeSession, completeStoryMutation, sessionId, setLisaState, tFeedback]);

  // Calculate reading time based on word count
  const calculateReadingTime = useCallback((text: string) => {
    const wordCount = text.split(/\s+/).filter(word => word.length > 0).length;
    // Base: ~150 words per minute for children learning to read
    // That's about 400ms per word, with a minimum of 3s and maximum of 15s
    const timePerWord = 400; // milliseconds
    const baseTime = wordCount * timePerWord;
    return Math.max(3000, Math.min(15000, baseTime));
  }, []);

  // Refs to avoid effect re-running
  const nextItemRef = useRef(nextItem);
  const handleStoryCompleteRef = useRef(handleStoryComplete);
  useEffect(() => {
    nextItemRef.current = nextItem;
    handleStoryCompleteRef.current = handleStoryComplete;
  }, [nextItem, handleStoryComplete]);



  // Auto-progression timer with progress tracking
  useEffect(() => {
    if (!story || isPaused || isCompleted) {
      return;
    }
    
    const currentItem = story.content[currentIndex];
    if (!currentItem || currentItem.type === 'question' || selectedAnswer !== null) {
      return;
    }

    // Calculate reading time based on word count
    const readingTime = calculateReadingTime(currentItem.text);
    setCurrentReadingTime(readingTime);
    
    // Reset progress at start
    setScrollProgress(0);
    
    const startTime = Date.now();

    // Progress update interval (~60fps)
    const progressTimer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min((elapsed / readingTime) * 100, 100);
      setScrollProgress(progress);
    }, 16);

    const timer = setTimeout(() => {
      clearInterval(progressTimer);
      setScrollProgress(0);
      if (currentIndex < story.content.length - 1) {
        nextItemRef.current();
      } else {
        handleStoryCompleteRef.current();
      }
    }, readingTime);

    return () => {
      clearTimeout(timer);
      clearInterval(progressTimer);
    };
  }, [currentIndex, isPaused, story, selectedAnswer, isCompleted, calculateReadingTime]);

  // Hide navigation hint after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => setShowNavigationHint(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  // Handle word click for hints
  const handleWordClick = (word: string) => {
    if (!story) return;
    
    // Nettoyer le mot des caractères de ponctuation pour la comparaison
    const cleanWord = word.toLowerCase().replace(/[^a-zA-ZÀ-ÿ]/g, '');
    
    // Correspondance exacte uniquement
    const hint = story.hints.find(h => {
      const cleanHint = h.word.toLowerCase().replace(/[^a-zA-ZÀ-ÿ]/g, '');
      return cleanWord === cleanHint;
    });
    
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

    // Après un court délai, afficher le feedback comme une étape
    setTimeout(() => {
      setSelectedAnswer(null);
      setShowFeedbackStep({
        isCorrect,
        explanation: currentItem.explanation,
      });
    }, 1500);
  };

  // Continuer après le feedback
  const handleContinueAfterFeedback = () => {
    if (!story) return;
    setShowFeedbackStep(null);
    if (currentIndex < story.content.length - 1) {
      nextItem();
    } else {
      handleStoryComplete();
    }
  };

  // Handle next story
  const handleNextStory = () => {
    const currentStoryId = story?.id;
    resetSession();
    setSessionId(null);
    setIsCompleted(false);
    setShowFeedbackStep(null);
    hasTriggeredLoadRef.current = false;
    loadNewStory(currentStoryId); // Toujours générer une nouvelle histoire
  };

  // Render word with possible hint
  const renderWord = (word: string, index: number) => {
    if (!story) return word + ' ';
    
    // Nettoyer le mot des caractères de ponctuation pour la comparaison
    const cleanWord = word.toLowerCase().replace(/[^a-zA-ZÀ-ÿ]/g, '');
    
    // Correspondance exacte uniquement (pas de includes partiel)
    const hasHint = story.hints.some(h => {
      const cleanHint = h.word.toLowerCase().replace(/[^a-zA-ZÀ-ÿ]/g, '');
      return cleanWord === cleanHint;
    });

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
          {lisaMessage || tStory('preparing')}
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
      {/* Top-right buttons: Change story & Settings */}
      <div className="fixed top-4 right-4 flex items-center gap-2 z-30">
        {/* Change story button */}
        <button
          onClick={handleNextStory}
          disabled={generateStory.isPending}
          className="w-10 h-10 rounded-full bg-white/80 hover:bg-white shadow-sm hover:shadow-md flex items-center justify-center transition-all opacity-60 hover:opacity-100 backdrop-blur-sm disabled:opacity-40"
          aria-label={tStory('changeStory')}
          title={tStory('changeStory')}
        >
          {generateStory.isPending ? (
            <Loader2 size={18} className="text-gray-600 animate-spin" />
          ) : (
            <Shuffle size={18} className="text-gray-600" />
          )}
        </button>

        {/* Settings button */}
        <button
          onClick={() => setShowSettings(true)}
          className="w-10 h-10 rounded-full bg-white/80 hover:bg-white shadow-sm hover:shadow-md flex items-center justify-center transition-all opacity-60 hover:opacity-100 backdrop-blur-sm"
          aria-label={tSettings('title')}
        >
          <Settings size={18} className="text-gray-600" />
        </button>
      </div>

      {/* Settings dialog */}
      <SettingsDialog 
        isOpen={showSettings} 
        onClose={(preferencesChanged) => {
          setShowSettings(false);
          // Si les préférences ont changé, générer une nouvelle histoire
          if (preferencesChanged && story) {
            handleNextStory();
          }
        }} 
      />

      <div className="w-full max-w-2xl mx-auto flex flex-col flex-1">
        {/* Header - compact et fixe */}
        <div className="text-center py-6 shrink-0">
          <div className="inline-flex items-center gap-2 text-sm text-gray-500 mb-4">
            <Sparkles size={14} className="text-purple-500" />
            <span className="font-medium">Lisa</span>
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
                {tStory('navigationHint')}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main content area - hauteur fixe pour éviter les sauts */}
        <div className="relative flex-1 flex min-h-[350px] sm:min-h-[400px]">
          {/* Left click zone */}
          {!isQuestion && !isCompleted && !showFeedbackStep && currentIndex > 0 && selectedAnswer === null && (
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
          {!isQuestion && !isCompleted && !showFeedbackStep && currentIndex < story.content.length - 1 && selectedAnswer === null && (
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
                {currentItem && currentItem.type === 'question' && !isCompleted && !showFeedbackStep && (
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

                {/* Feedback step - intégré comme une vraie étape de l'histoire */}
                {showFeedbackStep && !isCompleted && (
                  <motion.div
                    key="feedback-step"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="text-center space-y-8"
                  >
                    {/* Emoji animé */}
                    <motion.div
                      initial={{ scale: 0, rotate: -20 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: "spring", stiffness: 300, damping: 15, delay: 0.2 }}
                      className="text-6xl sm:text-7xl"
                    >
                      {showFeedbackStep.isCorrect ? '🎉' : '💪'}
                    </motion.div>

                    {/* Message encourageant */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="space-y-4"
                    >
                      <p className={`text-2xl sm:text-3xl font-medium ${
                        showFeedbackStep.isCorrect ? 'text-green-600' : 'text-amber-600'
                      }`}>
                        {showFeedbackStep.isCorrect 
                          ? tFeedback('correct')
                          : tFeedback('incorrect')
                        }
                      </p>
                      
                      <p className="text-lg sm:text-xl text-gray-700 leading-relaxed max-w-md mx-auto">
                        {showFeedbackStep.explanation}
                      </p>
                    </motion.div>

                    {/* Bouton pour continuer */}
                    <motion.button
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={handleContinueAfterFeedback}
                      className={`inline-flex items-center gap-2 px-8 py-4 rounded-xl text-base font-semibold transition-colors shadow-lg hover:shadow-xl ${
                        showFeedbackStep.isCorrect 
                          ? 'bg-green-500 hover:bg-green-600 text-white' 
                          : 'bg-amber-500 hover:bg-amber-600 text-white'
                      }`}
                    >
                      {tCommon('continue')}
                      <ChevronRight size={20} />
                    </motion.button>
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
                        ? tFeedback('amazingWork')
                        : currentScore.total > 0 && currentScore.correct / currentScore.total >= 0.5
                        ? tFeedback('greatEffort')
                        : tFeedback('keepPracticing')}
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
                          🔥 {progress.currentStreak} {tCommon('days')}
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
                          {tCommon('loading')}
                        </>
                      ) : (
                        <>
                          <RefreshCw size={18} />
                          {tStory('nextStory')}
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
                    {tCommon('close')}
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Spacer pour le footer fixe */}
        {!isCompleted && !showFeedbackStep && (
          <div className="h-32 sm:h-36 shrink-0" />
        )}
      </div>

      {/* Footer fixe - Navigation controls */}
      {!isCompleted && !showFeedbackStep && currentIndex < story.content.length && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="fixed bottom-0 left-0 right-0 z-30 bg-gradient-to-t from-white via-white to-white/80 backdrop-blur-sm border-t border-gray-100"
        >
          <div className="w-full max-w-2xl mx-auto px-4 py-4">
            {/* Progress indicator */}
            <div className="flex justify-center gap-2 mb-4">
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

            {/* Navigation buttons */}
            <div className={`flex items-center justify-center gap-4 transition-opacity ${
              selectedAnswer !== null ? 'opacity-40 pointer-events-none' : 'opacity-100'
            }`}>
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

              {/* Pause button with circular progress indicator */}
              <div className="relative w-14 h-14">
                {/* Circular progress ring */}
                {!isPaused && selectedAnswer === null && story.content[currentIndex]?.type === 'text' && (
                  <svg 
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[68px] h-[68px] pointer-events-none"
                    viewBox="0 0 68 68"
                  >
                    {/* Background ring */}
                    <circle
                      cx="34"
                      cy="34"
                      r="32"
                      fill="none"
                      stroke="rgba(168, 85, 247, 0.25)"
                      strokeWidth="3"
                    />
                    {/* Progress ring */}
                    <circle
                      cx="34"
                      cy="34"
                      r="32"
                      fill="none"
                      stroke={scrollProgress > 80 ? "#ef4444" : scrollProgress > 60 ? "#f59e0b" : "#a855f7"}
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeDasharray={2 * Math.PI * 32}
                      strokeDashoffset={2 * Math.PI * 32 * (1 - scrollProgress / 100)}
                      style={{ 
                        transition: 'stroke-dashoffset 0.1s linear, stroke 0.3s ease',
                        transform: 'rotate(-90deg)',
                        transformOrigin: 'center'
                      }}
                    />
                  </svg>
                )}
                {/* Pulsing glow when near end */}
                {!isPaused && scrollProgress > 80 && selectedAnswer === null && story.content[currentIndex]?.type === 'text' && (
                  <motion.div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[72px] h-[72px] rounded-full bg-red-400/30 pointer-events-none"
                    animate={{ 
                      scale: [1, 1.15, 1],
                      opacity: [0.4, 0.7, 0.4]
                    }}
                    transition={{ 
                      duration: 0.5,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                )}
                <motion.button
                  onClick={togglePause}
                  disabled={selectedAnswer !== null}
                  whileHover={{ scale: selectedAnswer === null ? 1.05 : 1 }}
                  whileTap={{ scale: selectedAnswer === null ? 0.95 : 1 }}
                  className={`absolute inset-0 rounded-full flex items-center justify-center transition-all ${
                    selectedAnswer === null 
                      ? 'bg-purple-500 hover:bg-purple-600 text-white shadow-lg hover:shadow-xl' 
                      : 'bg-purple-300 text-white shadow-md cursor-not-allowed'
                  }`}
                >
                  {isPaused ? <Play size={24} /> : <Pause size={24} />}
                </motion.button>
              </div>

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
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
