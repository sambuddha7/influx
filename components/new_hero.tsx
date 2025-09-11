'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { MessageCircle, Share2, TrendingUp, Heart, Users, Zap, Target, BarChart3, ArrowUp, Sparkles, Bot, Globe } from 'lucide-react';

const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
  e.preventDefault();
  const href = e.currentTarget.href;
  const targetId = href.replace(/.*\#/, "");
  const elem = document.getElementById(targetId);
  elem?.scrollIntoView({
    behavior: "smooth"
  });
};

// Animated text component
const AnimatedWord = ({ word, delay }: { word: string; delay: number }) => {
  return (
    <span 
      className="inline-block opacity-0"
      style={{
        animation: `wordFadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s forwards`
      }}
    >
      {word}
    </span>
  );
};

// Orbital Animation Component
const OrbitalIcons = () => {
  const icons = [
    { Icon: MessageCircle, angle: 0, radius: 180, duration: 20 },
    { Icon: ArrowUp, angle: 60, radius: 180, duration: 20 },
    { Icon: Heart, angle: 120, radius: 180, duration: 20 },
    { Icon: TrendingUp, angle: 180, radius: 180, duration: 20 },
    { Icon: Users, angle: 240, radius: 180, duration: 20 },
    { Icon: Share2, angle: 300, radius: 180, duration: 20 },
  ];

  return (
    <div className="relative w-[500px] h-[500px] flex items-center justify-center">
      {/* Central sun/core */}
      <div className="relative w-20 h-20 animate-[gentleBounce_3s_ease-in-out_infinite]">

        {/* Glass lens */}
        <div className="relative w-20 h-20">
          {/* Outer ring */}
          <div className="absolute inset-0 rounded-full border-4 border-orange-500 dark:border-orange-400 shadow-xl"></div>
          
          {/* Glass effect with gradient */}
          <div className="absolute inset-1 rounded-full bg-gradient-to-br from-orange-50/20 to-orange-100/20 dark:from-orange-900/20 dark:to-orange-800/20 backdrop-blur-sm"></div>
          
          {/* Shine effect */}
          <div className="absolute top-2 left-2 w-4 h-4 bg-white/40 rounded-full blur-sm"></div>
          
          {/* Scanning animation */}
          <div className="absolute inset-2 rounded-full overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-orange-400/30 to-transparent -translate-x-full animate-[shimmer_2s_ease-in-out_infinite]"></div>
          </div>
          
          {/* Handle */}
          <div className="absolute -bottom-8 -right-8 w-12 h-12 origin-top-left rotate-45">
            <div className="w-full h-3 bg-gradient-to-r from-orange-500 to-orange-600 dark:from-orange-400 dark:to-orange-500 rounded-full shadow-lg"></div>
          </div>
        </div>
      </div>

      {/* Orbit circle */}
      <div className="absolute w-[360px] h-[360px] rounded-full border-2 border-dashed border-gray-300/30 dark:border-gray-700/30"></div>

      {/* Orbiting icons */}
      {icons.map(({ Icon, angle, radius, duration }, index) => (
        <div
          key={index}
          className="absolute w-full h-full flex items-center justify-center"
          style={{
            animation: `orbit ${duration}s linear infinite`,
            animationDelay: `${index * 0.2}s`,
          }}
        >
          <div
            className="absolute"
            style={{
              transform: `rotate(${angle}deg) translateX(${radius}px) rotate(-${angle}deg)`,
            }}
          >
            <div className="w-14 h-14 rounded-full border-2 border-orange-400/50 bg-white dark:bg-gray-900 backdrop-blur-sm shadow-xl flex items-center justify-center group hover:scale-110 hover:border-orange-500 transition-all duration-300"
              style={{
                animation: `counterRotate ${duration}s linear infinite`,
                animationDelay: `${index * 0.2}s`,
              }}
            >
              <Icon className="w-7 h-7 text-orange-500 dark:text-orange-400" />
            </div>
          </div>
        </div>
      ))}

      {/* Additional decorative elements */}
      <div className="absolute inset-0 animate-spin-slow">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-orange-400 rounded-full opacity-60"></div>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-pink-400 rounded-full opacity-60"></div>
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-purple-400 rounded-full opacity-60"></div>
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-blue-400 rounded-full opacity-60"></div>
      </div>
    </div>
  );
};

