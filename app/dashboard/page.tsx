'use client'

import { useState, useEffect } from 'react';
import Loading from '@/components/Loading';
import Sidebar from '@/components/Sidebar';
import { useAuthState } from 'react-firebase-hooks/auth';
import { db, auth } from '@/lib/firebase';
import { doc, setDoc, getDoc , getDocs} from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import { where,collection, addDoc, deleteDoc,updateDoc } from "firebase/firestore";
import { query, orderBy } from "firebase/firestore";
import { ArrowUpRight , Pencil, Save, Check, Sparkles, Filter, Lightbulb} from "lucide-react";
import { formatDistanceToNow } from 'date-fns';
import PostCard from '@/components/PostCard';
import PostSorter from '@/components/PostSorter';





const CrossIcon = () => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="14" 
    height="14" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);


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

}


export default function Dashboard() {
  const router = useRouter();
  const [allPosts, setAllPosts] = useState<RedditPost[]>([]);
  const [displayedPosts, setDisplayedPosts] = useState<RedditPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoading2, setIsLoading2] = useState(true);
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



  // Subreddit filter states
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [subredditInput, setSubredditInput] = useState('');
  const [excludedSubreddits, setExcludedSubreddits] = useState<string[]>([]);
  const [tempExcludedSubreddits, setTempExcludedSubreddits] = useState<string[]>([]);
  // Add this function after the RedditPost interface definition
const checkAndUpdatePostMetrics = async (userId: string) => {
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
        lastUpdated: now.toISOString()
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
              await updateDoc(docToUpdate.ref, {
                score: (metrics as any).score,
                comments: (metrics as any).num_comments
              });
            }
          }
          
          console.log('Post metrics updated successfully');
          return true;
        }
      }
    }
    
    return false;
  } catch (error) {
    console.error('Error updating post metrics:', error);
    return false;
  }
};
  

  const POSTS_PER_PAGE = 6;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const [sortConfig, setSortConfig] = useState<{
    by: 'comments' | 'score' | 'date';
    order: 'asc' | 'desc';
  }>({
    by: 'date',
    order: 'desc'
  });


