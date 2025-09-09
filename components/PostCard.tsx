import React, { useState, useEffect } from 'react';
import { ArrowUpRight, Sparkles, Save, Pencil, Check, Clipboard, RefreshCcw, X, Zap, Archive, ArrowUp, MessageCircle, Target, ChevronDown, ChevronUp, Shield, ShieldCheck, ShieldAlert, ShieldX, HelpCircle, Info, Clock, Users } from 'lucide-react';
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
  score?: number;
  comments?: number;
  relevanceScore?: number;
}

// Define type for subreddit classification
interface SubredditClassification {
  classification: 'promotional_allowed' | 'promotional_likely' | 'promotional_conditional' | 'promotional_blocked' | 'error';
  score: number;
  confidence: 'high' | 'medium' | 'low';
  success: boolean;
}

// Define type for detailed classification data
interface ClassificationDetails {
  classification: string;
  score: number;
  confidence: string;
  success: boolean;
  factors?: string[];
  analyzed_at?: string;
  subscriber_count?: number;
  rules_analysis?: {
    policy: string;
    reason?: string;
  };
}

// Define the type for alert state
interface AlertState {
  visible: boolean;
  message: string;
}

const formatTextForMarkdown = (text: string) => {
  if (!text) return text;
  
  // Convert literal \n strings to actual newlines
  const formatted = text.replace(/\\n/g, '\n');
  
  // Split into lines and process
  const lines = formatted.split('\n');
  const processedLines = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (line === '') {
      // Empty line - add as paragraph break if not already added
      if (processedLines.length > 0 && processedLines[processedLines.length - 1] !== '') {
        processedLines.push('');
      }
    } else {
      processedLines.push(line);
    }
  }
  
  // Join with double newlines for proper markdown paragraph breaks
  return processedLines.join('\n\n');
};

