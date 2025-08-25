import React from 'react';
import { FileText, TrendingUp, MessageSquare, BarChart3 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { PostsChart } from '@/components/charts/PostsChart';
import { GeneratedPost, PostsMetrics, RedditPostData } from '@/types/archive';
import Loading from '@/components/Loading';

interface PostsAnalyticsProps {
  postsMetrics: PostsMetrics | null;
  userRedditPosts: RedditPostData[];
  matchedPosts: GeneratedPost[];
  displayedMatchedPosts: GeneratedPost[];
  hasMoreMatchedPosts: boolean;
  isLoadingPostsAnalytics: boolean;
  isLoadingMoreAnalytics: boolean;
  onLoadMore: () => void;
  getPostsChartData: () => any[];
  onRefresh: () => void;
}

export const PostsAnalytics: React.FC<PostsAnalyticsProps> = ({
  postsMetrics,
  userRedditPosts,
  matchedPosts,
  displayedMatchedPosts,
  hasMoreMatchedPosts,
  isLoadingPostsAnalytics,
  isLoadingMoreAnalytics,
  onLoadMore,
  getPostsChartData,
  onRefresh,
}) => {
  if (isLoadingPostsAnalytics) {
    return (
      <div className="flex justify-center py-12">
        <Loading />
      </div>
    );
  }

  return (
    <>
      {/* Posts Metrics Cards */}
      {postsMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <FileText size={20} className="text-white" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Total Posts</p>
                <p className="text-white text-2xl font-bold">{postsMetrics.total_posts}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center">
                <TrendingUp size={20} className="text-white" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Total Upvotes</p>
                <p className="text-white text-2xl font-bold">{postsMetrics.total_upvotes}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <MessageSquare size={20} className="text-white" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Total Comments</p>
                <p className="text-white text-2xl font-bold">{postsMetrics.total_comments}</p>
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
                <p className="text-white text-2xl font-bold">{postsMetrics.engagement_rate}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Posts Charts */}
      {userRedditPosts.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Posts Performance Over Time */}
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <h3 className="text-white text-lg font-medium mb-4">Posts Performance (30 Days)</h3>
            <div className="w-full h-80 flex items-center justify-center">
              {getPostsChartData().length > 0 ? (
                <PostsChart data={getPostsChartData()} />
              ) : (
                <div className="text-center text-gray-400">
                  <p>No activity data for the last 30 days</p>
                </div>
              )}
            </div>
          </div>

          {/* Top Performing Subreddits */}
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <h3 className="text-white text-lg font-medium mb-4">Top Performing Subreddits</h3>
            {postsMetrics && Object.keys(postsMetrics.top_performing_subreddits).length > 0 ? (
              <div className="space-y-3">
                {Object.entries(postsMetrics.top_performing_subreddits)
                  .sort(([,a], [,b]) => (b as number) - (a as number))
                  .slice(0, 8)
                  .map(([subreddit, score], index) => (
                    <div key={subreddit} className="flex justify-between items-center p-3 bg-gray-800 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 bg-orange-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                          {index + 1}
                        </div>
                        <span className="text-gray-300">r/{subreddit}</span>
                      </div>
                      <span className="text-orange-500 font-medium">{score as number} pts</span>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center text-gray-400">
                <p>No subreddit data available</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Recent Posts from Reddit - Only show matched posts */}
      {displayedMatchedPosts.length > 0 && (
        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
          <h3 className="text-white text-lg font-medium mb-4">Posted Content ({matchedPosts.length})</h3>
          <div className="space-y-4">
            {displayedMatchedPosts.map((post) => (
              <div key={post.id} className="bg-gray-800 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-orange-500 text-sm font-medium">
                      r/{post.subreddit}
                    </span>
                    <span className="text-xs px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-full">
                      {post.post_type?.replace('_', ' ')}
                    </span>
                    {/* Display scores */}
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <div className="flex items-center gap-1">
                        <TrendingUp size={12} />
                        <span>{post.roiData?.score || 0} upvotes</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageSquare size={12} />
                        <span>{post.roiData?.num_comments || 0} comments</span>
                      </div>
                    </div>
                  </div>
                </div>
                <h4 className="text-white font-medium mb-2 text-sm">
                  {post.title}
                </h4>
                <p className="text-gray-300 text-sm mb-3 line-clamp-2">
                  {post.body || post.content}
                </p>
                <div className="flex gap-4 text-xs text-gray-400">
                  <span>Created: {post.created_at ? formatDistanceToNow(new Date(post.created_at), { addSuffix: true }) : 'Unknown'}</span>
                  {post.target_audience && <span>Target: {post.target_audience}</span>}
                </div>
              </div>
            ))}
          </div>
          
          {/* Load More Button for Posts */}
          {hasMoreMatchedPosts && (
            <div className="flex justify-center mt-6">
              <button
                onClick={onLoadMore}
                disabled={isLoadingMoreAnalytics}
                className="px-6 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                {isLoadingMoreAnalytics ? 'Loading...' : 'Load More Posts'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* No Matched Posts State */}
      {matchedPosts.length === 0 && (
        <div className="bg-gray-900 rounded-xl p-8 border border-gray-800 text-center">
          <FileText size={64} className="mx-auto text-gray-600 mb-4" />
          <h3 className="text-white text-lg font-medium mb-2">No Posted Content Found</h3>
          <p className="text-gray-400 mb-4">
            None of your generated posts appear to have been posted to Reddit yet.
          </p>
        </div>
      )}

      {/* No Posts Data State */}
      {userRedditPosts.length === 0 && (
        <div className="bg-gray-900 rounded-xl p-8 border border-gray-800 text-center">
          <FileText size={64} className="mx-auto text-gray-600 mb-4" />
          <h3 className="text-white text-lg font-medium mb-2">No Posts Found</h3>
          <p className="text-gray-400 mb-4">
            We couldn&apos;t find any posts from your Reddit account. 
            Try refreshing the data or make sure you&apos;ve posted on Reddit recently.
          </p>
          <button
            onClick={onRefresh}
            className="px-6 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-lg transition-colors"
          >
            Refresh Posts Data
          </button>
        </div>
      )}
    </>
  );
};