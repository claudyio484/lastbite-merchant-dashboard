import React, { useState, useEffect, useRef } from 'react';
import { 
  Clock, 
  ShoppingBag, 
  Search, 
  Filter, 
  MoreVertical, 
  MapPin,
  Phone,
  X,
  Mail,
  CreditCard, 
  MessageSquare, 
  ExternalLink, 
  Navigation, 
  CheckCircle2, 
  Receipt, 
  Send, 
  ArrowLeft, 
  Calendar, 
  ArrowUpDown, 
  History, 
  Printer, 
  Ban, 
  Eye, 
  FileText,
  Bell
} from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { Badge } from '../components/ui/Badge';
import { Skeleton } from '../components/ui/Skeleton';
import { Order, OrderStatus } from '../types';
import { fetchOrders, updateOrderStatus } from '../utils/api';

const TABS = ['All', 'New', 'Preparing', 'Ready', 'Completed'];
const SORT_OPTIONS = [
    { label: 'Date: Newest', value: 'date_desc' },
    { label: 'Date: Oldest', value: 'date_asc' },
    { label: 'Total: High to Low', value: 'total_desc' },
    { label: 'Total: Low to High', value: 'total_asc' },
];

export const Orders: React.FC = () => {
  const [orderList, setOrderList] = useState<Order[]>([]);
  const [isHistoryView, setIsHistoryView] = useState(false);
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [orderType, setOrderType] = useState('All'); 
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [activeMenuOrderId, setActiveMenuOrderId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // History Filters
  const [historyDate, setHistoryDate] = useState('');
  const [sortOption, setSortOption] = useState('date_desc');

  const location = useLocation();

  // Load orders from API
  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await fetchOrders();
        if (res.success && res.data) {
          const mapped: Order[] = res.data.map((o: any) => ({
            id: o.orderNumber || o.id,
            customerName: o.customer ? `${o.customer.firstName} ${o.customer.lastName}` : 'Walk-in Customer',
            items: (o.items || []).map((i: any) => ({
              productName: i.productName,
              quantity: i.quantity,
              price: i.unitPrice,
            })),
            total: o.totalAmount,
            type: o.type === 'PICKUP' ? 'Pickup' : 'Delivery',
            status: o.status === 'NEW' ? OrderStatus.NEW
                  : o.status === 'PREPARING' ? OrderStatus.PREPARING
                  : o.status === 'READY' ? OrderStatus.READY
                  : OrderStatus.COMPLETED,
            timestamp: '',
            createdAt: o.createdAt,
            email: o.customer?.email,
            phone: o.customer?.phone,
            address: o.shippingAddress ? (typeof o.shippingAddress === 'string' ? o.shippingAddress : JSON.stringify(o.shippingAddress)) : '',
            paymentMethod: o.payment?.method || 'Card',
            paymentStatus: o.payment?.status === 'COMPLETED' ? 'Paid' : 'Unpaid',
            specialInstructions: o.notes,
            subtotal: o.subtotal,
            tax: o.taxAmount,
            _backendId: o.id, // Keep real UUID for API calls
          }));
          setOrderList(mapped);
        }
      } catch (err) {
        console.error('Orders load error:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  // Handle Navigation State (e.g. from Dashboard)
  useEffect(() => {
      if (location.state && location.state.activeTab) {
          setActiveTab(location.state.activeTab);
      }
  }, [location.state]);

  // Close menus on click outside
  useEffect(() => {
    const handleClickOutside = () => setActiveMenuOrderId(null);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  // Reset chat when order changes
  useEffect(() => {
    setIsChatOpen(false);
    setChatMessage('');
  }, [selectedOrder]);

  // Update selectedOrder if it changes in the main list
  useEffect(() => {
      if (selectedOrder) {
          const updated = orderList.find(o => o.id === selectedOrder.id);
          if (updated) setSelectedOrder(updated);
      }
  }, [orderList]);

  const filteredOrders = orderList.filter(order => {
    // 1. View Mode Filter
    if (isHistoryView) {
        // In History mode, show ALL orders that match date filter
    } else {
        // In Live mode, apply Tab filter
        if (activeTab !== 'All' && order.status !== activeTab) return false;
    }

    // 2. Search Filter
    const matchesSearch = order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          order.id.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    // 3. Type Filter
    const matchesType = orderType === 'All' || order.type === orderType;
    if (!matchesType) return false;

    // 4. Date Filter (Only in History View)
    if (isHistoryView && historyDate) {
        const orderDateStr = order.createdAt.slice(0, 10);
        if (orderDateStr !== historyDate) return false;
    }

    return true;
  }).sort((a, b) => {
    // 5. Sorting
    const dateA = new Date(a.createdAt).getTime();
    const dateB = new Date(b.createdAt).getTime();

    switch (sortOption) {
        case 'date_asc': return dateA - dateB;
        case 'total_desc': return b.total - a.total;
        case 'total_asc': return a.total - b.total;
        case 'date_desc': default: return dateB - dateA;
    }
  });

  const handleAction = async (e: React.MouseEvent, orderId: string, action: string) => {
    e.stopPropagation();

    let newStatus: OrderStatus | null = null;
    let backendStatus = '';

    switch(action) {
        case 'Accept': newStatus = OrderStatus.PREPARING; backendStatus = 'PREPARING'; break;
        case 'Ready': newStatus = OrderStatus.READY; backendStatus = 'READY'; break;
        case 'Complete': newStatus = OrderStatus.COMPLETED; backendStatus = 'DELIVERED'; break;
        case 'Cancel':
             if(window.confirm('Are you sure you want to cancel this order?')) {
               const order = orderList.find(o => o.id === orderId);
               const realId = (order as any)?._backendId || orderId;
               try {
                 await updateOrderStatus(realId, 'CANCELLED');
                 setOrderList(prev => prev.filter(o => o.id !== orderId));
                 if(selectedOrder?.id === orderId) setSelectedOrder(null);
               } catch (err) {
                 console.error('Cancel failed:', err);
               }
             }
             return;
    }

    if (newStatus) {
        const order = orderList.find(o => o.id === orderId);
        if (order) {
            const realId = (order as any)?._backendId || orderId;
            const newOrder = { ...order, status: newStatus as OrderStatus };
            setOrderList(prev => prev.map(o => o.id === orderId ? newOrder : o));
            try {
              await updateOrderStatus(realId, backendStatus);
            } catch (err) {
              // Revert on error
              setOrderList(prev => prev.map(o => o.id === orderId ? order : o));
              console.error('Status update failed:', err);
            }
        }
    }
    setActiveMenuOrderId(null);
  };

  const toggleMenu = (e: React.MouseEvent, orderId: string) => {
      e.stopPropagation();
      setActiveMenuOrderId(activeMenuOrderId === orderId ? null : orderId);
  }

  const handleSendChat = () => {
    if(!chatMessage.trim()) return;
    console.log("Sending message:", chatMessage);
    setChatMessage('');
  }

  const handleCall = (e: React.MouseEvent, phone?: string) => {
      e.stopPropagation();
      if(phone) window.open(`tel:${phone}`);
  }

  const handleEmail = (e: React.MouseEvent, email?: string) => {
      e.stopPropagation();
      if(email) window.open(`mailto:${email}`);
  }

  const handleOpenChatFromCard = (e: React.MouseEvent, order: Order) => {
      e.stopPropagation();
      setSelectedOrder(order);
      setIsChatOpen(true);
  }

  const handlePrintReceipt = (order: Order | null) => {
    if (!order) return;
    
    const receiptWindow = window.open('', '_blank', 'width=400,height=600');
    if (receiptWindow) {
        receiptWindow.document.write(`
            <html>
                <head>
                    <title>Receipt ${order.id}</title>
                    <style>
                        body { font-family: 'Courier New', monospace; padding: 20px; font-size: 12px; }
                        .header { text-align: center; margin-bottom: 20px; border-bottom: 1px dashed #000; padding-bottom: 10px; }
                        .store-name { font-size: 16px; font-weight: bold; }
                        .info { margin-bottom: 10px; }
                        .items { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
                        .items th, .items td { text-align: left; padding: 5px 0; }
                        .items th { border-bottom: 1px solid #000; }
                        .totals { width: 100%; margin-top: 10px; border-top: 1px dashed #000; pt: 10px; }
                        .totals td { text-align: right; padding: 2px 0; }
                        .footer { text-align: center; margin-top: 20px; font-size: 10px; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <div class="store-name">Joe's Grocery</div>
                        <div>Business Bay, Dubai</div>
                        <div>TRN: 100293847192837</div>
                    </div>
                    <div class="info">
                        <strong>Order: ${order.id}</strong><br>
                        Date: ${new Date(order.createdAt).toLocaleDateString()} ${new Date(order.createdAt).toLocaleTimeString()}<br>
                        Customer: ${order.customerName}<br>
                        Type: ${order.type}
                    </div>
                    <table class="items">
                        <thead>
                            <tr>
                                <th>Item</th>
                                <th>Qty</th>
                                <th>Price</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${order.items.map(item => `
                                <tr>
                                    <td>${item.productName}</td>
                                    <td>${item.quantity}</td>
                                    <td>AED ${(item.price || 0).toFixed(2)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                    <table class="totals">
                        <tr>
                            <td>Subtotal:</td>
                            <td>AED ${(order.subtotal || 0).toFixed(2)}</td>
                        </tr>
                        <tr>
                            <td>VAT (5%):</td>
                            <td>AED ${(order.tax || 0).toFixed(2)}</td>
                        </tr>
                        <tr style="font-weight: bold; font-size: 14px;">
                            <td>Total:</td>
                            <td>AED ${(order.total).toFixed(2)}</td>
                        </tr>
                    </table>
                    <div class="footer">
                        Thank you for shopping with LastBite!<br>
                        Help us reduce food waste.
                    </div>
                </body>
            </html>
        `);
        receiptWindow.document.close();
        receiptWindow.focus();
        receiptWindow.print();
    }
  };

  const getOrderCardStyles = (status: OrderStatus) => {
    switch(status) {
      case OrderStatus.NEW:
        return 'bg-purple-50/40 dark:bg-purple-900/10 border-purple-200 dark:border-purple-800/30';
      case OrderStatus.PREPARING:
        return 'bg-amber-50/40 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800/30';
      case OrderStatus.READY:
        return 'bg-emerald-50/40 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800/30';
      case OrderStatus.COMPLETED:
        return 'bg-slate-50/50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700';
      default:
        return 'bg-white dark:bg-slate-800 border-gray-100 dark:border-slate-700';
    }
  };

  const getStatusDotColor = (status: OrderStatus) => {
    switch(status) {
      case OrderStatus.NEW: return 'bg-purple-500 shadow-purple-200';
      case OrderStatus.PREPARING: return 'bg-amber-500 shadow-amber-200';
      case OrderStatus.READY: return 'bg-emerald-500 shadow-emerald-200';
      case OrderStatus.COMPLETED: return 'bg-slate-500 shadow-slate-200';
      default: return 'bg-gray-400';
    }
  };

  const getTabStyles = (tab: string, isActive: boolean) => {
    if (!isActive) return 'bg-white dark:bg-slate-800 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700 shadow-soft';
    
    switch (tab) {
        case 'New': return 'bg-purple-600 text-white shadow-md shadow-purple-200';
        case 'Preparing': return 'bg-amber-500 text-white shadow-md shadow-amber-200';
        case 'Ready': return 'bg-emerald-600 text-white shadow-md shadow-emerald-200';
        case 'Completed': return 'bg-slate-600 text-white shadow-md shadow-slate-200';
        default: return 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-lg';
    }
  };

  // Helper to format timestamp relative time
  const formatTimeAgo = (dateStr: string) => {
      const diff = Date.now() - new Date(dateStr).getTime();
      const mins = Math.floor(diff / 60000);
      if (mins < 60) return `${mins} mins ago`;
      const hours = Math.floor(mins / 60);
      if (hours < 24) return `${hours} hours ago`;
      return `${Math.floor(hours / 24)} days ago`;
  };

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto relative animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
           <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">{isHistoryView ? 'Order History' : 'Orders'}</h1>
           <p className="text-gray-500 dark:text-gray-400 font-medium mt-1">
             {isHistoryView ? 'View and filter past transactions' : 'Manage and track your customer orders'}
           </p>
        </div>
        
        <div className="flex gap-3">
           <button 
             onClick={() => setIsHistoryView(!isHistoryView)}
             className={`flex items-center gap-2 px-5 py-3 shadow-soft rounded-xl font-bold transition-all ${
                isHistoryView 
                ? 'bg-brand-600 text-white hover:bg-brand-700' 
                : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700'
             }`}
           >
              {isHistoryView ? <ArrowLeft size={18} /> : <History size={18} />}
              {isHistoryView ? 'Back to Live' : 'History'}
           </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="space-y-4">
        <div className="flex flex-col lg:flex-row justify-between gap-6">
           {/* Tabs OR History Toolbar */}
           {!isHistoryView ? (
               <div className="flex overflow-x-auto pb-2 lg:pb-0 gap-2 no-scrollbar">
                  {TABS.map((tab) => (
                     <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-6 py-3 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${getTabStyles(tab, activeTab === tab)}`}
                     >
                        {tab}
                     </button>
                  ))}
               </div>
           ) : (
               <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                    {/* Date Picker */}
                    <div className="relative group">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                            type="date" 
                            value={historyDate}
                            onChange={(e) => setHistoryDate(e.target.value)}
                            className="pl-12 pr-4 py-3 bg-white dark:bg-slate-800 border-none rounded-2xl shadow-soft focus:ring-2 focus:ring-brand-500/20 focus:outline-none font-medium text-gray-700 dark:text-white h-full"
                        />
                        {historyDate && (
                             <button 
                                onClick={() => setHistoryDate('')}
                                className="absolute right-8 top-1/2 -translate-y-1/2 text-rose-500 hover:text-rose-600 text-xs font-bold"
                             >
                                Clear
                             </button>
                        )}
                    </div>

                    {/* Sort Dropdown */}
                    <div className="relative group min-w-[200px]">
                        <ArrowUpDown className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <select
                            value={sortOption}
                            onChange={(e) => setSortOption(e.target.value)}
                            className="w-full pl-12 pr-8 py-3 bg-white dark:bg-slate-800 border-none rounded-2xl shadow-soft focus:ring-2 focus:ring-brand-500/20 focus:outline-none font-medium text-gray-700 dark:text-white appearance-none cursor-pointer h-full"
                        >
                            {SORT_OPTIONS.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>
               </div>
           )}

           {/* Search & Toggle */}
           <div className="flex gap-4 w-full lg:w-auto">
              <div className="relative flex-1 lg:w-80 group">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-500 transition-colors" size={20} />
                 <input 
                    type="text" 
                    placeholder="Search order ID or customer..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-800 border-none rounded-2xl shadow-soft focus:ring-2 focus:ring-brand-500/20 focus:outline-none font-medium dark:text-white"
                 />
              </div>
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className={`p-3 rounded-2xl transition-all shadow-soft ${
                    showFilters || orderType !== 'All' 
                    ? 'bg-brand-600 text-white hover:bg-brand-700' 
                    : 'bg-white dark:bg-slate-800 text-gray-500 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400'
                }`}
              >
                 <Filter size={20} />
              </button>
           </div>
        </div>

        {/* Extended Filter Panel */}
        {(showFilters || orderType !== 'All') && (
           <div className="bg-white dark:bg-slate-800 p-4 rounded-3xl shadow-soft border border-gray-100 dark:border-slate-700 flex items-center gap-4 animate-in fade-in slide-in-from-top-1">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider pl-2">Order Type:</span>
              <div className="flex gap-2">
                 {['All', 'Pickup', 'Delivery'].map(type => (
                    <button
                        key={type}
                        onClick={() => setOrderType(type)}
                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                            orderType === type 
                            ? 'bg-brand-100 dark:bg-brand-900 text-brand-800 dark:text-brand-300' 
                            : 'bg-cream-50 dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-cream-100 dark:hover:bg-slate-600'
                        }`}
                    >
                        {type}
                    </button>
                 ))}
              </div>
              {orderType !== 'All' && (
                  <button 
                    onClick={() => setOrderType('All')}
                    className="ml-auto text-xs font-bold text-rose-500 hover:text-rose-600 flex items-center gap-1"
                  >
                     <X size={14} /> Clear
                  </button>
              )}
           </div>
        )}
      </div>

      {/* Grid Grid of Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-12">
        {isLoading ? (
          // Skeleton Loading State
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-3xl p-5 shadow-soft border bg-white dark:bg-slate-800 border-gray-100 dark:border-slate-700 h-[300px] flex flex-col justify-between">
               <div className="flex justify-between">
                  <div className="space-y-2">
                     <Skeleton className="w-24 h-6 rounded-lg" />
                     <Skeleton className="w-16 h-4 rounded" />
                  </div>
                  <Skeleton className="w-16 h-6 rounded-full" />
               </div>
               <div className="flex items-center gap-3 my-4">
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <div className="space-y-1.5">
                     <Skeleton className="w-32 h-4 rounded" />
                     <Skeleton className="w-20 h-3 rounded" />
                  </div>
               </div>
               <Skeleton className="w-full h-24 rounded-2xl mb-4" />
               <div className="flex gap-2">
                  <Skeleton className="flex-1 h-10 rounded-xl" />
                  <Skeleton className="w-10 h-10 rounded-xl" />
               </div>
            </div>
          ))
        ) : filteredOrders.length > 0 ? (
           filteredOrders.map((order, index) => (
             <div 
               key={order.id} 
               onClick={() => setSelectedOrder(order)}
               className={`rounded-3xl p-5 shadow-soft border hover:shadow-lg transition-all group cursor-pointer flex flex-col h-full relative animate-slide-up ${getOrderCardStyles(order.status)}`}
               style={{ animationDelay: `${index * 0.05}s` }}
             >
               {/* Header: ID, Time, Status */}
               <div className="flex justify-between items-start mb-4">
                  <div>
                     <span className="block text-xl font-extrabold text-gray-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">{order.id}</span>
                     <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400 mt-1">
                        <Clock size={12} /> {formatTimeAgo(order.createdAt)}
                     </div>
                  </div>
                  <Badge status={order.status} size="lg" />
               </div>

               {/* Customer Info */}
               <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-100 to-brand-200 dark:from-brand-900 dark:to-brand-800 flex items-center justify-center text-brand-700 dark:text-brand-300 font-bold text-sm shadow-sm">
                     {order.customerName.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                     <h3 className="font-bold text-gray-900 dark:text-white text-sm truncate">{order.customerName}</h3>
                     <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 font-medium">
                         <span className="flex items-center gap-1"><MapPin size={10} /> {order.type}</span>
                     </div>
                  </div>
                  
                  {/* Chat Icon - Placed before Phone */}
                  <button 
                    onClick={(e) => handleOpenChatFromCard(e, order)}
                    className={`p-2 rounded-xl transition-colors relative ${order.hasUnreadMessage ? 'bg-brand-50 text-brand-600 hover:bg-brand-100' : 'text-gray-400 hover:text-brand-600 hover:bg-brand-50'}`}
                  >
                     <MessageSquare size={16} />
                     {order.hasUnreadMessage && (
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border border-white dark:border-slate-800"></span>
                     )}
                  </button>

                  <button className="p-2 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded-xl transition-colors" onClick={(e) => handleCall(e, order.phone)}>
                     <Phone size={16} />
                  </button>
               </div>

               {/* Items Summary - Flexible height */}
               <div className="bg-white/60 dark:bg-slate-900/60 rounded-2xl p-3 mb-4 flex-1 flex flex-col justify-center border border-gray-100/50 dark:border-slate-700/50">
                  <div className="flex justify-between items-center mb-2 pb-2 border-b border-gray-200/50 dark:border-slate-700">
                     <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Items ({order.items.length})</span>
                     <span className="text-sm font-extrabold text-gray-900 dark:text-white">AED {order.total.toFixed(2)}</span>
                  </div>
                  <ul className="space-y-1.5">
                     {order.items.slice(0, 3).map((item, idx) => (
                        <li key={idx} className="flex justify-between text-sm font-medium text-gray-700 dark:text-gray-300">
                           <span className="truncate pr-2"><span className="font-bold text-brand-600">{item.quantity}x</span> {item.productName}</span>
                        </li>
                     ))}
                     {order.items.length > 3 && (
                         <li className="text-xs text-gray-400 font-bold italic pt-1">
                             + {order.items.length - 3} more items...
                         </li>
                     )}
                  </ul>
               </div>

               {/* Actions Footer */}
               <div className="flex gap-2 mt-auto pt-2 border-t border-gray-100/50 dark:border-slate-700/50 relative">
                  {/* Logic for main button based on status */}
                  {order.status === OrderStatus.NEW && (
                     <button 
                         onClick={(e) => handleAction(e, order.id, 'Accept')}
                         className="flex-1 py-2.5 px-4 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 shadow-md shadow-purple-200 transition-all text-sm flex items-center justify-center gap-2"
                     >
                        Accept Order
                     </button>
                  )}
                  {order.status === OrderStatus.PREPARING && (
                     <button 
                         onClick={(e) => handleAction(e, order.id, 'Ready')}
                         className="flex-1 py-2.5 px-4 bg-amber-500 text-white font-bold rounded-xl hover:bg-amber-600 shadow-md shadow-amber-200 transition-all text-sm flex items-center justify-center gap-2"
                     >
                        Mark Ready
                     </button>
                  )}
                  {order.status === OrderStatus.READY && (
                     <button 
                         onClick={(e) => handleAction(e, order.id, 'Complete')}
                         className="flex-1 py-2.5 px-4 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 shadow-md shadow-emerald-200 transition-all text-sm flex items-center justify-center gap-2"
                     >
                        Complete
                     </button>
                  )}
                  {order.status === OrderStatus.COMPLETED && (
                     <button className="flex-1 py-2.5 px-4 bg-slate-100 dark:bg-slate-700 text-gray-500 dark:text-gray-300 font-bold rounded-xl cursor-default text-sm flex items-center justify-center gap-2 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
                        View Details
                     </button>
                  )}

                  <div className="relative">
                    <button 
                        onClick={(e) => toggleMenu(e, order.id)}
                        className="p-2.5 border border-gray-200 dark:border-slate-600 text-gray-500 dark:text-gray-400 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 hover:text-gray-900 dark:hover:text-white transition-all bg-white dark:bg-slate-800"
                    >
                        <MoreVertical size={18} />
                    </button>
                    
                    {activeMenuOrderId === order.id && (
                        <div className="absolute bottom-full right-0 mb-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-gray-100 dark:border-slate-700 py-1 z-20 animate-in fade-in zoom-in-95 duration-200">
                             <button onClick={(e) => { e.stopPropagation(); handlePrintReceipt(order); }} className="w-full text-left px-4 py-2.5 text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center gap-2">
                                 <Printer size={16} /> Print Receipt
                             </button>
                             <div className="h-px bg-gray-100 dark:bg-slate-700 my-1"></div>
                             <button onClick={(e) => handleAction(e, order.id, 'Cancel')} className="w-full text-left px-4 py-2.5 text-sm font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 flex items-center gap-2">
                                 <Ban size={16} /> Cancel Order
                             </button>
                        </div>
                    )}
                  </div>
               </div>
             </div>
           ))
        ) : (
           <div className="col-span-full text-center py-20 bg-white dark:bg-slate-800 rounded-3xl border border-dashed border-gray-200 dark:border-slate-600 animate-fade-in">
              <div className="w-16 h-16 bg-gray-50 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                 <ShoppingBag size={24} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">No orders found</h3>
              <p className="text-gray-500 dark:text-gray-400">Try adjusting your filters or search query.</p>
           </div>
        )}
      </div>

      {/* ORDER DETAILS SLIDE-OVER */}
      {selectedOrder && (
        <>
          <div 
            className="fixed inset-0 bg-stone-900/30 backdrop-blur-sm z-40 transition-opacity animate-fade-in"
            onClick={() => setSelectedOrder(null)}
          />
          <div className="fixed inset-y-0 right-0 w-full md:w-[480px] bg-white dark:bg-slate-800 shadow-2xl z-50 flex flex-col animate-slide-in-right duration-300">
             
             {/* HEADER (Fixed) */}
             <div className="shrink-0 p-6 flex items-center justify-between z-10 border-b border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800">
                <div>
                   <div className="flex items-center gap-3">
                        <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">{selectedOrder.id}</h2>
                        <div className={`w-3.5 h-3.5 rounded-full ${getStatusDotColor(selectedOrder.status)}`} />
                   </div>
                   <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mt-1">{formatTimeAgo(selectedOrder.createdAt)}</p>
                </div>
                <div className="flex items-center gap-4">
                   <Badge status={selectedOrder.status} size="lg" />
                   <button 
                      onClick={() => setSelectedOrder(null)}
                      className="p-2 bg-white/50 dark:bg-slate-800/50 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                   >
                      <X size={20} />
                   </button>
                </div>
             </div>

             {/* SCROLLABLE CONTENT */}
             <div className="flex-1 overflow-y-auto p-6 space-y-8 relative">
                
                {/* NEW MESSAGE ALERT BANNER */}
                {selectedOrder.hasUnreadMessage && (
                    <div className="bg-brand-50 dark:bg-brand-900/20 border border-brand-100 dark:border-brand-800 rounded-2xl p-4 flex items-center gap-4 animate-in fade-in slide-in-from-top-2">
                        <div className="bg-white dark:bg-slate-800 p-2 rounded-xl text-brand-600 shadow-sm shrink-0">
                            <Bell size={20} className="animate-pulse" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-bold text-brand-900 dark:text-white">New Message from Customer</p>
                            <p className="text-xs text-brand-700 dark:text-brand-300">Check the chat to respond to their query.</p>
                        </div>
                        <button 
                            onClick={() => setIsChatOpen(true)}
                            className="text-xs font-bold bg-brand-600 text-white px-3 py-2 rounded-lg hover:bg-brand-700 transition-colors"
                        >
                            View
                        </button>
                    </div>
                )}

                {/* Contact Card */}
                <div className="bg-cream-50 dark:bg-slate-900 rounded-3xl p-6 border border-gray-100 dark:border-slate-700">
                   <div className="flex items-center gap-4 mb-6">
                      <div className="w-16 h-16 rounded-full bg-brand-100 dark:bg-brand-900 flex items-center justify-center text-brand-700 dark:text-brand-300 font-bold text-2xl border-4 border-white dark:border-slate-800 shadow-sm">
                         {selectedOrder.customerName.charAt(0)}
                      </div>
                      <div>
                         <h3 className="text-lg font-bold text-gray-900 dark:text-white">{selectedOrder.customerName}</h3>
                         <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Customer since 2022</p>
                      </div>
                   </div>
                   <div className="grid grid-cols-3 gap-3">
                      <button onClick={(e) => handleCall(e, selectedOrder.phone)} className="flex items-center justify-center gap-2 py-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-brand-50 hover:text-brand-700 hover:border-brand-200 transition-all shadow-sm">
                         <Phone size={16} /> Call
                      </button>
                      <button onClick={(e) => handleEmail(e, selectedOrder.email)} className="flex items-center justify-center gap-2 py-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-brand-50 hover:text-brand-700 hover:border-brand-200 transition-all shadow-sm">
                         <Mail size={16} /> Email
                      </button>
                      <button 
                         onClick={() => setIsChatOpen(true)}
                         className={`flex items-center justify-center gap-2 py-3 border rounded-xl text-xs font-bold shadow-sm transition-all relative ${
                             selectedOrder.hasUnreadMessage 
                             ? 'bg-white border-brand-200 text-brand-600 hover:bg-brand-50' 
                             : 'bg-brand-600 border-brand-600 text-white hover:bg-brand-700'
                         }`}
                      >
                         <MessageSquare size={16} /> Chat
                         {selectedOrder.hasUnreadMessage && (
                             <span className="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 rounded-full border-2 border-white dark:border-slate-900"></span>
                         )}
                      </button>
                   </div>
                </div>

                {/* Location / Map */}
                <div className="space-y-3">
                   <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Location</h3>
                   <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden group">
                      {/* Fake Map */}
                      <div className="h-32 bg-slate-100 dark:bg-slate-900 relative w-full overflow-hidden">
                          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px]"></div>
                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                              <div className="relative">
                                  <span className="absolute -inset-2 rounded-full bg-brand-500/20 animate-ping"></span>
                                  <MapPin className="text-brand-600 relative z-10 drop-shadow-md" size={32} fill="currentColor" />
                              </div>
                          </div>
                      </div>
                      <div className="p-4 flex items-center justify-between bg-white dark:bg-slate-800 relative z-10">
                          <div className="flex items-start gap-3">
                              <div className="p-2 bg-cream-50 dark:bg-slate-900 rounded-lg text-gray-500 dark:text-gray-400 shrink-0">
                                  {selectedOrder.type === 'Delivery' ? <Navigation size={18} /> : <ShoppingBag size={18} />}
                              </div>
                              <div>
                                  <p className="text-sm font-bold text-gray-900 dark:text-white">{selectedOrder.type}</p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium max-w-[200px]">{selectedOrder.address}</p>
                              </div>
                          </div>
                          <button className="text-brand-600 hover:text-brand-700 p-2 hover:bg-brand-50 rounded-lg transition-colors">
                              <ExternalLink size={18} />
                          </button>
                      </div>
                   </div>
                   
                   {/* Explicit Text Location Field */}
                   <div className="p-4 bg-gray-50 dark:bg-slate-900/50 rounded-2xl border border-gray-100 dark:border-slate-700 flex items-start gap-3">
                       <FileText size={18} className="text-gray-400 shrink-0 mt-0.5" />
                       <div>
                           <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Text Location Details</p>
                           <p className="text-sm font-medium text-gray-900 dark:text-white leading-relaxed">
                                {selectedOrder.address}
                                {selectedOrder.locationNotes && <span className="block mt-1 text-gray-500 dark:text-gray-400">{selectedOrder.locationNotes}</span>}
                           </p>
                       </div>
                   </div>
                </div>

                {/* Special Instructions */}
                {selectedOrder.specialInstructions && (
                   <div className="space-y-3">
                      <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Instructions</h3>
                      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/30 rounded-2xl p-4 flex gap-3 text-amber-900 dark:text-amber-300">
                          <MessageSquare size={18} className="shrink-0 mt-0.5 text-amber-600" />
                          <p className="text-sm font-medium italic">"{selectedOrder.specialInstructions}"</p>
                      </div>
                   </div>
                )}

                {/* Order Summary */}
                <div className="space-y-3">
                   <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Order Details</h3>
                   <div className="bg-white dark:bg-slate-800 rounded-3xl border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden">
                       <div className="p-6 border-b border-gray-50 dark:border-slate-700 space-y-4">
                           {selectedOrder.items.map((item, i) => (
                               <div key={i} className="flex justify-between items-start">
                                   <div className="flex gap-3">
                                       <div className="w-6 h-6 rounded bg-brand-100 dark:bg-brand-900 text-brand-700 dark:text-brand-300 flex items-center justify-center text-xs font-bold">
                                           {item.quantity}x
                                       </div>
                                       <span className="text-sm font-bold text-gray-700 dark:text-gray-300">{item.productName}</span>
                                   </div>
                                   <span className="text-sm font-bold text-gray-900 dark:text-white">AED {(item.price ? item.price * item.quantity : 0).toFixed(2)}</span>
                               </div>
                           ))}
                       </div>
                       
                       {/* Payment Summary */}
                       <div className="p-6 bg-cream-50/50 dark:bg-slate-900/50 space-y-3">
                           <div className="flex justify-between text-sm">
                               <span className="text-gray-500 dark:text-gray-400 font-medium">Subtotal</span>
                               <span className="font-bold text-gray-900 dark:text-white">AED {(selectedOrder.subtotal || 0).toFixed(2)}</span>
                           </div>
                           <div className="flex justify-between text-sm">
                               <span className="text-gray-500 dark:text-gray-400 font-medium">VAT (5%)</span>
                               <span className="font-bold text-gray-900 dark:text-white">AED {(selectedOrder.tax || 0).toFixed(2)}</span>
                           </div>
                           <div className="pt-3 border-t border-gray-200 dark:border-slate-700 flex justify-between items-center">
                               <span className="text-base font-extrabold text-gray-900 dark:text-white">Total</span>
                               <span className="text-xl font-extrabold text-brand-600 dark:text-brand-400">AED {selectedOrder.total.toFixed(2)}</span>
                           </div>
                       </div>
                   </div>
                </div>

                {/* Payment Method */}
                <div className="flex items-center justify-between p-4 rounded-2xl border border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm">
                   <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
                         <CreditCard size={18} />
                      </div>
                      <div>
                         <p className="text-sm font-bold text-gray-900 dark:text-white">{selectedOrder.paymentMethod || 'Credit Card'}</p>
                         <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{selectedOrder.paymentStatus}</p>
                      </div>
                   </div>
                   <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-xs font-bold bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded-md">
                      <CheckCircle2 size={12} /> Paid
                   </div>
                </div>

             </div>

             {/* FOOTER (Fixed) */}
             <div className="shrink-0 bg-white dark:bg-slate-800 border-t border-gray-100 dark:border-slate-700 p-6 flex gap-4">
                 <button 
                    onClick={() => handlePrintReceipt(selectedOrder)}
                    className="flex-1 py-4 rounded-2xl font-bold bg-brand-600 text-white shadow-lg shadow-brand-200 hover:bg-brand-700 transition-all flex items-center justify-center gap-2"
                 >
                    <Printer size={18} /> Print Receipt
                 </button>
                 <button className="px-6 py-4 rounded-2xl font-bold bg-cream-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-cream-200 dark:hover:bg-slate-600 transition-all">
                    Help
                 </button>
             </div>

             {/* === CHAT CONVERSATION OVERLAY === */}
             {isChatOpen && (
               <div className="absolute inset-0 bg-white dark:bg-slate-800 z-50 flex flex-col animate-slide-in-right duration-300">
                  {/* Chat Header */}
                  <div className="h-20 px-6 border-b border-gray-100 dark:border-slate-700 flex items-center justify-between bg-white dark:bg-slate-800 shrink-0">
                     <div className="flex items-center gap-4">
                        <button 
                          onClick={() => setIsChatOpen(false)}
                          className="p-2 -ml-2 text-gray-500 hover:bg-gray-100 rounded-xl transition-colors"
                        >
                           <ArrowLeft size={20} />
                        </button>
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold border-2 border-white shadow-sm">
                              {selectedOrder.customerName.charAt(0)}
                           </div>
                           <div>
                              <h3 className="font-bold text-gray-900 dark:text-white text-sm">{selectedOrder.customerName}</h3>
                              <p className="text-xs text-emerald-500 font-bold flex items-center gap-1">
                                 <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span> Online
                              </p>
                           </div>
                        </div>
                     </div>
                     <button className="p-2 text-gray-400 hover:text-gray-600">
                        <MoreVertical size={20} />
                     </button>
                  </div>

                  {/* Chat Messages */}
                  <div className="flex-1 overflow-y-auto p-6 bg-cream-50 dark:bg-slate-900 space-y-4">
                     <div className="text-center text-xs font-bold text-gray-400 my-4">Today</div>
                     
                     {/* Incoming */}
                     <div className="flex justify-start">
                        <div className="max-w-[80%] space-y-1">
                           <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl rounded-tl-none text-sm text-gray-700 dark:text-gray-200 shadow-sm border border-gray-100 dark:border-slate-700">
                              Hi! Is my order ready to be picked up?
                           </div>
                           <span className="text-[10px] text-gray-400 font-bold pl-1">10:42 AM</span>
                        </div>
                     </div>

                     {/* Outgoing (Mock) */}
                     <div className="flex justify-end">
                        <div className="max-w-[80%] space-y-1 items-end flex flex-col">
                           <div className="bg-brand-600 p-4 rounded-2xl rounded-tr-none text-sm text-white shadow-md shadow-brand-100">
                              Almost there! Just bagging the items now. See you in 5 mins!
                           </div>
                           <span className="text-[10px] text-gray-400 font-bold pr-1">10:45 AM</span>
                        </div>
                     </div>
                  </div>

                  {/* Chat Input */}
                  <div className="p-4 bg-white dark:bg-slate-800 border-t border-gray-100 dark:border-slate-700 shrink-0">
                     <div className="flex items-center gap-2 bg-gray-50 dark:bg-slate-900 p-2 rounded-xl border border-gray-100 dark:border-slate-700 focus-within:ring-2 focus-within:ring-brand-500/20 focus-within:bg-white dark:focus-within:bg-slate-800 transition-all">
                        <input 
                           type="text" 
                           value={chatMessage}
                           onChange={(e) => setChatMessage(e.target.value)}
                           onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
                           placeholder="Type your message..."
                           className="flex-1 bg-transparent border-none focus:ring-0 px-4 py-2 text-sm font-medium text-gray-900 dark:text-white outline-none"
                        />
                        <button 
                           onClick={handleSendChat}
                           className={`p-3 rounded-xl transition-all shadow-sm ${
                             chatMessage.trim() 
                               ? 'bg-brand-600 text-white hover:bg-brand-700 shadow-brand-200' 
                               : 'bg-gray-200 dark:bg-slate-700 text-gray-400 cursor-not-allowed'
                           }`}
                        >
                           <Send size={18} />
                        </button>
                     </div>
                  </div>
               </div>
             )}
          </div>
        </>
      )}
    </div>
  );
};