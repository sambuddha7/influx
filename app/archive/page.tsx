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
import { ArrowUpRight, Copy, FileText, MessageSquare } from "lucide-react";
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

interface GeneratedPost {
  id?: string;
  post_type: string;
  subreddit: string;
  title: string;
  body: string;
  content?: string;
  target_audience?: string;
  company_name?: string;
  status?: string;
  created_at?: string;
  saved_at?: string;
}

export default function ArchivePage() {
  const router = useRouter();
  const [archivedPosts, setArchivedPosts] = useState<ArchivedPost[]>([]);
  const [displayedPosts, setDisplayedPosts] = useState<ArchivedPost[]>([]);
  const [generatedPosts, setGeneratedPosts] = useState<GeneratedPost[]>([]);
  const [displayedGeneratedPosts, setDisplayedGeneratedPosts] = useState<GeneratedPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMorePosts, setHasMorePosts] = useState(true);
  const [hasMoreGeneratedPosts, setHasMoreGeneratedPosts] = useState(true);
  const [user, loading] = useAuthState(auth);
  const [isLoading2, setIsLoading2] = useState(true);
  const [activeTab, setActiveTab] = useState<'comments' | 'posts'>('comments');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const POSTS_PER_PAGE = 6;


  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab');
    if (tab === 'posts') {
      setActiveTab('posts');
    }
  }, []);

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

  // Fetch archived comments
  useEffect(() => {
    if (!user || activeTab !== 'comments') return;
    
    const fetchPosts = async () => {
      try {
        const postsCollectionRef = collection(db, "archived-posts", user.uid, "posts");
        const postsQuery = query(postsCollectionRef, orderBy("archivedAt", "asc"));
        const postsSnapshot = await getDocs(postsQuery);

        if (!postsSnapshot.empty) {
          console.log('Posts found in Firestore');
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
          console.log('No archived posts found');
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

    if (user && activeTab === 'comments') {
      fetchPosts();
    }
  }, [user, activeTab]);

  // Fetch generated posts
  useEffect(() => {
    if (!user || activeTab !== 'posts') return;

    const fetchGeneratedPosts = async () => {
      setIsLoading2(true);
      try {
        const response = await fetch('http://localhost:8000/reddit-posts/post-history', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            user_id: user.uid,
            limit: 50
          })
        });
        
        if (response.ok) {
          const data = await response.json();
          const posts = data.data.posts;
          console.log('All posts received:', posts);
          setGeneratedPosts(posts);
          setDisplayedGeneratedPosts(posts.slice(0, POSTS_PER_PAGE));
          setHasMoreGeneratedPosts(posts.length > POSTS_PER_PAGE);
        }
      } catch (err) {
        console.error('Failed to fetch generated posts:', err);
        setGeneratedPosts([]);
        setDisplayedGeneratedPosts([]);
        setHasMoreGeneratedPosts(false);
      } finally {
        setIsLoading2(false);
      }
    };

    if (user && activeTab === 'posts') {
      fetchGeneratedPosts();
    }
  }, [user, activeTab]);

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

  const loadMoreGeneratedPosts = () => {
    setIsLoadingMore(true);
    const currentLength = displayedGeneratedPosts.length;
    const nextPosts = generatedPosts.slice(
      currentLength,
      currentLength + POSTS_PER_PAGE
    );
    
    setDisplayedGeneratedPosts(prev => [...prev, ...nextPosts]);
    setHasMoreGeneratedPosts(currentLength + POSTS_PER_PAGE < generatedPosts.length);
    setIsLoadingMore(false);
  };

  const copyToClipboard = (post: GeneratedPost) => {
    const textToCopy = `${post.title}\n\n${post.body || post.content}`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedId(post.id || null);
    setTimeout(() => setCopiedId(null), 2000);
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
        {/* Tab Switcher */}
        <div className="mb-6">
          <div className="flex space-x-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg max-w-md">
            <button
              onClick={() => setActiveTab('comments')}
              className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-md transition-all duration-200 ${
                activeTab === 'comments' 
                  ? 'bg-white dark:bg-gray-900 text-orange-500 shadow-sm' 
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span className="font-medium">Comments</span>
            </button>
            <button
              onClick={() => setActiveTab('posts')}
              className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-md transition-all duration-200 ${
                activeTab === 'posts' 
                  ? 'bg-white dark:bg-gray-900 text-orange-500 shadow-sm' 
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span className="font-medium">Posts</span>
            </button>
          </div>
        </div>

        {/* Comments Tab Content */}
        {activeTab === 'comments' && (
          <>
            {displayedPosts.map((post) => (
              <div key={post.id} className="card bg-base-100 dark:bg-black bg-white shadow-xl border border-gray-200 dark:border-gray-700">
                <div className="card-body">
                  <div className="mb-4">
                    <div className="text-sm text-blue-500 dark:text-blue-400">{post.subreddit}</div>
                    <h2 className="card-title dark:text-white">{post.title}</h2>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Created {formatDistanceToNow(new Date(post.date_created), { addSuffix: true })}
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
                  {isLoadingMore ? <Loading /> : 'Load More Comments'}
                </button>
              ) : displayedPosts.length > 0 ? (
                <div className="text-center text-gray-600 dark:text-gray-400">
                  <p>End of archived comments!</p>
                </div>
              ) : (
                <div className="text-center text-gray-600 dark:text-gray-400">
                  <p>No archived comments yet.</p>
                  <p className="text-sm mt-1">Approved comments will appear here.</p>
                </div>
              )}
            </div>
          </>
        )}

        {/* Posts Tab Content */}
        {activeTab === 'posts' && (
          <>
            {isLoading2 ? (
              <div className="flex justify-center py-12">
                <Loading />
              </div>
            ) : displayedGeneratedPosts.length === 0 ? (
              <div className="text-center py-12 text-gray-600 dark:text-gray-400">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">No saved posts yet</p>
                <p className="text-sm mt-1">Generate and save posts to see them here.</p>
              </div>
            ) : (
              <>
                {displayedGeneratedPosts.map((post) => (
                  <div key={post.id} className="card bg-base-100 dark:bg-black bg-white shadow-xl border border-gray-200 dark:border-gray-700">
                    <div className="card-body">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <span className="text-sm text-blue-500 dark:text-blue-400">r/{post.subreddit}</span>
                            <span className="text-xs px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-full">
                              {post.post_type?.replace('_', ' ')}
                            </span>
                            {post.status === 'archived' && (
                              <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full">
                                Saved
                              </span>
                            )}
                          </div>
                          <h2 className="card-title dark:text-white text-lg">{post.title}</h2>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {post.created_at && (
                              <>Created {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</>
                            )}
                            {post.target_audience && (
                              <span className="ml-3">Target: {post.target_audience}</span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => copyToClipboard(post)}
                          className={`px-3 py-1.5 text-sm rounded-lg transition-all duration-200 flex items-center space-x-1 ${
                            copiedId === post.id
                              ? 'bg-green-500 text-white'
                              : 'bg-blue-500 hover:bg-blue-600 text-white'
                          }`}
                        >
                          <Copy className="w-4 h-4" />
                          <span>{copiedId === post.id ? 'Copied!' : 'Copy'}</span>
                        </button>
                      </div>
                      
                      <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                        <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap text-sm">
                          {post.body || post.content}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                
                <div className="flex justify-center py-4">
                  {hasMoreGeneratedPosts ? (
                    <button 
                      className="btn btn-neutral"
                      onClick={loadMoreGeneratedPosts}
                      disabled={isLoadingMore}
                    >
                      {isLoadingMore ? <Loading /> : 'Load More Posts'}
                    </button>
                  ) : displayedGeneratedPosts.length > 0 ? (
                    <div className="text-center text-gray-600 dark:text-gray-400">
                      <p>End of saved posts!</p>
                    </div>
                  ) : null}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}