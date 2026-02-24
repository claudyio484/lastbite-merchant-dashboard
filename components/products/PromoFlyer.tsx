import React, { forwardRef } from 'react';
import { Product } from '../../types';
import { Megaphone, QrCode } from 'lucide-react';

interface PromoFlyerProps {
  product: Product;
}

export const PromoFlyer = forwardRef<HTMLDivElement, PromoFlyerProps>(({ product }, ref) => {
  const discountPercent = Math.round((1 - product.discountedPrice / product.originalPrice) * 100);

  return (
    <div ref={ref} className="w-full h-full bg-white font-sans print:w-full print:h-full print:m-0 print:p-0">
      <div className="w-[210mm] h-[297mm] mx-auto bg-white relative flex flex-col overflow-hidden">
        
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
             style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
        </div>

        {/* Header Section */}
        <div className="bg-red-600 text-white pt-12 pb-20 px-12 relative">
           <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
              <div className="absolute top-[-20%] right-[-10%] w-96 h-96 bg-red-500 rounded-full blur-3xl opacity-50"></div>
              <div className="absolute bottom-[-20%] left-[-10%] w-80 h-80 bg-orange-500 rounded-full blur-3xl opacity-50"></div>
           </div>

           <div className="relative z-10 flex justify-between items-start">
               <div>
                   <div className="flex items-center gap-3 mb-2">
                       <span className="bg-yellow-400 text-red-900 px-3 py-1 rounded-full text-sm font-black uppercase tracking-widest shadow-sm">
                           Limited Time Only
                       </span>
                   </div>
                   <h1 className="text-7xl font-black tracking-tighter uppercase leading-[0.9]">
                       Mega<br/>Sale
                   </h1>
               </div>
               <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 shadow-xl transform rotate-6">
                    <Megaphone size={56} className="text-yellow-300 fill-yellow-300 drop-shadow-md" />
               </div>
           </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col px-12 -mt-16 relative z-20">
            
            {/* Product Image Card */}
            <div className="bg-white p-3 rounded-[2rem] shadow-2xl border-4 border-white transform -rotate-1 mb-6 relative">
                <div className="aspect-[16/9] w-full bg-gray-100 rounded-[1.5rem] overflow-hidden relative">
                    <img 
                        src={product.imageUrl} 
                        alt={product.name} 
                        className="w-full h-full object-cover"
                    />
                    {/* Discount Badge Overlay */}
                    <div className="absolute top-4 right-4 bg-red-600 text-white w-28 h-28 rounded-full flex flex-col items-center justify-center shadow-xl border-4 border-white transform rotate-12">
                        <span className="text-2xl font-black leading-none">-{discountPercent}%</span>
                        <span className="text-xs font-bold uppercase tracking-wider">OFF</span>
                    </div>
                </div>
            </div>

            {/* Product Details */}
            <div className="text-center space-y-2 mb-6">
                <h2 className="text-4xl font-black text-gray-900 leading-tight uppercase tracking-tight line-clamp-2">
                    {product.name}
                </h2>
                <div className="flex items-center justify-center gap-2 text-gray-500 font-medium text-base uppercase tracking-widest">
                    {product.sku && <span>SKU: {product.sku}</span>}
                    {product.sku && <span>•</span>}
                    <span>In Stock: {product.quantity}</span>
                </div>
            </div>

            {/* Pricing Block */}
            <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100 flex items-center justify-between relative overflow-hidden mb-6">
                <div className="absolute top-0 right-0 w-64 h-full bg-gradient-to-l from-red-50 to-transparent"></div>
                
                <div className="relative z-10">
                    <p className="text-xl font-bold text-gray-400 uppercase tracking-wider mb-1">Was Price</p>
                    <div className="relative inline-block">
                        <p className="text-4xl font-bold text-gray-400">AED {product.originalPrice.toFixed(2)}</p>
                        <div className="absolute top-1/2 left-0 w-full h-1 bg-red-500 transform -rotate-6"></div>
                    </div>
                </div>

                <div className="text-right relative z-10">
                    <p className="text-xl font-black text-red-600 uppercase tracking-wider mb-1 animate-pulse">Now Only</p>
                    <p className="text-7xl font-black text-gray-900 tracking-tighter leading-none">
                        <span className="text-3xl align-top font-bold text-gray-500 mr-2">AED</span>
                        {product.discountedPrice.toFixed(2)}
                    </p>
                </div>
            </div>

            {/* Footer / CTA */}
            <div className="mt-auto pt-6 pb-8 flex items-end justify-between border-t-2 border-dashed border-gray-200">
                <div>
                    <p className="text-base text-gray-500 font-medium mb-1">Offer valid until:</p>
                    <p className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        {new Date(product.expiryDate).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-gray-400 mt-2 max-w-md">
                        *Terms and conditions apply. Offer valid while stocks last. 
                        Images are for illustrative purposes only.
                    </p>
                </div>

                <div className="flex flex-col items-center gap-2 bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
                    <div className="bg-gray-900 text-white p-2 rounded-lg">
                        <QrCode size={48} />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Scan to Buy</span>
                </div>
            </div>

        </div>
      </div>
    </div>
  );
});

PromoFlyer.displayName = 'PromoFlyer';
