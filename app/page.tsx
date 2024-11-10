import Image from "next/image";

import { BackgroundLinesDemo } from "@/components/hero";
import { InfiniteMovingCardss } from "@/components/Testimonials";
import { StickyScrollRevealDemo } from "@/components/StickyScroll";
import { TextGenerateEffectDemo } from "@/components/TextGen";
import { HeroHighlightDemo } from "@/components/Heading";

export default function Home() {
  return (
    <div>

        <BackgroundLinesDemo />
        <InfiniteMovingCardss />
        <HeroHighlightDemo />
        <StickyScrollRevealDemo />



    </div>
  );
}
