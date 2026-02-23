import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  DollarSign, 
  ShoppingBag, 
  Clock, 
  TrendingUp, 
  AlertTriangle,
  ArrowRight,
  PlusCircle,
  Megaphone,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useLanguage } from '../contexts/LanguageContext';
import { Skeleton } from '../components/ui/Skeleton';
import { getDashboardStats } from '../utils/api';

// Theme configuration for Stat Cards
const getThemeClasses = (theme: string) => {
  switch(theme) {
    case 'emerald': return {
      wrapper: 'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-emerald-100',
      icon: 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400',
      trendPos: 'bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-400',
      textLabel: 'text-emerald-900/60 dark:text-emerald-200/60',
      textValue: 'text-emerald-950 dark:text-emerald-100'
    };
    case 'blue': return {
      wrapper: 'bg-sky-50/80 dark:bg-sky-950/30 border-sky-200 dark:border-sky-800 hover:border-sky-300 dark:hover:border-sky-700 hover:shadow-sky-100',
      icon: 'bg-sky-100 dark:bg-sky-900/50 text-sky-600 dark:text-sky-400',
      trendPos: 'bg-sky-100 dark:bg-sky-900 text-sky-700 dark:text-sky-400',
      textLabel: 'text-sky-900/60 dark:text-sky-200/60',
      textValue: 'text-sky-950 dark:text-sky-100'
    };
    case 'rose': return {
      wrapper: 'bg-rose-50/80 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800 hover:border-rose-300 dark:hover:border-rose-700 hover:shadow-rose-100',
      icon: 'bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400',
      trendPos: 'bg-rose-100 dark:bg-rose-900 text-rose-700 dark:text-rose-400', 
      textLabel: 'text-rose-900/60 dark:text-rose-200/60',
      textValue: 'text-rose-950 dark:text-rose-100'
    };
    case 'violet': return {
      wrapper: 'bg-violet-50/80 dark:bg-violet-950/30 border-violet-200 dark:border-violet-800 hover:border-violet-300 dark:hover:border-violet-700 hover:shadow-violet-100',
      icon: 'bg-violet-100 dark:bg-violet-900/50 text-violet-600 dark:text-violet-400',
      trendPos: 'bg-violet-100 dark:bg-violet-900 text-violet-700 dark:text-violet-400',
      textLabel: 'text-violet-900/60 dark:text-violet-200/60',
      textValue: 'text-violet-950 dark:text-violet-100'
    };
    default: return {
      wrapper: 'bg-white dark:bg-slate-800 border-gray-100 dark:border-slate-700',
      icon: 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300',
      trendPos: 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300',
      textLabel: 'text-gray-500 dark:text-gray-400',
      textValue: 'text-gray-900 dark:text-white'
    };
  }
};

const StatCard: React.FC<{ metric: any; isLoading?: boolean }> = ({ metric, isLoading }) => {
  const theme = getThemeClasses(metric.theme);
  
  if (isLoading) {
    return (
      <div className={`relative p-6 rounded-3xl border ${theme.wrapper} h-40 flex flex-col justify-between`}>
        <div className="flex justify-between items-start">
          <Skeleton className="w-12 h-12 rounded-2xl" />
          <Skeleton className="w-16 h-6 rounded-lg" />
        </div>
        <div>
          <Skeleton className="w-24 h-4 mb-2 rounded" />
          <Skeleton className="w-32 h-8 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className={`
      relative p-6 rounded-3xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-lg animate-fade-in
      ${theme.wrapper}
    `}>
      <div className="flex justify-between items-start mb-5">
        <div className={`p-3.5 rounded-2xl ${theme.icon} shadow-sm ring-1 ring-inset ring-black/5 dark:ring-white/10`}>
          {metric.icon}
        </div>
        {metric.trend && (
           <div className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 ${
             metric.trendUp 
               ? 'bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900' 
               : (metric.alert ? 'bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm text-rose-700 dark:text-rose-400 border border-rose-100 dark:border-rose-900' : 'bg-white/60 text-gray-600 dark:text-gray-400')
           }`}>
             {metric.trendUp ? <ArrowUpRight size={14} strokeWidth={2.5} /> : <ArrowDownRight size={14} strokeWidth={2.5} />}
             {metric.trend}
           </div>
        )}
      </div>
      
      <div>
          <p className={`text-sm font-bold mb-1 ${theme.textLabel}`}>{metric.label}</p>
          <h3 className={`text-3xl font-extrabold tracking-tight ${theme.textValue}`}>{metric.value}</h3>
      </div>
    </div>
  );
};

