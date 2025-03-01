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
          <div key={post.id} className="card bg-base-100 dark:bg-black bg-white shadow-xl border border-gray-200 dark:border-gray-700">
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
                  {alertt.visible && (
                    <div className="toast toast-end">
                      <div className="alert alert-error">
                        <span>{alertt.message.replace(/'/g, '&#39;')}</span>
                      </div>
                    </div>
                  )}

                  <button className={`btn btn-success relative ${isApproving === post.id ? 'opacity-80' : ''}`}
                    onClick={() => handleApprove(post.id, post.suggestedReply)}
                    disabled={isApproving === post.id}>
                      <div className="flex items-center gap-2">
                        {isApproving === post.id ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Approving...</span>
                          </>
                        ) : (
                          <>
                            Approve comment to post
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