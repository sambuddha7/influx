"use client";

import { useEffect, useState } from 'react';
import { MessageSquare, ThumbsUp, Reply, Clock, BarChart2 } from 'lucide-react';
import Loading from '@/components/Loading';
import Sidebar from '@/components/Sidebar';
import { useAuthState } from 'react-firebase-hooks/auth';
import { db, auth } from '@/lib/firebase';
import { 
  BarChart, Bar, 
  PieChart as RechartsePieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, 
  Legend, ResponsiveContainer
} from 'recharts';

interface Metrics {
  total_comments: number;
  total_score: number;
  total_replies: number;
  fetched_at: string;
}

export default function MetricsPage() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [error, setError] = useState<string>('');
  const [user, loading] = useAuthState(auth);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    const fetchMetrics = async () => {
      if (loading) return;

      if (!user) {
        setError('User not authenticated');
        return;
      }
      
      try {
        const response = await fetch(`${apiUrl}/metrics?userid=${user.uid}`);
        if (!response.ok) {
          throw new Error('Failed to fetch metrics');
        }
        const data = await response.json();
        setMetrics(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch metrics');
      }
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [user, loading, apiUrl]);

  if (error) {
    return (
      <div className="text-red-500 p-4 rounded-lg bg-red-50 dark:bg-red-900/10">
        Error: {error}
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className='flex'>
        <Sidebar />
        <div className="flex-1 p-6 space-y-6">
          <Loading />
        </div>
      </div>
    );
  }

  // Data preparation for charts
  const pieData = [
    { name: 'Comments', value: metrics.total_comments, color: '#ff9f43' },
    { name: 'Score', value: metrics.total_score, color: '#87CEFA' },
    { name: 'Replies', value: metrics.total_replies, color: '#ff6b6b' },
  ];

  const barData = [
    { name: 'Comments', value: metrics.total_comments },
    { name: 'Score', value: metrics.total_score },
    { name: 'Replies', value: metrics.total_replies },
  ];

  const metricTotals = metrics.total_comments + metrics.total_score + metrics.total_replies;

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-8 bg-gray-50 dark:bg-gray-900">
        <div className="space-y-6 max-w-7xl mx-auto">
          <div className="flex justify-between items-center">
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-600 to-orange-200">
              Analytics Dashboard
            </h1>
            {/* <div className="text-sm text-gray-500 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Last updated: {new Date(metrics.fetched_at).toLocaleString()}
            </div> */}
          </div>

          {/* Navigation Header - Single Tab */}
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            <div className="px-4 py-2 font-medium text-sm rounded-t-lg bg-white dark:bg-gray-800 border-b-2 border-orange-500 text-orange-600 dark:text-orange-400">
              <div className="flex items-center gap-2">
                <BarChart2 className="w-4 h-4" />
                Overview
              </div>
            </div>
          </div>

          {/* Metric Numbers */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-slate-900/50 backdrop-blur-xl rounded-lg shadow-lg p-6 border border-gray-100 dark:border-gray-800 transform transition-all hover:scale-102 hover:shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300">Comments</h3>
                <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-full">
                  <MessageSquare className="h-5 w-5 text-orange-500 dark:text-orange-400" />
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">
                {metrics.total_comments.toLocaleString()}
              </div>
              <div className="mt-2 text-sm text-green-600 dark:text-green-400">
                {Math.round((metrics.total_comments / metricTotals) * 100)}% of total activity
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900/50 backdrop-blur-xl rounded-lg shadow-lg p-6 border border-gray-100 dark:border-gray-800 transform transition-all hover:scale-102 hover:shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300">Score</h3>
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                  <ThumbsUp className="h-5 w-5 text-blue-500 dark:text-blue-400" />
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">
                {metrics.total_score.toLocaleString()}
              </div>
              <div className="mt-2 text-sm text-green-600 dark:text-green-400">
                {Math.round((metrics.total_score / metricTotals) * 100)}% of total activity
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900/50 backdrop-blur-xl rounded-lg shadow-lg p-6 border border-gray-100 dark:border-gray-800 transform transition-all hover:scale-102 hover:shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300">Replies</h3>
                <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-full">
                  <Reply className="h-5 w-5 text-red-500 dark:text-red-400" />
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">
                {metrics.total_replies.toLocaleString()}
              </div>
              <div className="mt-2 text-sm text-green-600 dark:text-green-400">
                {Math.round((metrics.total_replies / metricTotals) * 100)}% of total activity
              </div>
            </div>
          </div>

          {/* Overview Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-900/50 backdrop-blur-xl rounded-lg shadow-lg p-6 border border-gray-100 dark:border-gray-800">
              <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">Metric Comparison</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={barData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis dataKey="name" stroke="#718096" />
                    <YAxis stroke="#718096" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                        border: 'none',
                      }}
                      cursor={{ fill: 'rgba(255, 159, 67, 0.1)' }}
                    />
                    <Bar
                      dataKey="value"
                      fill="#ff9f43"
                      radius={[4, 4, 0, 0]}
                      barSize={60}
                    >
                      {barData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={index === 0 ? '#ff9f43' : index === 1 ? '#87CEFA' : '#ff6b6b'} 
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900/50 backdrop-blur-xl rounded-lg shadow-lg p-6 border border-gray-100 dark:border-gray-800">
              <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">Percentage Breakdown</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsePieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={100}
                      fill="#8884d8"
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => [`${value}`, 'Value']}
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                        border: 'none',
                      }}
                    />
                    <Legend />
                  </RechartsePieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-3 gap-4 mt-4">
                {pieData.map((item, index) => (
                  <div key={index} className="text-center">
                    <div className="text-lg font-bold" style={{ color: item.color }}>
                      {Math.round((item.value / metricTotals) * 100)}%
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{item.name}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// "use client";

// import { useEffect, useState } from 'react';
// import { MessageSquare, ThumbsUp, Reply, Clock, TrendingUp, BarChart2, PieChart } from 'lucide-react';
// import Loading from '@/components/Loading';
// import Sidebar from '@/components/Sidebar';
// import { useAuthState } from 'react-firebase-hooks/auth';
// import { db, auth } from '@/lib/firebase';
// import { 
//   BarChart, Bar, 
//   LineChart, Line, 
//   PieChart as RechartsePieChart, Pie, Cell, 
//   AreaChart, Area,
//   XAxis, YAxis, CartesianGrid, Tooltip, 
//   Legend, ResponsiveContainer, RadialBar, RadialBarChart 
// } from 'recharts';

// interface Metrics {
//   total_comments: number;
//   total_score: number;
//   total_replies: number;
//   fetched_at: string;
// }

// // Mock historical data to demonstrate time-series
// const historicalData = [
//   { month: 'Jan', comments: 42, score: 68, replies: 31 },
//   { month: 'Feb', comments: 53, score: 82, replies: 37 },
//   { month: 'Mar', comments: 61, score: 91, replies: 44 },
//   { month: 'Apr', comments: 65, score: 112, replies: 48 },
//   { month: 'May', comments: 72, score: 130, replies: 53 },
//   { month: 'Jun', comments: 85, score: 142, replies: 65 },
// ];

// export default function MetricsPage() {
//   const [metrics, setMetrics] = useState<Metrics | null>(null);
//   const [error, setError] = useState<string>('');
//   const [user, loading] = useAuthState(auth);
//   const [activeTab, setActiveTab] = useState<'overview' | 'trends' | 'distribution'>('overview');

//   const apiUrl = process.env.NEXT_PUBLIC_API_URL;

//   useEffect(() => {
//     const fetchMetrics = async () => {
//       if (loading) return;

//       if (!user) {
//         setError('User not authenticated');
//         return;
//       }
      
//       try {
//         const response = await fetch(`${apiUrl}/metrics?userid=${user.uid}`);
//         if (!response.ok) {
//           throw new Error('Failed to fetch metrics');
//         }
//         const data = await response.json();
//         setMetrics(data);
//       } catch (err) {
//         setError(err instanceof Error ? err.message : 'Failed to fetch metrics');
//       }
//     };

//     fetchMetrics();
//     const interval = setInterval(fetchMetrics, 5 * 60 * 1000);
//     return () => clearInterval(interval);
//   }, [user, loading, apiUrl]);

//   if (error) {
//     return (
//       <div className="text-red-500 p-4 rounded-lg bg-red-50 dark:bg-red-900/10">
//         Error: {error}
//       </div>
//     );
//   }

//   if (!metrics) {
//     return (
//       <div className='flex'>
//         <Sidebar />
//         <div className="flex-1 p-6 space-y-6">
//           <Loading />
//         </div>
//       </div>
//     );
//   }

//   // Data preparation for charts
//   const pieData = [
//     { name: 'Comments', value: metrics.total_comments, color: '#ff9f43' },
//     { name: 'Score', value: metrics.total_score, color: '#87CEFA' },
//     { name: 'Replies', value: metrics.total_replies, color: '#ff6b6b' },
//   ];

//   const radialData = pieData.map(item => ({
//     ...item,
//     fill: item.color
//   }));

//   const barData = [
//     { name: 'Comments', value: metrics.total_comments },
//     { name: 'Score', value: metrics.total_score },
//     { name: 'Replies', value: metrics.total_replies },
//   ];

//   const metricTotals = metrics.total_comments + metrics.total_score + metrics.total_replies;

//   return (
//     <div className="flex">
//       <Sidebar />
//       <main className="flex-1 p-8 bg-gray-50 dark:bg-gray-900">
//         <div className="space-y-6 max-w-7xl mx-auto">
//           <div className="flex justify-between items-center">
//             <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-600 to-orange-200">
//               Analytics Dashboard
//             </h1>
//             <div className="text-sm text-gray-500 flex items-center gap-2">
//               <Clock className="h-4 w-4" />
//               Last updated: {new Date(metrics.fetched_at).toLocaleString()}
//             </div>
//           </div>

//           {/* Navigation Tabs */}
//           <div className="flex space-x-2 border-b border-gray-200 dark:border-gray-700">
//             <button
//               onClick={() => setActiveTab('overview')}
//               className={`px-4 py-2 font-medium text-sm rounded-t-lg transition-colors ${
//                 activeTab === 'overview'
//                   ? 'bg-white dark:bg-gray-800 border-b-2 border-orange-500 text-orange-600 dark:text-orange-400'
//                   : 'text-gray-600 dark:text-gray-400 hover:text-orange-500 dark:hover:text-orange-400'
//               }`}
//             >
//               <div className="flex items-center gap-2">
//                 <BarChart2 className="w-4 h-4" />
//                 Overview
//               </div>
//             </button>
//             <button
//               onClick={() => setActiveTab('trends')}
//               className={`px-4 py-2 font-medium text-sm rounded-t-lg transition-colors ${
//                 activeTab === 'trends'
//                   ? 'bg-white dark:bg-gray-800 border-b-2 border-orange-500 text-orange-600 dark:text-orange-400'
//                   : 'text-gray-600 dark:text-gray-400 hover:text-orange-500 dark:hover:text-orange-400'
//               }`}
//             >
//               <div className="flex items-center gap-2">
//                 <TrendingUp className="w-4 h-4" />
//                 Trends
//               </div>
//             </button>
//             <button
//               onClick={() => setActiveTab('distribution')}
//               className={`px-4 py-2 font-medium text-sm rounded-t-lg transition-colors ${
//                 activeTab === 'distribution'
//                   ? 'bg-white dark:bg-gray-800 border-b-2 border-orange-500 text-orange-600 dark:text-orange-400'
//                   : 'text-gray-600 dark:text-gray-400 hover:text-orange-500 dark:hover:text-orange-400'
//               }`}
//             >
//               <div className="flex items-center gap-2">
//                 <PieChart className="w-4 h-4" />
//                 Distribution
//               </div>
//             </button>
//           </div>

//           {/* Metric Numbers */}
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//             <div className="bg-white dark:bg-slate-900/50 backdrop-blur-xl rounded-lg shadow-lg p-6 border border-gray-100 dark:border-gray-800 transform transition-all hover:scale-102 hover:shadow-xl">
//               <div className="flex items-center justify-between mb-4">
//                 <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300">Comments</h3>
//                 <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-full">
//                   <MessageSquare className="h-5 w-5 text-orange-500 dark:text-orange-400" />
//                 </div>
//               </div>
//               <div className="text-3xl font-bold text-gray-900 dark:text-white">
//                 {metrics.total_comments.toLocaleString()}
//               </div>
//               <div className="mt-2 text-sm text-green-600 dark:text-green-400">
//                 {Math.round((metrics.total_comments / metricTotals) * 100)}% of total activity
//               </div>
//             </div>

//             <div className="bg-white dark:bg-slate-900/50 backdrop-blur-xl rounded-lg shadow-lg p-6 border border-gray-100 dark:border-gray-800 transform transition-all hover:scale-102 hover:shadow-xl">
//               <div className="flex items-center justify-between mb-4">
//                 <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300">Score</h3>
//                 <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
//                   <ThumbsUp className="h-5 w-5 text-blue-500 dark:text-blue-400" />
//                 </div>
//               </div>
//               <div className="text-3xl font-bold text-gray-900 dark:text-white">
//                 {metrics.total_score.toLocaleString()}
//               </div>
//               <div className="mt-2 text-sm text-green-600 dark:text-green-400">
//                 {Math.round((metrics.total_score / metricTotals) * 100)}% of total activity
//               </div>
//             </div>

//             <div className="bg-white dark:bg-slate-900/50 backdrop-blur-xl rounded-lg shadow-lg p-6 border border-gray-100 dark:border-gray-800 transform transition-all hover:scale-102 hover:shadow-xl">
//               <div className="flex items-center justify-between mb-4">
//                 <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300">Replies</h3>
//                 <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-full">
//                   <Reply className="h-5 w-5 text-red-500 dark:text-red-400" />
//                 </div>
//               </div>
//               <div className="text-3xl font-bold text-gray-900 dark:text-white">
//                 {metrics.total_replies.toLocaleString()}
//               </div>
//               <div className="mt-2 text-sm text-green-600 dark:text-green-400">
//                 {Math.round((metrics.total_replies / metricTotals) * 100)}% of total activity
//               </div>
//             </div>
//           </div>

//           {/* Tab Content */}
//           {activeTab === 'overview' && (
//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//               <div className="bg-white dark:bg-slate-900/50 backdrop-blur-xl rounded-lg shadow-lg p-6 border border-gray-100 dark:border-gray-800">
//                 <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">Metric Comparison</h3>
//                 <div className="h-80">
//                   <ResponsiveContainer width="100%" height="100%">
//                     <BarChart
//                       data={barData}
//                       margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
//                     >
//                       <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
//                       <XAxis dataKey="name" stroke="#718096" />
//                       <YAxis stroke="#718096" />
//                       <Tooltip
//                         contentStyle={{
//                           backgroundColor: 'rgba(255, 255, 255, 0.95)',
//                           borderRadius: '8px',
//                           boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
//                           border: 'none',
//                         }}
//                         cursor={{ fill: 'rgba(255, 159, 67, 0.1)' }}
//                       />
//                       <Bar
//                         dataKey="value"
//                         fill="#ff9f43"
//                         radius={[4, 4, 0, 0]}
//                         barSize={60}
//                       >
//                         {barData.map((entry, index) => (
//                           <Cell 
//                             key={`cell-${index}`} 
//                             fill={index === 0 ? '#ff9f43' : index === 1 ? '#87CEFA' : '#ff6b6b'} 
//                           />
//                         ))}
//                       </Bar>
//                     </BarChart>
//                   </ResponsiveContainer>
//                 </div>
//               </div>

//               <div className="bg-white dark:bg-slate-900/50 backdrop-blur-xl rounded-lg shadow-lg p-6 border border-gray-100 dark:border-gray-800">
//                 <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">Metric Distribution</h3>
//                 <div className="h-80">
//                   <ResponsiveContainer width="100%" height="100%">
//                     <RechartsePieChart>
//                       <Pie
//                         data={pieData}
//                         cx="50%"
//                         cy="50%"
//                         innerRadius={60}
//                         outerRadius={100}
//                         fill="#8884d8"
//                         paddingAngle={3}
//                         dataKey="value"
//                         label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
//                       >
//                         {pieData.map((entry, index) => (
//                           <Cell key={`cell-${index}`} fill={entry.color} />
//                         ))}
//                       </Pie>
//                       <Tooltip
//                         formatter={(value) => [`${value}`, 'Value']}
//                         contentStyle={{
//                           backgroundColor: 'rgba(255, 255, 255, 0.95)',
//                           borderRadius: '8px',
//                           boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
//                           border: 'none',
//                         }}
//                       />
//                       <Legend />
//                     </RechartsePieChart>
//                   </ResponsiveContainer>
//                 </div>
//               </div>
//             </div>
//           )}

//           {activeTab === 'trends' && (
//             <div className="grid grid-cols-1 gap-6">
//               <div className="bg-white dark:bg-slate-900/50 backdrop-blur-xl rounded-lg shadow-lg p-6 border border-gray-100 dark:border-gray-800">
//                 <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">Monthly Performance Trend</h3>
//                 <div className="h-96">
//                   <ResponsiveContainer width="100%" height="100%">
//                     <AreaChart
//                       data={historicalData}
//                       margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
//                     >
//                       <defs>
//                         <linearGradient id="colorComments" x1="0" y1="0" x2="0" y2="1">
//                           <stop offset="5%" stopColor="#ff9f43" stopOpacity={0.8} />
//                           <stop offset="95%" stopColor="#ff9f43" stopOpacity={0.1} />
//                         </linearGradient>
//                         <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
//                           <stop offset="5%" stopColor="#87CEFA" stopOpacity={0.8} />
//                           <stop offset="95%" stopColor="#87CEFA" stopOpacity={0.1} />
//                         </linearGradient>
//                         <linearGradient id="colorReplies" x1="0" y1="0" x2="0" y2="1">
//                           <stop offset="5%" stopColor="#ff6b6b" stopOpacity={0.8} />
//                           <stop offset="95%" stopColor="#ff6b6b" stopOpacity={0.1} />
//                         </linearGradient>
//                       </defs>
//                       <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
//                       <XAxis dataKey="month" stroke="#718096" />
//                       <YAxis stroke="#718096" />
//                       <Tooltip
//                         contentStyle={{
//                           backgroundColor: 'rgba(255, 255, 255, 0.95)',
//                           borderRadius: '8px',
//                           boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
//                           border: 'none',
//                         }}
//                       />
//                       <Legend />
//                       <Area
//                         type="monotone"
//                         dataKey="score"
//                         stroke="#87CEFA"
//                         fillOpacity={1}
//                         fill="url(#colorScore)"
//                       />
//                       <Area
//                         type="monotone"
//                         dataKey="comments"
//                         stroke="#ff9f43"
//                         fillOpacity={1}
//                         fill="url(#colorComments)"
//                       />
//                       <Area
//                         type="monotone"
//                         dataKey="replies"
//                         stroke="#ff6b6b"
//                         fillOpacity={1}
//                         fill="url(#colorReplies)"
//                       />
//                     </AreaChart>
//                   </ResponsiveContainer>
//                 </div>
//               </div>

//               <div className="bg-white dark:bg-slate-900/50 backdrop-blur-xl rounded-lg shadow-lg p-6 border border-gray-100 dark:border-gray-800">
//                 <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">Performance Metrics Comparison</h3>
//                 <div className="h-80">
//                   <ResponsiveContainer width="100%" height="100%">
//                     <LineChart
//                       data={historicalData}
//                       margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
//                     >
//                       <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
//                       <XAxis dataKey="month" stroke="#718096" />
//                       <YAxis stroke="#718096" />
//                       <Tooltip
//                         contentStyle={{
//                           backgroundColor: 'rgba(255, 255, 255, 0.95)',
//                           borderRadius: '8px',
//                           boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
//                           border: 'none',
//                         }}
//                       />
//                       <Legend />
//                       <Line
//                         type="monotone"
//                         dataKey="comments"
//                         stroke="#ff9f43"
//                         strokeWidth={3}
//                         dot={{ r: 6, strokeWidth: 2 }}
//                         activeDot={{ r: 8, strokeWidth: 0, fill: '#ff9f43' }}
//                       />
//                       <Line
//                         type="monotone"
//                         dataKey="score"
//                         stroke="#87CEFA"
//                         strokeWidth={3}
//                         dot={{ r: 6, strokeWidth: 2 }}
//                         activeDot={{ r: 8, strokeWidth: 0, fill: '#87CEFA' }}
//                       />
//                       <Line
//                         type="monotone"
//                         dataKey="replies"
//                         stroke="#ff6b6b"
//                         strokeWidth={3}
//                         dot={{ r: 6, strokeWidth: 2 }}
//                         activeDot={{ r: 8, strokeWidth: 0, fill: '#ff6b6b' }}
//                       />
//                     </LineChart>
//                   </ResponsiveContainer>
//                 </div>
//               </div>
//             </div>
//           )}

//           {activeTab === 'distribution' && (
//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//               <div className="bg-white dark:bg-slate-900/50 backdrop-blur-xl rounded-lg shadow-lg p-6 border border-gray-100 dark:border-gray-800">
//                 <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">Metric Distribution</h3>
//                 <div className="h-80">
//                   <ResponsiveContainer width="100%" height="100%">
//                     <RadialBarChart 
//                       cx="50%" 
//                       cy="50%" 
//                       innerRadius="20%" 
//                       outerRadius="90%" 
//                       data={radialData} 
//                       startAngle={90} 
//                       endAngle={-270}
//                     >
//                       <RadialBar
//                         minAngle={15}
//                         background
//                         clockWise
//                         dataKey="value"
//                         cornerRadius={10}
//                         label={{ position: 'insideStart', fill: '#fff', fontWeight: 600 }}
//                       />
//                       <Tooltip
//                         formatter={(value, name) => [`${value}`, name]}
//                         contentStyle={{
//                           backgroundColor: 'rgba(255, 255, 255, 0.95)',
//                           borderRadius: '8px',
//                           boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
//                           border: 'none',
//                         }}
//                       />
//                       <Legend iconSize={10} layout="vertical" verticalAlign="middle" align="right" />
//                     </RadialBarChart>
//                   </ResponsiveContainer>
//                 </div>
//               </div>

//               <div className="bg-white dark:bg-slate-900/50 backdrop-blur-xl rounded-lg shadow-lg p-6 border border-gray-100 dark:border-gray-800">
//                 <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">Percentage Breakdown</h3>
//                 <div className="h-80">
//                   <ResponsiveContainer width="100%" height="100%">
//                     <RechartsePieChart>
//                       <Pie
//                         data={pieData}
//                         cx="50%"
//                         cy="50%"
//                         innerRadius={80}
//                         outerRadius={100}
//                         fill="#8884d8"
//                         paddingAngle={3}
//                         dataKey="value"
//                       >
//                         {pieData.map((entry, index) => (
//                           <Cell key={`cell-${index}`} fill={entry.color} />
//                         ))}
//                       </Pie>
//                       <Tooltip
//                         formatter={(value) => [`${value}`, 'Value']}
//                         contentStyle={{
//                           backgroundColor: 'rgba(255, 255, 255, 0.95)',
//                           borderRadius: '8px',
//                           boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
//                           border: 'none',
//                         }}
//                       />
//                       <Legend />
//                     </RechartsePieChart>
//                   </ResponsiveContainer>
//                 </div>
//                 <div className="grid grid-cols-3 gap-4 mt-4">
//                   {pieData.map((item, index) => (
//                     <div key={index} className="text-center">
//                       <div className="text-lg font-bold" style={{ color: item.color }}>
//                         {Math.round((item.value / metricTotals) * 100)}%
//                       </div>
//                       <div className="text-sm text-gray-600 dark:text-gray-400">{item.name}</div>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>
//       </main>
//     </div>
//   );
// }
