// components/stories/StoryFilters.tsx
'use client';

import { motion } from 'framer-motion';
import { Filter, ChevronDown } from 'lucide-react';
import { useState } from 'react';

type FilterType = 'all' | 'published' | 'in_progress' | 'drafts';
type SortType = 'newest' | 'oldest' | 'highest_score' | 'most_words';

interface StoryFiltersProps {
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  sortBy: SortType;
  onSortChange: (sort: SortType) => void;
}

const filterOptions: { value: FilterType; label: string; count?: number }[] = [
  { value: 'all', label: 'All Stories' },
  { value: 'published', label: 'Published' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'drafts', label: 'Drafts' },
];

const sortOptions: { value: SortType; label: string }[] = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'highest_score', label: 'Highest Score' },
  { value: 'most_words', label: 'Most Words' },
];

export default function StoryFilters({
  activeFilter,
  onFilterChange,
  sortBy,
  onSortChange,
}: StoryFiltersProps) {
  const [showSortMenu, setShowSortMenu] = useState(false);

  return (
    <div className="flex items-center space-x-4">
      {/* Filter Tabs */}
      <div className="flex items-center space-x-1 bg-gray-800/60 border border-gray-600 rounded-xl p-1">
        {filterOptions.map((option) => (
          <motion.button
            key={option.value}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onFilterChange(option.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeFilter === option.value
                ? 'bg-green-500 text-white'
                : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
            }`}
          >
            {option.label}
          </motion.button>
        ))}
      </div>

      {/* Sort Dropdown */}
      <div className="relative">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowSortMenu(!showSortMenu)}
          className="flex items-center space-x-2 bg-gray-800/60 border border-gray-600 rounded-xl px-4 py-3 text-gray-300 hover:text-white transition-colors"
        >
          <Filter className="w-4 h-4" />
          <span className="text-sm">
            {sortOptions.find((opt) => opt.value === sortBy)?.label}
          </span>
          <ChevronDown className="w-4 h-4" />
        </motion.button>

        {showSortMenu && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute right-0 top-full mt-2 w-48 bg-gray-800 border border-gray-600 rounded-xl shadow-xl z-10"
          >
            <div className="p-2">
              {sortOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    onSortChange(option.value);
                    setShowSortMenu(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    sortBy === option.value
                      ? 'bg-green-500 text-white'
                      : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
