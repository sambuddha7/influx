'use client';
import { doc, getDoc, setDoc, collection, getDocs, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useState, useEffect, useRef } from 'react';
import { auth } from '@/lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import Sidebar from '@/components/Sidebar';
import Loading from '@/components/Loading';
import { Building2, Globe, FileText, Mail, Save, Tag, LucideIcon, Plus, X } from 'lucide-react';
import { motion } from 'framer-motion';

interface UserData {
  companyDescription: string;
  companyName: string;
  companyWebsite: string;
  email: string;
  keywords: string;
  phrases: string;
  subreddits: string;
}

interface FormFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  type?: string;
  icon: LucideIcon;
  disabled?: boolean;
  isTextArea?: boolean;
}

const FormField: React.FC<FormFieldProps> = ({ 
  label, 
  name, 
  value, 
  onChange, 
  type = "text", 
  icon: Icon,
  disabled = false,
  isTextArea = false 
}) => (
  <div className="bg-white dark:bg-slate-900/50 backdrop-blur-xl p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
    <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
      <Icon className="w-4 h-4 mr-2 text-gray-500" />
      {label}
    </label>
    {isTextArea ? (
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
        rows={3}
        disabled={disabled}
      />
    ) : (
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
      />
    )}
  </div>
);

const Settings: React.FC = () => {
  const [user] = useAuthState(auth);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  
  // Tag-based UI state
  const [keywords, setKeywords] = useState<string[]>([]);
  const [phrases, setPhrases] = useState<string[]>([]);
  const [subreddits, setSubreddits] = useState<string[]>([]);
  const [keywordInput, setKeywordInput] = useState('');
  const [phraseInput, setPhraseInput] = useState('');
  const [subredditInput, setSubredditInput] = useState('');
  const [subredditError, setSubredditError] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const originalDataRef = useRef<string>('');

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;

      try {
        const userRef = doc(db, 'onboarding', user.uid);
        const docSnap = await getDoc(userRef);

        if (docSnap.exists()) {
          const data = docSnap.data() as UserData;
          setUserData(data);
          // Parse CSV strings into arrays for tag UI
          setKeywords(data.keywords ? data.keywords.split(',').map(k => k.trim()).filter(k => k) : []);
          setPhrases(data.phrases ? data.phrases.split(',').map(p => p.trim()).filter(p => p) : []);
          setSubreddits(data.subreddits ? data.subreddits.split(',').map(s => s.trim()).filter(s => s) : []);
          // Store original data for comparison
          originalDataRef.current = JSON.stringify(data);
        } else {
          console.error('No user data found!');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  // Check for unsaved changes and warn before leaving
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        return 'You have unsaved changes. Are you sure you want to leave?';
      }
    };

    const handlePopState = (e: PopStateEvent) => {
      if (hasUnsavedChanges) {
        const confirmed = window.confirm(
          'You have unsaved changes. Are you sure you want to leave this page?'
        );
        if (!confirmed) {
          // Push the current state back to prevent navigation
          window.history.pushState(null, '', window.location.href);
        }
      }
    };

    const handleClick = (e: MouseEvent) => {
      if (hasUnsavedChanges) {
        const target = e.target as HTMLElement;
        const link = target.closest('a[href]') as HTMLAnchorElement;
        if (link && link.href && !link.href.includes('#') && !link.target) {
          const confirmed = window.confirm(
            'You have unsaved changes. Are you sure you want to leave this page?'
          );
          if (!confirmed) {
            e.preventDefault();
            e.stopPropagation();
          }
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);
    document.addEventListener('click', handleClick, true);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
      document.removeEventListener('click', handleClick, true);
    };
  }, [hasUnsavedChanges]);

  // Function to clear posts from Firestore for the current user
  const clearPosts = async () => {
    if (!user) return;
    try {
      const postsCollectionRef = collection(db, "reddit-posts", user.uid, "posts");
      const postsSnapshot = await getDocs(postsCollectionRef);
      const deletePromises = postsSnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
      console.log("Posts cleared for user:", user.uid);
    } catch (error) {
      console.error("Error clearing posts:", error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setUserData((prev) => (prev ? { ...prev, [name]: value } : prev));
    setHasUnsavedChanges(true);
    console.log('Input changed, hasUnsavedChanges set to true');
  };

  // Tag management functions
  const addKeyword = () => {
    if (!keywordInput.trim() || keywords.length >= 8) return;
    const newKeywords = [...keywords, keywordInput.trim()];
    setKeywords(newKeywords);
    setKeywordInput('');
    updateUserDataArray('keywords', newKeywords);
  };

  const removeKeyword = (keyword: string) => {
    const newKeywords = keywords.filter(k => k !== keyword);
    setKeywords(newKeywords);
    updateUserDataArray('keywords', newKeywords);
  };

  const addPhrase = () => {
    if (!phraseInput.trim()) return;
    const newPhrases = [...phrases, phraseInput.trim()];
    setPhrases(newPhrases);
    setPhraseInput('');
    updateUserDataArray('phrases', newPhrases);
  };

  const removePhrase = (phrase: string) => {
    const newPhrases = phrases.filter(p => p !== phrase);
    setPhrases(newPhrases);
    updateUserDataArray('phrases', newPhrases);
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

  const addSubreddit = async () => {
    setSubredditError('');
    if (!subredditInput.trim() || subreddits.length >= 20) return;
    
    const isValid = await validateSubreddit(subredditInput.trim());
    if (!isValid) {
      setSubredditError('Invalid subreddit. Please enter a valid subreddit name.');
      return;
    }
    
    const newSubreddits = [...subreddits, subredditInput.trim()];
    setSubreddits(newSubreddits);
    setSubredditInput('');
    updateUserDataArray('subreddits', newSubreddits);
  };

  const removeSubreddit = (subreddit: string) => {
    const newSubreddits = subreddits.filter(s => s !== subreddit);
    setSubreddits(newSubreddits);
    updateUserDataArray('subreddits', newSubreddits);
  };

  const updateUserDataArray = (field: string, array: string[]) => {
    setUserData(prev => prev ? {
      ...prev,
      [field]: array.join(',')
    } : prev);
    setHasUnsavedChanges(true);
  };

  const handleSave = async () => {
    if (!user || !userData) return;

    if (keywords.length > 8) {
      alert("Keywords cannot exceed 8.");
      return;
    }

    if (subreddits.length > 20) {
      alert("Subreddits cannot exceed 20.");
      return;
    }

    setIsSaving(true);
    try {
      // Check if keywords changed and clear posts if so
      const originalData = originalDataRef.current ? JSON.parse(originalDataRef.current) : {};
      const originalKeywords = originalData.keywords || '';
      const currentKeywords = userData.keywords || '';
      
      if (originalKeywords !== currentKeywords) {
        await clearPosts();
      }
      
      const userRef = doc(db, 'onboarding', user.uid);
      await setDoc(userRef, userData, { merge: true });
      setShowAlert(true);
      
      // Hide alert after 3 seconds
      setTimeout(() => {
        setShowAlert(false);
      }, 3000);
      
      // Reset unsaved changes flag after successful save
      setHasUnsavedChanges(false);
      originalDataRef.current = JSON.stringify(userData);
    } catch (error) {
      console.error('Error updating user data:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <Loading />;

  if (!userData) {
    return <div>Error: Unable to load user data.</div>;
  }

  return (
    <div className="flex min-h-screen bg-inherit">
      <Sidebar />
      <div className="flex-1 p-8">
        <div className="max-w-3xl mx-auto">
          {showAlert && (
            <div className="fixed bottom-4 right-4 z-50 animate-slide-up">
              <div className="alert alert-success mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Settings updated successfully!</span>
              </div>
            </div>
          )}
          
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
              {hasUnsavedChanges && (
                <p className="text-sm text-orange-600 dark:text-orange-400 mt-1">
                  You have unsaved changes
                </p>
              )}
            </div>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className={`
                flex items-center px-6 py-3 rounded-xl font-medium
                transition-all duration-200 
                ${isSaving 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-orange-500 hover:bg-orange-600 hover:shadow-lg'
                }
                text-white
              `}
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>

          <div className="grid gap-6">
            <FormField
              label="Company Name"
              name="companyName"
              value={userData.companyName}
              onChange={handleInputChange}
              icon={Building2}
            />

            <FormField
              label="Company Website"
              name="companyWebsite"
              value={userData.companyWebsite}
              onChange={handleInputChange}
              icon={Globe}
            />

            <FormField
              label="Company Description"
              name="companyDescription"
              value={userData.companyDescription}
              onChange={handleInputChange}
              icon={FileText}
              isTextArea
            />



            {/* Keywords Section */}
            <div className="bg-white dark:bg-slate-900/50 backdrop-blur-xl p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
                  <Tag className="w-4 h-4 mr-2 text-gray-500" />
                  Keywords
                </label>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {keywords.length}/8
                </span>
              </div>
              <div className="flex space-x-2 mb-3">
                <input
                  type="text"
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && keywords.length < 8 && addKeyword()}
                  placeholder={keywords.length >= 8 ? "Maximum keywords reached" : "Enter a keyword"}
                  disabled={keywords.length >= 8}
                  className="flex-grow p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 disabled:bg-gray-100 disabled:text-gray-500 dark:disabled:bg-zinc-800 dark:disabled:text-zinc-500"
                />
                <button
                  onClick={addKeyword}
                  disabled={keywords.length >= 8 || !keywordInput.trim()}
                  className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                    keywords.length >= 8 || !keywordInput.trim()
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-orange-500 hover:bg-orange-600 text-white'
                  }`}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              {keywords.length >= 8 && (
                <p className="text-sm text-orange-600 dark:text-orange-400 mb-3">
                  Maximum of 8 keywords reached. Remove some to add new ones.
                </p>
              )}
              {keywords.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {keywords.map(keyword => (
                    <motion.div
                      key={keyword}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center bg-orange-100 dark:bg-orange-800 px-3 py-1 rounded-full text-sm"
                    >
                      {keyword}
                      <button
                        onClick={() => removeKeyword(keyword)}
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
            <div className="bg-white dark:bg-slate-900/50 backdrop-blur-xl p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                <Tag className="w-4 h-4 mr-2 text-gray-500" />
                Phrases
              </label>
              <div className="flex space-x-2 mb-3">
                <input
                  type="text"
                  value={phraseInput}
                  onChange={(e) => setPhraseInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addPhrase()}
                  placeholder="Enter a phrase"
                  className="flex-grow p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
                <button
                  onClick={addPhrase}
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
              {phrases.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {phrases.map(phrase => (
                    <motion.div
                      key={phrase}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center bg-orange-100 dark:bg-orange-800 px-3 py-1 rounded-full text-sm"
                    >
                      {phrase}
                      <button
                        onClick={() => removePhrase(phrase)}
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
            <div className="bg-white dark:bg-slate-900/50 backdrop-blur-xl p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
                  <Tag className="w-4 h-4 mr-2 text-gray-500" />
                  Subreddits
                </label>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {subreddits.length}/20
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
                      if (e.key === 'Enter' && subreddits.length < 20) {
                        await addSubreddit();
                      }
                    }}
                    placeholder={subreddits.length >= 20 ? "Maximum subreddits reached" : "Enter subreddit name"}
                    disabled={subreddits.length >= 20}
                    className="w-full pl-8 pr-4 p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 disabled:bg-gray-100 disabled:text-gray-500 dark:disabled:bg-zinc-800 dark:disabled:text-zinc-500"
                  />
                </div>
                <button
                  onClick={addSubreddit}
                  disabled={subreddits.length >= 20 || !subredditInput.trim()}
                  className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                    subreddits.length >= 20 || !subredditInput.trim()
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-orange-500 hover:bg-orange-600 text-white'
                  }`}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              {subreddits.length >= 20 && (
                <p className="text-sm text-orange-600 dark:text-orange-400 mb-3">
                  Maximum of 20 subreddits reached. Remove some to add new ones.
                </p>
              )}
              {subredditError && (
                <p className="text-red-500 text-sm mb-3">{subredditError}</p>
              )}
              {subreddits.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {subreddits.map(subreddit => (
                    <motion.div
                      key={subreddit}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center bg-orange-100 dark:bg-orange-800 px-3 py-1 rounded-full text-sm"
                    >
                      r/{subreddit}
                      <button
                        onClick={() => removeSubreddit(subreddit)}
                        className="ml-2 text-orange-500 hover:text-orange-700"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            <FormField
              label="Email"
              name="email"
              value={userData.email}
              onChange={handleInputChange}
              type="email"
              icon={Mail}
              disabled
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
