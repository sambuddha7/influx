// components/onboarding/SecondPage.tsx
import { FormData } from '@/types/onboarding';
import { FormInput } from './FormInput';
import { FormTextArea } from './FormTextArea';

interface SecondPageProps {
  formData: FormData;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onNext: () => void;
  onSkip: () => void;
}

export function SecondPage({ formData, onInputChange, onNext, onSkip }: SecondPageProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Additional Information</h2>
      <div className="space-y-4">
        <FormInput
          label="Product/Service Focus"
          name="product"
          value={formData.product}
          onChange={onInputChange}
        />
        <FormTextArea
          label="Target Audience"
          name="targetAudience"
          value={formData.targetAudience}
          onChange={onInputChange}
        />
      </div>
      <div className="flex gap-4">
        <button
          onClick={onSkip}
          className="w-1/2 border border-gray-300 p-2 rounded hover:bg-gray-100 dark:hover:bg-zinc-800"
        >
          Skip
        </button>
        <button
          onClick={onNext}
          className="w-1/2 bg-orange-500 text-white p-2 rounded hover:bg-orange-600"
        >
          Next
        </button>
      </div>
    </div>
  );
}