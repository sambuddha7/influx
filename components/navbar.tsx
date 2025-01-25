'use client';
import React from 'react';
import ThemeSwitch from './ThemeSwitch';
import Link from 'next/link';
import Image from 'next/image';
import { auth } from '@/lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';

const Navbar = () => {
  const [user] = useAuthState(auth);
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      document.cookie = 'firebase-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
      router.replace('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="navbar bg-base-100 shadow-sm sticky top-0 z-50 bg-inherit">
      <div className="flex-none">
        <Image src="/new_logo.png" width={36} height={36} alt="company logo" />
      </div>
      <div className="flex-1">
        <Link href="/" className="btn btn-ghost text-3xl">Influx</Link>
      </div>
      <div className="flex-none gap-2">
        {/* {user ? (
          <></>
        ) : (
          <>
            <Link href="/login" className="btn btn-ghost">
              Sign In
            </Link>
            <Link href="/signup" className="btn btn-error">
              Sign Up
            </Link>
          </>
        )} */}
        <button className="btn btn-square btn-ghost">
          <ThemeSwitch />
        </button>
      </div>
    </div>
  );
};

export default Navbar;