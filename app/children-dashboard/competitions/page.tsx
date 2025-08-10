// app/children-dashboard/competitions/page.tsx - COMPLETE REPLACEMENT
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Trophy, Upload, Clock, Star, Medal, Download, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface Competition {
  _id: string;
  month: string;
  year: number;
  phase: 'submission' | 'judging' | 'results';
  daysLeft: number;
  totalSubmissions: number;
  totalParticipants: number;
  winners?: Array<{
    position: number;
    childId: string;
    childName: string;
    title: string;
    score: number;
  }>;
  userStats?: {
    entriesUsed: number;
    entriesLimit: number;
    canSubmit: boolean;
    userEntries: Array<{
      storyId: string;
      title: string;
      submittedAt: string;
      score?: number;
      rank?: number;
    }>;
  };
}

interface EligibleStory {
  _id: string;
  title: string;
  wordCount: number;
  createdAt: string;
  isEligible: boolean;
}

export default function CompetitionsPage() {
  const { data: session } = useSession();
  const [currentCompetition, setCurrentCompetition] = useState<Competition | null>(null);
  const [pastCompetitions, setPastCompetitions] = useState<Competition[]>([]);
  const [eligibleStories, setEligibleStories] = useState<EligibleStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState<string | null>(null);

  useEffect(() => {
    fetchCompetitionData();
  }, []);

  const fetchCompetitionData = async () => {
    try {
      // Fetch current competition
      const currentResponse = await fetch('/api/competitions/current');
      const currentData = await currentResponse.json();
      setCurrentCompetition(currentData.competition);

      // Fetch past competitions
      const pastResponse = await fetch('/api/competitions/past');
      const pastData = await pastResponse.json();
      setPastCompetitions(pastData.competitions || []);

      // Fetch eligible stories for submission
      if (currentData.competition?.phase === 'submission') {
        const storiesResponse = await fetch('/api/stories/eligible-for-competition');
        const storiesData = await storiesResponse.json();
        setEligibleStories(storiesData.stories || []);
      }
    } catch (error) {
      console.error('Error fetching competition data:', error);
    } finally {
      setLoading(false);
    }
  };

  const submitToCompetition = async (storyId: string) => {
    setSubmitting(storyId);
    try {
      const response = await fetch('/api/competitions/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storyId })
      });

      if (response.ok) {
        alert('Story submitted successfully!');
        fetchCompetitionData(); // Refresh data
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to submit story');
      }
    } catch (error) {
      alert('Failed to submit story');
    } finally {
      setSubmitting(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-green-900 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg text-gray-600">Loading competitions...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-green-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link href="/children-dashboard" className="text-gray-100 hover:text-gray-800">
            <ArrowLeft size={24} />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-white">Writing Competitions</h1>
            <p className="text-gray-100">Showcase your stories and compete with young writers worldwide!</p>
          </div>
        </div>

        {/* Current Competition */}
        {currentCompetition && (
          <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-green-900 rounded-xl p-6 text-white mb-6 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Trophy className="w-8 h-8 text-yellow-300" />
                  <h2 className="text-2xl font-bold">
                    {currentCompetition.month} {currentCompetition.year} Competition
                  </h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="bg-gray-700/20 rounded-lg p-3">
                    <div className="text-lg font-bold">
                      {currentCompetition.phase === 'submission' ? '📝 Submissions Open' :
                       currentCompetition.phase === 'judging' ? '⚖️ AI Judging' : '🏆 Results Available'}
                    </div>
                    <div className="text-sm text-purple-100">
                      {currentCompetition.daysLeft} days left
                    </div>
                  </div>
                  
                  {currentCompetition.userStats && (
                    <div className="bg-gray-700/20 rounded-lg p-3">
                      <div className="text-lg font-bold">
                        {currentCompetition.userStats.entriesUsed}/{currentCompetition.userStats.entriesLimit}
                      </div>
                      <div className="text-sm text-purple-100">Your entries</div>
                    </div>
                  )}
                  
                  <div className="bg-gray-700/20 rounded-lg p-3">
                    <div className="text-lg font-bold">{currentCompetition.totalParticipants}</div>
                    <div className="text-sm text-purple-100">Total participants</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Submission Interface */}
            {currentCompetition.phase === 'submission' && currentCompetition.userStats?.canSubmit && (
              <div className="bg-gray-700/10 rounded-lg p-4 mt-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Upload size={20} />
                  Submit Your Stories
                </h3>
                {eligibleStories.length > 0 ? (
                  <div className="grid gap-3">
                    {eligibleStories.map((story) => (
                      <div key={story._id} className="flex items-center justify-between bg-gray-700/20 rounded-lg p-3">
                        <div className="flex-1">
                          <h4 className="font-medium text-white">{story.title}</h4>
                          <p className="text-sm text-purple-100">
                            {story.wordCount} words • Created {new Date(story.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <button
                          onClick={() => submitToCompetition(story._id)}
                          disabled={submitting === story._id}
                          className="bg-green-500 hover:bg-green-600 disabled:bg-green-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                        >
                          {submitting === story._id ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              Submitting...
                            </>
                          ) : (
                            <>
                              <Upload size={16} />
                              Submit
                            </>
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-purple-100 mb-2">No eligible stories found</p>
                    <p className="text-sm text-purple-200">
                      You need published stories to participate in competitions.
                    </p>
                    <Link 
                      href="/children-dashboard/create-story"
                      className="inline-block mt-2 bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      Create New Story
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* User's Current Entries */}
            {currentCompetition.userStats?.userEntries && currentCompetition.userStats.userEntries.length > 0 && (
              <div className="bg-gray-700/10 rounded-lg p-4 mt-4">
                <h3 className="font-semibold mb-3">Your Submitted Stories</h3>
                <div className="space-y-2">
                  {currentCompetition.userStats.userEntries.map((entry) => (
                    <div key={entry.storyId} className="flex items-center justify-between bg-gray-700/20 rounded-lg p-3">
                      <div>
                        <h4 className="font-medium">{entry.title}</h4>
                        <p className="text-sm text-purple-100">
                          Submitted {new Date(entry.submittedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        {entry.score ? (
                          <>
                            <div className="font-bold text-lg">{entry.score}%</div>
                            {entry.rank && (
                              <div className="text-sm text-purple-100">Rank #{entry.rank}</div>
                            )}
                          </>
                        ) : (
                          <div className="text-sm text-purple-100">Pending results</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Results Display */}
            {currentCompetition.phase === 'results' && currentCompetition.winners && (
              <div className="bg-gray-700/10 rounded-lg p-4 mt-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Trophy size={20} />
                  Competition Winners
                </h3>
                <div className="space-y-3">
                  {currentCompetition.winners.map((winner) => (
                    <div key={winner.position} className="flex items-center gap-3 bg-gray-700/20 rounded-lg p-3">
                      <span className="text-3xl">
                        {winner.position === 1 ? '🥇' : winner.position === 2 ? '🥈' : '🥉'}
                      </span>
                      <div className="flex-1">
                        <p className="font-bold text-lg">{winner.childName}</p>
                        <p className="text-purple-100">"{winner.title}"</p>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-xl">{winner.score}%</div>
                        <div className="text-sm text-purple-100">Score</div>
                      </div>
                      {winner.childId === session?.user?.id && (
                        <div className="ml-4">
                          <div className="bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                            You won!
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Past Competitions */}
        <div className="bg-gradient-to-br from-green-900 via-gray-800 to-gray-900 rounded-xl shadow-sm border p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-white">
            <Clock size={24} />
            Past Competitions
          </h2>
          
          {pastCompetitions.length > 0 ? (
            <div className="space-y-4">
              {pastCompetitions.map((competition) => (
                <div key={competition._id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-lg">
                      {competition.month} {competition.year}
                    </h3>
                    <div className="text-sm text-gray-700">
                      {competition.totalParticipants} participants • {competition.totalSubmissions} submissions
                    </div>
                  </div>
                  
                  {competition.winners && competition.winners.length > 0 && (
                    <div className="space-y-2">
                      {competition.winners.slice(0, 3).map((winner) => (
                        <div key={winner.position} className="flex items-center gap-3 text-sm">
                          <span className="text-lg">
                            {winner.position === 1 ? '🥇' : winner.position === 2 ? '🥈' : '🥉'}
                          </span>
                          <span className="font-medium">{winner.childName}</span>
                          <span className="text-gray-600">- "{winner.title}" ({winner.score}%)</span>
                          {winner.childId === session?.user?.id && (
                            <span className="ml-auto bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                              Your story
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-700">No past competitions found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}