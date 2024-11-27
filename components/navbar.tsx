
import React from 'react';

import ThemeSwitch from './ThemeSwitch';
import Link from 'next/link';
import Image from 'next/image';


const Navbar = () => {
  return (
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

  );
};

export default Navbar;
