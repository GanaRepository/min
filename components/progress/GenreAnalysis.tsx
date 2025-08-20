// components/progress/GenreAnalysis.tsx
'use client';

import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface GenreAnalysisProps {
  genreBreakdown: Array<{ genre: string; count: number; percentage: number }>;
}

const COLORS = [
  '#10B981',
  '#3B82F6',
  '#8B5CF6',
  '#F59E0B',
  '#EF4444',
  '#06B6D4',
];

export default function GenreAnalysis({ genreBreakdown }: GenreAnalysisProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="bg-gray-800/60 backdrop-blur-xl border border-gray-600/40 rounded-xl p-6"
    >
      <h3 className="text-white  text-lg mb-6 flex items-center">
        📚 Story Genre Analysis
      </h3>

      <div className="flex flex-col lg:flex-row items-center">
        {/* Pie Chart */}
        <div className="w-full lg:w-1/2 h-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={genreBreakdown}
                cx="50%"
                cy="50%"
                outerRadius={60}
                dataKey="count"
                label={({ percentage }) => `${percentage}%`}
              >
                {genreBreakdown.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#F9FAFB',
                }}
                formatter={(value: number, name) => [
                  `${value} stories`,
                  'Count',
                ]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Genre List */}
        <div className="w-full lg:w-1/2 space-y-3">
          <h4 className="text-white  mb-3">Your Favorite Genres:</h4>
          {genreBreakdown.map((genre, index) => (
            <motion.div
              key={genre.genre}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + index * 0.1 }}
              className="flex items-center justify-between"
            >
              <div className="flex items-center space-x-3">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="text-gray-300">{genre.genre}</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-20 bg-gray-700 rounded-full h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${genre.percentage}%` }}
                    transition={{ duration: 1, delay: 0.7 + index * 0.1 }}
                    className="h-2 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                </div>
                <span className="text-white text-sm  w-12 text-right">
                  {genre.count} stories
                </span>
              </div>
            </motion.div>
          ))}

          <div className="mt-4 p-3 bg-blue-500/20 border border-blue-500/30 rounded-lg">
            <p className="text-blue-300 text-sm">
              💡 Try Comedy or Historical next for variety!
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
