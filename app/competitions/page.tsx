// app/competitions/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Trophy,
  Calendar,
  Upload,
  Clock,
  Users,
  BookOpen,
  Info,
  DollarSign,
  Gift,
  Sparkles,
} from 'lucide-react';

interface Competition {
  _id: string;
  month: string;
  year: number;
  phase: 'submission' | 'judging' | 'results';
  submissionStart: string;
  submissionEnd: string;
  judgingStart: string;
  judgingEnd: string;
  resultsDate: string;
  totalSubmissions: number;
  totalParticipants: number;
  maxEntriesPerChild: number;
  daysLeft: number;
  isActive: boolean;
  winners?: Winner[];
}

interface Winner {
  position: number;
  childId: string;
  childName: string;
  storyId: string;
  title: string;
  score: number;
  aiJudgingNotes?: string;
}

export default function CompetitionPage() {
  const [loading, setLoading] = useState(true);
  const [currentCompetition, setCurrentCompetition] =
    useState<Competition | null>(null);
  const [previousCompetitions, setPreviousCompetitions] = useState<
    Competition[]
  >([]);

  const getPodiumIcon = (position: number) => {
    switch (position) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return '🏆';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-green-900 relative overflow-hidden">
      {/* Floating Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute w-96 h-96 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 -full blur-3xl"
          animate={{ x: [0, 100, 0], y: [0, -50, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
          style={{ top: '10%', left: '10%' }}
        />
        <motion.div
          className="absolute w-80 h-80 bg-gradient-to-r from-pink-500/10 to-purple-500/10 -full blur-3xl"
          animate={{ x: [0, -80, 0], y: [0, 60, 0], scale: [1, 0.8, 1] }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 2,
          }}
          style={{ top: '60%', right: '10%' }}
        />
      </div>

      {/* Main Content Container */}
      <div className="relative z-10 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto space-y-20">
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center pt-16 "
          >
            <h1 className="text-4xl  text-white mb-6 flex items-center justify-center gap-4 drop-shadow-lg">
              <Trophy size={48} className="text-yellow-400" />
              Monthly Writing Competitions
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Compete with young writers worldwide! Submit up to 3 published
              stories each month. Winners are selected by our advanced AI
              judging system.
            </p>
          </motion.div>

          {/* Current Competition Section */}
          {currentCompetition && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-8"
            >
              <div className="bg-gradient-to-br from-gray-800/60 to-gray-700/60 backdrop-blur-xl border border-blue-500/30 -2xl p-8 shadow-2xl">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <Calendar className="text-blue-500" size={32} />
                    <span className="text-2xl  text-white">
                      {currentCompetition.month} {currentCompetition.year}
                    </span>
                  </div>
                  <div
                    className={`px-6 py-3 -full text-lg  shadow-lg ${
                      currentCompetition.phase === 'submission'
                        ? 'bg-green-100 text-green-700 border border-green-300'
                        : currentCompetition.phase === 'judging'
                          ? 'bg-yellow-100 text-yellow-700 border border-yellow-300'
                          : 'bg-purple-100 text-purple-700 border border-purple-300'
                    }`}
                  >
                    {currentCompetition.phase.charAt(0).toUpperCase() +
                      currentCompetition.phase.slice(1)}{' '}
                    Phase
                  </div>
                </div>

                {/* Competition Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                  <div className="text-center bg-gradient-to-br from-blue-500/10 to-cyan-500/10 -xl p-6 shadow-lg">
                    <span className="block text-3xl  text-blue-400">
                      {currentCompetition.totalParticipants}
                    </span>
                    <span className="text-blue-300 text-lg">Participants</span>
                  </div>
                  <div className="text-center bg-gradient-to-br from-yellow-500/10 to-orange-500/10 -xl p-6 shadow-lg">
                    <span className="block text-3xl  text-yellow-400">
                      {currentCompetition.totalSubmissions}
                    </span>
                    <span className="text-yellow-300 text-lg">
                      Stories Submitted
                    </span>
                  </div>
                  <div className="text-center bg-gradient-to-br from-green-500/10 to-teal-500/10 -xl p-6 shadow-lg">
                    <span className="block text-3xl  text-green-400">
                      {currentCompetition.daysLeft}
                    </span>
                    <span className="text-green-300 text-lg">
                      Days Remaining
                    </span>
                  </div>
                  <div className="text-center bg-gradient-to-br from-purple-500/10 to-pink-500/10 -xl p-6 shadow-lg">
                    <span className="block text-3xl  text-purple-400">$10</span>
                    <span className="text-purple-300 text-lg">
                      Publication Fee
                    </span>
                  </div>
                </div>

                {/* Winners Section (if results phase) */}
                {currentCompetition.phase === 'results' &&
                  currentCompetition.winners && (
                    <div className="space-y-6">
                      <h3 className="text-2xl  text-white text-center mb-6">
                        🏆 Competition Winners
                      </h3>
                      <div className="space-y-4">
                        {currentCompetition.winners
                          .slice(0, 3)
                          .map((winner) => (
                            <motion.div
                              key={winner.position}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: winner.position * 0.1 }}
                              className={`flex items-center justify-between p-6 -xl border-2 ${
                                winner.position === 1
                                  ? 'bg-yellow-600/20 border-yellow-500/30'
                                  : winner.position === 2
                                    ? 'bg-gray-400/20 border-gray-400/30'
                                    : 'bg-orange-600/20 border-orange-500/30'
                              }`}
                            >
                              <div className="flex items-center gap-4">
                                <div className="text-4xl">
                                  {getPodiumIcon(winner.position)}
                                </div>
                                <div>
                                  <div className="text-white  text-lg">
                                    {winner.childName}
                                  </div>
                                  <div className="text-gray-300">
                                    "{winner.title}"
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-white  text-xl">
                                  {winner.score}%
                                </div>
                                <div className="text-gray-400">Final Score</div>
                              </div>
                            </motion.div>
                          ))}
                      </div>
                    </div>
                  )}
              </div>
            </motion.div>
          )}

          {/* How Competitions Work Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-12"
          >
            <div className="text-center">
              <h2 className="text-3xl  text-white mb-4 flex items-center justify-center gap-3">
                <Info className="text-blue-500" />
                How Our Competitions Work
              </h2>
              <p className="text-gray-300 text-lg max-w-2xl mx-auto">
                Our monthly competitions follow a simple three-phase process
                designed to give every young writer a fair chance to shine.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-gradient-to-br from-green-500/10 to-cyan-500/10 border border-green-500/30 -xl p-8 shadow-lg">
                <div className="text-center mb-6">
                  <div className="bg-green-600 w-16 h-16 -full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white  text-2xl">1</span>
                  </div>
                  <h3 className="text-xl  text-white mb-2">Submission Phase</h3>
                  <p className="text-green-300 text-sm">
                    Days 1-25 of the month
                  </p>
                </div>
                <ul className="text-white space-y-3">
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-1">•</span>
                    Submit up to 3 stories per month per individual
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-1">•</span>
                    Stories must be 350-2000 words
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-1">•</span>
                    $10 publication fee per story in Physical Book Anthology
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-1">•</span>
                    All genres and themes welcome
                  </li>
                </ul>
              </div>

              <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 -xl p-8 shadow-lg">
                <div className="text-center mb-6">
                  <div className="bg-yellow-600 w-16 h-16 -full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white  text-2xl">2</span>
                  </div>
                  <h3 className="text-xl  text-yellow-300 mb-2">AI Judging</h3>
                  <p className="text-yellow-300 text-sm">
                    Days 26-30 of the month
                  </p>
                </div>
                <ul className="text-yellow-200 space-y-3">
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-400 mt-1">•</span>
                    Advanced AI evaluates all submissions
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-400 mt-1">•</span>
                    16+ evaluation categories
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-400 mt-1">•</span>
                    Creativity & originality focus
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-400 mt-1">•</span>
                    Fair & consistent scoring
                  </li>
                </ul>
              </div>

              <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 -xl p-8 shadow-lg">
                <div className="text-center mb-6">
                  <div className="bg-purple-600 w-16 h-16 -full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white  text-2xl">3</span>
                  </div>
                  <h3 className="text-xl  text-purple-300 mb-2">Results</h3>
                  <p className="text-purple-300 text-sm">End of month</p>
                </div>
                <ul className="text-purple-200 space-y-3">
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400 mt-1">•</span>
                    Top 3 winners announced
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400 mt-1">•</span>
                    Olympic-style medal ceremony
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400 mt-1">•</span>
                    Digital certificates awarded
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400 mt-1">•</span>
                    Annual anthology eligibility
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>

          {/* Pricing & Publishing Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-12"
          >
            <div className="text-center">
              <h2 className="text-3xl  text-white mb-4 flex items-center justify-center gap-3">
                <DollarSign className="text-green-500" />
                Pricing & Publishing
              </h2>
              <p className="text-gray-300 text-lg max-w-2xl mx-auto">
                Transparent pricing with no hidden fees. Pay only for what you
                use.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-gradient-to-br from-blue-600/20 to-cyan-600/20 border border-blue-500/30 -xl p-8 shadow-lg">
                <div className="text-center mb-6">
                  <Trophy className="mx-auto text-blue-400 mb-4" size={48} />
                  <h3 className="text-2xl  text-white mb-2">
                    Competition Participation
                  </h3>
                  <p className="text-blue-300">Perfect for aspiring writers</p>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Gift className="text-blue-400" size={20} />
                    <span className="text-blue-200">
                      Monthly Competition Entry
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <BookOpen className="text-blue-400" size={20} />
                    <span className="text-blue-200">
                      Maximum Stories per Month: 3 Stories
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <DollarSign className="text-blue-400" size={20} />
                    <span className="text-blue-200">
                      Story Publication (Optional): $10/story
                    </span>
                  </div>
                </div>
                <div className="mt-6 p-4 bg-purple-900/30 -lg">
                  <p className="text-purple-200 text-sm">
                    <strong>Competition Ready:</strong> Competition entry is
                    completely FREE! The $10 fee is only for publishing your
                    story i.e. get printed in Physical Book Anthology
                    Collections.
                  </p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 border border-purple-500/30 -xl p-8 shadow-lg">
                <div className="text-center mb-6">
                  <Sparkles
                    className="mx-auto text-purple-400 mb-4"
                    size={48}
                  />
                  <h3 className="text-2xl  text-white mb-2">
                    Story Publication
                  </h3>
                  <p className="text-purple-300">Make your story public</p>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Users className="text-purple-400" size={20} />
                    <span className="text-purple-200">
                      Public Story Showcase
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Trophy className="text-purple-400" size={20} />
                    <span className="text-purple-200">
                      Competition Eligibility
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="text-purple-400" size={20} />
                    <span className="text-purple-200">
                      Author Profile Feature
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Gift className="text-purple-400" size={20} />
                    <span className="text-purple-200">
                      Share with Friends & Family
                    </span>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-blue-900/30 -lg">
                  <p className="text-blue-200 text-sm">
                    <strong>Note:</strong> Incase if u want to purchase the
                    Physical Book Anthology Collection, contact admin through
                    contact form for pricing details.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Previous Competitions Section */}
          {previousCompetitions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-12"
            >
              <div className="text-center">
                <h2 className="text-3xl  text-white mb-4">
                  Previous Competitions
                </h2>
                <p className="text-gray-300 text-lg">
                  Celebrate our past winners and their amazing stories
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {previousCompetitions.map((competition, index) => (
                  <motion.div
                    key={competition._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="bg-gray-800/60 border border-gray-600/40 -xl p-6 shadow-lg hover:shadow-xl transition-shadow"
                  >
                    <div className="text-center mb-4">
                      <h3 className="text-xl  text-white mb-2">
                        {competition.month} {competition.year}
                      </h3>
                      <div className="flex justify-center space-x-4 text-sm text-gray-300">
                        <span>
                          {competition.totalParticipants} participants
                        </span>
                        <span>{competition.totalSubmissions} stories</span>
                      </div>
                    </div>

                    {competition.winners && competition.winners.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-lg  text-white text-center mb-3">
                          Winners
                        </h4>
                        {competition.winners.slice(0, 3).map((winner) => (
                          <div
                            key={winner.position}
                            className="flex items-center justify-between p-3 bg-gray-700/30 -lg"
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-lg">
                                {getPodiumIcon(winner.position)}
                              </span>
                              <span className="text-white text-sm">
                                {winner.childName}
                              </span>
                            </div>
                            <span className="text-gray-300 text-sm">
                              {winner.score}%
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
