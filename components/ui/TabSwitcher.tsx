import React from 'react';
import { MessageSquare, FileText } from 'lucide-react';

interface TabSwitcherProps {
  activeTab: 'comments' | 'posts';
  hasUsername: boolean;
  isAnalyticsMode: boolean;
  isPostsAnalyticsMode: boolean;
  onTabChange: (tab: 'comments' | 'posts') => void;
  onCommentsViewToggle: (mode: 'analytics' | 'archive') => void;
  onPostsViewToggle: (mode: 'analytics' | 'archive') => void;
}

export const TabSwitcher: React.FC<TabSwitcherProps> = ({
  activeTab,
  hasUsername,
  isAnalyticsMode,
  isPostsAnalyticsMode,
  onTabChange,
  onCommentsViewToggle,
  onPostsViewToggle,
}) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <div className="flex space-x-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <button
          onClick={() => onTabChange('comments')}
          className={`flex items-center justify-center space-x-2 py-2 px-4 rounded-md transition-all duration-200 ${
            activeTab === 'comments' 
              ? 'bg-white dark:bg-gray-900 text-orange-500 shadow-sm' 
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span className="font-medium">Comments</span>
        </button>
        <button
          onClick={() => onTabChange('posts')}
          className={`flex items-center justify-center space-x-2 py-2 px-4 rounded-md transition-all duration-200 ${
            activeTab === 'posts' 
              ? 'bg-white dark:bg-gray-900 text-orange-500 shadow-sm' 
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span className="font-medium">Posts</span>
        </button>
      </div>

      {/* View Toggles */}
      <div className="flex space-x-2">
        {/* Comments View Toggle - Only show for comments tab when username exists */}
        {activeTab === 'comments' && hasUsername && (
          <>
            <button
              onClick={() => onCommentsViewToggle('analytics')}
              className={`px-4 py-2 rounded-md font-medium transition-all duration-200 ${
                isAnalyticsMode
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              Analytics View
            </button>
            <button
              onClick={() => onCommentsViewToggle('archive')}
              className={`px-4 py-2 rounded-md font-medium transition-all duration-200 ${
                !isAnalyticsMode
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              Archive View
            </button>
          </>
        )}

        {/* Posts View Toggle - Only show for posts tab when username exists */}
        {activeTab === 'posts' && hasUsername && (
          <>
            <button
              onClick={() => onPostsViewToggle('analytics')}
              className={`px-4 py-2 rounded-md font-medium transition-all duration-200 ${
                isPostsAnalyticsMode
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              Analytics View
            </button>
            <button
              onClick={() => onPostsViewToggle('archive')}
              className={`px-4 py-2 rounded-md font-medium transition-all duration-200 ${
                !isPostsAnalyticsMode
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              Archive View
            </button>
          </>
        )}
      </div>
    </div>
  );
};