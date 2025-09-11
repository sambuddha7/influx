"use client";
import { animate, motion } from "motion/react";
import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import {
  MessageCircle,
  Users,
  Heart,
  ThumbsUp,
  User,
  Bot,
  Shield,
  CheckCircle2,
  Sparkles
} from "lucide-react";

export default function AuthenticConversationsCard() {
  return (
    <Card>
      <CardSkeletonContainer>
        <ConversationsSkeleton />
      </CardSkeletonContainer>
    </Card>
  );
}

const ConversationsSkeleton = () => {
  const [activeConversation, setActiveConversation] = useState(0);
  const [typingEffect, setTypingEffect] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  
  const conversations = [
    {
      thread: "Best project management tools?",
      userMessage: "Looking for something that doesn't break the bank...",
      aiResponse: "I've been using a few different ones and honestly found great success with...",
      engagement: { likes: 12, replies: 3 },
      authenticity: 94
    },
    {
      thread: "Startup funding advice",
      userMessage: "Any tips for first-time founders?",
      aiResponse: "Been there! The biggest lesson I learned was to focus on...",
      engagement: { likes: 8, replies: 5 },
      authenticity: 97
    },
    {
      thread: "Remote work challenges",
      userMessage: "How do you stay productive at home?",
      aiResponse: "This was huge for me too. What really helped was setting up...",
      engagement: { likes: 15, replies: 2 },
      authenticity: 91
    }
  ];

  const currentConversation = conversations[activeConversation];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveConversation((prev) => (prev + 1) % conversations.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Typing effect for AI response
    setIsTyping(true);
    setTypingEffect("");
    
    const response = currentConversation.aiResponse;
    let i = 0;
    
    const typeInterval = setInterval(() => {
      if (i < response.length) {
        setTypingEffect(response.slice(0, i + 1));
        i++;
      } else {
        setIsTyping(false);
        clearInterval(typeInterval);
      }
    }, 50);

    return () => clearInterval(typeInterval);
  }, [activeConversation]);

  useEffect(() => {
    // Animate authenticity score
    const authenticityBars = document.querySelectorAll(".authenticity-bar");
    if (authenticityBars.length > 0) {
      animate(".authenticity-bar", 
        { scaleX: [0, 1] }, 
        { duration: 1.5, ease: "easeOut" }
      );
    }

    // Animate engagement icons
    const engagementIcons = document.querySelectorAll(".engagement-icon");
    if (engagementIcons.length > 0) {
      animate(".engagement-icon", 
        { 
          scale: [1, 1.2, 1],
          rotate: [0, 5, -5, 0]
        }, 
        { 
          duration: 1,
          delay: 0.5,
          ease: "easeInOut"
        }
      );
    }
  }, [activeConversation]);

  return (
    <div className="p-6 overflow-hidden h-full relative flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="relative">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center">
            <MessageCircle className="h-5 w-5 text-white" />
          </div>
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
            <Sparkles className="h-2 w-2 text-white" />
          </div>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-800 dark:text-white">Human-like Conversations</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">Community-first approach</p>
        </div>
      </div>

      {/* Conversation Thread */}
      <div className="flex-1 space-y-4">
        {/* Thread Title */}
        <div className="flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <span className="text-sm font-medium text-blue-800 dark:text-blue-300">
            {currentConversation.thread}
          </span>
        </div>

        {/* User Message */}
        <motion.div 
          className="flex gap-3"
          key={`user-${activeConversation}`}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center flex-shrink-0">
            <User className="h-4 w-4 text-gray-600 dark:text-gray-300" />
          </div>
          <div className="flex-1">
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {currentConversation.userMessage}
              </p>
            </div>
          </div>
        </motion.div>

        {/* AI Response */}
        <motion.div 
          className="flex gap-3"
          key={`ai-${activeConversation}`}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center flex-shrink-0 relative">
            <Bot className="h-4 w-4 text-white" />
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full flex items-center justify-center">
              <CheckCircle2 className="h-2 w-2 text-white" />
            </div>
          </div>
          <div className="flex-1">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-3 relative">
              <p className="text-sm text-gray-700 dark:text-gray-300 min-h-[40px]">
                {typingEffect}
                {isTyping && (
                  <span className="inline-block w-2 h-4 bg-green-500 ml-1 animate-pulse rounded-sm"></span>
                )}
              </p>
              
              {/* Human-like indicators */}
              {!isTyping && (
                <div className="flex items-center gap-2 mt-2 pt-2 border-t border-green-200 dark:border-green-700">
                  <div className="flex items-center gap-1">
                    <Shield className="h-3 w-3 text-green-600 dark:text-green-400" />
                    <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                      {currentConversation.authenticity}% authentic
                    </span>
                  </div>
                  <div className="w-full max-w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-1">
                    <div 
                      className="authenticity-bar h-1 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 origin-left"
                      style={{ width: `${currentConversation.authenticity}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Engagement */}
            {!isTyping && (
              <motion.div 
                className="flex items-center gap-3 mt-2 ml-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <div className="flex items-center gap-1">
                  <ThumbsUp className="engagement-icon h-3 w-3 text-blue-500" />
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {currentConversation.engagement.likes}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageCircle className="engagement-icon h-3 w-3 text-green-500" />
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {currentConversation.engagement.replies}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Heart className="engagement-icon h-3 w-3 text-red-500" />
                  <span className="text-xs text-gray-500 dark:text-gray-400">helpful</span>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Bottom Stats */}
      <div className="flex justify-between items-center pt-4 mt-4 border-t border-gray-200/20 dark:border-gray-700/30">
        <div className="text-center">
          <div className="text-lg font-bold text-gray-800 dark:text-white">95%</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Human-like</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-gray-800 dark:text-white">3.2K</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Conversations</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-gray-800 dark:text-white">87%</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Engagement</div>
        </div>
      </div>

      {/* Floating Conversation Bubbles */}
      <ConversationBubbles />
    </div>
  );
};

const ConversationBubbles = () => {
  const bubbles = Array.from({ length: 5 }, (_, i) => ({
    id: i,
    delay: Math.random() * 3,
    duration: Math.random() * 4 + 6,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 6 + 4,
  }));

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {bubbles.map((bubble) => (
        <motion.div
          key={bubble.id}
          className="absolute rounded-full bg-gradient-to-r from-green-400/10 to-emerald-500/10 dark:from-green-400/5 dark:to-emerald-500/5 border border-green-300/20 dark:border-green-500/10"
          style={{
            width: bubble.size,
            height: bubble.size,
            left: `${bubble.x}%`,
            top: `${bubble.y}%`,
          }}
          animate={{
            y: [-30, -50, -30],
            x: [-10, 10, -10],
            opacity: [0.2, 0.6, 0.2],
            scale: [0.8, 1.2, 0.8],
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