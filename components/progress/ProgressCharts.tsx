// // components/progress/ProgressCharts.tsx
// 'use client';

// import { motion } from 'framer-motion';
// import {
//   LineChart,
//   Line,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   ResponsiveContainer,
//   BarChart,
//   Bar,
// } from 'recharts';

// interface ProgressChartsProps {
//   weeklyActivity: Array<{ date: string; words: number }>;
//   className?: string;
// }

// export default function ProgressCharts({
//   weeklyActivity,
//   className,
// }: ProgressChartsProps) {
//   const formatDate = (dateString: string) => {
//     return new Date(dateString).toLocaleDateString('en-US', {
//       weekday: 'short',
//     });
//   };

//   const chartData = weeklyActivity.map((day) => ({
//     ...day,
//     formattedDate: formatDate(day.date),
//   }));

//   return (
//     <motion.section
//       initial={{ opacity: 0, y: 20 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ delay: 0.3 }}
//       className={`bg-gray-800/60 backdrop-blur-xl border border-gray-600/40 rounded-xl p-6 ${className}`}
//     >
//       // components/progress/ProgressCharts.tsx (continued)
//       <h3 className="text-white  text-lg mb-6 flex items-center">
//         📈 Writing Activity (Last 7 Days)
//       </h3>
//       <div className="h-64">
//         <ResponsiveContainer width="100%" height="100%">
//           <LineChart data={chartData}>
//             <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
//             <XAxis dataKey="formattedDate" stroke="#9CA3AF" fontSize={12} />
//             <YAxis stroke="#9CA3AF" fontSize={12} />
//             <Tooltip
//               contentStyle={{
//                 backgroundColor: '#1F2937',
//                 border: '1px solid #374151',
//                 borderRadius: '8px',
//                 color: '#F9FAFB',
//               }}
//               formatter={(value: number) => [`${value} words`, 'Words Written']}
//               labelFormatter={(label) => `Day: ${label}`}
//             />
//             <Line
//               type="monotone"
//               dataKey="words"
//               stroke="#10B981"
//               strokeWidth={3}
//               dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
//               activeDot={{ r: 6, stroke: '#10B981', strokeWidth: 2 }}
//             />
//           </LineChart>
//         </ResponsiveContainer>
//       </div>
//       {/* Summary stats */}
//       <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
//         {[
//           {
//             label: 'Total Words',
//             value: chartData.reduce((sum, day) => sum + day.words, 0),
//             color: 'text-green-400',
//           },
//           {
//             label: 'Avg Per Day',
//             value: Math.round(
//               chartData.reduce((sum, day) => sum + day.words, 0) /
//                 chartData.length
//             ),
//             color: 'text-blue-400',
//           },
//           {
//             label: 'Best Day',
//             value: Math.max(...chartData.map((day) => day.words)),
//             color: 'text-purple-400',
//           },
//           {
//             label: 'Active Days',
//             value: chartData.filter((day) => day.words > 0).length,
//             color: 'text-orange-400',
//           },
//         ].map((stat, index) => (
//           <div key={stat.label} className="text-center">
//             <div className={`text-lg  ${stat.color}`}>
//               {stat.value}
//             </div>
//             <div className="text-gray-400 text-xs">{stat.label}</div>
//           </div>
//         ))}
//       </div>
//     </motion.section>
//   );
// }

// components/progress/ProgressCharts.tsx
'use client';

import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';

interface ProgressChartsProps {
  weeklyActivity: Array<{ date: string; words: number }>;
  className?: string;
}

export default function ProgressCharts({
  weeklyActivity,
  className,
}: ProgressChartsProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
    });
  };

  const chartData = weeklyActivity.map((day) => ({
    ...day,
    formattedDate: formatDate(day.date),
  }));

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className={`bg-gray-800/60 backdrop-blur-xl border border-gray-600/40 rounded-xl p-6 ${className}`}
    >
      {/* Chart title and content */}
      <h3 className="text-white  text-lg mb-6 flex items-center">
        📈 Writing Activity (Last 7 Days)
      </h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="formattedDate" stroke="#9CA3AF" fontSize={12} />
            <YAxis stroke="#9CA3AF" fontSize={12} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1F2937',
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#F9FAFB',
              }}
              formatter={(value: number) => [`${value} words`, 'Words Written']}
              labelFormatter={(label) => `Day: ${label}`}
            />
            <Line
              type="monotone"
              dataKey="words"
              stroke="#10B981"
              strokeWidth={3}
              dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#10B981', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      {/* Summary stats */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: 'Total Words',
            value: chartData.reduce((sum, day) => sum + day.words, 0),
            color: 'text-green-400',
          },
          {
            label: 'Avg Per Day',
            value: Math.round(
              chartData.reduce((sum, day) => sum + day.words, 0) /
                chartData.length
            ),
            color: 'text-blue-400',
          },
          {
            label: 'Best Day',
            value: Math.max(...chartData.map((day) => day.words)),
            color: 'text-purple-400',
          },
          {
            label: 'Active Days',
            value: chartData.filter((day) => day.words > 0).length,
            color: 'text-orange-400',
          },
        ].map((stat, index) => (
          <div key={stat.label} className="text-center">
            <div className={`text-lg  ${stat.color}`}>{stat.value}</div>
            <div className="text-gray-400 text-xs">{stat.label}</div>
          </div>
        ))}
      </div>
    </motion.section>
  );
}
