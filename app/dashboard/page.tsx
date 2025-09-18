'use client'

import { useState, useEffect } from 'react';
import Loading from '@/components/Loading';
import AIWorkflowLoading from '@/components/AIWorkflowLoading';
import Sidebar from '@/components/Sidebar';
import { useAuthState } from 'react-firebase-hooks/auth';
import { db, auth } from '@/lib/firebase';
import { doc, setDoc, getDoc , getDocs} from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import { where,collection, addDoc, deleteDoc,updateDoc } from "firebase/firestore";
import { query, orderBy } from "firebase/firestore";
import { ArrowUpRight , Pencil, Save, Check, Sparkles, Lightbulb, X, Clock, Search, Tag, Plus} from "lucide-react";
import { formatDistanceToNow } from 'date-fns';
import PostCard from '@/components/PostCard';
import PostSorter from '@/components/PostSorter';
import { motion } from 'framer-motion';







interface RedditPost {
  id: string;
  subreddit: string;
  title: string;
  content: string;
  suggestedReply: string;
  url: string;
  date_created: string;
  promotional?: boolean; 
  score?: number;        
  comments?: number;
  relevanceScore?: number;
}


export default function Dashboard() {
  const router = useRouter();
  const [allPosts, setAllPosts] = useState<RedditPost[]>([]);
  const [displayedPosts, setDisplayedPosts] = useState<RedditPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoading2, setIsLoading2] = useState(true);
  const [isUpdatingMetrics, setIsUpdatingMetrics] = useState(false);
  const [isApproving, setIsApproving] = useState<string | null>(null);

  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [user, loading] = useAuthState(auth);
  const [hasMorePosts, setHasMorePosts] = useState(true);
  //change
  const [isGenerating, setIsGenerating] = useState<string | null>(null);
  const [alertt, setAlert] = useState<{ message: string; visible: boolean }>({
    message: "",
    visible: false,
  });
  const [greenalertt, setgreenAlert] = useState<{ message: string; visible: boolean }>({
    message: "",
    visible: false,
  });

  const [hideConfirmationPopup, setHideConfirmationPopup] = useState(false);

  

  //change
  const [showInstructionPopup, setShowInstructionPopup] = useState(false);
  const [currentApprovedPost, setCurrentApprovedPost] = useState<RedditPost | null>(null);
  const [hideInstructionPopup, setHideInstructionPopup] = useState(false);
  const [pendingApprovals, setPendingApprovals] = useState<{[key: string]: RedditPost}>({});
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [currentPendingPost, setCurrentPendingPost] = useState<string | null>(null);
  const [isArchiving, setIsArchiving] = useState<string | null>(null);
  const [lastFetchTime, setLastFetchTime] = useState<number>(Date.now());
  const [isCheckingClassifications, setIsCheckingClassifications] = useState(false);
  const [nextAutoSearchTime, setNextAutoSearchTime] = useState<Date | null>(null);
  const [timeUntilNextSearch, setTimeUntilNextSearch] = useState<string>('');
  
  // Search modal state
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchKeywords, setSearchKeywords] = useState<string[]>([]);
  const [searchPhrases, setSearchPhrases] = useState<string[]>([]);
  const [searchSubreddits, setSearchSubreddits] = useState<string[]>([]);
  const [keywordInput, setKeywordInput] = useState('');
  const [phraseInput, setPhraseInput] = useState('');
  const [subredditInput, setSubredditInput] = useState('');
  const [subredditError, setSubredditError] = useState('');

  // Function to calculate next auto-search time
  const calculateNextAutoSearchTime = async (userId: string) => {
    try {
      const metricsRef = doc(db, 'post-metrics', userId);
      const metricsSnap = await getDoc(metricsRef);
      
      if (metricsSnap.exists()) {
        const data = metricsSnap.data();
        if (data.lastPostSearched) {
          const lastSearchTime = new Date(data.lastPostSearched);
          const nextSearchTime = new Date(lastSearchTime.getTime() + 24 * 60 * 60 * 1000); // Add 24 hours
          setNextAutoSearchTime(nextSearchTime);
        }
      }
    } catch (error) {
      console.error('Error calculating next auto-search time:', error);
    }
  };

  // Function to format time remaining
  const formatTimeRemaining = (nextTime: Date): string => {
    const now = new Date();
    const diff = nextTime.getTime() - now.getTime();
    
    if (diff <= 0) {
      return 'Search in progress...';
    }
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    return `${hours}h ${minutes}m ${seconds}s`;
  };

  // Search modal functions
  const addSearchKeyword = () => {
    if (!keywordInput.trim() || searchKeywords.length >= 8) return;
    const newKeywords = [...searchKeywords, keywordInput.trim()];
    setSearchKeywords(newKeywords);
    setKeywordInput('');
  };

  const removeSearchKeyword = (keyword: string) => {
    const newKeywords = searchKeywords.filter(k => k !== keyword);
    setSearchKeywords(newKeywords);
  };

  const addSearchPhrase = () => {
    if (!phraseInput.trim()) return;
    const newPhrases = [...searchPhrases, phraseInput.trim()];
    setSearchPhrases(newPhrases);
    setPhraseInput('');
  };

  const removeSearchPhrase = (phrase: string) => {
    const newPhrases = searchPhrases.filter(p => p !== phrase);
    setSearchPhrases(newPhrases);
  };

  const validateSubreddit = async (subreddit: string): Promise<boolean> => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(`${apiUrl}/validate_subreddit?subreddit=${encodeURIComponent(subreddit)}`);
      const data = await response.json();
      return data.valid;
    } catch {
      return false;
    }
  };

  const addSearchSubreddit = async () => {
    setSubredditError('');
    if (!subredditInput.trim() || searchSubreddits.length >= 20) return;
    
    const isValid = await validateSubreddit(subredditInput.trim());
    if (!isValid) {
      setSubredditError('Invalid subreddit. Please enter a valid subreddit name.');
      return;
    }
    
    const newSubreddits = [...searchSubreddits, subredditInput.trim()];
    setSearchSubreddits(newSubreddits);
    setSubredditInput('');
  };

  const removeSearchSubreddit = (subreddit: string) => {
    const newSubreddits = searchSubreddits.filter(s => s !== subreddit);
    setSearchSubreddits(newSubreddits);
  };

  const triggerSearch = async () => {
    if (!user) return;
    
    // Show the loading page and hide current content
    setIsLoading2(true);
    setShowSearchModal(false);
    
    try {
      // Clear existing posts
      const postsCollectionRef = collection(db, "reddit-posts", user.uid, "posts");
      const postsSnapshot = await getDocs(postsCollectionRef);
      const deletePromises = postsSnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);

      // Update user's search parameters in Firestore
      const userRef = doc(db, 'onboarding', user.uid);
      await updateDoc(userRef, {
        keywords: searchKeywords.join(','),
        phrases: searchPhrases.join(','),
        subreddits: searchSubreddits.join(',')
      });

      // Update subreddit classifications
      if (searchSubreddits.length > 0) {
        const response = await fetch(`${apiUrl}/update_subreddit_classifications`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user_id: user.uid,
            subreddits: searchSubreddits
          })
        });
        
        if (response.ok) {
          console.log('Subreddit classification update started successfully');
        }
      }

      // Trigger new search
      const searchResponse = await fetch(`${apiUrl}/relevant_posts?userid=${user.uid}`);
      if (searchResponse.ok) {
        const data = await searchResponse.json();
        const formattedPosts = data.map((post: string[]) => {
          const promoScore = 0;
          return {
            id: post[0],
            subreddit: post[1],
            title: post[2],
            content: post[3],
            suggestedReply: post[4],
            url: post[5],
            date_created: post[6],
            score: post[7],
            comments: post[8],
            relevanceScore: post[9] ? parseFloat(post[9]) : undefined,
            promotional: promoScore > 0.70,
            promo_score: promoScore,
          };
        });
        
        // Save new posts to Firestore
        for (const post of formattedPosts) {
          const postWithTimestamp = {
            ...post,
            createdAt: new Date().toISOString(),
            promotional: post.promotional ?? false,
            score: post.score ?? 0,
            comments: post.comments ?? 0,
            relevanceScore: post.relevanceScore,
          };
          await addDoc(postsCollectionRef, postWithTimestamp);
        }
        
        // Update state
        const sortedPosts = formattedPosts.sort((a: RedditPost, b: RedditPost) => (b.relevanceScore || 0) - (a.relevanceScore || 0));
        setAllPosts(sortedPosts);
        setDisplayedPosts(sortedPosts.slice(0, POSTS_PER_PAGE));
        setHasMorePosts(formattedPosts.length > POSTS_PER_PAGE);
        
        setgreenAlert({ message: "Search completed successfully!", visible: true });
        setTimeout(() => {
          setgreenAlert({ message: "", visible: false });
        }, 3000);
      }
    } catch (error) {
      console.error('Error during search:', error);
      setAlert({ message: "Error occurred during search", visible: true });
      setTimeout(() => {
        setAlert({ message: "", visible: false });
      }, 3000);
    } finally {
      setIsLoading2(false);
    }
  };

  // Function to check and ensure user has subreddit classifications
  const checkAndEnsureSubredditClassifications = async (userId: string) => {
    try {
      setIsCheckingClassifications(true);
      
      // Check if user has subreddit classifications in onboarding collection
      const onboardingRef = doc(db, 'onboarding', userId);
      const onboardingSnap = await getDoc(onboardingRef);
      
      if (onboardingSnap.exists()) {
        const onboardingData = onboardingSnap.data();
        
        // Check if subreddit_classifications field exists and has data
        if (!onboardingData.subreddit_classifications || 
            Object.keys(onboardingData.subreddit_classifications).length === 0) {
          
          console.log('No subreddit classifications found, triggering creation...');
          
          // Trigger classification creation
          const apiUrl = process.env.NEXT_PUBLIC_API_URL;
          const response = await fetch(`${apiUrl}/ensure_user_classifications`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              user_id: userId
            })
          });
          
          if (response.ok) {
            console.log('Subreddit classification creation triggered successfully');
          } else {
            console.warn('Failed to trigger subreddit classification creation');
          }
        } else {
          console.log('User already has subreddit classifications');
        }
      }
    } catch (error) {
      console.error('Error checking subreddit classifications:', error);
    } finally {
      setIsCheckingClassifications(false);
    }
  };

  // Add this function after the RedditPost interface definition
