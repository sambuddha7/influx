"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthState } from 'react-firebase-hooks/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { FormData } from '@/types/onboarding';
import Loading from '@/components/Loading';
import Image from 'next/image';

import CompanyInfoPage from '@/components/onboarding/CompanyInfoPage';
import CompanyDescriptionPage from '@/components/onboarding/CompanyDescriptionPage';
import KeywordsPage from '@/components/onboarding/KeywordsPage';
import SubredditPage from '@/components/onboarding/SubredditPage'; // Ensure this is a default import

interface KeywordRequest {
  description: string;
}
interface ScrapedPage {
  url: string;
  title?: string;
  content: string;
  date_published?: string;
  page_type?: string;
}

const ProgressBar = ({ currentPage, totalPages }: { currentPage: number, totalPages: number }) => (
  <div className="w-full bg-gray-200 rounded-full h-2 mb-8">
    <motion.div
      className="h-full bg-orange-500 rounded-full"
      initial={{ width: 0 }}
      animate={{ width: `${(currentPage / totalPages) * 100}%` }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
    />
  </div>
);

const WelcomePage = ({ onNext }: { onNext: () => void }) => (
  <div className="space-y-8 text-center">
    <div className="flex items-center justify-center space-x-4">
      <div className="flex-none">
        <Image src="/new_logo.png" width={48} height={48} alt="company logo" className="animate-float" />
      </div>
      <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
        Welcome to Influx
      </h1>
    </div>
    <div className="space-y-6">
      <p className="text-xl font-semibold text-gray-800 dark:text-gray-200">
        Be ready to get an influx of customers!
      </p>
      <p className="text-gray-600 dark:text-gray-400">
        But before we start, we need to learn a bit about you!
      </p>
    </div>
    <button
      onClick={onNext}
      className="w-full bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg transition duration-200"
    >
      Let&apos;s Get Started
    </button>
  </div>
);

export default function OnboardingForm() {
  const router = useRouter();
  const [page, setPage] = useState(0);
  const [user, loading] = useAuthState(auth);
  const [isLoading, setIsLoading] = useState(true);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [keywordInput, setKeywordInput] = useState('');
  const [keywordSuggestions, setKeywordSuggestions] = useState<string[]>([]);
  const [phrases, setPhrases] = useState<string[]>([]);
  const [phraseInput, setPhraseInput] = useState('');
  const [phraseSuggestions, setPhraseSuggestions] = useState<string[]>([]);
  const [scrapedPages, setScrapedPages] = useState<ScrapedPage[]>([]);
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
  const [isScraping, setIsScraping] = useState(false);
  const [isFetchingSubreddits, setIsFetchingSubreddits] = useState(false);
  const [isFetchingKeywords, setIsFetchingKeywords] = useState(false);
  const [isFetchingPhrases, setIsFetchingPhrases] = useState(false);
  const [subreddits, setSubreddits] = useState<string[]>([]);
  const [subredditInput, setSubredditInput] = useState('');
  const [subredditSuggestions, setSubredditSuggestions] = useState<string[]>([]);
  const [apiError, setApiError] = useState<string | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const [formData, setFormData] = useState<Partial<FormData>>({
    companyName: '',
    companyWebsite: '',
    companyDescription: '',
    product: '',
    targetAudience: '',
    keywords: '',
    phrases: '',
    subreddits: '',
  });

  const fetchKeywordSuggestions = async () => {
    setIsFetchingKeywords(true);
    try {
      const description = formData.companyDescription || ''; // Default to empty string
      const response = await fetch(`${apiUrl}/keywords?description=${encodeURIComponent(description)}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch keywords');
      }
      const keywords = await response.json();

      const newKeywords = keywords.split(',')
        .map((k: string) => k.trim())
        .filter((k: string) => k); // Remove empty strings
      setKeywordSuggestions(newKeywords);
    } catch (error) {
      console.error('Error fetching keyword suggestions:', error);
    } finally {
      setIsFetchingKeywords(false);
    }
  };

  const fetchPhraseSuggestions = async () => {
    setIsFetchingPhrases(true);
    try {
      const description = formData.companyDescription || '';
      const response = await fetch(`${apiUrl}/paraphrases?description=${encodeURIComponent(description)}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch phrases');
      }
      const phrases = await response.json();
      const newPhrases = phrases.split(',')
        .map((p: string) => p.trim())
        .filter((p: string) => p);
      setPhrases(newPhrases);
      setPhraseSuggestions([]);
    } catch (error) {
      console.error('Error fetching phrase suggestions:', error);
    } finally {
      setIsFetchingPhrases(false);
    }
  };

  const fetchSubredditSuggestions = async () => {
    setIsFetchingSubreddits(true);
    try {
      const description = formData.companyDescription || ''; // Default to empty string
      const response = await fetch(`${apiUrl}/generate_subreddits?description=${encodeURIComponent(description)}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ description })
      });
      if (!response.ok) {
        throw new Error('Failed to fetch subreddits');
      }
      const subreddits = await response.json();
      // const subreddits = "subreddit1, subreddit2, subreddit3"; // Mocked response for testing
      const newSubreddits = subreddits.split(',')
        .map((s: string) => s.trim())
        .filter((s: string) => s); // Remove empty strings
      setSubredditSuggestions(newSubreddits);
    } catch (error) {
      console.error('Error fetching subreddit suggestions:', error);
    } finally {
      setIsFetchingSubreddits(false);
    }
  };

  useEffect(() => {
    if (page === 3) {
      fetchSubredditSuggestions();
    } else if (page === 4) {
      fetchKeywordSuggestions();
      fetchPhraseSuggestions();
    }
  }, [page]);

  useEffect(() => {
    if (page === 2 && !formData.companyDescription) {
      generateCompanyDescription();
    }
  }, [page, scrapedPages]);

  const generateCompanyDescription = async () => {
    setIsGeneratingDescription(true);
    try {
      let content = '';
      if (!scrapedPages) {
        // no pages
      } else {
        const homePage = scrapedPages.find(page => 
          page.url === formData.companyWebsite || 
          page.url === formData.companyWebsite + '/' ||
          page.title?.toLowerCase().includes('home') ||
          page.url.endsWith('/')
        );
        const aboutPage = scrapedPages.find(page => 
          page.title?.toLowerCase().includes('about') ||
          page.url.toLowerCase().includes('about')
        );
        if (homePage) {
          content += `Home Page Content: ${homePage.content}\n\n`;
        }
        if (aboutPage) {
          content += `About Page Content: ${aboutPage.content}`;
        }
        if (!content && scrapedPages[0]) {
          content = scrapedPages[0].content;
        }
      }
      const companyName = formData.companyName || ''; // Ensure companyName is a string
      const response = await fetch(`${apiUrl}/company_desc`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content, companyName }),
      });
      if (!response.ok) {
        throw new Error('Failed to generate company description');
      }
      const generatedDescription = await response.text();
      setFormData(prev => ({
        ...prev,
        companyDescription: generatedDescription
      }));
    } catch (error) {
      console.error('Error generating company description:', error);
    } finally {
      setIsGeneratingDescription(false);
    }
  };

  const addKeyword = () => {
    if (!keywordInput.trim() || keywords.length >= 8) return;
    setKeywords(prev => [...prev, keywordInput.trim()]);
    setKeywordInput('');
  };

  const addPhrase = () => {
    if (!phraseInput.trim()) return;
    setPhrases(prev => [...prev, phraseInput.trim()]);
    setPhraseInput('');
  };

  const addSubreddit = () => {
    if (!subredditInput.trim() || subreddits.length >= 20) return;
    setSubreddits(prev => [...prev, subredditInput.trim()]);
    setSubredditInput('');
  };

  const addSuggestedSubreddit = (subreddit: string) => {
    if (subreddits.length >= 20 || subreddits.includes(subreddit)) return;
    setSubreddits(prev => [...prev, subreddit]);
    setSubredditSuggestions(prev => prev.filter(s => s !== subreddit));
  };

  const addSuggestedKeyword = (keyword: string) => {
    if (keywords.length >= 8 || keywords.includes(keyword)) return;
    setKeywords(prev => [...prev, keyword]);
    setKeywordSuggestions(prev => prev.filter(k => k !== keyword));
  };


  const removeKeyword = (keyword: string) => {
    setKeywords(prev => prev.filter(k => k !== keyword));
  };

  const removePhrase = (phrase: string) => {
    setPhrases(prev => prev.filter(p => p !== phrase));
  };

  const removeSubreddit = (subreddit: string) => {
    setSubreddits(prev => prev.filter(s => s !== subreddit));
  };

  const handleKeywordInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setKeywordInput(e.target.value);
  };

  const handlePhraseInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhraseInput(e.target.value);
  };

  const handleSubredditInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSubredditInput(e.target.value);
  };

  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      keywords: keywords.join(',')
    }));
  }, [keywords]);

  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      phrases: phrases.join(',')
    }));
  }, [phrases]);

  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      subreddits: subreddits.join(',')
    }));
  }, [subreddits]);

  useEffect(() => {
    const checkUser = async () => {
      if (!user) return;
      try {
        const docRef = doc(db, 'onboarding', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          router.push('/dashboard');
        } else {
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error checking user:', error);
        setIsLoading(false);
      }
    };
    if (user) {
      checkUser();
    } else if (!loading) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const saveToFirestore = async () => {
    if (!user) return;
    try {
      await setDoc(doc(db, 'onboarding', user.uid), {
        ...formData,
        userId: user.uid,
        email: user.email,
        createdAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error saving:', error);
      throw error;
    }
  };

  const handleComplete = async () => {
    await saveToFirestore();
    
    // Trigger subreddit classification in background
    if (user) {
      try {
        const response = await fetch(`${apiUrl}/classify_user_subreddits`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user_id: user.uid
          })
        });
        
        if (response.ok) {
          console.log('Subreddit classification started successfully');
        } else {
          console.warn('Failed to start subreddit classification');
        }
      } catch (error) {
        console.error('Error starting subreddit classification:', error);
        // Don't block the user flow if classification fails
      }
    }
    
    router.push('/dashboard');
  };

  const isFirstPageValid = () => {
    return !!formData.companyName && !!formData.companyWebsite; // Ensure both fields are non-empty
  };

  const isSecondPageValid = () => {
    return (formData.companyDescription?.trim().length || 0) > 0; // Safely check length
  };

  const isKeywordsPageValid = () => {
    return keywords.length > 0 || phrases.length > 0;
  };

  const isSubredditPageValid = () => {
    return subreddits.length > 0;
  };

  if (isLoading || loading) {
    return <Loading />;
  }

  const handleScrape = async () => {
    const companyWebsite = formData.companyWebsite || ''; // Default to empty string
    if (!isFirstPageValid()) return;
    setIsScraping(true);
    try {
      const res = await fetch(
        `${apiUrl}/scrape?base_url=${encodeURIComponent(companyWebsite)}&user_id=${user?.uid}&source_type=onboarding`
      );
      if (!res.ok) throw new Error("Scrape failed");
      const { pages } = await res.json();
      setScrapedPages(pages);
      setPage(2);
    } catch (err) {
      console.error(err);
    } finally {
      setIsScraping(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-zinc-950">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full space-y-8 p-8 rounded-xl shadow-xl bg-white dark:bg-zinc-900 transition-colors duration-200"
      >
        {page > 0 && <ProgressBar currentPage={page} totalPages={5} />}
        <AnimatePresence mode="wait">
          <motion.div
            key={page}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {page === 0 && (
              <WelcomePage onNext={() => setPage(1)} />
            )}
            {page === 1 && (
              <CompanyInfoPage
                formData={formData}
                onInputChange={handleInputChange}
                onScrape={handleScrape}
                isFirstPageValid={isFirstPageValid}
                isScraping={isScraping}
                onNext={() => isFirstPageValid() && setPage(2)} // Pass the onNext prop
              />
            )}
            {page === 2 && (
              <CompanyDescriptionPage
                formData={formData}
                onInputChange={handleInputChange}
                isGeneratingDescription={isGeneratingDescription}
                isSecondPageValid={isSecondPageValid}
                onNext={() => isSecondPageValid() && setPage(3)}
              />
            )}
            {page === 3 && (
              <SubredditPage
                subreddits={subreddits}
                subredditInput={subredditInput}
                subredditSuggestions={subredditSuggestions}
                onSubredditInputChange={handleSubredditInputChange}
                addSubreddit={addSubreddit}
                addSuggestedSubreddit={addSuggestedSubreddit}
                removeSubreddit={removeSubreddit}
                isSubredditPageValid={isSubredditPageValid}
                setSubredditInput={setSubredditInput}
                onNext={() => isSubredditPageValid() && setPage(4)} // Pass onNext prop
                isFetchingSubreddits={isFetchingSubreddits}
              />
            )}
            {page === 4 && (
              <KeywordsPage
                keywords={keywords}
                keywordInput={keywordInput}
                keywordSuggestions={keywordSuggestions}
                onKeywordInputChange={handleKeywordInputChange}
                addKeyword={addKeyword}
                addSuggestedKeyword={addSuggestedKeyword}
                removeKeyword={removeKeyword}
                phrases={phrases}
                phraseInput={phraseInput}
                phraseSuggestions={phraseSuggestions}
                onPhraseInputChange={handlePhraseInputChange}
                addPhrase={addPhrase}
                removePhrase={removePhrase}
                handleComplete={() => isKeywordsPageValid() && handleComplete()} 
                isKeywordsPageValid={isKeywordsPageValid}
                setKeywordInput={setKeywordInput}
                setPhraseInput={setPhraseInput} // Make sure this is included
                isFetchingKeywords={isFetchingKeywords}
                isFetchingPhrases={isFetchingPhrases}
              />
            )}
          </motion.div>
        </AnimatePresence>
        {apiError && <p className="text-red-500 text-sm text-center">{apiError}</p>}
      </motion.div>
    </div>
  );
} 