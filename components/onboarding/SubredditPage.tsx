import { Button } from './SharedFormComponents';
import { motion } from 'framer-motion';
import { useState } from 'react';

interface SubredditPageProps {
  subreddits: string[];
  subredditInput: string;
  subredditSuggestions: string[];
  onSubredditInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  addSubreddit: () => void;
  removeSubreddit: (subreddit: string) => void;
  isSubredditPageValid: () => boolean;
  setSubredditInput: (v: string) => void;
  onNext: () => void; // Keep onNext prop
}

export default function SubredditPage({
  subreddits,
  subredditInput,
  subredditSuggestions,
  onSubredditInputChange,
  addSubreddit,
  removeSubreddit,
  isSubredditPageValid,
  setSubredditInput,
  onNext, // Keep onNext
}: SubredditPageProps) {
  const [errorMessage, setErrorMessage] = useState('');

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

  const handleAddSubreddit = async () => {
    setErrorMessage('');
    const isValid = await validateSubreddit(subredditInput);
    if (!isValid) {
      setErrorMessage('Invalid subreddit. Please enter a valid subreddit name.');
      return;
    }
    addSubreddit();
  };

  const SubredditChip = ({ subreddit }: { subreddit: string }) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex items-center bg-orange-100 dark:bg-orange-800 px-3 py-1 rounded-full text-sm"
    >
      {`r/${subreddit}`}
      <button
        onClick={() => removeSubreddit(subreddit)}
        className="ml-2 text-orange-500 hover:text-orange-700"
      >
        x
      </button>
    </motion.div>
  );

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
        Add Subreddits
      </h2>
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <p className="text-sm text-blue-800 dark:text-blue-200">
          💡 Think of this as your Reddit radar.
          The more subreddits you add, the more ground we cover.
        </p>
      </div>
      <div className="space-y-4">
        <div className="flex space-x-2">
          <input
            type="text"
            value={subredditInput}
            onChange={onSubredditInputChange}
            onKeyPress={async (e) => {
              if (e.key === 'Enter') await handleAddSubreddit();
            }}
            placeholder="Enter a subreddit"
            className="flex-grow px-4 py-2 border rounded-lg"
          />
          <Button
            onClick={handleAddSubreddit}
            className="bg-orange-500 hover:bg-orange-600 text-white"
          >
            Add
          </Button>
        </div>
        {errorMessage && (
          <p className="text-red-500 text-sm">{errorMessage}</p>
        )}
        {subreddits.length > 0 && (
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-600 mb-2">Selected Subreddits</p>
            <div className="flex flex-wrap gap-2">
              {subreddits.map(subreddit => (
                <SubredditChip key={subreddit} subreddit={subreddit} />
              ))}
            </div>
          </div>
        )}
        {subreddits.length === 0 && (
          <div>
            <p className="text-red-500 text-sm text-center">
              Please add at least one subreddit to continue
            </p>
          </div>
        )}
      </div>
      <Button
        onClick={onNext} // Use onNext for navigation
        className={`w-full ${
          subreddits.length > 0
            ? 'bg-orange-500 hover:bg-orange-600 text-white'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
        disabled={!isSubredditPageValid()}
      >
        Next Step
      </Button>
    </div>
  );
}