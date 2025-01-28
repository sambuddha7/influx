"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthState } from 'react-firebase-hooks/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { FormData } from '@/types/onboarding';
import Loading from '@/components/Loading';
import Image from 'next/image'; // Import Image component for optimization
interface KeywordRequest {
  description: string;
}
const StarOutline = ({ className, onClick }: { className?: string, onClick?: () => void }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    className={`w-4 h-4 ${className}`}
    onClick={onClick}
  >
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const StarFilled = ({ className, onClick }: { className?: string, onClick?: () => void }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={`w-4 h-4 ${className}`}
    onClick={onClick}
  >
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);


// Define interface for ProgressBar props
interface ProgressBarProps {
  currentPage: number;
  totalPages: number;
}

// Define interface for FormInput props
interface FormInputProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  required?: boolean;
  type?: string;
}

// Define interface for FormTextArea props
interface FormTextAreaProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  required?: boolean;
}

// Define interface for Button props
interface ButtonProps {
  onClick: () => void;
  className?: string;
  children: React.ReactNode;
  disabled?: boolean;
}

// Progress bar component with smooth animations
const ProgressBar = ({ currentPage, totalPages }: ProgressBarProps) => (
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
    
    <Button
      onClick={onNext}
      className="w-full bg-orange-500 hover:bg-orange-600 text-white"
    >
      Let&apos;s Get Started
    </Button>
  </div>
);

// Common form input component
const FormInput = ({ label, name, value, onChange, required = false, type = "text" }: FormInputProps) => (
  <div className="space-y-2">
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent
                 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white transition duration-200"
    />
  </div>
);

// Common form textarea component
const FormTextArea = ({ label, name, value, onChange, required = false }: FormTextAreaProps) => (
  <div className="space-y-2">
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <textarea
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      rows={4}
      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent
                 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white transition duration-200 resize-none"
    />
  </div>
);

// Common button component
const Button = ({ onClick, className = "", children, disabled = false }: ButtonProps) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`px-6 py-2 rounded-lg transition duration-200 ${className}
               disabled:opacity-50 disabled:cursor-not-allowed`}
  >
    {children}
  </button>
);

