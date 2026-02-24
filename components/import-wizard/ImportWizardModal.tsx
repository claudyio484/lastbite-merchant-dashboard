import React from 'react';
import { useImportWizard } from './useImportWizard';
import { StepIndicator } from './components/StepIndicator';
import { UploadStep } from './steps/UploadStep';
import { FilterStep } from './steps/FilterStep';
import { DiscountRulesStep } from './steps/DiscountRulesStep';
import { ValidationStep } from './steps/ValidationStep';
import { X } from 'lucide-react';

interface ImportWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ImportWizardModal: React.FC<ImportWizardModalProps> = ({ isOpen, onClose }) => {
  const { state, dispatch } = useImportWizard();

  if (!isOpen) return null;

  const isProcessing = state.status === 'confirming' || state.status === 'success';

  const handleClose = () => {
      if (isProcessing && state.status !== 'success') return;
      onClose();
      // Optional: Reset state on close if needed, but prompt says "wizard state must survive a step going back".
      // Usually we reset on full close.
      setTimeout(() => dispatch({ type: 'RESET' }), 300);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-4xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        {!isProcessing && (
            <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors z-10"
            >
            <X size={20} />
            </button>
        )}

        {/* Header (Stepper) */}
        {!isProcessing && (
            <div className="pt-8 px-8 pb-0">
            <StepIndicator currentStep={state.currentStep} />
            </div>
        )}

        {/* Step Content */}
        <div className="flex-1 p-8 overflow-y-auto min-h-[500px]">
          {state.currentStep === 1 && <UploadStep state={state} dispatch={dispatch} />}
          {state.currentStep === 2 && <FilterStep state={state} dispatch={dispatch} />}
          {state.currentStep === 3 && <DiscountRulesStep state={state} dispatch={dispatch} />}
          {state.currentStep === 4 && <ValidationStep state={state} dispatch={dispatch} onClose={handleClose} />}
        </div>

      </div>
    </div>
  );
};
