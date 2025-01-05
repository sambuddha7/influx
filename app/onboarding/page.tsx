// app/onboarding/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FormData } from '@/types/onboarding';
import { FirstPage } from '@/components/onboarding/FirstPage';
import { SecondPage } from '@/components/onboarding/SecondPage';
import { ThirdPage } from '@/components/onboarding/ThirdPage';
import { ProgressBar } from '@/components/onboarding/ProgressBar';
import { doc, setDoc, getDoc} from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';

export default function OnboardingForm() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [user, loading] = useAuthState(auth);
  const [isLoading, setIsLoading] = useState(true);

  // checking if user exists in db if exists it redirects to dashboard
  useEffect(() => {
    const checkUser = async () => {
      if (!user) return;

      try {
        const docRef = doc(db, 'onboarding', user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          // User already exists, redirect to the dashboard
          router.push('/dashboard');
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
  const [formData, setFormData] = useState<FormData>({
    companyName: '',
    companyWebsite: '',
    countryRegion: '',
    companyDescription: '',
    product: '',
    targetAudience: ''
  });

  // Update the form data when the user types
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Save the form data to Firestore
  const saveToFirestore = async () => {
    if (!user) {
      console.log('No user is authenticated. Aborting save.');
      return;
    }
    
    try {
      console.log('Preparing to save the following data to Firestore:', {
        ...formData,
        userId: user.uid,
        email: user.email,
      });
  
      // Create a document with the user's UID as the document ID
      await setDoc(doc(db, 'onboarding', user.uid), {
        ...formData,
        userId: user.uid,
        email: user.email,
        createdAt: new Date().toISOString(),
      });
  
      console.log('Data successfully saved to Firestore for user:', user.uid);
    } catch (error) {
      console.error('Error saving to Firestore:', error);
      alert('Error saving your information. Please try again.');
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

  const handleNext = () => {
    if (page === 1 && !isFirstPageValid()) {
      alert('Please fill all required fields');
      return;
    }
    setPage(page + 1);
  };

  if (isLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen dark:bg-zinc-900 bg-white">
        <div className="flex flex-col items-center space-y-4">
          {/* Rotating Square Loader */}
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 bg-orange-500 animate-spin rounded-md"></div>
            </div>
          </div>
          {/* Message */}
          <p className="dark:text-gray-300 text-black font-medium text-lg">
            Just a moment, we're getting things ready for you!
          </p>
        </div>
      </div>
    );
  }
  
  
  
  

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-8 p-8 rounded-lg shadow-lg dark:bg-zinc-900 bg-white">
        <ProgressBar currentPage={page} totalPages={3} />
        {page === 1 && (
          <FirstPage
            formData={formData}
            onInputChange={handleInputChange}
            onNext={handleNext}
          />
        )}
        {page === 2 && (
          <SecondPage
            formData={formData}
            onInputChange={handleInputChange}
            onNext={handleNext}
            onSkip={() => setPage(3)}
          />
        )}
        {page === 3 && (
          <ThirdPage
            // onComplete={() => router.push('/dashboard')}
            onComplete={handleComplete}
          />
        )}
      </div>
    </div>
  );
}