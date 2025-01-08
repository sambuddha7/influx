// components/Loading.tsx
import React from 'react';

interface LoadingProps {
  loadingMessage?: string;
}

const Loading: React.FC<LoadingProps> = ({ loadingMessage = "Just a moment, we're getting things ready for you!" }) => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-inherit">
      <div className="flex flex-col items-center space-y-4">
        {/* Rotating Square Loader */}
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 bg-orange-500 animate-spin rounded-md"></div>
          </div>
        </div>
        {/* Message */}
        <p className="dark:text-gray-300 text-black font-medium text-lg">{loadingMessage}</p>
      </div>
    </div>
  );
};

export default Loading;
