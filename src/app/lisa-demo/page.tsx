'use client';

import { useState } from 'react';
import { LisaCompanion } from '@/components/lisa/lisa-companion';
import { LisaLoading, LisaContentSkeleton, LisaMiniLoader } from '@/components/lisa/lisa-loading';
import type { LisaState, LisaMessage } from '@/types/lisa';

export default function LisaDemoPage() {
  const [selectedState, setSelectedState] = useState<LisaState>('idle');
  const [showMessage, setShowMessage] = useState(true);

  const states: LisaState[] = ['idle', 'thinking', 'success', 'celebration', 'struggle', 'encouraging', 'reading', 'surprised'];

  const messages: Record<LisaState, LisaMessage> = {
    idle: { text: "Hi! I'm Lisa, your reading buddy! 📚" },
    thinking: { text: "Let me think about that for a moment... 🤔" },
    success: { text: "Great job! You got it right! 🎉" },
    celebration: { text: "WOW! Perfect score! You're amazing! 🥳" },
    struggle: { text: "That's okay! Keep trying, you've got this! 💪" },
    encouraging: { text: "You're doing so well! I'm proud of you! 😊" },
    reading: { text: "Take your time with the story... 📖" },
    surprised: { text: "Whoa! That was unexpected! 😮" },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-2 text-center bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Lisa Character Demo
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Test all of Lisa's emotional states and animations
        </p>

        {/* State Selector */}
        <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-6 mb-8 border-2 border-purple-200">
          <h2 className="text-xl font-bold mb-4 text-gray-800">Select Lisa's State:</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {states.map((state) => (
              <button
                key={state}
                onClick={() => setSelectedState(state)}
                className={`
                  px-4 py-3 rounded-xl font-semibold transition-all
                  ${selectedState === state
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg scale-105'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }
                `}
              >
                {state.charAt(0).toUpperCase() + state.slice(1)}
              </button>
            ))}
          </div>
          
          <div className="mt-4 flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showMessage}
                onChange={(e) => setShowMessage(e.target.checked)}
                className="w-5 h-5"
              />
              <span className="text-gray-700 font-medium">Show Message</span>
            </label>
          </div>
        </div>

        {/* Lisa Display */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Center Display */}
          <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-12 border-2 border-purple-200 flex items-center justify-center min-h-[300px] relative">
            <div className="text-center">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Current State: {selectedState}</h3>
              <p className="text-sm text-gray-600 mb-8">Lisa appears in the bottom-right corner</p>
            </div>
            
            <LisaCompanion
              state={selectedState}
              message={showMessage ? messages[selectedState] : undefined}
              showMessage={showMessage}
              position="bottom-right"
              size="large"
            />
          </div>

          {/* Different Positions */}
          <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-6 border-2 border-purple-200">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Position Variants</h3>
            <div className="grid grid-cols-2 gap-3">
              {(['bottom-right', 'bottom-left', 'top-right', 'top-left'] as const).map((position) => (
                <div key={position} className="relative bg-gray-100 rounded-xl h-32 overflow-hidden">
                  <p className="absolute top-2 left-2 text-xs font-medium text-gray-600">
                    {position}
                  </p>
                  <LisaCompanion
                    state={selectedState}
                    showMessage={false}
                    position={position}
                    size="small"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Loading Components */}
        <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-6 border-2 border-purple-200 mb-8">
          <h2 className="text-xl font-bold mb-6 text-gray-800">Loading States</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Story Generation</h3>
              <div className="bg-gray-50 rounded-xl p-4">
                <LisaLoading type="story" />
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Question Generation</h3>
              <div className="bg-gray-50 rounded-xl p-4">
                <LisaLoading type="question" />
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">General Loading</h3>
              <div className="bg-gray-50 rounded-xl p-4">
                <LisaLoading type="general" />
              </div>
            </div>
          </div>
        </div>

        {/* Content Skeleton */}
        <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-6 border-2 border-purple-200 mb-8">
          <h2 className="text-xl font-bold mb-4 text-gray-800">Content Skeleton</h2>
          <div className="bg-gray-50 rounded-xl p-6">
            <LisaContentSkeleton />
          </div>
        </div>

        {/* Mini Loader */}
        <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-6 border-2 border-purple-200">
          <h2 className="text-xl font-bold mb-4 text-gray-800">Inline Loader</h2>
          <div className="bg-gray-50 rounded-xl p-6">
            <p className="text-gray-700 mb-2">Processing your request... <LisaMiniLoader /></p>
          </div>
        </div>
      </div>
    </div>
  );
}
