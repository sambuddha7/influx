'use client';
import { useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword, 
  sendEmailVerification, 
  onAuthStateChanged,
  User 
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

export default function SignUpForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [verificationSent, setVerificationSent] = useState(false);
  const router = useRouter();

  // Add effect to check for email verification with proper typing
  useEffect(() => {
    if (verificationSent) {
      const unsubscribe = onAuthStateChanged(auth, (user: User | null) => {
        if (user?.emailVerified) {
          router.push('/onboarding');
        }
      });

      return () => unsubscribe();
    }
  }, [verificationSent, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Create the user account
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Send verification email
      await sendEmailVerification(userCredential.user, {
        url: `http://localhost:3000/onboarding`, // URL to redirect to after email verification
        handleCodeInApp: true,
      });
      
      setVerificationSent(true);
      setError('');
      
      // Don't redirect yet - wait for email verification
    } catch (err: any) {
      if (err?.code === 'auth/email-already-in-use') {
        setError('This email is already registered.');
      } else if (err?.code === 'auth/weak-password') {
        setError('Password should be at least 6 characters long.');
      } else {
        setError('Failed to create account. Please try again.');
      }
    }
  };

  // Function to check verification status manually
  const checkVerification = async () => {
    if (auth.currentUser) {
      // Reload the user to get the latest emailVerified status
      await auth.currentUser.reload();
      if (auth.currentUser.emailVerified) {
        router.push('/onboarding');
      } else {
        setError('Email not verified yet. Please check your inbox and click the verification link.');
      }
    }
  };

  if (verificationSent) {
    return (
      <div className="text-center space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">Verify Your Email</h2>
        <p className="text-gray-600">
          We've sent a verification email to <span className="font-medium">{email}</span>.
          Please check your inbox and click the verification link to complete your registration.
        </p>
        <div className="space-y-2">
          <p className="text-sm text-gray-500">
            Don't see the email? Check your spam folder or{' '}
            <button
              onClick={() => {
                if (auth.currentUser) {
                  sendEmailVerification(auth.currentUser);
                }
              }}
              className="text-orange-500 hover:text-orange-600 underline"
            >
              click here to resend
            </button>
          </p>
          <button
            onClick={checkVerification}
            className="text-sm text-orange-500 hover:text-orange-600 underline"
          >
            I've verified my email. Continue to onboarding →
          </button>
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
      </div>
    );
  }

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