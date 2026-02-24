import React from 'react';
import { ImportStep } from '../../../types/import.types';
import { Check } from 'lucide-react';

interface StepIndicatorProps {
  currentStep: ImportStep;
}

const steps = [
  { id: 1, label: 'Upload' },
  { id: 2, label: 'Filter' },
  { id: 3, label: 'Rules' },
  { id: 4, label: 'Publish' },
];

export const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep }) => {
  return (
    <div className="flex items-center justify-center space-x-4 mb-8">
      {steps.map((step, index) => {
        const isCompleted = currentStep > step.id;
        const isCurrent = currentStep === step.id;

        return (
          <div key={step.id} className="flex items-center">
            <div className="flex items-center gap-2">
              <div
                className={`
                  w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors duration-200
                  ${isCompleted ? 'bg-emerald-500 text-white' : ''}
                  ${isCurrent ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900' : ''}
                  ${!isCompleted && !isCurrent ? 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400' : ''}
                `}
              >
                {isCompleted ? <Check size={14} strokeWidth={3} /> : step.id}
              </div>
              <span
                className={`
                  text-sm font-medium transition-colors duration-200
                  ${isCurrent ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}
                `}
              >
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className="w-8 h-px bg-gray-200 dark:bg-gray-700 ml-4" />
            )}
          </div>
        );
      })}
    </div>
  );
};
