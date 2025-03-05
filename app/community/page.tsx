"use client"
import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Plus, PlusCircle } from 'lucide-react';
import PostCard from '@/components/PostCard';
import Sidebar from '@/components/Sidebar';
import { useRouter } from 'next/navigation';
import { db, auth } from '@/lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { 
    doc, 
    setDoc, 
    updateDoc, 
    getDoc, 
    arrayUnion, 
    arrayRemove 
  } from 'firebase/firestore';



// Define types
interface Post {
  id: string;
  subreddit: string;
  title: string;
  content: string; // This will map to 'body' from the API
  url: string;
  date_created: string;
  suggestedReply: string;
}

interface SubredditSection {
  name: string;
  isOpen: boolean;
  posts: Post[];
  isLoading: boolean;
}

const CommunityPage: React.FC = () => {
  const router = useRouter();
  const [user, loading] = useAuthState(auth);

  const [subredditInput, setSubredditInput] = useState<string>('');
  const [subredditSections, setSubredditSections] = useState<SubredditSection[]>([]);
  const [isGenerating, setIsGenerating] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [isApproving, setIsApproving] = useState<string | null>(null);
  const [suggestedSubreddits, setSuggestedSubreddits] = useState<string[]>([]);

  const [alertt, setAlertt] = useState<{ visible: boolean; message: string }>({
    visible: false,
    message: '',
  });
  const [greenalertt, setGreenalertt] = useState<{ visible: boolean; message: string }>({
    visible: false,
    message: '',
  });

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const fetchSuggestedSubreddits = async () => {
    if (!user) return;

    try {
      const response = await fetch(`${apiUrl}/get_subreddits?userid=${user.uid}`);
      if (!response.ok) {
        throw new Error('Failed to fetch suggested subreddits');
      }
      const contentType = response.headers.get("content-type");
    let suggestedSubs;
    if (contentType && contentType.includes("application/json")) {
      suggestedSubs = await response.json();
    } else {
      suggestedSubs = await response.text();
    }
    
    console.log("Raw suggestedSubs:", suggestedSubs);

    let subredditsArray = [];

    // If the returned value is a string formatted like a set,
    // remove the curly braces and split by comma.
    if (typeof suggestedSubs === "string") {
      let trimmed = suggestedSubs.trim();
      if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
        trimmed = trimmed.substring(1, trimmed.length - 1);
      }
      // Split the string on commas, trim whitespace,
      // and remove any leading/trailing quotes.
      subredditsArray = trimmed.split(",").map(s => s.trim().replace(/^['"]+|['"]+$/g, ""));
    } else if (Array.isArray(suggestedSubs)) {
      subredditsArray = suggestedSubs;
    } else if (suggestedSubs instanceof Set) {
      subredditsArray = [...suggestedSubs];
    } else if (typeof suggestedSubs === "object" && suggestedSubs !== null) {
      subredditsArray = Object.values(suggestedSubs).map(String);
    }

    setSuggestedSubreddits(subredditsArray);

    setSuggestedSubreddits(subredditsArray);
    } catch (error) {
      console.error('Error fetching suggested subreddits:', error);
      setSuggestedSubreddits([]);
    }
  };
  const addSuggestedSubreddit = async (subredditName: string) => {
    // Reuse the existing addSubreddit logic
    const originalEvent = { key: 'Enter' } as React.KeyboardEvent<HTMLInputElement>;
    setSubredditInput(subredditName);
    await addSubreddit(originalEvent);
  };
  const addSubreddit = async (e: React.KeyboardEvent<HTMLInputElement> | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter') return;
    
    // Ensure user is logged in
    if (!user) {
      setAlertt({
        visible: true,
        message: 'Please log in to add subreddits'
      });
      
      setTimeout(() => {
        setAlertt({ visible: false, message: '' });
      }, 3000);
      
      return;
    }
    
    const subredditName = subredditInput.trim();
    if (!subredditName) return;
    
    try {
      // Reference to the user's document
      const userDocRef = doc(db, 'subreddits', user.uid);
      
      // Get the current user document
      const userDoc = await getDoc(userDocRef);
      
      // Check if subreddit already exists
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const existingSubreddits = userData.subreddits || [];
        
        if (existingSubreddits.some((sr: string) => 
          sr.toLowerCase() === subredditName.toLowerCase())) {
          setAlertt({
            visible: true,
            message: `You've already added r/${subredditName}`
          });
          
          setTimeout(() => {
            setAlertt({ visible: false, message: '' });
          }, 3000);
          
          return;
        }
      }
      
      // Add subreddit to user's document
      await setDoc(userDocRef, {
        subreddits: arrayUnion(subredditName.toLowerCase())
      }, { merge: true });
      
      // Add new subreddit to local state
      const newSection: SubredditSection = {
        name: subredditName,
        isOpen: false,
        posts: [],
        isLoading: true
      };
      
      setSubredditSections(prev => [...prev, newSection]);
      setSubredditInput('');
      
      // Fetch posts for the new subreddit
      fetchPostsForSubreddit(subredditName);
      
      // Remove from suggested subreddits if present
      setSuggestedSubreddits(prev => 
        prev.filter(sub => sub.toLowerCase() !== subredditName.toLowerCase())
      );
      
    } catch (error) {
      console.error('Error adding subreddit:', error);
      setAlertt({
        visible: true,
        message: 'Failed to add subreddit'
      });
      
      setTimeout(() => {
        setAlertt({ visible: false, message: '' });
      }, 3000);
    }
  };
  
  const fetchPostsForSubreddit = async (subredditName: string) => {
    try {
      const response = await fetch(`${apiUrl}/subreddit_posts?subreddit=${subredditName}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch posts for r/${subredditName}`);
      }
      
      const data = await response.json();
      
      // Transform data to match our Post interface
      const posts: Post[] = data.map((post: any) => ({
        id: post[0],
        subreddit: post[1],
        title: post[2],
        content: post[3], // 'body' from API
        suggestedReply: post[4],
        url: post[5],
        date_created: post[6],
      }));
      
      // Update the subreddit section with posts
      setSubredditSections(prevSections => 
        prevSections.map(section => 
          section.name === subredditName 
            ? { ...section, posts: posts.slice(0, 5), isLoading: false } 
            : section
        )
      );
      
    } catch (error) {
      console.error(`Error fetching posts for r/${subredditName}:`, error);
      
      // Update section to show error state
      setSubredditSections(prevSections => 
        prevSections.map(section => 
          section.name === subredditName 
            ? { ...section, isLoading: false } 
            : section
        )
      );
      
      setAlertt({
        visible: true,
        message: `Failed to load posts for r/${subredditName}`
      });
      
      setTimeout(() => {
        setAlertt({ visible: false, message: '' });
      }, 3000);
    }
  };

  const toggleSectionOpen = (sectionName: string) => {
    setSubredditSections(prevSections => 
      prevSections.map(section => 
        section.name === sectionName 
          ? { ...section, isOpen: !section.isOpen } 
          : section
      )
    );
  };

  const removeSubreddit = async (sectionName: string) => {
    if (!user) return;

    try {
      // Reference to the user's document
      const userDocRef = doc(db, 'subreddits', user.uid);
      
      // Remove the subreddit from the user's document
      await updateDoc(userDocRef, {
        subreddits: arrayRemove(sectionName.toLowerCase())
      });
      
      // Remove from local state
      setSubredditSections(prevSections => 
        prevSections.filter(section => section.name !== sectionName)
      );
    } catch (error) {
      console.error('Error removing subreddit:', error);
      setAlertt({
        visible: true,
        message: 'Failed to remove subreddit'
      });
      
      setTimeout(() => {
        setAlertt({ visible: false, message: '' });
      }, 3000);
    }
  };
  useEffect(() => {
    if (user) {
      fetchSuggestedSubreddits();
    }
  }, [user]);
  useEffect(() => {
    const loadUserSubreddits = async () => {
      if (!user) return;

      try {
        // Reference to the user's document
        const userDocRef = doc(db, 'subreddits', user.uid);
        
        // Get the user document
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const userSubreddits: string[] = userData.subreddits || [];
          
          // Convert subreddits to SubredditSection
          const subredditSections: SubredditSection[] = userSubreddits.map(name => ({
            name,
            isOpen: false,
            posts: [],
            isLoading: true
          }));
          
          setSubredditSections(subredditSections);
          
          // Fetch posts for each subreddit
          subredditSections.forEach(subreddit => {
            fetchPostsForSubreddit(subreddit.name);
          });
        }
      } catch (error) {
        console.error('Error loading user subreddits:', error);
      }
    };

    loadUserSubreddits();
  }, [user]);

  // These are placeholder handlers - you would implement the real functionality
  const handleGenerate = (id: string) => {
    setIsGenerating(id);
    // Implement your generation logic here
    setTimeout(() => {
      setIsGenerating(null);
      // Update the post with the generated reply
      setSubredditSections(prevSections => {
        return prevSections.map(section => {
          const updatedPosts = section.posts.map(post => 
            post.id === id ? { ...post, suggestedReply: `Generated reply for post ${id}` } : post
          );
          return { ...section, posts: updatedPosts };
        });
      });
    }, 1500);
  };

  const handleEdit = (id: string) => {
    setIsEditing(id);
  };

  const handleSave = (id: string, reply: string) => {
    setIsEditing(null);
    // Save the edited reply
    setSubredditSections(prevSections => {
      return prevSections.map(section => {
        const updatedPosts = section.posts.map(post => 
          post.id === id ? { ...post, suggestedReply: reply } : post
        );
        return { ...section, posts: updatedPosts };
      });
    });
  };

  const handleReject = (id: string) => {
    // Clear the suggested reply
    setSubredditSections(prevSections => {
      return prevSections.map(section => {
        const updatedPosts = section.posts.map(post => 
          post.id === id ? { ...post, suggestedReply: '' } : post
        );
        return { ...section, posts: updatedPosts };
      });
    });
  };

  const handleApprove = (id: string, reply: string) => {
    setIsApproving(id);
    // Simulate API call to approve and post the reply
    setTimeout(() => {
      setIsApproving(null);
      setGreenalertt({
        visible: true,
        message: 'Comment posted successfully!'
      });
      
      setTimeout(() => {
        setGreenalertt({ visible: false, message: '' });
      }, 3000);
    }, 1500);
  };

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-6 space-y-6">
    <div className="container mx-auto p-4 max-w-4xl"> 
      <h1 className="text-2xl font-bold mb-6 dark:text-white">Community Explorer</h1>
      
      {/* Subreddit Input */}
      <div className="flex gap-2 mb-8">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Enter subreddit name..."
            className="w-full p-3 pr-10 rounded-lg border border-gray-300 dark:border-gray-700 
                      bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            value={subredditInput}
            onChange={(e) => setSubredditInput(e.target.value)}
            onKeyDown={addSubreddit}
          />
          <button 
            className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 
                      text-gray-500 dark:text-gray-400 hover:text-gray-700 
                      dark:hover:text-gray-200"
            onClick={addSubreddit}
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>


      {/* suggested subreddits */}
      {suggestedSubreddits.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-4 dark:text-white">Suggested Subreddits</h2>
              <div className="flex flex-wrap gap-2">
                {suggestedSubreddits.map((subreddit) => (
                  <button
                    key={subreddit}
                    onClick={() => addSuggestedSubreddit(subreddit)}
                    className="flex items-center gap-2 px-3 py-1 bg-gray-100 dark:bg-gray-700 
                               rounded-full text-sm hover:bg-gray-200 dark:hover:bg-gray-600 
                               transition-colors"
                  >
                    <PlusCircle className="w-4 h-4" />
                    r/{subreddit}
                  </button>
                ))}
              </div>
            </div>
          )}
      
      {/* Subreddit Sections */}
      <div className="space-y-4">
        {subredditSections.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            Add subreddits to explore posts
          </div>
        ) : (
          subredditSections.map((section) => (
            <div key={section.name} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              {/* Section Header */}
              <div 
                className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-800 cursor-pointer"
                onClick={() => toggleSectionOpen(section.name)}
              >
                <h2 className="font-medium text-lg dark:text-white">r/{section.name}</h2>
                <div className="flex items-center gap-2">
                  <button 
                    className="text-red-500 hover:text-red-700 p-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeSubreddit(section.name);
                    }}
                  >
                    Remove
                  </button>
                  {section.isOpen ? (
                    <ChevronUp className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  )}
                </div>
              </div>
              
              {/* Section Content */}
              {section.isOpen && (
                <div className="p-4 space-y-4">
                  {section.isLoading ? (
                    <div className="text-center py-8">
                      <div className="w-8 h-8 border-4 border-gray-300 dark:border-gray-700 border-t-blue-500 rounded-full animate-spin mx-auto"></div>
                      <p className="mt-2 text-gray-500 dark:text-gray-400">Loading posts...</p>
                    </div>
                  ) : section.posts.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      No posts found for r/{section.name}
                    </div>
                  ) : (
                    section.posts.map((post) => (
                      <PostCard
                        key={post.id}
                        post={post}
                        isGenerating={isGenerating}
                        isEditing={isEditing}
                        isApproving={isApproving}
                        alertt={alertt}
                        greenalertt={greenalertt}
                        handleGenerate={handleGenerate}
                        handleEdit={handleEdit}
                        handleSave={handleSave}
                        handleReject={handleReject}
                        handleApprove={handleApprove}
                        setDisplayedPosts={(updateFn) => {
                          const updater = (prevSections: SubredditSection[]) => {
                            return prevSections.map(section => {
                              // Apply the update function to the posts of this section
                              const updatedPosts = typeof updateFn === "function" ? updateFn(section.posts) : section.posts;
                              return { ...section, posts: updatedPosts };
                            });
                          };
                          setSubredditSections(updater);
                        }}

                      />
                    ))
                  )}
                </div>
              )}
            </div>
          ))
        )}
        </div>
    </div>
      </div>
      
      {/* Alerts */}
      {alertt.visible && (
        <div className="toast toast-end">
          <div className="alert alert-error">
            <span>{alertt.message.replace(/'/g, '&#39;')}</span>
          </div>
        </div>
      )}
      
      {greenalertt.visible && (
        <div className="toast toast-end">
          <div className="alert alert-success">
            <span>{greenalertt.message.replace(/'/g, '&#39;')}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunityPage;