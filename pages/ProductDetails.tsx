import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Edit3, 
  Trash2, 
  Clock, 
  Tag, 
  Box, 
  AlertTriangle,
  Sparkles,
  TrendingUp,
  Eye,
  ShoppingBag,
  Percent,
  Calendar,
  BarChart3,
  Share2,
  Copy,
  MoreHorizontal,
  ScanLine,
  Barcode
} from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { ConfirmationModal } from '../components/ui/ConfirmationModal';
import { getProductById, deleteProduct, saveProduct } from '../utils/productStorage';
import { Product, ProductStatus } from '../types';

export const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | undefined>(undefined);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    if (id) {
      setProduct(getProductById(id));
    }
  }, [id]);

  const [isFeatured, setIsFeatured] = useState(false);
  const [activeImage, setActiveImage] = useState('');

  useEffect(() => {
    if (product) {
      setIsFeatured(product.isFeatured || false);
      setActiveImage(product.imageUrl);
    }
  }, [product]);

  const getDaysRemaining = (dateStr: string) => {
    const diff = new Date(dateStr).getTime() - Date.now();
    const days = Math.ceil(diff / (1000 * 3600 * 24));
    return days;
  };

  const handleDelete = () => {
      setIsDeleteModalOpen(true);
  }

  const confirmDelete = () => {
      if (id) {
        deleteProduct(id);
        navigate('/products');
      }
      setIsDeleteModalOpen(false);
  }

  const toggleFeatured = () => {
      if (!product) return;
      if (product.status === ProductStatus.SOLD_OUT || product.quantity <= 0) {
          alert("Cannot feature a product that is sold out.");
          return;
      }
      const newValue = !isFeatured;
      setIsFeatured(newValue);
      
      const updated = { ...product, isFeatured: newValue };
      setProduct(updated);
      saveProduct(updated);
  }

  const toggleVisibility = () => {
      if (!product) return;
      // Default to true if undefined
      const currentVisibility = product.isVisible !== false;
      const newVisibility = !currentVisibility;
      
      const updated = { ...product, isVisible: newVisibility };
      setProduct(updated);
      saveProduct(updated);
  }
  
  const allImages = product ? [product.imageUrl, ...(product.gallery || [])] : [];

  if (!product) {
    return (
        <div className="flex flex-col items-center justify-center h-96">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Product not found</h2>
            <Link to="/products" className="mt-4 px-6 py-3 bg-brand-600 text-white rounded-xl font-bold hover:shadow-glow transition-all">Back to Products</Link>
        </div>
    );
  }

  const discountPercent = Math.round((1 - product.discountedPrice / product.originalPrice) * 100);
  const stockPercentage = Math.min(100, (product.quantity / 50) * 100); 
  const daysLeft = getDaysRemaining(product.expiryDate);
  const expiryColor = daysLeft < 2 ? 'text-rose-500' : daysLeft < 4 ? 'text-amber-500' : 'text-emerald-500';
  const expiryBg = daysLeft < 2 ? 'bg-rose-50 dark:bg-rose-900/20' : daysLeft < 4 ? 'bg-amber-50 dark:bg-amber-900/20' : 'bg-emerald-50 dark:bg-emerald-900/20';
  
  const isVisible = product.isVisible !== false;
  const isSoldOut = product.status === ProductStatus.SOLD_OUT || product.quantity <= 0;

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 animate-fade-in pb-10">
      <ConfirmationModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Product?"
        message="Are you sure you want to delete this product? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <Link to="/products" className="w-10 h-10 flex items-center justify-center bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-500 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 hover:border-brand-200 transition-all">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-3">
              {product.name}
              <Badge status={product.status} />
              {!isVisible && <span className="bg-gray-200 text-gray-600 text-xs px-2 py-1 rounded">Hidden</span>}
            </h1>
            <div className="flex items-center gap-3 mt-1 text-sm text-gray-500 dark:text-gray-400 font-medium">
                {product.sku && <span className="uppercase tracking-wider">SKU: {product.sku}</span>}
                <span className="w-1 h-1 bg-gray-300 dark:bg-gray-600 rounded-full"></span>
                <span>{product.category}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <button className="p-3 bg-white dark:bg-slate-800 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-slate-700 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 transition-all hidden sm:block">
             <Share2 size={18} />
          </button>
          <Link to={`/edit-product/${product.id}`} className="flex items-center gap-2 px-5 py-3 bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-slate-700 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 hover:border-gray-300 font-bold transition-all">
            <Edit3 size={18} />
            <span>Edit</span>
          </Link>
          <button 
            onClick={handleDelete}
            className="flex items-center gap-2 px-5 py-3 bg-rose-600 text-white shadow-md shadow-rose-200 dark:shadow-none rounded-xl hover:bg-rose-700 font-bold transition-all"
          >
            <Trash2 size={18} />
            <span>Delete</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Visuals & Metrics (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Main Image Gallery */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-4 shadow-soft border border-gray-100 dark:border-slate-700">
            <div className={`relative aspect-square rounded-2xl overflow-hidden bg-cream-50 dark:bg-slate-900 group ${!isVisible ? 'grayscale opacity-75' : ''}`}>
                <img src={activeImage || product.imageUrl} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                
                {isFeatured && (
                    <div className="absolute top-4 left-4 bg-amber-400/90 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm">
                        <Sparkles size={12} fill="currentColor" /> Featured
                    </div>
                )}
                
                {discountPercent > 0 && (
                    <div className="absolute top-4 right-4 bg-rose-500/90 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm">
                        -{discountPercent}%
                    </div>
                )}
            </div>

            {/* Thumbnails */}
            {allImages.length > 1 && (
                <div className="flex gap-3 mt-4 overflow-x-auto pb-2 no-scrollbar">
                    {allImages.map((img, idx) => (
                        <button
                            key={idx}
                            onClick={() => setActiveImage(img)}
                            className={`shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                                activeImage === img ? 'border-brand-500 ring-2 ring-brand-500/20' : 'border-transparent opacity-60 hover:opacity-100'
                            }`}
                        >
                            <img src={img} alt="" className="w-full h-full object-cover" />
                        </button>
                    ))}
                </div>
            )}
          </div>

          {/* Performance Mini-Dashboard */}
          <div className="grid grid-cols-2 gap-4">
             <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-soft border border-gray-100 dark:border-slate-700">
                <div className="flex items-center gap-2 text-gray-400 dark:text-gray-500 mb-2">
                    <ShoppingBag size={16} />
                    <span className="text-xs font-bold uppercase tracking-wider">Total Sales</span>
                </div>
                <p className="text-2xl font-extrabold text-gray-900 dark:text-white">142</p>
                <div className="text-xs font-bold text-emerald-600 mt-1">+12% this week</div>
             </div>
             <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-soft border border-gray-100 dark:border-slate-700">
                <div className="flex items-center gap-2 text-gray-400 dark:text-gray-500 mb-2">
                    <Eye size={16} />
                    <span className="text-xs font-bold uppercase tracking-wider">Views</span>
                </div>
                <p className="text-2xl font-extrabold text-gray-900 dark:text-white">1.2k</p>
                <div className="text-xs font-bold text-gray-400 mt-1">Last 30 days</div>
             </div>
             <div className="col-span-2 bg-gradient-to-br from-brand-600 to-brand-800 p-6 rounded-2xl shadow-lg text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="relative z-10 flex justify-between items-end">
                    <div>
                        <div className="flex items-center gap-2 text-brand-100 mb-2">
                            <BarChart3 size={18} />
                            <span className="text-xs font-bold uppercase tracking-wider">Revenue Generated</span>
                        </div>
                        <p className="text-3xl font-extrabold">AED {(product.discountedPrice * 142).toLocaleString()}</p>
                    </div>
                    <div className="bg-white/20 px-3 py-1 rounded-lg text-xs font-bold backdrop-blur-md">
                        High Performer
                    </div>
                </div>
             </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Product Health & Details (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
           
           {/* Product Health Card (Hero) */}
           <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-soft border border-gray-100 dark:border-slate-700 overflow-hidden">
              <div className="p-6 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center bg-gray-50/50 dark:bg-slate-900/50">
                  <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <TrendingUp size={20} className="text-brand-600" />
                      Product Health
                  </h3>
                  <div className="flex items-center gap-4">
                      {/* Online/Visibility Toggle */}
                      <div className="flex items-center gap-2">
                          <span className={`text-xs font-bold ${isVisible ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-500 dark:text-gray-400'}`}>
                              {isVisible ? 'Online' : 'Hidden'}
                          </span>
                          <button 
                            onClick={toggleVisibility}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isVisible ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-slate-600'}`}
                          >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition transition-transform ${isVisible ? 'translate-x-6' : 'translate-x-1'}`} />
                          </button>
                      </div>

                      <div className="h-4 w-px bg-gray-200 dark:bg-slate-700"></div>

                      {/* Featured Toggle */}
                      <div className="flex items-center gap-2">
                          <span className={`text-xs font-bold ${isSoldOut ? 'text-gray-400' : 'text-gray-500 dark:text-gray-400'}`}>Featured</span>
                          <button 
                            onClick={toggleFeatured}
                            disabled={isSoldOut}
                            title={isSoldOut ? 'Cannot feature sold out item' : ''}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors 
                                ${isFeatured ? 'bg-amber-400' : 'bg-gray-300 dark:bg-slate-600'}
                                ${isSoldOut ? 'opacity-50 cursor-not-allowed' : ''}
                            `}
                          >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition transition-transform ${isFeatured ? 'translate-x-6' : 'translate-x-1'}`} />
                          </button>
                      </div>
                  </div>
              </div>
              
              <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Pricing Section */}
                  <div className="space-y-4">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                          <Tag size={14} /> Pricing Strategy
                      </p>
                      <div className="flex items-baseline gap-3">
                          <span className="text-4xl font-extrabold text-gray-900 dark:text-white">AED {product.discountedPrice}</span>
                          <span className="text-xl font-bold text-gray-400 line-through">AED {product.originalPrice}</span>
                      </div>
                      <div className="flex gap-2">
                          <span className="px-3 py-1 rounded-lg bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 text-xs font-bold border border-rose-100 dark:border-rose-900">
                              {discountPercent}% Discount
                          </span>
                          <span className="px-3 py-1 rounded-lg bg-cream-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 text-xs font-bold border border-gray-200 dark:border-slate-600">
                              Profit Margin: ~15%
                          </span>
                      </div>
                  </div>

                  {/* Stock & Expiry Section */}
                  <div className="space-y-6 md:border-l md:border-gray-100 md:dark:border-slate-700 md:pl-8">
                      {/* Stock */}
                      <div>
                          <div className="flex justify-between items-center mb-2">
                              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                  <Box size={14} /> Inventory
                              </p>
                              <span className="text-sm font-bold text-gray-900 dark:text-white">{product.quantity} Units</span>
                          </div>
                          <div className="w-full h-3 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                              <div 
                                  className={`h-full rounded-full transition-all duration-500 ${product.quantity < 5 ? 'bg-amber-500' : 'bg-brand-500'}`} 
                                  style={{width: `${stockPercentage}%`}}
                              ></div>
                          </div>
                          {product.quantity < 5 && (
                              <p className="text-xs font-bold text-amber-500 mt-2 flex items-center gap-1">
                                  <AlertTriangle size={12} /> Low Stock Warning
                              </p>
                          )}
                      </div>

                      {/* Expiry */}
                      <div>
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2 mb-2">
                              <Clock size={14} /> Expiry Status
                          </p>
                          <div className={`flex items-center gap-3 p-3 rounded-xl border ${daysLeft < 2 ? 'border-rose-100 dark:border-rose-900' : daysLeft < 4 ? 'border-amber-100 dark:border-amber-900' : 'border-emerald-100 dark:border-emerald-900'} ${expiryBg}`}>
                              <Calendar size={20} className={expiryColor} />
                              <div>
                                  <p className={`text-sm font-extrabold ${expiryColor}`}>
                                      {daysLeft > 0 ? `${daysLeft} Days Remaining` : 'Expired'}
                                  </p>
                                  <p className="text-xs opacity-70 font-medium dark:text-gray-300">
                                      {new Date(product.expiryDate).toLocaleDateString()}
                                  </p>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
           </div>

           {/* Details & Description */}
           <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-soft border border-gray-100 dark:border-slate-700 p-8">
               <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Product Details</h3>
               <div className="prose prose-sm dark:prose-invert max-w-none text-gray-600 dark:text-gray-300">
                   <p className="leading-relaxed text-base">{product.description || 'No detailed description available.'}</p>
               </div>
               
               <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-8 border-t border-gray-100 dark:border-slate-700">
                   {product.sku && (
                       <div>
                           <span className="text-xs text-gray-400 uppercase font-bold block mb-1 flex items-center gap-1"><ScanLine size={12}/> SKU</span>
                           <span className="text-sm font-bold text-gray-900 dark:text-white">{product.sku}</span>
                       </div>
                   )}
                   {product.barcode && (
                       <div>
                           <span className="text-xs text-gray-400 uppercase font-bold block mb-1 flex items-center gap-1"><Barcode size={12}/> Barcode</span>
                           <span className="text-sm font-bold text-gray-900 dark:text-white tracking-wide">{product.barcode}</span>
                       </div>
                   )}
                   <div>
                       <span className="text-xs text-gray-400 uppercase font-bold block mb-1">Created</span>
                       <span className="text-sm font-bold text-gray-900 dark:text-white">Oct 24, 2023</span>
                   </div>
                   <div>
                       <span className="text-xs text-gray-400 uppercase font-bold block mb-1">Visibility</span>
                       <span className={`text-sm font-bold ${isVisible ? 'text-brand-600' : 'text-gray-500'}`}>
                           {isVisible ? 'Public' : 'Hidden'}
                       </span>
                   </div>
               </div>
           </div>

           {/* Recent Activity List */}
           <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-soft border border-gray-100 dark:border-slate-700 overflow-hidden">
               <div className="p-6 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center">
                   <h3 className="text-lg font-bold text-gray-900 dark:text-white">Recent Orders</h3>
                   <button className="text-xs font-bold text-brand-600 hover:text-brand-700 bg-brand-50 dark:bg-brand-900/20 px-3 py-1.5 rounded-lg transition-colors">View All</button>
               </div>
               <div className="divide-y divide-gray-50 dark:divide-slate-700/50">
                   {[1, 2, 3].map((i) => (
                       <div key={i} className="p-4 hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors flex items-center justify-between">
                           <div className="flex items-center gap-4">
                               <div className="w-10 h-10 rounded-full bg-cream-100 dark:bg-slate-700 flex items-center justify-center text-gray-500 font-bold text-xs">
                                   JD
                               </div>
                               <div>
                                   <p className="text-sm font-bold text-gray-900 dark:text-white">Order #40{20+i}</p>
                                   <p className="text-xs text-gray-500 dark:text-gray-400">2 items • 4 hours ago</p>
                               </div>
                           </div>
                           <div className="text-right">
                               <p className="text-sm font-bold text-gray-900 dark:text-white">AED {(product.discountedPrice * 2).toFixed(2)}</p>
                               <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded">Completed</span>
                           </div>
                       </div>
                   ))}
               </div>
           </div>

        </div>
      </div>
    </div>
  );
};