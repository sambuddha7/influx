// components/onboarding/KeywordsPage.tsx
import { Button } from './SharedFormComponents';
import { motion } from 'framer-motion';

interface KeywordsPageProps {
  keywords: string[]; // Replace primary/secondary with single array
  keywordInput: string;
  keywordSuggestions: string[];
  onKeywordInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  addKeyword: () => void;
  removeKeyword: (keyword: string) => void;
  handleComplete: () => void;
  isKeywordsPageValid: () => boolean;
  setKeywordInput: (v: string) => void;

}

export default function KeywordsPage({
  keywords,
  keywordInput, 
  keywordSuggestions,
  onKeywordInputChange,
  addKeyword,
  removeKeyword,
  handleComplete,
  isKeywordsPageValid,
  setKeywordInput,
}: KeywordsPageProps) {
  const KeywordChip = ({ keyword }: { keyword: string }) => (
    <motion.div 
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex items-center bg-orange-100 dark:bg-orange-800 px-3 py-1 rounded-full text-sm"
    >
      {keyword}
      <button
        onClick={() => removeKeyword(keyword)}
        className="ml-2 text-orange-500 hover:text-orange-700"
      >
        x
      </button>
    </motion.div>
  );

  return (
    <div className="space-y-6">
  <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
    Add Keywords
  </h2>
  <p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-zinc-800 p-3 rounded-lg">
    Keywords help our AI find the most relevant content for you.
  </p>
  <div className="space-y-4">
    <div className="flex space-x-2">
      <input
        type="text"
        value={keywordInput}
        onChange={onKeywordInputChange}
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
    {keywords.length > 0 && (
      <div className="mt-4">
        <p className="text-sm font-medium text-gray-600 mb-2">Selected Keywords</p>
        <div className="flex flex-wrap gap-2">
          {keywords.map(keyword => (
            <KeywordChip key={keyword} keyword={keyword} />
          ))}
        </div>
      </div>
    )}
    {keywords.length === 0 && (
      <p className="text-red-500 text-sm text-center">
        Please add at least one keyword to continue
      </p>
    )}
  </div>
  <Button
    onClick={handleComplete}
    className={`w-full ${
      keywords.length > 0 
        ? 'bg-orange-500 hover:bg-orange-600 text-white'
        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
    }`}
    disabled={!isKeywordsPageValid()}
  >
    Complete Setup
  </Button>
</div>
  );
}