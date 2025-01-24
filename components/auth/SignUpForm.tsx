'use client';
import { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

export default function SignUpForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const waitlistRef = collection(db, 'approved-waitlist');
      const q = query(waitlistRef, where('email', '==', email.toLowerCase().trim()));
      const querySnapshot = await getDocs(q);


      if (querySnapshot.empty) {
        setError('This email is not on the waitlist. Request access first.');
        return;
      }

      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      if (result.user) {
        const token = await result.user.getIdToken();
        document.cookie = `firebase-token=${token}; path=/`;
        router.replace('/onboarding');
      }
    } catch (err) {
      console.error('Full error:', err);    
      setError('Account creation failed. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
          required
        />
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <button
        type="submit"
        className="w-full bg-orange-500 text-white py-2 px-4 rounded-md hover:bg-orange-600"
      >
        Create Account
      </button>
    </form>
  );
}