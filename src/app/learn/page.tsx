'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Pause, Play, ChevronLeft, ChevronRight, Loader2, RefreshCw, Settings, Check, X, Shuffle, BookOpen } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

import { useUserProgressStore, useReadingSessionStore, useReadingSettingsStore, getThemeStyles, getFontClass } from '@/stores';
import { useGenerateStory, useAnswerQuestion, useCompleteStory, useStartSession } from '@/hooks';
import { WelcomeScreen, LanguageSelect, ThemeSelect, ReadyScreen } from '@/components/onboarding';
import { SettingsDialog } from '@/components/settings';
import { ReadingControls } from '@/components/reading';
import type { StoryQuestion } from '@/types';

// Types for dynamic word explanations
interface FunWordExplanation {
  word: string;
  definition: string;
  funFact: string;
  emoji: string;
}

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

  // Reading settings store
  const { 
    theme: readingTheme, 
    fontFamily, 
    fontSize, 
    lineHeight,
    readingWidth,
    autoProgress,
    readingSpeed,
  } = useReadingSettingsStore();

  // Get theme styles
  const themeStyles = useMemo(() => getThemeStyles(readingTheme), [readingTheme]);
  const fontClass = useMemo(() => getFontClass(fontFamily), [fontFamily]);

  // Onboarding state
  const [onboardingStep, setOnboardingStep] = useState<OnboardingStep>('welcome');
  const [selectedThemes, setSelectedThemes] = useState<string[]>([]);

  // API hooks
  const generateStory = useGenerateStory();
  const answerQuestionMutation = useAnswerQuestion();
  const completeStoryMutation = useCompleteStory();
  const startSessionMutation = useStartSession();

  // Local state
  const [showHint, setShowHint] = useState<FunWordExplanation | null>(null);
  const [isLoadingHint, setIsLoadingHint] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showNavigationHint, setShowNavigationHint] = useState(true);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showReadingControls, setShowReadingControls] = useState(false);
  // Cache for word explanations to avoid re-fetching
  const wordExplanationsCache = useRef<Map<string, FunWordExplanation>>(new Map());
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

  // Calculate reading time based on word count and user's reading speed
  const calculateReadingTime = useCallback((text: string) => {
    const wordCount = text.split(/\s+/).filter(word => word.length > 0).length;
    // Utiliser la vitesse de lecture configurée par l'utilisateur
    const msPerWord = 60000 / readingSpeed; // millisecondes par mot
    const baseTime = wordCount * msPerWord;
    return Math.max(3000, Math.min(20000, baseTime));
  }, [readingSpeed]);

  // Refs to avoid effect re-running
  const nextItemRef = useRef(nextItem);
  const handleStoryCompleteRef = useRef(handleStoryComplete);
  useEffect(() => {
    nextItemRef.current = nextItem;
    handleStoryCompleteRef.current = handleStoryComplete;
  }, [nextItem, handleStoryComplete]);



  // Auto-progression timer with progress tracking
  useEffect(() => {
    if (!story || isPaused || isCompleted || !autoProgress) {
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
  }, [currentIndex, isPaused, story, selectedAnswer, isCompleted, calculateReadingTime, autoProgress]);

  // Hide navigation hint after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => setShowNavigationHint(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  // Handle word click for hints
  // Handle word click for hints - now works for ALL words
  const handleWordClick = async (word: string, currentText: string) => {
    if (!story || isLoadingHint) return;
    
    // Clean the word for cache key
    const cleanWord = word.toLowerCase().replace(/[^a-zA-ZÀ-ÿ]/g, '');
    if (cleanWord.length < 2) return; // Skip very short words like "a", "à"
    
    // Check cache first
    const cachedExplanation = wordExplanationsCache.current.get(cleanWord);
    if (cachedExplanation) {
      setShowHint(cachedExplanation);
      return;
    }
    
    // Show loading state immediately with the word
    setIsLoadingHint(true);
    setShowHint({
      word: word.replace(/[^a-zA-ZÀ-ÿ'-]/g, ''),
      definition: '',
      funFact: '',
      emoji: '🤔',
    });
    
    try {
      const response = await fetch('/api/words/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          word: word.replace(/[^a-zA-ZÀ-ÿ'-]/g, ''),
          context: currentText,
          language: language || 'fr',
        }),
      });
      
      if (!response.ok) throw new Error('Failed to fetch explanation');
      
      const explanation: FunWordExplanation = await response.json();
      
      // Cache the result
      wordExplanationsCache.current.set(cleanWord, explanation);
      
      setShowHint(explanation);
    } catch (error) {
      console.error('Error fetching word explanation:', error);
      // Fallback explanation
      const fallback: FunWordExplanation = {
        word: word.replace(/[^a-zA-ZÀ-ÿ'-]/g, ''),
        definition: language === 'fr' 
          ? `C'est un mot super intéressant ! 📚`
          : `This is a super interesting word! 📚`,
        funFact: language === 'fr'
          ? `Tu es curieux, c'est génial ! Continue à explorer les mots.`
          : `You're curious, that's awesome! Keep exploring words.`,
        emoji: '✨',
      };
      wordExplanationsCache.current.set(cleanWord, fallback);
      setShowHint(fallback);
    } finally {
      setIsLoadingHint(false);
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

  // Render word - ALL words are now clickable
  const renderWord = (word: string, index: number, fullText: string) => {
    if (!story) return word + ' ';
    
    // Clean the word for checking
    const cleanWord = word.toLowerCase().replace(/[^a-zA-ZÀ-ÿ]/g, '');
    
    // Skip very short words (less than 2 chars after cleaning) or just punctuation
    if (cleanWord.length < 2) {
      return <span key={index} className="inline">{word}{' '}</span>;
    }

    // Check if this word has a pre-defined hint (vocabulary word)
    const hasVocabularyHint = story.hints.some(h => {
      const cleanHint = h.word.toLowerCase().replace(/[^a-zA-ZÀ-ÿ]/g, '');
      return cleanWord === cleanHint;
    });

    // Check if this word is currently being explained
    const isCurrentWord = showHint?.word.toLowerCase().replace(/[^a-zA-ZÀ-ÿ'-]/g, '') === cleanWord;

    // Couleurs adaptées au thème
    const getWordStyles = () => {
      if (isCurrentWord) {
        return readingTheme === 'dark' 
          ? 'bg-purple-800/50 text-purple-200 scale-105'
          : 'bg-purple-200 text-purple-800 scale-105';
      }
      if (hasVocabularyHint) {
        return readingTheme === 'dark'
          ? 'border-b-2 border-dashed border-purple-400/60 hover:border-purple-300 hover:bg-purple-900/30 hover:text-purple-200'
          : 'border-b-2 border-dashed border-purple-400 hover:border-purple-600 hover:bg-purple-100 hover:text-purple-700';
      }
      return readingTheme === 'dark'
        ? 'hover:bg-white/5 hover:text-purple-300 active:bg-white/10'
        : readingTheme === 'sepia'
        ? 'hover:bg-amber-100/50 hover:text-amber-800 active:bg-amber-100'
        : 'hover:bg-purple-50 hover:text-purple-600 active:bg-purple-100';
    };

    // All words are clickable, but vocabulary words have special styling
    return (
      <motion.span
        key={index}
        onClick={(e) => {
          e.stopPropagation();
          handleWordClick(word, fullText);
        }}
        className={`cursor-pointer transition-all duration-200 rounded-md px-0.5 py-0.5 inline-block select-none ${getWordStyles()}`}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        layout
      >
        {word}{' '}
      </motion.span>
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

  // Calcul du pourcentage de progression dans l'histoire
  const storyProgress = story ? ((currentIndex + 1) / story.content.length) * 100 : 0;

  // Loading state
  if (generateStory.isPending || !story) {
    return (
      <div className={`min-h-screen ${themeStyles.backgroundGradient} flex flex-col items-center justify-center p-4`}>
        <motion.div
          className="relative"
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        >
          <Sparkles size={56} className="text-purple-500" />
        </motion.div>
        <motion.p 
          className={`mt-6 font-medium text-lg text-center ${themeStyles.textSecondary}`}
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
    <>
    <div className={`min-h-screen ${themeStyles.backgroundGradient} flex flex-col transition-colors duration-500`}>
      {/* Barre de progression linéaire en haut - style Kobo */}
      <div className={`fixed top-0 left-0 right-0 z-40 h-0.5 ${themeStyles.background}`}>
        <motion.div 
          className="h-full bg-gradient-to-r from-purple-400 to-purple-600"
          initial={{ width: 0 }}
          animate={{ width: `${storyProgress}%` }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        />
      </div>

      {/* Top bar - Très minimaliste comme Kobo */}
      <div className="fixed top-2 left-0 right-0 z-30 px-4 py-1">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          {/* Progress indicator discret */}
          <div className={`text-xs font-medium ${themeStyles.textMuted} bg-black/10 backdrop-blur-sm px-2 py-1 rounded-full`}>
            {currentIndex + 1} / {story.content.length}
          </div>
          
          {/* Right buttons */}
          <div className="flex items-center gap-1">
            {/* Reading controls button */}
            <button
              onClick={() => setShowReadingControls(true)}
              className={`w-8 h-8 rounded-full ${themeStyles.overlayBg} backdrop-blur-sm flex items-center justify-center 
                transition-all opacity-60 hover:opacity-100 ${themeStyles.hoverBg}`}
              aria-label="Confort de lecture"
              title="Confort de lecture"
            >
              <BookOpen size={14} className={themeStyles.textSecondary} />
            </button>

            {/* Change story button */}
            <button
              onClick={handleNextStory}
              disabled={generateStory.isPending}
              className={`w-8 h-8 rounded-full ${themeStyles.overlayBg} backdrop-blur-sm flex items-center justify-center 
                transition-all opacity-60 hover:opacity-100 disabled:opacity-40 ${themeStyles.hoverBg}`}
              aria-label={tStory('changeStory')}
              title={tStory('changeStory')}
            >
              {generateStory.isPending ? (
                <Loader2 size={14} className={`${themeStyles.textSecondary} animate-spin`} />
              ) : (
                <Shuffle size={14} className={themeStyles.textSecondary} />
              )}
            </button>

            {/* Settings button */}
            <button
              onClick={() => setShowSettings(true)}
              className={`w-8 h-8 rounded-full ${themeStyles.overlayBg} backdrop-blur-sm flex items-center justify-center 
                transition-all opacity-60 hover:opacity-100 ${themeStyles.hoverBg}`}
              aria-label={tSettings('title')}
            >
              <Settings size={14} className={themeStyles.textSecondary} />
            </button>
          </div>
        </div>
      </div>

      {/* Reading controls panel */}
      <ReadingControls 
        isOpen={showReadingControls} 
        onClose={() => setShowReadingControls(false)}
        language={language || 'fr'}
      />

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

      {/* Zone de lecture principale - Style e-reader */}
      <div 
        className="flex-1 flex flex-col items-center justify-center px-4 sm:px-8 pt-12 pb-20"
        style={{ maxWidth: `${readingWidth + 100}px`, margin: '0 auto', width: '100%' }}
      >
        {/* Header du livre */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full text-center mb-8 sm:mb-12"
        >
          <h1 className={`text-lg sm:text-xl font-medium tracking-wide ${themeStyles.text} ${fontClass}`}>
            {story.title}
          </h1>
          <div className={`mt-3 w-12 h-px mx-auto ${readingTheme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'}`} />
        </motion.div>

        {/* Navigation hint - très discret */}
        <AnimatePresence>
          {showNavigationHint && !isQuestion && !isCompleted && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center mb-6"
            >
              <p className={`text-xs ${themeStyles.textMuted} px-3 py-1.5`}>
                {tStory('navigationHint')}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main content area - Zone de lecture avec marges généreuses */}
        <div 
          className="relative flex-1 flex w-full"
          style={{ maxWidth: `${readingWidth}px` }}
        >
          {/* Left click zone - Full left half like Kobo */}
          {!isQuestion && !isCompleted && !showFeedbackStep && currentIndex > 0 && selectedAnswer === null && (
            <button
              onClick={previousItem}
              className="absolute left-0 top-0 bottom-0 w-1/2 cursor-pointer z-10"
              aria-label="Previous page"
            />
          )}

          {/* Right click zone - Full right half like Kobo */}
          {!isQuestion && !isCompleted && !showFeedbackStep && currentIndex < story.content.length - 1 && selectedAnswer === null && (
            <button
              onClick={nextItem}
              className="absolute right-0 top-0 bottom-0 w-1/2 cursor-pointer z-10"
              aria-label="Next page"
            />
          )}

          {/* Content */}
          <div className="flex-1 relative z-20 pointer-events-none flex items-center justify-center">
            <div className="pointer-events-auto w-full">
              <AnimatePresence mode="wait">
                {/* Text paragraph - Style livre/e-reader */}
                {currentItem && currentItem.type === 'text' && !isCompleted && (
                  <motion.div
                    key={`text-${currentIndex}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                    className="text-center"
                  >
                    {/* Word click hint - subtle and auto-hide */}
                    {currentIndex === 0 && (
                      <motion.div 
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="mb-8"
                      >
                        <motion.span 
                          className={`inline-flex items-center gap-2 text-xs px-4 py-2 rounded-full 
                            ${readingTheme === 'dark' 
                              ? 'bg-purple-900/30 text-purple-300 border border-purple-700/30' 
                              : readingTheme === 'sepia'
                              ? 'bg-amber-100 text-amber-700 border border-amber-200'
                              : 'bg-purple-50 text-purple-600 border border-purple-100'
                            }`}
                          animate={{ 
                            scale: [1, 1.02, 1],
                          }}
                          transition={{ 
                            duration: 2, 
                            repeat: 2,
                            repeatType: "reverse" 
                          }}
                        >
                          <motion.span
                            animate={{ y: [0, -3, 0] }}
                            transition={{ duration: 0.8, repeat: Infinity }}
                          >
                            👆
                          </motion.span>
                          <span>{tCommon('tapWord')}</span>
                        </motion.span>
                      </motion.div>
                    )}
                    <p 
                      className={`${themeStyles.text} ${fontClass} text-center leading-relaxed tracking-wide`}
                      style={{ 
                        fontSize: `${fontSize}rem`, 
                        lineHeight: lineHeight,
                        wordSpacing: '0.1em',
                      }}
                    >
                      {currentItem.text.split(' ').map((word, i) => renderWord(word, i, currentItem.text))}
                    </p>
                  </motion.div>
                )}

                {/* Question - Style plus sobre */}
                {currentItem && currentItem.type === 'question' && !isCompleted && !showFeedbackStep && (
                  <motion.div
                    key={`question-${currentIndex}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-8"
                  >
                    <p 
                      className={`${themeStyles.text} ${fontClass} text-center`}
                      style={{ 
                        fontSize: `${fontSize * 0.9}rem`, 
                        lineHeight: lineHeight * 0.95,
                      }}
                    >
                      {(currentItem as StoryQuestion).text}
                    </p>

                    <div className="space-y-3 max-w-lg mx-auto">
                      {(currentItem as StoryQuestion).options.map((option, index) => {
                        const question = currentItem as StoryQuestion;
                        let borderStyle = `border ${themeStyles.border}`;
                        let bgStyle = themeStyles.cardBg;
                        let textStyle = themeStyles.text;
                        let icon = null;

                        if (selectedAnswer !== null) {
                          if (index === question.correctIndex) {
                            bgStyle = readingTheme === 'dark' ? 'bg-green-900/30' : 'bg-green-50';
                            borderStyle = 'border-2 border-green-400';
                            textStyle = readingTheme === 'dark' ? 'text-green-300' : 'text-green-800';
                            icon = <Check size={18} className={readingTheme === 'dark' ? 'text-green-400' : 'text-green-600'} />;
                          } else if (index === selectedAnswer) {
                            bgStyle = readingTheme === 'dark' ? 'bg-red-900/30' : 'bg-red-50';
                            borderStyle = 'border-2 border-red-400';
                            textStyle = readingTheme === 'dark' ? 'text-red-300' : 'text-red-800';
                            icon = <X size={18} className={readingTheme === 'dark' ? 'text-red-400' : 'text-red-600'} />;
                          } else {
                            bgStyle = readingTheme === 'dark' ? 'bg-gray-800/30' : 'bg-gray-50';
                            textStyle = themeStyles.textMuted;
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
                            className={`w-full p-4 sm:p-5 rounded-2xl ${borderStyle} ${bgStyle} ${textStyle} 
                              text-left font-medium transition-all disabled:cursor-default flex items-center justify-between gap-3
                              ${selectedAnswer === null ? themeStyles.hoverBg : ''}`}
                            style={{ 
                              fontSize: `${fontSize * 0.85}rem`,
                              fontFamily: fontFamily === 'system' ? 'system-ui, sans-serif' : undefined,
                            }}
                          >
                            <span className={fontClass}>{option}</span>
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
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    className="text-center space-y-8"
                  >
                    {/* Emoji animé */}
                    <motion.div
                      initial={{ scale: 0, rotate: -20 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: "spring", stiffness: 300, damping: 15, delay: 0.2 }}
                      className="text-5xl sm:text-6xl"
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
                      <p className={`text-xl sm:text-2xl font-medium ${
                        showFeedbackStep.isCorrect 
                          ? readingTheme === 'dark' ? 'text-green-400' : 'text-green-600'
                          : readingTheme === 'dark' ? 'text-amber-400' : 'text-amber-600'
                      }`}>
                        {showFeedbackStep.isCorrect 
                          ? tFeedback('correct')
                          : tFeedback('incorrect')
                        }
                      </p>
                      
                      <p 
                        className={`${themeStyles.textSecondary} max-w-md mx-auto ${fontClass}`}
                        style={{ 
                          fontSize: `${fontSize * 0.85}rem`,
                          lineHeight: lineHeight * 0.95,
                        }}
                      >
                        {showFeedbackStep.explanation}
                      </p>
                    </motion.div>

                    {/* Bouton pour continuer */}
                    <motion.button
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleContinueAfterFeedback}
                      className={`inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-medium transition-colors ${
                        showFeedbackStep.isCorrect 
                          ? 'bg-green-500 hover:bg-green-600 text-white' 
                          : 'bg-amber-500 hover:bg-amber-600 text-white'
                      }`}
                    >
                      {tCommon('continue')}
                      <ChevronRight size={18} />
                    </motion.button>
                  </motion.div>
                )}

                {/* Story complete */}
                {isCompleted && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center space-y-6"
                  >
                    {/* Animated emoji celebration */}
                    <div className="relative">
                      <motion.div 
                        className="text-5xl sm:text-6xl"
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
                      className={`text-xl sm:text-2xl font-medium ${themeStyles.text} ${fontClass}`}
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
                        className={`px-4 py-2 rounded-full font-semibold text-base flex items-center gap-2
                          ${readingTheme === 'dark' 
                            ? 'bg-purple-900/40 text-purple-300' 
                            : 'bg-purple-100 text-purple-700'
                          }`}
                        whileHover={{ scale: 1.05 }}
                      >
                        <Check size={18} />
                        {currentScore.correct}/{currentScore.total}
                      </motion.span>
                      {progress && progress.currentStreak > 0 && (
                        <motion.span 
                          className={`px-4 py-2 rounded-full font-semibold text-base
                            ${readingTheme === 'dark' 
                              ? 'bg-orange-900/40 text-orange-300' 
                              : 'bg-orange-100 text-orange-700'
                            }`}
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
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleNextStory}
                      disabled={generateStory.isPending}
                      className="inline-flex items-center gap-2 px-8 py-4 bg-purple-600 text-white rounded-2xl font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 mt-2"
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

        {/* Hint tooltip - Fun word explanation modal */}
        <AnimatePresence>
          {showHint && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => !isLoadingHint && setShowHint(null)}
                className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
              />
              <motion.div
                initial={{ opacity: 0, y: 50, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 50, scale: 0.95 }}
                transition={{ type: "spring", damping: 30, stiffness: 300 }}
                className={`fixed bottom-8 left-1/2 -translate-x-1/2 max-w-md w-[calc(100%-2rem)] 
                  ${themeStyles.cardBg} rounded-3xl shadow-2xl overflow-hidden z-50`}
              >
                {/* Header with emoji */}
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-4">
                  <div className="flex items-center justify-center gap-3">
                    <motion.span 
                      className="text-4xl"
                      animate={isLoadingHint ? { rotate: [0, 10, -10, 0] } : {}}
                      transition={{ repeat: isLoadingHint ? Infinity : 0, duration: 0.5 }}
                    >
                      {showHint.emoji}
                    </motion.span>
                    <h3 className={`text-2xl font-bold text-white ${fontClass}`}>
                      {showHint.word}
                    </h3>
                  </div>
                </div>
                
                {/* Content */}
                <div className="p-6 space-y-4">
                  {isLoadingHint ? (
                    <div className="flex flex-col items-center py-4">
                      <motion.div
                        className="flex gap-1"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        {[0, 1, 2].map((i) => (
                          <motion.div
                            key={i}
                            className="w-3 h-3 bg-purple-400 rounded-full"
                            animate={{ y: [0, -10, 0] }}
                            transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.15 }}
                          />
                        ))}
                      </motion.div>
                      <p className={`mt-3 text-sm ${themeStyles.textMuted}`}>{tCommon('loadingExplanation')}</p>
                    </div>
                  ) : (
                    <>
                      {/* Definition */}
                      <div>
                        <p className={`text-lg leading-relaxed ${themeStyles.text} ${fontClass}`}>
                          {showHint.definition}
                        </p>
                      </div>
                      
                      {/* Fun Fact */}
                      {showHint.funFact && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 }}
                          className={`rounded-2xl p-4 border ${
                            readingTheme === 'dark'
                              ? 'bg-amber-900/20 border-amber-700/30'
                              : 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200'
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            <span className="text-xl">💡</span>
                            <div>
                              <p className={`text-xs font-semibold mb-1 ${
                                readingTheme === 'dark' ? 'text-amber-400' : 'text-amber-700'
                              }`}>{tCommon('funFact')}</p>
                              <p className={`text-sm leading-relaxed ${
                                readingTheme === 'dark' ? 'text-amber-200' : 'text-amber-900'
                              } ${fontClass}`}>
                                {showHint.funFact}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </>
                  )}
                </div>

                {/* Close button */}
                {!isLoadingHint && (
                  <motion.button 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    onClick={() => setShowHint(null)}
                    className={`w-full py-4 transition-colors font-medium text-sm border-t 
                      ${themeStyles.border} ${themeStyles.hoverBg} ${themeStyles.textSecondary}`}
                  >
                    {tCommon('close')} ✨
                  </motion.button>
                )}
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>

    {/* Footer minimaliste - Navigation controls - VRAIMENT fixe, hors de tous les conteneurs */}
    {!isCompleted && !showFeedbackStep && story && currentIndex < story.content.length && (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className={`fixed bottom-0 left-0 right-0 z-50 ${themeStyles.overlayBg} backdrop-blur-sm border-t ${themeStyles.border}`}
      >
        <div className="w-full max-w-2xl mx-auto px-4 py-3">
          {/* Navigation buttons - Plus petits et plus discrets comme Kobo */}
          <div className={`flex items-center justify-center gap-3 transition-opacity ${
            selectedAnswer !== null ? 'opacity-40 pointer-events-none' : 'opacity-100'
          }`}>
            <motion.button
              onClick={previousItem}
              disabled={currentIndex === 0 || selectedAnswer !== null}
              whileHover={{ scale: currentIndex > 0 && selectedAnswer === null ? 1.05 : 1 }}
              whileTap={{ scale: currentIndex > 0 && selectedAnswer === null ? 0.95 : 1 }}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                currentIndex > 0 && selectedAnswer === null
                  ? `${themeStyles.cardBg} ${themeStyles.hoverBg} ${themeStyles.text} border ${themeStyles.border}`
                  : `${readingTheme === 'dark' ? 'bg-gray-800 text-gray-600' : 'bg-gray-100 text-gray-300'} cursor-not-allowed`
              }`}
              aria-label="Précédent"
            >
              <ChevronLeft size={20} strokeWidth={2} />
            </motion.button>

            {/* Pause button - Plus petit */}
            <motion.button
              onClick={togglePause}
              disabled={selectedAnswer !== null}
              whileHover={{ scale: selectedAnswer === null ? 1.05 : 1 }}
              whileTap={{ scale: selectedAnswer === null ? 0.95 : 1 }}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                selectedAnswer === null
                  ? 'bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white'
                  : 'bg-purple-300 text-white cursor-not-allowed'
              }`}
              aria-label={isPaused ? 'Lecture' : 'Pause'}
            >
              {isPaused ? <Play size={24} strokeWidth={2} fill="white" /> : <Pause size={24} strokeWidth={2} />}
            </motion.button>

            <motion.button
              onClick={nextItem}
              disabled={currentIndex >= story.content.length - 1 || selectedAnswer !== null}
              whileHover={{ scale: currentIndex < story.content.length - 1 && selectedAnswer === null ? 1.05 : 1 }}
              whileTap={{ scale: currentIndex < story.content.length - 1 && selectedAnswer === null ? 0.95 : 1 }}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                currentIndex < story.content.length - 1 && selectedAnswer === null
                  ? `${themeStyles.cardBg} ${themeStyles.hoverBg} ${themeStyles.text} border ${themeStyles.border}`
                  : `${readingTheme === 'dark' ? 'bg-gray-800 text-gray-600' : 'bg-gray-100 text-gray-300'} cursor-not-allowed`
              }`}
              aria-label="Suivant"
            >
              <ChevronRight size={20} strokeWidth={2} />
            </motion.button>
          </div>
        </div>
      </motion.div>
    )}
  </>
  );
}
