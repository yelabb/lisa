'use client';

import { motion } from 'framer-motion';
import { Lock, Star, Check } from 'lucide-react';

interface StoryNode {
  id: string;
  title: string;
  level: number;
  isUnlocked: boolean;
  isCompleted: boolean;
  position: { x: number; y: number };
}

interface StoryMapProps {
  nodes: StoryNode[];
  currentNodeId?: string;
  onNodeClick: (nodeId: string) => void;
}

export function StoryMap({ nodes, currentNodeId, onNodeClick }: StoryMapProps) {
  return (
    <div className="relative w-full h-[600px] bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 rounded-3xl overflow-hidden">
      {/* Path SVG */}
      <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 1 }}>
        {nodes.map((node, idx) => {
          if (idx === nodes.length - 1) return null;
          const nextNode = nodes[idx + 1];
          
          return (
            <motion.line
              key={`path-${node.id}`}
              x1={`${node.position.x}%`}
              y1={`${node.position.y}%`}
              x2={`${nextNode.position.x}%`}
              y2={`${nextNode.position.y}%`}
              stroke={node.isCompleted ? '#10b981' : '#d1d5db'}
              strokeWidth="4"
              strokeDasharray={node.isCompleted ? '0' : '10,5'}
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
            />
          );
        })}
      </svg>

      {/* Story Nodes */}
      {nodes.map((node, idx) => (
        <motion.div
          key={node.id}
          className="absolute"
          style={{
            left: `${node.position.x}%`,
            top: `${node.position.y}%`,
            transform: 'translate(-50%, -50%)',
            zIndex: 2,
          }}
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: idx * 0.1, type: 'spring' }}
        >
          <motion.button
            onClick={() => node.isUnlocked && onNodeClick(node.id)}
            disabled={!node.isUnlocked}
            className={`
              relative w-20 h-20 rounded-full flex items-center justify-center font-bold text-lg shadow-lg transition-all
              ${node.isCompleted
                ? 'bg-green-500 text-white'
                : node.isUnlocked
                ? currentNodeId === node.id
                  ? 'bg-purple-500 text-white ring-4 ring-purple-300'
                  : 'bg-white text-purple-600 hover:scale-110'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }
            `}
            whileHover={node.isUnlocked ? { scale: 1.1 } : {}}
            whileTap={node.isUnlocked ? { scale: 0.95 } : {}}
          >
            {node.isCompleted ? (
              <Check size={32} />
            ) : !node.isUnlocked ? (
              <Lock size={24} />
            ) : (
              <Star size={28} />
            )}

            {/* Pulsing ring for current node */}
            {currentNodeId === node.id && node.isUnlocked && (
              <motion.div
                className="absolute inset-0 rounded-full border-4 border-purple-500"
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.7, 0, 0.7],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            )}
          </motion.button>

          {/* Node Label */}
          <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 whitespace-nowrap">
            <p className="text-xs font-bold text-gray-700 bg-white px-2 py-1 rounded-lg shadow">
              {node.title}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