// New function specifically for copying - converts \n to actual newlines
const formatTextForCopy = (text: string) => {
  if (!text) return text;
  
  // Convert literal \n strings to actual newlines for copying
  return text.replace(/\\n/g, '\n');
};

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
  userId?: string; // Add userId for classification lookup
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
  page = 'dashboard',
  userId
}) => {
  const [copied, setCopied] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(post.suggestedReply !== "Add your reply here");
  const [regenerateModalOpen, setRegenerateModalOpen] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackType, setFeedbackType] = useState("");
  const [isContentExpanded, setIsContentExpanded] = useState(false);
  const [showPostReplyModal, setShowPostReplyModal] = useState(false);
  const [subredditClassification, setSubredditClassification] = useState<SubredditClassification | null>(null);
  const [isLoadingClassification, setIsLoadingClassification] = useState(false);
  const [showClassificationDetails, setShowClassificationDetails] = useState(false);
  const [classificationDetails, setClassificationDetails] = useState<ClassificationDetails | null>(null);

  const CONTENT_TRUNCATE_LENGTH = 1000;

  // Fetch subreddit classification
  useEffect(() => {
    const fetchSubredditClassification = async () => {
      if (!userId || !post.subreddit) return;
      
      setIsLoadingClassification(true);
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        const response = await fetch(`${apiUrl}/user/${userId}/subreddit/${post.subreddit}/promotional_allowance`);
        
        if (response.ok) {
          const data = await response.json();
          setSubredditClassification({
            classification: data.promotional_allowance,
            score: 0, // Score not returned by this endpoint
            confidence: 'medium', // Default confidence
            success: true
          });
        }
        
        // Also fetch detailed classification data
        const detailsResponse = await fetch(`${apiUrl}/user/${userId}/subreddit_classifications`);
        if (detailsResponse.ok) {
          const detailsData = await detailsResponse.json();
          const subredditDetails = detailsData.classifications[post.subreddit];
          if (subredditDetails) {
            setClassificationDetails(subredditDetails);
          }
        }
      } catch (error) {
        console.error('Error fetching subreddit classification:', error);
      } finally {
        setIsLoadingClassification(false);
      }
    };

    fetchSubredditClassification();
  }, [userId, post.subreddit]);

  // Component to render promotional status badge
  const PromotionalStatusBadge = () => {
    if (isLoadingClassification) {
      return (
        <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full px-2.5 py-1">
          <div className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Checking...</span>
        </div>
      );
    }

    if (!subredditClassification) return null;

    const getStatusConfig = (classification: string) => {
      switch (classification) {
        case 'promotional_allowed':
          return {
            icon: ShieldCheck,
            color: 'text-green-600 dark:text-green-400',
            bgColor: 'bg-green-50 dark:bg-green-900/20',
            borderColor: 'border-green-200 dark:border-green-700',
            text: 'Promo OK',
            tooltip: 'Promotional content is welcome in this subreddit'
          };
        case 'promotional_likely':
          return {
            icon: Shield,
            color: 'text-blue-600 dark:text-blue-400',
            bgColor: 'bg-blue-50 dark:bg-blue-900/20',
            borderColor: 'border-blue-200 dark:border-blue-700',
            text: 'Likely OK',
            tooltip: 'Promotional content is likely allowed with good value'
          };
        case 'promotional_conditional':
          return {
            icon: ShieldAlert,
            color: 'text-yellow-600 dark:text-yellow-400',
            bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
            borderColor: 'border-yellow-200 dark:border-yellow-700',
            text: 'Conditional',
            tooltip: 'Promotional content allowed under specific conditions'
          };
        case 'promotional_blocked':
          return {
            icon: ShieldX,
            color: 'text-red-600 dark:text-red-400',
            bgColor: 'bg-red-50 dark:bg-red-900/20',
            borderColor: 'border-red-200 dark:border-red-700',
            text: 'No Promo',
            tooltip: 'Promotional content is not allowed in this subreddit'
          };
        default:
          return {
            icon: HelpCircle,
            color: 'text-gray-600 dark:text-gray-400',
            bgColor: 'bg-gray-50 dark:bg-gray-800',
            borderColor: 'border-gray-200 dark:border-gray-700',
            text: 'Unknown',
            tooltip: 'Unable to determine promotional policy'
          };
      }
    };

    const config = getStatusConfig(subredditClassification.classification);
    const IconComponent = config.icon;

    return (
      <div 
        className={`flex items-center gap-1.5 ${config.bgColor} border ${config.borderColor} rounded-full px-2.5 py-1 cursor-pointer hover:opacity-80 transition-opacity`}
        title={`Click to ${showClassificationDetails ? 'hide' : 'show'} details - ${config.tooltip}`}
        onClick={(e) => {
          e.stopPropagation();
          setShowClassificationDetails(!showClassificationDetails);
        }}
      >
        <IconComponent className={`w-3 h-3 ${config.color}`} />
        <span className={`text-xs font-medium ${config.color}`}>
          {config.text}
        </span>
        <ChevronDown className={`w-3 h-3 ${config.color} transition-transform ${showClassificationDetails ? 'rotate-180' : ''}`} />
      </div>
    );
  };

  // Component to render detailed classification information
  const ClassificationDetails = () => {
    if (!showClassificationDetails || !classificationDetails) return null;

    const formatDate = (dateString: string) => {
      try {
        return formatDistanceToNow(new Date(dateString), { addSuffix: true });
      } catch {
        return 'Recently';
      }
    };

    const getScoreColor = (score: number) => {
      if (score >= 0.7) return 'text-green-600 dark:text-green-400';
      if (score >= 0.5) return 'text-blue-600 dark:text-blue-400';
      if (score >= 0.3) return 'text-yellow-600 dark:text-yellow-400';
      return 'text-red-600 dark:text-red-400';
    };

    const getConfidenceColor = (confidence: string) => {
      switch (confidence) {
        case 'high': return 'text-green-600 dark:text-green-400';
        case 'medium': return 'text-yellow-600 dark:text-yellow-400';
        case 'low': return 'text-red-600 dark:text-red-400';
        default: return 'text-gray-600 dark:text-gray-400';
      }
    };

    return (
      <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 animate-in slide-in-from-top-2 duration-200">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Info className="w-4 h-4" />
            Classification Details
          </h4>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowClassificationDetails(false);
            }}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        </div>

        <div className="space-y-2">
          {/* Score and Confidence */}
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="flex items-center gap-2">
              <Target className="w-3 h-3 text-gray-500" />
              <span className="text-gray-600 dark:text-gray-400">Score:</span>
              <span className={`font-medium ${getScoreColor(classificationDetails.score || 0)}`}>
                {((classificationDetails.score || 0) * 100).toFixed(0)}%
              </span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-3 h-3 text-gray-500" />
              <span className="text-gray-600 dark:text-gray-400">Confidence:</span>
              <span className={`font-medium capitalize ${getConfidenceColor(classificationDetails.confidence || 'medium')}`}>
                {classificationDetails.confidence || 'Medium'}
              </span>
            </div>
          </div>

          {/* Analyzed timestamp */}
          {classificationDetails.analyzed_at && (
            <div className="flex items-center gap-2 text-xs">
              <Clock className="w-3 h-3 text-gray-500" />
              <span className="text-gray-600 dark:text-gray-400">Analyzed:</span>
              <span className="text-gray-700 dark:text-gray-300">
                {formatDate(classificationDetails.analyzed_at)}
              </span>
            </div>
          )}

          {/* Subscriber count if available */}
          {classificationDetails.subscriber_count !== undefined && (
            <div className="flex items-center gap-2 text-xs">
              <Users className="w-3 h-3 text-gray-500" />
              <span className="text-gray-600 dark:text-gray-400">Members:</span>
              <span className="text-gray-700 dark:text-gray-300 font-medium">
                {classificationDetails.subscriber_count.toLocaleString()}
              </span>
            </div>
          )}

          {/* Key factors */}
          {classificationDetails.factors && classificationDetails.factors.length > 0 && (
            <div className="mt-3">
              <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Key factors:</div>
              <div className="space-y-1">
                {classificationDetails.factors.slice(0, 3).map((factor: string, index: number) => (
                  <div key={index} className="flex items-start gap-2 text-xs">
                    <div className="w-1 h-1 rounded-full bg-gray-400 mt-2 flex-shrink-0"></div>
                    <span className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      {factor}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Rules analysis if available */}
          {classificationDetails.rules_analysis && (
            <div className="mt-3 pt-2 border-t border-gray-200 dark:border-gray-700">
              <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Rules analysis:</div>
              <div className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                <span className="font-medium capitalize">
                  {classificationDetails.rules_analysis.policy}
                </span>
                {classificationDetails.rules_analysis.reason && (
                  <span className="text-gray-600 dark:text-gray-400">
                    {' - '}{classificationDetails.rules_analysis.reason}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };
  
  const getTruncatedContent = (content: string) => {
    if (content.length <= CONTENT_TRUNCATE_LENGTH) {
      return { content, isTruncated: false };
    }
    
    if (isContentExpanded) {
      return { content, isTruncated: true };
    }
    
    // Find a good truncation point near the limit (prefer end of sentence or word)
    let truncateAt = CONTENT_TRUNCATE_LENGTH;
    const searchEnd = Math.min(content.length, CONTENT_TRUNCATE_LENGTH + 100);
    
    // Look for sentence ending
    for (let i = CONTENT_TRUNCATE_LENGTH; i < searchEnd; i++) {
      if (content[i] === '.' || content[i] === '!' || content[i] === '?') {
        truncateAt = i + 1;
        break;
      }
    }
    
    // If no sentence ending found, look for word boundary
    if (truncateAt === CONTENT_TRUNCATE_LENGTH) {
      for (let i = CONTENT_TRUNCATE_LENGTH; i < searchEnd; i++) {
        if (content[i] === ' ') {
          truncateAt = i;
          break;
        }
      }
    }
    
    return { 
      content: content.substring(0, truncateAt).trim() + '...', 
      isTruncated: true 
    };
  };

  const handleCopy = () => {
    // Use the formatted version for copying
    const formattedText = formatTextForCopy(post.suggestedReply);
    navigator.clipboard.writeText(formattedText);
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

  // Modified handleApprove to show popup instead of directly approving
  const handleApproveClick = () => {
    const formattedReply = formatTextForCopy(post.suggestedReply);
    handleApprove(post.id, formattedReply);
    setShowPostReplyModal(true);
  };

  const handlePostReplyConfirmed = () => {
    handleArchive(post.id);
    setShowPostReplyModal(false);
  };

  const handlePostReplyNotMade = () => {
    setShowPostReplyModal(false);
  };

  return (
    <div className="relative card bg-base-100 dark:bg-black bg-white shadow-xl border border-gray-200 dark:border-gray-700">
      <div className="card-body">
        {/* Header Section */}
        <div className="mb-4">
          <div className="flex justify-between items-start mb-2">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <div className="text-sm font-medium text-blue-500 dark:text-blue-400">
                  r/{post.subreddit}
                </div>
                <PromotionalStatusBadge />
              </div>
              <ClassificationDetails />
              <h2 className="card-title dark:text-white flex items-center gap-2 leading-tight">
                {post.title}
                {post.promotional && (
                  <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-gradient-to-r from-orange-400 to-orange-600 text-white">
                    Promotional
                  </span>
                )}
                {post.relevanceScore !== undefined && (
                  <div className="flex items-center gap-1.5 bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border border-orange-200 dark:border-orange-700/50 rounded-full px-3 py-1.5">
                    <Target className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
                    <span className="text-xs font-medium text-orange-700 dark:text-orange-300">
                      {post.relevanceScore.toFixed(1)}/10
                    </span>
                  </div>
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

          {/* Date and Stats Section */}
          <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mb-3" suppressHydrationWarning>
            <span>
              {post.date_created && !isNaN(new Date(post.date_created).getTime())
                ? formatDistanceToNow(new Date(post.date_created), { addSuffix: true })
                : 'Invalid Date'}
            </span>
            
          </div>

          <div className="prose prose-sm dark:prose-invert max-w-none">
            {(() => {
              const { content, isTruncated } = getTruncatedContent(post.content);
              return (
                <>
                  <ReactMarkdown 
                    className="text-gray-700 dark:text-gray-300"
                    components={{
                      p: ({ children }) => <p className="mb-4 last:mb-0">{children}</p>,
                      ul: ({ children }) => <ul className="mb-4 last:mb-0 pl-6">{children}</ul>,
                      li: ({ children }) => <li className="mb-1">{children}</li>
                    }}
                  >
                    {formatTextForMarkdown(content)}
                  </ReactMarkdown>
                  
                  {isTruncated && (
                    <button
                      onClick={() => setIsContentExpanded(!isContentExpanded)}
                      className="inline-flex items-center gap-1 mt-2 text-sm font-medium text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 transition-colors"
                    >
                      {isContentExpanded ? (
                        <>
                          <ChevronUp className="w-4 h-4" />
                          Read Less
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-4 h-4" />
                          Read More
                        </>
                      )}
                    </button>
                  )}
                </>
              );
            })()}
          </div>
          {/* Reddit-style upvotes and comments display */}
        <div className="flex items-center gap-4 mt-3">
          {post.score !== undefined && (
            <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
              <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-full px-3 py-1.5">
                <ArrowUp className="w-4 h-4 text-orange-500 mr-1.5" />
                <span className="text-sm font-medium">{post.score.toLocaleString()}</span>
              </div>
            </div>
          )}
          {post.comments !== undefined && (
            <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
              <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-full px-3 py-1.5">
                <MessageCircle className="w-4 h-4 mr-1.5" />
                <span className="text-sm font-medium">{post.comments.toLocaleString()}</span>
              </div>
            </div>
          )}
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
          <div className="mb-4">
            {isEditing === post.id ? (
              <textarea 
                className="w-full p-4 rounded-md bg-white dark:bg-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none resize-vertical"
                value={post.suggestedReply}
                onChange={(e) => {
                  const newValue = e.target.value;
                  setDisplayedPosts(posts =>
                    posts.map(p => p.id === post.id ? { ...p, suggestedReply: newValue } : p)
                  );
                }}
                rows={Math.max(3, Math.min(20, post.suggestedReply.split('\n').length + 2))}
                style={{ 
                  minHeight: `${Math.max(100, Math.min(400, post.suggestedReply.length * 0.8 + 60))}px`,
                  height: 'auto'
                }}
                placeholder="Write your reply here..."
              />
            ) : (
              <div 
                className="prose prose-sm dark:prose-invert max-w-none p-3 bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700"
                style={{
                  minHeight: `${Math.max(80, Math.min(300, post.suggestedReply.length * 0.6 + 40))}px`
                }}
              >
                <ReactMarkdown 
                  className="text-gray-700 dark:text-gray-300"
                  components={{
                    p: ({ children }) => <p className="mb-4 last:mb-0">{children}</p>,
                    ul: ({ children }) => <ul className="mb-4 last:mb-0 pl-6">{children}</ul>,
                    li: ({ children }) => <li className="mb-1">{children}</li>
                  }}
                >
                  {formatTextForMarkdown(post.suggestedReply)}
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
                onClick={handleApproveClick}
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

      {/* Post Reply Confirmation Modal */}
      {showPostReplyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-gray-900 rounded-xl p-6 w-full max-w-md shadow-2xl border border-gray-800">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-medium text-white">Did you post the reply?</h3>
              <button 
                onClick={handlePostReplyNotMade}
                className="text-gray-400 hover:text-orange-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-200 text-sm">
                We copied your reply to the clipboard and opened the Reddit post. Did you successfully post your reply?
              </p>
            </div>
            
            <div className="flex gap-3">
              <button 
                onClick={handlePostReplyConfirmed}
                className="flex-1 px-4 py-3 bg-orange-600 text-white rounded-md hover:bg-orange-500 shadow-lg shadow-orange-900/20 transition-all font-medium"
              >
                Yes, I posted it
              </button>
              <button 
                onClick={handlePostReplyNotMade}
                className="flex-1 px-4 py-3 bg-gray-600 text-white rounded-md hover:bg-gray-500 transition-all font-medium"
              >
                No, I didn&apos;t post
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostCard;