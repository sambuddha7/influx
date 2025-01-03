// components/auth/LogoutButton.tsx
'use client';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      // Clear the firebase token cookie
      document.cookie = 'firebase-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
      router.replace('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors"
    >
      Log Out
    </button>
  );
}