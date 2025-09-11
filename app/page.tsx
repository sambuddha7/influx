import Script from 'next/script';
import Hero from "@/components/new_hero";
import Navbar from "@/components/navbar";
import Features from "@/components/features"
import WaitlistComponent  from "@/components/waitlist";
import FAQ from "@/components/faq"
import Footer from "@/components/Footer";
import { GlowingEffectDemo } from "@/components/use-cases";

export default function Home() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br dark:from-[#0a0a0a] dark:via-[#131313] dark:to-black from-gray-50 via-white to-gray-100">
      {/* Background gradient orbs with floating animation */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {/* Dark mode glow */}
        <div className="dark:block hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-float-1" />
          <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-orange-400/10 rounded-full blur-3xl animate-float-2" />
          <div className="absolute top-3/4 left-3/4 w-72 h-72 bg-pink-500/10 rounded-full blur-3xl animate-float-3" />
        </div>

        {/* Light mode glow */}
        <div className="dark:hidden block">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-400/20 rounded-full blur-3xl animate-float-1" />
          <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-pink-400/20 rounded-full blur-3xl animate-float-2" />
          <div className="absolute top-3/4 left-3/4 w-72 h-72 bg-orange-300/20 rounded-full blur-3xl animate-float-3" />
        </div>
      </div>

      <div className="relative z-10">
      {/* Google Analytics */}
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-08L2PKFTGY"
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-08L2PKFTGY');
        `}
      </Script>

      <Navbar />
        {/* hero section */}
        <Hero />

        {/* features */}
        <div id="features"> <Features /></div>
       

        {/* use cases */}
        <div id="use-cases">
          <GlowingEffectDemo />
        </div>

        

        
       
        <div id="faq"><FAQ /></div>

        {/* use cases */}
        

        
        {/* last cta section */}
        <div id="waitlist" className="h-[50rem] w-full relative flex items-center justify-center">
            <WaitlistComponent />
        </div>
            <Footer />  
      </div>
    </div>
  );
}