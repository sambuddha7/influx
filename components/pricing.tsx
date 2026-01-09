'use client';

import { Check } from 'lucide-react';

export default function Pricing() {
  const pricingTiers = [
    {
      name: 'Free',
      price: '$0',
      period: '/month',
      description: 'Perfect for getting started',
      features: [
        '3 AI searches',
        '3 auto-generated comments',
        '5 subreddits',
        '5 context documents',
      ],
      cta: 'Get Started',
      ctaLink: '/dashboard',
      popular: false,
    },
    {
      name: 'Starter',
      price: '$19.99',
      period: '/month',
      description: 'For growing businesses',
      features: [
        '20 AI searches per week',
        '100 auto-generated comments',
        '15 auto-generated posts',
        '20 subreddits',
        '20 context documents',
        'Analytics included',
        'Social media listening',
      ],
      cta: 'Get Started',
      ctaLink: '/dashboard',
      popular: true,
    },
    {
      name: 'Pro',
      price: '$49.99',
      period: '/month',
      description: 'For power users',
      features: [
        'Unlimited AI searches',
        'Unlimited auto-generated comments',
        'Unlimited auto-generated posts',
        'Unlimited subreddits',
        '100 context documents',
        'Full analytics',
        'Social media listening',
        'Access to beta features',
      ],
      cta: 'Get Started',
      ctaLink: '/dashboard',
      popular: false,
    },
  ];

  return (
    <div id="pricing" className="relative w-full py-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Choose the plan that fits your needs
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {pricingTiers.map((tier, index) => (
            <div
              key={index}
              className={`relative rounded-2xl border-2 p-8 transition-all duration-300 hover:scale-105 ${
                tier.popular
                  ? 'border-orange-500 bg-gradient-to-b from-orange-50 to-white dark:from-orange-950/20 dark:to-gray-900 shadow-xl'
                  : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900'
              }`}
            >
              {/* Popular Badge */}
              {tier.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-orange-500 to-pink-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
              )}

              {/* Tier Name */}
              <h3 className="text-2xl font-bold mb-2">{tier.name}</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">{tier.description}</p>

              {/* Price */}
              <div className="mb-6">
                <span className="text-5xl font-bold">{tier.price}</span>
                <span className="text-gray-600 dark:text-gray-400 text-lg">{tier.period}</span>
              </div>

              {/* CTA Button */}
              <a
                href={tier.ctaLink}
                className={`block w-full py-3 px-6 rounded-lg font-semibold text-center transition-all duration-300 mb-8 ${
                  tier.popular
                    ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white hover:from-orange-600 hover:to-pink-600 shadow-lg'
                    : 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gradient-to-r hover:from-orange-500 hover:to-pink-500 hover:text-white shadow-lg'
                }`}
              >
                {tier.cta}
              </a>

              {/* Features List */}
              <ul className="space-y-4">
                {tier.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
