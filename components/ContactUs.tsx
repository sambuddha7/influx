"use client";
import { TypewriterEffectSmooth } from "./ui/typewriter-effect";

export function TypewriterEffectSmoothDemo() {
  const words = [
    {
      text: "Reddit",
      className: "text-orange-500 dark:text-orange-500",
    },
    {
      text: "marketing",
    },
    {
      text: "made",
    },
    {
      text: "simple",
    }
  ];
  return (
    <div className="flex flex-col items-center justify-center h-[40rem]  ">
      {/* <p className="text-neutral-600 dark:text-neutral-200 text-xs sm:text-base  ">
        Not just some other ChatGPT wrapper
      </p> */}
      <TypewriterEffectSmooth words={words} />

      <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 space-x-0 md:space-x-4">
        {/* <button className="w-40 h-10 rounded-xl bg-black border dark:border-white border-transparent text-white text-sm">
          Join now
        </button> */}
        <button className="w-40 h-10 rounded-xl bg-white text-black border border-black  text-sm">
          <a href="mailto:sambuddha2019@gmail.com">Join Waitlist</a>
        </button>
      </div>
    </div>
  );
}
