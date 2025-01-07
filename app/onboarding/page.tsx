"use client"
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthState } from 'react-firebase-hooks/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { FormData } from '@/types/onboarding';
import Loading from '@/components/Loading';
import Image from 'next/image';


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
      Let's Get Started
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
  const [formData, setFormData] = useState<FormData>({
    companyName: '',
    companyWebsite: '',
    countryRegion: '',
    companyDescription: '',
    product: '',
    targetAudience: '',
    keywords: ''
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
    router.push('/dashboard');
  };

  const isFirstPageValid = () => {
    return formData.companyName && 
           formData.companyWebsite && 
           formData.countryRegion && 
           formData.companyDescription;
  };

  if (isLoading || loading) {
    return (

        <Loading/>
    );
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
      Additional Information
    </h2>
    <div className="space-y-4">
      <FormInput
        label="Product/Service Focus"
        name="product"
        value={formData.product}
        onChange={handleInputChange}
      />
      <FormTextArea
        label="Target Audience"
        name="targetAudience"
        value={formData.targetAudience}
        onChange={handleInputChange}
      />
      {/* New input for Keywords */}
      <FormInput
        label="Keywords (comma-separated)"
        name="keywords"
        value={formData.keywords}
        onChange={handleInputChange}
      />
    </div>
    <div className="flex gap-4">
      <Button
        onClick={() => setPage(3)}
        className="w-1/2 border border-gray-300 hover:bg-gray-100 
                 dark:border-zinc-700 dark:hover:bg-zinc-800"
      >
        Skip
      </Button>
      <Button
        onClick={() => setPage(3)}
        className="w-1/2 bg-orange-500 hover:bg-orange-600 text-white"
      >
        Next Step
      </Button>
    </div>
  </div>
)}

            {page === 3 && (
              <div className="space-y-6 text-center">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
                  Personalise Your AI
                </h2>
                <div className="p-4">
                  <div className="overflow-hidden rounded-lg">
                    <img
                      src="/out.gif"
                      alt="Onboarding"
                      className="mx-auto rounded-lg shadow-lg"
                    />
                  </div>
                  <p className="mt-6 text-gray-600 dark:text-gray-400">
                    Don't miss out on the opportunity to personalise your AI to better suit your needs.
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