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

interface FloatingIconProps {
  icon: any;
  delay: number;
  position: string;
  size?: 'small' | 'default' | 'large';
}

const FloatingIcon = ({ icon: Icon, delay, position, size = 'default' }: FloatingIconProps) => {
  const sizeClasses: Record<string, string> = {
    small: 'w-12 h-12',
    default: 'w-14 h-14',
    large: 'w-16 h-16'
  };

  return (
    <div
      className={`absolute ${position} opacity-0`}
      style={{
        animation: `fadeIn 1s ease-out ${delay}s forwards, drift-${delay % 3} 20s ease-in-out infinite ${delay + 1}s`,
      }}
    >
      <div className={`${sizeClasses[size]} rounded-full border-2 border-orange-400/50 dark:border-orange-400/30 bg-white/80 dark:bg-gray-900/50 backdrop-blur-sm shadow-xl flex items-center justify-center group hover:scale-110 hover:border-orange-500 dark:hover:border-orange-400 transition-all duration-300`}>
        <Icon className="w-6 h-6 text-orange-500 dark:text-orange-400 group-hover:rotate-12 transition-transform duration-300" />
      </div>
    </div>
  );
};

const Hero = () => {

  return (
    <>
      <style jsx global>{`
        @keyframes drift-0 {
          0%, 100% {
            transform: translate(0, 0) rotate(0deg);
          }
          20% {
            transform: translate(30px, -40px) rotate(90deg);
          }
          40% {
            transform: translate(-20px, -60px) rotate(180deg);
          }
          60% {
            transform: translate(-40px, 20px) rotate(270deg);
          }
          80% {
            transform: translate(20px, 40px) rotate(360deg);
          }
        }

        @keyframes drift-1 {
          0%, 100% {
            transform: translate(0, 0) rotate(0deg);
          }
          25% {
            transform: translate(-40px, 30px) rotate(-90deg);
          }
          50% {
            transform: translate(40px, -20px) rotate(-180deg);
          }
          75% {
            transform: translate(30px, 50px) rotate(-270deg);
          }
        }

        @keyframes drift-2 {
          0%, 100% {
            transform: translate(0, 0) rotate(0deg);
          }
          33% {
            transform: translate(50px, 30px) rotate(120deg);
          }
          66% {
            transform: translate(-30px, 40px) rotate(240deg);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.9);
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
      `}</style>

      <section className="relative min-h-screen overflow-hidden bg-gradient-to-br dark:from-[#0a0a0a] dark:via-[#131313] dark:to-black from-gray-50 via-white to-gray-100">

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