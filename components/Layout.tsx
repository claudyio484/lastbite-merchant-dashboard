import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  ClipboardList, 
  Megaphone, 
  BarChart3, 
  MessageSquare, 
  Settings, 
  Menu, 
  Bell,
  LogOut,
  Leaf,
  Search,
  Sparkles,
  Crown,
  User,
  ChevronDown,
  Store,
  CheckCircle2,
  AlertCircle,
  Package,
  Clock
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { logoutApi, fetchNotificationPreview } from '../utils/api';

interface NotificationItem {
    id: string;
    title: string;
    message: string;
    time: string;
    type: 'order' | 'alert' | 'message';
    unread: boolean;
    link?: string;
}

export const Layout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  
  // Live State
  const [notificationsList, setNotificationsList] = useState<NotificationItem[]>([]);
  const [orderCount, setOrderCount] = useState(0);
  const [messageCount, setMessageCount] = useState(0);

  // Get user from localStorage (set during login)
  const storedUser = localStorage.getItem('user');
  const user = storedUser ? JSON.parse(storedUser) : null;
  const userName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : 'User';
  const userInitials = user ? `${(user.firstName || '')[0] || ''}${(user.lastName || '')[0] || ''}`.toUpperCase() : 'U';
  const storeName = user?.tenant?.name || 'My Store';

  const updateLiveState = async () => {
      try {
        const res = await fetchNotificationPreview();
        if (res.success && res.data) {
          const notifs: NotificationItem[] = res.data.map((n: any) => ({
            id: n.id,
            title: n.title,
            message: n.body,
            time: new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            type: n.type === 'NEW_ORDER' ? 'order' : n.type === 'NEW_MESSAGE' ? 'message' : 'alert',
            unread: !n.isRead,
            link: n.type === 'NEW_ORDER' ? '/orders' : n.type === 'NEW_MESSAGE' ? '/messages' : '/products',
          }));
          setNotificationsList(notifs);
          setOrderCount(notifs.filter(n => n.type === 'order' && n.unread).length);
          setMessageCount(notifs.filter(n => n.type === 'message' && n.unread).length);
        }
      } catch {
        // Silently fail - notifications are non-critical
      }
  };

  useEffect(() => {
      updateLiveState();
      // Refresh notifications every 30 seconds
      const interval = setInterval(updateLiveState, 30000);
      return () => clearInterval(interval);
  }, []);

  const closeSidebar = () => setIsSidebarOpen(false);

  const handleLogout = async () => {
    await logoutApi();
    navigate('/login');
  };

  const handleUpgrade = () => {
    navigate('/settings', { state: { activeTab: 'plan' } });
    closeSidebar();
  };

  const markAllRead = () => {
      // In a real app, this would update a 'read' status in DB.
      // Here, we can't easily modify the source data 'read' status for all types genericly without complex logic.
      // We will just clear the local visual list for this session or implemented a specific 'read' logic.
      // For now, let's just close the dropdown as the source of truth (Order Status, Message Read) hasn't changed.
      setIsNotificationsOpen(false);
  }

  // Check Dark Mode preference on mount
  useEffect(() => {
    const isDark = localStorage.getItem('darkMode') === 'true';
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // Calculate Trial Days
  const [daysLeft, setDaysLeft] = useState(30);
  useEffect(() => {
    const startStr = localStorage.getItem('trialStartDate');
    if (startStr) {
        const start = new Date(startStr).getTime();
        const now = Date.now();
        const diff = now - start;
        const daysPassed = Math.floor(diff / (1000 * 60 * 60 * 24));
        const remaining = Math.max(0, 30 - daysPassed);
        setDaysLeft(remaining);
    }
  }, []);

  const navItems = [
    { name: t('dashboard'), path: '/', icon: <LayoutDashboard size={20} /> },
    { name: t('products'), path: '/products', icon: <ShoppingBag size={20} /> },
    { name: t('orders'), path: '/orders', icon: <ClipboardList size={20} />, badge: orderCount > 0 ? orderCount : undefined },
    { name: t('promotions'), path: '/promotions', icon: <Megaphone size={20} /> },
    { name: t('analytics'), path: '/analytics', icon: <BarChart3 size={20} /> },
    { name: t('messages'), path: '/messages', icon: <MessageSquare size={20} />, badge: messageCount > 0 ? messageCount : undefined },
    { name: t('settings'), path: '/settings', icon: <Settings size={20} /> },
  ];

  return (
    <div className="flex h-screen bg-cream-50 dark:bg-slate-900 text-gray-800 dark:text-gray-100 overflow-hidden font-sans selection:bg-brand-200">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-stone-900/20 backdrop-blur-sm z-20 md:hidden animate-fade-in"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar - Floating Style */}
      <aside 
        className={`
          fixed md:relative z-30 flex flex-col w-72 h-full md:h-[calc(100vh-2rem)] md:m-4 md:rounded-3xl
          bg-white dark:bg-slate-800 shadow-soft transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1) border-r border-transparent dark:border-slate-700/50
          ${isSidebarOpen ? 'translate-x-0' : (language === 'ar' ? 'translate-x-full md:translate-x-0' : '-translate-x-full md:translate-x-0')}
        `}
      >
        <div className="flex items-center gap-3 h-24 px-8 shrink-0">
          <div className="bg-gradient-to-br from-brand-400 to-brand-600 p-2.5 rounded-2xl text-white shadow-glow">
            <Leaf size={22} strokeWidth={2.5} />
          </div>
          <span className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">LastBite</span>
        </div>

        <nav className="flex-1 overflow-y-auto py-2 px-6 space-y-2 no-scrollbar">
          <p className="px-4 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">{t('menu')}</p>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={closeSidebar}
              className={({ isActive }) => `
                flex items-center gap-3.5 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all duration-300
                ${isActive 
                  ? `bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 shadow-sm ${language === 'ar' ? '-translate-x-1' : 'translate-x-1'}` 
                  : 'text-gray-500 dark:text-gray-400 hover:bg-cream-100 dark:hover:bg-slate-700/50 hover:text-gray-900 dark:hover:text-white'}
              `}
            >
              {item.icon}
              <span className="flex-1">{item.name}</span>
              {item.badge && (
                <span className="bg-rose-400 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm">
                  {item.badge}
                </span>
              )}
            </NavLink>
          ))}

          {/* Trial Banner */}
          <div className="pt-6">
            <div className="relative p-5 rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 dark:from-slate-700 dark:to-slate-900 text-white shadow-lg overflow-hidden group border border-white/10 dark:border-slate-700">
                <div className={`absolute top-0 ${language === 'ar' ? 'left-0 -translate-x-1/2' : 'right-0 translate-x-1/2'} w-32 h-32 bg-brand-500 rounded-full blur-3xl opacity-20 -translate-y-1/2`}></div>
                <div className="relative z-10">
                    <div className="flex justify-between items-start mb-2">
                        <span className="p-1.5 bg-white/10 rounded-lg text-brand-300"><Crown size={16} /></span>
                        <span className="text-[10px] font-bold bg-brand-600 px-2 py-0.5 rounded text-white">Trial</span>
                    </div>
                    <h4 className="font-bold text-sm mb-1">Premium Plan</h4>
                    <p className="text-xs text-gray-300 mb-3">{daysLeft} days remaining in your free trial.</p>
                    <button 
                      onClick={handleUpgrade}
                      className="w-full py-2 bg-white text-gray-900 rounded-lg text-xs font-bold hover:bg-brand-50 transition-colors"
                    >
                        {t('upgrade_now')}
                    </button>
                </div>
            </div>
          </div>
        </nav>
        
        {/* Footer: Powered by LastBite */}
        <div className="p-6 mt-auto">
            <div className="flex flex-col items-center justify-center gap-1 opacity-60 hover:opacity-100 transition-opacity cursor-default">
                <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">{t('powered_by')}</p>
                <div className="flex items-center gap-1.5 text-brand-800 dark:text-brand-300 font-extrabold text-sm">
                    <Leaf size={14} className="text-brand-500" fill="currentColor" />
                    <span>LastBite</span>
                </div>
            </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header - Transparent/Glassy */}
        <header className="h-24 flex items-center justify-between px-6 md:px-10 shrink-0">
          <div className="flex items-center gap-4">
            <button 
                onClick={() => setIsSidebarOpen(true)}
                className={`p-2 text-gray-600 dark:text-gray-300 rounded-xl hover:bg-white dark:hover:bg-slate-800 hover:shadow-sm md:hidden transition-all ${language === 'ar' ? '-mr-2' : '-ml-2'}`}
            >
                <Menu size={24} />
            </button>
            
            {location.pathname === '/' && (
              <div className="hidden md:flex flex-col animate-fade-in">
                  <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">
                      {t('dashboard')}
                  </h2>
                  <p className="text-sm text-gray-400 dark:text-gray-500 font-medium">{t('welcome_back')}, {user?.firstName || 'there'}!</p>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 md:gap-6">
            <div className="hidden md:flex items-center bg-white dark:bg-slate-800 px-4 py-2.5 rounded-xl shadow-soft border border-gray-100 dark:border-slate-700 w-64 transition-colors">
                <Search size={18} className="text-gray-400" />
                <input type="text" placeholder={t('search_placeholder')} className={`bg-transparent outline-none text-sm w-full dark:text-gray-200 dark:placeholder-gray-500 ${language === 'ar' ? 'mr-3' : 'ml-3'}`} />
            </div>

            {/* Notifications Dropdown */}
            <div className="relative">
                <button 
                  onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                  className={`relative p-3 rounded-xl shadow-soft hover:shadow-md transition-all ${isNotificationsOpen ? 'bg-brand-50 dark:bg-brand-900 text-brand-600 dark:text-brand-300' : 'bg-white dark:bg-slate-800 text-gray-500 dark:text-gray-400 hover:text-brand-600'}`}
                >
                  <Bell size={20} />
                  {notificationsList.some(n => n.unread) && (
                    <span className={`absolute top-2 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white dark:border-slate-800 ${language === 'ar' ? 'left-2' : 'right-2'}`}></span>
                  )}
                </button>

                {isNotificationsOpen && (
                    <>
                        <div className="fixed inset-0 z-10" onClick={() => setIsNotificationsOpen(false)}></div>
                        <div className={`absolute top-full mt-3 w-80 sm:w-96 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-700 overflow-hidden z-20 animate-in fade-in slide-in-from-top-2 duration-200 ${language === 'ar' ? 'left-0' : 'right-0'}`}>
                            <div className="p-4 border-b border-gray-50 dark:border-slate-700 flex justify-between items-center bg-gray-50/50 dark:bg-slate-900/50 backdrop-blur-sm">
                                <h3 className="font-bold text-gray-900 dark:text-white text-sm">Notifications</h3>
                                <button onClick={markAllRead} className="text-[10px] font-bold text-brand-600 hover:text-brand-700 bg-brand-50 dark:bg-brand-900/50 px-2 py-1 rounded-md">Close</button>
                            </div>
                            <div className="max-h-[320px] overflow-y-auto">
                                {notificationsList.length > 0 ? (
                                    notificationsList.map((notif) => (
                                        <div 
                                            key={notif.id} 
                                            onClick={() => {
                                                if (notif.link) {
                                                    setIsNotificationsOpen(false);
                                                    navigate(notif.link);
                                                }
                                            }}
                                            className={`p-4 border-b border-gray-50 dark:border-slate-700 hover:bg-gray-50/80 dark:hover:bg-slate-700/50 transition-colors flex gap-3 cursor-pointer group ${notif.unread ? 'bg-brand-50/30 dark:bg-brand-900/10' : ''}`}
                                        >
                                             <div className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${notif.unread ? 'bg-rose-500 ring-2 ring-rose-200 dark:ring-rose-900' : 'bg-gray-200 dark:bg-slate-600'}`}></div>
                                             
                                             <div className="shrink-0 mt-0.5 text-gray-400 dark:text-gray-500">
                                                 {notif.type === 'order' && <Package size={16} />}
                                                 {notif.type === 'alert' && <AlertCircle size={16} className="text-rose-500" />}
                                                 {notif.type === 'message' && <MessageSquare size={16} className="text-brand-600" />}
                                             </div>

                                             <div className="flex-1 min-w-0">
                                                 <div className="flex justify-between items-start mb-0.5">
                                                    <p className={`text-sm truncate pr-2 ${notif.unread ? 'font-bold text-gray-900 dark:text-white' : 'font-medium text-gray-600 dark:text-gray-400'}`}>{notif.title}</p>
                                                    <span className={`text-[10px] font-bold text-gray-400 uppercase tracking-wide shrink-0 ${language === 'ar' ? 'mr-2' : 'ml-2'}`}>{notif.time}</span>
                                                 </div>
                                                 <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors line-clamp-2">{notif.message}</p>
                                             </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-8 text-center text-gray-400 text-xs font-medium">
                                        No new notifications
                                    </div>
                                )}
                            </div>
                            <div className="p-2 border-t border-gray-50 dark:border-slate-700 bg-gray-50/30 dark:bg-slate-900/30 text-center">
                                <button onClick={() => navigate('/messages')} className="w-full py-2 text-xs font-bold text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-white dark:hover:bg-slate-700 rounded-xl transition-all">View All Activity</button>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* User Dropdown */}
            <div className="relative">
                <button 
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 pl-1 pr-1 md:pr-3 py-1 bg-white dark:bg-slate-800 rounded-xl shadow-soft hover:shadow-md transition-all border border-transparent hover:border-gray-100 dark:hover:border-slate-700"
                >
                    <div className="w-10 h-10 rounded-full bg-brand-100 dark:bg-brand-900 flex items-center justify-center text-brand-700 dark:text-brand-300 font-bold border-2 border-white dark:border-slate-700 shadow-sm">
                        {userInitials}
                    </div>
                    <ChevronDown size={16} className="text-gray-400 hidden md:block" />
                </button>

                {isUserMenuOpen && (
                    <>
                        <div className="fixed inset-0 z-10" onClick={() => setIsUserMenuOpen(false)}></div>
                        <div className={`absolute top-full mt-2 w-60 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-700 p-2 z-20 animate-in fade-in slide-in-from-top-2 duration-200 ${language === 'ar' ? 'left-0' : 'right-0'}`}>
                            <div className="p-3 bg-cream-50 dark:bg-slate-900 rounded-xl mb-2 flex items-center gap-3">
                                <div className="p-2 bg-white dark:bg-slate-800 rounded-lg text-brand-600 dark:text-brand-400 shadow-sm">
                                    <Store size={18} />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t('menu')}</p>
                                    <p className="font-bold text-gray-900 dark:text-white text-sm">{storeName}</p>
                                </div>
                            </div>
                            
                            <button 
                                onClick={handleLogout}
                                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-colors"
                            >
                                <LogOut size={18} />
                                {t('log_out')}
                            </button>
                        </div>
                    </>
                )}
            </div>
          </div>
        </header>

        {/* Page Content - with fade in animation */}
        <main 
            key={location.pathname}
            className="flex-1 overflow-y-auto px-4 pb-4 md:px-10 md:pb-10 scroll-smooth animate-fade-in"
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};