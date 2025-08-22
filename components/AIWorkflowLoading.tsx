import React, { useState, useEffect } from 'react';
import { Search, Target, Zap, CheckCircle, Loader, TrendingUp } from 'lucide-react';

interface AIWorkflowLoadingProps {
  type?: 'search' | 'metrics';
}

const AIWorkflowLoading: React.FC<AIWorkflowLoadingProps> = ({ type = 'search' }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const searchSteps = [
    {
      id: 'scanning',
      icon: Search,
      title: 'Scanning Reddit',
      description: 'Identifying high-signal discussion threads across communities',
      duration: 20000
    },
    {
      id: 'analyzing',
      icon: Target,
      title: 'Analyzing Relevance',
      description: 'Finding posts most relevant to your business context',
      duration: 20000
    },
    {
      id: 'scoring',
      icon: Zap,
      title: 'Scoring Opportunities',
      description: 'Evaluating engagement potential and lead quality',
      duration: 20000
    },
    {
      id: 'finalizing',
      icon: CheckCircle,
      title: 'Preparing Results',
      description: 'Curating your personalized discussion feed',
      duration: 10000
    }
  ];

  const metricsSteps = [
    {
      id: 'fetching',
      icon: TrendingUp,
      title: 'Fetching Latest Metrics',
      description: 'Retrieving updated scores and comment counts from Reddit',
      duration: 3000
    },
    {
      id: 'processing',
      icon: Target,
      title: 'Processing Data',
      description: 'Analyzing engagement trends and performance changes',
      duration: 3000
    },
    {
      id: 'updating',
      icon: CheckCircle,
      title: 'Updating Posts',
      description: 'Refreshing your dashboard with latest metrics',
      duration: 3000
    }
  ];

  const steps = type === 'metrics' ? metricsSteps : searchSteps;

  useEffect(() => {
    if (currentStep < steps.length - 1) {
      const timer = setTimeout(() => {
        setCurrentStep(prev => prev + 1);
      }, steps[currentStep].duration);

      return () => clearTimeout(timer);
    }
  }, [currentStep, steps]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-inherit">
      <div className="max-w-md w-full mx-4">
        {/* Main Loading Animation */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            {/* Outer pulsing ring */}
            <div className="absolute inset-0 w-20 h-20 border-4 border-orange-200 dark:border-orange-800 rounded-full animate-ping"></div>
            {/* Inner spinning ring */}
            <div className="relative w-20 h-20 border-4 border-gray-200 dark:border-gray-700 rounded-full">
              <div className="absolute inset-0 border-4 border-transparent border-t-orange-500 rounded-full animate-spin"></div>
              {/* Center icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full flex items-center justify-center">
                  {type === 'metrics' ? (
                    <TrendingUp className="w-4 h-4 text-white" />
                  ) : (
                    <Search className="w-4 h-4 text-white" />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Workflow Steps */}
        <div className="space-y-4">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = index === currentStep;
            const isCompleted = index < currentStep;
            const isPending = index > currentStep;

            return (
              <div
                key={step.id}
                className={`flex items-center p-4 rounded-lg border transition-all duration-500 ${
                  isActive
                    ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-700 shadow-md'
                    : isCompleted
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700'
                    : 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700'
                }`}
              >
                {/* Step Icon */}
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 ${
                    isActive
                      ? 'bg-orange-500 text-white'
                      : isCompleted
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : isActive ? (
                    <Loader className="w-5 h-5 animate-spin" />
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}
                </div>

                {/* Step Content */}
                <div className="ml-4 flex-1">
                  <h3
                    className={`font-semibold transition-colors duration-300 ${
                      isActive
                        ? 'text-orange-700 dark:text-orange-300'
                        : isCompleted
                        ? 'text-green-700 dark:text-green-300'
                        : 'text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    {step.title}
                  </h3>
                  <p
                    className={`text-sm transition-colors duration-300 ${
                      isActive
                        ? 'text-orange-600 dark:text-orange-400'
                        : isCompleted
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-gray-500 dark:text-gray-500'
                    }`}
                  >
                    {step.description}
                  </p>
                </div>

                {/* Loading Animation for Active Step */}
                {isActive && (
                  <div className="ml-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Progress Bar */}
        <div className="mt-6">
          <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-2">
            <span>Processing...</span>
            <span>{Math.round(((currentStep + 1) / steps.length) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-orange-400 to-orange-600 h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Footer Message */}
        <div className="text-center mt-6">
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            {type === 'metrics' 
              ? 'Updating post metrics...' 
              : 'Finding the perfect discussions for your business...'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AIWorkflowLoading;