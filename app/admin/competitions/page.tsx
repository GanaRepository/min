// app/admin/competitions/page.tsx - COMPLETE REPLACEMENT
'use client';

import { useState, useEffect } from 'react';
import { Trophy, Users, Calendar, TrendingUp, Eye, Award, Clock } from 'lucide-react';

interface Competition {
  _id: string;
  month: string;
  year: number;
  phase: 'submission' | 'judging' | 'results';
  totalSubmissions: number;
  totalParticipants: number;
  isActive: boolean;
  winners?: Array<{
    position: number;
    childName: string;
    title: string;
    score: number;
  }>;
  daysLeft?: number;
}

export default function AdminCompetitions() {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCompetition, setSelectedCompetition] = useState<Competition | null>(null);

  useEffect(() => {
    fetchCompetitions();
  }, []);

  const fetchCompetitions = async () => {
    try {
      // Fetch current competition
      const currentResponse = await fetch('/api/competitions/current');
      const currentData = await currentResponse.json();
      
      // Fetch past competitions
      const pastResponse = await fetch('/api/competitions/past');
      const pastData = await pastResponse.json();

      const allCompetitions = [];
      if (currentData.competition) {
        allCompetitions.push(currentData.competition);
      }
      if (pastData.competitions) {
        allCompetitions.push(...pastData.competitions);
      }

      setCompetitions(allCompetitions);
    } catch (error) {
      console.error('Error fetching competitions:', error);
    } finally {
      setLoading(false);
    }
  };

  const currentCompetition = competitions.find(c => c.isActive);

  if (loading) {
    return <div className="p-6">Loading competitions...</div>;
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Competition Management</h1>
        <p className="text-gray-600">Automated monthly competitions - view results and analytics</p>
      </div>

      {/* Current Competition Status */}
      {currentCompetition && (
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Current Competition Status</h2>
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {currentCompetition.phase.toUpperCase()}
              </div>
              <div className="text-sm text-gray-600">Current Phase</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {currentCompetition.totalSubmissions || 0}
              </div>
              <div className="text-sm text-gray-600">Total Submissions</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {currentCompetition.totalParticipants || 0}
              </div>
              <div className="text-sm text-gray-600">Participants</div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">
                {currentCompetition.daysLeft || 0}
              </div>
              <div className="text-sm text-gray-600">Days Left</div>
            </div>
          </div>
          
          {/* Winners display for current competition */}
          {currentCompetition.phase === 'results' && currentCompetition.winners && (
            <div className="mt-4 bg-yellow-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-2">🏆 Current Winners</h3>
              <div className="space-y-1">
                {currentCompetition.winners.map((winner) => (
                  <div key={winner.position} className="flex items-center gap-2 text-sm">
                    <span className="text-lg">
                      {winner.position === 1 ? '🥇' : winner.position === 2 ? '🥈' : '🥉'}
                    </span>
                    <span className="font-medium">{winner.childName}</span>
                    <span className="text-gray-600">- "{winner.title}" ({winner.score}%)</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Competition History Table */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Competition History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Period</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Phase</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Submissions</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Participants</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Winner</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {competitions.map((competition) => (
                <tr key={competition._id}>
                  <td className="px-4 py-3 text-sm font-medium">
                    {competition.month} {competition.year}
                    {competition.isActive && (
                      <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                        Current
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      competition.phase === 'results' ? 'bg-green-100 text-green-800' :
                      competition.phase === 'judging' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {competition.phase}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">{competition.totalSubmissions || 0}</td>
                 <td className="px-4 py-3 text-sm">{competition.totalParticipants || 0}</td>
                 <td className="px-4 py-3 text-sm">
                   {competition.winners && competition.winners.length > 0 ? 
                     `${competition.winners[0]?.childName} (${competition.winners[0]?.score}%)` : 
                     'Pending'
                   }
                 </td>
                 <td className="px-4 py-3 text-sm">
                   <button 
                     onClick={() => setSelectedCompetition(competition)}
                     className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                   >
                     <Eye size={16} />
                     View Details
                   </button>
                 </td>
               </tr>
             ))}
           </tbody>
         </table>
       </div>
     </div>

     {/* Competition Details Modal */}
     {selectedCompetition && (
       <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
         <div className="bg-white rounded-lg p-6 max-w-2xl max-h-[80vh] overflow-y-auto">
           <div className="flex justify-between items-center mb-4">
             <h3 className="text-xl font-bold">
               {selectedCompetition.month} {selectedCompetition.year} Competition
             </h3>
             <button
               onClick={() => setSelectedCompetition(null)}
               className="text-gray-500 hover:text-gray-700 text-xl"
             >
               ×
             </button>
           </div>
           
           <div className="space-y-4">
             <div className="grid grid-cols-2 gap-4">
               <div className="bg-gray-50 p-3 rounded">
                 <div className="text-sm text-gray-600">Phase</div>
                 <div className="font-semibold">{selectedCompetition.phase.toUpperCase()}</div>
               </div>
               <div className="bg-gray-50 p-3 rounded">
                 <div className="text-sm text-gray-600">Status</div>
                 <div className="font-semibold">
                   {selectedCompetition.isActive ? 'Active' : 'Completed'}
                 </div>
               </div>
               <div className="bg-gray-50 p-3 rounded">
                 <div className="text-sm text-gray-600">Submissions</div>
                 <div className="font-semibold">{selectedCompetition.totalSubmissions || 0}</div>
               </div>
               <div className="bg-gray-50 p-3 rounded">
                 <div className="text-sm text-gray-600">Participants</div>
                 <div className="font-semibold">{selectedCompetition.totalParticipants || 0}</div>
               </div>
             </div>

             {selectedCompetition.winners && selectedCompetition.winners.length > 0 && (
               <div>
                 <h4 className="font-semibold mb-2">🏆 Winners</h4>
                 <div className="space-y-2">
                   {selectedCompetition.winners.map((winner) => (
                     <div key={winner.position} className="flex items-center gap-3 p-3 bg-yellow-50 rounded">
                       <span className="text-2xl">
                         {winner.position === 1 ? '🥇' : winner.position === 2 ? '🥈' : '🥉'}
                       </span>
                       <div className="flex-1">
                         <div className="font-medium">{winner.childName}</div>
                         <div className="text-sm text-gray-600">"{winner.title}"</div>
                       </div>
                       <div className="font-bold text-lg">{winner.score}%</div>
                     </div>
                   ))}
                 </div>
               </div>
             )}
           </div>
         </div>
       </div>
     )}
   </div>
 );
}