// Animated counter component
const AnimatedCounter = ({ value, suffix = '', duration = 2000 }: { value: number; suffix?: string; duration?: number }) => {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isVisible) return;
    
    let startTime: number;
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      setCount(Math.floor(value * progress));
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }, [value, duration, isVisible]);

  return <span>{count}{suffix}</span>;
};

const Hero = () => {
  return (
    <>
      <style jsx global>{`
        @keyframes wordFadeUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes gentleFloat {
          0%, 100% {
            transform: translateY(0) rotate(-5deg);
          }
          50% {
            transform: translateY(-10px) rotate(5deg);
          }
        }

        @keyframes shimmerDiagonal {
          0% {
            transform: translateX(-100%) translateY(-100%);
          }
          100% {
            transform: translateX(100%) translateY(100%);
          }
        }

        @keyframes focusRing {
          0%, 100% {
            transform: scale(1);
            opacity: 0.3;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.6;
          }
        }

        @keyframes scanParticle1 {
          0%, 100% {
            transform: translate(0, 0) scale(0);
            opacity: 0;
          }
          50% {
            transform: translate(30px, -30px) scale(1);
            opacity: 1;
          }
        }

        @keyframes scanParticle2 {
          0%, 100% {
            transform: translate(0, 0) scale(0);
            opacity: 0;
          }
          50% {
            transform: translate(-35px, 25px) scale(1);
            opacity: 1;
          }
        }

        @keyframes scanParticle3 {
          0%, 100% {
            transform: translate(0, 0) scale(0);
            opacity: 0;
          }
          50% {
            transform: translate(25px, 35px) scale(1);
            opacity: 1;
          }
        }

        @keyframes orbit {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes counterRotate {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(-360deg);
          }
        }

        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .animate-spin-slow {
          animation: spin-slow 30s linear infinite;
        }

        @keyframes gradient-shift {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        @keyframes pulse-ring {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.3);
            opacity: 0;
          }
          100% {
            transform: scale(1.3);
            opacity: 0;
          }
        }

        .animate-gradient-shift {
          background-size: 200% 200%;
          animation: gradient-shift 8s ease infinite;
        }

        .glass-morphism {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }

        .shimmer {
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(255, 255, 255, 0.2) 50%,
            transparent 100%
          );
          background-size: 200% 100%;
          animation: shimmer 3s linear infinite;
        }
          @keyframes gentleBounce {
            0%, 100% {
              transform: translateY(0) rotate(0deg) scale(1);
            }
            25% {
              transform: translateY(-5px) rotate(-5deg) scale(1.05);
            }
            50% {
              transform: translateY(0) rotate(0deg) scale(1.1);
            }
            75% {
              transform: translateY(-3px) rotate(5deg) scale(1.05);
            }
          }
      `}</style>

      <section className="relative min-h-screen overflow-hidden">

        {/* Main Content Container */}
        <div className="relative z-10 container mx-auto  min-h-screen flex items-center">
          <div className="w-full max-w-7xl mx-auto p-8 lg:p-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            
            {/* Left Content */}
            <div className="text-center lg:text-left">
              
              {/* Animated Badge */}
              <div className="mb-6 opacity-0" style={{ animation: 'wordFadeUp 0.8s ease-out 0.2s forwards' }}>
                <div className="relative inline-flex items-center gap-2 px-4 py-2 rounded-full glass-morphism border border-orange-200/50 dark:border-orange-800/30 overflow-hidden group">
                  <div className="absolute inset-0 shimmer opacity-50"></div>
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                  </span>
                  <span className="relative text-sm font-medium text-orange-700 dark:text-orange-300">
                    Trusted by 50+ Marketing Teams
                  </span>
                </div>
              </div>

              {/* Animated Title */}
              <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight text-gray-900 dark:text-white">
                <div className="space-x-2">
                  <AnimatedWord word="AI" delay={0.3} />
                  <AnimatedWord word="Copilot" delay={0.4} />
                  <AnimatedWord word="for" delay={0.5} />
                </div>
                <div className="mt-2">
                  <span 
                    className="text-transparent bg-clip-text animate-gradient-shift bg-gradient-to-r from-orange-400 via-pink-500 to-red-500 opacity-0"
                    style={{ 
                      backgroundSize: '200% 200%',
                      animation: 'wordFadeUp 0.8s ease-out 0.7s forwards, gradient-shift 8s ease infinite 1s' 
                    }}
                  >
                    Reddit Marketing
                  </span>
                </div>
              </h1>

              {/* Animated Description */}
              <p 
                className="mt-8 max-w-xl text-lg md:text-xl font-light text-gray-600 dark:text-gray-400 leading-relaxed opacity-0"
                style={{ animation: 'wordFadeUp 0.8s ease-out 0.9s forwards' }}
              >
                Turn Reddit mentions into traffic and customers. 
                Automate engagement, join conversations, and convert communities.
              </p>

              {/* Animated Stats */}
              <div 
                className="mt-8 flex gap-8 items-center opacity-0"
                style={{ animation: 'wordFadeUp 0.8s ease-out 1.1s forwards' }}
              >
                <div className="text-center group cursor-default">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white group-hover:text-orange-500 transition-colors">
                    <AnimatedCounter value={10} suffix="x" />
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">More Traffic</div>
                </div>
                <div className="w-px h-8 bg-gradient-to-b from-transparent via-gray-300 dark:via-gray-700 to-transparent"></div>
                <div className="text-center group cursor-default">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white group-hover:text-orange-500 transition-colors">
                    24/7
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Active Monitoring</div>
                </div>
                <div className="w-px h-8 bg-gradient-to-b from-transparent via-gray-300 dark:via-gray-700 to-transparent"></div>
                <div className="text-center group cursor-default">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white group-hover:text-orange-500 transition-colors">
                    <AnimatedCounter value={8} suffix="+" />
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">hours a week, saved</div>
                </div>
              </div>

              {/* CTA Buttons */}
              <div 
                className="mt-10 flex gap-4 flex-col sm:flex-row opacity-0"
                style={{ animation: 'wordFadeUp 0.8s ease-out 1.3s forwards' }}
              >
                <Link
                  href="#waitlist"
                  onClick={scrollToSection}
                  className="group relative px-8 py-4 rounded-xl text-white font-semibold transition-all duration-300 transform hover:scale-105 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-pink-500 transition-all duration-300 group-hover:scale-110"></div>
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-pink-600 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                  <span className="relative flex items-center justify-center gap-2">
                    <Bot className="w-5 h-5" />
                    <span>Get Early Access</span>
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                </Link>
                
                <Link
                  href="https://calendly.com/adityavjindal/30min?month=2025-05&date=2025-05-30"
                  className="group relative px-8 py-4 rounded-xl backdrop-blur-sm border text-gray-900 dark:text-white transition-all duration-300 transform hover:scale-105 overflow-hidden glass-morphism"
                >
                  <div className="absolute inset-0 bg-white/20 dark:bg-white/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                  <span className="relative flex items-center justify-center gap-2">
                    <Globe className="w-5 h-5" />
                    <span>Book Demo</span>
                    <svg className="w-5 h-5 group-hover:rotate-45 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </span>
                </Link>
              </div>

              {/* Trust indicators */}
              <div 
                className="mt-12 flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400 opacity-0"
                style={{ animation: 'wordFadeUp 0.8s ease-out 1.5s forwards' }}
              >
                <div className="flex items-center gap-2 group">
                  <svg className="w-4 h-4 text-green-500 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-2 group">
                  <svg className="w-4 h-4 text-green-500 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>14-day free trial</span>
                </div>
              </div>
            </div>

            {/* Right Content - Orbital Animation */}
            <div className="hidden lg:flex items-center justify-center opacity-0" style={{ animation: 'wordFadeUp 1s ease-out 0.5s forwards' }}>
              <OrbitalIcons />
            </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
          <div className="relative">
            <div className="absolute inset-0 bg-orange-500/20 rounded-full blur-xl animate-ping"></div>
            <svg className="w-6 h-6 text-gray-400 dark:text-gray-600 animate-bounce relative" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>
      </section>
    </>
  );
};

export default Hero;