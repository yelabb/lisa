'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Volume2, VolumeX } from 'lucide-react';
import { LisaCompanion } from '@/components/lisa';
import { useUserProfile } from '@/store/user-profile';
import { toast } from 'sonner';

// Mock story data - replace with real data from database
const MOCK_STORY = {
  id: '1',
  title: 'The Brave Little Robot',
  content: `Once upon a time in a small workshop, there lived a tiny robot named Bolt. Bolt was smaller than all the other robots, but he had the biggest heart.

One day, the workshop caught fire! All the big robots were too scared to help, but brave little Bolt knew what to do. He rolled through the smoke and found the fire extinguisher.

With all his might, Bolt sprayed the foam and put out the fire. He saved the workshop! From that day on, everyone knew that being brave isn't about being big—it's about having courage.`,
  estimatedTime: 3,
  wordCount: 95,
  emoji: '🤖',
  questions: [
    {
      id: 'q1',
      type: 'multiple-choice',
      question: 'Where did Bolt live?',
      options: ['In a house', 'In a workshop', 'In a school', 'In a park'],
      correctAnswer: 1,
    },
    {
      id: 'q2',
      type: 'multiple-choice',
      question: 'What happened to the workshop?',
      options: ['It got flooded', 'It caught fire', 'It was closed', 'It moved away'],
      correctAnswer: 1,
    },
    {
      id: 'q3',
      type: 'multiple-choice',
      question: 'How did Bolt save the workshop?',
      options: ['He called for help', 'He ran away', 'He used a fire extinguisher', 'He hid'],
      correctAnswer: 2,
    },
    {
      id: 'q4',
      type: 'multiple-choice',
      question: 'What lesson does this story teach?',
      options: [
        'Big robots are the best',
        'Always be scared',
        'Courage matters more than size',
        'Never help others',
      ],
      correctAnswer: 2,
    },
  ],
};

type Phase = 'reading' | 'questions' | 'complete';

export default function ReadingSessionPage() {
  const router = useRouter();
  const profile = useUserProfile((state) => state.profile);
  const recordSession = useUserProfile((state) => state.recordSessionResult);

  const [phase, setPhase] = useState<Phase>('reading');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [showResult, setShowResult] = useState(false);

  if (!profile) {
    router.push('/');
    return null;
  }

  const currentQuestion = MOCK_STORY.questions[currentQuestionIndex];
  const totalQuestions = MOCK_STORY.questions.length;
  const progress = phase === 'reading' 
    ? 0 
    : ((answers.length) / totalQuestions) * 100;

  const handleFinishReading = () => {
    setPhase('questions');
    toast.success('Great reading! Now let\'s answer some questions! 🎯');
  };

  const handleAnswerSelect = (answerIndex: number) => {
    const isCorrect = answerIndex === currentQuestion.correctAnswer;
    setAnswers([...answers, answerIndex]);
    setShowResult(true);

    // Record the answer
    recordSession(MOCK_STORY.id, [
      {
        questionId: currentQuestion.id,
        isCorrect,
        timeTaken: 5, // Mock time
      },
    ]);

    // Show feedback then move to next question
    setTimeout(() => {
      setShowResult(false);
      if (currentQuestionIndex < totalQuestions - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else {
        setPhase('complete');
      }
    }, 2000);
  };

  const calculateScore = () => {
    let correct = 0;
    answers.forEach((answer, index) => {
      if (answer === MOCK_STORY.questions[index].correctAnswer) {
        correct++;
      }
    });
    return { correct, total: totalQuestions };
  };

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
                  <div className="text-6xl mb-4">{MOCK_STORY.emoji}</div>
                  <h1 className="text-4xl font-bold text-gray-800 mb-2">
                    {MOCK_STORY.title}
                  </h1>
                  <div className="flex items-center justify-center gap-4 text-sm text-gray-600">
                    <span>📖 {MOCK_STORY.wordCount} words</span>
                    <span>⏱️ {MOCK_STORY.estimatedTime} min read</span>
                  </div>
                </div>

                <div className="prose prose-lg max-w-none mb-8">
                  {MOCK_STORY.content.split('\n\n').map((paragraph, i) => (
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

          {phase === 'questions' && (
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
                  {currentQuestion.options.map((option, index) => {
                    const isSelected = showResult;
                    const isCorrect = index === currentQuestion.correctAnswer;
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
                          {option}
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
                      mood={answers[currentQuestionIndex] === currentQuestion.correctAnswer ? 'happy' : 'encouraging'}
                      message={
                        answers[currentQuestionIndex] === currentQuestion.correctAnswer
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
