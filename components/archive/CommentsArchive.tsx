import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import Loading from '@/components/Loading';
import { ArchivedPost } from '@/types/archive';

interface CommentsArchiveProps {
  displayedPosts: ArchivedPost[];
  hasMorePosts: boolean;
  isLoadingMore: boolean;
  onLoadMore: () => void;
}

export const CommentsArchive: React.FC<CommentsArchiveProps> = ({
  displayedPosts,
  hasMorePosts,
  isLoadingMore,
  onLoadMore,
}) => {
  return (
    <>
      {displayedPosts.map((post) => (
        <div key={post.id} className="card bg-base-100 dark:bg-black bg-white shadow-xl border border-gray-200 dark:border-gray-700">
          <div className="card-body">
            <div className="mb-4">
              <div className="text-sm text-blue-500 dark:text-blue-400">{post.subreddit}</div>
              <h2 className="card-title dark:text-white">{post.title}</h2>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Created {formatDistanceToNow(new Date(post.date_created), { addSuffix: true })}
              </div>
              <a 
                href={`${post.url}`} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="absolute top-2 right-2 flex items-center text-blue-500 dark:text-blue-400 hover:underline m-2"
              >
                <ArrowUpRight className="w-5 h-5 mr-1" />
                <span className="text-sm font-medium">Go to discussion</span>
              </a>

              <ReactMarkdown className="mt-2 dark:text-gray-300">
                {post.content}
              </ReactMarkdown>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
              <h3 className="font-semibold mb-2 dark:text-white">Submitted Reply</h3>
              <div 
                className="w-full p-2 rounded-md bg-white dark:bg-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700"
              >
                {post.suggestedReply}
              </div>
            </div>
          </div>
        </div>
      ))}
      
      <div className="flex justify-center py-4">
        {hasMorePosts ? (
          <button 
            className="btn btn-neutral"
            onClick={onLoadMore}
            disabled={isLoadingMore}
          >
            {isLoadingMore ? <Loading /> : 'Load More Comments'}
          </button>
        ) : displayedPosts.length > 0 ? (
          <div className="text-center text-gray-600 dark:text-gray-400">
            <p>End of archived comments!</p>
          </div>
        ) : (
          <div className="text-center text-gray-600 dark:text-gray-400">
            <p>No archived comments yet.</p>
            <p className="text-sm mt-1">Approved comments will appear here.</p>
          </div>
        )}
      </div>
    </>
  );
};