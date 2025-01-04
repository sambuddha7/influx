// app/onboarding/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FormData } from '@/types/onboarding';
import { FirstPage } from '@/components/onboarding/FirstPage';
import { SecondPage } from '@/components/onboarding/SecondPage';
import { ThirdPage } from '@/components/onboarding/ThirdPage';
import { ProgressBar } from '@/components/onboarding/ProgressBar';

export default function OnboardingForm() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    companyName: '',
    companyWebsite: '',
    countryRegion: '',
    companyDescription: '',
    product: '',
    targetAudience: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
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
            onComplete={() => router.push('/dashboard')}
          />
        )}
      </div>
    </div>
  );
}