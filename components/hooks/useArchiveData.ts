import { useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ArchivedPost, GeneratedPost } from '@/types/archive';
import { QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';

const POSTS_PER_PAGE = 6;
const ANALYTICS_ITEMS_PER_PAGE = 5;
const apiUrl = process.env.NEXT_PUBLIC_API_URL;

export const useArchiveData = (user: any, activeTab: string) => {
  // Archived comments state
  const [archivedPosts, setArchivedPosts] = useState<ArchivedPost[]>([]);
  const [displayedPosts, setDisplayedPosts] = useState<ArchivedPost[]>([]);
  const [hasMorePosts, setHasMorePosts] = useState(true);

  // Generated posts state
  const [generatedPosts, setGeneratedPosts] = useState<GeneratedPost[]>([]);
  const [displayedGeneratedPosts, setDisplayedGeneratedPosts] = useState<GeneratedPost[]>([]);
  const [hasMoreGeneratedPosts, setHasMoreGeneratedPosts] = useState(true);

  // Matched content states
  const [matchedComments, setMatchedComments] = useState<ArchivedPost[]>([]);
  const [matchedPosts, setMatchedPosts] = useState<GeneratedPost[]>([]);
  const [displayedMatchedComments, setDisplayedMatchedComments] = useState<ArchivedPost[]>([]);
  const [displayedMatchedPosts, setDisplayedMatchedPosts] = useState<GeneratedPost[]>([]);
  const [hasMoreMatchedComments, setHasMoreMatchedComments] = useState(false);
  const [hasMoreMatchedPosts, setHasMoreMatchedPosts] = useState(false);

  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [isLoading2, setIsLoading2] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isLoadingMoreAnalytics, setIsLoadingMoreAnalytics] = useState(false);

  // Fetch archived comments
  useEffect(() => {
    if (!user || activeTab !== 'comments') return;
    
    const fetchPosts = async () => {
      try {
        const postsCollectionRef = collection(db, "archived-posts", user.uid, "posts");
        const postsQuery = query(postsCollectionRef, orderBy("archivedAt", "asc"));
        const postsSnapshot = await getDocs(postsQuery);

        if (!postsSnapshot.empty) {
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
          setHasMorePosts(firestorePosts.length > POSTS_PER_PAGE);
        } else {
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
        const response = await fetch(`${apiUrl}/reddit-posts/post-history`, {
          method: 'POST',
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            user_id: user.uid,
            limit: 50
          })
        });
        
        if (response.ok) {
          const data = await response.json();
          const posts = data.data.posts;
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

  const loadMoreMatchedComments = () => {
    setIsLoadingMoreAnalytics(true);
    const currentLength = displayedMatchedComments.length;
    const nextComments = matchedComments.slice(
      currentLength,
      currentLength + ANALYTICS_ITEMS_PER_PAGE
    );
    
    setDisplayedMatchedComments(prev => [...prev, ...nextComments]);
    setHasMoreMatchedComments(currentLength + ANALYTICS_ITEMS_PER_PAGE < matchedComments.length);
    setIsLoadingMoreAnalytics(false);
  };

  const loadMoreMatchedPosts = () => {
    setIsLoadingMoreAnalytics(true);
    const currentLength = displayedMatchedPosts.length;
    const nextPosts = matchedPosts.slice(
      currentLength,
      currentLength + ANALYTICS_ITEMS_PER_PAGE
    );
    
    setDisplayedMatchedPosts(prev => [...prev, ...nextPosts]);
    setHasMoreMatchedPosts(currentLength + ANALYTICS_ITEMS_PER_PAGE < matchedPosts.length);
    setIsLoadingMoreAnalytics(false);
  };

  return {
    // Comments
    archivedPosts,
    displayedPosts,
    hasMorePosts,
    loadMorePosts,
    setArchivedPosts,
    
    // Posts  
    generatedPosts,
    displayedGeneratedPosts,
    hasMoreGeneratedPosts,
    loadMoreGeneratedPosts,
    setGeneratedPosts,
    
    // Matched data
    matchedComments,
    displayedMatchedComments,
    hasMoreMatchedComments,
    loadMoreMatchedComments,
    setMatchedComments,
    setDisplayedMatchedComments,
    setHasMoreMatchedComments,
    
    matchedPosts,
    displayedMatchedPosts,
    hasMoreMatchedPosts,
    loadMoreMatchedPosts,
    setMatchedPosts,
    setDisplayedMatchedPosts,
    setHasMoreMatchedPosts,
    
    // Loading states
    isLoading,
    isLoading2,
    isLoadingMore,
    isLoadingMoreAnalytics
  };
};