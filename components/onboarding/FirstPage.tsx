// components/onboarding/FirstPage.tsx
import { FormData } from '@/types/onboarding';
import { FormInput } from './FormInput';
import { FormTextArea } from './FormTextArea';

interface FirstPageProps {
  formData: FormData;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onNext: () => void;
}

export function FirstPage({ formData, onInputChange, onNext }: FirstPageProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Company Information</h2>
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
        <FormInput
          label="Country/Region"
          name="countryRegion"
          value={formData.countryRegion}
          onChange={onInputChange}
          required
        />
        <FormTextArea
          label="Company Description"
          name="companyDescription"
          value={formData.companyDescription}
          onChange={onInputChange}
          required
        />
      </div>
      <button
        onClick={onNext}
        className="w-full bg-orange-500 text-white p-2 rounded hover:bg-orange-600"
      >
        Next
      </button>
    </div>
  );
}