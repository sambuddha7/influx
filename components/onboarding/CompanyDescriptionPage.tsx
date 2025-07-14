// components/onboarding/CompanyDescriptionPage.tsx
import { FormTextArea, Button } from './SharedFormComponents';

interface CompanyDescriptionPageProps {
  formData: any;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  isGeneratingDescription: boolean;
  isSecondPageValid: () => boolean;
  onNext: () => void;
}

export default function CompanyDescriptionPage({
  formData,
  onInputChange,
  isGeneratingDescription,
  isSecondPageValid,
  onNext,
}: CompanyDescriptionPageProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
        Company Description
      </h2>
      {isGeneratingDescription ? (
        <div className="space-y-4">
          <div className="flex items-center justify-center space-x-3 p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
            <p className="text-gray-600 dark:text-gray-400">
              Generating company description from your website...
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              💡 We&apos;ve automatically generated a description based on your website content. 
              Feel free to edit it to better reflect your company.
            </p>
          </div>
          <FormTextArea
            label="Tell us about your company"
            name="companyDescription"
            value={formData.companyDescription.replace(/^"|"$/g, '')}
            onChange={onInputChange}
            required
          />
        </div>
      )}
      <Button
        onClick={onNext}
        className="w-full bg-orange-500 hover:bg-orange-600 text-white"
        disabled={!isSecondPageValid() || isGeneratingDescription}
      >
        Next Step
      </Button>
    </div>
  );
}