export default function OnboardingForm() {
  const router = useRouter();
  const [page, setPage] = useState(0);
  const [user, loading] = useAuthState(auth);
  const [isLoading, setIsLoading] = useState(true);
  const [primaryKeywords, setPrimaryKeywords] = useState<string[]>([]);
  const [secondaryKeywords, setSecondaryKeywords] = useState<string[]>([]);
  const [keywordInput, setKeywordInput] = useState('');
  const [keywordSuggestions, setKeywordSuggestions] = useState<string[]>([]);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;


  const fetchKeywordSuggestions = async () => {
    try {
      const requestBody: KeywordRequest = {
        description: formData.companyDescription
      };
      // const response = await fetch("http://localhost:8000/keywords", {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json"
      //   },
      //   body: JSON.stringify({
      //     description: encodeURIComponent(formData.companyDescription)
      //   })
      // });
      
      // const test = await response.json();
      // console.log(test);

      const response = await fetch(`${apiUrl}/keywords?description=${encodeURIComponent(formData.companyDescription)}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch keywords');
        setKeywordSuggestions([]);
      }

      const keywords = await response.json();


      // const keywords = 'AI, Machine Learning, Data Science, Python, JavaScript, React, Next.js, Tailwind CSS, Firebase, Google Cloud Platform, AWS, Azure';
      
      setKeywordSuggestions(keywords.split(',').map((k : string) => k.trim()));
    } catch (error) {
      console.error('Error fetching keyword suggestions:', error);
      setKeywordSuggestions([]);
    }
  };
  useEffect(() => {
    if (page === 2) {
      fetchKeywordSuggestions();
    }
  }, [page]);
  const addKeyword = () => {
    const trimmedKeyword = keywordInput.trim();
    if (trimmedKeyword && 
        !primaryKeywords.includes(trimmedKeyword) && 
        !secondaryKeywords.includes(trimmedKeyword)) {
      setSecondaryKeywords([...secondaryKeywords, trimmedKeyword]);
      setKeywordInput('');
    }
  };
  const toggleFavorite = (keyword: string) => {
    if (primaryKeywords.includes(keyword)) {
      // Remove from primary, add to secondary
      setPrimaryKeywords(primaryKeywords.filter(k => k !== keyword));
      setSecondaryKeywords([...secondaryKeywords, keyword]);
    } else if (secondaryKeywords.includes(keyword)) {
      // Remove from secondary, add to primary
      setSecondaryKeywords(secondaryKeywords.filter(k => k !== keyword));
      setPrimaryKeywords([...primaryKeywords, keyword]);
    }
  };

  const removeKeyword = (keyword: string) => {
    setPrimaryKeywords(primaryKeywords.filter(k => k !== keyword));
    setSecondaryKeywords(secondaryKeywords.filter(k => k !== keyword));
  };

  const KeywordChip = ({ keyword, isPrimary }: { keyword: string, isPrimary: boolean }) => (
    <motion.div 
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex items-center bg-orange-100 dark:bg-orange-800 
                 px-3 py-1 rounded-full text-sm"
    >
      <button 
        onClick={() => toggleFavorite(keyword)} 
        className="mr-2 focus:outline-none"
      >
        {isPrimary ? (
          <StarFilled className="text-yellow-500" />
        ) : (
          <StarOutline className="text-gray-500" />
        )}
      </button>
      {keyword}
      <button
        onClick={() => removeKeyword(keyword)}
        className="ml-2 text-orange-500 hover:text-orange-700"
      >
        x
      </button>
    </motion.div>
  );

  const handleKeywordInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setKeywordInput(e.target.value);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      addKeyword();
    }
  };
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      primaryKeywords: primaryKeywords.join(','),
      secondaryKeywords: secondaryKeywords.join(',')
    }));
  }, [primaryKeywords, secondaryKeywords]);
  const [formData, setFormData] = useState<FormData>({
    companyName: '',
    companyWebsite: '',
    countryRegion: '',
    companyDescription: '',
    product: '',
    targetAudience: '',
    keywords: '',
    trialStartDate: new Date().toISOString(),
    trialStatus: 'active'
  });

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
      console.log('User logged in');
      checkUser();
    } else if (!loading) {
      console.log('User not logged in');
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
        trialStartDate: new Date().toISOString(),
        trialStatus: 'active'
      });
    } catch (error) {
      console.error('Error saving:', error);
      throw error;
    }
  };

  const handleComplete = async () => {
    await saveToFirestore();
    router.push('/dashboard');
  };

  const isFirstPageValid = () => {
    return formData.companyName && 
           formData.companyWebsite && 
           formData.countryRegion && 
           formData.companyDescription;
  };

  if (isLoading || loading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-zinc-950">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full space-y-8 p-8 rounded-xl shadow-xl 
                   bg-white dark:bg-zinc-900 transition-colors duration-200"
      >
        {/* <ProgressBar currentPage={page} totalPages={3} /> */}
        {page > 0 && <ProgressBar currentPage={page} totalPages={4} />}
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
              <div className="space-y-6">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
                  Company Information
                </h2>
                <div className="space-y-4">
                  <FormInput
                    label="Company Name"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleInputChange}
                    required
                  />
                  <FormInput
                    label="Company Website"
                    name="companyWebsite"
                    type="url"
                    value={formData.companyWebsite}
                    onChange={handleInputChange}
                    required
                  />
                  <FormInput
                    label="Country/Region"
                    name="countryRegion"
                    value={formData.countryRegion}
                    onChange={handleInputChange}
                    required
                  />
                  <FormTextArea
                    label="Company Description"
                    name="companyDescription"
                    value={formData.companyDescription}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <Button
                  onClick={() => isFirstPageValid() && setPage(2)}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                  disabled={!isFirstPageValid()}
                >
                  Next Step
                </Button>
              </div>
            )}

            {page === 2 && (
              <div className="space-y-6">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
                  Add Keywords
                </h2>
                <p className="text-sm text-gray-700 dark:text-gray-300 
                    bg-gray-50 dark:bg-zinc-800 
                    p-3 rounded-lg">
                  Keywords help our AI find the most relevant content for you:
                  <br />
                  <br />
                  • Primary Keywords: Core themes prioritized in search results
                  <br />
                  • Secondary Keywords: Provide additional context and nuance
                </p>
                <figure className="flex flex-col items-center gap-2 my-4">
                
                <Image
                  src="/keywords.gif" 
                  alt="How to add primary keywords" 
                  className="rounded-lg shadow-md"
                  width={500}
                  height={300}
                />
                <figcaption className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                  Add Primary Keywords by favoriting them
                </figcaption>
                
              </figure>
                <div className="space-y-4">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={keywordInput}
                      onChange={(e) => setKeywordInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addKeyword()}
                      placeholder="Enter a keyword"
                      className="flex-grow px-4 py-2 border rounded-lg"
                    />
                    <Button
                      onClick={addKeyword}
                      className="bg-orange-500 hover:bg-orange-600 text-white"
                    >
                      Add
                    </Button>
                  </div>
                  
                  {/* Primary Keywords Section */}
                  {primaryKeywords.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-600 mb-2">Primary Keywords</p>
                      <div className="flex flex-wrap gap-2">
                        {primaryKeywords.map(keyword => (
                          <KeywordChip key={keyword} keyword={keyword} isPrimary={true} />
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Secondary Keywords Section */}
                  {secondaryKeywords.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-600 mb-2">Secondary Keywords</p>
                      <div className="flex flex-wrap gap-2">
                        {secondaryKeywords.map(keyword => (
                          <KeywordChip key={keyword} keyword={keyword} isPrimary={false} />
                        ))}
                      </div>
                    </div>
                  )}
                  {keywordSuggestions.length > 0 && (
  <div className="space-y-2">
    <p className="text-sm font-medium text-gray-600">Suggested Keywords</p>
    <div className="flex flex-wrap gap-2">
      {keywordSuggestions.map((suggestion) => (
        <motion.button
          key={suggestion}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="px-3 py-1 text-sm bg-gray-100 dark:bg-zinc-800 
                    rounded-full hover:bg-orange-100 dark:hover:bg-orange-800
                    transition-colors duration-200"
          onClick={() => {
            setKeywordInput(suggestion);
            addKeyword();
          }}
        >
          {suggestion}
        </motion.button>
      ))}
    </div>
  </div>
)}
                  {/* Validation message */}
                  {primaryKeywords.length === 0 && secondaryKeywords.length === 0 && (
                    <p className="text-red-500 text-sm text-center">
                      Please add at least one keyword to continue
                    </p>
                  )}
                </div>
                <Button
                  onClick={() => (primaryKeywords.length > 0 || secondaryKeywords.length > 0) && setPage(3)}
                  className={`w-full ${
                    primaryKeywords.length > 0 || secondaryKeywords.length > 0
                      ? 'bg-orange-500 hover:bg-orange-600 text-white'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                  disabled={primaryKeywords.length === 0 && secondaryKeywords.length === 0}
                >
                  Continue
                </Button>
              </div>
            )}

            {page === 3 && (
              <div className="space-y-6 text-center">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
                  Personalise Your AI
                </h2>
                <div className="p-4">
                  <div className="overflow-hidden rounded-lg">
                    <Image
                      src="/out.gif"
                      alt="Onboarding"
                      width={500} // Specify width and height for optimization
                      height={500}
                      className="mx-auto rounded-lg shadow-lg"
                    />
                  </div>
                  <p className="mt-6 text-gray-600 dark:text-gray-400">
                    Don&apos;t miss out on the opportunity to personalise your AI to better suit your needs.
                  </p>
                </div>
                <Button
                  onClick={handleComplete}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                >
                  Continue to Dashboard
                </Button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
