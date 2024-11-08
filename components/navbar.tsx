import React from 'react';
import Link from 'next/link';
import Image from 'next/image';


const Navbar = () => {
  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto py-4 px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
        {/* <Image src="/logo.png" alt="Company Logo"
        className="hidden md:block" width="100" height="40"
        objectFit="contain" 
        /> */}
        <span className="text-3xl font-medium">Influx</span>

        </Link>
        <div className="space-x-4">
          <Link href="/about" className="text-gray-600 hover:text-gray-800">
            About
          </Link>
          <Link href="/services" className="text-gray-600 hover:text-gray-800">
            Services
          </Link>
          <Link href="/contact" className="text-gray-600 hover:text-gray-800">
            Contact
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
