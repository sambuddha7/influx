import React from 'react';
import { MessageSquare, TrendingUp, Eye, BarChart3, ArrowUpRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { CommentsChart } from '@/components/charts/CommentsChart';
import { ArchivedPost, ROIMetrics } from '@/types/archive';

// Chart data type definition
type CommentsChartData = {
  date: string;
  karma: number;
  comments: number;
  engagement: number;
};

// ROI Comment type definition
type ROIComment = {
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
};

interface CommentsAnalyticsProps {
  roiMetrics: ROIMetrics | null;
  roiComments: ROIComment[];
  matchedComments: ArchivedPost[];
  displayedMatchedComments: ArchivedPost[];
  hasMoreMatchedComments: boolean;
  isLoadingMoreAnalytics: boolean;
  onLoadMore: () => void;
  getROIChartData: () => CommentsChartData[];
}

export const CommentsAnalytics: React.FC<CommentsAnalyticsProps> = ({
  roiMetrics,
  roiComments,
  matchedComments,
  displayedMatchedComments,
  hasMoreMatchedComments,
  isLoadingMoreAnalytics,
  onLoadMore,
  getROIChartData,
}) => {
  return (
    <>
      {/* ROI Metrics Cards */}
      {roiMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <MessageSquare size={20} className="text-white" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Total Comments</p>
                <p className="text-white text-2xl font-bold">{roiMetrics.total_comments}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center">
                <TrendingUp size={20} className="text-white" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Total Karma</p>
                <p className="text-white text-2xl font-bold">{roiMetrics.total_karma}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Eye size={20} className="text-white" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Avg Score/Comment</p>
                <p className="text-white text-2xl font-bold">{roiMetrics.avg_score_per_comment}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center">
                <BarChart3 size={20} className="text-white" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Total Replies</p>
                <p className="text-white text-2xl font-bold">{roiMetrics.total_replies_generated}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Charts */}
      {roiComments.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Engagement Over Time */}
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <h3 className="text-white text-lg font-medium mb-4">Engagement Over Time (30 Days)</h3>
            <div className="w-full h-80 flex items-center justify-center">
              {getROIChartData().length > 0 ? (
                <CommentsChart data={getROIChartData()} />
              ) : (
                <div className="text-center text-gray-400">
                  <p>No activity data for the last 30 days</p>
                </div>
              )}
            </div>
          </div>

      {/* Top Subreddits */}
        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
          <h3 className="text-white text-lg font-medium mb-4">Top Performing Subreddits</h3>
          {roiMetrics && Object.keys(roiMetrics.top_performing_subreddits).length > 0 ? (
            <div className="space-y-3">
              {Object.entries(roiMetrics.top_performing_subreddits)
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
                    <span className="text-orange-500 font-medium">{score} pts</span>
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

      {/* Recent Comments from ROI - Only show matched comments */}
      {displayedMatchedComments.length > 0 && (
        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
          <h3 className="text-white text-lg font-medium mb-4">Posted Comments ({matchedComments.length})</h3>
          <div className="space-y-4">
            {displayedMatchedComments.map((comment) => (
              <div key={comment.id} className="bg-gray-800 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-orange-500 text-sm font-medium">
                      r/{comment.subreddit}
                    </span>
                    {/* Display scores */}
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 px-2 py-1 bg-orange-500/20 border border-orange-500/30 rounded-md">
                        <TrendingUp size={12} className="text-orange-400" />
                        <span className="text-orange-300 text-xs font-medium">{comment.roiData?.score || 0} karma</span>
                      </div>
                      <div className="flex items-center gap-1 px-2 py-1 bg-orange-500/20 border border-orange-500/30 rounded-md">
                        <MessageSquare size={12} className="text-orange-400" />
                        <span className="text-orange-300 text-xs font-medium">{comment.roiData?.reply_count || 0} replies</span>
                      </div>
                    </div>
                  </div>
                  <a
                    href={comment.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-orange-500 transition-colors"
                  >
                    <ArrowUpRight size={16} />
                  </a>
                </div>
                <h4 className="text-white font-medium mb-2 text-sm">
                  {comment.title}
                </h4>
                <p className="text-gray-300 text-sm mb-3 line-clamp-2">
                  {comment.suggestedReply}
                </p>
                <div className="flex justify-between items-center text-xs text-gray-400">
                  <span>Posted: {formatDistanceToNow(new Date(comment.date_created), { addSuffix: true })}</span>
                  {(comment.roiData?.reply_count || 0) > 0 && (
                    <button 
                      onClick={() => window.open(`https://reddit.com${comment.roiData?.permalink}`, '_blank')}
                      className="px-2 py-1 bg-blue-500/20 border border-blue-500/30 rounded-md text-blue-300 hover:bg-blue-500/30 transition-colors text-xs"
                    >
                      View Replies ({comment.roiData?.reply_count})
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {/* Load More Button for Comments */}
          {hasMoreMatchedComments && (
            <div className="flex justify-center mt-6">
              <button
                onClick={onLoadMore}
                disabled={isLoadingMoreAnalytics}
                className="px-6 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                {isLoadingMoreAnalytics ? 'Loading...' : 'Load More Comments'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* No Matched Comments State */}
      {matchedComments.length === 0 && (
        <div className="bg-gray-900 rounded-xl p-8 border border-gray-800 text-center">
          <MessageSquare size={64} className="mx-auto text-gray-600 mb-4" />
          <h3 className="text-white text-lg font-medium mb-2">No Posted Comments Found</h3>
          <p className="text-gray-400 mb-4">
            None of your archived comments appear to have been posted to Reddit yet.
          </p>
        </div>
      )}

      {/* No ROI Data State */}
      {roiComments.length === 0 && (
        <div className="bg-gray-900 rounded-xl p-8 border border-gray-800 text-center">
          <MessageSquare size={64} className="mx-auto text-gray-600 mb-4" />
          <h3 className="text-white text-lg font-medium mb-2">No Comments Found</h3>
          <p className="text-gray-400 mb-4">
            We couldn&apos;t find any recent comments for your Reddit account. 
            Try updating your data or make sure you&apos;re actively commenting.
          </p>
        </div>
      )}
    </>
  );
};