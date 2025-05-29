'use client';
import React from 'react';
import Link from 'next/link';

const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
  e.preventDefault();
  const href = e.currentTarget.href;
  const targetId = href.replace(/.*\#/, "");
  const elem = document.getElementById(targetId);
  elem?.scrollIntoView({
    behavior: "smooth"
  });
};

const Hero = () => {
  return (
    <section className="relative min-h-screen overflow-hidden bg-gradient-to-br dark:from-[#0a0a0a] dark:via-[#131313] dark:to-black from-gray-50 via-white to-gray-100">
      {/* Subtle glow background */}
      <div className="absolute inset-0 z-0">
        {/* Dark mode glow */}
        <div className="dark:block hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-2xl animate-pulse" />
          <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-orange-400/10 rounded-full blur-2xl animate-pulse delay-1000" />
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent via-black/10 to-black/30" />
        </div>

        {/* Light mode glow */}
        <div className="dark:hidden block">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-400/40 rounded-full blur-2xl animate-pulse" />
            <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-pink-400/40 rounded-full blur-2xl animate-pulse delay-1000" />
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent via-white/50 to-white/70" />
        </div>

      </div>

      {/* Optional grid texture */}
      <div className="absolute inset-0 z-5 opacity-5">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(0,0,0,0.05) 1px, transparent 0)`,
            backgroundSize: '50px 50px',
          }}
        />
      </div>

      {/* Centered Content */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center min-h-screen px-4">
        <h1 className="text-5xl md:text-8xl font-bold leading-tight text-gray-900 dark:text-white">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-pink-500 to-red-500">
            AI Agents <br />
          </span>{' '}
          for Reddit Marketing
        </h1>

        <p className="mt-6 max-w-2xl text-xl font-light text-gray-700 dark:text-gray-400">
          Automate Reddit engagement. Drive awareness, join conversations, and convert communities using AI agents.
        </p>

        <div className="mt-10 flex gap-4 flex-col sm:flex-row">
          <Link
            href="#waitlist"
            onClick={scrollToSection}
            className="px-8 py-4 rounded-xl bg-gradient-to-r from-orange-500 to-pink-500 text-white font-semibold hover:from-orange-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-2"
          >
            Early Access →
          </Link>
          <Link
            href="https://calendly.com/adityavjindal/30min?month=2025-05&date=2025-05-30"
            className="px-8 py-4 rounded-xl bg-black/10 dark:bg-white/10 border border-black/20 dark:border-white/20 text-black dark:text-white hover:bg-black/20 dark:hover:bg-white/20 transition-all duration-300 flex items-center justify-center gap-2"
          >
            Book Demo
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Hero;