const checkAndUpdatePostMetrics = async (userId: string, setUpdatingMetrics?: (loading: boolean) => void) => {
  try {
    // Get the last update timestamp
    const metricsRef = doc(db, 'post-metrics', userId);
    const metricsSnap = await getDoc(metricsRef);
    console.log(metricsRef)
    
    const now = new Date();
    let shouldUpdate = false;
    
    if (!metricsSnap.exists()) {
      // First time - set the timestamp and update
      await setDoc(metricsRef, {
        lastUpdated: now.toISOString(),
        lastPostSearched: now.toISOString()
      });
      shouldUpdate = true;
    } else {
      // Check if it's been more than 1 hour since last update
      const lastUpdated = new Date(metricsSnap.data().lastUpdated);
      const hoursSinceUpdate = (now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60); 
      
      if (hoursSinceUpdate >= 1) {
        shouldUpdate = true;
        // Update the timestamp
        await updateDoc(metricsRef, {
          lastUpdated: now.toISOString()
        });
      }
    }
    
    if (shouldUpdate) {
      console.log('Updating post metrics...');
      setUpdatingMetrics?.(true);
      
      // Get all posts from Firestore
      const postsCollectionRef = collection(db, "reddit-posts", userId, "posts");
      const postsSnapshot = await getDocs(postsCollectionRef);
      
      if (!postsSnapshot.empty) {
        const postIds = postsSnapshot.docs.map(doc => doc.data().id);
        
        // Call the API to update metrics
        const response = await fetch(`${apiUrl}/update_post_metrics`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            post_ids: postIds,
            user_id: userId
          }),
        });
        
        if (response.ok) {
          const updatedMetrics = await response.json();
          
          // Update each post in Firestore with new metrics
          for (const [postId, metrics] of Object.entries(updatedMetrics)) {
            const q = query(postsCollectionRef, where("id", "==", postId));
            const querySnapshot = await getDocs(q);
            
            if (!querySnapshot.empty) {
              const docToUpdate = querySnapshot.docs[0];
              const typedMetrics = metrics as { score: number; num_comments: number };
              await updateDoc(docToUpdate.ref, {
                score: typedMetrics.score,
                comments: typedMetrics.num_comments
              });
            }
          }
          
          console.log('Post metrics updated successfully');
          setUpdatingMetrics?.(false);
          return true;
        }
      }
      setUpdatingMetrics?.(false);
    }
    
    return false;
  } catch (error) {
    console.error('Error updating post metrics:', error);
    setUpdatingMetrics?.(false);
    return false;
  }
};

