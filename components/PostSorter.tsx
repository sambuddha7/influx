import React from 'react';
import { ChevronDown } from 'lucide-react';

interface PostSorterProps {
  onSort: (sortBy: 'comments' | 'score' | 'date' | 'relevance', order: 'asc' | 'desc') => void;
  currentSort: {
    by: 'comments' | 'score' | 'date' | 'relevance';
    order: 'asc' | 'desc';
  };
}

const PostSorter: React.FC<PostSorterProps> = ({ onSort, currentSort }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const sortOptions = [
    { label: 'Highest Relevancy', value: 'relevance', order: 'desc' },
    { label: 'Lowest Relevancy', value: 'relevance', order: 'asc' },
    { label: 'Most Comments', value: 'comments', order: 'desc' },
    { label: 'Least Comments', value: 'comments', order: 'asc' },
    { label: 'Most Upvotes', value: 'score', order: 'desc' },
    { label: 'Least Upvotes', value: 'score', order: 'asc' },
    { label: 'Newest First', value: 'date', order: 'desc' },
    { label: 'Oldest First', value: 'date', order: 'asc' },
  ];

  const getCurrentLabel = () => {
    const current = sortOptions.find(
      option => option.value === currentSort.by && option.order === currentSort.order
    );
    return current?.label || 'Sort Posts';
  };

  const handleSort = (value: 'comments' | 'score' | 'date' | 'relevance', order: 'asc' | 'desc') => {
    onSort(value, order);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-750 text-gray-200 rounded-lg border border-gray-700 hover:border-orange-600 transition-all duration-200 shadow-md hover:shadow-orange-900/20"
      >
        <span>Sort: {getCurrentLabel()}</span>
        <ChevronDown 
          size={16} 
          className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-48 bg-gray-900 rounded-lg shadow-xl border border-gray-800 z-50">
            <div className="py-1">
              {sortOptions.map((option, index) => (
                <button
                  key={`${option.value}-${option.order}`}
                  onClick={() => handleSort(option.value as 'comments' | 'score' | 'date' | 'relevance', option.order as 'asc' | 'desc')}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-800 transition-colors ${
                    currentSort.by === option.value && currentSort.order === option.order
                      ? 'text-orange-500 bg-gray-800'
                      : 'text-gray-300'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default PostSorter;