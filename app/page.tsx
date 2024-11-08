import Image from "next/image";

import { HeroHighlightDemo } from "@/components/heroinflux";
import { HeroScrollDemo } from "@/components/scroll";

export default function Home() {
  return (
    <div>

        <HeroScrollDemo />
        <HeroHighlightDemo />

    </div>
  );
}
