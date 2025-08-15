// components/onboarding/KeywordsPage.tsx
import { Button } from './SharedFormComponents';
import { motion } from 'framer-motion';
import { LoadingState } from './LoadingState';

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
  phrases: string[];
  phraseInput: string;
  phraseSuggestions: string[];
  onPhraseInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  addPhrase: () => void;
  removePhrase: (phrase: string) => void;
  setPhraseInput: (v: string) => void;  // Add this line
  isFetchingKeywords: boolean;
  isFetchingPhrases: boolean;
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
  phrases,
  phraseInput,
  phraseSuggestions,
  onPhraseInputChange,
  addPhrase,
  removePhrase,
  setPhraseInput,  // Add this to destructuring
  isFetchingKeywords,
  isFetchingPhrases,
}: KeywordsPageProps) {
  const KeywordChip = ({ keyword, onRemove }: { keyword: string, onRemove: () => void }) => (
    <motion.div 
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex items-center bg-orange-100 dark:bg-orange-800 px-3 py-1 rounded-full text-sm"
    >
      {keyword}
      <button
        onClick={onRemove}
        className="ml-2 text-orange-500 hover:text-orange-700"
      >
        x
      </button>
    </motion.div>
  );

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
        Add Keywords and Phrases
      </h2>
      <p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-zinc-800 p-3 rounded-lg">
        These help our AI find the most relevant content for you.
      </p>
      
      {/* Keywords Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold">Keywords</h3>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {keywords.length}/8
          </span>
        </div>
        {isFetchingKeywords && (
          <LoadingState message="Generating keywords..." />
        )}
        <div className="flex space-x-2">
          <input
            type="text"
            value={keywordInput}
            onChange={onKeywordInputChange}
            onKeyPress={(e) => e.key === 'Enter' && keywords.length < 8 && addKeyword()}
            placeholder={keywords.length >= 8 ? "Maximum keywords reached" : "Enter a keyword"}
            disabled={keywords.length >= 8}
            className="flex-grow px-4 py-2 border rounded-lg disabled:bg-gray-100 disabled:text-gray-500 dark:disabled:bg-zinc-800 dark:disabled:text-zinc-500"
          />
          <Button
            onClick={addKeyword}
            className={`${
              keywords.length >= 8
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-orange-500 hover:bg-orange-600 text-white'
            }`}
            disabled={keywords.length >= 8}
          >
            Add
          </Button>
        </div>
        {keywords.length >= 8 && (
          <p className="text-sm text-orange-600 dark:text-orange-400">
            Maximum of 8 keywords reached. Remove some to add new ones.
          </p>
        )}
        {keywords.length > 0 && (
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-600 mb-2">Selected Keywords</p>
            <div className="flex flex-wrap gap-2">
              {keywords.map(keyword => (
                <KeywordChip key={keyword} keyword={keyword} onRemove={() => removeKeyword(keyword)} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Phrases Section */}
      <div className="space-y-4">
        
        <h3 className="text-xl font-semibold">Phrases</h3>
        {isFetchingPhrases && (
          <LoadingState message="Generating phrases..." />
        )}
        <div className="flex space-x-2">
          <input
            type="text"
            value={phraseInput}
            onChange={onPhraseInputChange}
            onKeyPress={(e) => e.key === 'Enter' && addPhrase()}
            placeholder="Enter a phrase"
            className="flex-grow px-4 py-2 border rounded-lg"
          />
          <Button
            onClick={addPhrase}
            className="bg-orange-500 hover:bg-orange-600 text-white"
          >
            Add
          </Button>
        </div>
        {phrases.length > 0 && (
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-600 mb-2">Selected Phrases</p>
            <div className="flex flex-wrap gap-2">
              {phrases.map(phrase => (
                <KeywordChip key={phrase} keyword={phrase} onRemove={() => removePhrase(phrase)} />
              ))}
            </div>
          </div>
        )}
      </div>

      {(keywords.length === 0 && phrases.length === 0) && (
        <p className="text-red-500 text-sm text-center">
          Please add at least one keyword or phrase to continue
        </p>
      )}

      <Button
        onClick={handleComplete}
        className={`w-full ${
          (keywords.length > 0 || phrases.length > 0)
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