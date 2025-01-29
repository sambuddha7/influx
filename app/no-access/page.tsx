'use client';
import Link from 'next/link';

export default function SuspendedPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
            Account Suspended
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Your trial period has expired. Please contact support to continue using our services.
          </p>
        </div>
        
        <div className="mt-8">
          <Link
            href="mailto:sambuddha@tryinflux.io"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  );
}