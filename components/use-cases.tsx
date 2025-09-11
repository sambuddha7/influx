"use client";

import { Search, MessageSquare, TrendingUp, LineChart, Eye } from "lucide-react";
import { GlowingEffect } from "@/components/ui/glowing-effect";

export function GlowingEffectDemo() {
  return (
    <section className="relative min-h-screen overflow-hidden bg-gradient-to-br dark:from-[#0a0a0a] dark:via-[#131313] dark:to-black from-gray-50 via-white to-gray-100 py-20 px-6 sm:px-12">
      {/* Background gradient orbs */}
      <div className="absolute inset-0 z-0">
        {/* Dark mode glow */}
        <div className="dark:block hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-orange-400/10 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        {/* Light mode glow */}
        <div className="dark:hidden block">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-400/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-pink-400/20 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>
      </div>

      {/* Main Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto p-8 lg:p-12">
        <ul className="grid grid-cols-1 grid-rows-none gap-4 md:grid-cols-12 md:grid-rows-3 lg:gap-4 xl:max-h-[34rem] xl:grid-rows-2">
          <GridItem
            area="md:[grid-area:1/1/2/7] xl:[grid-area:1/1/2/5]"
            icon={<Search className="h-4 w-4 text-black dark:text-neutral-400" />}
            title="Boosted SEO"
            description="We help you rank higher in SEO and show up in LLM searches by creating high-performing Reddit posts."
          />

          <GridItem
            area="md:[grid-area:1/7/2/13] xl:[grid-area:2/1/3/5]"
            icon={<MessageSquare className="h-4 w-4 text-black dark:text-neutral-400" />}
            title="Lead Gen That Isn't Spammy"
            description="We find threads where people are asking for help so you can respond with value and skip cold DMs."
          />

          <GridItem
            area="md:[grid-area:2/1/3/7] xl:[grid-area:1/5/3/8]"
            icon={<TrendingUp className="h-4 w-4 text-black dark:text-neutral-400" />}
            title="Be Seen Where It Matters"
            description="Jump into high-traffic conversations with smart, on-brand replies. Earn awareness without ads."
          />

          <GridItem
            area="md:[grid-area:2/7/3/13] xl:[grid-area:1/8/2/13]"
            icon={<LineChart className="h-4 w-4 text-black dark:text-neutral-400" />}
            title="Trends Before They Trend"
            description="Track rising topics, pain points, and sentiment in real time—straight from the frontlines of Reddit."
          />

          <GridItem
            area="md:[grid-area:3/1/4/13] xl:[grid-area:2/8/3/13]"
            icon={<Eye className="h-4 w-4 text-black dark:text-neutral-400" />}
            title="Know What Your Audience Thinks"
            description="See what your users care about, complain about, or ask about—then shape your roadmap around it."
          />
        </ul>
      </div>
    </section>
  );
}


interface GridItemProps {
  area: string;
  icon: React.ReactNode;
  title: string;
  description: React.ReactNode;
}

const GridItem = ({ area, icon, title, description }: GridItemProps) => {
  return (
    <li className={`min-h-[14rem] list-none ${area}`}>
      <div className="relative h-full rounded-2xl border p-2 md:rounded-3xl md:p-3">
        <GlowingEffect
          spread={40}
          glow={true}
          disabled={false}
          proximity={64}
          inactiveZone={0.01}
        />
        <div className="border-0.75 relative flex h-full flex-col justify-between gap-6 overflow-hidden rounded-xl p-6 md:p-6 dark:shadow-[0px_0px_27px_0px_#2D2D2D]">
          <div className="relative flex flex-1 flex-col justify-between gap-3">
            <div className="w-fit rounded-lg border border-gray-600 p-2">
              {icon}
            </div>
            <div className="space-y-3">
              <h3 className="-tracking-4 pt-0.5 font-sans text-xl/[1.375rem] font-semibold text-balance text-black md:text-2xl/[1.875rem] dark:text-white">
                {title}
              </h3>
              <h2 className="font-sans text-sm/[1.125rem] text-black md:text-base/[1.375rem] dark:text-neutral-400 [&_b]:md:font-semibold [&_strong]:md:font-semibold">
                {description}
              </h2>
            </div>
          </div>
        </div>
      </div>
    </li>
  );
};
