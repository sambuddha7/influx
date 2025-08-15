'use client'

import { useState, useEffect } from 'react';
import Loading from '@/components/Loading';
import Sidebar from '@/components/Sidebar';
import { useAuthState } from 'react-firebase-hooks/auth';
import { db, auth } from '@/lib/firebase';
import { doc, setDoc, getDoc, collection, getDocs, query, orderBy, where } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { BarChart3, TrendingUp, MessageCircle, Eye, Calendar, ExternalLink, RefreshCw } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { formatDistanceToNow } from 'date-fns';

interface RedditComment {
  id: string;
  comment_text: string;
  post_title: string;
  subreddit: string;
  permalink: string;
  created_utc: string;
  score: number;
  replies: number;
  post_score: number;
  post_comments: number;
  last_updated: string;
}

interface ROIMetrics {
  total_comments: number;
  total_karma: number;
  avg_score_per_comment: number;
  total_replies_generated: number;
  engagement_rate: number;
  top_performing_subreddits: { [key: string]: number };
}

export default function ROITracker() {
  const router = useRouter();
  const [user, loading] = useAuthState(auth);
  const [isLoading, setIsLoading] = useState(true);
  const [isSetupLoading, setIsSetupLoading] = useState(false);
  const [redditUsername, setRedditUsername] = useState('');
  const [inputUsername, setInputUsername] = useState('');
  const [hasUsername, setHasUsername] = useState(false);
  const [comments, setComments] = useState<RedditComment[]>([]);
  const [metrics, setMetrics] = useState<ROIMetrics | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const [alertt, setAlert] = useState<{ message: string; visible: boolean }>({
    message: "",
    visible: false,
  });
  const [greenalertt, setgreenAlert] = useState<{ message: string; visible: boolean }>({
    message: "",
    visible: false,
  });

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  // Check user authentication and setup
  useEffect(() => {
    const checkUser = async () => {
      if (!user) return;

      try {
        // Check if user has completed onboarding
        // const docRef = doc(db, 'onboarding', user.uid);
        // const docSnap = await getDoc(docRef);

        // if (!docSnap.exists()) {
        //   router.push('/onboarding');
        //   return;
        // }

        // // Check account status
        // const accountRef = doc(db, 'account-details', user.uid);
        // const accountSnap = await getDoc(accountRef);

        // if (!accountSnap.exists()) {
        //   console.error('Account details not found');
        //   setIsLoading(false);
        //   return;
        // }

        // const accountStatus = accountSnap.data()?.accountStatus;
        // if (accountStatus === 'inactive') {
        //   router.push('/no-access');
        //   return;
        // }

        // Check if Reddit username exists
        const usernameRef = doc(db, 'reddit-username', user.uid);
        const usernameSnap = await getDoc(usernameRef);

        if (usernameSnap.exists()) {
          const username = usernameSnap.data().username;
          setRedditUsername(username);
          setHasUsername(true);
          await loadROIData(username);
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Error checking user setup:', error);
        setIsLoading(false);
      }
    };

    if (user) {
      checkUser();
    } else if (!loading) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Load ROI data from Firebase
  const loadROIData = async (username: string) => {
    try {
      // Load comments
      const commentsRef = collection(db, 'reddit-comments', user!.uid, 'comments');
      const commentsQuery = query(commentsRef, orderBy('created_utc', 'desc'));
      const commentsSnap = await getDocs(commentsQuery);
      
      if (!commentsSnap.empty) {
        const commentsData = commentsSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as RedditComment[];
        
        setComments(commentsData);
        calculateMetrics(commentsData);
        
        // Get last update time
        const lastDoc = commentsSnap.docs[0];
        setLastUpdate(lastDoc.data().last_updated || '');
      }
    } catch (error) {
      console.error('Error loading ROI data:', error);
    }
  };

  // Calculate ROI metrics
  const calculateMetrics = (commentsData: RedditComment[]) => {
    if (commentsData.length === 0) {
      setMetrics(null);
      return;
    }

    const totalComments = commentsData.length;
    const totalKarma = commentsData.reduce((sum, comment) => sum + comment.score, 0);
    const totalReplies = commentsData.reduce((sum, comment) => sum + comment.replies, 0);
    const avgScore = totalKarma / totalComments;

    // Calculate engagement rate (replies + score per comment)
    const totalEngagement = totalKarma + totalReplies;
    const engagementRate = totalEngagement / totalComments;

    // Top performing subreddits
    const subredditPerformance: { [key: string]: number } = {};
    commentsData.forEach(comment => {
      if (!subredditPerformance[comment.subreddit]) {
        subredditPerformance[comment.subreddit] = 0;
      }
      subredditPerformance[comment.subreddit] += comment.score + comment.replies;
    });

    const metrics: ROIMetrics = {
      total_comments: totalComments,
      total_karma: totalKarma,
      avg_score_per_comment: Math.round(avgScore * 100) / 100,
      total_replies_generated: totalReplies,
      engagement_rate: Math.round(engagementRate * 100) / 100,
      top_performing_subreddits: subredditPerformance
    };

    setMetrics(metrics);
  };

  // Setup Reddit username
  const handleSetupUsername = async () => {
    if (!inputUsername.trim() || !user) return;

    setIsSetupLoading(true);
    try {
      // Validate username exists on Reddit
      // const response = await fetch(`${apiUrl}/validate-reddit-username`, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({
      //     username: inputUsername.trim(),
      //     user_id: user.uid
      //   }),
      // });

      // if (!response.ok) {
      //   throw new Error('Reddit username not found or invalid');
      // }

      // Save username to Firebase
      await setDoc(doc(db, 'reddit-username', user.uid), {
        username: inputUsername.trim(),
        created_at: new Date().toISOString(),
        user_id: user.uid
      });

      setRedditUsername(inputUsername.trim());
      setHasUsername(true);
      setInputUsername('');
      
      setgreenAlert({ message: "Reddit username saved successfully!", visible: true });
      setTimeout(() => {
        setgreenAlert({ message: "", visible: false });
      }, 3000);

      // Initial data fetch
      await handleUpdateData();

    } catch (error) {
      console.error('Error setting up Reddit username:', error);
      setAlert({ 
        message: "Invalid Reddit username or user not found", 
        visible: true 
      });
      setTimeout(() => {
        setAlert({ message: "", visible: false });
      }, 3000);
    } finally {
      setIsSetupLoading(false);
    }
  };

  // Update ROI data
  const handleUpdateData = async () => {
    if (!user || !redditUsername) return;

    setIsUpdating(true);
    try {
      const response = await fetch(`${apiUrl}/update-reddit-roi`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: redditUsername,
          user_id: user.uid
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update ROI data');
      }

      // Reload data from Firebase
      await loadROIData(redditUsername);
      
      setgreenAlert({ message: "ROI data updated successfully!", visible: true });
      setTimeout(() => {
        setgreenAlert({ message: "", visible: false });
      }, 3000);

    } catch (error) {
      console.error('Error updating ROI data:', error);
      setAlert({ 
        message: "Error updating ROI data", 
        visible: true 
      });
      setTimeout(() => {
        setAlert({ message: "", visible: false });
      }, 3000);
    } finally {
      setIsUpdating(false);
    }
  };

  // Prepare chart data
  // Replace your getChartData function with this debugged version:
const getChartData = () => {
  console.log('Comments for chart:', comments.length);
  
  if (!comments.length) return [];

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  console.log('Thirty days ago:', thirtyDaysAgo);

  const last30Days = comments
    .filter(comment => {
      if (!comment.created_utc) {
        console.log('Comment missing created_utc:', comment.id);
        return false;
      }
      
      let commentDate: Date;
      try {
        // Handle different date formats
        if (comment.created_utc.includes('T') || comment.created_utc.includes('Z')) {
          commentDate = new Date(comment.created_utc);
        } else {
          commentDate = new Date(comment.created_utc + 'Z');
        }
        
        // Check if date is valid
        if (isNaN(commentDate.getTime())) {
          console.log('Invalid date for comment:', comment.id, comment.created_utc);
          return false;
        }
        
        const isWithin30Days = commentDate >= thirtyDaysAgo;
        console.log('Comment date:', commentDate, 'Within 30 days:', isWithin30Days);
        return isWithin30Days;
      } catch (error) {
        console.log('Error parsing date for comment:', comment.id, error);
        return false;
      }
    })
    .sort((a, b) => {
      const dateA = new Date(a.created_utc.includes('Z') ? a.created_utc : a.created_utc + 'Z');
      const dateB = new Date(b.created_utc.includes('Z') ? b.created_utc : b.created_utc + 'Z');
      return dateA.getTime() - dateB.getTime();
    });

  console.log('Filtered comments (last 30 days):', last30Days.length);

  const groupedByDate: { [key: string]: { karma: number; comments: number } } = {};
  
  last30Days.forEach(comment => {
    try {
      let commentDate: Date;
      if (comment.created_utc.includes('T') || comment.created_utc.includes('Z')) {
        commentDate = new Date(comment.created_utc);
      } else {
        commentDate = new Date(comment.created_utc + 'Z');
      }
      
      const date = commentDate.toISOString().split('T')[0];
      if (!groupedByDate[date]) {
        groupedByDate[date] = { karma: 0, comments: 0 };
      }
      groupedByDate[date].karma += comment.score || 0;
      groupedByDate[date].comments += 1;
    } catch (error) {
      console.log('Error processing comment for chart:', comment.id, error);
    }
  });

  console.log('Grouped by date:', groupedByDate);

  const chartData = Object.entries(groupedByDate).map(([date, data]) => ({
    date,
    karma: data.karma,
    comments: data.comments,
    engagement: data.karma + data.comments
  }));

  console.log('Final chart data:', chartData);
  
  return chartData;
};

  if (isLoading) {
    return (
      <div className='flex'>
        <Sidebar />
        <div className="flex-1 p-6 space-y-6">
          <Loading />
        </div>
      </div>
    );
  }

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-6 space-y-6">
        {/* Alerts */}
        {alertt.visible && (
          <div className="fixed top-4 right-4 z-50 bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg">
            {alertt.message}
          </div>
        )}
        {greenalertt.visible && (
          <div className="fixed top-4 right-4 z-50 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg">
            {greenalertt.message}
          </div>
        )}

        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <BarChart3 className="text-orange-500" />
              ROI Tracker
            </h1>
            <p className="text-gray-400 mt-1">
              Track the performance of your Reddit comments and engagement
            </p>
          </div>
          
          {hasUsername && (
            <button
              onClick={handleUpdateData}
              disabled={isUpdating}
              className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw size={16} className={isUpdating ? 'animate-spin' : ''} />
              {isUpdating ? 'Updating...' : 'Update Data'}
            </button>
          )}
        </div>

        {/* Setup Username */}
        {!hasUsername ? (
          <div className="bg-gray-900 rounded-xl p-8 border border-gray-800">
            <div className="max-w-md mx-auto text-center">
              <BarChart3 size={64} className="mx-auto text-orange-500 mb-4" />
              <h2 className="text-xl font-semibold text-white mb-2">
                Connect Your Reddit Account
              </h2>
              <p className="text-gray-400 mb-6">
                Enter your Reddit username to start tracking the ROI of your comments and engagement.
              </p>
              
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Enter your Reddit username"
                  className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                  value={inputUsername}
                  onChange={(e) => setInputUsername(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSetupUsername()}
                />
                <button
                  onClick={handleSetupUsername}
                  disabled={!inputUsername.trim() || isSetupLoading}
                  className="w-full px-6 py-3 bg-orange-600 hover:bg-orange-500 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSetupLoading ? 'Validating...' : 'Connect Account'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* User Info */}
            <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-orange-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg">
                      {redditUsername.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-white font-medium">u/{redditUsername}</h3>
                    <p className="text-gray-400 text-sm">
                      {lastUpdate ? `Last updated ${formatDistanceToNow(new Date(lastUpdate))} ago` : 'No data yet'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Metrics Cards */}
            {metrics && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                      <MessageCircle size={20} className="text-white" />
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Total Comments</p>
                      <p className="text-white text-2xl font-bold">{metrics.total_comments}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                      <TrendingUp size={20} className="text-white" />
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Total Karma</p>
                      <p className="text-white text-2xl font-bold">{metrics.total_karma}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                      <Eye size={20} className="text-white" />
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Avg Score/Comment</p>
                      <p className="text-white text-2xl font-bold">{metrics.avg_score_per_comment}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center">
                      <BarChart3 size={20} className="text-white" />
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Engagement Rate</p>
                      <p className="text-white text-2xl font-bold">{metrics.engagement_rate}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Charts */}
            {comments.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Engagement Over Time */}
                <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                  <h3 className="text-white text-lg font-medium mb-4">Engagement Over Time (30 Days)</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={getChartData()}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="date" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1F2937', 
                          border: '1px solid #374151',
                          borderRadius: '8px'
                        }}
                      />
                      <Line type="monotone" dataKey="karma" stroke="#F59E0B" strokeWidth={2} />
                      <Line type="monotone" dataKey="comments" stroke="#3B82F6" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Top Subreddits */}
                <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                  <h3 className="text-white text-lg font-medium mb-4">Top Performing Subreddits</h3>
                  {metrics && (
                    <div className="space-y-3">
                      {Object.entries(metrics.top_performing_subreddits)
                        .sort(([,a], [,b]) => b - a)
                        .slice(0, 8)
                        .map(([subreddit, score]) => (
                          <div key={subreddit} className="flex justify-between items-center">
                            <span className="text-gray-300">r/{subreddit}</span>
                            <span className="text-orange-500 font-medium">{score}</span>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Recent Comments */}
            {comments.length > 0 && (
              <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                <h3 className="text-white text-lg font-medium mb-4">Recent Comments</h3>
                <div className="space-y-4">
                  {comments.slice(0, 5).map((comment) => (
                    <div key={comment.id} className="bg-gray-800 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-orange-500 text-sm font-medium">
                            r/{comment.subreddit}
                          </span>
                          {/* <span className="text-gray-500 text-sm">
                            {formatDistanceToNow(new Date(comment.created_utc + 'Z'))} ago
                          </span> */}
                        </div>
                        <a
                          href={`https://reddit.com${comment.permalink}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-400 hover:text-orange-500 transition-colors"
                        >
                          <ExternalLink size={16} />
                        </a>
                      </div>
                      <h4 className="text-white font-medium mb-2 text-sm">
                        {comment.post_title}
                      </h4>
                      <p className="text-gray-300 text-sm mb-3 line-clamp-2">
                        {comment.comment_text}
                      </p>
                      <div className="flex gap-4 text-xs text-gray-400">
                        <span>Score: {comment.score}</span>
                        <span>Replies: {comment.replies}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* No Data State */}
            {hasUsername && comments.length === 0 && (
              <div className="bg-gray-900 rounded-xl p-8 border border-gray-800 text-center">
                <MessageCircle size={64} className="mx-auto text-gray-600 mb-4" />
                <h3 className="text-white text-lg font-medium mb-2">
                  No Comments Found
                </h3>
                <p className="text-gray-400 mb-4">
                  We couldn't find any recent comments for your Reddit account. 
                  Try updating your data or make sure you're actively commenting.
                </p>
                <button
                  onClick={handleUpdateData}
                  className="px-6 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-lg transition-colors"
                >
                  Refresh Data
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}