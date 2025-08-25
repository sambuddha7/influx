import { useState, useEffect, useCallback } from 'react';
import { doc, setDoc, getDoc, collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { RedditPostData, ArchivedPost, GeneratedPost, ROIMetrics, PostsMetrics } from '@/types/archive';
import * as d3 from 'd3';

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

export const useRedditAnalytics = (user: any) => {
  // Username management
  const [redditUsername, setRedditUsername] = useState('');
  const [inputUsername, setInputUsername] = useState('');
  const [hasUsername, setHasUsername] = useState(false);
  const [isSetupLoading, setIsSetupLoading] = useState(false);

  // ROI data
  const [roiComments, setRoiComments] = useState<Array<{
    id: string;
    score: number;
    replies: number;
    created_utc: string;
    subreddit: string;
    permalink: string;
    post_title: string;
    comment_text: string;
    last_updated?: string;
    reply_count?: number;
  }>>([]);
  
  const [roiMetrics, setRoiMetrics] = useState<ROIMetrics | null>(null);
  const [isUpdatingRoi, setIsUpdatingRoi] = useState(false);
  const [lastRoiUpdate, setLastRoiUpdate] = useState<string>('');

  // Posts analytics
  const [userRedditPosts, setUserRedditPosts] = useState<RedditPostData[]>([]);
  const [postsMetrics, setPostsMetrics] = useState<PostsMetrics | null>(null);
  const [isLoadingPostsAnalytics, setIsLoadingPostsAnalytics] = useState(false);

  // Auto-refresh management
  const [lastCommentsRefresh, setLastCommentsRefresh] = useState<string>('');
  const [lastPostsRefresh, setLastPostsRefresh] = useState<string>('');
  const [isAutoRefreshing, setIsAutoRefreshing] = useState(false);

  // Helper function to check if data needs refreshing (older than 5 minutes)
  const shouldRefreshData = useCallback((lastRefreshTime: string) => {
    if (!lastRefreshTime) return true;
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    return new Date(lastRefreshTime) < fiveMinutesAgo;
  }, []);

  // Internal function to refresh ROI data from Reddit API
  const refreshROIFromReddit = useCallback(async (username: string) => {
    if (!user) return;
    
    try {
      const response = await fetch(`${apiUrl}/update-reddit-roi`, {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username,
          user_id: user.uid
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update ROI: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error refreshing ROI from Reddit:', error);
      throw error;
    }
  }, [user]);

  // Enhanced loadROIData with auto-refresh capability
  const loadROIData = useCallback(async (username: string, forceRefresh = false) => {
    if (!user) return;
    
    // Check if we should auto-refresh from Reddit API
    const shouldAutoRefresh = forceRefresh || shouldRefreshData(lastCommentsRefresh);
    
    if (shouldAutoRefresh) {
      setIsAutoRefreshing(true);
      try {
        // First, fetch fresh data from Reddit
        await refreshROIFromReddit(username);
        setLastCommentsRefresh(new Date().toISOString());
      } catch (error) {
        console.error('Error auto-refreshing ROI data:', error);
      } finally {
        setIsAutoRefreshing(false);
      }
    }
    
    try {
      const commentsRef = collection(db, 'reddit-comments', user.uid, 'comments');
      const commentsQuery = query(commentsRef, orderBy('created_utc', 'desc'));
      const commentsSnap = await getDocs(commentsQuery);
      
      if (!commentsSnap.empty) {
        const commentsData = commentsSnap.docs.map((doc: { data: () => { score?: number | undefined; replies?: number | undefined; subreddit?: string | undefined; created_utc?: string | undefined; permalink?: string | undefined; post_title?: string | undefined; comment_text?: string | undefined; last_updated?: string | undefined; reply_count?: number | undefined; }; id: any; }) => {
          const data = doc.data() as {
            score?: number;
            replies?: number;
            subreddit?: string;
            created_utc?: string;
            permalink?: string;
            post_title?: string;
            comment_text?: string;
            last_updated?: string;
            reply_count?: number;
          };
          return {
            id: doc.id,
            score: data.score || 0,
            replies: data.replies || 0,
            subreddit: data.subreddit || '',
            created_utc: data.created_utc || '',
            permalink: data.permalink || '',
            post_title: data.post_title || '',
            comment_text: data.comment_text || '',
            last_updated: data.last_updated,
            reply_count: data.reply_count || data.replies || 0
          };
        });
        
        setRoiComments(commentsData);
        
        const lastDoc = commentsSnap.docs[0];
        setLastRoiUpdate(lastDoc.data().last_updated || '');
      }
    } catch (error) {
      console.error('Error loading ROI data:', error);
    }
  }, [user, shouldRefreshData, lastCommentsRefresh, refreshROIFromReddit]);

  // Check for Reddit username and auto-load data
  useEffect(() => {
    if (!user) return;
    
    const checkRedditUsername = async () => {
      try {
        const usernameRef = doc(db, 'reddit-username', user.uid);
        const usernameSnap = await getDoc(usernameRef);
        
        if (usernameSnap.exists()) {
          const username = usernameSnap.data().username;
          setRedditUsername(username);
          setHasUsername(true);
          
          // Auto-load ROI data when username is found
          await loadROIData(username);
        }
      } catch (error) {
        console.error('Error checking Reddit username:', error);
      }
    };
    
    checkRedditUsername();
  }, [user, loadROIData]);

  const handleSetupUsername = async () => {
    if (!inputUsername.trim() || !user) return;

    setIsSetupLoading(true);
    try {
      await setDoc(doc(db, 'reddit-username', user.uid), {
        username: inputUsername.trim(),
        created_at: new Date().toISOString(),
        user_id: user.uid
      });

      setRedditUsername(inputUsername.trim());
      setHasUsername(true);
      setInputUsername('');
      
      await handleUpdateROI();
    } catch (error) {
      console.error('Error setting up Reddit username:', error);
    } finally {
      setIsSetupLoading(false);
    }
  };

  const calculateROIMetrics = useCallback((commentsData: Array<{score: number; replies: number; subreddit: string}>) => {
    if (commentsData.length === 0) {
      setRoiMetrics(null);
      return;
    }

    const totalComments = commentsData.length;
    const totalKarma = commentsData.reduce((sum, comment) => sum + comment.score, 0);
    const totalReplies = commentsData.reduce((sum, comment) => sum + comment.replies, 0);
    const avgScore = totalKarma / totalComments;
    const engagementRate = (totalKarma + totalReplies) / totalComments;

    const subredditPerformance: { [key: string]: number } = {};
    commentsData.forEach(comment => {
      if (!subredditPerformance[comment.subreddit]) {
        subredditPerformance[comment.subreddit] = 0;
      }
      subredditPerformance[comment.subreddit] += comment.score + comment.replies;
    });

    setRoiMetrics({
      total_comments: totalComments,
      total_karma: totalKarma,
      avg_score_per_comment: Math.round(avgScore * 100) / 100,
      total_replies_generated: totalReplies,
      engagement_rate: Math.round(engagementRate * 100) / 100,
      top_performing_subreddits: subredditPerformance
    });
  }, []);

  const handleUpdateROI = async () => {
    if (!user || !redditUsername) return;

    setIsUpdatingRoi(true);
    try {
      await refreshROIFromReddit(redditUsername);
      setLastCommentsRefresh(new Date().toISOString());
      
      // Load the updated data from Firebase
      await loadROIData(redditUsername, false);
    } catch (error) {
      console.error('Error updating ROI data:', error);
    } finally {
      setIsUpdatingRoi(false);
    }
  };

  const calculatePostsMetrics = (postsData: RedditPostData[]) => {
    if (postsData.length === 0) {
      setPostsMetrics(null);
      return;
    }

    const totalPosts = postsData.length;
    const totalUpvotes = postsData.reduce((sum, post) => sum + (post.score || 0), 0);
    const totalComments = postsData.reduce((sum, post) => sum + (post.num_comments || 0), 0);
    const avgUpvotes = totalUpvotes / totalPosts;
    const avgComments = totalComments / totalPosts;

    // Subreddit performance
    const subredditPerformance: { [key: string]: number } = {};
    postsData.forEach(post => {
      const subreddit = post.subreddit || 'unknown';
      if (!subredditPerformance[subreddit]) {
        subredditPerformance[subreddit] = 0;
      }
      subredditPerformance[subreddit] += (post.score || 0) + (post.num_comments || 0);
    });

    setPostsMetrics({
      total_posts: totalPosts,
      total_upvotes: totalUpvotes,
      total_comments: totalComments,
      avg_upvotes_per_post: Math.round(avgUpvotes * 100) / 100,
      avg_comments_per_post: Math.round(avgComments * 100) / 100,
      engagement_rate: Math.round(((totalUpvotes + totalComments) / totalPosts) * 100) / 100,
      top_performing_subreddits: subredditPerformance
    });
  };

  // Internal function to refresh posts data from Reddit API
  const refreshPostsFromReddit = useCallback(async (username: string) => {
    if (!user) return;
    
    try {
      const fetchResponse = await fetch(`${apiUrl}/fetch-reddit-posts`, {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          username: username,
          user_id: user.uid 
        })
      });

      if (!fetchResponse.ok) {
        throw new Error(`Failed to fetch Reddit posts: ${fetchResponse.statusText}`);
      }
    } catch (error) {
      console.error('Error refreshing posts from Reddit:', error);
      throw error;
    }
  }, [user]);

  const loadPostsAnalytics = useCallback(async (username: string, forceRefresh = false) => {
    setIsLoadingPostsAnalytics(true);
    
    try {
      // Check if we should auto-refresh from Reddit API
      const shouldAutoRefresh = forceRefresh || shouldRefreshData(lastPostsRefresh);
      
      if (shouldAutoRefresh) {
        setIsAutoRefreshing(true);
        try {
          // First, fetch fresh data from Reddit
          await refreshPostsFromReddit(username);
          setLastPostsRefresh(new Date().toISOString());
        } catch (error) {
          console.error('Error auto-refreshing posts data:', error);
        } finally {
          setIsAutoRefreshing(false);
        }
      }

      // Then load from Firestore
      const postsRef = collection(db, 'reddit-posts-analytics', user!.uid, 'posts');
      const postsQuery = query(postsRef, orderBy('created_utc', 'desc'));
      const postsSnap = await getDocs(postsQuery);
      
      if (!postsSnap.empty) {
        const postsData = postsSnap.docs.map((doc: { id: any; data: () => any; }) => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setUserRedditPosts(postsData);
      } else {
        setUserRedditPosts([]);
        setPostsMetrics(null);
      }
    } catch (error) {
      console.error('Error loading posts analytics:', error);
    } finally {
      setIsLoadingPostsAnalytics(false);
    }
  }, [user, shouldRefreshData, lastPostsRefresh, refreshPostsFromReddit]);

  const matchArchivedWithProfile = useCallback((archivedData: ArchivedPost[], profileData: RedditPostData[]) => {
    const matched: (ArchivedPost & { roiData?: RedditPostData })[] = [];
    
    archivedData.forEach(archivedItem => {
      const foundProfile = profileData.find(profileItem => {
        if (archivedItem.url && profileItem.permalink) {
          const archivedPostId = archivedItem.url.split('/')[6]?.split('?')[0];
          const profilePostId = profileItem.permalink.split('/')[4];
          return archivedPostId === profilePostId;
        }
        
        return (
          archivedItem.title.toLowerCase().includes(profileItem.post_title?.toLowerCase() || '') ||
          profileItem.post_title?.toLowerCase().includes(archivedItem.title.toLowerCase() || '') ||
          (archivedItem.subreddit === profileItem.subreddit && 
           profileItem.comment_text?.toLowerCase().includes(archivedItem.suggestedReply.toLowerCase().substring(0, 50) || ''))
        );
      });
      
      if (foundProfile) {
        matched.push({
          ...archivedItem,
          roiData: foundProfile
        });
      }
    });
    
    return matched;
  }, []);

  const matchGeneratedWithProfile = useCallback((generatedData: GeneratedPost[], profileData: RedditPostData[]) => {
    const matched: (GeneratedPost & { roiData?: RedditPostData })[] = [];
    
    generatedData.forEach(generatedItem => {
      const foundProfile = profileData.find(profileItem => {
        return (
          generatedItem.subreddit === profileItem.subreddit &&
          (generatedItem.title.toLowerCase().includes(profileItem.title?.toLowerCase() || '') ||
           profileItem.title?.toLowerCase().includes(generatedItem.title.toLowerCase() || '') ||
           (generatedItem.body || generatedItem.content || '').toLowerCase().includes(profileItem.selftext?.toLowerCase().substring(0, 100) || ''))
        );
      });
      
      if (foundProfile) {
        matched.push({
          ...generatedItem,
          roiData: foundProfile
        });
      }
    });
    
    return matched;
  }, []);

  const getROIChartData = (matchedComments = []) => {
    // Use matchedComments if provided, otherwise fall back to all roiComments
    const commentsToUse = matchedComments.length > 0 ? matchedComments : roiComments;
    if (!commentsToUse.length) return [];
  
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  
    const last30Days = commentsToUse
      .filter(comment => {
        if (!comment.created_utc) return false;
        
        try {
          let commentDate: Date;
          if (comment.created_utc.includes('T') || comment.created_utc.includes('Z')) {
            commentDate = new Date(comment.created_utc);
          } else {
            commentDate = new Date(comment.created_utc + 'Z');
          }
          
          return !isNaN(commentDate.getTime()) && commentDate >= thirtyDaysAgo;
        } catch (error) {
          return false;
        }
      })
      .sort((a, b) => {
        const dateA = new Date(a.created_utc.includes('Z') ? a.created_utc : a.created_utc + 'Z');
        const dateB = new Date(b.created_utc.includes('Z') ? b.created_utc : b.created_utc + 'Z');
        return dateB.getTime() - dateA.getTime();
      });
  
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
  
    return Object.entries(groupedByDate)
      .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
      .map(([date, data]) => ({
        date,
        karma: data.karma,
        comments: data.comments,
        engagement: data.karma + data.comments
      }));
  };

  const getPostsChartData = (matchedPosts = []) => {
    // Use matchedPosts if provided, otherwise fall back to all userRedditPosts
    const postsToUse = matchedPosts.length > 0 ? matchedPosts : userRedditPosts;
    if (!postsToUse.length) return [];

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const last30Days = postsToUse
      .filter(post => {
        if (!post.created_utc) return false;
        
        try {
          let postDate: Date;
          if (typeof post.created_utc === 'string') {
            if (post.created_utc.includes('T') || post.created_utc.includes('Z')) {
              postDate = new Date(post.created_utc);
            } else {
              postDate = new Date(post.created_utc + 'Z');
            }
          } else {
            postDate = new Date(post.created_utc * 1000);
          }
          
          return !isNaN(postDate.getTime()) && postDate >= thirtyDaysAgo;
        } catch (error) {
          return false;
        }
      })
      .sort((a, b) => {
        const dateA = typeof a.created_utc === 'string' 
          ? new Date(a.created_utc.includes('Z') ? a.created_utc : a.created_utc + 'Z').getTime()
          : (a.created_utc || 0) * 1000;
        const dateB = typeof b.created_utc === 'string'
          ? new Date(b.created_utc.includes('Z') ? b.created_utc : b.created_utc + 'Z').getTime()
          : (b.created_utc || 0) * 1000;
        return dateA - dateB;
      });

    const groupedByDate: { [key: string]: { upvotes: number; posts: number; comments: number } } = {};
    
    last30Days.forEach(post => {
      try {
        let postDate: Date;
        if (typeof post.created_utc === 'string') {
          if (post.created_utc.includes('T') || post.created_utc.includes('Z')) {
            postDate = new Date(post.created_utc);
          } else {
            postDate = new Date(post.created_utc + 'Z');
          }
        } else {
          postDate = new Date((post.created_utc || 0) * 1000);
        }
        
        const date = postDate.toISOString().split('T')[0];
        
        if (!groupedByDate[date]) {
          groupedByDate[date] = { upvotes: 0, posts: 0, comments: 0 };
        }
        groupedByDate[date].upvotes += post.score || 0;
        groupedByDate[date].posts += 1;
        groupedByDate[date].comments += post.num_comments || 0;
      } catch (error) {
        console.log('Error processing post for chart:', post.id, error);
      }
    });

    return Object.entries(groupedByDate).map(([date, data]) => ({
      date,
      upvotes: data.upvotes,
      posts: data.posts,
      comments: data.comments,
      engagement: data.upvotes + data.comments
    }));
  };

  return {
    // Username management
    redditUsername,
    inputUsername,
    hasUsername,
    isSetupLoading,
    setInputUsername,
    handleSetupUsername,
    
    // ROI data
    roiComments,
    roiMetrics,
    isUpdatingRoi,
    lastRoiUpdate,
    handleUpdateROI,
    loadROIData,
    
    // Posts analytics
    userRedditPosts,
    postsMetrics,
    isLoadingPostsAnalytics,
    loadPostsAnalytics,
    
    // Auto-refresh state
    isAutoRefreshing,
    
    // Utility functions
    calculateROIMetrics,
    calculatePostsMetrics,
    getROIChartData,
    getPostsChartData,
    matchArchivedWithProfile,
    matchGeneratedWithProfile
  };
};