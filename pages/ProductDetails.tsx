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
  ShoppingBag
} from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { fetchProductById, deleteProductApi, toggleFeaturedApi } from '../utils/api';
import { Product, ProductStatus } from '../types';

export const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | undefined>(undefined);

  useEffect(() => {
    if (id) {
      (async () => {
        try {
          const res = await fetchProductById(id);
          if (res.success && res.data) {
            const p = res.data;
            setProduct({
              id: p.id,
              name: p.name,
              category: p.category?.name || 'Uncategorized',
              originalPrice: p.originalPrice,
              discountedPrice: p.finalPrice,
              expiryDate: p.expiryDate || new Date().toISOString(),
              quantity: p.stock,
              status: p.status === 'ACTIVE' ? ProductStatus.ACTIVE
                    : p.status === 'EXPIRED' ? ProductStatus.EXPIRED
                    : ProductStatus.SOLD_OUT,
              imageUrl: p.images?.[0] || '/placeholder.png',
              featuredImageUrl: p.images?.[1],
              description: p.description,
              isFeatured: p.isFeatured,
              gallery: p.images,
            });
          }
        } catch (err) {
          console.error('Error loading product:', err);
        }
      })();
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
    return days > 0 ? `${days} days` : 'Expired';
  };

  const handleDelete = async () => {
      if(window.confirm('Are you sure you want to delete this product?')) {
          if (id) {
            try { await deleteProductApi(id); } catch {}
            navigate('/products');
          }
      }
  }

  const toggleFeatured = async () => {
      if (!product) return;
      const newValue = !isFeatured;
      setIsFeatured(newValue);
      setProduct({ ...product, isFeatured: newValue });
      try {
        await toggleFeaturedApi(product.id);
      } catch {
        setIsFeatured(!newValue);
        setProduct(product);
      }
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

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <Link to="/products" className="w-12 h-12 flex items-center justify-center bg-white dark:bg-slate-800 shadow-soft rounded-xl text-gray-600 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 hover:scale-105 transition-all">
            <ArrowLeft size={22} />
          </Link>
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-3">
              {product.name}
              {isFeatured && <Sparkles size={24} className="text-amber-400 fill-amber-400 animate-pulse" />}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 font-medium mt-1">SKU: BV-2023-{product.id.toString().padStart(3, '0')}</p>
          </div>
        </div>
        <div className="flex gap-4">
          <Link to={`/edit-product/${product.id}`} className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 shadow-soft rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 hover:shadow-md font-bold transition-all">
            <Edit3 size={18} />
            <span>Edit</span>
          </Link>
          <button 
            onClick={handleDelete}
            className="flex items-center gap-2 px-6 py-3 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 shadow-sm border border-rose-100 dark:border-rose-900/30 rounded-xl hover:bg-rose-100 dark:hover:bg-rose-900/40 font-bold transition-all"
          >
            <Trash2 size={18} />
            <span>Delete</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Image & Status */}
        <div className="space-y-8">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-3 shadow-soft dark:border dark:border-slate-700">
            <div className="relative aspect-square md:aspect-auto md:h-80 rounded-2xl overflow-hidden mb-3 bg-gray-100 dark:bg-slate-700">
                <img src={activeImage || product.imageUrl} alt={product.name} className="w-full h-full object-cover transition-all duration-300" />
            </div>

            {/* Thumbnails */}
            {allImages.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar px-1 mb-4">
                    {allImages.map((img, idx) => (
                        <button
                            key={idx}
                            onClick={() => setActiveImage(img)}
                            className={`shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                                activeImage === img ? 'border-brand-500 ring-1 ring-brand-500/30' : 'border-transparent opacity-70 hover:opacity-100'
                            }`}
                        >
                            <img src={img} alt="" className="w-full h-full object-cover" />
                        </button>
                    ))}
                </div>
            )}
            
            <div className="p-4 space-y-4 border-t border-gray-50 dark:border-slate-700">
                <div className="flex items-center justify-between border-b border-gray-50 dark:border-slate-700 pb-4">
                     <span className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</span>
                     <Badge status={product.status} />
                </div>
                
                <div className="flex items-center justify-between border-b border-gray-50 dark:border-slate-700 pb-4">
                     <span className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Category</span>
                     <span className="font-bold text-gray-900 dark:text-white bg-cream-100 dark:bg-slate-700 px-3 py-1 rounded-md">{product.category}</span>
                </div>

                <div className="flex items-center justify-between pt-1">
                     <span className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Featured</span>
                     <button 
                        onClick={toggleFeatured}
                        className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${isFeatured ? 'bg-amber-400' : 'bg-gray-200 dark:bg-gray-600'}`}
                    >
                        <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition transition-transform ${isFeatured ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-brand-600 to-brand-800 rounded-3xl p-6 shadow-glow text-white">
             <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <TrendingUp size={20} /> Performance
             </h3>
             <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl">
                   <p className="text-xs text-brand-100 mb-1 font-medium">Total Sales</p>
                   <p className="text-2xl font-bold">142</p>
                </div>
                <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl">
                   <p className="text-xs text-brand-100 mb-1 font-medium">Views</p>
                   <p className="text-2xl font-bold flex items-center gap-2">
                     1.2k <Eye size={16} className="text-brand-200" />
                   </p>
                </div>
             </div>
          </div>
        </div>

        {/* Right Column: Details */}
        <div className="lg:col-span-2 space-y-8">
           
           {/* Pricing & Inventory Card */}
           <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-soft p-8 dark:border dark:border-slate-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Pricing & Inventory</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                 <div className="flex items-start gap-4 p-4 rounded-2xl bg-cream-50 dark:bg-slate-900/50">
                    <div className="p-3 bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 rounded-xl shadow-sm">
                        <Tag size={20} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Price</p>
                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">AED {product.discountedPrice.toFixed(2)}</span>
                        </div>
                        <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/30 px-2 py-0.5 rounded-md mt-1 inline-block">
                            {Math.round((1 - product.discountedPrice / product.originalPrice) * 100)}% OFF
                        </span>
                    </div>
                 </div>

                 <div className="flex items-start gap-4 p-4 rounded-2xl bg-cream-50 dark:bg-slate-900/50">
                    <div className="p-3 bg-white dark:bg-slate-800 text-sky-600 dark:text-sky-400 rounded-xl shadow-sm">
                        <Box size={20} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Stock</p>
                        <p className="text-2xl font-extrabold text-gray-900 dark:text-white">{product.quantity}</p>
                        <p className="text-xs text-gray-400 font-medium">Low stock alert: 5</p>
                    </div>
                 </div>

                 <div className="flex items-start gap-4 p-4 rounded-2xl bg-cream-50 dark:bg-slate-900/50">
                    <div className="p-3 bg-white dark:bg-slate-800 text-amber-500 rounded-xl shadow-sm">
                        <Clock size={20} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Expires</p>
                        <p className="text-2xl font-extrabold text-amber-500">{getDaysRemaining(product.expiryDate)}</p>
                        <p className="text-xs text-gray-400 font-medium">{new Date(product.expiryDate).toLocaleDateString()}</p>
                    </div>
                 </div>
              </div>

              {product.quantity < 10 && (
                  <div className="flex items-center gap-4 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/30 rounded-2xl text-amber-800 dark:text-amber-300 text-sm font-medium">
                      <div className="bg-white dark:bg-slate-800 p-2 rounded-full text-amber-500 shadow-sm"><AlertTriangle size={18} /></div>
                      <span>This item is running low on stock. Consider restocking soon.</span>
                  </div>
              )}
           </div>

           {/* Description Card */}
           <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-soft p-8 dark:border dark:border-slate-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Description</h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-lg">
                  {product.description || 'No description available for this product.'}
              </p>
           </div>
           
           {/* Recent Orders Placeholder */}
           <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-soft p-8 dark:border dark:border-slate-700">
              <div className="flex items-center justify-between mb-6">
                 <h2 className="text-xl font-bold text-gray-900 dark:text-white">Recent Orders</h2>
                 <button onClick={() => navigate('/orders')} className="text-sm text-brand-600 dark:text-brand-400 font-bold hover:underline">View All</button>
              </div>
              <div className="space-y-4">
                 {[1, 2, 3].map((i) => (
                     <div key={i} className="flex items-center justify-between p-4 bg-cream-50 dark:bg-slate-900/50 rounded-2xl hover:bg-cream-100 dark:hover:bg-slate-700/50 transition-colors cursor-pointer">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center text-gray-400">
                                <ShoppingBag size={18} />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-900 dark:text-white">Order #40{20+i}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">2 hours ago</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-sm font-bold text-gray-900 dark:text-white">2 units</p>
                            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-100 dark:bg-emerald-900/30 px-2 py-0.5 rounded-md">Completed</span>
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