// Function to check if posts need to be refreshed (daily)
const checkAndRefreshPosts = async (userId: string) => {
  try {
    // Get the last post search timestamp
    const metricsRef = doc(db, 'post-metrics', userId);
    const metricsSnap = await getDoc(metricsRef);
    
    const now = new Date();
    let shouldRefresh = false;
    
    if (!metricsSnap.exists()) {
      // First time - set the timestamp and refresh
      await setDoc(metricsRef, {
        lastUpdated: now.toISOString(),
        lastPostSearched: now.toISOString()
      });
      shouldRefresh = true;
    } else {
      const data = metricsSnap.data();
      
      // Check if lastPostSearched exists, if not initialize it
      if (!data.lastPostSearched) {
        await updateDoc(metricsRef, {
          lastPostSearched: now.toISOString()
        });
        shouldRefresh = true;
      } else {
        // Check if it's been more than 24 hours since last post search
        const lastPostSearched = new Date(data.lastPostSearched);
        const hoursSinceSearch = (now.getTime() - lastPostSearched.getTime()) / (1000 * 60 * 60); //  (1000 * 60 * 60);
        
        if (hoursSinceSearch >= 24) {
          shouldRefresh = true;
          // Update the timestamp
          await updateDoc(metricsRef, {
            lastPostSearched: now.toISOString()
          });
        }
      }
    }
    
    if (shouldRefresh) {
      console.log('Refreshing posts - deleting old posts and running AI search...');
      
      // Delete all existing posts
      const postsCollectionRef = collection(db, "reddit-posts", userId, "posts");
      const postsSnapshot = await getDocs(postsCollectionRef);
      
      // Delete posts in batches
      const batch = [];
      for (const doc of postsSnapshot.docs) {
        batch.push(deleteDoc(doc.ref));
      }
      
      if (batch.length > 0) {
        await Promise.all(batch);
        console.log(`Deleted ${batch.length} old posts`);
      }
      
      // Trigger the AI search pipeline
      const response = await fetch(`${apiUrl}/relevant_posts?userid=${userId}`);
      
      if (response.ok) {
        const data = await response.json();
        
        const formattedPosts = data.map((post: string[]) => {
          const promoScore = 0; // temp
          return {
            id: post[0],
            subreddit: post[1],
            title: post[2],
            content: post[3],
            suggestedReply: post[4],
            url: post[5],
            date_created: post[6],
            score: post[7],
            comments: post[8],
            relevanceScore: post[9] ? parseFloat(post[9]) : undefined,
            promotional: promoScore > 0.70,
            promo_score: promoScore,
          };
        });
        
        // Save new posts to Firestore
        for (const post of formattedPosts) {
          const postWithTimestamp = {
            ...post,
            createdAt: new Date().toISOString(),
            promotional: post.promotional ?? false,
            score: post.score ?? 0,
            comments: post.comments ?? 0,
            relevanceScore: post.relevanceScore,
          };
          await addDoc(postsCollectionRef, postWithTimestamp);
        }
        
        console.log(`Posts refreshed successfully - added ${formattedPosts.length} new posts`);
        return true;
      } else {
        console.error('Failed to fetch new posts from API');
        return false;
      }
    }
    
    return false;
  } catch (error) {
    console.error('Error refreshing posts:', error);
    return false;
  }
};
  

  const POSTS_PER_PAGE = 6;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const [sortConfig, setSortConfig] = useState<{
    by: 'comments' | 'score' | 'date' | 'relevance';
    order: 'asc' | 'desc';
  }>({
    by: 'relevance',
    order: 'desc'
  });


