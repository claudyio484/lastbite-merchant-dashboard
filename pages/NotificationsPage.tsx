import React, { useState, useEffect, useMemo } from 'react';
import { 
  Bell, 
  Package, 
  AlertCircle, 
  MessageSquare, 
  Check, 
  CheckCircle2, 
  Calendar,
  Filter,
  X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getOrders } from '../utils/orderStorage';
import { getProducts } from '../utils/productStorage';
import { getConversations } from '../utils/messageStorage';
import { OrderStatus, NotificationItem } from '../types';

export const NotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'All' | 'Orders' | 'Alerts' | 'Messages'>('All');
  const [filterDate, setFilterDate] = useState('');
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  
  // Load Notifications logic duplicated from Layout but with local state for reading
  useEffect(() => {
      const loadData = () => {
          const orders = getOrders();
          const products = getProducts();
          const conversations = getConversations();
          
          const notifs: NotificationItem[] = [];

          // Orders
          orders.forEach(o => {
              if (o.status === OrderStatus.NEW) {
                  notifs.push({
                      id: `order-${o.id}`,
                      title: `New Order ${o.id}`,
                      message: `${o.customerName} placed a ${o.type} order.`,
                      time: o.timestamp || 'Just now',
                      date: o.createdAt.split('T')[0],
                      type: 'order',
                      unread: true, // In real app, check distinct notification status
                      link: '/orders'
                  });
              }
          });

          // Alerts
          products.forEach(p => {
              if (p.quantity < 5 && p.quantity > 0) {
                  notifs.push({
                      id: `product-${p.id}`,
                      title: 'Low Stock Alert',
                      message: `${p.name} is below threshold (${p.quantity} units).`,
                      time: 'Action Needed',
                      date: new Date().toISOString().split('T')[0],
                      type: 'alert',
                      unread: true,
                      link: '/products'
                  });
              }
          });

          // Messages
          conversations.forEach(c => {
              if (c.unread > 0) {
                  notifs.push({
                      id: `msg-${c.id}`,
                      title: 'New Message',
                      message: `${c.name}: ${c.lastMessage}`,
                      time: c.time,
                      date: new Date().toISOString().split('T')[0],
                      type: 'message',
                      unread: true,
                      link: '/messages'
                  });
              }
          });
          
          // Sort by "date" roughly (mock)
          setNotifications(notifs);
      };
      
      loadData();
  }, []);

  const markAsRead = (id: string) => {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, unread: false } : n));
  };

  const markAllAsRead = () => {
      setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  const filteredNotifications = useMemo(() => {
      return notifications.filter(n => {
          // Type Filter
          if (activeTab === 'Orders' && n.type !== 'order') return false;
          if (activeTab === 'Alerts' && n.type !== 'alert') return false;
          if (activeTab === 'Messages' && n.type !== 'message') return false;
          
          // Date Filter
          if (filterDate && n.date !== filterDate) return false;
          
          return true;
      });
  }, [notifications, activeTab, filterDate]);

  const getIcon = (type: string) => {
      switch(type) {
          case 'order': return <Package size={20} className="text-purple-600" />;
          case 'alert': return <AlertCircle size={20} className="text-rose-500" />;
          case 'message': return <MessageSquare size={20} className="text-brand-600" />;
          default: return <Bell size={20} className="text-gray-500" />;
      }
  };

  const getBgColor = (type: string) => {
      switch(type) {
          case 'order': return 'bg-purple-50 dark:bg-purple-900/20';
          case 'alert': return 'bg-rose-50 dark:bg-rose-900/20';
          case 'message': return 'bg-brand-50 dark:bg-brand-900/20';
          default: return 'bg-gray-50 dark:bg-slate-700';
      }
  };

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
           <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Notifications</h1>
           <p className="text-gray-500 dark:text-gray-400 font-medium mt-1">Stay updated with store activities</p>
        </div>
        
        <button 
            onClick={markAllAsRead}
            className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-soft rounded-xl text-gray-700 dark:text-white font-bold hover:bg-gray-50 dark:hover:bg-slate-700 transition-all text-sm"
        >
            <CheckCircle2 size={18} className="text-brand-600" /> Mark all as read
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
          
          {/* Filters Sidebar/Top */}
          <div className="w-full lg:w-72 space-y-4 shrink-0">
              <div className="bg-white dark:bg-slate-800 p-2 rounded-2xl shadow-soft border border-gray-100 dark:border-slate-700 flex flex-row lg:flex-col gap-1 overflow-x-auto lg:overflow-visible">
                  {['All', 'Orders', 'Alerts', 'Messages'].map(tab => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab as any)}
                        className={`px-4 py-3 rounded-xl text-sm font-bold text-left transition-all flex items-center justify-between min-w-[100px] lg:min-w-0 ${
                            activeTab === tab 
                            ? 'bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300' 
                            : 'hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-600 dark:text-gray-400'
                        }`}
                      >
                          {tab}
                          {tab === 'All' && notifications.filter(n => n.unread).length > 0 && (
                              <span className="bg-brand-600 text-white text-[10px] px-2 py-0.5 rounded-full">{notifications.filter(n => n.unread).length}</span>
                          )}
                      </button>
                  ))}
              </div>

              <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-soft border border-gray-100 dark:border-slate-700">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <Filter size={14} /> Filter by Date
                  </h3>
                  <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                      <input 
                        type="date" 
                        value={filterDate}
                        onChange={(e) => setFilterDate(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-600 rounded-xl text-sm font-medium focus:ring-2 focus:ring-brand-500/20 outline-none dark:text-white"
                      />
                      {filterDate && (
                          <button 
                            onClick={() => setFilterDate('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-rose-500 hover:text-rose-600"
                          >
                              <X size={14} />
                          </button>
                      )}
                  </div>
              </div>
          </div>

          {/* Notifications List */}
          <div className="flex-1 space-y-3">
              {filteredNotifications.length > 0 ? (
                  filteredNotifications.map((notif) => (
                      <div 
                        key={notif.id} 
                        className={`group relative p-5 rounded-2xl border transition-all hover:shadow-md flex gap-4 ${
                            notif.unread 
                            ? 'bg-white dark:bg-slate-800 border-l-4 border-l-brand-500 border-y-gray-100 border-r-gray-100 dark:border-y-slate-700 dark:border-r-slate-700' 
                            : 'bg-gray-50/50 dark:bg-slate-800/50 border-transparent opacity-80 hover:opacity-100'
                        }`}
                      >
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${getBgColor(notif.type)}`}>
                              {getIcon(notif.type)}
                          </div>
                          
                          <div className="flex-1 min-w-0 pt-1">
                              <div className="flex justify-between items-start mb-1">
                                  <h3 className={`text-base font-bold ${notif.unread ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>
                                      {notif.title}
                                  </h3>
                                  <span className="text-xs font-bold text-gray-400 whitespace-nowrap ml-2">{notif.time}</span>
                              </div>
                              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-3">
                                  {notif.message}
                              </p>
                              
                              <div className="flex items-center gap-4">
                                  {notif.link && (
                                      <button 
                                        onClick={() => navigate(notif.link!)}
                                        className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline"
                                      >
                                          View Details
                                      </button>
                                  )}
                                  {notif.unread && (
                                      <button 
                                        onClick={() => markAsRead(notif.id)}
                                        className="text-xs font-bold text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 flex items-center gap-1"
                                      >
                                          <Check size={14} /> Mark as read
                                      </button>
                                  )}
                              </div>
                          </div>
                      </div>
                  ))
              ) : (
                  <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-800 rounded-3xl border border-dashed border-gray-200 dark:border-slate-700">
                      <div className="w-16 h-16 bg-gray-50 dark:bg-slate-700 rounded-full flex items-center justify-center mb-4 text-gray-400">
                          <Bell size={24} />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">No notifications</h3>
                      <p className="text-gray-500 dark:text-gray-400 mt-1">You're all caught up!</p>
                      {filterDate && (
                          <button onClick={() => setFilterDate('')} className="mt-4 text-brand-600 font-bold text-sm hover:underline">
                              Clear Date Filter
                          </button>
                      )}
                  </div>
              )}
          </div>
      </div>
    </div>
  );
};