'use client'

import React, { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Components
import Loading from '@/components/Loading';
import Sidebar from '@/components/Sidebar';
import { TabSwitcher } from '@/components/ui/TabSwitcher';
import { RedditAnalyticsBanner } from '@/components/ui/RedditAnalyticsBanner';
import { CommentsAnalytics } from '@/components/analytics/CommentsAnalytics';
import { PostsAnalytics } from '@/components/analytics/PostsAnalytics';
import { CommentsArchive } from '@/components/archive/CommentsArchive';
import { PostsArchive } from '@/components/archive/PostsArchive';

// Hooks
import { useRedditAnalytics } from '@/components//hooks/useRedditAnalytics';
import { useArchiveData } from '@/components//hooks/useArchiveData';

// Types
import { GeneratedPost } from '@/types/archive';

export default function ArchivePage() {
  const router = useRouter();
  const [user, loading] = useAuthState(auth);
  const [activeTab, setActiveTab] = useState<'comments' | 'posts'>('comments');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  // View mode states
  const [isAnalyticsMode, setIsAnalyticsMode] = useState(false);
  const [isPostsAnalyticsMode, setIsPostsAnalyticsMode] = useState(false);

  // Custom hooks
  const analytics = useRedditAnalytics(user);
  const archiveData = useArchiveData(user, activeTab);

  // Check URL parameters for tab
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab');
    if (tab === 'posts') {
      setActiveTab('posts');
    }
  }, []);

  // Check user authentication and onboarding
  useEffect(() => {
    const checkUser = async () => {
      if (!user) return;

      try {
        const docRef = doc(db, 'onboarding', user.uid);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
          router.push('/onboarding');
        }
      } catch (error) {
        console.error('Error checking user in Firestore:', error);
      }
    };

    if (user) {
      checkUser();
    } else if (!loading) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Load saved view preferences immediately when hasUsername changes
  useEffect(() => {
    if (!analytics.hasUsername) return;
    
    // Load saved view preferences
    const savedCommentsView = localStorage.getItem('archive-comments-view-preference');
    const savedPostsView = localStorage.getItem('archive-posts-view-preference');
    
    // Default to analytics view if username exists, unless explicitly set to archive
    setIsAnalyticsMode(savedCommentsView !== 'archive');
    setIsPostsAnalyticsMode(savedPostsView !== 'archive');
  }, [analytics.hasUsername]);

  // Auto-load posts analytics when switching to posts tab with username
  useEffect(() => {
    if (!analytics.hasUsername || !analytics.redditUsername || activeTab !== 'posts') return;
    
    if (isPostsAnalyticsMode && analytics.userRedditPosts.length === 0) {
      analytics.loadPostsAnalytics(analytics.redditUsername);
    }
  }, [
    analytics.hasUsername, 
    analytics.redditUsername, 
    activeTab, 
    isPostsAnalyticsMode,
    analytics.userRedditPosts.length,
    analytics.loadPostsAnalytics
  ]);

  // Auto-refresh when user returns to the page (browser focus)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && analytics.hasUsername && analytics.redditUsername) {
        // Auto-refresh data when user returns to the page
        if (activeTab === 'comments' && isAnalyticsMode) {
          analytics.loadROIData(analytics.redditUsername, false); // Smart refresh (checks if data is stale)
        } else if (activeTab === 'posts' && isPostsAnalyticsMode) {
          analytics.loadPostsAnalytics(analytics.redditUsername, false); // Smart refresh (checks if data is stale)
        }
      }
    };

    const handleFocus = () => {
      if (analytics.hasUsername && analytics.redditUsername) {
        // Auto-refresh data when user focuses on the window
        if (activeTab === 'comments' && isAnalyticsMode) {
          analytics.loadROIData(analytics.redditUsername, false); // Smart refresh
        } else if (activeTab === 'posts' && isPostsAnalyticsMode) {
          analytics.loadPostsAnalytics(analytics.redditUsername, false); // Smart refresh
        }
      }
    };

    // Listen to visibility changes (tab switching)
    document.addEventListener('visibilitychange', handleVisibilityChange);
    // Listen to window focus (returning to browser window)
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [
    analytics.hasUsername,
    analytics.redditUsername,
    activeTab,
    isAnalyticsMode,
    isPostsAnalyticsMode,
    analytics.loadROIData,
    analytics.loadPostsAnalytics
  ]);

  // Handle matching comments with profile data - runs immediately when both datasets are available
  useEffect(() => {
    if (analytics.roiComments.length > 0 && archiveData.archivedPosts.length > 0) {
      const matched = analytics.matchArchivedWithProfile(archiveData.archivedPosts, analytics.roiComments);
      archiveData.setMatchedComments(matched);
      archiveData.setDisplayedMatchedComments(matched.slice(0, 5));
      archiveData.setHasMoreMatchedComments(matched.length > 5);
      
      // Always calculate metrics when we have matched data
      const matchedRoiComments = analytics.roiComments.filter(comment => 
        matched.some(archivedItem => {
          if (archivedItem.url && comment.permalink) {
            const archivedPostId = archivedItem.url.split('/')[6]?.split('?')[0];
            const profilePostId = comment.permalink.split('/')[4];
            return archivedPostId === profilePostId;
          }
          
          return (
            archivedItem.title.toLowerCase().includes(comment.post_title?.toLowerCase() || '') ||
            comment.post_title?.toLowerCase().includes(archivedItem.title.toLowerCase() || '') ||
            (archivedItem.subreddit === comment.subreddit && 
             comment.comment_text?.toLowerCase().includes(archivedItem.suggestedReply.toLowerCase().substring(0, 50) || ''))
          );
        })
      );
      
      analytics.calculateROIMetrics(matchedRoiComments);
    }
  }, [
    analytics.roiComments.length, 
    archiveData.archivedPosts.length,
    analytics.roiComments,
    archiveData.archivedPosts,
    analytics.matchArchivedWithProfile,
    analytics.calculateROIMetrics,
    archiveData.setMatchedComments,
    archiveData.setDisplayedMatchedComments,
    archiveData.setHasMoreMatchedComments
  ]);

  // Handle matching posts with profile data - runs immediately when both datasets are available
  useEffect(() => {
    if (analytics.userRedditPosts.length > 0 && archiveData.generatedPosts.length > 0) {
      const matched = analytics.matchGeneratedWithProfile(archiveData.generatedPosts, analytics.userRedditPosts);
      archiveData.setMatchedPosts(matched);
      archiveData.setDisplayedMatchedPosts(matched.slice(0, 5));
      archiveData.setHasMoreMatchedPosts(matched.length > 5);
      
      // Always calculate metrics when we have matched data
      const matchedRedditPosts = analytics.userRedditPosts.filter((redditPost) => 
        matched.some(generatedItem => {
          return (
            generatedItem.subreddit === (redditPost.subreddit || '') &&
            ((generatedItem.title || '').toLowerCase().includes((redditPost.title || '').toLowerCase()) ||
            (redditPost.title || '').toLowerCase().includes((generatedItem.title || '').toLowerCase()) ||
            (generatedItem.body || generatedItem.content || '').toLowerCase().includes((redditPost.selftext || '').toLowerCase().substring(0, 100)))
          );
        })
      );
      
      analytics.calculatePostsMetrics(matchedRedditPosts);
    }
  }, [
    analytics.userRedditPosts.length, 
    archiveData.generatedPosts.length,
    analytics.userRedditPosts,
    archiveData.generatedPosts,
    analytics.matchGeneratedWithProfile,
    analytics.calculatePostsMetrics,
    archiveData.setMatchedPosts,
    archiveData.setDisplayedMatchedPosts,
    archiveData.setHasMoreMatchedPosts
  ]);

  const copyToClipboard = (post: GeneratedPost) => {
    const textToCopy = `${post.title}\n\n${post.body || post.content}`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedId(post.id || null);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleCommentsView = (viewMode: 'analytics' | 'archive') => {
    setIsAnalyticsMode(viewMode === 'analytics');
    localStorage.setItem('archive-comments-view-preference', viewMode);
    
    // Always refresh when switching to analytics mode to get latest data
    if (viewMode === 'analytics' && analytics.hasUsername && analytics.redditUsername) {
      analytics.loadROIData(analytics.redditUsername, true); // Force refresh
    }
  };

  const togglePostsView = (viewMode: 'analytics' | 'archive') => {
    setIsPostsAnalyticsMode(viewMode === 'analytics');
    localStorage.setItem('archive-posts-view-preference', viewMode);
    
    // Always refresh when switching to analytics mode to get latest data
    if (viewMode === 'analytics' && analytics.hasUsername && analytics.redditUsername) {
      analytics.loadPostsAnalytics(analytics.redditUsername, true); // Force refresh
    }
  };

  if (archiveData.isLoading) {
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
        <TabSwitcher
          activeTab={activeTab}
          hasUsername={analytics.hasUsername}
          isAnalyticsMode={isAnalyticsMode}
          isPostsAnalyticsMode={isPostsAnalyticsMode}
          onTabChange={setActiveTab}
          onCommentsViewToggle={toggleCommentsView}
          onPostsViewToggle={togglePostsView}
        />

        <RedditAnalyticsBanner
          hasUsername={analytics.hasUsername}
          redditUsername={analytics.redditUsername}
          inputUsername={analytics.inputUsername}
          lastRoiUpdate={analytics.lastRoiUpdate}
          isSetupLoading={analytics.isSetupLoading}
          isUpdatingRoi={analytics.isUpdatingRoi}
          isAutoRefreshing={analytics.isAutoRefreshing}
          onInputChange={analytics.setInputUsername}
          onSetupUsername={analytics.handleSetupUsername}
          onUpdateROI={analytics.handleUpdateROI}
        />

        {/* Comments Tab */}
        {activeTab === 'comments' && (
          <>
            {isAnalyticsMode && analytics.hasUsername ? (
              <CommentsAnalytics
                roiMetrics={analytics.roiMetrics}
                roiComments={analytics.roiComments}
                matchedComments={archiveData.matchedComments}
                displayedMatchedComments={archiveData.displayedMatchedComments}
                hasMoreMatchedComments={archiveData.hasMoreMatchedComments}
                isLoadingMoreAnalytics={archiveData.isLoadingMoreAnalytics}
                onLoadMore={archiveData.loadMoreMatchedComments}
                getROIChartData={() => analytics.getROIChartData(
                  archiveData.matchedComments.map(mc => mc.roiData).filter(Boolean)
                )}
              />
            ) : (
              <CommentsArchive
                displayedPosts={archiveData.displayedPosts}
                hasMorePosts={archiveData.hasMorePosts}
                isLoadingMore={archiveData.isLoadingMore}
                onLoadMore={archiveData.loadMorePosts}
              />
            )}
          </>
        )}

        {/* Posts Tab */}
        {activeTab === 'posts' && (
          <>
            {isPostsAnalyticsMode && analytics.hasUsername ? (
              <PostsAnalytics
                postsMetrics={analytics.postsMetrics}
                userRedditPosts={analytics.userRedditPosts}
                matchedPosts={archiveData.matchedPosts}
                displayedMatchedPosts={archiveData.displayedMatchedPosts}
                hasMoreMatchedPosts={archiveData.hasMoreMatchedPosts}
                isLoadingPostsAnalytics={analytics.isLoadingPostsAnalytics}
                isLoadingMoreAnalytics={archiveData.isLoadingMoreAnalytics}
                onLoadMore={archiveData.loadMoreMatchedPosts}
                getPostsChartData={() => analytics.getPostsChartData(
                  archiveData.matchedPosts.map(mp => mp.roiData).filter(Boolean)
                )}
                onRefresh={() => analytics.loadPostsAnalytics(analytics.redditUsername, true)}
              />
            ) : (
              <PostsArchive
                displayedGeneratedPosts={archiveData.displayedGeneratedPosts}
                hasMoreGeneratedPosts={archiveData.hasMoreGeneratedPosts}
                isLoadingMore={archiveData.isLoadingMore}
                copiedId={copiedId}
                onLoadMore={archiveData.loadMoreGeneratedPosts}
                onCopyPost={copyToClipboard}
                isLoading2={archiveData.isLoading2}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}