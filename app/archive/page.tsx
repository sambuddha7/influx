'use client'

import { useState, useEffect } from 'react';
import Loading from '@/components/Loading';
import Sidebar from '@/components/Sidebar';
import { useAuthState } from 'react-firebase-hooks/auth';
import { db, auth } from '@/lib/firebase';
import { doc, setDoc, getDoc, getDocs } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import { collection, addDoc, deleteDoc } from "firebase/firestore";
import { query, orderBy } from "firebase/firestore";
import { ArrowUpRight } from "lucide-react";
import { formatDistanceToNow } from 'date-fns';
import { QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';


interface ArchivedPost {
  id: string;
  subreddit: string;
  title: string;
  content: string;
  suggestedReply: string;
  url: string;
  date_created: string;
  date_archived: string;
}

export default function ArchivePage() {
  const router = useRouter();
  const [archivedPosts, setArchivedPosts] = useState<ArchivedPost[]>([]);
  const [displayedPosts, setDisplayedPosts] = useState<ArchivedPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMorePosts, setHasMorePosts] = useState(true);
  const [user, loading] = useAuthState(auth);
  const [isLoading2, setIsLoading2] = useState(true);
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



  useEffect(() => {
    if (!user) return;
    
    const fetchPosts = async () => {
      try {

        // Check if the document exists in Firestore
        const postsCollectionRef = collection(db, "archived-posts", user.uid, "posts");

      // Check if there are any documents in the "posts" subcollection
        const postsQuery = query(postsCollectionRef, orderBy("archivedAt", "asc"));

        const postsSnapshot = await getDocs(postsQuery);

        if (!postsSnapshot.empty) {
          console.log('Posts found in Firestore');
          // await fetch(`http://localhost:8000/relevant_posts_weekly?userid=${user.uid}`);
          const firestorePosts = postsSnapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({
            id: doc.data().id,
            subreddit: doc.data().subreddit,
            title: doc.data().title,
            content: doc.data().content,
            suggestedReply: doc.data().suggestedReply,
            url: doc.data().url,
            date_created: doc.data().date_created,
            date_archived: doc.data().date_archived || new Date(),
          }));
          setArchivedPosts(firestorePosts);
          setDisplayedPosts(firestorePosts.slice(0, POSTS_PER_PAGE));
          setIsLoading2(false);
          setHasMorePosts(firestorePosts.length > POSTS_PER_PAGE);
        } else {
            console.log('No archived posts found'); // Debug log
            setArchivedPosts([]);
            setDisplayedPosts([]);
            setHasMorePosts(false);
          }
          
          setIsLoading(false);
        
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
    const nextPosts = archivedPosts.slice(
      currentLength,
      currentLength + POSTS_PER_PAGE
    );
    
    setDisplayedPosts(prev => [...prev, ...nextPosts]);
    setHasMorePosts(currentLength + POSTS_PER_PAGE < archivedPosts.length);
    setIsLoadingMore(false);
  };

  if (isLoading) {
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
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Created {formatDistanceToNow(new Date(post.date_created), { addSuffix: true })}
                  {/* <span className="ml-2">
                    Archived {formatDistanceToNow(new Date(post.date_archived), { addSuffix: true })}
                  </span> */}
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
                <h3 className="font-semibold mb-2 dark:text-white">Submitted Reply</h3>
                <div 
                  className="w-full p-2 rounded-md bg-white dark:bg-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700"
                >
                  {post.suggestedReply}
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
              <p>End of archived posts!</p>
            </div>
          ) : (
            <div className="text-center text-gray-600 dark:text-gray-400">
              <p>No archived posts yet.</p>
              <p className="text-sm mt-1">Approved posts will appear here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}