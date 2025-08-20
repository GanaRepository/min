// components/progress/SkillProgress.tsx
'use client';

import { motion } from 'framer-motion';
import { BookOpen, Sparkles, TrendingUp } from 'lucide-react';

interface SkillProgressProps {
  grammarScore: number;
  creativityScore: number;
}

export default function SkillProgress({
  grammarScore,
  creativityScore,
}: SkillProgressProps) {
  const skills = [
    {
      name: 'Grammar Improvement',
      score: grammarScore,
      improvement: '+12%',
      icon: BookOpen,
      color: 'from-green-500 to-emerald-600',
      bgColor: 'from-green-500/10 to-emerald-500/10',
      focus: [
        { item: 'Punctuation', status: 'completed' },
        { item: 'Sentence structure', status: 'improving' },
        { item: 'Spelling accuracy', status: 'completed' },
      ],
    },
    {
      name: 'Creativity Growth',
      score: creativityScore,
      improvement: '+8%',
      icon: Sparkles,
      color: 'from-purple-500 to-pink-600',
      bgColor: 'from-purple-500/10 to-pink-500/10',
      focus: [
        { item: 'Character dialogue', status: 'excellent' },
        { item: 'Plot twists', status: 'excellent' },
        { item: 'Descriptive language', status: 'improving' },
      ],
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="bg-gray-800/60 backdrop-blur-xl border border-gray-600/40 rounded-xl p-6"
    >
      <h3 className="text-white  text-lg mb-6 flex items-center">
        🎯 Skill Development
      </h3>

      <div className="space-y-6">
        {skills.map((skill, index) => (
          <motion.div
            key={skill.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 + index * 0.1 }}
            className={`bg-gradient-to-r ${skill.bgColor} border border-gray-600/30 rounded-xl p-4`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div
                  className={`w-10 h-10 bg-gradient-to-r ${skill.color} rounded-lg flex items-center justify-center`}
                >
                  <skill.icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="text-white ">{skill.name}</h4>
                  <span className="text-green-400 text-sm">
                    {skill.improvement} this month
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl  text-white">
                  {skill.score}%
                </div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mb-4">
              <div className="w-full bg-gray-700 rounded-full h-3">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${skill.score}%` }}
                  transition={{ duration: 1, delay: 0.7 + index * 0.1 }}
                  className={`bg-gradient-to-r ${skill.color} h-3 rounded-full`}
                />
              </div>
            </div>

            {/* Focus areas */}
            <div>
              <h5 className="text-gray-300 text-sm  mb-2">
                Recent Focus:
              </h5>
              <div className="space-y-1">
                {skill.focus.map((item, itemIndex) => (
                  <div
                    key={itemIndex}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-gray-300">• {item.item}</span>
                    <span
                      className={`text-xs  ${
                        item.status === 'completed'
                          ? 'text-green-400'
                          : item.status === 'excellent'
                            ? 'text-purple-400'
                            : item.status === 'improving'
                              ? 'text-yellow-400'
                              : 'text-gray-400'
                      }`}
                    >
                      {item.status === 'completed'
                        ? '✅'
                        : item.status === 'excellent'
                          ? '⭐'
                          : item.status === 'improving'
                            ? '📈'
                            : '📝'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
