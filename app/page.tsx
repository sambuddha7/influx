import Hero from "@/components/new_hero";
import Navbar from "@/components/navbar";
import Features from "@/components/features"
import WaitlistComponent  from "@/components/waitlist";
import FAQ from "@/components/faq"
import Footer from "@/components/Footer";
import { GlowingEffectDemo } from "@/components/use-cases";

export default function Home() {
  return (
    <div>
      <Navbar />
        {/* hero section */}
        <Hero />

        {/* features */}
        <div id="features"> <Features /></div>
       

        {/* use cases */}
        <div id="use-cases" className="m-12 bg-white dark:bg-black">
          <GlowingEffectDemo />
        </div>

        

        
       
        <div id="faq"><FAQ /></div>

        {/* use cases */}
        

        
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
