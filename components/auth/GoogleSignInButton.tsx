'use client';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function GoogleSignInButton() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user) {
        const token = await result.user.getIdToken();
      
      // Set the token in a cookie
        document.cookie = `firebase-token=${token}; path=/`;
        
        router.replace('/onboarding');
      }
    } catch (error) {
      console.error('Google sign in error:', error);
    }
  };


  return (
    <button
      onClick={signInWithGoogle}
      className="w-full flex items-center justify-center gap-2 dark:bg-zinc-900 bg-white border dark:border-gray-800 border-gray-300 text-gray-700 dark:text-white px-4 py-2 rounded-md"
    >
      <img 
        src="https://cdn4.iconfinder.com/data/icons/new-google-logo-2015/400/new-google-favicon-512.png" 
        alt="Google logo" 
        className="w-4 h-4"
      />
      Continue with Google
    </button>
  );
}