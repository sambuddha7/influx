"use client"
import React from "react";
import { BackgroundLines } from "@/components/ui/background-lines";
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
  e.preventDefault();
  const href = e.currentTarget.href;
  const targetId = href.replace(/.*\#/, "");
  const elem = document.getElementById(targetId);
  elem?.scrollIntoView({
    behavior: "smooth"
  });
};
export function BackgroundLinesDemo() {
  return (
    // <div className="flex h-screen flex-col md:flex-row md:overflow-hidden dark:bg-dot-white/[0.2] bg-dot-black/[0.2]">

    <div className="grid place-items-center h-screen flex h-screen flex-col md:flex-row md:overflow-hidden dark:bg-dot-white/[0.2] bg-dot-black/[0.2]">
    <BackgroundLines className="flex items-center justify-center w-full flex-col px-4">
      <h1 className="bg-clip-text text-transparent text-center bg-gradient-to-b from-neutral-900 to-neutral-700 dark:from-neutral-600 dark:to-white text-2xl md:text-4xl lg:text-7xl font-sans py-2 md:py-10 relative z-20 font-bold tracking-tight">
        <span style={{ color: '#FF5700' }}>Reddit</span> Marketing made simple .
      </h1>
      <p className="max-w-xl mx-auto text-sm md:text-lg text-neutral-700 dark:text-neutral-400 text-center">
      Discover the best posts to engage in and maintain your brand&apos;s authentic voice with every reply—at scale.
      </p>
      <button className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 m-10">
      {/* <a href="#waitlist" className="relative inline-flex h-12 overflow-hidden rounded-full p-[1px] focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50 mt-4">
            <span className="absolute inset-0 animate-spin bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]"></span>
            <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-slate-950 px-3 py-1 text-sm font-medium text-white backdrop-blur-3xl ">
                Join Waitlist
            </span>
        </a> */}
        <a href="#waitlist" onClick={scrollToSection} className="relative inline-flex overflow-hidden rounded-full p-[1px]  ">
        <span >
                Join Waitlist
            </span>
        </a>
        </button>
        


    </BackgroundLines>
    
    </div>
  );
}