import React from 'react';
import { ArrowUpRight, Sparkles, Save, Pencil, Check } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { formatDistanceToNow } from 'date-fns';

// Define the type for a post object
interface Post {
  id: string;
  subreddit: string;
  title: string;
  date_created: string;
  url: string;
  content: string;
  suggestedReply: string;
}

// Define the type for alert state
interface AlertState {
  visible: boolean;
  message: string;
}

// Define props interface for the component
interface PostCardProps {
  post: Post;
  isGenerating: string | null;
  isEditing: string | null;
  isApproving: string | null;
  alertt: AlertState;
  greenalertt: AlertState;
  handleGenerate: (id: string) => void;
  handleEdit: (id: string) => void;
  handleSave: (id: string, reply: string) => void;
  handleReject: (id: string) => void;
  handleApprove: (id: string, reply: string) => void;
  setDisplayedPosts: React.Dispatch<React.SetStateAction<Post[]>>;
  page?: 'dashboard' | 'community';
}

const CrossIcon: React.FC = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6L6 18M6 6l12 12" />
  </svg>
);

const PostCard: React.FC<PostCardProps> = ({ 
  post, 
  isGenerating, 
  isEditing, 
  isApproving, 
  alertt, 
  greenalertt,
  handleGenerate, 
  handleEdit, 
  handleSave, 
  handleReject, 
  handleApprove,
  setDisplayedPosts,
  page = 'dashboard'
}) => {
  return (
    <div className="card bg-base-100 dark:bg-black bg-white shadow-xl border border-gray-200 dark:border-gray-700">
      <div className="card-body">
        <div className="mb-4">
          <div className="text-sm text-blue-500 dark:text-blue-400">{post.subreddit}</div>
          <h2 className="card-title dark:text-white">{post.title}</h2>
          <div className="text-xs text-gray-500 dark:text-gray-400" suppressHydrationWarning>
            {post.date_created && !isNaN(new Date(post.date_created).getTime())
              ? formatDistanceToNow(new Date(post.date_created), { addSuffix: true })
              : 'Invalid Date'}
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
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold dark:text-white">Generate or add reply</h3>
            
            <button
              className="relative p-[1px] rounded-lg overflow-hidden bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 disabled:opacity-50"
              onClick={() => handleGenerate(post.id)}
              disabled={isGenerating === post.id}
            >
              <div className="relative bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-white px-4 py-2 rounded-[8px] flex items-center gap-1">
                {isGenerating === post.id ? (
                  <span>Generating...</span>
                ) : (
                  <span className="flex items-center gap-1">
                    <Sparkles className="h-4 w-4" />
                    Generate
                  </span>
                )}
              </div>
            </button>
          </div>
          {isEditing === post.id ? (
            <textarea 
              className="w-full p-2 rounded-md bg-white dark:bg-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700"
              value={post.suggestedReply}
              onChange={(e) => {
                const newValue = e.target.value;
                setDisplayedPosts(posts =>
                  posts.map(p => p.id === post.id ? { ...p, suggestedReply: newValue } : p)
                );
              }}
              rows={3}
            />
          ) : (
            <ReactMarkdown>{post.suggestedReply}</ReactMarkdown>
          )}
          
          <div className="flex gap-2 mt-4">
            {isEditing === post.id ? (
              <button 
                className="btn btn-neutral"
                onClick={() => handleSave(post.id, post.suggestedReply)}
              >
                Save <Save className="h-4 w-4" />
              </button>
            ) : (
              <button 
                className="btn btn-neutral"
                onClick={() => handleEdit(post.id)}
              >
                Edit <Pencil className="h-4 w-4" />
              </button>
            )}
            
            {page === 'dashboard' && (
              <button
                onClick={() => handleReject(post.id)}
                className="absolute -top-2 -left-2 w-6 h-6 
                          bg-white dark:bg-zinc-800
                          hover:bg-gray-100 dark:hover:bg-zinc-700
                          rounded-full flex items-center justify-center
                          border border-gray-200 dark:border-zinc-700
                          shadow-sm transition-colors duration-200
                          text-gray-500 dark:text-gray-400
                          hover:text-gray-700 dark:hover:text-gray-200"
              >
                <CrossIcon />
              </button>
            )}
            {alertt.visible && (
              <div className="toast toast-end">
                <div className="alert alert-error">
                  <span>{alertt.message.replace(/'/g, '&#39;')}</span>
                </div>
              </div>
            )}

            <button 
              className={`btn btn-success relative ${isApproving === post.id ? 'opacity-80' : ''}`}
              onClick={() => handleApprove(post.id, post.suggestedReply)}
              disabled={isApproving === post.id}
            >
              <div className="flex items-center gap-2">
                {isApproving === post.id ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Approving...</span>
                  </>
                ) : (
                  <>
                    Approve
                    <Check className="h-4 w-4" />
                  </>
                )}
              </div>
            </button>
            {greenalertt.visible && (
              <div className="toast toast-end">
                <div className="alert alert-success">
                  <span>{greenalertt.message.replace(/'/g, '&#39;')}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostCard;