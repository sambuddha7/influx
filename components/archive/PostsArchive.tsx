import React from 'react';
import { Copy, FileText } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Loading from '@/components/Loading';
import { GeneratedPost } from '@/types/archive';

interface PostsArchiveProps {
  displayedGeneratedPosts: GeneratedPost[];
  hasMoreGeneratedPosts: boolean;
  isLoadingMore: boolean;
  copiedId: string | null;
  onLoadMore: () => void;
  onCopyPost: (post: GeneratedPost) => void;
  isLoading2: boolean;
}

export const PostsArchive: React.FC<PostsArchiveProps> = ({
  displayedGeneratedPosts,
  hasMoreGeneratedPosts,
  isLoadingMore,
  copiedId,
  onLoadMore,
  onCopyPost,
  isLoading2,
}) => {
  if (isLoading2) {
    return (
      <div className="flex justify-center py-12">
        <Loading />
      </div>
    );
  }

  if (displayedGeneratedPosts.length === 0) {
    return (
      <div className="text-center py-12 text-gray-600 dark:text-gray-400">
        <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p className="text-lg font-medium">No saved posts yet</p>
        <p className="text-sm mt-1">Generate and save posts to see them here.</p>
      </div>
    );
  }

  return (
    <>
      {displayedGeneratedPosts.map((post) => (
        <div key={post.id} className="card bg-base-100 dark:bg-black bg-white shadow-xl border border-gray-200 dark:border-gray-700">
          <div className="card-body">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <span className="text-sm text-blue-500 dark:text-blue-400">r/{post.subreddit}</span>
                  <span className="text-xs px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-full">
                    {post.post_type?.replace('_', ' ')}
                  </span>
                  {post.status === 'archived' && (
                    <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full">
                      Saved
                    </span>
                  )}
                </div>
                <h2 className="card-title dark:text-white text-lg">{post.title}</h2>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {post.created_at && (
                    <>Created {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</>
                  )}
                  {post.target_audience && (
                    <span className="ml-3">Target: {post.target_audience}</span>
                  )}
                </div>
              </div>
              <button
                onClick={() => onCopyPost(post)}
                className={`px-3 py-1.5 text-sm rounded-lg transition-all duration-200 flex items-center space-x-1 ${
                  copiedId === post.id
                    ? 'bg-green-500 text-white'
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
              >
                <Copy className="w-4 h-4" />
                <span>{copiedId === post.id ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap text-sm">
                {post.body || post.content}
              </p>
            </div>
          </div>
        </div>
      ))}
      
      <div className="flex justify-center py-4">
        {hasMoreGeneratedPosts ? (
          <button 
            className="btn btn-neutral"
            onClick={onLoadMore}
            disabled={isLoadingMore}
          >
            {isLoadingMore ? <Loading /> : 'Load More Posts'}
          </button>
        ) : displayedGeneratedPosts.length > 0 ? (
          <div className="text-center text-gray-600 dark:text-gray-400">
            <p>End of saved posts!</p>
          </div>
        ) : null}
      </div>
    </>
  );
};