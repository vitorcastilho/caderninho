'use client';

interface StepIndicatorProps {
  totalSteps: number;
  currentStep: number;
}

export function StepIndicator({ totalSteps, currentStep }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-2 py-4">
      {Array.from({ length: totalSteps }).map((_, i) => {
        const step = i + 1;
        let className = 'h-2 w-2 rounded-full transition-all duration-150';

        if (step < currentStep) {
          // Completed
          className += ' bg-green-500';
        } else if (step === currentStep) {
          // Active
          className += ' bg-indigo-600 scale-125';
        } else {
          // Pending
          className += ' bg-stone-300';
        }

        return <div key={step} className={className} />;
      })}
    </div>
  );
}
