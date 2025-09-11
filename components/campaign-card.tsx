"use client";
import { animate, motion } from "motion/react";
import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import {
  Brain,
  Search,
  BarChart3,
  PenTool,
  Send,
  Zap,
  Target,
  Globe
} from "lucide-react";

export default function AICampaignsCard() {
  return (
    <Card>
      <CardSkeletonContainer>
        <AICampaignsSkeleton />
      </CardSkeletonContainer>
    </Card>
  );
}

const AICampaignsSkeleton = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const campaignSteps = [
    { 
      icon: Search, 
      label: "Research Topics", 
      color: "from-purple-500 to-violet-600",
      description: "AI scans trending topics"
    },
    { 
      icon: BarChart3, 
      label: "Analyze Audience", 
      color: "from-blue-500 to-cyan-500",
      description: "Behavioral pattern analysis"
    },
    { 
      icon: PenTool, 
      label: "Draft Content", 
      color: "from-green-500 to-emerald-500",
      description: "Generate resonant posts"
    },
    { 
      icon: Send, 
      label: "Deploy Campaign", 
      color: "from-orange-500 to-red-500",
      description: "Cross-platform publishing"
    }
  ];

  const platforms = [
    { name: "Reddit", color: "bg-orange-500", size: "w-3 h-3" },
    { name: "LinkedIn", color: "bg-blue-600", size: "w-2.5 h-2.5" },
    { name: "Twitter", color: "bg-sky-500", size: "w-2 h-2" },
    { name: "More", color: "bg-gray-500", size: "w-1.5 h-1.5" }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setIsProcessing(true);
      setTimeout(() => {
        setActiveStep((prev) => (prev + 1) % campaignSteps.length);
        setIsProcessing(false);
      }, 800);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Animate the AI brain pulse
    animate(".ai-brain", 
      { 
        scale: [1, 1.1, 1],
        rotate: [0, 5, -5, 0]
      }, 
      { 
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    );

    // Animate the connection lines
    animate(".connection-line", 
      { 
        strokeDasharray: ["0 100", "50 50", "100 0"],
        opacity: [0.3, 1, 0.3]
      }, 
      { 
        duration: 2,
        repeat: Infinity,
        ease: "linear"
      }
    );
  }, []);

  return (
    <div className="p-6 overflow-hidden h-full relative flex flex-col">
      {/* Header with AI Brain */}
      <div className="flex items-center gap-3 mb-6">
        <div className="relative">
          <div className="ai-brain w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
            <Brain className="h-5 w-5 text-white" />
          </div>
          <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 opacity-30 blur animate-pulse"></div>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-800 dark:text-white">AI Campaign Engine</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">Multi-platform automation</p>
        </div>
      </div>

      {/* Campaign Pipeline */}
      <div className="flex-1 relative">
        <div className="space-y-4">
          {campaignSteps.map((step, index) => {
            const Icon = step.icon;
            const isActive = index === activeStep;
            const isCompleted = index < activeStep;
            const isProcessingStep = index === activeStep && isProcessing;
            
            return (
              <motion.div
                key={step.label}
                className="relative"
                animate={{
                  scale: isActive ? 1.02 : 1,
                }}
                transition={{ duration: 0.3 }}
              >
                <div className={cn(
                  "flex items-center gap-3 p-3 rounded-lg transition-all duration-500 relative overflow-hidden",
                  isActive 
                    ? "bg-white/15 dark:bg-white/10" 
                    : "bg-white/5 dark:bg-white/5",
                  isProcessingStep && "animate-pulse"
                )}>
                  
                  {/* Processing overlay */}
                  {isProcessingStep && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"></div>
                  )}
                  
                  {/* Step Icon */}
                  <div className="relative">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500",
                      isActive || isCompleted
                        ? `bg-gradient-to-r ${step.color}`
                        : "bg-gray-200 dark:bg-gray-700"
                    )}>
                      <Icon className={cn(
                        "h-4 w-4 transition-colors duration-500",
                        isActive || isCompleted ? "text-white" : "text-gray-500"
                      )} />
                    </div>
                    
                    {/* Active pulse ring */}
                    {isActive && (
                      <motion.div
                        className="absolute inset-0 rounded-full border-2 border-purple-400"
                        animate={{
                          scale: [1, 1.3, 1],
                          opacity: [0.8, 0.2, 0.8]
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      />
                    )}
                  </div>
                  
                  {/* Step Content */}
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-800 dark:text-white">
                      {step.label}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {step.description}
                    </div>
                  </div>
                  
                  {/* Completion checkmark */}
                  {isCompleted && (
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center"
                    >
                      <div className="w-2 h-1 border-l-2 border-b-2 border-white transform rotate-45 -translate-y-0.5"></div>
                    </motion.div>
                  )}
                </div>
                
                {/* Connection line to next step */}
                {index < campaignSteps.length - 1 && (
                  <svg className="absolute left-7 top-14 w-0.5 h-4" viewBox="0 0 2 16">
                    <line 
                      className="connection-line stroke-gray-300 dark:stroke-gray-600" 
                      x1="1" y1="0" x2="1" y2="16" 
                      strokeWidth="1"
                      strokeDasharray="2 2"
                    />
                  </svg>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Platform Deployment Visualization */}
      <div className="mt-4 pt-4 border-t border-gray-200/20 dark:border-gray-700/30">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium text-gray-600 dark:text-gray-300">Deploy Across</span>
          <div className="flex items-center gap-1">
            <Globe className="h-3 w-3 text-gray-500" />
            <span className="text-xs text-gray-500">{platforms.length} platforms</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {platforms.map((platform, index) => (
            <motion.div
              key={platform.name}
              className="relative"
              animate={{
                y: activeStep === 3 ? [0, -2, 0] : 0,
              }}
              transition={{
                duration: 0.6,
                delay: index * 0.1,
                repeat: activeStep === 3 ? Infinity : 0,
                repeatDelay: 2
              }}
            >
              <div className={cn(
                "rounded-full transition-all duration-300",
                platform.color,
                platform.size,
                activeStep === 3 ? "opacity-100 shadow-lg" : "opacity-60"
              )}></div>
              
              {/* Deployment pulse */}
              {activeStep === 3 && (
                <motion.div
                  className={cn("absolute inset-0 rounded-full", platform.color)}
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.7, 0, 0.7]
                  }}
                  transition={{
                    duration: 1.2,
                    delay: index * 0.2,
                    repeat: Infinity,
                    repeatDelay: 1
                  }}
                />
              )}
            </motion.div>
          ))}
          
          {/* AI Flow Indicator */}
          <div className="flex-1 ml-3">
            <motion.div 
              className="h-0.5 bg-gradient-to-r from-purple-500 to-transparent rounded-full"
              animate={{
                width: activeStep === 3 ? "100%" : "0%"
              }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            />
          </div>
        </div>
      </div>

      {/* Floating AI Particles */}
      <AIParticles />
    </div>
  );
};

const AIParticles = () => {
  const particles = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    delay: Math.random() * 2,
    duration: Math.random() * 3 + 4,
    x: Math.random() * 100,
    y: Math.random() * 100,
  }));

  return (
    <div className="absolute inset-0 pointer-events-none">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute w-1 h-1 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
          }}
          animate={{
            y: [-10, -30, -10],
            x: [-5, 5, -5],
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
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