'use client';

import React, { useState } from 'react';

type FAQItem = {
  question: string;
  answer: string;
};

const faqs: FAQItem[] = [
  {
    question: 'Can Influx help with lead generation on Reddit?',
    answer:
      'Absolutely. Influx surfaces high-intent discussions where potential customers are already asking questions or exploring solutions. Our AI agents craft context-aware replies that position your product naturally within the conversation — driving curiosity, clicks, and conversions without sounding like a sales pitch.'
  },
  {
    question: 'Can Influx help us with market research?',
    answer:
      'Yes, Influx continuously monitors Reddit conversations in your industry to surface insights about what your audience actually cares about. Think pain points, emerging trends, product feedback, and unmet needs, all pulled straight from real discussions.'
  },
  {
    question: 'Can AI really be "authentic"?',
    answer:
      'We train our models using your brand\'s tone, past replies, and preferences to create responses that sound natural and aligned with your voice. But authenticity isn\'t just about tone , it\'s about context. That\'s why our AI agents also adapt to the unique norms, rules, and language style of each subreddit they engage in. By understanding the community\'s expectations, we ensure that replies feel human, respectful, and genuinely helpful, not generic or spammy.'
  },
  {
    question: 'Is this allowed by Reddit?',
    answer:
      'We\'re very mindful of Reddit\'s policies. Our backend uses scraping methods that obey robots.txt and rate limits. We\'re actively exploring ways to scale ethically and sustainably, including integrating secondary data sources.',
  },
  {
    question: 'What if Reddit blocks access?',
    answer:
      'It\'s a valid concern. That\'s why we\'re diversifying data pipelines, building compliance-based scrapers, and expanding to other platforms like LinkedIn and Twitter in the future.',
  },
  {
    question: 'How scalable is this?',
    answer:
      'Very. We\'re launching with Reddit but our tech can expand to any platform with community-based engagement. Social campaign automation is on our roadmap.',
  },
];

const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="relative py-20 px-6 sm:px-12">
      {/* Main Content Container */}
      <div className="relative z-10 max-w-4xl mx-auto p-8 lg:p-12">
        <h2 className="text-3xl font-bold mb-8 text-center text-gray-900 dark:text-white">
          Frequently Asked Questions
        </h2>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full flex justify-between items-center p-4 text-left text-lg font-medium bg-gray-100 dark:bg-[#1f1f1f] hover:bg-gray-200 dark:hover:bg-[#2a2a2a] transition"
              >
                <span className="text-gray-800 dark:text-gray-100">{faq.question}</span>
                <span className="text-gray-600 dark:text-gray-300">{openIndex === index ? '−' : '+'}</span>
              </button>
              {openIndex === index && (
                <div className="p-4 bg-white dark:bg-[#121212] text-gray-700 dark:text-gray-300">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
