import React, { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  AlertCircle,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  X,
  Edit3,
  Trash2,
  EyeOff,
  Eye,
  ArrowUpDown
} from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { Product, ProductStatus } from '../types';
import { fetchProducts, deleteProductApi, toggleFeaturedApi, updateProduct as updateProductApi } from '../utils/api';

const CATEGORIES = ['All', 'Produce', 'Dairy', 'Bakery', 'Meat', 'Pantry'];

const SORT_OPTIONS = [
    { label: 'Name (A-Z)', value: 'name_asc' },
    { label: 'Expiry: Earliest First', value: 'expiry_asc' },
    { label: 'Stock: Low to High', value: 'stock_asc' },
    { label: 'Stock: High to Low', value: 'stock_desc' },
    { label: 'Status', value: 'status' },
    { label: 'Featured', value: 'featured' }
];

export const Products: React.FC = () => {
  // Initialize from storage instead of static mock data
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showFilters, setShowFilters] = useState(false);
  const [sortOption, setSortOption] = useState('name_asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [activeMenuProductId, setActiveMenuProductId] = useState<string | null>(null);
  
  const itemsPerPage = 5;
  const navigate = useNavigate();
  const location = useLocation();

  // Load products from API
  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await fetchProducts();
        if (res.success && res.data) {
          // Map backend shape to frontend Product type
          const mapped: Product[] = res.data.map((p: any) => ({
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
          }));
          setProducts(mapped);
        }
      } catch (err) {
        console.error('Products load error:', err);
      }
    };
    loadData();
  }, []);

  // Handle Navigation State from Dashboard
  useEffect(() => {
      if (location.state && location.state.sortBy) {
          setSortOption(location.state.sortBy);
          // Optional: Highlight that a sort is active
      }
  }, [location.state]);

  // Close menus on click outside
  useEffect(() => {
    const handleClickOutside = () => setActiveMenuProductId(null);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    // 1. Filter
    let result = products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    // 2. Sort
    result.sort((a, b) => {
        switch(sortOption) {
            case 'expiry_asc': 
                return new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime();
            case 'stock_asc': 
                return a.quantity - b.quantity;
            case 'stock_desc': 
                return b.quantity - a.quantity;
            case 'status': 
                return a.status.localeCompare(b.status);
            case 'featured': 
                // Show featured first
                return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
            case 'name_asc': 
            default:
                return a.name.localeCompare(b.name);
        }
    });

    return result;
  }, [products, searchQuery, selectedCategory, sortOption]);

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  // Reset page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, sortOption]);

  const getDaysRemaining = (dateStr: string) => {
    const diff = new Date(dateStr).getTime() - Date.now();
    const days = Math.ceil(diff / (1000 * 3600 * 24));
    if (days < 0) return 'Expired';
    if (days === 0) return 'Today';
    if (days === 1) return 'Tomorrow';
    return `${days} days`;
  };

  const getExpiryColor = (dateStr: string) => {
    const diff = new Date(dateStr).getTime() - Date.now();
    const hours = diff / (1000 * 3600);
    if (hours < 0) return 'text-stone-400 dark:text-stone-500';
    if (hours < 24) return 'text-rose-500 font-bold';
    if (hours < 48) return 'text-amber-500 font-bold';
    return 'text-emerald-600 dark:text-emerald-400 font-medium';
  };

  const toggleFeatured = async (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();

    if (new Date(product.expiryDate).getTime() < Date.now()) {
        return;
    }

    // Optimistic update
    const updatedProduct = { ...product, isFeatured: !product.isFeatured };
    setProducts(prev => prev.map(p => p.id === product.id ? updatedProduct : p));

    try {
      await toggleFeaturedApi(product.id);
    } catch {
      // Revert on error
      setProducts(prev => prev.map(p => p.id === product.id ? product : p));
    }
  };

  const handleDeleteProduct = async (e: React.MouseEvent, productId: string) => {
      e.stopPropagation();
      if(window.confirm('Are you sure you want to delete this product?')) {
        try {
          await deleteProductApi(productId);
          setProducts(prev => prev.filter(p => p.id !== productId));
        } catch (err) {
          console.error('Delete failed:', err);
        }
      }
      setActiveMenuProductId(null);
  }

  const toggleVisibility = async (e: React.MouseEvent, product: Product) => {
      e.stopPropagation();
      const newStatus = product.status === ProductStatus.ACTIVE ? 'INACTIVE' : 'ACTIVE';
      const updatedProduct = {
        ...product,
        status: product.status === ProductStatus.ACTIVE ? ProductStatus.SOLD_OUT : ProductStatus.ACTIVE
      };

      setProducts(prev => prev.map(p => p.id === product.id ? updatedProduct : p));
      setActiveMenuProductId(null);

      try {
        await updateProductApi(product.id, { status: newStatus });
      } catch {
        setProducts(prev => prev.map(p => p.id === product.id ? product : p));
      }
  }

  const toggleMenu = (e: React.MouseEvent, productId: string) => {
      e.stopPropagation();
      setActiveMenuProductId(activeMenuProductId === productId ? null : productId);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSortOption('name_asc');
    setShowFilters(false);
  };

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto">
      <div>
         <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Products</h1>
         <p className="text-gray-500 dark:text-gray-400 font-medium mt-1">Manage your inventory and product listings.</p>
      </div>

      {/* Header Actions */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div className="relative w-full sm:w-96 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-500 transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="Search products..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-6 py-3.5 bg-white dark:bg-slate-800 border-none shadow-soft rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500 font-medium dark:text-white"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X size={16} />
              </button>
            )}
          </div>
          <div className="flex w-full sm:w-auto gap-4">
            
            {/* Sort Dropdown */}
            <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                    <ArrowUpDown size={18} />
                </div>
                <select
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value)}
                    className="pl-11 pr-8 py-3.5 bg-white dark:bg-slate-800 border-none shadow-soft rounded-xl appearance-none outline-none font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 cursor-pointer transition-all"
                >
                    {SORT_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
            </div>

            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center justify-center gap-2 px-6 py-3.5 shadow-soft rounded-xl transition-all font-semibold flex-1 sm:flex-none ${
                showFilters || selectedCategory !== 'All' 
                  ? 'bg-brand-50 dark:bg-brand-900 text-brand-700 dark:text-brand-300 ring-2 ring-brand-500/20' 
                  : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700'
              }`}
            >
              <Filter size={20} />
              <span>Filter</span>
              {selectedCategory !== 'All' && (
                <span className="bg-brand-600 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-md ml-1">1</span>
              )}
            </button>
            <Link to="/add-product" className="flex items-center justify-center gap-2 px-6 py-3.5 bg-brand-600 text-white rounded-xl hover:bg-brand-700 hover:shadow-glow transition-all flex-1 sm:flex-none font-bold">
              <Plus size={22} />
              <span>Add Product</span>
            </Link>
          </div>
        </div>

        {/* Expandable Filter Area */}
        {(showFilters || selectedCategory !== 'All') && (
          <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-soft border border-gray-100 dark:border-slate-700 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
               <div className="space-y-2 w-full">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Category</h3>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map(cat => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                          selectedCategory === cat 
                            ? 'bg-brand-600 text-white shadow-md shadow-brand-200' 
                            : 'bg-cream-50 dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-cream-100 dark:hover:bg-slate-600'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
               </div>
               {selectedCategory !== 'All' && (
                 <button 
                    onClick={clearFilters}
                    className="text-sm font-bold text-rose-500 hover:text-rose-600 whitespace-nowrap self-end sm:self-center"
                 >
                    Clear All
                 </button>
               )}
            </div>
          </div>
        )}
      </div>

      {/* Desktop Table / Mobile Stack */}
      <div className="flex flex-col gap-4">
        {/* Table Header (Visual only for desktop) */}
        <div className="hidden md:grid grid-cols-12 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">
            <div className="col-span-4">Product</div>
            <div className="col-span-1">Price (AED)</div>
            <div className="col-span-2">Expiry</div>
            <div className="col-span-2">Stock</div>
            <div className="col-span-1 text-center">Featured</div>
            <div className="col-span-1">Status</div>
            <div className="col-span-1 text-right"></div>
        </div>

        {/* Rows */}
        <div className="flex flex-col gap-3">
          {filteredProducts.length > 0 ? (
            currentItems.map((product) => (
              <div 
                  key={product.id} 
                  className="bg-white dark:bg-slate-800 p-4 rounded-3xl shadow-soft border border-transparent hover:border-brand-100 dark:hover:border-slate-700 hover:shadow-md transition-all cursor-pointer group flex flex-col md:grid md:grid-cols-12 items-center gap-4 md:gap-0 relative"
                  onClick={() => navigate(`/products/${product.id}`)}
              >
                {/* Product Info */}
                <div className="col-span-4 w-full flex items-center gap-4">
                  <img src={product.imageUrl} alt="" className="w-14 h-14 rounded-2xl object-cover shadow-sm bg-gray-100 dark:bg-slate-700" />
                  <div>
                      <div className="flex items-center gap-2">
                          <p className="font-bold text-gray-900 dark:text-white text-lg group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">{product.name}</p>
                          {product.isFeatured && (
                              <Sparkles size={16} className="text-amber-400 fill-amber-400" />
                          )}
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{product.category}</p>
                  </div>
                </div>

                {/* Price */}
                <div className="col-span-1 w-full flex flex-col md:block">
                  <span className="md:hidden text-xs text-gray-400 uppercase font-bold mb-1">Price</span>
                  <div className="flex flex-col">
                      <span className="font-bold text-brand-700 dark:text-brand-400 text-lg">AED {product.discountedPrice.toFixed(2)}</span>
                      <span className="text-sm text-gray-400 line-through decoration-gray-300 dark:decoration-slate-600 font-medium hidden lg:inline-block">AED {product.originalPrice.toFixed(2)}</span>
                  </div>
                </div>

                {/* Expiry */}
                <div className="col-span-2 w-full">
                  <span className="md:hidden text-xs text-gray-400 uppercase font-bold mb-1">Expiry</span>
                  <div className={`flex items-center gap-2 text-sm ${getExpiryColor(product.expiryDate)}`}>
                      <AlertCircle size={16} />
                      {getDaysRemaining(product.expiryDate)}
                  </div>
                </div>

                {/* Stock */}
                <div className="col-span-2 w-full">
                  <span className="md:hidden text-xs text-gray-400 uppercase font-bold mb-1">Stock</span>
                  <div className="flex items-center gap-2">
                      <div className="h-2 w-24 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div 
                              className="h-full bg-brand-500 rounded-full" 
                              style={{width: `${Math.min(100, (product.quantity / 20) * 100)}%`}}
                          ></div>
                      </div>
                      <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">{product.quantity}</span>
                  </div>
                </div>

                {/* Featured Toggle */}
                <div className="col-span-1 w-full flex md:justify-center justify-between items-center">
                  <span className="md:hidden text-xs text-gray-400 uppercase font-bold">Featured</span>
                  <button 
                      onClick={(e) => toggleFeatured(e, product)}
                      disabled={new Date(product.expiryDate).getTime() < Date.now()}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400/50 ${
                        new Date(product.expiryDate).getTime() < Date.now() 
                          ? 'opacity-40 cursor-not-allowed bg-gray-100 dark:bg-slate-700' 
                          : (product.isFeatured ? 'bg-amber-400' : 'bg-gray-200 dark:bg-slate-600')
                      }`}
                  >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition transition-transform ${product.isFeatured ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>

                {/* Status */}
                <div className="col-span-1 w-full flex justify-between md:block">
                  <span className="md:hidden text-xs text-gray-400 uppercase font-bold self-center">Status</span>
                  <Badge status={product.status} />
                </div>

                {/* Action */}
                <div className="col-span-1 w-full text-right hidden md:block relative">
                  <button 
                    onClick={(e) => toggleMenu(e, product.id)}
                    className="text-gray-300 dark:text-gray-500 hover:text-brand-600 dark:hover:text-brand-400 p-2 rounded-xl hover:bg-brand-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    <MoreHorizontal size={20} />
                  </button>
                  
                  {activeMenuProductId === product.id && (
                        <div className="absolute top-10 right-0 w-40 bg-white dark:bg-slate-800 shadow-xl rounded-xl border border-gray-100 dark:border-slate-700 z-20 py-1 animate-in fade-in zoom-in-95 duration-200">
                             <button onClick={(e) => { e.stopPropagation(); navigate(`/products/${product.id}`); }} className="w-full text-left px-4 py-2.5 text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center gap-2">
                                 <Edit3 size={16} /> Edit
                             </button>
                             <button onClick={(e) => toggleVisibility(e, product)} className="w-full text-left px-4 py-2.5 text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center gap-2">
                                 {product.status === ProductStatus.ACTIVE ? <EyeOff size={16} /> : <Eye size={16} />} 
                                 {product.status === ProductStatus.ACTIVE ? 'Hide' : 'Show'}
                             </button>
                             <div className="h-px bg-gray-100 dark:bg-slate-700 my-1"></div>
                             <button onClick={(e) => handleDeleteProduct(e, product.id)} className="w-full text-left px-4 py-2.5 text-sm font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 flex items-center gap-2">
                                 <Trash2 size={16} /> Delete
                             </button>
                        </div>
                   )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-3xl border border-dashed border-gray-200 dark:border-slate-700">
               <p className="text-xl font-bold text-gray-900 dark:text-white">No products found</p>
               <p className="text-gray-500 dark:text-gray-400">Try adjusting your search or filters.</p>
               <button 
                 onClick={clearFilters}
                 className="mt-4 px-6 py-2 bg-cream-100 dark:bg-slate-700 text-gray-700 dark:text-white font-bold rounded-xl hover:bg-cream-200 dark:hover:bg-slate-600 transition-colors"
               >
                 Clear Filters
               </button>
            </div>
          )}
        </div>

        {/* Pagination Controls */}
        {filteredProducts.length > 0 && (
          <div className="flex items-center justify-between px-2 py-4">
            <div className="hidden sm:block text-sm text-gray-500 dark:text-gray-400 font-medium">
              Showing <span className="text-gray-900 dark:text-white font-bold">{indexOfFirstItem + 1}</span> to <span className="text-gray-900 dark:text-white font-bold">{Math.min(indexOfLastItem, filteredProducts.length)}</span> of <span className="text-gray-900 dark:text-white font-bold">{filteredProducts.length}</span> results
            </div>
            <div className="flex items-center gap-3 mx-auto sm:mx-0">
              <button 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-white dark:bg-slate-800 shadow-soft text-gray-600 dark:text-gray-300 hover:bg-brand-50 dark:hover:bg-slate-700 hover:text-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                  <ChevronLeft size={20} />
              </button>
              <div className="flex gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`w-10 h-10 rounded-xl text-sm font-bold transition-all shadow-sm ${
                              currentPage === page 
                              ? 'bg-brand-600 text-white shadow-glow' 
                              : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700'
                          }`}
                      >
                          {page}
                      </button>
                  ))}
              </div>
              <button 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-white dark:bg-slate-800 shadow-soft text-gray-600 dark:text-gray-300 hover:bg-brand-50 dark:hover:bg-slate-700 hover:text-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                  <ChevronRight size={20} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};