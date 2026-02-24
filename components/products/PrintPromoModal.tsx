import React, { useRef, useState } from 'react';
import { Product } from '../../types';
import { PromoFlyer } from './PromoFlyer';
import { Printer, X, Loader2 } from 'lucide-react';
import { printElement } from '../../utils/printUtils';

interface PrintPromoModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
}

export const PrintPromoModal: React.FC<PrintPromoModalProps> = ({ isOpen, onClose, product }) => {
  const componentRef = useRef<HTMLDivElement>(null);
  const [isPrinting, setIsPrinting] = useState(false);
  
  const handlePrint = async () => {
    if (componentRef.current) {
      setIsPrinting(true);
      try {
        await printElement(componentRef.current, `Promo-${product.name}`);
      } catch (error) {
        console.error('Print failed:', error);
      } finally {
        setIsPrinting(false);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-gray-900/80 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Printer size={24} className="text-brand-600" />
                Print Promo Flyer
            </h2>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors">
                <X size={20} />
            </button>
        </div>

        {/* Preview Area */}
        <div className="flex-1 overflow-auto bg-gray-100 p-4 sm:p-8">
            <div className="flex justify-center items-start min-w-fit pb-8">
                 <div className="shadow-2xl bg-white" style={{ width: '210mm', height: '297mm' }}>
                    <PromoFlyer ref={componentRef} product={product} />
                 </div>
            </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
            <button onClick={onClose} className="px-6 py-3 text-gray-600 font-bold hover:bg-gray-200 rounded-xl transition-colors">
                Cancel
            </button>
            <button 
                onClick={handlePrint} 
                disabled={isPrinting}
                className="px-8 py-3 bg-brand-600 text-white font-bold rounded-xl hover:bg-brand-700 shadow-lg hover:shadow-brand-500/30 transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-wait"
            >
                {isPrinting ? <Loader2 size={20} className="animate-spin" /> : <Printer size={20} />}
                {isPrinting ? 'Preparing...' : 'Print Now'}
            </button>
        </div>
      </div>
    </div>
  );
};
