import React, { useState, useEffect } from 'react';
import { Upload, ArrowLeft, Save, Sparkles, Trash2, RefreshCw, Clock, AlertCircle, Image as ImageIcon, Plus } from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { createProduct, updateProduct as updateProductApi, fetchProductById } from '../utils/api';
import { Product, ProductStatus } from '../types';

export const AddProduct: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Produce');
  const [quantity, setQuantity] = useState<number | ''>('');
  const [originalPrice, setOriginalPrice] = useState<number | ''>('');
  const [discount, setDiscount] = useState<number | ''>('');
  const [finalPrice, setFinalPrice] = useState<number | ''>('');
  const [expiryDate, setExpiryDate] = useState('');
  const [description, setDescription] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  
  // Image State
  const [image, setImage] = useState('');
  const [featuredImage, setFeaturedImage] = useState('');
  const [gallery, setGallery] = useState<string[]>([]);

  // Load product if editing from API
  useEffect(() => {
    if (id) {
      (async () => {
        try {
          const res = await fetchProductById(id);
          if (res.success && res.data) {
            const p = res.data;
            setName(p.name);
            setCategory(p.category?.name || 'Produce');
            setQuantity(p.stock);
            setOriginalPrice(p.originalPrice);
            setFinalPrice(p.finalPrice);
            const discountCalc = ((p.originalPrice - p.finalPrice) / p.originalPrice) * 100;
            setDiscount(Math.round(discountCalc));
            if (p.expiryDate) {
              const date = new Date(p.expiryDate);
              setExpiryDate(date.toISOString().slice(0, 16));
            }
            setDescription(p.description || '');
            setIsFeatured(p.isFeatured || false);
            setImage(p.images?.[0] || '');
            setFeaturedImage(p.images?.[1] || '');
            setGallery(p.images || []);
          }
        } catch (err) {
          console.error('Error loading product:', err);
        }
      })();
    }
  }, [id]);

  useEffect(() => {
    if (typeof originalPrice === 'number' && typeof discount === 'number') {
      const calculated = originalPrice - (originalPrice * (discount / 100));
      if (Math.abs(calculated - (typeof finalPrice === 'number' ? finalPrice : 0)) > 0.01) {
         setFinalPrice(Number(calculated.toFixed(2)));
      }
    }
  }, [originalPrice, discount]);

  // Mock upload functions
  const handleImageUpload = () => {
    // Simulate upload
    setImage(`https://picsum.photos/seed/${Date.now()}/800/800`);
  };

  const handleFeaturedImageUpload = () => {
    // Simulate upload
    setFeaturedImage(`https://picsum.photos/seed/${Date.now() + 1}/1920/400`);
  };

  const handleGalleryUpload = () => {
    const newImage = `https://picsum.photos/seed/${Date.now() + Math.random()}/800/800`;
    setGallery([...gallery, newImage]);
  };

  const removeGalleryImage = (index: number) => {
    setGallery(gallery.filter((_, i) => i !== index));
  };

  const handlePublish = async () => {
      const body = {
        name,
        categoryName: category,
        stock: Number(quantity),
        originalPrice: Number(originalPrice),
        finalPrice: Number(finalPrice),
        expiryDate: new Date(expiryDate).toISOString(),
        description,
        isFeatured,
        images: [image, featuredImage, ...gallery].filter(Boolean),
        status: 'ACTIVE',
      };

      try {
        if (id) {
          await updateProductApi(id, body);
        } else {
          await createProduct(body);
        }
        navigate('/products');
      } catch (err: any) {
        alert(err.message || 'Failed to save product');
      }
  };

  const handleSaveDraft = () => {
      handlePublish();
  };

  return (
    <div className="max-w-[1600px] mx-auto space-y-8">
      <div className="flex items-center gap-6">
        <Link to={id ? `/products/${id}` : "/products"} className="w-12 h-12 flex items-center justify-center bg-white dark:bg-slate-800 shadow-soft rounded-xl text-gray-600 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 transition-all">
          <ArrowLeft size={22} />
        </Link>
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">{id ? 'Edit Product' : 'Add New Product'}</h1>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        
        {/* LEFT COLUMN: Input Form */}
        <div className="space-y-8 order-2 xl:order-1">
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-soft p-8 space-y-8 dark:border dark:border-slate-700">
            <div className="flex justify-between items-center pb-4 border-b border-gray-100 dark:border-slate-700">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Product Details</h3>
                <div className="flex items-center gap-3">
                    <label className="text-sm font-bold text-gray-600 dark:text-gray-400 cursor-pointer" htmlFor="featured-toggle">Feature Deal</label>
                    <button 
                        id="featured-toggle"
                        onClick={() => setIsFeatured(!isFeatured)}
                        className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${isFeatured ? 'bg-brand-500' : 'bg-gray-200 dark:bg-gray-600'}`}
                    >
                        <span className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-sm transition transition-transform ${isFeatured ? 'translate-x-7' : 'translate-x-1'}`} />
                    </button>
                </div>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Product Name</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Organic Berry Mix" 
                  className="w-full px-5 py-3.5 bg-cream-50 dark:bg-slate-900 border-none rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:bg-white dark:focus:bg-slate-900 transition-all outline-none font-medium text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Description</label>
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your product clearly..." 
                  rows={3}
                  className="w-full px-5 py-3.5 bg-cream-50 dark:bg-slate-900 border-none rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:bg-white dark:focus:bg-slate-900 transition-all outline-none font-medium resize-none text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Category</label>
                  <div className="relative">
                    <select 
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full px-5 py-3.5 bg-cream-50 dark:bg-slate-900 border-none rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:bg-white dark:focus:bg-slate-900 transition-all outline-none font-medium appearance-none cursor-pointer text-gray-900 dark:text-white"
                    >
                        <option value="Produce">Produce</option>
                        <option value="Bakery">Bakery</option>
                        <option value="Dairy">Dairy</option>
                        <option value="Meat">Meat</option>
                        <option value="Pantry">Pantry</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Quantity</label>
                  <input 
                    type="number" 
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(0, Number(e.target.value)))}
                    placeholder="1"
                    min="0"
                    className="w-full px-5 py-3.5 bg-cream-50 dark:bg-slate-900 border-none rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:bg-white dark:focus:bg-slate-900 transition-all outline-none font-medium text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="p-6 bg-brand-50 dark:bg-brand-900/20 rounded-2xl border border-brand-100 dark:border-brand-900/30 space-y-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-200 dark:bg-brand-800 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2"></div>
                
                <div className="flex items-center gap-2 mb-2 relative z-10">
                  <div className="bg-white dark:bg-slate-800 p-1.5 rounded-xl text-brand-600 dark:text-brand-400 shadow-sm"><Sparkles size={16} /></div>
                  <h3 className="text-sm font-bold text-brand-900 dark:text-white">Pricing Strategy</h3>
                </div>
                <div className="grid grid-cols-3 gap-4 relative z-10">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase mb-2">Original (AED)</label>
                    <input 
                      type="number" 
                      value={originalPrice}
                      onChange={(e) => setOriginalPrice(Math.max(0, parseFloat(e.target.value)))}
                      className="w-full px-4 py-3 bg-white dark:bg-slate-900 border-none rounded-xl text-center font-bold text-gray-900 dark:text-white shadow-sm focus:ring-2 focus:ring-brand-400"
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase mb-2">Discount (%)</label>
                    <input 
                      type="number" 
                      value={discount}
                      onChange={(e) => setDiscount(Math.max(0, Math.min(100, parseFloat(e.target.value))))}
                      className="w-full px-4 py-3 bg-white dark:bg-slate-900 border-none rounded-xl text-center font-bold text-rose-500 shadow-sm focus:ring-2 focus:ring-brand-400"
                      placeholder="50"
                      min="0"
                      max="100"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-brand-800 dark:text-brand-300 uppercase mb-2">Final Price (AED)</label>
                    <div className="w-full px-4 py-3 bg-brand-600 text-white rounded-xl text-center font-bold shadow-lg shadow-brand-200 dark:shadow-none">
                      {finalPrice ? `AED ${finalPrice}` : '0.00'}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-amber-50 dark:bg-amber-900/20 p-6 rounded-3xl border-2 border-amber-100 dark:border-amber-900/30">
                <label className="block text-xl font-extrabold text-amber-900 dark:text-amber-300 mb-4 flex items-center gap-3">
                  <div className="p-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm text-amber-600 dark:text-amber-400">
                    <Clock size={24} strokeWidth={2.5} />
                  </div>
                  Expiry Date & Time
                </label>
                <div className="relative">
                    <input 
                    type="datetime-local" 
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full px-6 py-6 bg-white dark:bg-slate-900 border-2 border-amber-200 dark:border-amber-900/50 rounded-2xl focus:ring-4 focus:ring-amber-500/20 focus:border-amber-500 transition-all outline-none text-2xl font-extrabold text-gray-900 dark:text-white shadow-sm cursor-pointer hover:border-amber-300 placeholder:text-gray-300 dark:placeholder:text-gray-600 [&::-webkit-calendar-picker-indicator]:w-8 [&::-webkit-calendar-picker-indicator]:h-8 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-100 [&::-webkit-calendar-picker-indicator]:hover:opacity-100 [color-scheme:light]"
                    />
                </div>
                <p className="text-sm font-bold text-amber-700/80 dark:text-amber-300/80 mt-3 flex items-center gap-2 ml-1">
                  <AlertCircle size={16} />
                  Important: Product will be unlisted automatically after this time.
                </p>
              </div>
            </div>

            <div className="pt-6 flex items-center gap-4 border-t border-gray-100 dark:border-slate-700">
              <button onClick={handlePublish} className="flex-1 py-4 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-700 hover:shadow-glow transition-all">
                {id ? 'Update Product' : 'Publish Product'}
              </button>
              <button onClick={handleSaveDraft} className="px-8 py-4 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 text-gray-600 dark:text-gray-300 rounded-xl font-bold hover:bg-gray-50 dark:hover:bg-slate-600 transition-all flex items-center gap-2 shadow-sm">
                <Save size={18} />
                <span className="hidden sm:inline">Save Draft</span>
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Image Uploads */}
        <div className="space-y-8 order-1 xl:order-2">
            
            {/* Featured Image Upload (Conditional) */}
            {isFeatured && (
                <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-soft p-8 space-y-4 border-2 border-amber-100 dark:border-amber-900/30">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <Sparkles size={18} className="text-amber-500" />
                            Featured Banner Image
                        </h3>
                        <span className="text-rose-500 text-xs font-bold uppercase tracking-wide bg-rose-50 dark:bg-rose-900/20 px-2 py-1 rounded-md">*Required</span>
                    </div>
                    
                    {featuredImage ? (
                        <div className="relative rounded-2xl overflow-hidden group border border-gray-100 dark:border-slate-700 shadow-sm">
                            <img src={featuredImage} alt="Featured Banner" className="w-full h-40 object-cover" />
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button 
                                    onClick={() => setFeaturedImage('')}
                                    className="p-3 bg-white text-rose-500 rounded-xl hover:bg-rose-50 font-bold transition-all shadow-lg"
                                    title="Delete Image"
                                >
                                    <Trash2 size={20} />
                                </button>
                                <button 
                                    onClick={handleFeaturedImageUpload}
                                    className="p-3 bg-white text-brand-600 rounded-xl hover:bg-brand-50 font-bold transition-all shadow-lg"
                                    title="Change Image"
                                >
                                    <RefreshCw size={20} />
                                </button>
                            </div>
                            <div className="absolute bottom-2 right-2 bg-black/50 text-white text-[10px] font-bold px-2 py-1 rounded backdrop-blur-sm">
                                1920 x 400
                            </div>
                        </div>
                    ) : (
                        <div 
                            onClick={handleFeaturedImageUpload}
                            className="h-40 bg-amber-50/50 dark:bg-amber-900/10 border-2 border-dashed border-amber-200 dark:border-amber-800 rounded-2xl flex flex-col items-center justify-center text-amber-700 dark:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 hover:border-amber-400 transition-all cursor-pointer group"
                        >
                            <div className="p-3 bg-white dark:bg-slate-900 rounded-xl shadow-sm mb-2 group-hover:scale-110 transition-transform text-amber-500">
                                <Upload size={24} />
                            </div>
                            <p className="text-sm font-bold">Upload Banner</p>
                            <p className="text-xs opacity-70 mt-1 font-medium">Must be 1920 x 400 px</p>
                        </div>
                    )}
                </div>
            )}

            {/* Standard Image Upload Area (Hidden if Featured is enabled) */}
            {!isFeatured && (
                <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-soft p-8 space-y-4 dark:border dark:border-slate-700">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Product Image</h3>
                    
                    {image ? (
                        <div className="relative rounded-2xl overflow-hidden group border border-gray-100 dark:border-slate-700 shadow-sm">
                            <img src={image} alt="Product" className="w-full h-64 object-cover" />
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button 
                                    onClick={() => setImage('')}
                                    className="p-3 bg-white text-rose-500 rounded-xl hover:bg-rose-50 font-bold transition-all shadow-lg"
                                    title="Delete Image"
                                >
                                    <Trash2 size={20} />
                                </button>
                                <button 
                                    onClick={handleImageUpload}
                                    className="p-3 bg-white text-brand-600 rounded-xl hover:bg-brand-50 font-bold transition-all shadow-lg"
                                    title="Change Image"
                                >
                                    <RefreshCw size={20} />
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div 
                            onClick={handleImageUpload}
                            className="aspect-video bg-cream-50 dark:bg-slate-900 border-2 border-dashed border-gray-200 dark:border-slate-700 rounded-2xl flex flex-col items-center justify-center text-gray-400 hover:bg-cream-100 dark:hover:bg-slate-800 hover:border-brand-300 transition-all cursor-pointer group"
                        >
                            <div className="p-4 bg-white dark:bg-slate-800 rounded-xl shadow-sm mb-3 group-hover:scale-110 transition-transform text-brand-500">
                                <Upload size={28} />
                            </div>
                            <p className="text-sm font-bold text-gray-600 dark:text-gray-300">Click to Upload Photo</p>
                            <p className="text-xs text-gray-400 mt-1 font-medium">PNG, JPG up to 5MB</p>
                        </div>
                    )}
                </div>
            )}

            {/* Gallery Section - Only show if NOT featured */}
            {!isFeatured && (
                <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-soft p-8 space-y-4 dark:border dark:border-slate-700">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <ImageIcon size={20} className="text-gray-400" />
                        Additional Images
                    </h3>
                    <div className="grid grid-cols-3 gap-3">
                        {gallery.map((img, idx) => (
                            <div key={idx} className="relative aspect-square rounded-xl overflow-hidden group border border-gray-100 dark:border-slate-700 shadow-sm">
                                <img src={img} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
                                <button
                                    onClick={() => removeGalleryImage(idx)}
                                    className="absolute top-1 right-1 p-1.5 bg-white text-rose-500 rounded-lg shadow-md opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-50"
                                    type="button"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        ))}
                        <button
                            onClick={handleGalleryUpload}
                            className="aspect-square border-2 border-dashed border-gray-200 dark:border-slate-700 rounded-xl flex flex-col items-center justify-center text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-900 hover:border-brand-300 hover:text-brand-500 transition-all group"
                            type="button"
                        >
                            <div className="p-2 bg-white dark:bg-slate-900 rounded-full shadow-sm mb-1 group-hover:scale-110 transition-transform">
                                <Plus size={18} />
                            </div>
                            <span className="text-[10px] font-bold">Add</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};