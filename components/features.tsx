'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import CardDemo from "@/components/cards-demo-3";
import CommunityInsightsCard from "@/components/community-card";
import AICampaignsCard from "@/components/campaign-card";
import AuthenticConversationsCard from "@/components/authenticity-card";

type Feature = {
  tag: string;
  title: string;
  description: string;
  badges: string[];
  component: 'CardDemo' | 'CommunityCard' | 'AICampaignsCard' | 'AuthenticConversationsCard';
};

const features: Feature[] = [
  {
    tag: 'Reddit Engagement',
    title: 'Authentic Conversations at Scale',
    description:
      'Influx helps your brand join Reddit threads like a real community member — not a bot. Our AI agents craft thoughtful, on-brand replies that sound human, not promotional.',
    badges: ['Human-like Replies', 'Brand Tone', 'Authenticity First'],
    component: 'AuthenticConversationsCard',
  },
  {
    tag: 'Post Discovery',
    title: 'Find High-Intent Threads Instantly',
    description:
      'Our system surfaces the most relevant posts across subreddits based on your target audience and marketing goals — prioritized by engagement potential.',
    badges: ['Semantic Search', 'Relevance Scoring', 'Live Feeds'],
    component: 'CardDemo',
  },
  {
    tag: 'Marketing Research',
    title: 'Understand What Communities Care About',
    description:
      'Track trends, questions, and pain points your audience talks about on Reddit — helping you refine messaging and build products people want.',
    badges: ['Topic Clustering', 'Sentiment Analysis', 'Voice of Customer'],
    component: 'CommunityCard',
  },
  {
    tag: 'Full Social Campaigns · Coming Soon',
    title: 'AI-Driven Campaigns Across Social Platforms',
    description:
      'Influx is building support for complete social media campaigns — powered by AI that researches trending topics, analyzes audience behavior, and drafts posts that resonate across Reddit, LinkedIn, and beyond.',
    badges: ['Cross-Platform', 'Content Research', 'Auto Scheduling'],
    component: 'AICampaignsCard',
  },
];

const FeatureItem = ({ feature, index }: { feature: Feature; index: number }) => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.2 });

  const renderComponent = () => {
    switch (feature.component) {
      case 'CardDemo':
        return <CardDemo />;
      case 'CommunityCard':
        return <CommunityInsightsCard />;
      case 'AICampaignsCard':
        return <AICampaignsCard />;
      case 'AuthenticConversationsCard':
        return <AuthenticConversationsCard />;
      default:
        return null;
    }
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={`flex flex-col md:flex-row items-center gap-12 ${
        index % 2 !== 0 ? 'md:flex-row-reverse' : ''
      }`}
    >
      <div className="w-full md:w-1/2">{renderComponent()}</div>
      <div className="w-full md:w-1/2 space-y-4">
        <span className="inline-block bg-gray-100 dark:bg-[#1f1f1f] text-sm text-gray-600 dark:text-gray-300 px-3 py-1 rounded-full">
          {feature.tag}
        </span>
        <h3 className="text-2xl font-semibold">{feature.title}</h3>
        <p className="text-gray-700 dark:text-gray-400">{feature.description}</p>
        <div className="flex flex-wrap gap-2 pt-2">
          {feature.badges.map((badge, i) => (
            <span
              key={i}
              className="bg-gray-100 dark:bg-[#1a1a1a] text-xs px-3 py-1 rounded-full text-gray-700 dark:text-gray-300"
            >
              {badge}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default function Features() {
  return (
    <section className="bg-white dark:bg-black text-gray-900 dark:text-white py-20 px-6 sm:px-12 space-y-24">
      {features.map((feature, index) => (
        <FeatureItem key={index} feature={feature} index={index} />
      ))}
    </section>
  );
}
