'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Pause, Play, ChevronLeft, ChevronRight } from 'lucide-react';

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
    { type: 'text', text: "Luna était une petite fille curieuse qui aimait explorer la forêt." },
    { type: 'text', text: "Un jour, elle découvrit un papillon extraordinaire aux ailes scintillantes." },
    { 
      type: 'question',
      text: "Que découvre Luna dans la forêt ?",
      options: ["Un lapin", "Un papillon", "Une fleur", "Un oiseau"],
      correctIndex: 1,
      explanation: "Bravo ! C'est bien un papillon aux ailes scintillantes."
    },
    { type: 'text', text: "Le papillon la guida vers un arbre majestueux, caché au cœur de la forêt." },
    { 
      type: 'question',
      text: "Où le papillon guide-t-il Luna ?",
      options: ["Vers une rivière", "Vers un arbre", "Vers une maison", "Vers un lac"],
      correctIndex: 1,
      explanation: "Exactement ! Vers un arbre majestueux."
    },
    { type: 'text', text: "Là, Luna apprit que chaque créature avait sa propre magie." },
  ],
  hints: [
    { word: "curieuse", definition: "Qui aime découvrir de nouvelles choses", example: "Les scientifiques sont curieux." },
    { word: "scintillantes", definition: "Qui brillent comme des étoiles", example: "Les étoiles sont scintillantes." },
    { word: "majestueux", definition: "Très beau et impressionnant", example: "Un château majestueux." },
  ],
};

export default function LearnPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showHint, setShowHint] = useState<WordHint | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [isPaused, setIsPaused] = useState(false);
  const [showNavigationHint, setShowNavigationHint] = useState(true);

  const currentItem = MOCK_STORY.content[currentIndex];
  const isQuestion = currentItem?.type === 'question';

  // Auto-progression de la lecture
  useEffect(() => {
    if (currentIndex < MOCK_STORY.content.length && !isPaused && !isQuestion && selectedAnswer === null) {
      const timer = setTimeout(() => {
        setCurrentIndex(prev => prev + 1);
      }, 5000); // 5 secondes par paragraphe

      return () => clearTimeout(timer);
    }
  }, [currentIndex, isPaused, isQuestion, selectedAnswer]);

  // Cacher le hint de navigation après 5 secondes
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowNavigationHint(false);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

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
    if (selectedAnswer !== null || !isQuestion) return;
    
    setSelectedAnswer(index);
    const correct = index === (currentItem as any).correctIndex;
    
    // Mise à jour du score en arrière-plan (pas affiché)
    setScore(prev => ({
      correct: prev.correct + (correct ? 1 : 0),
      total: prev.total + 1,
    }));

    // Continuer après 3 secondes pour laisser le temps de lire l'explication
    setTimeout(() => {
      setSelectedAnswer(null);
      setCurrentIndex(prev => prev + 1);
      setIsPaused(false); // Reprendre l'auto-progression
    }, 3000);
  };

  const handlePrevious = () => {
    if (currentIndex > 0 && selectedAnswer === null) {
      setCurrentIndex(prev => prev - 1);
      setIsPaused(true);
      setShowNavigationHint(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < MOCK_STORY.content.length - 1 && selectedAnswer === null) {
      setCurrentIndex(prev => prev + 1);
      setIsPaused(true);
      setShowNavigationHint(false);
    }
  };

  const togglePause = () => {
    setIsPaused(prev => !prev);
    setShowNavigationHint(false);
  };

  const handleSideClick = (side: 'left' | 'right') => {
    if (side === 'left') {
      handlePrevious();
    } else {
      handleNext();
    }
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

        {/* Hint de navigation initial */}
        <AnimatePresence>
          {showNavigationHint && !isQuestion && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-center mb-6"
            >
              <p className="text-xs text-gray-400 font-light">
                Clique sur les côtés pour naviguer ← →
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Zone de contenu principale avec zones cliquables */}
        <div className="relative min-h-[400px] flex">
          {/* Zone cliquable gauche */}
          {!isQuestion && currentIndex > 0 && selectedAnswer === null && (
            <button
              onClick={() => handleSideClick('left')}
              className="absolute left-0 top-0 bottom-0 w-1/4 hover:bg-gray-50/50 transition-colors cursor-pointer z-10 group"
              aria-label="Page précédente"
            >
              <div className="absolute left-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                <ChevronLeft size={32} className="text-gray-300" />
              </div>
            </button>
          )}

          {/* Zone cliquable droite */}
          {!isQuestion && currentIndex < MOCK_STORY.content.length - 1 && selectedAnswer === null && (
            <button
              onClick={() => handleSideClick('right')}
              className="absolute right-0 top-0 bottom-0 w-1/4 hover:bg-gray-50/50 transition-colors cursor-pointer z-10 group"
              aria-label="Page suivante"
            >
              <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                <ChevronRight size={32} className="text-gray-300" />
              </div>
            </button>
          )}

          {/* Contenu central */}
          <div className="flex-1 relative z-20 pointer-events-none">
            <div className="pointer-events-auto">
          <AnimatePresence mode="wait">
            {/* Affichage des paragraphes de texte */}
            {currentItem && currentItem.type === 'text' && currentIndex < MOCK_STORY.content.length && (
              <motion.div
                key={`text-${currentIndex}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="text-center"
              >
                <p className="text-3xl leading-relaxed text-gray-700 font-light tracking-wide">
                  {currentItem.text.split(' ').map((word, i) => 
                    renderWord(word, i)
                  )}
                </p>
              </motion.div>
            )}

            {/* Affichage des questions intégrées */}
            {currentItem && currentItem.type === 'question' && (
              <motion.div
                key={`question-${currentIndex}`}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4 }}
                className="space-y-8"
              >
                <p className="text-2xl text-gray-800 font-light text-center mb-12">
                  {currentItem.text}
                </p>

                <div className="space-y-3">
                  {(currentItem as any).options.map((option: string, index: number) => {
                    let bgColor = 'bg-gray-50 hover:bg-gray-100';
                    let borderColor = 'border-gray-200';
                    let textColor = 'text-gray-700';

                    if (selectedAnswer !== null) {
                      if (index === (currentItem as any).correctIndex) {
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
                      {(currentItem as any).explanation}
                    </p>
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* Fin de l'histoire */}
            {currentIndex >= MOCK_STORY.content.length && (
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
                index <= currentIndex ? 'bg-purple-300' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>

        {/* Contrôles de navigation discrets */}
        {currentIndex < MOCK_STORY.content.length && selectedAnswer === null && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-8 flex items-center justify-center gap-3"
          >
            <motion.button
              onClick={handlePrevious}
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
              onClick={handleNext}
              disabled={currentIndex >= MOCK_STORY.content.length - 1}
              whileHover={{ scale: currentIndex < MOCK_STORY.content.length - 1 ? 1.1 : 1 }}
              whileTap={{ scale: currentIndex < MOCK_STORY.content.length - 1 ? 0.9 : 1 }}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                currentIndex < MOCK_STORY.content.length - 1
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
