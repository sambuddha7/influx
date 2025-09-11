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
    <div>
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
  );
}