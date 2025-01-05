// components/onboarding/ThirdPage.tsx
import { useState } from 'react';
interface ThirdPageProps {
  onComplete: () => void;
}

export function ThirdPage({ onComplete }: ThirdPageProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleComplete = async () => {
    setIsLoading(true);
    try {
      await onComplete();
    } catch (error) {
      console.error('Error completing onboarding:', error);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="space-y-6 text-center">
      <h2 className="text-2xl font-bold">Almost There!</h2>
      <div className="p-4">
        <img
          src="https://media1.giphy.com/media/SggILpMXO7Xt6/giphy.gif?cid=6c09b952n3cj83z2wbxqrg02vpyidwiltq966smvn177u2yq&ep=v1_gifs_search&rid=giphy.gif&ct=g"
          alt="Onboarding"
          className="mx-auto"
        />
        <p className="mt-4">
          Check out our detailed questionnaire in the Brand Voice tab for more personalized insights!
        </p>
      </div>
      <button
        onClick={onComplete}
        className="w-full bg-orange-500 text-white p-2 rounded hover:bg-orange-600"
      >
        Continue to Dashboard
      </button>
    </div>
  );
}