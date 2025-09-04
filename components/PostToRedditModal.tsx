'use client';
import React, { useState } from 'react';
import { Copy, ExternalLink } from 'lucide-react';

interface PostToRedditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPostConfirmed: () => void;
  onPostNotMade: () => void;
  generatedPost: {
    title: string;
    body: string;
    subreddit: string;
  };
}

const PostToRedditModal: React.FC<PostToRedditModalProps> = ({
  isOpen,
  onClose,
  onPostConfirmed,
  onPostNotMade,
  generatedPost
}) => {
  const [copiedTitle, setCopiedTitle] = useState(false);
  const [copiedBody, setCopiedBody] = useState(false);

  const copyToClipboard = async (text: string, type: 'title' | 'body') => {
    try {
      await navigator.clipboard.writeText(text);
      
      if (type === 'title') {
        setCopiedTitle(true);
        setTimeout(() => setCopiedTitle(false), 2000);
      } else {
        setCopiedBody(true);
        setTimeout(() => setCopiedBody(false), 2000);
      }
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleGoToReddit = () => {
    const redditUrl = `https://www.reddit.com/r/${generatedPost.subreddit}/submit`;
    window.open(redditUrl, '_blank');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-gray-900 rounded-xl p-6 w-full max-w-lg shadow-2xl border border-gray-800 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-white">Ready to Post to Reddit</h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-orange-500 transition-colors"
          >
            <span className="text-xl">✕</span>
          </button>
        </div>
        
        {/* Instructions */}
        <div className="mb-6 space-y-4">
          <p className="text-gray-300 text-sm">
            Follow these steps to post your content to r/{generatedPost.subreddit}:
          </p>
          
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <span className="bg-orange-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold">1</span>
              <span>Copy the title below</span>
            </div>
            
            <div className="bg-gray-800 p-3 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-medium text-gray-400">POST TITLE</span>
                <button
                  onClick={() => copyToClipboard(generatedPost.title, 'title')}
                  className="flex items-center px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs text-gray-300 transition-colors"
                >
                  <Copy className="w-3 h-3 mr-1" />
                  {copiedTitle ? 'Copied!' : 'Copy Title'}
                </button>
              </div>
              <p className="text-white text-sm">{generatedPost.title}</p>
            </div>
            
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <span className="bg-orange-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold">2</span>
              <span>Copy the post content below</span>
            </div>
            
            <div className="bg-gray-800 p-3 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-medium text-gray-400">POST CONTENT</span>
                <button
                  onClick={() => copyToClipboard(generatedPost.body, 'body')}
                  className="flex items-center px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs text-gray-300 transition-colors"
                >
                  <Copy className="w-3 h-3 mr-1" />
                  {copiedBody ? 'Copied!' : 'Copy Content'}
                </button>
              </div>
              <div className="text-white text-sm max-h-32 overflow-y-auto whitespace-pre-wrap">
                {generatedPost.body}
              </div>
            </div>
            
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <span className="bg-orange-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold">3</span>
              <span>Click "Go to Reddit" to open the submission page</span>
            </div>
            
            <button
              onClick={handleGoToReddit}
              className="w-full flex items-center justify-center px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-500 transition-all font-medium"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Go to Reddit
            </button>
            
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <span className="bg-orange-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold">4</span>
              <span>Paste your title and content on Reddit, then submit</span>
            </div>
          </div>
        </div>
        
        {/* Confirmation Section */}
        <div className="border-t border-gray-700 pt-6">
          <h4 className="text-lg font-medium text-white mb-3">Did you make that post?</h4>
          <p className="text-gray-300 text-sm mb-4">
            If you posted your content, click "Yes" to track it in your analytics. 
            This helps us measure your Reddit marketing performance.
          </p>
          
          <div className="flex gap-3">
            <button 
              onClick={onPostConfirmed}
              className="flex-1 px-4 py-3 bg-orange-600 text-white rounded-md hover:bg-orange-500 shadow-lg shadow-orange-900/20 transition-all font-medium"
            >
              Yes, I posted it
            </button>
            <button 
              onClick={onPostNotMade}
              className="flex-1 px-4 py-3 bg-gray-600 text-white rounded-md hover:bg-gray-500 transition-all font-medium"
            >
              No, I didn't post
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostToRedditModal;