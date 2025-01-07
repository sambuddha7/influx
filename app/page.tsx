
import { BackgroundLinesDemo } from "@/components/hero";

import { StickyScrollRevealDemo } from "@/components/StickyScroll";

import { HeroHighlightDemo } from "@/components/Heading";
import { TypewriterEffectSmoothDemo } from "@/components/ContactUs";

import { AppleCardsCarouselDemo } from "@/components/Test";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div>
        {/* hero section */}
        <BackgroundLinesDemo />

        {/* testimonials */}
        {/* <InfiniteMovingCardss /> */}
        <AppleCardsCarouselDemo />

        {/* tag line before features */}
        <HeroHighlightDemo />

        {/* features */}
        <StickyScrollRevealDemo />

        {/* last cta section */}
        <div className="h-[50rem] w-full dark:bg-black bg-white  dark:bg-dot-white/[0.2] bg-dot-black/[0.2] relative flex items-center justify-center">

            <div className="absolute pointer-events-none inset-0 flex items-center justify-center dark:bg-black bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
            <TypewriterEffectSmoothDemo />
            </div>
            <Footer />




    </div>
  );
}
