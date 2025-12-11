'use client';

import { useState, useEffect } from 'react';

const STORAGE_KEY = 'imitatio_tutorial_completed';

type TutorialStep = {
  title: string;
  description: string;
  icon: React.ReactNode;
  tip?: string;
};

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    title: 'Welcome to Imitatio!',
    description: 'Master the art of portfolio strategy by emulating the best traders. Pick your assets, set allocations, and see who comes out on top!',
    icon: (
      <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    tip: 'No real money needed - just connect your wallet and play!',
  },
  {
    title: 'Pick Your Assets',
    description: 'Choose up to 3 tokens from 25+ options. Mix majors like BTC and ETH with DeFi tokens, memes, and Base ecosystem favorites.',
    icon: (
      <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
    tip: 'Use categories to filter by Base Ecosystem, DeFi, Memes, and more.',
  },
  {
    title: 'Set Your Allocations',
    description: 'Decide how much to put in each asset. Use the sliders or input exact percentages. Your allocations must add up to exactly 100%.',
    icon: (
      <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
      </svg>
    ),
    tip: 'Click "Auto-balance" to quickly split evenly between your picks.',
  },
  {
    title: 'Lock In & Compete',
    description: 'Submit your picks before the deadline. Once locked, track your performance on the live leaderboard. Top 10% share the glory!',
    icon: (
      <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
      </svg>
    ),
    tip: 'Weekly competitions run Monday to Sunday. Daily and monthly modes coming soon!',
  },
];

type Props = {
  onComplete?: () => void;
  forceShow?: boolean;
};

export default function TutorialModal({ onComplete, forceShow = false }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    // Check if tutorial has been completed
    if (forceShow) {
      setIsOpen(true);
      return;
    }

    const completed = localStorage.getItem(STORAGE_KEY);
    if (!completed) {
      setIsOpen(true);
    }
  }, [forceShow]);

  const handleNext = () => {
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setIsOpen(false);
    onComplete?.();
  };

  const handleSkip = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setIsOpen(false);
    onComplete?.();
  };

  if (!isOpen) return null;

  const step = TUTORIAL_STEPS[currentStep];
  const isLastStep = currentStep === TUTORIAL_STEPS.length - 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={handleSkip}
      />

      {/* Modal */}
      <div className="relative mx-4 w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-surface-2 shadow-2xl">
        {/* Progress bar */}
        <div className="h-1 bg-white/5">
          <div
            className="h-full bg-base-blue transition-all duration-300"
            style={{ width: `${((currentStep + 1) / TUTORIAL_STEPS.length) * 100}%` }}
          />
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Step indicator */}
          <div className="mb-6 flex items-center justify-between">
            <span className="text-xs text-white/40">
              Step {currentStep + 1} of {TUTORIAL_STEPS.length}
            </span>
            <button
              onClick={handleSkip}
              className="text-xs text-white/40 hover:text-white/60 transition-colors"
            >
              Skip tutorial
            </button>
          </div>

          {/* Icon */}
          <div className="mb-6 flex justify-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-base-blue/10 text-base-blue">
              {step.icon}
            </div>
          </div>

          {/* Text */}
          <div className="text-center">
            <h2 className="text-xl font-bold text-white">{step.title}</h2>
            <p className="mt-3 text-sm text-white/60 leading-relaxed">
              {step.description}
            </p>

            {/* Tip */}
            {step.tip && (
              <div className="mt-4 rounded-xl bg-accent-amber/10 border border-accent-amber/20 px-4 py-3">
                <p className="text-xs text-accent-amber">
                  <span className="font-semibold">Pro tip:</span> {step.tip}
                </p>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="mt-8 flex items-center justify-between gap-3">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className={`flex h-10 w-10 items-center justify-center rounded-xl transition-colors ${
                currentStep === 0
                  ? 'bg-white/5 text-white/20 cursor-not-allowed'
                  : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
              }`}
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <button
              onClick={handleNext}
              className="flex-1 rounded-xl bg-base-blue py-3 text-sm font-semibold text-white hover:bg-base-blue-light transition-colors"
            >
              {isLastStep ? "Let's Go!" : 'Next'}
            </button>

            <button
              onClick={handleNext}
              disabled={isLastStep}
              className={`flex h-10 w-10 items-center justify-center rounded-xl transition-colors ${
                isLastStep
                  ? 'bg-white/5 text-white/20 cursor-not-allowed'
                  : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
              }`}
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Dots indicator */}
          <div className="mt-6 flex justify-center gap-2">
            {TUTORIAL_STEPS.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={`h-2 rounded-full transition-all ${
                  index === currentStep
                    ? 'w-6 bg-base-blue'
                    : 'w-2 bg-white/20 hover:bg-white/40'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Hook to control tutorial visibility
 */
export function useTutorial() {
  const [showTutorial, setShowTutorial] = useState(false);

  const resetTutorial = () => {
    localStorage.removeItem(STORAGE_KEY);
    setShowTutorial(true);
  };

  const hasCompletedTutorial = () => {
    return localStorage.getItem(STORAGE_KEY) === 'true';
  };

  return {
    showTutorial,
    setShowTutorial,
    resetTutorial,
    hasCompletedTutorial,
  };
}





