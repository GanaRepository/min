// config/competition.ts - Competition configuration
export interface CompetitionConfig {
  maxEntriesPerChild: number;
  submissionPhaseDays: number;
  judgingPhaseDays: number;
  resultsPhaseDays: number;
  judgingCriteria: {
    grammar: number;
    creativity: number;
    structure: number;
    characterDev: number;
    plotOriginality: number;
    vocabulary: number;
  };
}

export const COMPETITION_CONFIG: CompetitionConfig = {
  maxEntriesPerChild: 3,
  submissionPhaseDays: 25,  // Days 1-25
  judgingPhaseDays: 5,      // Days 26-30
  resultsPhaseDays: 1,      // Day 31
  
  // AI Judging Criteria (must sum to 1.0)
  judgingCriteria: {
    grammar: 0.20,        // 20%
    creativity: 0.25,     // 25%
    structure: 0.15,      // 15%
    characterDev: 0.15,   // 15%
    plotOriginality: 0.15, // 15%
    vocabulary: 0.10,     // 10%
  },
};

export function getCompetitionSchedule(year: number, month: number) {
  const startDate = new Date(year, month - 1, 1); // Month is 0-indexed
  
  return {
    submissionStart: new Date(startDate),
    submissionEnd: new Date(year, month - 1, COMPETITION_CONFIG.submissionPhaseDays),
    judgingStart: new Date(year, month - 1, COMPETITION_CONFIG.submissionPhaseDays + 1),
    judgingEnd: new Date(year, month - 1, COMPETITION_CONFIG.submissionPhaseDays + COMPETITION_CONFIG.judgingPhaseDays),
    resultsDate: new Date(year, month - 1, COMPETITION_CONFIG.submissionPhaseDays + COMPETITION_CONFIG.judgingPhaseDays + 1),
  };
}

export function getCurrentCompetitionPhase(
  submissionEnd: Date,
  judgingEnd: Date,
  resultsDate: Date
): 'submission' | 'judging' | 'results' | 'ended' {
  const now = new Date();
  
  if (now <= submissionEnd) {
    return 'submission';
  } else if (now <= judgingEnd) {
    return 'judging';
  } else if (now <= resultsDate) {
    return 'results';
  } else {
    return 'ended';
  }
}