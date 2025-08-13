// components/onboarding/CompanyInfoPage.tsx
import { FormInput, Button } from './SharedFormComponents';
import Image from 'next/image';

interface CompanyInfoPageProps {
  formData: any;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onScrape: () => void;
  isFirstPageValid: () => boolean;
  isScraping: boolean;
  onNext: () => void; // Add this line
}

export default function CompanyInfoPage({
  formData,
  onInputChange,
  onScrape,
  isFirstPageValid,
  isScraping,
  onNext, // Add this line
}: CompanyInfoPageProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
        Company Information
      </h2>
      <div className="space-y-4">
        <FormInput
          label="Company Name"
          name="companyName"
          value={formData.companyName}
          onChange={onInputChange}
          required
        />
        <FormInput
          label="Company Website"
          name="companyWebsite"
          type="url"
          value={formData.companyWebsite}
          onChange={onInputChange}
          required
        />
      </div>
      <Button
        onClick={onScrape}
        className="w-full bg-orange-500 hover:bg-orange-600 text-white flex items-center justify-center"
        disabled={!isFirstPageValid() || isScraping}
      >
        {isScraping ? (
          <>
            <span className="loader mr-2 animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
            Scraping company information...
          </>
        ) : (
          "Next Step"
        )}
      </Button>
    </div>
  );
}