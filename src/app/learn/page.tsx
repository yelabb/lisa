'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';

// Types
type WordHint = {
  word: string;
  definition: string;
  example: string;
};

type Question = {
  id: string;
  text: string;
  options: string[];
  correctIndex: number;
  explanation: string;
};

// Mock data - sera remplacé par des appels API
const MOCK_STORY = {
  title: "L'Aventure de Luna",
  content: [
    "Luna était une petite fille curieuse qui aimait explorer la forêt.",
    "Un jour, elle découvrit un papillon extraordinaire aux ailes scintillantes.",
    "Le papillon la guida vers un arbre majestueux, caché au cœur de la forêt.",
    "Là, Luna apprit que chaque créature avait sa propre magie.",
  ],
  hints: [
    { word: "curieuse", definition: "Qui aime découvrir de nouvelles choses", example: "Les scientifiques sont curieux." },
    { word: "scintillantes", definition: "Qui brillent comme des étoiles", example: "Les étoiles sont scintillantes." },
    { word: "majestueux", definition: "Très beau et impressionnant", example: "Un château majestueux." },
  ],
  questions: [
    {
      id: "q1",
      text: "Que découvre Luna dans la forêt ?",
      options: ["Un lapin", "Un papillon", "Une fleur", "Un oiseau"],
      correctIndex: 1,
      explanation: "Luna découvre un papillon extraordinaire aux ailes scintillantes.",
    },
    {
      id: "q2",
      text: "Où le papillon guide-t-il Luna ?",
      options: ["Vers une rivière", "Vers un arbre", "Vers une maison", "Vers un lac"],
      correctIndex: 1,
      explanation: "Le papillon guide Luna vers un arbre majestueux.",
    },
  ],
};

export default function LearnPage() {
  const [currentParagraph, setCurrentParagraph] = useState(0);
  const [showHint, setShowHint] = useState<WordHint | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState({ correct: 0, total: 0 });

  // Auto-progression de la lecture
  useEffect(() => {
    if (currentParagraph < MOCK_STORY.content.length && !currentQuestion) {
      const timer = setTimeout(() => {
        // Après chaque 2 paragraphes, poser une question
        if ((currentParagraph + 1) % 2 === 0 && currentParagraph < MOCK_STORY.content.length - 1) {
          const questionIndex = Math.floor(currentParagraph / 2);
          if (MOCK_STORY.questions[questionIndex]) {
            setCurrentQuestion(MOCK_STORY.questions[questionIndex]);
          } else {
            setCurrentParagraph(prev => prev + 1);
          }
        } else {
          setCurrentParagraph(prev => prev + 1);
        }
      }, 5000); // 5 secondes par paragraphe

      return () => clearTimeout(timer);
    }
  }, [currentParagraph, currentQuestion]);

  const handleWordClick = (word: string) => {
    const hint = MOCK_STORY.hints.find(h => 
      word.toLowerCase().includes(h.word.toLowerCase()) || 
      h.word.toLowerCase().includes(word.toLowerCase())
    );
    if (hint) {
      setShowHint(hint);
    }
  };

  const handleAnswerSelect = (index: number) => {
    if (selectedAnswer !== null || !currentQuestion) return;
    
    setSelectedAnswer(index);
    const correct = index === currentQuestion.correctIndex;
    setIsCorrect(correct);
    
    // Mise à jour du score en arrière-plan (pas affiché)
    setScore(prev => ({
      correct: prev.correct + (correct ? 1 : 0),
      total: prev.total + 1,
    }));

    // Continuer après 2 secondes
    setTimeout(() => {
      setCurrentQuestion(null);
      setSelectedAnswer(null);
      setIsCorrect(null);
      setCurrentParagraph(prev => prev + 1);
    }, 2000);
  };

  const renderWord = (word: string, index: number) => {
    const hasHint = MOCK_STORY.hints.some(h => 
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

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-3xl">
        {/* Header très discret */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 text-sm text-gray-400 mb-8">
            <Sparkles size={14} className="text-purple-400" />
            <span>Lisa</span>
          </div>
          
          <h1 className="text-2xl font-light text-gray-800 mb-2">
            {MOCK_STORY.title}
          </h1>
          <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-purple-200 to-transparent mx-auto" />
        </div>

        {/* Zone de contenu principale */}
        <div className="relative min-h-[400px]">
          <AnimatePresence mode="wait">
            {/* Affichage des paragraphes */}
            {!currentQuestion && currentParagraph < MOCK_STORY.content.length && (
              <motion.div
                key={`paragraph-${currentParagraph}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="text-center"
              >
                <p className="text-3xl leading-relaxed text-gray-700 font-light tracking-wide">
                  {MOCK_STORY.content[currentParagraph].split(' ').map((word, i) => 
                    renderWord(word, i)
                  )}
                </p>
              </motion.div>
            )}

            {/* Affichage des questions */}
            {currentQuestion && (
              <motion.div
                key={`question-${currentQuestion.id}`}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4 }}
                className="space-y-8"
              >
                <p className="text-2xl text-gray-800 font-light text-center mb-12">
                  {currentQuestion.text}
                </p>

                <div className="space-y-3">
                  {currentQuestion.options.map((option, index) => {
                    let bgColor = 'bg-gray-50 hover:bg-gray-100';
                    let borderColor = 'border-gray-200';
                    let textColor = 'text-gray-700';

                    if (selectedAnswer !== null) {
                      if (index === currentQuestion.correctIndex) {
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

                {/* Explication douce après réponse */}
                {selectedAnswer !== null && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center"
                  >
                    <p className="text-sm text-gray-500 font-light">
                      {currentQuestion.explanation}
                    </p>
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* Fin de l'histoire */}
            {currentParagraph >= MOCK_STORY.content.length && !currentQuestion && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-8"
              >
                <div className="text-6xl mb-8">✨</div>
                <p className="text-2xl text-gray-700 font-light">
                  Bravo, continue comme ça !
                </p>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => window.location.reload()}
                  className="px-8 py-3 bg-gray-900 text-white rounded-lg text-sm font-light hover:bg-gray-800 transition-colors"
                >
                  Prochaine histoire
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
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
                    "{showHint.example}"
                  </p>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Indicateur de progression très discret */}
        <div className="mt-16 flex justify-center gap-1.5">
          {MOCK_STORY.content.map((_, index) => (
            <div
              key={index}
              className={`h-1 w-8 rounded-full transition-colors ${
                index <= currentParagraph ? 'bg-purple-300' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
