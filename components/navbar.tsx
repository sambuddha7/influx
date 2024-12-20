import React from 'react';

import ThemeSwitch from './ThemeSwitch';
import Link from 'next/link';
import Image from 'next/image';


const Navbar = () => {
  return (
    // <nav className="bg-inherit shadow-sm sticky top-0 z-50">
    //   <div className="container mx-auto py-4 px-6 flex items-center justify-between">
    //     <Link href="/" className="flex items-center space-x-2">
    //     {/* <Image src="/logo.png" alt="Company Logo"
    //     className="hidden md:block" width="100" height="40"
    //     objectFit="contain" 
    //     /> */}
    //     <span className="text-3xl font-medium">Influx</span>

    //     </Link>
        
    //     <div className="space-x-4">
    //       <ThemeSwitch />
    //       <Link href="/contact" className='text-lg'>
    //         Contact
    //       </Link>
    //     </div>
    //   </div>
    // </nav>



    <div className="navbar bg-base-100 shadow-sm sticky top-0 z-50 bg-inherit">
<div className="flex-none">

        <Image src="/new_logo.png" width={36} height={36} alt="company logo"></Image>

    </div>
  <div className="flex-1">
    <Link href="/"className="btn btn-ghost text-3xl">Influx</Link>
  </div>
  <div className="flex-none">
    <button className="btn btn-square btn-ghost">
    <ThemeSwitch />
    </button>
  </div>
</div>
  // <div className="navbar bg-base-100">
    
  //   <div className="flex-1">
  //     <Link href="/"className="btn btn-ghost text-3xl">Influx</Link>
  //   </div>
  //   <div className="flex-none">
  //    <button className="btn btn-square btn-ghost">
  //    <ThemeSwitch />
  //    </button>
  //  </div>
  // </div>
  );
};

export default Navbar;
