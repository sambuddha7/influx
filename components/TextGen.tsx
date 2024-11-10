"use client";
import { TextGenerateEffect } from "./ui/text-generate-effect";

const words = `With Influx, everything is on Autopilot.
`;

export function TextGenerateEffectDemo() {
  return <TextGenerateEffect words={words} />;
}
