
import { BackgroundLinesDemo } from "@/components/hero";


import WaitlistComponent  from "@/components/waitlist";


import FeaturesSectionDemo from "@/components/features-section-demo-3";
import FeaturesSectionDemo1 from "@/components/features-section-demo-1";
import { WobbleCardDemo } from "@/components/why-reddit";

import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div>
        {/* hero section */}
        <BackgroundLinesDemo />



        {/* features */}

        <FeaturesSectionDemo />
        <FeaturesSectionDemo1 />

        {/* why reddit */}
        <h2 className="bg-clip-text text-transparent text-center bg-gradient-to-b from-neutral-900 to-neutral-700 dark:from-neutral-600 dark:to-white text-2xl md:text-4xl lg:text-7xl font-sans py-2 md:py-10 relative z-20 font-bold tracking-tight">
        The Power of <span style={{ color: '#FF5700' }}>Reddit</span> 
      </h2>
        <WobbleCardDemo />
        {/* last cta section */}
        <div id="waitlist" className="h-[50rem] w-full dark:bg-black bg-white  dark:bg-dot-white/[0.2] bg-dot-black/[0.2] relative flex items-center justify-center">
            <WaitlistComponent />
            {/* <div className="absolute pointer-events-none inset-0 flex items-center justify-center dark:bg-black bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
            <TypewriterEffectSmoothDemo /> */}
        </div>
            <Footer />  
    </div>
  );
}
