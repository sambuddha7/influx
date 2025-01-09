'use client'

import { useState, useEffect } from 'react';
import Loading from '@/components/Loading';
import Sidebar from '@/components/Sidebar';
import { useAuthState } from 'react-firebase-hooks/auth';
import { db, auth } from '@/lib/firebase';
import { doc, setDoc, getDoc , getDocs} from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import { collection, addDoc } from "firebase/firestore";
import { query, orderBy } from "firebase/firestore";


interface RedditPost {
  id: string;
  subreddit: string;
  title: string;
  content: string;
  suggestedReply: string;
}

export default function Dashboard() {
  const router = useRouter();
  const [allPosts, setAllPosts] = useState<RedditPost[]>([]);
  const [displayedPosts, setDisplayedPosts] = useState<RedditPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoading2, setIsLoading2] = useState(true);

  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [user, loading] = useAuthState(auth);
  const [hasMorePosts, setHasMorePosts] = useState(true);
  const POSTS_PER_PAGE = 6;

  useEffect(() => {
    const checkUser = async () => {
      if (!user) return;

      try {
        const docRef = doc(db, 'onboarding', user.uid);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
          router.push('/onboarding');
        } else {
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error checking user in Firestore:', error);
        setIsLoading(false);
      }
    };

    if (user) {
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
          // await fetch(`http://localhost:8000/relevant_posts_weekly?userid=${user.uid}`);
          const firestorePosts = postsSnapshot.docs.map((doc) => ({
            id: doc.id,
            subreddit: doc.data().subreddit,
            title: doc.data().title,
            content: doc.data().content,
            suggestedReply: doc.data().suggestedReply,
          }));
  
          setAllPosts(firestorePosts);
          setDisplayedPosts(firestorePosts.slice(0, POSTS_PER_PAGE));
          setIsLoading2(false);
          setHasMorePosts(firestorePosts.length > POSTS_PER_PAGE);
        } else {
          const response = await fetch(`http://localhost:8000/relevant_posts?userid=${user.uid}`);
          const data = await response.json();

          const formattedPosts = data.map((post: string[]) => ({
            id: post[0],
            subreddit: post[1],
            title: post[2],
            content: post[3],
            suggestedReply: post[4]
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

  const handleSave = (id: string, newReply: string) => {
    setDisplayedPosts(posts => 
      posts.map(post => post.id === id ? { ...post, suggestedReply: newReply } : post)
    );
    setAllPosts(posts =>
      posts.map(post => post.id === id ? { ...post, suggestedReply: newReply } : post)
    );
    setIsEditing(null);
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
                <ReactMarkdown className="mt-2 dark:text-gray-300">
                  {post.content}
                </ReactMarkdown>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                <h3 className="font-semibold mb-2 dark:text-white">Suggested Reply</h3>
                <textarea 
                  className="w-full p-2 rounded-md bg-white dark:bg-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700"
                  value={post.suggestedReply}
                  onChange={(e) => {
                    if (isEditing === post.id) {
                      const newValue = e.target.value;
                      setDisplayedPosts(posts =>
                        posts.map(p => p.id === post.id ? { ...p, suggestedReply: newValue } : p)
                      );
                    }
                  }}
                  rows={3}
                  readOnly={isEditing !== post.id}
                />
                
                <div className="flex gap-2 mt-4">
                  {isEditing === post.id ? (
                    <button 
                      className="btn btn-outline btn-info"
                      onClick={() => handleSave(post.id, post.suggestedReply)}
                    >
                      Save
                    </button>
                  ) : (
                    <button 
                      className="btn btn-outline btn-info"
                      onClick={() => handleEdit(post.id)}
                    >
                      Edit
                    </button>
                  )}
                  <button className="btn btn-outline btn-error">
                    Reject
                  </button>
                  <button className="btn btn-outline btn-success">
                    Approve
                  </button>
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
              <p className="text-sm mt-1">We'll notify you when we find new discussions for you.</p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}