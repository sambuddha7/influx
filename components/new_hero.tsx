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

// Floating Reddit-style icons
const FloatingRedditIcons = () => {
  const icons = [
    { Icon: MessageCircle, delay: 0.2, position: 'top-[15%] left-[10%]', size: 'small' as const },
    { Icon: ArrowUp, delay: 0.5, position: 'top-[20%] right-[15%]', size: 'default' as const },
    { Icon: Heart, delay: 0.8, position: 'bottom-[25%] left-[8%]', size: 'small' as const },
    { Icon: TrendingUp, delay: 1.1, position: 'bottom-[30%] right-[10%]', size: 'default' as const },
    { Icon: Users, delay: 1.4, position: 'top-[40%] left-[5%]', size: 'small' as const },
    { Icon: Share2, delay: 1.7, position: 'top-[35%] right-[8%]', size: 'default' as const },
  ];

  return (
    <>
      {icons.map(({ Icon, delay, position, size }, index) => (
        <div
          key={index}
          className={`absolute ${position} opacity-0 hidden lg:block`}
          style={{
            animation: `floatIn 1s ease-out ${delay}s forwards, float-${index % 3} 20s ease-in-out infinite ${delay + 1}s`,
          }}
        >
          <div className={`${size === 'small' ? 'w-12 h-12' : 'w-14 h-14'} rounded-full border-2 border-orange-400/30 bg-white/60 dark:bg-gray-900/40 backdrop-blur-sm shadow-xl flex items-center justify-center group hover:scale-110 hover:border-orange-500 dark:hover:border-orange-400 transition-all duration-300`}>
            <Icon className="w-6 h-6 text-orange-500 dark:text-orange-400 group-hover:rotate-12 transition-transform duration-300" />
          </div>
        </div>
      ))}
    </>
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
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

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

        @keyframes floatIn {
          from {
            opacity: 0;
            transform: scale(0.5) translateY(20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        @keyframes float-0 {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
          }
          33% {
            transform: translateY(-20px) rotate(5deg);
          }
          66% {
            transform: translateY(10px) rotate(-5deg);
          }
        }

        @keyframes float-1 {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
          }
          50% {
            transform: translateY(-30px) rotate(-10deg);
          }
        }

        @keyframes float-2 {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
          }
          25% {
            transform: translateY(-15px) rotate(8deg);
          }
          75% {
            transform: translateY(15px) rotate(-8deg);
          }
        }

        @keyframes particle-rise {
          0% {
            transform: translateY(100vh) translateX(0);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(-100vh) translateX(100px);
            opacity: 0;
          }
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

        @keyframes typewriter {
          from {
            width: 0;
          }
          to {
            width: 100%;
          }
        }

        @keyframes blink {
          0%, 50% {
            opacity: 1;
          }
          51%, 100% {
            opacity: 0;
          }
        }

        .animate-gradient-shift {
          background-size: 200% 200%;
          animation: gradient-shift 8s ease infinite;
        }

        .typewriter::after {
          content: '|';
          position: absolute;
          right: -10px;
          animation: blink 1s infinite;
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
      `}</style>

      <section className="relative min-h-screen overflow-hidden bg-gradient-to-br dark:from-[#0a0a0a] dark:via-[#131313] dark:to-black from-gray-50 via-white to-gray-100">
        

        {/* Floating Reddit Icons */}
        <FloatingRedditIcons />

        {/* Dynamic gradient orbs that follow mouse */}
        <div className="absolute inset-0 z-0">
          {/* Dark mode glow */}
          <div className="dark:block hidden">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-orange-400/10 rounded-full blur-3xl animate-pulse delay-1000" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-orange-500/5 to-pink-500/5 rounded-full blur-3xl" />
          </div>

          {/* Light mode glow */}
          <div className="dark:hidden block">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-400/30 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-pink-400/30 rounded-full blur-3xl animate-pulse delay-1000" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-orange-400/20 to-pink-400/20 rounded-full blur-3xl" />
          </div>
        </div>



        {/* Main Content */}
        <div className="relative z-10 flex flex-col items-center justify-center text-center min-h-screen px-4 py-20">
          
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
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold leading-tight text-gray-900 dark:text-white">
            <div className="space-x-2">
              <AnimatedWord word="AI" delay={0.3} />
              <AnimatedWord word="Copilot" delay={0.4} />
              <AnimatedWord word="for" delay={0.5} />
            </div>
            <div className="mt-2 relative inline-block">
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
            className="mt-8 max-w-2xl text-lg md:text-xl font-light text-gray-600 dark:text-gray-400 leading-relaxed opacity-0"
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
                <AnimatedCounter value={100} suffix="+" />
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Subreddits</div>
            </div>
          </div>

          {/* CTA Buttons with enhanced animations */}
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

          {/* Trust indicators with fade-in */}
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

        {/* Enhanced scroll indicator */}
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