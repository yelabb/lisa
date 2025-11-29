'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Volume2, VolumeX, Loader2 } from 'lucide-react';
import { LisaCompanion, LisaLoading } from '@/components/lisa';
import { useUserProfile } from '@/store/user-profile';
import { useGenerateStory } from '@/lib/hooks/use-stories';
import { useGenerateQuestions } from '@/lib/hooks/use-questions';
import { GeneratedQuestion } from '@/lib/services/question-generator';
import { toast } from 'sonner';

type Phase = 'loading' | 'reading' | 'generating-questions' | 'questions' | 'complete';

export default function ReadingSessionPage() {
  const router = useRouter();
  const profile = useUserProfile((state) => state.profile);
  const recordSession = useUserProfile((state) => state.recordSessionResult);

  const [phase, setPhase] = useState<Phase>('loading');
  const [story, setStory] = useState<any>(null);
  const [questions, setQuestions] = useState<GeneratedQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [showResult, setShowResult] = useState(false);

  const { mutate: generateStory, isPending: isGeneratingStory } = useGenerateStory();
  const { mutate: generateQuestions, isPending: isGeneratingQuestions } = useGenerateQuestions();

  useEffect(() => {
    // Check if we have a new story ID from generation
    const newStoryId = sessionStorage.getItem('newStoryId');
    
    if (newStoryId) {
      // Load the story from the API
      fetch(`/api/stories/generate?id=${newStoryId}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setStory(data.story);
            setPhase('reading');
            sessionStorage.removeItem('newStoryId');
          }
        })
        .catch(() => {
          toast.error('Failed to load story');
          router.push('/stories');
        });
    } else if (profile) {
      // Generate a new story
      generateNewStory();
    }
  }, [profile]);

  const generateNewStory = () => {
    if (!profile) return;

    const randomTheme = profile.favoriteThemes?.[Math.floor(Math.random() * (profile.favoriteThemes?.length || 0))] || 'Adventure';

    generateStory(
      {
        theme: randomTheme,
        interests: profile.interests || [],
        readingLevel: profile.readingLevel,
        age: profile.age || 8,
        difficultyMultiplier: profile.difficultyMultiplier,
      },
      {
        onSuccess: (data) => {
          setStory(data.story);
          setPhase('reading');
        },
        onError: () => {
          toast.error('Failed to generate story. Redirecting...');
          router.push('/stories');
        },
      }
    );
  };

  const handleFinishReading = () => {
    if (!story || !profile) return;

    setPhase('generating-questions');

    generateQuestions(
      {
        storyId: story.id,
        storyTitle: story.title,
        storyContent: story.content,
        readingLevel: profile.readingLevel,
        age: profile.age || 8,
        questionCount: 4,
      },
      {
        onSuccess: (data) => {
          setQuestions(data.questions);
          setPhase('questions');
          toast.success('Great reading! Now let\'s answer some questions! 🎯');
        },
        onError: () => {
          toast.error('Failed to generate questions');
          router.push('/stories');
        },
      }
    );
  };

  const handleAnswerSelect = (answerIndex: number) => {
    if (!questions[currentQuestionIndex]) return;

    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = currentQuestion.options?.[answerIndex]?.isCorrect || false;
    
    setAnswers([...answers, answerIndex]);
    setShowResult(true);

    // Record the answer
    if (story) {
      recordSession(story.id, [
        {
          questionId: `q${currentQuestionIndex}`,
          isCorrect,
          timeTaken: 5,
        },
      ]);
    }

    // Show feedback then move to next question
    setTimeout(() => {
      setShowResult(false);
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else {
        setPhase('complete');
      }
    }, 2000);
  };

  const calculateScore = () => {
    let correct = 0;
    answers.forEach((answer, index) => {
      if (questions[index]?.options?.[answer]?.isCorrect) {
        correct++;
      }
    });
    return { correct, total: questions.length };
  };

  if (!profile) {
    router.push('/');
    return null;
  }

  // Loading state
  if (phase === 'loading' || isGeneratingStory) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100 flex items-center justify-center">
        <Card className="p-12 max-w-md text-center">
          <LisaLoading message="Creating your perfect story..." />
        </Card>
      </div>
    );
  }

  // Generating questions state
  if (phase === 'generating-questions' || isGeneratingQuestions) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100 flex items-center justify-center">
        <Card className="p-12 max-w-md text-center">
          <LisaLoading message="Preparing your questions..." />
        </Card>
      </div>
    );
  }

  if (!story) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100 flex items-center justify-center">
        <Card className="p-8 text-center">
          <p className="text-gray-600 mb-4">No story found</p>
          <Button onClick={() => router.push('/stories')}>Go to Stories</Button>
        </Card>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length;
  const progress = phase === 'reading' 
    ? 0 
    : ((answers.length) / totalQuestions) * 100;

  // Completion screen
  if (phase === 'complete') {
    const { correct, total } = calculateScore();
    const percentage = Math.round((correct / total) * 100);

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100 p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl mx-auto"
        >
          <Card className="p-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', duration: 0.6 }}
              className="text-8xl mb-6"
            >
              {percentage >= 80 ? '🎉' : percentage >= 60 ? '🌟' : '💪'}
            </motion.div>

            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              {percentage >= 80 ? 'Amazing Job!' : percentage >= 60 ? 'Great Work!' : 'Good Effort!'}
            </h1>

            <div className="text-6xl font-bold text-purple-600 mb-2">
              {correct}/{total}
            </div>
            <p className="text-xl text-gray-600 mb-8">
              {percentage}% Correct!
            </p>

            <div className="space-y-4 mb-8">
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border-2 border-green-200">
                <span className="font-semibold text-gray-800">✅ Correct Answers</span>
                <span className="text-2xl font-bold text-green-600">{correct}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border-2 border-red-200">
                <span className="font-semibold text-gray-800">❌ Incorrect Answers</span>
                <span className="text-2xl font-bold text-red-600">{total - correct}</span>
              </div>
            </div>

            <LisaCompanion
              mood={percentage >= 80 ? 'excited' : percentage >= 60 ? 'happy' : 'encouraging'}
              message={
                percentage >= 80
                  ? "You're a reading superstar! Let's read another story!"
                  : percentage >= 60
                  ? "Great job! Practice makes perfect!"
                  : "Don't give up! Every story makes you stronger!"
              }
              size="lg"
            />

            <div className="flex gap-4 mt-8">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => router.push('/stories')}
              >
                More Stories
              </Button>
              <Button
                className="flex-1"
                onClick={() => router.push('/dashboard')}
              >
                Go Home
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-sm border-b border-gray-200 p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/stories')}
          >
            <ArrowLeft className="mr-2" size={16} />
            Back
          </Button>

          <div className="flex-1 mx-6">
            <Progress value={progress} className="h-2" />
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setAudioEnabled(!audioEnabled)}
          >
            {audioEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
          </Button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6 pt-8">
        <AnimatePresence mode="wait">
          {phase === 'reading' && (
            <motion.div
              key="reading"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="p-8">
                <div className="text-center mb-8">
                  <div className="text-6xl mb-4">{story.emoji}</div>
                  <h1 className="text-4xl font-bold text-gray-800 mb-2">
                    {story.title}
                  </h1>
                  <div className="flex items-center justify-center gap-4 text-sm text-gray-600">
                    <span>📖 {story.wordCount} words</span>
                    <span>⏱️ {story.estimatedTime} min read</span>
                  </div>
                </div>

                <div className="prose prose-lg max-w-none mb-8">
                  {story.content.split('\n\n').map((paragraph: string, i: number) => (
                    <p key={i} className="text-xl leading-relaxed text-gray-800 mb-6">
                      {paragraph}
                    </p>
                  ))}
                </div>

                <div className="text-center">
                  <Button
                    size="lg"
                    onClick={handleFinishReading}
                    className="text-lg px-8"
                  >
                    I Finished Reading! 📚
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}

          {phase === 'questions' && currentQuestion && (
            <motion.div
              key="questions"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card className="p-8">
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-semibold text-gray-600">
                      Question {currentQuestionIndex + 1} of {totalQuestions}
                    </span>
                    <span className="text-sm font-semibold text-purple-600">
                      {answers.length} answered
                    </span>
                  </div>
                </div>

                <h2 className="text-2xl font-bold text-gray-800 mb-8">
                  {currentQuestion.question}
                </h2>

                <div className="space-y-4 mb-8">
                  {currentQuestion.options?.map((option, index) => {
                    const isCorrect = option.isCorrect;
                    const wasSelected = answers[currentQuestionIndex] === index;

                    return (
                      <motion.button
                        key={index}
                        whileHover={{ scale: showResult ? 1 : 1.02 }}
                        whileTap={{ scale: showResult ? 1 : 0.98 }}
                        onClick={() => !showResult && handleAnswerSelect(index)}
                        disabled={showResult}
                        className={`w-full p-6 rounded-xl border-2 text-left font-semibold text-lg transition-all ${
                          showResult
                            ? wasSelected && isCorrect
                              ? 'bg-green-50 border-green-500 text-green-800'
                              : wasSelected && !isCorrect
                              ? 'bg-red-50 border-red-500 text-red-800'
                              : isCorrect
                              ? 'bg-green-50 border-green-300 text-green-800'
                              : 'bg-gray-50 border-gray-300 text-gray-500'
                            : 'bg-white border-gray-300 hover:border-purple-400 hover:bg-purple-50'
                        }`}
                      >
                        <span className="flex items-center gap-4">
                          <span className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold">
                            {String.fromCharCode(65 + index)}
                          </span>
                          {option.text}
                          {showResult && isCorrect && <span className="ml-auto">✅</span>}
                          {showResult && wasSelected && !isCorrect && <span className="ml-auto">❌</span>}
                        </span>
                      </motion.button>
                    );
                  })}
                </div>

                {showResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <LisaCompanion
                      mood={currentQuestion.options?.[answers[currentQuestionIndex]]?.isCorrect ? 'happy' : 'encouraging'}
                      message={
                        currentQuestion.options?.[answers[currentQuestionIndex]]?.isCorrect
                          ? "That's right! You're doing great! 🎉"
                          : "Not quite, but that's okay! Keep trying! 💪"
                      }
                    />
                  </motion.div>
                )}
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
