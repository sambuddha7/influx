'use client';
import React, { useState } from 'react';
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
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => setMenuOpen(!menuOpen);

  return (
    <div className="navbar shadow-sm sticky top-0 z-50 bg-[rgba(255,255,255,0.7)] dark:bg-[rgba(0,0,0,0.7)] backdrop-blur-md px-4">
      <div className="flex-none">
        <Image src="/new_logo.png" width={36} height={36} alt="company logo" />
      </div>
      <div className="flex-1">
        <Link href="/" className="btn btn-ghost text-3xl font-bold">Influx</Link>
      </div>

      {/* Desktop Links */}
      <div className="hidden md:flex gap-4 items-center">
        <Link href="/#features" className="text-sm md:text-base font-normal hover:text-orange-500">Features</Link>
        <Link href="/#use-cases" className="text-sm md:text-base font-normal hover:text-orange-500">Use cases</Link>
        <Link href="/#faq" className="text-sm md:text-base font-normal hover:text-orange-500">FAQ</Link>
        <Link href="/tips" className="text-base font-normal hover:text-orange-500" onClick={toggleMenu}>Tips</Link>
        <Link href="/#waitlist" className="text-sm md:text-base font-normal hover:text-orange-500">Join Waitlist</Link>
        <Link
          href="https://calendly.com/adityavjindal/30min?month=2025-05&date=2025-05-30"
          className="px-4 py-2 rounded-xl text-white font-normal text-sm md:text-base shadow-md bg-gradient-to-r from-orange-500 to-pink-500 hover:from-pink-500 hover:to-orange-500 transition-all duration-300"
        >
          Book Demo
        </Link>
        <ThemeSwitch />
      </div>

      {/* Mobile Menu Button */}
      <div className="md:hidden flex items-center">
        <button onClick={toggleMenu} className="btn btn-ghost text-xl">
          ☰
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {menuOpen && (
        <div className="absolute top-full left-0 w-full bg-white dark:bg-black px-4 py-3 flex flex-col gap-2 md:hidden shadow-md z-40">
          <Link href="#features" className="text-base font-normal hover:text-orange-500" onClick={toggleMenu}>Features</Link>
          <Link href="#why" className="text-base font-normal hover:text-orange-500" onClick={toggleMenu}>Why Reddit</Link>
          <Link href="#faq" className="text-base font-normal hover:text-orange-500" onClick={toggleMenu}>FAQ</Link>
          <Link href="#waitlist" className="text-base font-normal hover:text-orange-500" onClick={toggleMenu}>Join Waitlist</Link>
          <Link
            href="https://calendly.com/adityavjindal/30min?month=2025-05&date=2025-05-30"
            className="px-4 py-2 rounded-xl text-white font-normal text-base shadow-md bg-gradient-to-r from-orange-500 to-pink-500 hover:from-pink-500 hover:to-orange-500 transition-all duration-300"
            onClick={toggleMenu}
          >
            Book Demo
          </Link>
          <ThemeSwitch />
        </div>
      )}
    </div>
  );
};

export default Navbar;
