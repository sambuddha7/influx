import React, { useState } from 'react';
import { ArrowUpRight, Sparkles, Save, Pencil, Check, Clipboard, RefreshCcw, X, Zap, Archive } from 'lucide-react';
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
  promotional?: boolean;
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
  isArchiving: string | null;
  handleGenerate: (id: string) => void;
  handleRegenerateWithFeedback: (id: string, feedback: string) => void;
  handleEdit: (id: string) => void;
  handleSave: (id: string, reply: string) => void;
  handleReject: (id: string) => void;
  handleApprove: (id: string, reply: string) => void;
  handleArchive: (id: string) => void;
  setDisplayedPosts: React.Dispatch<React.SetStateAction<Post[]>>;
  page?: 'dashboard' | 'community';
}

const PostCard: React.FC<PostCardProps> = ({ 
  post, 
  isGenerating, 
  isEditing, 
  isApproving, 
  alertt, 
  greenalertt,
  isArchiving,
  handleGenerate, 
  handleRegenerateWithFeedback,
  handleEdit, 
  handleSave, 
  handleReject, 
  handleApprove,
  handleArchive,
  setDisplayedPosts,
  page = 'dashboard'
}) => {
  const [copied, setCopied] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(post.suggestedReply !== "Add your reply here");
  const [regenerateModalOpen, setRegenerateModalOpen] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackType, setFeedbackType] = useState("");

  const handleCopy = () => {
    navigator.clipboard.writeText(post.suggestedReply);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const feedbackTypes = [
    { 
      type: "Add Value", 
      description: "Make it more helpful and informative",
      icon: "💡"
    },
    { 
      type: "Ask a Question", 
      description: "Encourage engagement with questions",
      icon: "❓"
    },
    { 
      type: "Relatable", 
      description: "Add personal touch or shared experience",
      icon: "🤝"
    },
    { 
      type: "Soft Plug", 
      description: "Subtly mention your product/service",
      icon: "🎯"
    }
  ];
  
  const handleGenerateClick = () => {
    if (!hasGenerated) {
      handleGenerate(post.id);
      setHasGenerated(true);
    } else {
      setRegenerateModalOpen(true);
    }
  };

  const handleRegenerateSubmit = () => {
    const combinedFeedback = feedbackType
      ? `${feedbackType}${feedbackText ? ` — ${feedbackText}` : ''}`
      : feedbackText;
  
    handleRegenerateWithFeedback(post.id, combinedFeedback);
    setRegenerateModalOpen(false);
    setFeedbackText("");
    setFeedbackType("");
  };

  const handleModalClose = () => {
    setRegenerateModalOpen(false);
    setFeedbackText("");
    setFeedbackType("");
  };

  return (
    <div className="relative card bg-base-100 dark:bg-black bg-white shadow-xl border border-gray-200 dark:border-gray-700">
      <div className="card-body">
        {/* Header Section */}
        <div className="mb-4">
          <div className="flex justify-between items-start mb-2">
            <div className="flex-1">
              <div className="text-sm font-medium text-blue-500 dark:text-blue-400 mb-1">
                r/{post.subreddit}
              </div>
              <h2 className="card-title dark:text-white flex items-center gap-2 leading-tight">
                {post.title}
                {post.promotional && (
                  <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-gradient-to-r from-orange-400 to-orange-600 text-white">
                    Promotional
                  </span>
                )}
              </h2>
            </div>
            
            <a 
              href={post.url} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex items-center text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 transition-colors ml-4"
            >
              <ArrowUpRight className="w-4 h-4 mr-1" />
              <span className="text-sm font-medium">View Post</span>
            </a>
          </div>
          
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-3" suppressHydrationWarning>
            {post.date_created && !isNaN(new Date(post.date_created).getTime())
              ? formatDistanceToNow(new Date(post.date_created), { addSuffix: true })
              : 'Invalid Date'}
          </div>

          <div className="prose prose-sm dark:prose-invert max-w-none">
            <ReactMarkdown className="text-gray-700 dark:text-gray-300">
              {post.content}
            </ReactMarkdown>
          </div>
        </div>
        
        {/* Reply Section */}
        <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border border-gray-100 dark:border-gray-800">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900 dark:text-white">Your Reply</h3>
              {hasGenerated && (
                <button 
                  onClick={handleCopy} 
                  className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-800 rounded transition-all"
                  title={copied ? "Copied!" : "Copy reply"}
                >
                  {copied ? <Check className="h-4 w-4 text-green-500" /> : <Clipboard className="h-4 w-4" />}
                </button>
              )}
            </div>
            
            <button
              className="relative p-[1px] rounded-lg overflow-hidden bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 disabled:opacity-50 hover:shadow-lg transition-all"
              onClick={handleGenerateClick}
              disabled={isGenerating === post.id}
            >
              <div className="relative bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-white px-4 py-2 rounded-[7px] flex items-center gap-2 font-medium">
                {isGenerating === post.id ? (
                  <>
                    <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    {hasGenerated ? (
                      <RefreshCcw className="h-4 w-4" />
                    ) : (
                      <Sparkles className="h-4 w-4" />
                    )}
                    {hasGenerated ? "Regenerate" : "Generate Reply"}
                  </>
                )}
              </div>
            </button>
          </div>

          {/* Reply Content */}
          <div className="min-h-[80px] mb-4">
            {isEditing === post.id ? (
              <textarea 
                className="w-full p-3 rounded-md bg-white dark:bg-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none resize-none"
                value={post.suggestedReply}
                onChange={(e) => {
                  const newValue = e.target.value;
                  setDisplayedPosts(posts =>
                    posts.map(p => p.id === post.id ? { ...p, suggestedReply: newValue } : p)
                  );
                }}
                rows={4}
                placeholder="Write your reply here..."
              />
            ) : (
              <div className="prose prose-sm dark:prose-invert max-w-none p-3 bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700">
                <ReactMarkdown className="text-gray-700 dark:text-gray-300">
                  {post.suggestedReply}
                </ReactMarkdown>
              </div>
            )}
          </div>
          
          {/* Action Buttons */}
          <div className="flex justify-between items-center">
            {/* Left side buttons group */}
            <div className="flex gap-2">
              {isEditing === post.id ? (
                <button 
                  className="btn btn-neutral flex items-center gap-2"
                  onClick={() => handleSave(post.id, post.suggestedReply)}
                >
                  <Save className="h-4 w-4" />
                  Save Changes
                </button>
              ) : (
                <button 
                  className="btn btn-neutral flex items-center gap-2"
                  onClick={() => handleEdit(post.id)}
                >
                  <Pencil className="h-4 w-4" />
                  Edit
                </button>
              )}

              <button 
                className={`btn btn-success flex items-center gap-2 ${isApproving === post.id ? 'loading' : ''}`}
                onClick={() => handleApprove(post.id, post.suggestedReply)}
                disabled={isApproving === post.id}
              >
                {isApproving === post.id ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Posting...</span>
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    Post Reply
                  </>
                )}
              </button>
            </div>
            
            {/* Right side button */}
            <button 
                className={`
                  px-4 py-2 rounded-lg font-medium transition-all duration-200 
                  flex items-center gap-2 border-2
                  ${isArchiving === post.id 
                    ? 'bg-slate-700 border-slate-500 text-slate-400 cursor-not-allowed' 
                    : 'bg-slate-800 hover:bg-slate-700 border-blue-500 hover:border-blue-400 text-white hover:scale-105 hover:shadow-lg active:scale-95'
                  }
                  disabled:opacity-75
                `}
                onClick={() => handleArchive(post.id)}
                disabled={isArchiving === post.id}
              >
                {isArchiving === post.id ? (
                  <>
                    <div className="relative">
                      <div className="w-4 h-4 border-2 border-slate-500 rounded-full"></div>
                      <div className="absolute top-0 left-0 w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    <span>Archiving...</span>
                  </>
                ) : (
                  <>
                    <Archive className="h-4 w-4" />
                    <span>I Posted</span>
                  </>
                )}
              </button>
          </div>
        </div>
      </div>

      {/* Reject Button */}
      {page === 'dashboard' && (
        <button
          onClick={() => handleReject(post.id)}
          className="absolute -top-2 -right-2 w-7 h-7 
                    bg-red-500 hover:bg-red-600
                    text-white
                    rounded-full flex items-center justify-center
                    shadow-lg hover:shadow-xl
                    transition-all duration-200
                    group"
          title="Remove this post"
        >
          <X className="h-4 w-4" />
        </button>
      )}
      

      {/* Compact Regeneration Modal */}
      {regenerateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm p-2">
          <div className="bg-white dark:bg-gray-900 rounded-xl p-4 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200 dark:border-gray-700">
            {/* Compact Modal Header */}
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Improve Reply</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">Choose how to enhance your response</p>
              </div>
              <button 
                onClick={handleModalClose} 
                className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Compact Feedback Type Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Reply type:
              </label>
              <div className="grid grid-cols-1 gap-2">
                {feedbackTypes.map(({ type, description, icon }) => (
                  <button
                    key={type}
                    onClick={() => setFeedbackType(feedbackType === type ? "" : type)}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      feedbackType === type 
                        ? "border-orange-500 bg-orange-50 dark:bg-orange-900/20" 
                        : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base">{icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className={`font-medium text-sm ${
                          feedbackType === type 
                            ? "text-orange-700 dark:text-orange-300" 
                            : "text-gray-900 dark:text-gray-100"
                        }`}>
                          {type}
                        </div>
                        <div className={`text-xs mt-0.5 ${
                          feedbackType === type 
                            ? "text-orange-600 dark:text-orange-400" 
                            : "text-gray-600 dark:text-gray-400"
                        }`}>
                          {description}
                        </div>
                      </div>
                      {feedbackType === type && (
                        <Check className="h-4 w-4 text-orange-500 flex-shrink-0" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Compact Custom Feedback Input */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Additional instructions:
              </label>
              <textarea
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="Add specific details..."
                className="w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none resize-none text-sm"
                rows={2}
              />
            </div>

            {/* Compact Modal Actions */}
            <div className="flex justify-end gap-2">
              <button 
                onClick={handleModalClose} 
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium transition-colors text-sm"
              >
                Cancel
              </button>
              <button 
                onClick={handleRegenerateSubmit} 
                disabled={!feedbackType && !feedbackText.trim()}
                className="px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center gap-1.5 transition-all text-sm"
              >
                <Zap className="h-3.5 w-3.5" />
                Regenerate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostCard;