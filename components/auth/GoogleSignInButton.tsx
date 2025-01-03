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
        
        router.replace('/changelog');
      }
    } catch (error) {
      console.error('Google sign in error:', error);
    }
  };


  return (
    <button
      onClick={signInWithGoogle}
      className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50"
    >
      <img 
        src="https://www.google.com/favicon.ico" 
        alt="Google logo" 
        className="w-4 h-4"
      />
      Continue with Google
    </button>
  );
}