// app/login/page.tsx
import LoginForm from '@/components/auth/LoginForm';
import GoogleSignInButton from '@/components/auth/GoogleSignInButton';

import Link from 'next/link';

export default function LoginPage() {
  return (
<div className="min-h-screen flex items-center justify-center dark:bg-inherit">
      <div className="max-w-md w-full space-y-8 p-8 dark:bg-zinc-900 bg-white rounded-lg shadow">
        <h2 className="text-3xl font-bold text-center">Sign in to your account</h2>
        <LoginForm />
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 dark:bg-zinc-900 bg-white text-gray-500">Or continue with</span>
          </div>
        </div>
        <GoogleSignInButton />
        <p className="text-center mt-4">
          Don&#39;t have an account?{' '}
          <Link href="/signup" className="text-blue-500 hover:text-blue-600">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}