//change
  useEffect(() => {
    if (user) {
      const savedPreference = localStorage.getItem(`hideInstructionPopup_${user.uid}`);
      if (savedPreference === 'true') {
        setHideInstructionPopup(true);
      }
    }
  }, [user]);

  
  useEffect(() => {
    const checkUser = async () => {
      if (!user) return;

      try {
        const docRef = doc(db, 'onboarding', user.uid);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
          router.push('/onboarding');
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
      };
      await addDoc(postsCollectionRef, postWithTimestamp);
      console.log("Post saved successfully!");
    } catch (error) {
      console.error("Error saving post to Firestore:", error);
    }
  };

  // Fetch excluded subreddits from Firebase
  useEffect(() => {
    const fetchExcludedSubreddits = async () => {
      if (!user) return;
      
      try {
        const excludedRef = doc(db, "excluded-subreddits", user.uid);
        const excludedSnap = await getDoc(excludedRef);
        
        if (excludedSnap.exists() && excludedSnap.data().subreddits) {
          const subreddits = excludedSnap.data().subreddits;
          setExcludedSubreddits(subreddits);
          setTempExcludedSubreddits(subreddits);
        }
      } catch (error) {
        console.error("Error fetching excluded subreddits:", error);
      }
    };
    
    if (user) {
      fetchExcludedSubreddits();
    }
  }, [user]);


  useEffect(() => {
    if (!user) return;
    
    const fetchPosts = async () => {
      try {
        await checkAndUpdatePostMetrics(user.uid);

        // Check if the document exists in Firestore
        const postsCollectionRef = collection(db, "reddit-posts", user.uid, "posts");

      // Check if there are any documents in the "posts" subcollection
        const postsQuery = query(postsCollectionRef, orderBy("createdAt", "asc"));

        const postsSnapshot = await getDocs(postsQuery);

        if (!postsSnapshot.empty) {
          console.log('Posts found in Firestore');
          // await fetch(`${apiUrl}/relevant_posts_weekly?userid=${user.uid}`);
          const firestorePosts = postsSnapshot.docs.map((doc) => ({
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
          }));
          setAllPosts(firestorePosts);
          setDisplayedPosts(firestorePosts.slice(0, POSTS_PER_PAGE));
          setIsLoading2(false);
          setHasMorePosts(firestorePosts.length > POSTS_PER_PAGE);
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
              promotional: promoScore > 0.70,
              promo_score: promoScore,
            };
          });
          
          setAllPosts(formattedPosts);
          setDisplayedPosts(formattedPosts.slice(0, POSTS_PER_PAGE));
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

    if (user) {
      fetchPosts();
    }
  }, [user]);

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

  // Subreddit filter functions
  const toggleFilterModal = () => {
    setIsFilterOpen(!isFilterOpen);
    setTempExcludedSubreddits([...excludedSubreddits]);
  };

  const handleAddSubreddit = () => {
    if (subredditInput.trim() !== '' && !tempExcludedSubreddits.includes(subredditInput.trim())) {
      setTempExcludedSubreddits([...tempExcludedSubreddits, subredditInput.trim()]);
      setSubredditInput('');
    }
  };

  const handleRemoveSubreddit = (subreddit: string) => {
    setTempExcludedSubreddits(tempExcludedSubreddits.filter(s => s !== subreddit));
  };


  const handleSaveSubreddits = async () => {
    if (!user) return;
    
    try {
      // Save to Firebase
      await setDoc(doc(db, "excluded-subreddits", user.uid), {
        subreddits: tempExcludedSubreddits,
        updatedAt: new Date().toISOString()
      });
      
      // Update local state
      setExcludedSubreddits(tempExcludedSubreddits);
      
      // Show initial message
      setgreenAlert({ 
        message: "Subreddit filters saved, refreshing posts...", 
        visible: true 
      });
      
      // Close modal
      setIsFilterOpen(false);
      
      // Delete all posts from reddit-posts collection
      try {
        const postsCollectionRef = collection(db, "reddit-posts", user.uid, "posts");
        const postsSnapshot = await getDocs(postsCollectionRef);
        
        // Delete all documents in batch
        const deletePromises = postsSnapshot.docs.map(doc => deleteDoc(doc.ref));
        await Promise.all(deletePromises);

        const userDocRef = doc(db, "reddit-posts", user.uid);
        await deleteDoc(userDocRef);

        console.log("All posts deleted successfully");
      

        window.location.href = '/dashboard';
        
      } catch (deleteError) {
        console.error("Error deleting posts:", deleteError);
        setAlert({ 
          message: "Error refreshing posts", 
          visible: true 
        });
        setTimeout(() => {
          setAlert({ message: "", visible: false });
        }, 3000);
      }
    } catch (error) {
      console.error("Error saving subreddit filters:", error);
      setAlert({ 
        message: "Error saving subreddit filters", 
        visible: true 
      });
      setTimeout(() => {
        setAlert({ message: "", visible: false });
      }, 3000);
    }
  };
  const handleSort = (sortBy: 'comments' | 'score' | 'date', order: 'asc' | 'desc') => {
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

  if (isLoading || isLoading2) {
    return (
      <div className='flex'>
        <Sidebar />
        <div className="flex-1 p-6 space-y-6">
          <Loading />
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
        <button 
          onClick={handleTipsClick}
          className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-yellow-100 rounded-lg border border-orange-400 hover:border-orange-500 transition-all duration-200 shadow-md hover:shadow-orange-900/20 group"
        >
          <Lightbulb size={16} className="text-yellow-300" />
          <span>Tips</span>
        </button>
        <button 
          onClick={toggleFilterModal}
          className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-750 text-gray-200 rounded-lg border border-gray-700 hover:border-orange-600 transition-all duration-200 shadow-md hover:shadow-orange-900/20 group"
        >
          <Filter size={16} className="text-orange-500" />
          <span>Filter Subreddits</span>
          {excludedSubreddits.length > 0 && (
            <span className="flex items-center justify-center h-5 min-w-5 px-1 text-xs font-medium bg-orange-600 text-white rounded-full">
              {excludedSubreddits.length}
            </span>
          )}
        </button>
      </div>
    </div>
        {/* Subreddit Filter Modal */}
        {isFilterOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="bg-gray-900 rounded-xl p-6 w-full max-w-md shadow-2xl border border-gray-800">
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-lg font-medium text-white">Filter Subreddits</h3>
                <button 
                  onClick={toggleFilterModal}
                  className="text-gray-400 hover:text-orange-500 transition-colors"
                >
                  <span className="w-5 h-5">
                    <CrossIcon />
                  </span>
                </button>
              </div>
              
              <p className="text-sm mb-5 text-gray-400">
                Add subreddits you want to exclude from your feed.
              </p>
              
              <div className="flex gap-2 mb-6">
                <input
                  type="text"
                  placeholder="Enter subreddit name"
                  className="w-full px-3 py-2 rounded-md bg-gray-800 border-0 text-gray-200 placeholder-gray-500 ring-1 ring-gray-700 focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                  value={subredditInput}
                  onChange={(e) => setSubredditInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddSubreddit()}
                />
                <button 
                  onClick={handleAddSubreddit}
                  className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-500 transition-colors"
                >
                  Add
                </button>
              </div>
              
              <div className="mb-6">
                {tempExcludedSubreddits.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {tempExcludedSubreddits.map((subreddit) => (
                      <div key={subreddit} className="px-3 py-1 rounded-full bg-gray-800 text-gray-200 text-sm flex items-center gap-1 border border-gray-700 group">
                        r/{subreddit}
                        <button 
                          onClick={() => handleRemoveSubreddit(subreddit)} 
                          className="ml-1 text-gray-400 group-hover:text-orange-500 transition-colors"
                        >
                          <span className="w-4 h-4">
                            <CrossIcon />
                          </span>
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No subreddits excluded yet.</p>
                )}
              </div>
              
              <div className="flex justify-end gap-3 pt-3 border-t border-gray-800">
                <button 
                  onClick={toggleFilterModal}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSaveSubreddits}
                  className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-500 shadow-lg shadow-orange-900/20 transition-all"
                >
                  Save Filters
                </button>
              </div>
            </div>
          </div>
        )}


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
                <span className="w-5 h-5">
                  <CrossIcon />
                </span>
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