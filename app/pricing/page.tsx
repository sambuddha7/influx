"use client"
import React, { useState } from "react";
import { BackgroundLines } from "@/components/ui/background-lines";
import { CheckCircle2, HelpCircle } from 'lucide-react';
import { motion } from "framer-motion";

export default function PricingPage() {
  const [annually, setAnnually] = useState(true);
  
  const plans = [
    {
      name: "Starter",
      description: "Perfect for small brands getting started on Reddit",
      monthlyPrice: 49,
      annualPrice: 39,
      features: [
        "5 subreddits monitoring",
        "100 recommended posts/month",
        "Basic AI response suggestions",
        "Email alerts for high-potential posts",
        "Basic analytics dashboard"
      ],
      highlighted: false,
      ctaText: "Get Started"
    },
    {
      name: "Pro",
      description: "Ideal for growing brands with active Reddit engagement",
      monthlyPrice: 99,
      annualPrice: 79,
      features: [
        "15 subreddits monitoring",
        "500 recommended posts/month",
        "Advanced AI response suggestions",
        "Custom brand voice training",
        "Real-time alerts",
        "Comprehensive analytics",
        "Comment approval workflow"
      ],
      highlighted: true,
      ctaText: "Most Popular"
    },
    {
      name: "Enterprise",
      description: "For established brands requiring full-scale Reddit presence",
      monthlyPrice: 249,
      annualPrice: 199,
      features: [
        "Unlimited subreddits monitoring",
        "Unlimited recommended posts",
        "Premium AI response generation",
        "Advanced brand voice customization",
        "Priority post notifications",
        "Team collaboration tools",
        "API access",
        "Dedicated account manager"
      ],
      highlighted: false,
      ctaText: "Contact Sales"
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-black dark:bg-dot-white/[0.2] bg-dot-black/[0.2]">
      {/* Header and Pricing Cards Combined Section */}
      <div className="max-w-6xl mx-auto px-4">
        <div className="pt-10 pb-8 text-center">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
            <span style={{ color: '#FF5700' }}>Pricing</span>
          </h1>
          
          <p className="max-w-2xl mx-auto text-sm md:text-lg text-neutral-700 dark:text-neutral-400 text-center mt-4">
            Choose the plan that fits your Reddit marketing needs. All plans include our core AI-powered post recommendation engine.
          </p>
          
          {/* Pricing Toggle */}
          <div className="mt-6 flex items-center justify-center">
            <span className={`mr-3 ${annually ? 'text-neutral-600 dark:text-neutral-400' : 'text-neutral-900 dark:text-white font-medium'}`}>
              Monthly
            </span>
            <button 
              onClick={() => setAnnually(!annually)}
              className="relative inline-flex h-6 w-12 items-center rounded-full bg-neutral-200 dark:bg-neutral-700"
            >
              <span 
                className={`inline-block h-4 w-4 transform rounded-full bg-orange-600 transition ${annually ? 'translate-x-7' : 'translate-x-1'}`} 
              />
            </button>
            <span className={`ml-3 ${annually ? 'text-neutral-900 dark:text-white font-medium' : 'text-neutral-600 dark:text-neutral-400'}`}>
              Annually <span className="text-xs text-orange-600 font-medium">(Save 20%)</span>
            </span>
          </div>
        </div>

        {/* Pricing Cards - Now directly below the header */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-2 pb-16">
          {plans.map((plan, index) => (
            <motion.div 
              key={index}
              whileHover={{ y: -10 }}
              className={`rounded-xl overflow-hidden ${
                plan.highlighted 
                  ? 'border-2 border-orange-500 shadow-lg shadow-orange-100 dark:shadow-orange-900/20' 
                  : 'border border-neutral-200 dark:border-neutral-800'
              }`}
            >
              {plan.highlighted && (
                <div className="bg-orange-600 py-1.5 text-center text-white text-sm font-medium">
                  MOST POPULAR
                </div>
              )}
              
              <div className="p-6 bg-white dark:bg-neutral-900">
                <h3 className="text-xl font-bold text-neutral-900 dark:text-white">{plan.name}</h3>
                <p className="mt-2 text-neutral-600 dark:text-neutral-400 h-12">{plan.description}</p>
                
                <div className="mt-4 mb-6">
                  <span className="text-4xl font-bold text-neutral-900 dark:text-white">
                    ${annually ? plan.annualPrice : plan.monthlyPrice}
                  </span>
                  <span className="text-neutral-600 dark:text-neutral-400 ml-1">
                    /month
                  </span>
                  {annually && (
                    <div className="text-xs text-orange-600 mt-1">
                      Billed annually (${plan.annualPrice * 12}/year)
                    </div>
                  )}
                </div>
                
                <button 
                  className={`w-full py-2 rounded-lg font-medium transition-all ${
                    plan.highlighted 
                      ? 'bg-orange-600 text-white hover:bg-orange-700' 
                      : 'bg-neutral-100 text-neutral-900 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-white dark:hover:bg-neutral-700'
                  }`}
                >
                  {plan.ctaText}
                </button>
                
                <div className="border-t border-neutral-200 dark:border-neutral-800 mt-6 pt-6">
                  <p className="font-medium text-neutral-900 dark:text-white mb-4">What&apos;s included:</p>
                  <ul className="space-y-3">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start">
                        <CheckCircle2 className="h-5 w-5 text-orange-600 mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-neutral-700 dark:text-neutral-300 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-neutral-50 dark:bg-neutral-900 py-16">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-bold mb-12 text-center text-neutral-900 dark:text-white">
            Frequently Asked <span style={{ color: '#FF5700' }}>Questions</span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-neutral-800 p-6 rounded-xl shadow">
              <h3 className="text-lg font-bold mb-3 text-neutral-900 dark:text-white">Can I upgrade or downgrade my plan?</h3>
              <p className="text-neutral-700 dark:text-neutral-300 text-sm">
                Yes, you can change your plan at any time. Upgrades take effect immediately, while downgrades will apply at the end of your current billing cycle.
              </p>
            </div>
            
            <div className="bg-white dark:bg-neutral-800 p-6 rounded-xl shadow">
              <h3 className="text-lg font-bold mb-3 text-neutral-900 dark:text-white">Do you offer a free trial?</h3>
              <p className="text-neutral-700 dark:text-neutral-300 text-sm">
                We offer a 14-day free trial on all plans so you can experience our platform before committing. No credit card required to start.
              </p>
            </div>
            
            <div className="bg-white dark:bg-neutral-800 p-6 rounded-xl shadow">
              <h3 className="text-lg font-bold mb-3 text-neutral-900 dark:text-white">How do subreddit monitoring limits work?</h3>
              <p className="text-neutral-700 dark:text-neutral-300 text-sm">
                You can select specific subreddits to monitor based on your plan limits. You can change these selections at any time to adapt to your marketing needs.
              </p>
            </div>
            
            <div className="bg-white dark:bg-neutral-800 p-6 rounded-xl shadow">
              <h3 className="text-lg font-bold mb-3 text-neutral-900 dark:text-white">What does &apos;brand voice training&apos; include?</h3>
              <p className="text-neutral-700 dark:text-neutral-300 text-sm">
                Our AI learns your brand&apos;s unique tone, style, and messaging preferences through examples you provide, ensuring suggested responses authentically represent your brand.
              </p>
            </div>
            
            <div className="bg-white dark:bg-neutral-800 p-6 rounded-xl shadow">
              <h3 className="text-lg font-bold mb-3 text-neutral-900 dark:text-white">Do you offer custom plans?</h3>
              <p className="text-neutral-700 dark:text-neutral-300 text-sm">
                Yes, for large organizations or unique needs, we can create custom solutions. Contact our sales team to discuss your specific requirements.
              </p>
            </div>
            
            <div className="bg-white dark:bg-neutral-800 p-6 rounded-xl shadow">
              <h3 className="text-lg font-bold mb-3 text-neutral-900 dark:text-white">How does post recommendation work?</h3>
              <p className="text-neutral-700 dark:text-neutral-300 text-sm">
                Our AI analyzes Reddit conversations in real-time to identify posts where your brand&apos;s presence would be valuable and well-received, based on relevance and engagement potential.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      {/* <div className="bg-gradient-to-r from-orange-600 to-orange-700 py-16 text-center">
        <h2 className="text-3xl font-bold mb-6 text-white">Still have questions?</h2>
        <p className="text-white mb-8 max-w-2xl mx-auto">
          Our team is here to help you find the perfect plan for your Reddit marketing strategy.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="px-8 py-3 bg-white text-orange-600 font-bold rounded-lg hover:bg-neutral-100 transition-all">
            Contact Sales
          </button>
          <button className="px-8 py-3 border-2 border-white text-white font-bold rounded-lg hover:bg-orange-700 transition-all">
            Book a Demo
          </button>
        </div>
      </div> */}
    </div>
  );
}