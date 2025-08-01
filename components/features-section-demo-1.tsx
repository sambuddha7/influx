import React from "react";
import { useId } from "react";
import { SVGProps } from 'react';

interface GridPatternProps extends SVGProps<SVGSVGElement> {
  width: number;
  height: number;
  x?: number | string; // Allow both string and number
  y?: number | string; // Allow both string and number
  squares?: [number, number][]; // Array of tuples or undefined
}
export default function FeaturesSectionDemo1() {
  return (
    <div className="py-20 lg:py-40">
      <div className="px-8">
        <h4 className="text-3xl lg:text-5xl lg:leading-tight max-w-5xl mx-auto text-center tracking-tight font-medium text-black dark:text-white">
          And many more in the works
        </h4>

        <p className="text-sm lg:text-base  max-w-2xl  my-4 mx-auto text-neutral-500 text-center font-normal dark:text-neutral-300">
          {/* From Image generation to video generation, Everything AI has APIs for
          literally everything. It can even create this website copy for you. */}
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10 md:gap-2 max-w-7xl mx-auto">
        {grid.map((feature) => (
          <div
            key={feature.title}
            className="relative bg-gradient-to-b dark:from-neutral-900 from-neutral-100 dark:to-neutral-950 to-white p-6 rounded-3xl overflow-hidden"
          >
            <Grid size={20} />
            <p className="text-base font-bold text-neutral-800 dark:text-white relative z-20">
              {feature.title}
            </p>
            <p className="text-neutral-600 dark:text-neutral-400 mt-4 text-base font-normal relative z-20">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

const grid = [
  {
    title: "Human Refined AI",
    description:
      "Blend AI efficiency with human refinement to deliver authentic Reddit engagement that resonates with your audience.",
  },
  {
    title: "Automated marketing campaigns",
    description:
      "Automate advanced marketing campaigns with strategies such as Posts, AMAs and many more.",
  },
  {
    title: "Automated Reddit DMs",
    description:
      "Engage potential customers and generate leads with automated, personalized messages.",
  },
  {
    title: "Advanced Analytics",
    description:
      "Get sentiment analysis and track engagement for clear insights into your marketing campaigns.",
  },
  // {
  //   title: "Audience Targeting",
  //   description:
  //     "Reach the right audience with advanced targeting options, including demographics, interests, and behaviors.",
  // },
  // {
  //   title: "Social Listening",
  //   description:
  //     "Monitor social media conversations and trends to stay informed about what your audience is saying and respond in real-time.",
  // },
  // {
  //   title: "Customizable Templates",
  //   description:
  //     "Create stunning social media posts with our customizable templates, designed to fit your brand's unique style and voice.",
  // },
  // {
  //   title: "Collaboration Tools",
  //   description:
  //     "Work seamlessly with your team using our collaboration tools, allowing you to assign tasks, share drafts, and provide feedback in real-time.",
  // },
];

export const Grid = ({
  pattern,
  size,
}: {
  pattern?: number[][];
  size?: number;
}) => {
  const p = pattern ?? [
    [Math.floor(Math.random() * 4) + 7, Math.floor(Math.random() * 6) + 1],
    [Math.floor(Math.random() * 4) + 7, Math.floor(Math.random() * 6) + 1],
    [Math.floor(Math.random() * 4) + 7, Math.floor(Math.random() * 6) + 1],
    [Math.floor(Math.random() * 4) + 7, Math.floor(Math.random() * 6) + 1],
    [Math.floor(Math.random() * 4) + 7, Math.floor(Math.random() * 6) + 1],
  ];
  return (
    <div className="pointer-events-none absolute left-1/2 top-0  -ml-20 -mt-2 h-full w-full [mask-image:linear-gradient(white,transparent)]">
      <div className="absolute inset-0 bg-gradient-to-r  [mask-image:radial-gradient(farthest-side_at_top,white,transparent)] dark:from-zinc-900/30 from-zinc-100/30 to-zinc-300/30 dark:to-zinc-900/30 opacity-100">
        <GridPattern
          width={size ?? 20}
          height={size ?? 20}
          x="-12"
          y="4"
          squares={p as [number, number][]}
          className="absolute inset-0 h-full w-full  mix-blend-overlay dark:fill-white/10 dark:stroke-white/10 stroke-black/10 fill-black/10"
        />
      </div>
    </div>
  );
};

export function GridPattern({ width, height, x, y, squares, ...props }: GridPatternProps) {
  const patternId = useId();

  return (
    <svg aria-hidden="true" {...props}>
      <defs>
        <pattern
          id={patternId}
          width={width}
          height={height}
          patternUnits="userSpaceOnUse"
          x={x}
          y={y}
        >
          <path d={`M.5 ${height}V.5H${width}`} fill="none" />
        </pattern>
      </defs>
      <rect
        width="100%"
        height="100%"
        strokeWidth={0}
        fill={`url(#${patternId})`}
      />
      {squares && (
        <svg x={x} y={y} className="overflow-visible">
          {squares.map(([squareX, squareY]) => (
            <rect
              strokeWidth="0"
              key={`${squareX}-${squareY}`}
              width={width + 1}
              height={height + 1}
              x={squareX * width}
              y={squareY * height}
            />
          ))}
        </svg>
      )}
    </svg>
  );
}
