"use client";
import React from "react";
import { StickyScroll } from "./ui/sticky-scroll-reveal";
const content = [
  {
    title: "We find the right audience",
    description:
      "Our platform targets Reddit’s niche communities, connecting you directly with audiences aligned with your brand. By reaching those most likely to engage, we help build stronger loyalty and maximize your return on investment.",
    content: (
      <div className="h-full w-full bg-[linear-gradient(to_bottom_right,var(--cyan-500),var(--emerald-500))] flex items-center justify-center text-white">
        We find the right audience
      </div>
    ),
  },
  {
    title: "We build genuine relations",
    description:
      "Our AI technology is purpose-built to deliver context-aware responses and insightful comments that foster authentic connections—going beyond standard AI to create a truly human-like experience elevating your reddit engagement.",
    content: (
      <div className="h-full w-full  flex items-center justify-center text-white">
        We build genuine relations
      </div>
    ),
  },
  {
    title: "Automation that drives growth and traction",
    description:
      "Automate AMAs, generate post suggestions, and deliver value-driven content on Reddit with a proven marketing strategy that drives authentic engagement and measurable success",
    content: (
      <div className="h-full w-full bg-[linear-gradient(to_bottom_right,var(--cyan-500),var(--emerald-500))] flex items-center justify-center text-white">
        Automation that drives growth and traction
      </div>
    ),
  },
];
export function StickyScrollRevealDemo() {
  return (

    <div className="p-10">
      <StickyScroll content={content} />
    </div>

  );
}
