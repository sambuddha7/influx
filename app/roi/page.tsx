"use client";

import { useEffect, useState } from 'react';
import { MessageSquare, ThumbsUp, Reply, Clock } from 'lucide-react';
import { ResponsiveLine } from '@nivo/line';
import Loading from '@/components/Loading';
import Sidebar from '@/components/Sidebar';


interface Metrics {
  total_comments: number;
  total_score: number;
  total_replies: number;
  fetched_at: string;
}

export default function MetricsPage() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await fetch(`http://localhost:8000/metrics`);
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
  }, []);

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

  const chartData = [
    {
      id: 'Metrics',
      data: [
        { x: 'Comments', y: metrics.total_comments },
        { x: 'Score', y: metrics.total_score },
        { x: 'Replies', y: metrics.total_replies },
      ],
    },
  ];

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-8">
    <div className="space-y-6">
      <div className="flex justify-between items-center">
      <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-600 to-orange-200">
              Analytics
        </h1>
        <div className="text-sm text-gray-500 flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Last updated: {new Date(metrics.fetched_at).toLocaleString()}
        </div>
      </div>

      {/* Metric Numbers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900/50 backdrop-blur-xl rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300">Comments</h3>
            <MessageSquare className="h-4 w-4 text-gray-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {metrics.total_comments}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900/50 backdrop-blur-xl rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300">Score</h3>
            <ThumbsUp className="h-4 w-4 text-gray-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {metrics.total_score}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900/50 backdrop-blur-xl rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300">Replies</h3>
            <Reply className="h-4 w-4 text-gray-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {metrics.total_replies}
          </div>
        </div>
      </div>

      {/* Line Chart */}
      <div className="bg-white dark:bg-slate-900/50 backdrop-blur-xl rounded-lg shadow p-4">
        <div style={{ height: '300px' }}>
          <ResponsiveLine
            data={chartData}
            margin={{ top: 30, right: 30, bottom: 50, left: 40 }}
            xScale={{ type: 'point' }}
            yScale={{
              type: 'linear',
              min: 0,
              max: 'auto',
            }}
            axisBottom={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              legend: 'Metric',
              legendOffset: 36,
              legendPosition: 'middle',
            }}
            axisLeft={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              legend: 'Value',
              legendOffset: -40,
              legendPosition: 'middle',
            }}
            pointSize={8}
            pointColor={(point: { x: string }) =>
            point.x === 'Score'
              ? 'rgb(34, 98, 192)' // Blue for Score
              : 'rgb(242, 153, 74)' // Orange for Comments and Replies
            }
            pointBorderWidth={2}
            pointBorderColor={{ from: 'serieColor' }}
            lineWidth={3}
            colors="rgb(242, 153, 74)" // Orange line
            useMesh={true}
            theme={{
              axis: {
                ticks: {
                  text: {
                    fill: '#2C5282', // Navy blue for tick labels
                  },
                },
              },
              grid: {
                line: {
                  stroke: '#E5E7EB', // Light gray grid lines
                },
              },
            }}
          />
        </div>
      </div>
    </div>
    </main>
    </div>
  );
}
