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
  ArrowUpDown,
  CheckSquare,
  Check,
  LayoutGrid,
  List as ListIcon,
  Upload
} from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { ConfirmationModal } from '../components/ui/ConfirmationModal';
import { Product, ProductStatus } from '../types';
import { fetchProducts, deleteProductApi, toggleFeaturedApi, updateProduct } from '../utils/api';

const CATEGORIES = ['All', 'Produce', 'Dairy', 'Bakery', 'Meat', 'Pantry', 'Expired'];

const SORT_OPTIONS = [
    { label: 'Name (A-Z)', value: 'name_asc' },
    { label: 'Expiry: Earliest First', value: 'expiry_asc' },
    { label: 'Stock: Low to High', value: 'stock_asc' },
    { label: 'Stock: High to Low', value: 'stock_desc' },
    { label: 'Status', value: 'status' },
    { label: 'Featured', value: 'featured' }
];

import { ImportWizardModal } from '../components/import-wizard/ImportWizardModal';

export const Products: React.FC = () => {
  // Initialize from storage instead of static mock data
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showFilters, setShowFilters] = useState(false);
  const [sortOption, setSortOption] = useState('name_asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [activeMenuProductId, setActiveMenuProductId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  
  // Selection State
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set<string>());
  
  // Delete Modal State
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean, type: 'single' | 'bulk', id?: string }>({ isOpen: false, type: 'single' });

  const itemsPerPage = viewMode === 'grid' ? 8 : 5;
  const navigate = useNavigate();
  const location = useLocation();

  // Load products from API
  const loadProducts = async () => {
    try {
      const res = await fetchProducts();
      const mapped: Product[] = (res.data || []).map((p: any) => ({
        id: p.id,
        name: p.name || p.productName || '',
        category: p.category || 'Pantry',
        originalPrice: Number(p.originalPrice ?? p.price ?? 0),
        discountedPrice: Number(p.discountedPrice ?? p.finalPrice ?? p.originalPrice ?? 0),
        expiryDate: p.expiryDate || p.expiry_date || new Date().toISOString(),
        quantity: p.quantity ?? 0,
        status: p.quantity <= 0 ? ProductStatus.SOLD_OUT
          : (new Date(p.expiryDate || p.expiry_date) < new Date() ? ProductStatus.EXPIRED : ProductStatus.ACTIVE),
        imageUrl: p.imageUrl || p.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=200',
        featuredImageUrl: p.featuredImageUrl,
        description: p.description || '',
        isFeatured: p.isFeatured ?? false,
        isVisible: p.isVisible ?? true,
        gallery: p.gallery || [],
        sku: p.sku,
        barcode: p.barcode,
      }));
      setProducts(mapped);
    } catch (err) {
      console.error('Failed to load products:', err);
    }
  };

  useEffect(() => {
    loadProducts();
    window.addEventListener('focus', loadProducts);
    return () => window.removeEventListener('focus', loadProducts);
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
      
      // Special handling for Expired category
      if (selectedCategory === 'Expired') {
          return matchesSearch && product.status === ProductStatus.EXPIRED;
      }

      // For all other categories, exclude expired products
      const isNotExpired = product.status !== ProductStatus.EXPIRED;
      const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
      
      return matchesSearch && matchesCategory && isNotExpired;
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
  }, [searchQuery, selectedCategory, sortOption, viewMode]);

  // Selection Logic
  const isAllSelected = currentItems.length > 0 && currentItems.every(item => selectedIds.has(item.id));
  const isIndeterminate = currentItems.some(item => selectedIds.has(item.id)) && !isAllSelected;

  const toggleSelectAll = () => {
      const newSelected = new Set(selectedIds);
      if (isAllSelected) {
          currentItems.forEach(item => newSelected.delete(item.id));
      } else {
          currentItems.forEach(item => newSelected.add(item.id));
      }
      setSelectedIds(newSelected);
  };

  const toggleSelectOne = (id: string) => {
      const newSelected = new Set(selectedIds);
      if (newSelected.has(id)) {
          newSelected.delete(id);
      } else {
          newSelected.add(id);
      }
      setSelectedIds(newSelected);
  };

  const handleBulkDelete = () => {
      setDeleteModal({ isOpen: true, type: 'bulk' });
  };

  const handleBulkStatusChange = async (status: ProductStatus) => {
      try {
        const ids = Array.from(selectedIds);
        for (const id of ids) {
          const body: any = {};
          if (status === ProductStatus.SOLD_OUT) {
            body.quantity = 0;
            body.isFeatured = false;
          } else if (status === ProductStatus.ACTIVE) {
            body.isVisible = true;
          }
          await updateProduct(id, body);
        }
        await loadProducts();
        setSelectedIds(new Set());
      } catch (err) {
        console.error('Bulk update failed:', err);
      }
  };

  // Single Item Actions
  const handleDelete = (id: string) => {
      setDeleteModal({ isOpen: true, type: 'single', id });
      setActiveMenuProductId(null);
  };

  const confirmDelete = async () => {
      try {
        if (deleteModal.type === 'bulk') {
          for (const id of Array.from(selectedIds)) {
            await deleteProductApi(id);
          }
          setSelectedIds(new Set());
        } else if (deleteModal.type === 'single' && deleteModal.id) {
          await deleteProductApi(deleteModal.id);
        }
        await loadProducts();
      } catch (err) {
        console.error('Delete failed:', err);
      }
      setDeleteModal({ isOpen: false, type: 'single' });
  };

  const toggleFeatured = async (product: Product) => {
      if (product.status === ProductStatus.SOLD_OUT || product.quantity <= 0) {
          alert("Cannot feature a product that is sold out.");
          return;
      }
      try {
        await toggleFeaturedApi(product.id);
        await loadProducts();
      } catch (err) {
        console.error('Toggle featured failed:', err);
      }
      setActiveMenuProductId(null);
  };

  const toggleVisibility = async (product: Product) => {
      try {
        await updateProduct(product.id, { isVisible: !(product.isVisible !== false) });
        await loadProducts();
      } catch (err) {
        console.error('Toggle visibility failed:', err);
      }
      setActiveMenuProductId(null);
  };

  // Helper for Expiry Color
  const getDaysRemaining = (dateStr: string) => {
    const diff = new Date(dateStr).getTime() - Date.now();
    const days = Math.ceil(diff / (1000 * 3600 * 24));
    return days;
  };

  const getExpiryColorClass = (dateStr: string) => {
      const days = getDaysRemaining(dateStr);
      if (days <= 2) return 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-800';
      if (days <= 7) return 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-900';
      return 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-900';
  };

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto animate-fade-in pb-20">
      <ConfirmationModal 
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })}
        onConfirm={confirmDelete}
        title={deleteModal.type === 'bulk' ? `Delete ${selectedIds.size} Products?` : 'Delete Product?'}
        message={deleteModal.type === 'bulk' 
            ? "Are you sure you want to delete these products? This action cannot be undone." 
            : "Are you sure you want to delete this product? This action cannot be undone."}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
           <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Products</h1>
           <p className="text-gray-500 dark:text-gray-400 font-medium mt-1">Manage your inventory and pricing.</p>
        </div>
        
        <div className="flex gap-3">
            <button
                onClick={() => setIsImportModalOpen(true)}
                className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-slate-700 rounded-xl font-bold hover:bg-gray-50 dark:hover:bg-slate-700 hover:shadow-lg transition-all"
            >
                <Upload size={20} /> Import
            </button>
            <Link to="/add-product" className="flex items-center gap-2 px-6 py-3 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-700 hover:shadow-lg hover:shadow-brand-200 transition-all">
                <Plus size={20} /> Add Product
            </Link>
        </div>
      </div>

      <div className="flex flex-col gap-6">
          {/* Controls Bar */}
          <div className="flex flex-col lg:flex-row justify-between gap-6">
              {/* Category Tabs */}
              <div className="flex overflow-x-auto pb-2 lg:pb-0 gap-2 no-scrollbar">
                  {CATEGORIES.map(cat => (
                      <button
                          key={cat}
                          onClick={() => setSelectedCategory(cat)}
                          className={`px-5 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
                              selectedCategory === cat 
                              ? 'bg-brand-600 text-white shadow-md shadow-brand-200' 
                              : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700'
                          }`}
                      >
                          {cat}
                      </button>
                  ))}
              </div>

              {/* Search & Sort */}
              <div className="flex gap-4 w-full lg:w-auto">
                 <div className="relative flex-1 lg:w-72 group">
                     <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-500 transition-colors" size={20} />
                     <input 
                        type="text" 
                        placeholder="Search products..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-800 border-none rounded-2xl shadow-soft focus:ring-2 focus:ring-brand-500/20 focus:outline-none font-medium dark:text-white"
                     />
                 </div>
                 
                 <div className="bg-white dark:bg-slate-800 p-1 rounded-2xl shadow-soft border border-gray-100 dark:border-slate-700 flex items-center">
                    <button 
                      onClick={() => setViewMode('grid')}
                      className={`p-2.5 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-gray-100 dark:bg-slate-700 text-brand-600 dark:text-brand-400 shadow-sm' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
                    >
                        <LayoutGrid size={20} />
                    </button>
                    <button 
                      onClick={() => setViewMode('list')}
                      className={`p-2.5 rounded-xl transition-all ${viewMode === 'list' ? 'bg-gray-100 dark:bg-slate-700 text-brand-600 dark:text-brand-400 shadow-sm' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
                    >
                        <ListIcon size={20} />
                    </button>
                 </div>

                 <div className="relative group">
                     <button 
                        onClick={() => setShowFilters(!showFilters)}
                        className={`p-3 rounded-2xl transition-all shadow-soft h-full flex items-center gap-2 px-4 ${
                            showFilters 
                            ? 'bg-brand-600 text-white' 
                            : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700'
                        }`}
                     >
                        <Filter size={20} />
                        <span className="hidden sm:inline font-bold text-sm">Sort</span>
                     </button>
                     
                     {showFilters && (
                         <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-gray-100 dark:border-slate-700 py-2 z-20 animate-in fade-in zoom-in-95 duration-200">
                             <div className="px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">Sort By</div>
                             {SORT_OPTIONS.map(opt => (
                                 <button
                                     key={opt.value}
                                     onClick={() => { setSortOption(opt.value); setShowFilters(false); }}
                                     className={`w-full text-left px-4 py-2.5 text-sm font-medium hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center justify-between ${sortOption === opt.value ? 'text-brand-600' : 'text-gray-700 dark:text-gray-300'}`}
                                 >
                                     {opt.label}
                                     {sortOption === opt.value && <Check size={16} />}
                                 </button>
                             ))}
                         </div>
                     )}
                 </div>
              </div>
          </div>
          
          {/* Bulk Actions Bar */}
          {selectedIds.size > 0 && (
              <div className="bg-brand-600 text-white p-4 rounded-2xl shadow-lg flex items-center justify-between animate-in slide-in-from-top-2">
                  <div className="flex items-center gap-3">
                      <div className="bg-white/20 px-3 py-1 rounded-lg text-sm font-bold">
                          {selectedIds.size} Selected
                      </div>
                      <button onClick={() => setSelectedIds(new Set())} className="text-xs hover:underline opacity-80">
                          Clear Selection
                      </button>
                  </div>
                  <div className="flex items-center gap-3">
                      <button onClick={() => handleBulkStatusChange(ProductStatus.ACTIVE)} className="p-2 hover:bg-white/20 rounded-lg transition-colors" title="Mark Active">
                          <Eye size={20} />
                      </button>
                      <button onClick={() => handleBulkStatusChange(ProductStatus.SOLD_OUT)} className="p-2 hover:bg-white/20 rounded-lg transition-colors" title="Mark Sold Out">
                          <EyeOff size={20} />
                      </button>
                      <button onClick={handleBulkDelete} className="p-2 hover:bg-white/20 rounded-lg transition-colors text-white hover:text-rose-200" title="Delete Selected">
                          <Trash2 size={20} />
                      </button>
                  </div>
              </div>
          )}

          {/* Product List Content */}
          {currentItems.length > 0 ? (
              viewMode === 'list' ? (
                  // --- LIST VIEW ---
                  <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-soft border border-gray-100 dark:border-slate-700 overflow-hidden animate-fade-in">
                      <div className="overflow-x-auto">
                          <table className="w-full">
                              <thead>
                                  <tr className="border-b border-gray-100 dark:border-slate-700 text-left bg-gray-50/50 dark:bg-slate-700/30">
                                      <th className="p-4 w-12">
                                          <div className="relative flex items-center justify-center">
                                              <input 
                                                  type="checkbox" 
                                                  checked={isAllSelected}
                                                  ref={input => { if (input) input.indeterminate = isIndeterminate; }}
                                                  onChange={toggleSelectAll}
                                                  className="w-5 h-5 rounded border-gray-300 text-brand-600 focus:ring-brand-500 cursor-pointer"
                                              />
                                          </div>
                                      </th>
                                      <th className="p-4 text-xs font-extrabold text-gray-400 uppercase tracking-wider">Product</th>
                                      <th className="p-4 text-xs font-extrabold text-gray-400 uppercase tracking-wider">Category</th>
                                      <th className="p-4 text-xs font-extrabold text-gray-400 uppercase tracking-wider">Price</th>
                                      <th className="p-4 text-xs font-extrabold text-gray-400 uppercase tracking-wider">Stock</th>
                                      <th className="p-4 text-xs font-extrabold text-gray-400 uppercase tracking-wider">Expiry Date</th>
                                      <th className="p-4 text-xs font-extrabold text-gray-400 uppercase tracking-wider">Featured</th>
                                      <th className="p-4 text-xs font-extrabold text-gray-400 uppercase tracking-wider">Status</th>
                                      <th className="p-4 w-12"></th>
                                  </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-50 dark:divide-slate-700">
                                  {currentItems.map((product) => {
                                      const isHidden = product.isVisible === false;
                                      const isSoldOut = product.status === ProductStatus.SOLD_OUT || product.quantity <= 0;
                                      return (
                                      <tr 
                                        key={product.id} 
                                        className={`group transition-colors 
                                            ${isHidden ? 'bg-gray-100/50 dark:bg-slate-800/80 grayscale opacity-80 hover:opacity-100 hover:bg-gray-100 dark:hover:bg-slate-800' : ''} 
                                            ${selectedIds.has(product.id) ? 'bg-brand-50/30 dark:bg-brand-900/10' : (!isHidden ? 'hover:bg-gray-50 dark:hover:bg-slate-700/50' : '')}
                                        `}
                                      >
                                          <td className="p-4">
                                              <div className="flex items-center justify-center">
                                                  <input 
                                                      type="checkbox" 
                                                      checked={selectedIds.has(product.id)}
                                                      onChange={() => toggleSelectOne(product.id)}
                                                      className="w-5 h-5 rounded border-gray-300 text-brand-600 focus:ring-brand-500 cursor-pointer"
                                                  />
                                              </div>
                                          </td>
                                          <td className="p-4">
                                              <div className="flex items-center gap-4">
                                                  <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-gray-100 dark:bg-slate-700 shrink-0 border border-gray-200 dark:border-slate-600">
                                                      <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                                                      {product.isFeatured && !isHidden && (
                                                          <div className="absolute top-0 right-0 p-0.5 bg-amber-400 text-white rounded-bl-lg">
                                                              <Sparkles size={10} fill="currentColor" />
                                                          </div>
                                                      )}
                                                      {isHidden && (
                                                          <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                                                              <EyeOff size={20} className="text-gray-500" />
                                                          </div>
                                                      )}
                                                  </div>
                                                  <div>
                                                      <Link to={`/products/${product.id}`} className="font-bold text-gray-900 dark:text-white hover:text-brand-600 dark:hover:text-brand-400 transition-colors line-clamp-1">
                                                          {product.name}
                                                      </Link>
                                                      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                                          <span>SKU: {product.sku || product.id}</span>
                                                          {product.quantity < 5 && !isHidden && (
                                                              <span className="text-amber-500 font-bold flex items-center gap-0.5">
                                                                  <AlertCircle size={10} /> Low Stock
                                                              </span>
                                                          )}
                                                          {isHidden && (
                                                              <span className="text-gray-500 font-bold flex items-center gap-0.5">
                                                                  <EyeOff size={10} /> Hidden
                                                              </span>
                                                          )}
                                                      </div>
                                                  </div>
                                              </div>
                                          </td>
                                          <td className="p-4">
                                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-bold bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-gray-300 border border-gray-200 dark:border-slate-600">
                                                  {product.category}
                                              </span>
                                          </td>
                                          <td className="p-4">
                                              <div className="flex flex-col">
                                                  <span className="font-bold text-gray-900 dark:text-white">AED {product.discountedPrice.toFixed(2)}</span>
                                                  {product.originalPrice > product.discountedPrice && (
                                                      <span className="text-xs text-gray-400 line-through">AED {product.originalPrice.toFixed(2)}</span>
                                                  )}
                                              </div>
                                          </td>
                                          <td className="p-4">
                                              <div className="flex items-center gap-2">
                                                  <span className={`font-bold ${product.quantity === 0 ? 'text-gray-400' : 'text-gray-900 dark:text-white'}`}>
                                                      {product.quantity}
                                                  </span>
                                              </div>
                                          </td>
                                          <td className="p-4">
                                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-bold border ${getExpiryColorClass(product.expiryDate)}`}>
                                                  {new Date(product.expiryDate).toLocaleDateString()}
                                              </span>
                                          </td>
                                          <td className="p-4">
                                              <button
                                                  onClick={(e) => { e.stopPropagation(); toggleFeatured(product); }}
                                                  disabled={isSoldOut}
                                                  title={isSoldOut ? 'Cannot feature sold out item' : 'Toggle Featured'}
                                                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none 
                                                    ${product.isFeatured ? 'bg-amber-400' : 'bg-gray-200 dark:bg-gray-600'}
                                                    ${isSoldOut ? 'opacity-50 cursor-not-allowed' : ''}
                                                  `}
                                              >
                                                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${product.isFeatured ? 'translate-x-6' : 'translate-x-1'}`} />
                                              </button>
                                          </td>
                                          <td className="p-4">
                                              <Badge status={product.status} />
                                          </td>
                                          <td className="p-4 relative">
                                              <button 
                                                  onClick={(e) => { e.stopPropagation(); setActiveMenuProductId(activeMenuProductId === product.id ? null : product.id); }}
                                                  className={`p-2 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded-xl transition-all ${activeMenuProductId === product.id ? 'opacity-100 bg-brand-50 text-brand-600' : 'opacity-0 group-hover:opacity-100 focus:opacity-100'}`}
                                              >
                                                  <MoreHorizontal size={20} />
                                              </button>
                                              
                                              {activeMenuProductId === product.id && (
                                                  <div className="absolute right-8 top-8 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-gray-100 dark:border-slate-700 py-1 z-20 animate-in fade-in zoom-in-95 duration-200">
                                                      <Link to={`/edit-product/${product.id}`} className="block w-full text-left px-4 py-2.5 text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center gap-2">
                                                          <Edit3 size={16} /> Edit
                                                      </Link>
                                                      <button onClick={() => toggleVisibility(product)} className="w-full text-left px-4 py-2.5 text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center gap-2">
                                                          {product.isVisible !== false ? <EyeOff size={16} /> : <Eye size={16} />} 
                                                          {product.isVisible !== false ? 'Hide Product' : 'Show Product'}
                                                      </button>
                                                      <div className="h-px bg-gray-100 dark:bg-slate-700 my-1"></div>
                                                      <button onClick={() => handleDelete(product.id)} className="w-full text-left px-4 py-2.5 text-sm font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 flex items-center gap-2">
                                                          <Trash2 size={16} /> Delete
                                                      </button>
                                                  </div>
                                              )}
                                          </td>
                                      </tr>
                                  )})}
                              </tbody>
                          </table>
                      </div>
                  </div>
              ) : (
                  // --- GRID VIEW ---
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fade-in">
                      {currentItems.map((product) => {
                          const isHidden = product.isVisible === false;
                          const isSoldOut = product.status === ProductStatus.SOLD_OUT || product.quantity <= 0;
                          const isSelected = selectedIds.has(product.id);
                          
                          return (
                            <div key={product.id} className={`group bg-white dark:bg-slate-800 rounded-3xl border shadow-soft hover:shadow-lg transition-all relative flex flex-col ${isSelected ? 'border-brand-500 ring-1 ring-brand-500' : 'border-gray-100 dark:border-slate-700'}`}>
                                {/* Selection Checkbox (Absolute) */}
                                <div className="absolute top-3 left-3 z-10">
                                    <input 
                                        type="checkbox" 
                                        checked={isSelected}
                                        onChange={() => toggleSelectOne(product.id)}
                                        className="w-5 h-5 rounded border-gray-300 text-brand-600 focus:ring-brand-500 cursor-pointer shadow-sm bg-white"
                                    />
                                </div>

                                {/* Image Area */}
                                <div className="relative aspect-[4/3] bg-gray-100 dark:bg-slate-900 overflow-hidden rounded-t-3xl">
                                    <img src={product.imageUrl} alt={product.name} className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${isHidden ? 'grayscale opacity-70' : ''}`} />
                                    
                                    {/* Badges */}
                                    <div className="absolute top-3 right-3 flex flex-col gap-2 items-end">
                                        <Badge status={product.status} size="sm" className="shadow-sm backdrop-blur-sm bg-white/90" />
                                        {product.isFeatured && (
                                            <div className="bg-amber-400 text-white p-1.5 rounded-lg shadow-sm">
                                                <Sparkles size={12} fill="currentColor" />
                                            </div>
                                        )}
                                    </div>
                                    
                                    {isHidden && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/10 backdrop-blur-[1px]">
                                            <div className="bg-black/60 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                                                <EyeOff size={12} /> Hidden
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="p-5 flex-1 flex flex-col">
                                    <div className="mb-1 flex justify-between items-start">
                                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{product.category}</span>
                                        <span className="text-xs font-bold text-gray-400">Qty: {product.quantity}</span>
                                    </div>
                                    
                                    <Link to={`/products/${product.id}`} className="text-lg font-bold text-gray-900 dark:text-white hover:text-brand-600 transition-colors line-clamp-1 mb-2">
                                        {product.name}
                                    </Link>
                                    
                                    <div className="flex items-baseline gap-2 mb-4">
                                        <span className="text-xl font-extrabold text-brand-600 dark:text-brand-400">AED {product.discountedPrice.toFixed(2)}</span>
                                        {product.originalPrice > product.discountedPrice && (
                                            <span className="text-sm font-bold text-gray-400 line-through">AED {product.originalPrice.toFixed(2)}</span>
                                        )}
                                    </div>

                                    {/* Actions Footer */}
                                    <div className="mt-auto pt-4 border-t border-gray-100 dark:border-slate-700 flex items-center justify-between gap-2">
                                        <Link to={`/edit-product/${product.id}`} className="p-2 text-gray-500 hover:text-brand-600 hover:bg-brand-50 rounded-xl transition-colors">
                                            <Edit3 size={18} />
                                        </Link>
                                        <button onClick={() => toggleVisibility(product)} className="p-2 text-gray-500 hover:text-brand-600 hover:bg-brand-50 rounded-xl transition-colors">
                                            {product.isVisible !== false ? <Eye size={18} /> : <EyeOff size={18} />}
                                        </button>
                                        <button onClick={(e) => { e.stopPropagation(); toggleFeatured(product); }} disabled={isSoldOut} className={`p-2 rounded-xl transition-colors ${product.isFeatured ? 'text-amber-500 hover:bg-amber-50' : 'text-gray-400 hover:text-amber-500 hover:bg-amber-50'}`}>
                                            <Sparkles size={18} fill={product.isFeatured ? "currentColor" : "none"} />
                                        </button>
                                        <div className="h-4 w-px bg-gray-200 dark:bg-slate-700 mx-1"></div>
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); setActiveMenuProductId(activeMenuProductId === product.id ? null : product.id); }}
                                            className="p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl transition-colors relative"
                                        >
                                            <MoreHorizontal size={18} />
                                            {activeMenuProductId === product.id && (
                                                <div className="absolute bottom-full right-0 mb-2 w-40 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-gray-100 dark:border-slate-700 py-1 z-20 animate-in fade-in zoom-in-95 duration-200 text-left">
                                                    <button onClick={() => handleDelete(product.id)} className="w-full text-left px-4 py-2.5 text-sm font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 flex items-center gap-2">
                                                        <Trash2 size={16} /> Delete
                                                    </button>
                                                </div>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                          );
                      })}
                  </div>
              )
          ) : (
              <div className="p-12 text-center flex flex-col items-center bg-white dark:bg-slate-800 rounded-3xl shadow-soft border border-gray-100 dark:border-slate-700">
                  <div className="w-16 h-16 bg-gray-50 dark:bg-slate-700 rounded-full flex items-center justify-center mb-4 text-gray-400">
                      <Search size={24} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">No products found</h3>
                  <p className="text-gray-500 dark:text-gray-400 mt-1">Try adjusting your search or filters.</p>
                  <button onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }} className="mt-4 text-brand-600 font-bold hover:underline">
                      Clear Filters
                  </button>
              </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
              <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredProducts.length)} of {filteredProducts.length}
                  </p>
                  <div className="flex gap-2">
                      <button 
                          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                          disabled={currentPage === 1}
                          className="p-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                      >
                          <ChevronLeft size={20} />
                      </button>
                      <div className="flex items-center gap-1 px-2">
                          {Array.from({ length: totalPages }).map((_, i) => (
                              <button
                                  key={i}
                                  onClick={() => setCurrentPage(i + 1)}
                                  className={`w-8 h-8 rounded-lg text-sm font-bold transition-all ${
                                      currentPage === i + 1 
                                      ? 'bg-brand-600 text-white shadow-md shadow-brand-200' 
                                      : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-700'
                                  }`}
                              >
                                  {i + 1}
                              </button>
                          ))}
                      </div>
                      <button 
                          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                          disabled={currentPage === totalPages}
                          className="p-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                      >
                          <ChevronRight size={20} />
                      </button>
                  </div>
              </div>
          )}
      </div>
      <ImportWizardModal 
        isOpen={isImportModalOpen} 
        onClose={() => setIsImportModalOpen(false)} 
      />
    </div>
  );
};