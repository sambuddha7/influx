'use client';
import React, { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, CheckCircle, AlertTriangle, Plus, Tag, ExternalLink, RefreshCw, Shield, AlertCircle, XCircle } from 'lucide-react';

// Types (keep existing)
interface PostType {
  name: string;
  description: string;
  risk_level: 'low' | 'medium' | 'high';
}

interface SubredditRecommendation {
    name: string;
    allowed_post_types: string[];
    blocked_post_types: string[];
    unclear_post_types?: string[];
    description?: string;
    subscribers?: number;
    over18?: boolean;
  }


interface ApiSubredditResponse {
    name: string;
    allowed_post_types?: string[];
    blocked_post_types?: string[];
    unclear_post_types?: string[];
    summary?: string;  // API uses 'summary'
    subscribers?: number;
    over18?: boolean;
  }  


interface GeneratedPost {
  post_type: string;
  content: string;
  title: string;
  body: string;
  target_audience: string;
  subreddit: string;
  company_name: string;
  post_id?: string;
}

const CreateRedditPostPage = () => {
  const [user, loading] = useAuthState(auth);
  const router = useRouter();
  
  // State (keep existing state variables and add these new ones)
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedPostType, setSelectedPostType] = useState<string>('');
  const [selectedSubreddit, setSelectedSubreddit] = useState<string>('');
  const [generatedPost, setGeneratedPost] = useState<GeneratedPost | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoadingSubreddits, setIsLoadingSubreddits] = useState(false);
  const [isLoadingCompliance, setIsLoadingCompliance] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customInstructions, setCustomInstructions] = useState<string>('');
  const [showAddSubreddit, setShowAddSubreddit] = useState(false);
  const [customSubredditName, setCustomSubredditName] = useState('');
  const [isAddingSubreddit, setIsAddingSubreddit] = useState(false);
  const [savedSubreddits, setSavedSubreddits] = useState<SubredditRecommendation[]>([]);
  const [showRegenerateModal, setShowRegenerateModal] = useState(false);
  const [regenerateInstructions, setRegenerateInstructions] = useState('');
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [showPostSuccessModal, setShowPostSuccessModal] = useState(false);
  const [showNextStepsModal, setShowNextStepsModal] = useState(false);
  
  // Data
  const api_url = process.env.NEXT_PUBLIC_API_URL;
  const [recommendedSubreddits, setRecommendedSubreddits] = useState<SubredditRecommendation[]>([]);
  const [postTypes, setPostTypes] = useState<Record<string, PostType>>({});
  const [complianceData, setComplianceData] = useState<{
    allowed_post_types: string[], 
    blocked_post_types: string[],
    unclear_post_types?: string[]
  } | null>(null);
  const [cachedSubreddits, setCachedSubreddits] = useState<SubredditRecommendation[] | null>(null);

  // Add these functions here
    const getSubredditSize = (subscribers: number) => {
        if (subscribers < 50000) return { label: 'niche', color: 'text-blue-400' };
        if (subscribers < 250000) return { label: 'mid', color: 'text-yellow-400' };
        return { label: 'popular', color: 'text-green-400' };
    };
    
    const formatSubscribers = (count: number) => {
        if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
        if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
        return count.toString();
    };

  // Animation states
  const [isPageTransitioning, setIsPageTransitioning] = useState(true);
  const [isStepTransitioning, setIsStepTransitioning] = useState(false);
  const [showSubreddits, setShowSubreddits] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Page entrance animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPageTransitioning(false);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  // Load post types on mount
  useEffect(() => {
    if (user) {
      fetchPostTypes();
      fetchSubredditRecommendations();
    }
  }, [user]);

  // Steps configuration
  const steps = [
    { number: 1, title: 'Choose Subreddit', description: 'Select where to post your content' },
    { number: 2, title: 'Choose Post Type', description: 'Select the type of Reddit post to create' },
    { number: 3, title: 'Generate & Edit', description: 'Review and customize your post' }
  ];

  const fetchPostTypes = async () => {
    try {
      const response = await fetch(`${api_url}/reddit-posts/post-types`);
      const data = await response.json();
      setPostTypes(data.data);
    } catch (err) {
      console.error('Failed to fetch post types:', err);
    }
  };

  const fetchSubredditRecommendations = async (forceRefresh = false) => {
    if (!user) return;
    
    setIsLoadingSubreddits(true);
    setShowSubreddits(false);
    setError(null);
    
    try {
      const response = await fetch(`${api_url}/reddit-posts/recommended-subreddits`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          user_id: user.uid,
          force_refresh: forceRefresh 
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.detail || 'Failed to load subreddits');
      }
      
      const subreddits = data.data.subreddits.map((subreddit: ApiSubredditResponse) => ({
        name: subreddit.name,
        allowed_post_types: subreddit.allowed_post_types || [],
        blocked_post_types: subreddit.blocked_post_types || [],
        unclear_post_types: subreddit.unclear_post_types || [],
        description: subreddit.summary,
        subscribers: subreddit.subscribers,
        over18: subreddit.over18
      }));
      
      setRecommendedSubreddits(subreddits);
      setSavedSubreddits(subreddits);
      
      // Smooth appearance of subreddits
      setTimeout(() => {
        setShowSubreddits(true);
      }, 300);
      
      // Only update localStorage cache if this was a fresh search
      if (!data.data.from_cache) {
        localStorage.setItem(`subreddits_${user.uid}`, JSON.stringify({
          data: subreddits,
          timestamp: Date.now()
        }));
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load subreddit recommendations');
    } finally {
      setIsLoadingSubreddits(false);
    }
  };

  const handleRegeneratePost = async () => {
    if (!user || !selectedPostType || !selectedSubreddit) return;
    
    setIsRegenerating(true);
    setError(null);
    
    try {
      // Combine original custom instructions with new regenerate instructions
      const combinedInstructions = [
        customInstructions,
        regenerateInstructions ? `REGENERATION CHANGES: ${regenerateInstructions}` : ''
      ].filter(Boolean).join('\n\n');
      
      const response = await fetch(`${api_url}/reddit-posts/generate-post`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.uid,
          post_type: selectedPostType,
          subreddit: selectedSubreddit,
          custom_instructions: combinedInstructions || undefined
        }),
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();
      setGeneratedPost(data.data);
      
      // Close modal and reset
      setShowRegenerateModal(false);
      setRegenerateInstructions('');
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to regenerate post');
    } finally {
      setIsRegenerating(false);
    }
  };

  const handlePostToReddit = () => {
    if (!generatedPost) return;
    
    // Open Reddit's submit page for the specific subreddit
    const redditUrl = `https://www.reddit.com/r/${generatedPost.subreddit}/submit`;
    window.open(redditUrl, '_blank');
    
    // Show success modal
    setShowPostSuccessModal(true);
  };
  

  const findMoreSubreddits = async () => {
    if (!user) return;
    
    setIsLoadingMore(true);
    setError(null);
    
    try {
      const response = await fetch(`${api_url}/reddit-posts/find-more-subreddits`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.uid })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.detail || 'Failed to find more subreddits');
      }
      
      if (data.data.subreddits.length === 0) {
        setError("No more subreddits available to analyze.");
        return;
      }
      
      // Add new subreddits to existing list
      const newSubreddits = data.data.subreddits.map((subreddit: ApiSubredditResponse) => ({
        name: subreddit.name,
        allowed_post_types: subreddit.allowed_post_types || [],
        blocked_post_types: subreddit.blocked_post_types || [],
        unclear_post_types: subreddit.unclear_post_types || [],
        description: subreddit.summary,
        subscribers: subreddit.subscribers,
        over18: subreddit.over18
      }));
      
      const updatedSubreddits = [...recommendedSubreddits, ...newSubreddits];
      setRecommendedSubreddits(updatedSubreddits);
      setSavedSubreddits(updatedSubreddits);
      
      // Update localStorage
      localStorage.setItem(`subreddits_${user.uid}`, JSON.stringify({
        data: updatedSubreddits,
        timestamp: Date.now()
      }));
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to find more subreddits');
    } finally {
      setIsLoadingMore(false);
    }
  };

  const addCustomSubreddit = async () => {
    if (!user || !customSubredditName.trim()) return;
    
    setIsAddingSubreddit(true);
    setError(null);
    
    try {
      const response = await fetch(`${api_url}/reddit-posts/add-custom-subreddit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          user_id: user.uid,
          subreddit_name: customSubredditName.trim()
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.detail || 'Failed to add subreddit');
      }
      
      const newSubreddit = {
        name: data.data.subreddit.name,
        allowed_post_types: data.data.subreddit.allowed_post_types || [],
        blocked_post_types: data.data.subreddit.blocked_post_types || [],
        unclear_post_types: data.data.subreddit.unclear_post_types || [],
        description: data.data.subreddit.summary,
        subscribers: data.data.subreddit.subscribers,
        over18: data.data.subreddit.over18
      };
      
      const updatedSubreddits = [...recommendedSubreddits, newSubreddit];
      setRecommendedSubreddits(updatedSubreddits);
      setSavedSubreddits(updatedSubreddits);
      
      localStorage.setItem(`subreddits_${user.uid}`, JSON.stringify({
        data: updatedSubreddits,
        timestamp: Date.now()
      }));
      
      setCustomSubredditName('');
      setShowAddSubreddit(false);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add custom subreddit');
    } finally {
      setIsAddingSubreddit(false);
    }
  };

  const removeSubreddit = async (subredditName: string) => {
    if (!user) return;
    
    try {
      const response = await fetch(`${api_url}/reddit-posts/remove-subreddit`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          user_id: user.uid,
          subreddit_name: subredditName
        })
      });
      
      if (response.ok) {
        const updatedSubreddits = recommendedSubreddits.filter(s => s.name !== subredditName);
        setRecommendedSubreddits(updatedSubreddits);
        setSavedSubreddits(updatedSubreddits);
        
        localStorage.setItem(`subreddits_${user.uid}`, JSON.stringify({
          data: updatedSubreddits,
          timestamp: Date.now()
        }));
      }
    } catch (err) {
      console.error('Failed to remove subreddit:', err);
    }
  };

  const handleSubredditSelect = async (subreddit: string) => {
    setSelectedSubreddit(subreddit);
    const selected = recommendedSubreddits.find(s => s.name === subreddit);
    if (selected) {
      setComplianceData({
        allowed_post_types: selected.allowed_post_types || [],
        blocked_post_types: selected.blocked_post_types || [],
        unclear_post_types: selected.unclear_post_types || []
      });
    }
    
    // Smooth step transition
    setIsStepTransitioning(true);
    setTimeout(() => {
      setCurrentStep(2);
      setIsStepTransitioning(false);
    }, 200);
  };

  const handleStepChange = (newStep: number) => {
    setIsStepTransitioning(true);
    setTimeout(() => {
      setCurrentStep(newStep);
      setIsStepTransitioning(false);
    }, 200);
  };

  const handleGeneratePost = async () => {
    if (!user || !selectedPostType || !selectedSubreddit) return;
    
    setIsGenerating(true);
    setError(null);
    
    try {
      const response = await fetch(`${api_url}/reddit-posts/generate-post`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.uid,
          post_type: selectedPostType,
          subreddit: selectedSubreddit,
          custom_instructions: customInstructions || undefined
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setGeneratedPost(data.data);
      
      // Smooth transition to step 3
      setIsStepTransitioning(true);
      setTimeout(() => {
        setCurrentStep(3);
        setIsStepTransitioning(false);
      }, 200);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate post');
    } finally {
      setIsGenerating(false);
    }
  };

  // Utility functions (keep existing)
  const getPostTypeStatus = (postTypeKey: string) => {
    if (!complianceData) return 'unknown';
    if (complianceData.allowed_post_types.includes(postTypeKey)) return 'allowed';
    if (complianceData.blocked_post_types.includes(postTypeKey)) return 'blocked';
    if (complianceData.unclear_post_types?.includes(postTypeKey)) return 'unclear';
    return 'unclear';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'allowed':
        return <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />;
      case 'blocked':
        return <XCircle className="w-4 h-4 text-red-600 dark:text-red-400" />;
      case 'unclear':
        return <AlertCircle className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'allowed':
        return (
          <span className="bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-200 text-xs px-2 py-1 rounded-full flex items-center">
            <CheckCircle className="w-3 h-3 mr-1" />
            Allowed
          </span>
        );
      case 'blocked':
        return (
          <span className="bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-200 text-xs px-2 py-1 rounded-full flex items-center">
            <XCircle className="w-3 h-3 mr-1" />
            Not Recommended
          </span>
        );
      case 'unclear':
        return (
          <span className="bg-yellow-100 text-yellow-700 dark:bg-yellow-800 dark:text-yellow-200 text-xs px-2 py-1 rounded-full flex items-center">
            <AlertCircle className="w-3 h-3 mr-1" />
            Check Rules
          </span>
        );
      default:
        return null;
    }
  };

  const handlePostConfirmed = async () => {
    if (!user || !generatedPost) return;
    
    try {
      console.log('🔍 DEBUG: Starting handlePostConfirmed with:', {
        user_id: user.uid,
        post_id: generatedPost.post_id,
        generatedPost: generatedPost
      });
      
      // Simply update the existing post's status to 'posted' and include any edits
      if (generatedPost.post_id) {
        console.log('🔍 DEBUG: Updating existing post status for post_id:', generatedPost.post_id);
        console.log('🔍 DEBUG: Current generatedPost content:', {
          title: generatedPost.title,
          body: generatedPost.body,
          target_audience: generatedPost.target_audience
        });
        
        const updateResponse = await fetch(`${api_url}/reddit-posts/update-post-status`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            post_id: generatedPost.post_id,
            status: 'posted',
            updated_content: {
              title: generatedPost.title,
              body: generatedPost.body,
              target_audience: generatedPost.target_audience
            }
          })
        });
        
        console.log('🔍 DEBUG: Update response status:', updateResponse.status);
        
        if (updateResponse.ok) {
          const updateData = await updateResponse.json();
          console.log('🔍 DEBUG: Successfully updated post status:', updateData);
        } else {
          const errorData = await updateResponse.text();
          console.error('🔍 DEBUG: Failed to update post status:', errorData);
        }
      } else {
        console.log('🔍 DEBUG: No post_id found, cannot update status');
      }
    } catch (err) {
      console.error('🔍 DEBUG: Failed to track posted status:', err);
    }
    
    // Close first modal and show second modal
    setShowPostSuccessModal(false);
    setShowNextStepsModal(true);
  };
  
  const handlePostNotMade = () => {
    // Close first modal and show second modal
    setShowPostSuccessModal(false);
    setShowNextStepsModal(true);
  };
  
  const handleCreateAnotherPost = () => {
    // Reset all state to go back to step 1
    setCurrentStep(1);
    setSelectedPostType('');
    setSelectedSubreddit('');
    setGeneratedPost(null);
    setCustomInstructions('');
    setComplianceData(null);
    setShowNextStepsModal(false);
    setError(null);
  };
  
  const handleReturnToDashboard = () => {
    router.push('/dashboard'); // Adjust path as needed
  };

  const getRiskBadgeColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200';
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  const getCardBorderColor = (status: string, isSelected: boolean) => {
    if (isSelected) return 'border-orange-500 bg-orange-50 dark:bg-orange-900/20';
    
    switch (status) {
      case 'allowed':
        return 'border-green-200 hover:border-green-400 dark:border-green-800 dark:hover:border-green-600';
      case 'blocked':
        return 'border-red-200 hover:border-red-400 dark:border-red-800 dark:hover:border-red-600';
      case 'unclear':
        return 'border-yellow-200 hover:border-yellow-400 dark:border-yellow-800 dark:hover:border-yellow-600';
      default:
        return 'border-gray-200 hover:border-gray-400 dark:border-gray-700 dark:hover:border-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className={`min-h-screen transition-all duration-300 ease-in-out ${
      isPageTransitioning ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
    }`}>
      <div className="max-w-6xl mx-auto p-6">
        {/* Enhanced Header */}
        <div className="mb-12">
          <div className="flex items-center justify-between">
            {/* Left side - Back button and title */}
            <div className="flex items-center">
              <button
                onClick={() => {
                  if (currentStep > 1) {
                    handleStepChange(currentStep - 1);
                  } else {
                    setIsPageTransitioning(true);
                    setTimeout(() => {
                      router.back();
                    }, 200);
                  }
                }}
                className="mr-6 p-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-xl transition-all duration-200"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-4xl font-bold text-white mb-2" style={{fontFamily: 'system-ui, -apple-system, sans-serif'}}>
                  Create Reddit Post
                </h1>
              </div>
            </div>
            
            {/* Right side - Action buttons */}
            {currentStep === 1 && (
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setShowAddSubreddit(true)}
                  className="flex items-center px-5 py-3 text-sm bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-all duration-200 font-medium"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Subreddit
                </button>
                
                {recommendedSubreddits.length > 0 && (
                  <button
                    onClick={findMoreSubreddits}
                    disabled={isLoadingMore}
                    className="flex items-center px-5 py-3 text-sm bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-200 font-medium"
                  >
                    {isLoadingMore ? (
                      <>
                        <div className="animate-spin w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                        Finding More...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-2" />
                        Find More
                      </>
                    )}
                  </button>
                )}
                
                <button
                  onClick={() => fetchSubredditRecommendations(true)}
                  disabled={isLoadingSubreddits}
                  className="flex items-center px-5 py-3 text-sm border border-gray-600 rounded-xl hover:bg-gray-800 transition-all duration-200 text-gray-300 font-medium"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${isLoadingSubreddits ? 'animate-spin' : ''}`} />
                  Find New Subreddits
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Progress Steps - Dynamic Card Stack Style */}
<div className="mb-12">
 <div className="flex items-center justify-center gap-2 sm:gap-4 px-2 sm:px-4 overflow-x-auto">
   {steps.map((step, index) => (
     <div 
       key={step.number} 
       className="flex flex-col items-center flex-shrink-0"
       style={{
         zIndex: currentStep >= step.number ? 30 + index : 10 + index
       }}
     >
       <div 
         className="relative h-12 sm:h-16 md:h-20 lg:h-24 px-2 sm:px-4 md:px-8 lg:px-12 flex flex-col items-center justify-center text-white font-bold rounded-lg sm:rounded-xl w-24 sm:w-32 md:w-48 lg:w-64 xl:w-80"
         style={{
           background: currentStep >= step.number 
             ? 'linear-gradient(135deg, #f97316, #ea580c)' 
             : 'linear-gradient(135deg, #4b5563, #374151)',
           boxShadow: currentStep >= step.number 
             ? `0 ${20 + index * 5}px ${30 + index * 5}px -5px rgba(249, 115, 22, 0.4)`
             : `0 ${8 + index * 2}px ${16 + index * 2}px -2px rgba(0, 0, 0, 0.3)`,
           transition: 'all 500ms ease-in-out',
           border: currentStep >= step.number ? '2px solid rgba(249, 115, 22, 0.3)' : '2px solid transparent'
         }}
       >
         <span className="text-center font-semibold mb-0 sm:mb-1 text-xs sm:text-sm md:text-base lg:text-lg truncate">
           {step.title}
         </span>
         <span className="text-xs text-center opacity-80 hidden md:block">
           {step.description}
         </span>
       </div>
     </div>
   ))}
 </div>
</div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-800 rounded-xl flex items-center animate-fadeIn">
            <AlertTriangle className="w-5 h-5 text-red-400 mr-3" />
            <span className="text-red-300">{error}</span>
          </div>
        )}

        {/* Content Area with Smooth Transitions */}
        <div className={`transition-all duration-200 ease-in-out ${
          isStepTransitioning ? 'opacity-0 translate-x-4' : 'opacity-100 translate-x-0'
        }`}>
          
          {/* Step 1: Choose Subreddit */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-white">Choose Subreddit</h2>
                <div className="text-sm text-gray-400">
                  {recommendedSubreddits.length > 0 
                    ? `${recommendedSubreddits.length} subreddits saved`
                    : 'No subreddits saved yet'
                  }
                </div>
              </div>
              
              {/* Add Custom Subreddit Modal */}
              {showAddSubreddit && (
                <div className="bg-gray-800/50 border border-gray-600 rounded-xl p-6 mb-6 animate-fadeIn backdrop-blur-md">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-200">
                      Add Custom Subreddit
                    </h3>
                    <button
                      onClick={() => setShowAddSubreddit(false)}
                      className="text-gray-400 hover:text-gray-200 transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                  
                  <div className="flex space-x-3">
                    <div className="flex-1">
                      <div className="flex">
                        <span className="inline-flex items-center px-4 py-3 border border-r-0 border-gray-600 bg-gray-800 text-gray-400 text-sm rounded-l-xl font-medium">
                          r/
                        </span>
                        <input
                          type="text"
                          value={customSubredditName}
                          onChange={(e) => setCustomSubredditName(e.target.value)}
                          placeholder="programming"
                          className="flex-1 px-4 py-3 border border-gray-600 rounded-r-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-gray-800 text-white"
                          onKeyDown={(e) => e.key === 'Enter' && addCustomSubreddit()}
                        />
                      </div>
                    </div>
                    <button
                      onClick={addCustomSubreddit}
                      disabled={!customSubredditName.trim() || isAddingSubreddit}
                      className="px-6 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-200 font-medium flex items-center"
                    >
                      {isAddingSubreddit ? (
                        <>
                          <div className="animate-spin w-4 h-4 mr-2 border border-white border-t-transparent rounded-full"></div>
                          Adding...
                        </>
                      ) : (
                        'Add'
                      )}
                    </button>
                  </div>
                  
                  <p className="text-sm text-gray-300 mt-3">
                    Enter the name of any subreddit to analyze and add to your list
                  </p>
                </div>
              )}
              
              {/* Loading State - Centered */}
              {isLoadingSubreddits ? (
                <div className="flex flex-col items-center justify-center py-24">
                  <div className="animate-spin w-12 h-12 border-2 border-orange-500 border-t-transparent rounded-full mb-4"></div>
                  <span className="text-white text-lg">
                    {recommendedSubreddits.length > 0 
                      ? 'Finding new subreddits...'
                      : 'Finding the best subreddits for your content...'
                    }
                  </span>
                  <span className="text-gray-400 text-sm mt-2">This may take a moment</span>
                </div>
              ) : recommendedSubreddits.length === 0 ? (
                <div className="text-center py-16">
                  <div className="text-gray-400 mb-6 text-lg">
                    No subreddits found yet. Click &quot;Find New Subreddits&quot; to get AI recommendations,
                    or add custom subreddits manually.
                  </div>
                </div>
              ) : (
                <div className={`space-y-4 transition-all duration-500 ease-out ${
                  showSubreddits ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}>
                  {recommendedSubreddits.map((subreddit, index) => {
                    const totalAllowed = subreddit.allowed_post_types.length;
                    const totalUnclear = subreddit.unclear_post_types?.length || 0;
                    
                    return (
                      <div
                        key={subreddit.name}
                        className="border border-gray-700 rounded-xl p-6 cursor-pointer hover:border-orange-500 hover:bg-gray-900/50 transition-all duration-200 relative group animate-slideUp backdrop-blur-md bg-gray-900/30"
                        style={{ animationDelay: `${index * 100}ms` }}
                        onClick={() => handleSubredditSelect(subreddit.name)}
                      >
                        {/* Remove button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeSubreddit(subreddit.name);
                          }}
                          className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity text-gray-500 hover:text-red-400 text-sm"
                          title="Remove subreddit"
                        >
                          ✕
                        </button>
                        
                        <div className="flex items-start justify-between mb-3 pr-8">
                        <div className="flex items-center space-x-3">
                            <h3 className="font-semibold text-xl text-white">r/{subreddit.name}</h3>
                            <span className={`text-sm font-medium ${getSubredditSize(subreddit.subscribers || 0).color}`}>
                                {getSubredditSize(subreddit.subscribers || 0).label}
                            </span>
                            <span className="text-sm text-gray-400">
                                {formatSubscribers(subreddit.subscribers || 0)} members
                            </span>
                            </div>
                          <button
                            onClick={(e) => {
                                e.stopPropagation();
                                window.open(`https://reddit.com/r/${subreddit.name}`, '_blank');
                            }}
                            className="text-gray-500 hover:text-orange-400 transition-colors"
                            >
                            <ExternalLink className="w-5 h-5" />
                          </button>
                        </div>
                        
                        <div className="flex flex-wrap gap-2 mb-3">
                          <span className="text-sm text-gray-400">
                            {totalAllowed} allowed • {totalUnclear} to verify
                          </span>
                          {subreddit.allowed_post_types.map((type) => (
                            <span
                                key={type}
                                className="bg-green-900/30 text-green-300 text-xs px-3 py-1 rounded-full flex items-center border border-green-800"
                            >
                                <CheckCircle className="w-3 h-3 mr-1" />
                                {type.replace('_', ' ')}
                            </span>
                           ))}
                        </div>
                        
                        <p className="text-sm text-gray-300">{subreddit.description}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Step 2: Choose Post Type */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="mb-6">
                <h2 className="text-2xl font-semibold text-white">
                  Choose Post Type for r/{selectedSubreddit}
                </h2>
                <p className="text-sm text-gray-400 mt-2">
                  All post types are shown. Green = recommended, Yellow = verify rules first, Red = likely not allowed
                </p>
              </div>
              
              {isLoadingCompliance ? (
                <div className="flex flex-col items-center justify-center py-24">
                  <div className="animate-spin w-12 h-12 border-2 border-orange-500 border-t-transparent rounded-full mb-4"></div>
                  <span className="text-white text-lg">Analyzing subreddit guidelines...</span>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {Object.entries(postTypes).map(([key, postType], index) => {
                      const status = getPostTypeStatus(key);
                      const isSelected = selectedPostType === key;
                      const canSelect = status !== 'blocked';
                      
                      return (
                        <div
                          key={key}
                          className={`border-2 rounded-xl p-6 transition-all duration-200 animate-slideUp ${
                            isSelected
                              ? 'border-orange-500 bg-orange-900/20 shadow-lg shadow-orange-500/20'
                              : canSelect
                              ? `${getCardBorderColor(status, isSelected)} cursor-pointer hover:shadow-lg hover:shadow-gray-900/20`
                              : 'border-gray-700 bg-gray-900/50 opacity-60 cursor-not-allowed'
                          }`}
                          style={{ animationDelay: `${index * 100}ms` }}
                          onClick={() => canSelect && setSelectedPostType(key)}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <h3 className="font-semibold text-lg text-white">{postType.name}</h3>
                            <div className="flex items-center space-x-2">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRiskBadgeColor(postType.risk_level)}`}>
                                {postType.risk_level} risk
                              </span>
                              {getStatusBadge(status)}
                            </div>
                          </div>
                          <p className="text-sm text-gray-300 mb-3">{postType.description}</p>
                          
                          {/* Status-specific helper text */}
                          {status === 'unclear' && (
                            <div className="mt-3 text-xs text-yellow-300 flex items-start bg-yellow-900/20 p-3 rounded-lg border border-yellow-800">
                              <AlertCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                              Check subreddit rules before posting. May require active membership or mod approval.
                            </div>
                          )}
                          {status === 'blocked' && (
                            <div className="mt-3 text-xs text-red-300 flex items-start bg-red-900/20 p-3 rounded-lg border border-red-800">
                              <XCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                              This type likely violates r/{selectedSubreddit} rules. Choose a different approach.
                            </div>
                          )}
                          {status === 'allowed' && (
                            <div className="mt-3 text-xs text-green-300 flex items-start bg-green-900/20 p-3 rounded-lg border border-green-800">
                              <CheckCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                              This type aligns well with r/{selectedSubreddit} community guidelines.
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Subreddit Analysis Summary */}
                  <div className="mt-8 p-6 bg-blue-900/20 border border-blue-800 rounded-xl">
                    <div className="flex items-start">
                      <Shield className="w-6 h-6 text-blue-400 mr-3 mt-0.5" />
                      <div>
                        <h4 className="text-lg font-medium text-blue-200 mb-2">
                          Subreddit Analysis Summary
                        </h4>
                        <div className="text-sm text-blue-300 space-y-2">
                          <div>✓ Recommended: {complianceData?.allowed_post_types.join(', ') || 'None identified'}</div>
                          {complianceData?.unclear_post_types && complianceData.unclear_post_types.length > 0 && (
                            <div>⚠ Check rules first: {complianceData.unclear_post_types.join(', ')}</div>
                          )}
                          {complianceData?.blocked_post_types && complianceData.blocked_post_types.length > 0 && (
                            <div>✗ Not recommended: {complianceData.blocked_post_types.join(', ')}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Custom Instructions */}
              <div className="mt-8">
                <label className="block text-lg font-medium text-white mb-3">
                  Additional Instructions (Optional)
                </label>
                <textarea
                  value={customInstructions}
                  onChange={(e) => setCustomInstructions(e.target.value)}
                  rows={4}
                  placeholder="Add any specific requirements, tone, or focus areas for your post..."
                  className="w-full px-4 py-3 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-gray-800 text-white resize-none"
                />
                <p className="text-sm text-gray-400 mt-2">
                  Example: &quot;Focus on remote teams&quot;, &quot;Mention our free trial&quot;, &quot;Keep it under 200 words&quot;
                </p>
              </div>

              <div className="flex justify-end mt-8">
                <button
                  onClick={handleGeneratePost}
                  disabled={!selectedPostType || isGenerating}
                  className="px-8 py-4 bg-orange-500 text-white rounded-xl hover:bg-orange-600 disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center text-lg font-medium transition-all duration-200"
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin w-5 h-5 mr-3 border-2 border-white border-t-transparent rounded-full"></div>
                      Generating...
                    </>
                  ) : (
                    <>
                      Generate Post
                      <ArrowRight className="w-5 h-5 ml-3" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Generated Post */}
          {currentStep === 3 && generatedPost && (
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-semibold text-white">Generated Post</h2>
                <p className="text-sm text-gray-400 mt-2">Review and edit your post</p>
              </div>

              <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 p-6 rounded-xl border border-blue-500/30">
                <div className="flex items-center divide-x divide-gray-500">
                    <div className="flex items-center pr-6">
                    <Tag className="w-5 h-5 mr-3 text-blue-400" />
                    <span className="font-bold text-white text-lg">r/{generatedPost.subreddit}</span>
                    </div>
                    <div className="px-6">
                    <span className="font-bold text-orange-400 text-lg">{generatedPost.post_type.replace('_', ' ')}</span>
                    </div>
                    <div className="pl-6 flex-1">
                    <label className="block text-sm font-medium text-gray-300 mb-2">Target Audience</label>
                    <input
                        type="text"
                        value={generatedPost.target_audience}
                        onChange={(e) => setGeneratedPost({...generatedPost, target_audience: e.target.value})}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white font-medium"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-lg font-medium text-white mb-3">
                    Post Title
                  </label>
                  <input
                    type="text"
                    value={generatedPost.title}
                    onChange={(e) => setGeneratedPost({...generatedPost, title: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-gray-800 text-white text-lg"
                  />
                </div>

                <div>
                  <label className="block text-lg font-medium text-white mb-3">
                    Post Content
                  </label>
                  <textarea
                    value={generatedPost.body}
                    onChange={(e) => setGeneratedPost({...generatedPost, body: e.target.value})}
                    rows={15}
                    className="w-full px-4 py-3 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-gray-800 text-white resize-none"
                  />
                </div>
              </div>

              <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
                <h3 className="font-semibold mb-4 text-white text-lg">Preview</h3>
                <div className="bg-gray-900 p-6 rounded-xl">
                  <div className="font-semibold text-white mb-3 text-xl">{generatedPost.title}</div>
                  <div className="text-gray-300 whitespace-pre-wrap">{generatedPost.body}</div>
                </div>
              </div>

              <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowRegenerateModal(true)}
                className="px-6 py-3 border border-gray-600 rounded-xl hover:bg-gray-800 transition-all duration-200 text-gray-300 font-medium"
              >
                Regenerate
              </button>
                <button
                    onClick={handlePostToReddit}
                    className="px-8 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all duration-200 font-medium"
                  >
                    Post
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Regenerate Modal */}
        {showRegenerateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4 border border-gray-700">
            <h3 className="text-xl font-semibold text-white mb-4">Regenerate Post</h3>
            <p className="text-gray-300 text-sm mb-4">
                What would you like to change or improve in the regenerated post?
            </p>
            
            <textarea
                value={regenerateInstructions}
                onChange={(e) => setRegenerateInstructions(e.target.value)}
                rows={4}
                placeholder="e.g., Make it shorter, more casual tone, add more technical details, focus on benefits..."
                className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-gray-700 text-white resize-none mb-4"
            />
            
            <div className="flex justify-end space-x-3">
                <button
                onClick={() => {
                    setShowRegenerateModal(false);
                    setRegenerateInstructions('');
                }}
                className="px-4 py-2 border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors text-gray-300"
                >
                Cancel
                </button>
                <button
                onClick={handleRegeneratePost}
                disabled={isRegenerating}
                className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors flex items-center"
                >
                {isRegenerating ? (
                    <>
                    <div className="animate-spin w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                    Regenerating...
                    </>
                ) : (
                    'Regenerate Post'
                )}
                </button>
            </div>
            </div>
        </div>
        )}

        {/* Post Success Modal */}
        {showPostSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4 border border-gray-700">
            <h3 className="text-xl font-semibold text-white mb-4">Did you make that post?</h3>
            <p className="text-gray-300 text-sm mb-6">
                We opened Reddit for you. If you posted your content, click &quot;Yes&quot; to track it in your analytics. 
                This helps us measure your Reddit marketing performance.
            </p>
            
            <div className="space-y-3">
                <button
                onClick={handlePostConfirmed}
                className="w-full px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
                >
                Yes, I posted it
                </button>
                <button
                onClick={handlePostNotMade}
                className="w-full px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
                >
                No, I didn&apos;t post
                </button>
            </div>
            </div>
        </div>
        )}

        {/* Next Steps Modal */}
        {showNextStepsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4 border border-gray-700">
            <h3 className="text-xl font-semibold text-white mb-4">What would you like to do next?</h3>
            <p className="text-gray-300 text-sm mb-6">
                Great! Your post has been tracked. Choose your next action:
            </p>
            
            <div className="space-y-3">
                <button
                onClick={handleCreateAnotherPost}
                className="w-full px-4 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
                >
                Create Another Post
                </button>
                <button
                onClick={handleReturnToDashboard}
                className="w-full px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
                >
                Return to Dashboard
                </button>
            </div>
            </div>
        </div>
        )}



      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.4s ease-out both;
        }
      `}</style>
    </div>
  );
};

export default CreateRedditPostPage;