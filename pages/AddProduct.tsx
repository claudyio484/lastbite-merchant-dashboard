import React, { useState, useEffect, useRef } from 'react';
import { Upload, ArrowLeft, Save, Sparkles, Trash2, RefreshCw, Clock, AlertCircle, Image as ImageIcon, Plus, ScanLine, Barcode, CheckCircle } from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { saveProduct, getProductById } from '../utils/productStorage';
import { Product, ProductStatus } from '../types';

// Mock Database for Barcode Lookup
const BARCODE_DB: Record<string, { 
    name: string; 
    category: string; 
    originalPrice: number; 
    sku: string; 
    description: string; 
    image: string; 
}> = {
  '6291003001001': {
    name: 'Almarai Full Fat Milk (2L)',
    category: 'Dairy',
    originalPrice: 11.50,
    sku: 'DAI-ALM-200',
    description: 'Fresh full cream milk, 100% cow milk, rich in calcium and vitamins.',
    image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&q=80&w=800'
  },
  '6291003002002': {
    name: 'Kellogg\'s Corn Flakes (500g)',
    category: 'Pantry',
    originalPrice: 18.75,
    sku: 'PAN-KEL-500',
    description: 'The original and best corn flakes. High in iron and vitamins.',
    image: 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?auto=format&fit=crop&q=80&w=800'
  },
  '6291003003003': {
    name: 'Heinz Tomato Ketchup',
    category: 'Pantry',
    originalPrice: 14.25,
    sku: 'PAN-HNZ-300',
    description: 'Classic tomato ketchup made from sun-ripened tomatoes.',
    image: 'https://images.unsplash.com/photo-1606756627960-496dfeb37748?auto=format&fit=crop&q=80&w=800'
  },
  '6291003004004': {
    name: 'Australian Angus Beef Mince (500g)',
    category: 'Meat',
    originalPrice: 35.00,
    sku: 'MEA-ANG-500',
    description: 'Premium chilled Australian Angus beef mince, low fat.',
    image: 'https://images.unsplash.com/photo-1588168333986-5078d3ae3976?auto=format&fit=crop&q=80&w=800'
  }
};