//change
  useEffect(() => {
    if (user) {
      const savedPreference = localStorage.getItem(`hideInstructionPopup_${user.uid}`);
      if (savedPreference === 'true') {
        setHideInstructionPopup(true);
      }
      // Calculate next auto-search time when user loads
      calculateNextAutoSearchTime(user.uid);
    }
  }, [user]);

  // Update countdown every second
  useEffect(() => {
    if (!nextAutoSearchTime) return;

    const interval = setInterval(() => {
      setTimeUntilNextSearch(formatTimeRemaining(nextAutoSearchTime));
    }, 1000);

    // Set initial value
    setTimeUntilNextSearch(formatTimeRemaining(nextAutoSearchTime));

    return () => clearInterval(interval);
  }, [nextAutoSearchTime]);

  // Load current search parameters when modal opens
  useEffect(() => {
    const loadSearchParameters = async () => {
      if (!user || !showSearchModal) return;
      
      try {
        const userRef = doc(db, 'onboarding', user.uid);
        const docSnap = await getDoc(userRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          setSearchKeywords(data.keywords ? data.keywords.split(',').map((k: string) => k.trim()).filter((k: string) => k) : []);
          setSearchPhrases(data.phrases ? data.phrases.split(',').map((p: string) => p.trim()).filter((p: string) => p) : []);
          setSearchSubreddits(data.subreddits ? data.subreddits.split(',').map((s: string) => s.trim()).filter((s: string) => s) : []);
        }
      } catch (error) {
        console.error('Error loading search parameters:', error);
      }
    };
    
    loadSearchParameters();
  }, [user, showSearchModal]);

  
  useEffect(() => {
    const checkUser = async () => {
      if (!user) return;

      try {
        const docRef = doc(db, 'onboarding', user.uid);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
          router.push('/onboarding');
        } else {
          // User exists, check and ensure they have subreddit classifications
          checkAndEnsureSubredditClassifications(user.uid);
        } 
        const accountRef = doc(db, 'account-details', user.uid);
        const accountSnap = await getDoc(accountRef);

        if (!accountSnap.exists()) {
          console.error('Account details not found');
          setIsLoading(false);
          return;
        }

        const accountStatus = accountSnap.data()?.accountStatus;
        console.log(accountStatus)
        if (accountStatus === 'inactive') {
          router.push('/no-access');
          return;
        }
        setIsLoading(false);

      } catch (error) {
        console.error('Error checking user in Firestore:', error);
        setIsLoading(false);
      }
    };

    if (user) {
      console.log("user exists")
      checkUser();
    } else if (!loading) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const savePostToFirestore = async (userId: string, post: RedditPost) => {
    try {
      const postsCollectionRef = collection(db, "reddit-posts", userId, "posts");
      
      // Check if post already exists
      const q = query(postsCollectionRef, where("id", "==", post.id));
      const existingPost = await getDocs(q);
      
      if (!existingPost.empty) {
        console.log(`Post ${post.id} already exists, not saving duplicate`);
        return;
      }
      
      const postWithTimestamp = {
        ...post,
        createdAt: new Date().toISOString(),
        promotional: post.promotional ?? false,
        score: post.score ?? 0,
        comments: post.comments ?? 0,
        relevanceScore: post.relevanceScore,
      };
      await addDoc(postsCollectionRef, postWithTimestamp);
      console.log("Post saved successfully!");
    } catch (error) {
      console.error("Error saving post to Firestore:", error);
    }
  };



  const fetchPosts = async () => {
    if (!user) return;
    
    try {
      // Check and update metrics independently
      checkAndUpdatePostMetrics(user.uid, setIsUpdatingMetrics);
      const postsRefreshed = await checkAndRefreshPosts(user.uid);

      // Check if the document exists in Firestore
      const postsCollectionRef = collection(db, "reddit-posts", user.uid, "posts");

    // Check if there are any documents in the "posts" subcollection
      const postsQuery = query(postsCollectionRef, orderBy("date_created", "desc"));

      const postsSnapshot = await getDocs(postsQuery);

      if (!postsSnapshot.empty || postsRefreshed) {
        console.log(postsRefreshed ? 'Posts refreshed - loading from Firestore' : 'Posts found in Firestore');
        
        // Re-fetch posts after refresh or load existing posts
        const currentPostsSnapshot = await getDocs(postsQuery);
        const firestorePosts = currentPostsSnapshot.docs.map((doc) => ({
          id: doc.data().id,
          subreddit: doc.data().subreddit,
          title: doc.data().title,
          content: doc.data().content,
          suggestedReply: doc.data().suggestedReply,
          url: doc.data().url,
          date_created: doc.data().date_created,
          promotional: doc.data().promotional ?? false,
          score: doc.data().score ?? 0,           
          comments: doc.data().comments ?? 0,
          relevanceScore: doc.data().relevanceScore,
        }));
        // Sort by relevance (highest first) by default
        const sortedPosts = firestorePosts.sort((a: RedditPost, b: RedditPost) => (b.relevanceScore || 0) - (a.relevanceScore || 0));
        setAllPosts(sortedPosts);
        setDisplayedPosts(sortedPosts.slice(0, POSTS_PER_PAGE));
        setIsLoading2(false);
        setHasMorePosts(firestorePosts.length > POSTS_PER_PAGE);
        
        // Update next auto-search time if posts were refreshed
        if (postsRefreshed) {
          calculateNextAutoSearchTime(user.uid);
        }
      } else {
        const response = await fetch(`${apiUrl}/relevant_posts?userid=${user.uid}`);
        const data = await response.json();

        const formattedPosts = data.map((post: string[]) => {
          // const promoScore = parseFloat(post[7]); // assume promo_score is 8th item
          const promoScore =  0; // temp
          return {
            id: post[0],
            subreddit: post[1],
            title: post[2],
            content: post[3],
            suggestedReply: post[4],
            url: post[5],
            date_created: post[6],
            score: post[7],
            comments: post[8],
            relevanceScore: post[9] ? parseFloat(post[9]) : undefined,
            promotional: promoScore > 0.70,
            promo_score: promoScore,
          };
        });
        
        // Sort by relevance (highest first) by default
        const sortedPosts = formattedPosts.sort((a: RedditPost, b: RedditPost) => (b.relevanceScore || 0) - (a.relevanceScore || 0));
        setAllPosts(sortedPosts);
        setDisplayedPosts(sortedPosts.slice(0, POSTS_PER_PAGE));
        setIsLoading2(false);
        setHasMorePosts(formattedPosts.length > POSTS_PER_PAGE);

        for (const post of formattedPosts) {
          console.log(post);
          savePostToFirestore(user.uid, post);
        } 

      }
      
    } catch (error) {
      console.error('Error fetching posts:', error);
      setIsLoading2(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchPosts();
    }
  }, [user]);

  // Add periodic check for new posts and metrics updates
  useEffect(() => {
    if (!user) return;
    
    const interval = setInterval(async () => {
      // Only check if we're not currently loading and have been on the page for a while
      if (!isLoading2 && !isLoading && !isUpdatingMetrics) {
        // Check for metrics updates
        checkAndUpdatePostMetrics(user.uid, setIsUpdatingMetrics);
        
        const postsCollectionRef = collection(db, "reddit-posts", user.uid, "posts");
        const postsQuery = query(postsCollectionRef, orderBy("date_created", "desc"));
        const postsSnapshot = await getDocs(postsQuery);
        
        const currentPostCount = allPosts.length;
        const firestorePostCount = postsSnapshot.size;
        
        // If Firestore has more posts than our current state, refresh
        if (firestorePostCount > currentPostCount) {
          console.log('New posts detected, refreshing...');
          await fetchPosts();
        }
      }
    }, 5000); // Check every 5 seconds
    
    return () => clearInterval(interval);
  }, [user, allPosts.length, isLoading2, isLoading, isUpdatingMetrics]);

  const loadMorePosts = () => {
    setIsLoadingMore(true);
    const currentLength = displayedPosts.length;
    const nextPosts = allPosts.slice(
      currentLength,
      currentLength + POSTS_PER_PAGE
    );
    
    setDisplayedPosts(prev => [...prev, ...nextPosts]);
    setHasMorePosts(currentLength + POSTS_PER_PAGE < allPosts.length);
    setIsLoadingMore(false);
  };

  const handleEdit = (id: string) => {
    setIsEditing(id);
  };

  const handleSave = async (id: string, newReply: string) => {
    if (!user) {
      return;
    }
    const postsCollectionRef = collection(db, "reddit-posts", user.uid, "posts");
    const q = query(postsCollectionRef, where("id", "==", id));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const docToUpdate = querySnapshot.docs[0];
      await updateDoc(docToUpdate.ref, {
        suggestedReply: newReply
      });
    }
    setDisplayedPosts(posts => 
      posts.map(post => post.id === id ? { ...post, suggestedReply: newReply } : post)
    );
    setAllPosts(posts =>
      posts.map(post => post.id === id ? { ...post, suggestedReply: newReply } : post)
    );
    setIsEditing(null);
  };


  const handleReject = async (postId: string) => {
    try {
      if (!user) return;
  
      // Find the exact document to delete
      const postsCollectionRef = collection(db, "reddit-posts", user.uid, "posts");
      const q = query(postsCollectionRef, where("id", "==", postId));
      const querySnapshot = await getDocs(q);
  
      if (!querySnapshot.empty) {
        // Delete the specific document
        const docToDelete = querySnapshot.docs[0];
        await deleteDoc(docToDelete.ref);
  
        // Remove the post from state
        setDisplayedPosts((posts) => posts.filter((post) => post.id !== postId));
        setAllPosts((posts) => posts.filter((post) => post.id !== postId));
  
        console.log(`Post with ID ${postId} rejected and deleted successfully!`);
        setAlert({ message: "Post rejected successfully", visible: true });
        setTimeout(() => {
          setAlert({ message: "", visible: false });
        }, 3000);
      }
    } catch (error) {
      console.error("Error rejecting post:", error);
      setAlert({ message: "Error occurred while rejecting the post", visible: true });
      setTimeout(() => {
        setAlert({ message: "", visible: false });
      }, 3000);
    }
  };
  
  const handleApprove = async (postId: string, suggestedReply: string) => {
    if (!user) return;
    
    try {
      setIsApproving(postId);
      
      // Find the post to be approved
      const postToProcess = allPosts.find(post => post.id === postId);
      
      if (postToProcess && suggestedReply) {
        // Copy the suggested reply to clipboard
        await navigator.clipboard.writeText(suggestedReply);
        setgreenAlert({ message: "Reply copied to clipboard!", visible: true });
        
        // Check if we should show the instruction popup
        const savedPreference = localStorage.getItem(`hideInstructionPopup_${user.uid}`);
        if (savedPreference !== 'true') {
          setCurrentApprovedPost(postToProcess);
          setShowInstructionPopup(true);
        } else {
          // If popup is disabled, open the post URL immediately
          if (postToProcess.url) {
            window.open(postToProcess.url, '_blank');
          }
        }
        
        setTimeout(() => {
          setgreenAlert({ message: "", visible: false });
        }, 3000);
      }
    } catch (error) {
      console.error('Error processing post:', error);
      setAlert({ message: "Error occurred while processing the post", visible: true });
      setTimeout(() => {
        setAlert({ message: "", visible: false });
      }, 3000);
    } finally {
      setIsApproving(null);
    }
  };
  
  // Add this new handleArchive function:
  const handleArchive = async (postId: string) => {
    if (!user) return;
    
    try {
      setIsArchiving(postId);
      
      const postToArchive = displayedPosts.find(post => post.id === postId);
      if (!postToArchive) return;
      
      // Save to archived posts collection
      const archiveCollectionRef = collection(db, "archived-posts", user.uid, "posts");
      const postWithArchiveData = {
        ...postToArchive,
        archivedAt: new Date().toISOString()
      };
      await addDoc(archiveCollectionRef, postWithArchiveData);
      
      // Remove from current posts collection
      const postsCollectionRef = collection(db, "reddit-posts", user.uid, "posts");
      const q = query(postsCollectionRef, where("id", "==", postId));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const docToDelete = querySnapshot.docs[0];
        await deleteDoc(docToDelete.ref);
      }
      
      // Remove from displayed posts
      setDisplayedPosts((posts) => posts.filter((post) => post.id !== postId));
      setAllPosts((posts) => posts.filter((post) => post.id !== postId));
      
      setgreenAlert({ message: "Post archived successfully!", visible: true });
      setTimeout(() => {
        setgreenAlert({ message: "", visible: false });
      }, 3000);
      
    } catch (error) {
      console.error('Error archiving post:', error);
      setAlert({ message: "Error occurred while archiving the post", visible: true });
      setTimeout(() => {
        setAlert({ message: "", visible: false });
      }, 3000);
    } finally {
      setIsArchiving(null);
    }
  };
  
  const handleTipsClick = () => {
    router.push('/tips');
  };

  
  //change
  // const handleRegenerateWithFeedback = async (postId: string, feedback: string) => {
  //   console.log("yooo")
  // };
  const handleRegenerateWithFeedback = async (postId: string, feedback: string) => {
    if (!user) return;
    console.log(feedback)
    const userDocRef = doc(db, 'track-replies', user.uid);
    const userDocSnapshot = await getDoc(userDocRef);
  
    if (userDocSnapshot.exists()) {
      const userData = userDocSnapshot.data();
      if (userData.replies_left <= 0) {
        setAlert({
          message: "Generation limit reached for the trial period",
          visible: true
        });
        setTimeout(() => setAlert({ message: "", visible: false }), 3000);
        return;
      }
  
      const newRepliesLeft = userData.replies_left - 1;
      await updateDoc(userDocRef, {
        replies_left: newRepliesLeft
      });
    }
  
    try {
      setIsGenerating(postId);
  
      const post = displayedPosts.find(p => p.id === postId);
      if (!post) return;
  
      // Updated API call - send feedback in request body
      const response = await fetch(`${apiUrl}/regenerate-reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          post: {
            id: post.id,
            subreddit: post.subreddit,
            title: post.title,
            content: post.content,
            suggested_reply: post.suggestedReply
          },
          feedback: feedback // Send feedback in body
        }),
      });
      
  
      if (!response.ok) {
        throw new Error('Failed to regenerate reply');
      }
  
      const regeneratedReply = (await response.text()).replace(/^"|"$/g, '');
  
      const postsCollectionRef = collection(db, "reddit-posts", user.uid, "posts");
      const q = query(postsCollectionRef, where("id", "==", postId));
      const querySnapshot = await getDocs(q);
  
      if (!querySnapshot.empty) {
        const docToUpdate = querySnapshot.docs[0];
        await updateDoc(docToUpdate.ref, {
          suggestedReply: regeneratedReply
        });
      }
  
      setDisplayedPosts(posts =>
        posts.map(p => p.id === postId ? { ...p, suggestedReply: regeneratedReply } : p)
      );
  
      setgreenAlert({ message: "Reply regenerated successfully", visible: true });
      setTimeout(() => {
        setgreenAlert({ message: "", visible: false });
      }, 3000);
  
    } catch (error) {
      console.error('Error regenerating reply:', error);
      setAlert({ message: "Error occurred while regenerating reply", visible: true });
      setTimeout(() => {
        setAlert({ message: "", visible: false });
      }, 3000);
    } finally {
      setIsGenerating(null);
    }
  };

  const handleGenerate = async (postId: string) => {
    if (!user) return;
    const userDocRef = doc(db, 'track-replies', user.uid);
    const userDocSnapshot = await getDoc(userDocRef);
    if (userDocSnapshot.exists()) {
      const userData = userDocSnapshot.data();
      if (userData.replies_left <= 0) {
        setAlert({ 
          message: "Generation limit reached for the trial period", 
          visible: true 
        });
        setTimeout(() => setAlert({ message: "", visible: false }), 3000);
        return;
      }
      const newRepliesLeft = userData.replies_left - 1;
      await updateDoc(userDocRef, {
        replies_left: newRepliesLeft
      });
    }
    try {
      setIsGenerating(postId);

      const post = displayedPosts.find(p => p.id === postId);
      
      if (!post) return;

      const response = await fetch(`${apiUrl}/reply?userid=${user.uid}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: post.id,
          subreddit: post.subreddit,
          title: post.title,
          content: post.content,
          suggested_reply: post.suggestedReply
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate reply');
      }

      const generatedReply = (await response.text()).replace(/^"|"$/g, '');

      //update post
      const postsCollectionRef = collection(db, "reddit-posts", user.uid, "posts");
      const q = query(postsCollectionRef, where("id", "==", postId));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const docToUpdate = querySnapshot.docs[0];
        await updateDoc(docToUpdate.ref, {
          suggestedReply: generatedReply
        });
      }

      // Update displayedPosts 
      setDisplayedPosts(posts =>
        posts.map(p => p.id === postId ? { ...p, suggestedReply: generatedReply } : p)
      );
      
      setgreenAlert({ message: "New reply generated successfully", visible: true });
      setTimeout(() => {
        setgreenAlert({ message: "", visible: false });
      }, 3000);

    } catch (error) {
      console.error('Error generating reply:', error);
      setAlert({ message: "Error occurred while generating new reply", visible: true });
      setTimeout(() => {
        setAlert({ message: "", visible: false });
      }, 3000);
    } finally {
      setIsGenerating(null);
    }
  };

  const handleSort = (sortBy: 'comments' | 'score' | 'date' | 'relevance', order: 'asc' | 'desc') => {
    setSortConfig({ by: sortBy, order });
    
    // Sort all posts
    const sortedPosts = [...allPosts].sort((a, b) => {
      let compareValue = 0;
      
      switch (sortBy) {
        case 'comments':
          compareValue = (a.comments || 0) - (b.comments || 0);
          break;
        case 'score':
          compareValue = (a.score || 0) - (b.score || 0);
          break;
        case 'relevance':
          compareValue = (a.relevanceScore || 0) - (b.relevanceScore || 0);
          break;
        case 'date':
          // Parse dates for comparison
          const dateA = new Date(a.date_created).getTime();
          const dateB = new Date(b.date_created).getTime();
          compareValue = dateA - dateB;
          break;
      }
      
      // Apply sort order
      return order === 'asc' ? compareValue : -compareValue;
    });
    
    // Update both allPosts and displayedPosts
    setAllPosts(sortedPosts);
    setDisplayedPosts(sortedPosts.slice(0, displayedPosts.length));
  };

  if (isLoading || isCheckingClassifications) {
    return (
      <div className='flex'>
        <Sidebar />
        <div className="flex-1 p-6 space-y-6">
          <Loading />
          {isCheckingClassifications && (
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Setting up promotional guidelines...
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (isUpdatingMetrics) {
    return (
      <div className='flex'>
        <Sidebar />
        <div className="flex-1">
          <AIWorkflowLoading type="metrics" />
        </div>
      </div>
    );
  }

  if (isLoading2) {
    return (
      <div className='flex'>
        <Sidebar />
        <div className="flex-1">
          <AIWorkflowLoading type="search" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-6 space-y-6">
      <div className="flex justify-between mb-4">
        <PostSorter 
          onSort={handleSort}
          currentSort={sortConfig}
        />
      <div className="flex gap-3">
        {/* Auto-search countdown */}
        {nextAutoSearchTime && timeUntilNextSearch && (
          <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 text-sm">
            <Clock size={16} className="text-gray-500" />
            <span className="text-gray-700 dark:text-gray-300">
              Next auto search runs: <span className="font-mono text-orange-600 dark:text-orange-400">{timeUntilNextSearch}</span>
            </span>
          </div>
        )}
        <button 
          onClick={() => setShowSearchModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg border border-orange-400 hover:border-orange-500 transition-all duration-200 shadow-md hover:shadow-orange-900/20"
        >
          <Search size={16} />
          <span>Search</span>
        </button>
        <button 
          onClick={handleTipsClick}
          className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-yellow-100 rounded-lg border border-orange-400 hover:border-orange-500 transition-all duration-200 shadow-md hover:shadow-orange-900/20 group"
        >
          <Lightbulb size={16} className="text-yellow-300" />
          <span>Tips</span>
        </button>
      </div>
    </div>

        {displayedPosts.map((post) => (
          <PostCard
          key={post.id}
          post={post}
          isGenerating={isGenerating}
          isEditing={isEditing}
          isApproving={isApproving}
          isArchiving={isArchiving}
          alertt={alertt}
          greenalertt={greenalertt}
          handleGenerate={handleGenerate}
          handleEdit={handleEdit}
          handleSave={handleSave}
          handleRegenerateWithFeedback={handleRegenerateWithFeedback}
          handleReject={handleReject}
          handleApprove={handleApprove}
          handleArchive={handleArchive} 
          setDisplayedPosts={setDisplayedPosts}
          userId={user?.uid}
        />
        ))}
        
        <div className="flex justify-center py-4">
          {hasMorePosts ? (
            <button 
              className="btn btn-neutral"
              onClick={loadMorePosts}
              disabled={isLoadingMore}
            >
              {isLoadingMore ? <Loading /> : 'Load More Posts'}
            </button>
          ) : displayedPosts.length > 0 ? (
            <div className="text-center text-gray-600 dark:text-gray-400">
              <p>End of posts!</p>
              <p className="text-sm mt-1">We&apos;ll notify you when we find new discussions for you.</p>
            </div>
          ) : null}
        </div>
      </div>
      
      {/* Search Modal */}
      {showSearchModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200 dark:border-gray-800">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Search Parameters</h3>
              <button 
                onClick={() => setShowSearchModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Keywords Section */}
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
                    <Tag className="w-4 h-4 mr-2 text-gray-500" />
                    Keywords
                  </label>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {searchKeywords.length}/8
                  </span>
                </div>
                <div className="flex space-x-2 mb-3">
                  <input
                    type="text"
                    value={keywordInput}
                    onChange={(e) => setKeywordInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && searchKeywords.length < 8 && addSearchKeyword()}
                    placeholder={searchKeywords.length >= 8 ? "Maximum keywords reached" : "Enter a keyword"}
                    disabled={searchKeywords.length >= 8}
                    className="flex-grow p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 disabled:bg-gray-100 disabled:text-gray-500 dark:disabled:bg-zinc-800 dark:disabled:text-zinc-500"
                  />
                  <button
                    onClick={addSearchKeyword}
                    disabled={searchKeywords.length >= 8 || !keywordInput.trim()}
                    className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                      searchKeywords.length >= 8 || !keywordInput.trim()
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-orange-500 hover:bg-orange-600 text-white'
                    }`}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                {searchKeywords.length >= 8 && (
                  <p className="text-sm text-orange-600 dark:text-orange-400 mb-3">
                    Maximum of 8 keywords reached. Remove some to add new ones.
                  </p>
                )}
                {searchKeywords.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {searchKeywords.map(keyword => (
                      <motion.div
                        key={keyword}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center bg-orange-100 dark:bg-orange-800 px-3 py-1 rounded-full text-sm"
                      >
                        {keyword}
                        <button
                          onClick={() => removeSearchKeyword(keyword)}
                          className="ml-2 text-orange-500 hover:text-orange-700"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Phrases Section */}
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                  <Tag className="w-4 h-4 mr-2 text-gray-500" />
                  Phrases
                </label>
                <div className="flex space-x-2 mb-3">
                  <input
                    type="text"
                    value={phraseInput}
                    onChange={(e) => setPhraseInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addSearchPhrase()}
                    placeholder="Enter a phrase"
                    className="flex-grow p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                  />
                  <button
                    onClick={addSearchPhrase}
                    disabled={!phraseInput.trim()}
                    className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                      !phraseInput.trim()
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-orange-500 hover:bg-orange-600 text-white'
                    }`}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                {searchPhrases.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {searchPhrases.map(phrase => (
                      <motion.div
                        key={phrase}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center bg-orange-100 dark:bg-orange-800 px-3 py-1 rounded-full text-sm"
                      >
                        {phrase}
                        <button
                          onClick={() => removeSearchPhrase(phrase)}
                          className="ml-2 text-orange-500 hover:text-orange-700"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Subreddits Section */}
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
                    <Tag className="w-4 h-4 mr-2 text-gray-500" />
                    Subreddits
                  </label>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {searchSubreddits.length}/20
                  </span>
                </div>
                <div className="flex space-x-2 mb-3">
                  <div className="relative flex-grow">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 dark:text-gray-400 text-sm">r/</span>
                    </div>
                    <input
                      type="text"
                      value={subredditInput}
                      onChange={(e) => setSubredditInput(e.target.value)}
                      onKeyDown={async (e) => {
                        if (e.key === 'Enter' && searchSubreddits.length < 20) {
                          await addSearchSubreddit();
                        }
                      }}
                      placeholder={searchSubreddits.length >= 20 ? "Maximum subreddits reached" : "Enter subreddit name"}
                      disabled={searchSubreddits.length >= 20}
                      className="w-full pl-8 pr-4 p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 disabled:bg-gray-100 disabled:text-gray-500 dark:disabled:bg-zinc-800 dark:disabled:text-zinc-500"
                    />
                  </div>
                  <button
                    onClick={addSearchSubreddit}
                    disabled={searchSubreddits.length >= 20 || !subredditInput.trim()}
                    className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                      searchSubreddits.length >= 20 || !subredditInput.trim()
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-orange-500 hover:bg-orange-600 text-white'
                    }`}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                {searchSubreddits.length >= 20 && (
                  <p className="text-sm text-orange-600 dark:text-orange-400 mb-3">
                    Maximum of 20 subreddits reached. Remove some to add new ones.
                  </p>
                )}
                {subredditError && (
                  <p className="text-red-500 text-sm mb-3">{subredditError}</p>
                )}
                {searchSubreddits.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {searchSubreddits.map(subreddit => (
                      <motion.div
                        key={subreddit}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center bg-orange-100 dark:bg-orange-800 px-3 py-1 rounded-full text-sm"
                      >
                        r/{subreddit}
                        <button
                          onClick={() => removeSearchSubreddit(subreddit)}
                          className="ml-2 text-orange-500 hover:text-orange-700"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setShowSearchModal(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={triggerSearch}
                className="flex items-center px-6 py-2 rounded-lg font-medium transition-all duration-200 bg-orange-500 hover:bg-orange-600 hover:shadow-lg text-white"
              >
                <Search className="w-4 h-4 mr-2" />
                Search Now
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Instruction Popup after Approve */}
      {showInstructionPopup && currentApprovedPost && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-gray-900 rounded-xl p-6 w-full max-w-md shadow-2xl border border-gray-800">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-medium text-white">What&apos;s Next?</h3>
              <button 
                onClick={() => setShowInstructionPopup(false)}
                className="text-gray-400 hover:text-orange-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="mb-6 space-y-4">
              <p className="text-gray-200">
                <span className="text-orange-500 font-medium">✓</span> Your reply has been copied to your clipboard
              </p>
              
              <div className="p-3 bg-gray-800 rounded-lg text-sm text-gray-300">
                <ol className="list-decimal list-inside space-y-2">
                  <li>You&apos;ll be directed to the Reddit post</li>
                  <li>Click on the comment field</li>
                  <li>Paste your reply (Ctrl+V or Cmd+V)</li>
                  <li>Click &apos;Post&apos; to submit your comment</li>
                </ol>
              </div>
            </div>
            
            <div className="flex justify-between items-center pt-3 border-t border-gray-800">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  className="rounded bg-gray-800 border-gray-700 text-orange-600 focus:ring-orange-500"
                  onChange={(e) => {
                    if (e.target.checked && user) {
                      localStorage.setItem(`hideInstructionPopup_${user.uid}`, 'true');
                      setHideInstructionPopup(true);
                    }
                  }}
                />
                <span className="text-sm text-gray-400">Don&apos;t show again</span>
              </label>
              
              <button 
                onClick={() => {
                  setShowInstructionPopup(false);
                  if (currentApprovedPost.url) {
                    window.open(currentApprovedPost.url, '_blank');
                  }
                }}
                className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-500 shadow-lg shadow-orange-900/20 transition-all"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}