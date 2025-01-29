'use client';
import { signInWithPopup } from 'firebase/auth';
import { collection, query, where, getDocs, doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, googleProvider, db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function GoogleSignInButton() {
  const router = useRouter();
  const [error, setError] = useState('');

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      
      if (result.user) {
        const userDocRef = doc(db, 'track-replies', result.user.uid);
        const userDocSnapshot = await getDoc(userDocRef);
        const accountDetailsRef = doc(db, 'account-details', result.user.uid);
        const accountDetailsSnapshot = await getDoc(accountDetailsRef)
        
        // Check if the document already exists
        if (!userDocSnapshot.exists()) {
          await setDoc(userDocRef, {
            user_id: result.user.uid,
            replies: [], // Initialize with an empty array
            created_at: new Date().toISOString(),
            replies_left: 100
          });
        }
        if (!accountDetailsSnapshot.exists()) {
          await setDoc(accountDetailsRef, {
            dateAccountCreated: new Date().toISOString(),
            accountStatus: 'active', 
            userId: result.user.uid,
            email: result.user.email
          });
        }

        const email = result.user.email;
        if (!email) {
          setError('No email associated with Google account');
          return;
        }

        // Check waitlist
        const waitlistRef = collection(db, 'approved-waitlist');
        const q = query(waitlistRef, where('email', '==', email.toLowerCase().trim()));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          setError('This email is not on the waitlist. Request access first.');
          return;
        }

        const token = await result.user.getIdToken();
        document.cookie = `firebase-token=${token}; path=/`;
        
        router.replace('/onboarding');
      }
    } catch (error) {
      console.error('Google sign in error:', error);
      setError('Sign in failed. Please try again.');
    }
  };

  return (
    <>
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
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </>
  );
}