export const AddProduct: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // Form State
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [barcode, setBarcode] = useState('');
  const [category, setCategory] = useState('Produce');
  const [quantity, setQuantity] = useState<number | ''>('');
  const [originalPrice, setOriginalPrice] = useState<number | ''>('');
  const [discount, setDiscount] = useState<number | ''>('');
  const [finalPrice, setFinalPrice] = useState<number | ''>('');
  const [expiryDate, setExpiryDate] = useState('');
  const [description, setDescription] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  
  // UI State
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Image State
  const [image, setImage] = useState('');
  const [featuredImage, setFeaturedImage] = useState('');
  const [gallery, setGallery] = useState<string[]>([]);

  // Load product if editing from Storage
  useEffect(() => {
    if (id) {
      const product = getProductById(id);
      if (product) {
        setName(product.name);
        setSku(product.sku || '');
        setBarcode(product.barcode || '');
        setCategory(product.category);
        setQuantity(product.quantity);
        setOriginalPrice(product.originalPrice);
        setFinalPrice(product.discountedPrice);
        // Calculate discount percentage
        const discountCalc = ((product.originalPrice - product.discountedPrice) / product.originalPrice) * 100;
        setDiscount(Math.round(discountCalc));
        
        // Format for date input (YYYY-MM-DD)
        const date = new Date(product.expiryDate);
        const dateStr = date.toISOString().split('T')[0];
        setExpiryDate(dateStr);
        
        setDescription(product.description || '');
        setIsFeatured(product.isFeatured || false);
        setIsVisible(product.isVisible !== false);
        setImage(product.imageUrl || '');
        setFeaturedImage(product.featuredImageUrl || '');
        setGallery(product.gallery || []);
      }
    }
  }, [id]);

  // Handle Automatic Barcode Lookup
  useEffect(() => {
    // Only run lookup if not in edit mode (to prevent overwriting existing data) 
    // or if the user explicitly types a new barcode
    if (barcode && BARCODE_DB[barcode]) {
        const data = BARCODE_DB[barcode];
        
        // Auto-fill fields
        setName(data.name);
        setCategory(data.category);
        setOriginalPrice(data.originalPrice);
        setSku(data.sku);
        setDescription(data.description);
        if (data.image) setImage(data.image);
        
        // Ensure final price mirrors original price initially (discount is 0/empty)
        if (discount === '' || discount === 0) {
            setFinalPrice(data.originalPrice);
        }
    }
  }, [barcode]);

  // Price Change Handlers
  const handleOriginalPriceChange = (val: string) => {
      const numVal = val === '' ? '' : Math.max(0, parseFloat(val));
      setOriginalPrice(numVal);
      
      // If we have a discount %, recalculate final price
      if (numVal !== '' && typeof discount === 'number') {
          const calculated = numVal - (numVal * (discount / 100));
          setFinalPrice(Number(calculated.toFixed(2)));
      } else if (numVal !== '' && typeof finalPrice === 'number') {
          // If we have final price but no discount set, calculate discount?
          // No, default behavior: keep discount constant if set, else update final price to match original
          if (discount === '' || discount === 0) {
              setFinalPrice(numVal);
          }
      }
  };

  const handleDiscountChange = (val: string) => {
      const numVal = val === '' ? '' : Math.max(0, Math.min(100, parseFloat(val)));
      setDiscount(numVal);
      
      if (typeof originalPrice === 'number' && numVal !== '') {
          const calculated = originalPrice - (originalPrice * (numVal / 100));
          setFinalPrice(Number(calculated.toFixed(2)));
      }
  };

  const handleFinalPriceChange = (val: string) => {
      const numVal = val === '' ? '' : Math.max(0, parseFloat(val));
      setFinalPrice(numVal);
      
      if (typeof originalPrice === 'number' && originalPrice > 0 && numVal !== '') {
          const discountCalc = ((originalPrice - numVal) / originalPrice) * 100;
          setDiscount(Math.round(discountCalc));
      }
  };

  // Automatically un-feature if quantity becomes 0
  useEffect(() => {
      if ((Number(quantity) || 0) <= 0 && isFeatured) {
          setIsFeatured(false);
      }
  }, [quantity]);

  // Mock upload functions
  const imageInputRef = useRef<HTMLInputElement>(null);
  const featuredImageInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
              setImage(reader.result as string);
          };
          reader.readAsDataURL(file);
      }
  };

  const handleFeaturedImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
              setFeaturedImage(reader.result as string);
          };
          reader.readAsDataURL(file);
      }
  };

  const handleGalleryFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
              setGallery(prev => [...prev, reader.result as string]);
          };
          reader.readAsDataURL(file);
      }
  };

  const handleImageUpload = () => {
    imageInputRef.current?.click();
  };

  const handleFeaturedImageUpload = () => {
    featuredImageInputRef.current?.click();
  };

  const handleGalleryUpload = () => {
    galleryInputRef.current?.click();
  };

  const removeGalleryImage = (index: number) => {
    setGallery(gallery.filter((_, i) => i !== index));
  };

  const handleScanBarcode = () => {
      // Simulate scanning by picking a random valid key from our mock DB
      const keys = Object.keys(BARCODE_DB);
      const randomKey = keys[Math.floor(Math.random() * keys.length)];
      setBarcode(randomKey);
  };

  const handlePublish = async () => {
      // Validation
      if (!name.trim()) {
          alert('Please enter a product name.');
          return;
      }
      if (originalPrice === '' || Number(originalPrice) < 0) {
          alert('Please enter a valid price.');
          return;
      }
      if (!expiryDate) {
          alert('Please select an expiry date.');
          return;
      }

      setIsSaving(true);

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      const qty = Number(quantity) || 0;

      // Create product object
      const product: Product = {
        id: id || Date.now().toString(), // Generate simple ID
        name,
        sku: sku || undefined,
        barcode: barcode || undefined,
        category,
        quantity: qty,
        originalPrice: Number(originalPrice),
        discountedPrice: Number(finalPrice) || Number(originalPrice),
        expiryDate: new Date(expiryDate + 'T23:59:59').toISOString(), // Set to end of day
        status: qty > 0 ? ProductStatus.ACTIVE : ProductStatus.SOLD_OUT,
        imageUrl: image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=200', // Fallback
        featuredImageUrl: featuredImage,
        description,
        isFeatured: qty > 0 ? isFeatured : false, // Force false if sold out
        isVisible,
        gallery
      };

      saveProduct(product);
      
      setIsSaving(false);
      setShowSuccess(true);

      // Navigate after showing success message
      setTimeout(() => {
          navigate('/products');
      }, 1500);
  };

  const handleSaveDraft = () => {
      handlePublish();
  };

  const isSoldOut = (Number(quantity) || 0) <= 0;

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 relative">
      
      {/* Success Notification */}
      {showSuccess && (
        <div className="fixed top-6 right-6 z-50 animate-slide-in-right">
            <div className="bg-emerald-500 text-white px-6 py-4 rounded-2xl shadow-glow flex items-center gap-3">
                <div className="bg-white/20 p-1 rounded-full">
                    <CheckCircle size={20} strokeWidth={3} />
                </div>
                <div>
                    <h4 className="font-bold text-sm">Success!</h4>
                    <p className="text-xs font-medium opacity-90">Product has been saved successfully.</p>
                </div>
            </div>
        </div>
      )}

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
                    <label className={`text-sm font-bold ${isSoldOut ? 'text-gray-400' : 'text-gray-600 dark:text-gray-400 cursor-pointer'}`} htmlFor="featured-toggle">Feature Deal</label>
                    <button 
                        id="featured-toggle"
                        onClick={() => !isSoldOut && setIsFeatured(!isFeatured)}
                        disabled={isSoldOut}
                        className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors 
                            ${isFeatured ? 'bg-brand-500' : 'bg-gray-200 dark:bg-gray-600'}
                            ${isSoldOut ? 'opacity-50 cursor-not-allowed' : ''}
                        `}
                    >
                        <span className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-sm transition transition-transform ${isFeatured ? 'translate-x-7' : 'translate-x-1'}`} />
                    </button>
                </div>
            </div>
            
            <div className="space-y-6">
              
              {/* SKU & Barcode - Moved up to prioritize lookup workflow */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                      <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Barcode (UPC/EAN)</label>
                      <div className="relative">
                          <Barcode className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                          <input 
                            type="text" 
                            value={barcode}
                            onChange={(e) => setBarcode(e.target.value)}
                            placeholder="Scan or enter code" 
                            className="w-full pl-12 pr-12 py-3.5 bg-cream-50 dark:bg-slate-900 border-none rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:bg-white dark:focus:bg-slate-900 transition-all outline-none font-medium text-gray-900 dark:text-white"
                          />
                          <button 
                            onClick={handleScanBarcode}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-lg text-brand-600 dark:text-brand-400 transition-colors"
                            title="Simulate Scan"
                          >
                              <ScanLine size={18} />
                          </button>
                      </div>
                  </div>
                  <div>
                      <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">SKU</label>
                      <div className="relative">
                          <input 
                            type="text" 
                            value={sku}
                            onChange={(e) => setSku(e.target.value)}
                            placeholder="e.g. PRO-BER-001" 
                            className="w-full px-5 py-3.5 bg-cream-50 dark:bg-slate-900 border-none rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:bg-white dark:focus:bg-slate-900 transition-all outline-none font-medium text-gray-900 dark:text-white uppercase tracking-wider placeholder:normal-case placeholder:tracking-normal"
                          />
                      </div>
                  </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Product Name <span className="text-rose-500">*</span></label>
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
                    onChange={(e) => {
                        const val = e.target.value;
                        setQuantity(val === '' ? '' : Math.max(0, parseInt(val)));
                    }}
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
                    <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase mb-2">Original (AED) <span className="text-rose-500">*</span></label>
                    <input 
                      type="number" 
                      value={originalPrice}
                      onChange={(e) => handleOriginalPriceChange(e.target.value)}
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
                      onChange={(e) => handleDiscountChange(e.target.value)}
                      className="w-full px-4 py-3 bg-white dark:bg-slate-900 border-none rounded-xl text-center font-bold text-rose-500 shadow-sm focus:ring-2 focus:ring-brand-400"
                      placeholder="50"
                      min="0"
                      max="100"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-brand-800 dark:text-brand-300 uppercase mb-2">Final Price (AED)</label>
                    <input 
                      type="number"
                      value={finalPrice}
                      onChange={(e) => handleFinalPriceChange(e.target.value)}
                      className="w-full px-4 py-3 bg-brand-600 text-white rounded-xl text-center font-bold shadow-lg shadow-brand-200 dark:shadow-none placeholder:text-brand-200 focus:ring-2 focus:ring-brand-400 outline-none"
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-amber-50 dark:bg-amber-900/20 p-6 rounded-3xl border-2 border-amber-100 dark:border-amber-900/30">
                <label className="block text-xl font-extrabold text-amber-900 dark:text-amber-300 mb-4 flex items-center gap-3">
                  <div className="p-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm text-amber-600 dark:text-amber-400">
                    <Clock size={24} strokeWidth={2.5} />
                  </div>
                  Expiry Date <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                    <input 
                    type="date" 
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full px-6 py-6 bg-white dark:bg-slate-900 border-2 border-amber-200 dark:border-amber-900/50 rounded-2xl focus:ring-4 focus:ring-amber-500/20 focus:border-amber-500 transition-all outline-none text-2xl font-extrabold text-gray-900 dark:text-white shadow-sm cursor-pointer hover:border-amber-300 placeholder:text-gray-300 dark:placeholder:text-gray-600 [color-scheme:light]"
                    />
                </div>
                <p className="text-sm font-bold text-amber-700/80 dark:text-amber-300/80 mt-3 flex items-center gap-2 ml-1">
                  <AlertCircle size={16} />
                  Important: Product will be unlisted automatically after this date.
                </p>
              </div>
            </div>

            <div className="pt-6 flex items-center gap-4 border-t border-gray-100 dark:border-slate-700">
              <button 
                onClick={handlePublish} 
                disabled={isSaving}
                className={`flex-1 py-4 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-700 hover:shadow-glow transition-all flex items-center justify-center gap-2 ${isSaving ? 'opacity-80 cursor-wait' : ''}`}
              >
                {isSaving ? (
                    <>
                        <RefreshCw size={20} className="animate-spin" />
                        Saving...
                    </>
                ) : (
                    id ? 'Update Product' : 'Publish Product'
                )}
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
                    <input 
                        type="file" 
                        ref={featuredImageInputRef} 
                        className="hidden" 
                        accept="image/*" 
                        onChange={handleFeaturedImageFileChange} 
                    />
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
                    <input 
                        type="file" 
                        ref={imageInputRef} 
                        className="hidden" 
                        accept="image/*" 
                        onChange={handleImageFileChange} 
                    />
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
                    <input 
                        type="file" 
                        ref={galleryInputRef} 
                        className="hidden" 
                        accept="image/*" 
                        onChange={handleGalleryFileChange} 
                    />
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <ImageIcon size={20} className="text-gray-400" />
                        Additional Images <span className="text-xs font-normal text-gray-400 ml-auto">{gallery.length}/2</span>
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
                        {gallery.length < 2 && (
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
                        )}
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};