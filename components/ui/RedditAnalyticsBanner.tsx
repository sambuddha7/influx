import React, { useState } from 'react';
import { BarChart3, RefreshCw, Edit2, X, Check } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface RedditAnalyticsBannerProps {
  hasUsername: boolean;
  redditUsername: string;
  inputUsername: string;
  lastRoiUpdate: string;
  isSetupLoading: boolean;
  isUpdatingRoi: boolean;
  isAutoRefreshing?: boolean;
  onInputChange: (value: string) => void;
  onSetupUsername: () => void;
  onUpdateROI: () => void;
  onUsernameChange?: (newUsername: string) => void;
}

export const RedditAnalyticsBanner: React.FC<RedditAnalyticsBannerProps> = ({
  hasUsername,
  redditUsername,
  inputUsername,
  lastRoiUpdate,
  isSetupLoading,
  isUpdatingRoi,
  isAutoRefreshing = false,
  onInputChange,
  onSetupUsername,
  onUpdateROI,
  onUsernameChange,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editUsername, setEditUsername] = useState('');
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSetupUsername();
    }
  };

  const handleEditKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  const handleStartEdit = () => {
    setEditUsername(redditUsername);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditUsername('');
  };

  const handleSaveEdit = () => {
    if (editUsername.trim() && editUsername.trim() !== redditUsername && onUsernameChange) {
      onUsernameChange(editUsername.trim());
    }
    setIsEditing(false);
    setEditUsername('');
  };

  return (
    <div className="bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-lg p-4 border border-orange-200 dark:border-orange-700">
      {!hasUsername ? (
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-medium text-orange-900 dark:text-orange-100">Connect Reddit for Analytics</h3>
              <p className="text-sm text-orange-700 dark:text-orange-300">Track your comment performance and engagement</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <input
              type="text"
              placeholder="Reddit username"
              value={inputUsername}
              onChange={(e) => onInputChange(e.target.value)}
              className="px-3 py-2 rounded-md border border-orange-300 dark:border-orange-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
              onKeyPress={handleKeyPress}
            />
            <button
              onClick={onSetupUsername}
              disabled={!inputUsername.trim() || isSetupLoading}
              className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSetupLoading ? 'Connecting...' : 'Connect'}
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">{redditUsername.charAt(0).toUpperCase()}</span>
            </div>
            <div>
              {isEditing ? (
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-orange-900 dark:text-orange-100">u/</span>
                  <input
                    type="text"
                    value={editUsername}
                    onChange={(e) => setEditUsername(e.target.value)}
                    onKeyDown={handleEditKeyPress}
                    className="px-2 py-1 text-sm rounded border border-orange-300 dark:border-orange-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                    autoFocus
                  />
                  <div className="flex space-x-1">
                    <button
                      onClick={handleSaveEdit}
                      disabled={!editUsername.trim() || editUsername.trim() === redditUsername}
                      className="p-1 text-green-600 hover:text-green-700 disabled:text-gray-400"
                      title="Save changes"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="p-1 text-gray-500 hover:text-gray-700"
                      title="Cancel"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <h3 className="font-medium text-orange-900 dark:text-orange-100">u/{redditUsername}</h3>
                  {onUsernameChange && (
                    <button
                      onClick={handleStartEdit}
                      className="p-1 text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300"
                      title="Edit username"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              )}
              <p className="text-sm text-orange-700 dark:text-orange-300">
                {lastRoiUpdate ? `Last updated ${formatDistanceToNow(new Date(lastRoiUpdate))} ago` : 'Analytics connected'}
                {isAutoRefreshing && (
                  <span className="ml-2 text-orange-500">
                    <RefreshCw className="inline w-3 h-3 animate-spin" />
                    <span className="ml-1 text-xs">Auto-updating...</span>
                  </span>
                )}
              </p>
              <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                ✨ Auto-refreshes when switching views or returning to page
              </p>
            </div>
          </div>
          <button
            onClick={onUpdateROI}
            disabled={isUpdatingRoi}
            className="flex items-center space-x-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-md font-medium transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isUpdatingRoi ? 'animate-spin' : ''}`} />
            <span>{isUpdatingRoi ? 'Updating...' : 'Refresh'}</span>
          </button>
        </div>
      )}
    </div>
  );
};