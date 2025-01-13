// app/components/WaitlistForm.tsx
'use client';

import { useState } from 'react';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import { getApp } from 'firebase/app';

type FormStatus = 'idle' | 'loading' | 'success' | 'error';

export default function WaitlistForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<FormStatus>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('loading');
    setMessage('');

    try {
      // Initialize Firestore
      const app = getApp(); // Assumes Firebase has already been initialized
      const db = getFirestore(app);

      // Add email to the "waitlist" collection
      await addDoc(collection(db, 'waitlist'), {
        email,
        timestamp: new Date().toISOString(),
      });

      setStatus('success');
      setMessage("You're on the list! We'll notify you when we launch.");
      setEmail('');
    } catch (error) {
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'Something went wrong. Please try again.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 text-center">
      <h2 className="text-4xl font-bold mb-4">Join the Waitlist</h2>

      <div className="space-y-4 mb-8">
        <p className="text-xl">Get early access to our platform and exclusive benefits:</p>
        <ul className="text-left space-y-2 mx-auto max-w-md">
          <li className="flex items-center gap-2">
            <CheckCircle2 className="text-green-500 h-5 w-5" />
            <span>Priority access when we launch</span>
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="text-green-500 h-5 w-5" />
            <span>Special founding member benefits</span>
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="text-green-500 h-5 w-5" />
            <span>Exclusive updates and announcements</span>
          </li>
        </ul>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto">
        <div className="flex gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address"
            required
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {status === 'loading' ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              'Join Waitlist'
            )}
          </button>
        </div>

        {/* Status messages */}
        {status !== 'idle' && (
          <div
            className={`mt-4 p-4 rounded-lg ${
              status === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
            }`}
          >
            <div className="flex items-center gap-2">
              <AlertCircle
                className={`h-5 w-5 ${status === 'success' ? 'text-green-600' : 'text-red-600'}`}
              />
              <p className="text-sm">{message}</p>
            </div>
          </div>
        )}
      </form>

      {/* <p className="mt-4 text-sm text-gray-600">
        Join {Math.floor(Math.random() * 500 + 1000)} others already on the waitlist!
      </p> */}
    </div>
  );
}
