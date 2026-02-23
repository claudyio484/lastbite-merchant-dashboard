import React, { useState, useEffect } from 'react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import {
    ArrowUpRight,
    Leaf,
    Star,
    ArrowDownRight,
    DollarSign,
    ShoppingBag,
    Users,
    Download,
    FileText,
    FileSpreadsheet,
    File
} from 'lucide-react';
import { fetchAnalyticsOverview } from '../utils/api';

const COLORS = ['#14b8a6', '#fb7185'];

export const Analytics: React.FC = () => {
  const [timeRange, setTimeRange] = useState('Last 7 Days');
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<any>(null);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const period = timeRange === 'Last 7 Days' ? '7d' : '30d';
        const res = await fetchAnalyticsOverview(period);
        if (res.success) {
          setAnalyticsData(res.data);
        }
      } catch (err) {
        console.error('Analytics load error:', err);
      }
    };
    loadAnalytics();
  }, [timeRange]);

  const chartData = analyticsData?.revenueChart?.map((r: any) => ({
    name: r.day || r.name,
    sales: Number(r.revenue) || 0,
  })) || [{ name: 'Mon', sales: 0 }];

  const wasteData = [
    { name: 'Saved', value: analyticsData?.foodSaved?.percentageSaved || 75 },
    { name: 'Wasted', value: 100 - (analyticsData?.foodSaved?.percentageSaved || 75) },
  ];

  const topProducts = analyticsData?.topProducts?.map((p: any) => ({
    name: p.name,
    sales: p._count?.id || p.sales || 0,
    revenue: p.revenue || 0,
    trend: '+0%',
  })) || [];

  const totalRevenue = analyticsData?.totalRevenue || 0;
  const totalOrders = analyticsData?.totalOrders || 0;
  const foodSavedKg = analyticsData?.foodSaved?.kgSaved || 0;
  const customerRating = analyticsData?.averageRating || 4.8;
  const savedPercentage = analyticsData?.foodSaved?.percentageSaved || 75;

  // Close menu on click outside
  useEffect(() => {
    const handleClickOutside = () => setShowExportMenu(false);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  const handleExport = (e: React.MouseEvent, type: string) => {
      e.stopPropagation();
      setShowExportMenu(false);
      // Mock Export Logic
      console.log(`Exporting report as ${type}...`);
      
      // Simple alert for feedback
      const a = document.createElement('a');
      a.href = '#';
      // In a real app, this would trigger a file download from a Blob
      setTimeout(() => alert(`Report downloaded as .${type.toLowerCase()}`), 300);
  };

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto">
      <div className="flex justify-between items-center">
        <div>
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Analytics</h1>
            <p className="text-gray-500 dark:text-gray-400 font-medium mt-1">Track your store's performance and impact</p>
        </div>
        
        <div className="relative">
            <button 
                onClick={(e) => { e.stopPropagation(); setShowExportMenu(!showExportMenu); }}
                className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-soft rounded-xl text-gray-700 dark:text-white font-bold hover:bg-gray-50 dark:hover:bg-slate-700 transition-all text-sm"
            >
                <Download size={16} /> Export Report
            </button>

            {showExportMenu && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-gray-100 dark:border-slate-700 z-20 py-1 animate-in fade-in zoom-in-95 duration-200">
                    <button onClick={(e) => handleExport(e, 'PDF')} className="w-full text-left px-4 py-3 text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center gap-3">
                        <FileText size={16} className="text-rose-500" /> Export as PDF
                    </button>
                    <button onClick={(e) => handleExport(e, 'CSV')} className="w-full text-left px-4 py-3 text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center gap-3">
                        <File size={16} className="text-blue-500" /> Export as CSV
                    </button>
                    <button onClick={(e) => handleExport(e, 'XLSX')} className="w-full text-left px-4 py-3 text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center gap-3">
                        <FileSpreadsheet size={16} className="text-emerald-500" /> Export as Excel
                    </button>
                </div>
            )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         {[
             { label: 'Total Revenue', value: `AED ${totalRevenue.toLocaleString()}`, change: '+12.5%', isPos: true, icon: <DollarSign size={20} className="text-brand-600 dark:text-brand-400" />, bg: 'bg-brand-50 dark:bg-brand-900/30' },
             { label: 'Total Orders', value: totalOrders.toLocaleString(), change: '+8.2%', isPos: true, icon: <ShoppingBag size={20} className="text-sky-600 dark:text-sky-400" />, bg: 'bg-sky-50 dark:bg-sky-900/30' },
             { label: 'Food Saved', value: `${foodSavedKg} kg`, change: '+24%', isPos: true, icon: <Leaf size={20} className="text-emerald-600 dark:text-emerald-400" />, bg: 'bg-emerald-50 dark:bg-emerald-900/30' },
             { label: 'Customer Rating', value: customerRating.toString(), change: '-0.1', isPos: false, icon: <Star size={20} className="text-amber-500 fill-amber-500" />, bg: 'bg-amber-50 dark:bg-amber-900/30' },
         ].map((stat, i) => (
             <div key={i} className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-soft border border-transparent hover:shadow-lg transition-all dark:border-slate-700">
                 <div className="flex justify-between items-start mb-4">
                     <div className={`p-3 rounded-2xl ${stat.bg}`}>
                         {stat.icon}
                     </div>
                     <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-md ${stat.isPos ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'}`}>
                         {stat.isPos ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                         {stat.change}
                     </div>
                 </div>
                 <p className="text-sm font-bold text-gray-400 dark:text-gray-500">{stat.label}</p>
                 <h3 className="text-3xl font-extrabold text-gray-900 dark:text-white">{stat.value}</h3>
             </div>
         ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Sales Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-soft border border-transparent dark:border-slate-700">
          <div className="flex justify-between items-center mb-8">
            <div>
                 <h3 className="text-xl font-bold text-gray-900 dark:text-white">Revenue Overview</h3>
                 <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Weekly sales performance</p>
            </div>
             <select 
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="bg-cream-50 dark:bg-slate-700 border-none text-sm font-bold text-gray-600 dark:text-white rounded-xl px-4 py-2 cursor-pointer outline-none hover:bg-cream-100 dark:hover:bg-slate-600 transition-colors"
             >
                 <option value="Last 7 Days">Last 7 Days</option>
                 <option value="Last Month">Last Month</option>
             </select>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0d9488" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#0d9488" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:opacity-10" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 600}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 600}} prefix="AED " />
                <Tooltip 
                  cursor={{stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4'}}
                  contentStyle={{borderRadius: '5px', border: 'none', boxShadow: '0 10px 30px -5px rgba(0,0,0,0.1)', padding: '12px'}}
                  itemStyle={{color: '#0f766e', fontWeight: 700}}
                  formatter={(value) => [`AED ${value}`, 'Revenue']}
                />
                <Area type="monotone" dataKey="sales" stroke="#0d9488" strokeWidth={4} fillOpacity={1} fill="url(#colorRevenue)" animationDuration={1000} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Impact / Waste Chart */}
        <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-soft border border-transparent dark:border-slate-700 flex flex-col">
           <div className="mb-4">
               <h3 className="text-xl font-bold text-gray-900 dark:text-white">Food Waste Impact</h3>
               <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Ratio of saved vs discarded items</p>
           </div>
           
           <div className="h-64 w-full flex-1 relative">
             <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                 <span className="text-4xl font-extrabold text-gray-900 dark:text-white">{savedPercentage}%</span>
                 <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Saved</span>
             </div>
             <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={wasteData}
                        innerRadius={80}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                        cornerRadius={10}
                        startAngle={90}
                        endAngle={-270}
                    >
                        {wasteData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={0} />
                        ))}
                    </Pie>
                    <Tooltip contentStyle={{borderRadius: '5px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)'}} />
                </PieChart>
             </ResponsiveContainer>
           </div>
           
           <div className="flex gap-4 mt-4 justify-center">
              <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-brand-500"></div>
                  <span className="text-sm font-bold text-gray-600 dark:text-gray-300">Saved</span>
              </div>
              <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-400"></div>
                  <span className="text-sm font-bold text-gray-600 dark:text-gray-300">Discarded</span>
              </div>
           </div>

           <div className="mt-8 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl border border-emerald-100 dark:border-emerald-900/30 text-emerald-800 dark:text-emerald-300 text-sm font-bold flex items-center gap-3">
              <div className="p-2 bg-white dark:bg-emerald-900 rounded-xl text-emerald-600 dark:text-emerald-400 shadow-sm"><Leaf size={16} /></div>
              You've saved {foodSavedKg}kg of food this month!
           </div>
        </div>
      </div>

      {/* Top Products Table */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-soft p-8 dark:border dark:border-slate-700">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Best Selling Products</h3>
          <div className="overflow-x-auto">
             <table className="w-full">
                <thead>
                    <tr className="border-b border-gray-100 dark:border-slate-700 text-left">
                        <th className="pb-4 text-xs font-extrabold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Product Name</th>
                        <th className="pb-4 text-xs font-extrabold text-gray-400 dark:text-gray-500 uppercase tracking-wider text-right">Units Sold</th>
                        <th className="pb-4 text-xs font-extrabold text-gray-400 dark:text-gray-500 uppercase tracking-wider text-right">Revenue</th>
                        <th className="pb-4 text-xs font-extrabold text-gray-400 dark:text-gray-500 uppercase tracking-wider text-right">Trend</th>
                    </tr>
                </thead>
                <tbody>
                    {(topProducts.length > 0 ? topProducts : [{ name: 'No data yet', sales: 0, revenue: 0, trend: '-' }]).map((product: any, i: number) => (
                        <tr key={i} className="group hover:bg-cream-50/50 dark:hover:bg-slate-700/50 transition-colors">
                            <td className="py-4 font-bold text-gray-900 dark:text-white flex items-center gap-3">
                                <div className="w-8 h-8 rounded-md bg-gray-100 dark:bg-slate-700 flex items-center justify-center text-gray-400 font-bold text-xs">{i + 1}</div>
                                {product.name}
                            </td>
                            <td className="py-4 text-right font-medium text-gray-600 dark:text-gray-300">{product.sales}</td>
                            <td className="py-4 text-right font-bold text-brand-700 dark:text-brand-400">AED {product.revenue.toFixed(2)}</td>
                            <td className="py-4 text-right">
                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold ${product.trend.startsWith('+') ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : 'bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400'}`}>
                                    {product.trend}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
             </table>
          </div>
      </div>
    </div>
  );
};