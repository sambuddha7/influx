"use client"
import React from "react";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Linkedin, Globe } from 'lucide-react';

export default function AboutPage() {
  const founders = [
    {
      name: "Sambuddha Biswas",
      role: "CEO & Co-Founder",
      bio: "Former Reddit marketing strategist with 8+ years of experience helping brands establish authentic presence on social platforms. Alex saw the opportunity to automate the process while maintaining genuine interactions.",
      image: "/api/placeholder/400/400",
      linkedin: "https://linkedin.com",
    },
    {
      name: "Aditya Jindal",
      role: "CPO & Co-Founder",
      bio: "AI researcher with a background in NLP and content analysis. Sarah has developed proprietary algorithms that identify high-potential Reddit conversations and generate responses that maintain brand authenticity.",
      image: "/api/placeholder/400/400",
      linkedin: "https://linkedin.com",
    },
    {
      name: "Vansh Tyagi",
      role: "CMO & Co-Founder",
      bio: "Digital marketing veteran who has helped scale multiple SaaS startups. Marcus understands the challenges brands face when trying to establish genuine connections at scale on platforms like Reddit.",
      image: "/api/placeholder/400/400",
      linkedin: "https://linkedin.com",
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-black dark:bg-dot-white/[0.2] bg-dot-black/[0.2]">
      {/* Company Story Section */}
      <div className="max-w-4xl mx-auto px-6 pt-20 pb-12">
        <h1 className="text-3xl font-bold mb-6 text-neutral-900 dark:text-white">Our <span style={{ color: '#FF5700' }}>Story</span></h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div>
            <p className="text-neutral-700 dark:text-neutral-300 mb-4">
              Founded in 2024, our company emerged from a simple observation: brands struggle to genuinely connect on Reddit, often missing opportunities or coming across as inauthentic.
            </p>
            <p className="text-neutral-700 dark:text-neutral-300 mb-4">
              After years of helping brands navigate Reddit&apos;s unique ecosystem manually, our founding team recognized the need for intelligent automation that preserves the human touch.
            </p>
            <p className="text-neutral-700 dark:text-neutral-300">
              Today, we&apos;re revolutionizing how brands engage on Reddit by combining AI-powered opportunity detection with customizable response generation that maintains each brand&apos;s unique voice.
            </p>
          </div>
          <div className="relative h-64 md:h-80 w-full rounded-xl overflow-hidden">
            <Image 
              src="/api/placeholder/600/400" 
              alt="Company team collaborating"
              layout="fill"
              objectFit="cover"
              className="rounded-xl"
            />
          </div>
        </div>
      </div>

      {/* Founders Section */}
      <div className="bg-neutral-50 dark:bg-neutral-900 py-16">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold mb-12 text-center text-neutral-900 dark:text-white">
            Meet Our <span style={{ color: '#FF5700' }}>Founders</span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {founders.map((founder, index) => (
              <motion.div 
                key={index}
                whileHover={{ y: -10 }}
                className="bg-white dark:bg-neutral-800 rounded-xl p-6 shadow-md hover:shadow-xl transition-all"
              >
                <div className="w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden">
                  <Image 
                    src={founder.image} 
                    alt={founder.name}
                    width={128}
                    height={128}
                    className="rounded-full"
                  />
                </div>
                <h3 className="text-xl font-bold text-center text-neutral-900 dark:text-white mb-1">{founder.name}</h3>
                <p className="text-orange-600 text-center mb-4">{founder.role}</p>
                <p className="text-neutral-700 dark:text-neutral-300 text-sm mb-6">{founder.bio}</p>
                <div className="flex justify-center space-x-4">
                  <Link href={founder.linkedin} className="text-neutral-600 hover:text-orange-600 dark:text-neutral-400 dark:hover:text-orange-500">
                    <Linkedin size={20} />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold mb-12 text-center text-neutral-900 dark:text-white">
          Our <span style={{ color: '#FF5700' }}>Values</span>
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-neutral-800 p-6 rounded-xl shadow">
            <h3 className="text-xl font-bold mb-3 text-neutral-900 dark:text-white">Authenticity First</h3>
            <p className="text-neutral-700 dark:text-neutral-300">
              We believe Reddit thrives on genuine conversations. Our technology enhances human connection rather than replacing it.
            </p>
          </div>
          
          <div className="bg-white dark:bg-neutral-800 p-6 rounded-xl shadow">
            <h3 className="text-xl font-bold mb-3 text-neutral-900 dark:text-white">Community Respect</h3>
            <p className="text-neutral-700 dark:text-neutral-300">
              We respect Reddit&apos;s unique culture and help brands contribute positively to the community without disrupting it.
            </p>
          </div>
          
          <div className="bg-white dark:bg-neutral-800 p-6 rounded-xl shadow">
            <h3 className="text-xl font-bold mb-3 text-neutral-900 dark:text-white">Transparency</h3>
            <p className="text-neutral-700 dark:text-neutral-300">
              We&apos;re open about how our technology works and never encourage brands to mislead or manipulate Reddit users.
            </p>
          </div>
          
          <div className="bg-white dark:bg-neutral-800 p-6 rounded-xl shadow">
            <h3 className="text-xl font-bold mb-3 text-neutral-900 dark:text-white">Continuous Improvement</h3>
            <p className="text-neutral-700 dark:text-neutral-300">
              We constantly refine our algorithms and processes to deliver better results while adapting to Reddit&apos;s evolving ecosystem.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      {/* <div className="bg-gradient-to-r from-orange-600 to-orange-700 py-16 text-center">
        <h2 className="text-3xl font-bold mb-6 text-white">Ready to elevate your Reddit marketing?</h2>
        <p className="text-white mb-8 max-w-2xl mx-auto">
          Join innovative brands already transforming their Reddit presence with our platform.
        </p>
        <Link 
          href="/#waitlist" 
          className="px-8 py-3 bg-white text-orange-600 font-bold rounded-lg hover:bg-neutral-100 transition-all"
        >
          Join Waitlist
        </Link>
      </div> */}
    </div>
  );
}