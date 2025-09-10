'use client';
import React from 'react';
import Link from 'next/link';
import { MessageCircle, Share2, TrendingUp, Heart, Users, Zap, Target, BarChart3 } from 'lucide-react';

const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
  e.preventDefault();
  const href = e.currentTarget.href;
  const targetId = href.replace(/.*\#/, "");
  const elem = document.getElementById(targetId);
  elem?.scrollIntoView({
    behavior: "smooth"
  });
};

const FloatingIcon = ({ icon: Icon, delay, position, size = 'default' }) => {
  const sizeClasses = {
    small: 'w-12 h-12',
    default: 'w-14 h-14',
    large: 'w-16 h-16'
  };

  return (
    <div
      className={`absolute ${position} animate-float opacity-0`}
      style={{
        animation: `float 20s ease-in-out infinite ${delay}s, fadeIn 0.5s ease-out ${delay}s forwards`,
      }}
    >
      <div className={`${sizeClasses[size]} rounded-full border-2 border-orange-400/50 dark:border-orange-400/30 bg-white/80 dark:bg-gray-900/50 backdrop-blur-sm shadow-xl flex items-center justify-center group hover:scale-110 hover:border-orange-500 dark:hover:border-orange-400 transition-all duration-300`}>
        <Icon className="w-6 h-6 text-orange-500 dark:text-orange-400 group-hover:rotate-12 transition-transform duration-300" />
      </div>
    </div>
  );
};

const Hero = () => {
  const floatingIcons = [
    { icon: MessageCircle, delay: 0, position: 'top-[15%] left-[10%]', size: 'large' },
    { icon: Share2, delay: 0.5, position: 'top-[20%] right-[15%]', size: 'default' },
    { icon: TrendingUp, delay: 1, position: 'bottom-[25%] left-[8%]', size: 'default' },
    { icon: Heart, delay: 1.5, position: 'bottom-[30%] right-[10%]', size: 'small' },
    { icon: Users, delay: 2, position: 'top-[35%] left-[5%]', size: 'small' },
    { icon: Zap, delay: 2.5, position: 'top-[40%] right-[8%]', size: 'large' },
    { icon: Target, delay: 3, position: 'bottom-[45%] left-[15%]', size: 'default' },
    { icon: BarChart3, delay: 3.5, position: 'bottom-[15%] right-[20%]', size: 'default' },
  ];

  return (
    <>
      <style jsx global>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0) translateX(0) rotate(0deg);
          }
          25% {
            transform: translateY(-20px) translateX(10px) rotate(5deg);
          }
          50% {
            transform: translateY(10px) translateX(-5px) rotate(-5deg);
          }
          75% {
            transform: translateY(-10px) translateX(-10px) rotate(3deg);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
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

        .animate-float {
          animation: float 20s ease-in-out infinite;
        }
      `}</style>

      <section className="relative min-h-screen overflow-hidden bg-gradient-to-br dark:from-[#0a0a0a] dark:via-[#131313] dark:to-black from-gray-50 via-white to-gray-100">
        {/* Floating Icons Container */}
        <div className="absolute inset-0 z-[5] pointer-events-none">
          {floatingIcons.map((item, index) => (
            <FloatingIcon key={index} {...item} />
          ))}
        </div>

        {/* Subtle glow background */}
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

        {/* Optional grid texture */}
        <div className="absolute inset-0 z-[1] opacity-5">
          <div
            className="w-full h-full"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, rgba(0,0,0,0.05) 1px, transparent 0)`,
              backgroundSize: '50px 50px',
            }}
          />
        </div>

        {/* Centered Content */}
        <div className="relative z-10 flex flex-col items-center justify-center text-center min-h-screen px-4 py-20">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-100 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-800/50">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
            </span>
            <span className="text-sm font-medium text-orange-700 dark:text-orange-300">Early Access Now Open</span>
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold leading-tight text-gray-900 dark:text-white">
            AI Copilot for
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-pink-500 to-red-500 animate-gradient-x">
              Reddit Marketing
            </span>
          </h1>

          <p className="mt-8 max-w-2xl text-lg md:text-xl font-light text-gray-600 dark:text-gray-400 leading-relaxed">
            Automate Reddit engagement. Drive awareness, join conversations, and convert communities using AI agents that understand context and build genuine relationships.
          </p>

          {/* Stats */}
          <div className="mt-8 flex gap-8 items-center">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">10x</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Faster Response</div>
            </div>
            <div className="w-px h-8 bg-gray-300 dark:bg-gray-700"></div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">24/7</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Active Monitoring</div>
            </div>
            <div className="w-px h-8 bg-gray-300 dark:bg-gray-700"></div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">100+</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Subreddits</div>
            </div>
          </div>

          <div className="mt-10 flex gap-4 flex-col sm:flex-row">
            <Link
              href="#waitlist"
              onClick={scrollToSection}
              className="group relative px-8 py-4 rounded-xl bg-gradient-to-r from-orange-500 to-pink-500 text-white font-semibold hover:from-orange-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:scale-105 flex items-center justify-center gap-2"
            >
              <span>Get Early Access</span>
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link
              href="https://calendly.com/adityavjindal/30min?month=2025-05&date=2025-05-30"
              className="group px-8 py-4 rounded-xl bg-white/80 dark:bg-white/10 backdrop-blur-sm border border-gray-200 dark:border-white/20 text-gray-900 dark:text-white hover:bg-white dark:hover:bg-white/20 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-2"
            >
              <span>Book Demo</span>
              <svg className="w-5 h-5 group-hover:rotate-45 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </Link>
          </div>

          {/* Trust indicators */}
          <div className="mt-12 flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>14-day free trial</span>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce">
          <svg className="w-6 h-6 text-gray-400 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>
    </>
  );
};

export default Hero;