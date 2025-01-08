'use client'

import { useState, useEffect } from 'react';
import Loading from '@/components/Loading';
import Sidebar from '@/components/Sidebar';
import { useAuthState } from 'react-firebase-hooks/auth';
import { db, auth } from '@/lib/firebase';
import { doc, setDoc, getDoc} from 'firebase/firestore';
import { useRouter } from 'next/navigation';

interface RedditPost {
  id: string;
  subreddit: string;
  title: string;
  content: string;
  suggestedReply: string;
}

export default function Dashboard() {
  const router = useRouter();

  const [posts, setPosts] = useState<RedditPost[]>([]);
  const [isLoading, setIsLoading] = useState(true); // Track loading state
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [user, loading] = useAuthState(auth);

  useEffect(() => {
    const checkUser = async () => {
      if (!user) return;

      try {
        const docRef = doc(db, 'onboarding', user.uid);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
          // User already exists, redirect to the dashboard
          router.push('/onboarding');
        } else {
          setIsLoading(false); // Allow onboarding to render
        }
      } catch (error) {
        console.error('Error checking user in Firestore:', error);
        setIsLoading(false);
      }
    };

    if (user) {
      checkUser();
    } else if (!loading) {
      // If user is not logged in, redirect to login or show appropriate message
      router.push('/login'); 
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    const fetchPosts = async () => {
      try {
        const response = await fetch(`http://localhost:8000/relevant_posts?userid=${user.uid}`);
        const data = await response.json();

        // Transform the 2D array into the RedditPost format
        const formattedPosts = data.map((post: string[]) => ({
          id: post[0],
          subreddit: post[1],
          title: post[2],
          content: post[3],
          suggestedReply: post[4]
        }));

        setPosts(formattedPosts);
        setIsLoading(false); // Set loading to false after data is fetched
      } catch (error) {
        console.error('Error fetching posts:', error);
        setIsLoading(false); // Set loading to false in case of error as well
      }
    };

    if (user) {
      fetchPosts();
    }
  }, [user]);

  const handleEdit = (id: string) => {
    setIsEditing(id);
  };

  const handleSave = (id: string, newReply: string) => {
    setPosts(posts.map(post => 
      post.id === id ? { ...post, suggestedReply: newReply } : post
    ));
    setIsEditing(null);
  };

  // Loading screen
  if (isLoading || !posts) {
    return <div>
      <Loading />
    </div>
  }

  return (
    <div className="flex ">
      {/* Sidebar */}

      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 p-6 space-y-6">
        {posts.map((post) => (
          <div key={post.id} className="card bg-base-100 dark:bg-black bg-white shadow-xl border border-gray-200 dark:border-gray-700">
            <div className="card-body">
              {/* Reddit Post Section */}
              <div className="mb-4">
                <div className="text-sm text-blue-500 dark:text-blue-400">{post.subreddit}</div>
                <h2 className="card-title dark:text-white">{post.title}</h2>
                <p className="mt-2 dark:text-gray-300">{post.content}</p>
              </div>
              
              {/* Suggested Reply Section */}
              <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                <h3 className="font-semibold mb-2 dark:text-white">Suggested Reply</h3>
                <textarea 
                  className="w-full p-2 rounded-md bg-white dark:bg-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700"
                  value={post.suggestedReply}
                  onChange={(e) => {
                    if (isEditing === post.id) {
                      setPosts(posts.map(p => 
                        p.id === post.id ? { ...p, suggestedReply: e.target.value } : p
                      ));
                    }
                  }}
                  rows={3}
                  readOnly={isEditing !== post.id}
                />
                
                {/* Action Buttons */}
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
      </div>
    </div>
  );
}
