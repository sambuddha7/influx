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
import { ArrowUpRight , Pencil, Save, Check, Sparkles} from "lucide-react"; // Import the icon
import { formatDistanceToNow } from 'date-fns';
import PostCard from '@/components/PostCard';



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
  
  const POSTS_PER_PAGE = 6;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;


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
      const postWithTimestamp = {
        ...post,
        createdAt: new Date().toISOString(), // ISO 8601 string for consistent formatting
      };
      await addDoc(postsCollectionRef, postWithTimestamp);
      console.log("Post saved successfully!");
    } catch (error) {
      console.error("Error saving post to Firestore:", error);
    }
  };

  useEffect(() => {
    if (!user) return;
    
    const fetchPosts = async () => {
      try {

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
          }));
          setAllPosts(firestorePosts);
          setDisplayedPosts(firestorePosts.slice(0, POSTS_PER_PAGE));
          setIsLoading2(false);
          setHasMorePosts(firestorePosts.length > POSTS_PER_PAGE);
        } else {
          const response = await fetch(`${apiUrl}/relevant_posts?userid=${user.uid}`);
          const data = await response.json();

          const formattedPosts = data.map((post: string[]) => ({
            id: post[0],
            subreddit: post[1],
            title: post[2],
            content: post[3],
            suggestedReply: post[4],
            url: post[5],
            date_created: post[6],
          }));
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
      const response = await fetch(`${apiUrl}/reply_to_post?userid=${user.uid}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          post_id: postId,
          reply_text: suggestedReply,
        }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error approving reply:', errorData);
        alert(`Failed to approve reply: ${errorData.detail}`);
      } else {
        // Find the post to be archived
        const postToArchive = allPosts.find(post => post.id === postId);
        

        if (postToArchive && user) {
          // Save to archived-posts collection
          const postDocRef1 = collection(db, "archived-posts", user.uid, "posts");        

          const postWithcomment = {
            ...postToArchive,
            suggestedReply: suggestedReply,
            archivedAt: new Date().toISOString()
          };
          await addDoc(postDocRef1, postWithcomment);
       
          // Remove the post from the current collection
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
      
            setgreenAlert({ message: "Reply approved successfully", visible: true });
            setTimeout(() => {
              setgreenAlert({ message: "", visible: false });
            }, 3000);
          }
        }
      }
    } catch (error) {
      console.error('Error submitting reply:', error);
      setAlert({ message: "Error occured while approving the post", visible: true });
      setTimeout(() => {
        setAlert({ message: "", visible: false });
      }, 3000);
    } finally {
      setIsApproving(null); // Reset loading state
    }
  };

  //change

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
        {displayedPosts.map((post) => (
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
    </div>
  );
}