export const Dashboard: React.FC = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [dashData, setDashData] = useState<any>(null);
  const [chartData, setChartData] = useState<{ name: string; sales: number }[]>([]);

  const loadData = async () => {
    try {
      const res = await getDashboardStats();
      if (res.success) {
        setDashData(res.data);
        // Map salesPerformance to chart format
        if (res.data.salesPerformance) {
          const mapped = res.data.salesPerformance.map((sp: any) => ({
            name: new Date(sp.date).toLocaleDateString('en', { weekday: 'short' }),
            sales: Number(sp.revenue) || 0,
          }));
          setChartData(mapped.length > 0 ? mapped : [{ name: 'Today', sales: 0 }]);
        }
      }
    } catch (err) {
      console.error('Dashboard load error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const todayRevenue = dashData?.todayRevenue || 0;
  const activeProductsCount = dashData?.activeProducts || 0;
  const ordersToday = dashData?.ordersToday || 0;
  const expiringCount = dashData?.expiringProducts || 0;
  const newOrdersCount = dashData?.newOrders || 0;
  const lowStockCount = dashData?.lowStock || 0;

  const stats = [
    {
      label: t('todays_revenue'),
      value: `AED ${todayRevenue.toLocaleString()}`,
      trend: "12%",
      trendUp: true,
      icon: <DollarSign size={24} />,
      theme: 'emerald'
    },
    {
      label: t('active_products'),
      value: activeProductsCount.toString(),
      icon: <ShoppingBag size={24} />,
      theme: 'blue'
    },
    {
      label: t('orders_today'),
      value: ordersToday.toString(),
      trend: `${newOrdersCount} ${t('new')}`,
      trendUp: true,
      icon: <TrendingUp size={24} />,
      theme: 'violet'
    },
    {
      label: t('expiring_soon'),
      value: expiringCount.toString(),
      trend: t('urgent'),
      trendUp: false,
      icon: <Clock size={24} />,
      alert: true,
      theme: 'rose'
    },
  ];

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto animate-fade-in">
      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <StatCard key={idx} metric={stat} isLoading={isLoading} />
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {isLoading ? (
          <>
            <Skeleton className="h-40 rounded-3xl" />
            <Skeleton className="h-40 rounded-3xl" />
          </>
        ) : (
          <>
            <Link to="/add-product" className="relative overflow-hidden bg-brand-600 dark:bg-brand-700 rounded-3xl p-8 text-white shadow-lg shadow-brand-200 dark:shadow-none hover:shadow-xl hover:scale-[1.01] transition-all group border border-brand-500 dark:border-brand-600 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                <div className={`absolute top-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 group-hover:bg-white/20 transition-all ${language === 'ar' ? 'left-0 -translate-x-1/2' : 'right-0 translate-x-1/2'}`}></div>
                <div className="relative z-10 flex items-center justify-between">
                    <div>
                        <h3 className="text-2xl font-bold mb-2">{t('add_new_product')}</h3>
                        <p className="text-brand-100 font-medium">{t('list_items_quickly')}</p>
                    </div>
                    <div className="bg-white/20 p-4 rounded-full group-hover:rotate-90 transition-transform duration-500 shadow-inner">
                        <PlusCircle size={32} />
                    </div>
                </div>
            </Link>

            <Link to="/orders" className="relative overflow-hidden bg-violet-600 dark:bg-violet-700 rounded-3xl p-8 text-white shadow-lg shadow-violet-200 dark:shadow-none hover:shadow-xl hover:scale-[1.01] transition-all group border border-violet-500 dark:border-violet-600 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                <div className={`absolute top-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 group-hover:bg-white/20 transition-all ${language === 'ar' ? 'left-0 -translate-x-1/2' : 'right-0 translate-x-1/2'}`}></div>
                <div className="relative z-10 flex items-center justify-between">
                    <div>
                        <h3 className="text-2xl font-bold mb-2">{t('new_orders')}</h3>
                        <p className="text-violet-100 font-medium">{newOrdersCount} {t('orders_waiting')}</p>
                    </div>
                    <div className="w-16 h-16 bg-white/20 text-white rounded-full flex items-center justify-center shadow-lg shadow-violet-800/20 group-hover:scale-110 transition-transform ring-1 ring-white/30">
                        <span className="text-3xl font-bold">{newOrdersCount}</span>
                    </div>
                </div>
            </Link>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart Section */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-soft border border-gray-100 dark:border-slate-700 animate-slide-up" style={{ animationDelay: '0.3s' }}>
          {isLoading ? (
            <div className="h-full flex flex-col gap-6">
              <div className="flex justify-between items-center">
                <div>
                  <Skeleton className="w-48 h-6 mb-2" />
                  <Skeleton className="w-32 h-4" />
                </div>
                <Skeleton className="w-32 h-10 rounded-xl" />
              </div>
              <Skeleton className="flex-1 w-full rounded-xl" />
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-8">
                <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{t('sales_performance')}</h3>
                    <p className="text-sm text-gray-400 mt-1">Daily revenue over time</p>
                </div>
                <select className="text-sm border-none bg-cream-100 dark:bg-slate-700 hover:bg-cream-200 dark:hover:bg-slate-600 rounded-xl px-4 py-2 text-gray-600 dark:text-gray-300 font-medium outline-none cursor-pointer transition-colors">
                  <option>Last 7 Days</option>
                  <option>Last 30 Days</option>
                </select>
              </div>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0d9488" stopOpacity={0.15}/>
                        <stop offset="95%" stopColor="#0d9488" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" className="dark:opacity-10" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#a8a29e', fontWeight: 500}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#a8a29e', fontWeight: 500}} orientation={language === 'ar' ? 'right' : 'left'} />
                    <Tooltip 
                      contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 40px -10px rgba(0,0,0,0.1)', padding: '12px', backgroundColor: '#fff'}}
                      itemStyle={{color: '#0d9488', fontWeight: 700}}
                      formatter={(value) => [`AED ${value}`, 'Revenue']}
                    />
                    <Area type="monotone" dataKey="sales" stroke="#0d9488" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </>
          )}
        </div>

        {/* Alerts & Actions */}
        <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-soft border border-gray-100 dark:border-slate-700 flex flex-col animate-slide-up" style={{ animationDelay: '0.4s' }}>
          {isLoading ? (
            <div className="flex flex-col gap-6 h-full">
              <div className="flex justify-between items-center">
                <Skeleton className="w-32 h-6" />
                <Skeleton className="w-3 h-3 rounded-full" />
              </div>
              <div className="space-y-4 flex-1">
                <Skeleton className="h-20 w-full rounded-2xl" />
                <Skeleton className="h-20 w-full rounded-2xl" />
                <Skeleton className="h-20 w-full rounded-2xl" />
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{t('action_needed')}</h3>
                {(expiringCount > 0 || lowStockCount > 0 || newOrdersCount > 0) && (
                    <span className="flex h-3 w-3 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
                    </span>
                )}
              </div>
              
              <div className="space-y-4 flex-1">
                {/* Expiring Products Alert */}
                <div 
                  onClick={() => navigate('/products', { state: { sortBy: 'expiry_asc' } })}
                  className={`p-4 rounded-2xl border flex items-start gap-4 transition-transform hover:scale-[1.02] cursor-pointer group ${expiringCount > 0 ? 'bg-rose-50 dark:bg-rose-900/20 border-rose-100 dark:border-rose-900/30' : 'bg-gray-50 dark:bg-slate-900/50 border-gray-100 dark:border-slate-700 opacity-60'}`}
                >
                  <div className={`p-2.5 rounded-xl shadow-sm shrink-0 ring-1 transition-colors ${expiringCount > 0 ? 'bg-white dark:bg-slate-900 text-rose-500 ring-rose-100 dark:ring-rose-900 group-hover:bg-rose-500 group-hover:text-white' : 'bg-white dark:bg-slate-800 text-gray-400 ring-gray-200'}`}>
                      <AlertTriangle size={20} />
                  </div>
                  <div>
                    <p className={`text-sm font-bold ${expiringCount > 0 ? 'text-gray-900 dark:text-white' : 'text-gray-500'}`}>{expiringCount} Products Expiring</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 mb-2">Discount them now to avoid waste.</p>
                    <button className={`text-xs font-bold hover:text-rose-700 dark:hover:text-rose-300 flex items-center group/btn ${expiringCount > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-gray-400'}`}>
                      {t('review_items')} <ArrowRight size={12} className={`group-hover/btn:translate-x-1 transition-transform ${language === 'ar' ? 'mr-1 rotate-180' : 'ml-1'}`} />
                    </button>
                  </div>
                </div>
                
                {/* Low Stock Alert */}
                <div 
                  onClick={() => navigate('/products', { state: { sortBy: 'stock_asc' } })}
                  className={`p-4 rounded-2xl border flex items-start gap-4 hover:scale-[1.02] transition-transform group cursor-pointer ${lowStockCount > 0 ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-900/30' : 'bg-gray-50 dark:bg-slate-900/50 border-gray-100 dark:border-slate-700 opacity-60'}`}
                >
                   <div className={`p-2.5 rounded-xl shadow-sm shrink-0 ring-1 transition-colors ${lowStockCount > 0 ? 'bg-white dark:bg-slate-900 text-amber-500 ring-amber-100 dark:ring-amber-900 group-hover:bg-amber-500 group-hover:text-white' : 'bg-white dark:bg-slate-800 text-gray-400 ring-gray-200'}`}>
                      <Clock size={20} />
                   </div>
                  <div>
                    <p className={`text-sm font-bold ${lowStockCount > 0 ? 'text-gray-900 dark:text-white' : 'text-gray-500'}`}>{t('low_stock_alert')}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{lowStockCount} items need restocking soon.</p>
                  </div>
                </div>

                {/* New Orders Alert */}
                <div 
                  onClick={() => navigate('/orders', { state: { activeTab: 'New' } })}
                  className={`p-4 rounded-2xl border flex items-start gap-4 hover:scale-[1.02] transition-transform group cursor-pointer ${newOrdersCount > 0 ? 'bg-brand-50 dark:bg-brand-900/20 border-brand-100 dark:border-brand-900/30' : 'bg-gray-50 dark:bg-slate-900/50 border-gray-100 dark:border-slate-700 opacity-60'}`}
                >
                   <div className={`p-2.5 rounded-xl shadow-sm shrink-0 ring-1 transition-colors ${newOrdersCount > 0 ? 'bg-white dark:bg-slate-900 text-brand-500 ring-brand-100 dark:ring-brand-900 group-hover:bg-brand-500 group-hover:text-white' : 'bg-white dark:bg-slate-800 text-gray-400 ring-gray-200'}`}>
                      <ShoppingBag size={20} />
                   </div>
                  <div>
                    <p className={`text-sm font-bold ${newOrdersCount > 0 ? 'text-gray-900 dark:text-white' : 'text-gray-500'}`}>{newOrdersCount} New Orders</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Review and accept pending orders.</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};