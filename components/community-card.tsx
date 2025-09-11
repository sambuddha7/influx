"use client";
import { animate, motion } from "motion/react";
import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import {
  TrendingUp,
  MessageCircle,
  Users,
  Heart,
  ArrowUp,
  Eye
} from "lucide-react";

export default function CommunityInsightsCard() {
  return (
    <Card>
      <CardSkeletonContainer>
        <CommunityTrendsSkeleton />
      </CardSkeletonContainer>
    </Card>
  );
}

const CommunityTrendsSkeleton = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  
  const trendingTopics = [
    { icon: TrendingUp, label: "Product Features", engagement: 95, color: "text-blue-500" },
    { icon: Heart, label: "User Experience", engagement: 87, color: "text-red-500" },
    { icon: Users, label: "Community Events", engagement: 76, color: "text-green-500" },
    { icon: MessageCircle, label: "Support Issues", engagement: 68, color: "text-purple-500" },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % trendingTopics.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Animate the trending bars
    animate(".trend-bar", 
      { scaleX: [0, 1] }, 
      { duration: 1.5, delay: 0.3, ease: "easeOut" }
    );
    
    // Animate the pulse effect on active items
    animate(".pulse-ring", 
      { 
        scale: [1, 1.2, 1],
        opacity: [0.8, 0.3, 0.8]
      }, 
      { 
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    );
  }, [activeIndex]);

  return (
    <div className="p-6 overflow-hidden h-full relative flex flex-col justify-center">
      {/* Header with animated radar effect */}
      <div className="flex items-center gap-3 mb-6">
        <div className="relative">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center">
            <Eye className="h-4 w-4 text-white" />
          </div>
          <div className="absolute inset-0 rounded-full bg-cyan-500 opacity-30 animate-ping"></div>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-800 dark:text-white">Community Insights</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">Live trending analysis</p>
        </div>
      </div>

      {/* Trending Topics List */}
      <div className="space-y-3 mb-4">
        {trendingTopics.map((topic, index) => {
          const Icon = topic.icon;
          const isActive = index === activeIndex;
          
          return (
            <motion.div
              key={topic.label}
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg transition-all duration-500",
                isActive 
                  ? "bg-white/10 dark:bg-white/5 scale-105" 
                  : "bg-white/5 dark:bg-white/2"
              )}
              animate={{
                y: isActive ? -2 : 0,
                boxShadow: isActive 
                  ? "0 4px 20px rgba(59, 130, 246, 0.3)" 
                  : "0 2px 8px rgba(0, 0, 0, 0.1)"
              }}
            >
              <div className="relative">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center",
                  "bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800"
                )}>
                  <Icon className={cn("h-4 w-4", topic.color)} />
                </div>
                {isActive && (
                  <div className="pulse-ring absolute inset-0 rounded-full border-2 border-cyan-400"></div>
                )}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-800 dark:text-white">
                    {topic.label}
                  </span>
                  <div className="flex items-center gap-1">
                    <ArrowUp className="h-3 w-3 text-green-500" />
                    <span className="text-xs text-green-500 font-medium">
                      {topic.engagement}%
                    </span>
                  </div>
                </div>
                
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                  <div 
                    className={cn(
                      "trend-bar h-1.5 rounded-full bg-gradient-to-r origin-left",
                      isActive 
                        ? "from-cyan-400 to-blue-500" 
                        : "from-gray-400 to-gray-500"
                    )}
                    style={{ width: `${topic.engagement}%` }}
                  ></div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Floating Discussion Bubbles */}
      <div className="absolute inset-0 pointer-events-none">
        <FloatingBubbles />
      </div>

      {/* Bottom Stats */}
      <div className="flex justify-between items-center pt-4 border-t border-gray-200/20 dark:border-gray-700/30">
        <div className="text-center">
          <div className="text-lg font-bold text-gray-800 dark:text-white">2.4K</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Discussions</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-gray-800 dark:text-white">89%</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Sentiment</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-gray-800 dark:text-white">12</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Communities</div>
        </div>
      </div>
    </div>
  );
};

const FloatingBubbles = () => {
  const bubbles = Array.from({ length: 6 }, (_, i) => ({
    id: i,
    size: Math.random() * 8 + 4,
    delay: Math.random() * 4,
    duration: Math.random() * 3 + 5,
    x: Math.random() * 100,
    y: Math.random() * 100,
  }));

  return (
    <div className="absolute inset-0">
      {bubbles.map((bubble) => (
        <motion.div
          key={bubble.id}
          className="absolute rounded-full bg-gradient-to-r from-cyan-400/20 to-blue-500/20 dark:from-cyan-400/10 dark:to-blue-500/10"
          style={{
            width: bubble.size,
            height: bubble.size,
            left: `${bubble.x}%`,
            top: `${bubble.y}%`,
          }}
          animate={{
            y: [-20, -40, -20],
            x: [-5, 5, -5],
            opacity: [0.3, 0.8, 0.3],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: bubble.duration,
            delay: bubble.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};

export const Card = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => {
  return (
    <div
      className={cn(
        "max-w-sm w-full mx-auto p-8 rounded-xl border border-[rgba(255,255,255,0.10)] dark:bg-[rgba(40,40,40,0.70)] bg-gray-100 shadow-[2px_4px_16px_0px_rgba(248,248,248,0.06)_inset] group",
        className
      )}
    >
      {children}
    </div>
  );
};

export const CardSkeletonContainer = ({
  className,
  children,
  showGradient = true,
}: {
  className?: string;
  children: React.ReactNode;
  showGradient?: boolean;
}) => {
  return (
    <div
      className={cn(
        "h-[15rem] md:h-[20rem] rounded-xl z-40",
        className,
        showGradient &&
          "bg-neutral-300 dark:bg-[rgba(40,40,40,0.70)] [mask-image:radial-gradient(70%_70%_at_50%_50%,white_0%,rgba(255,255,255,0.4)_80%,transparent_100%)]"
      )}
    >
      {children}
    </div>
  );
};