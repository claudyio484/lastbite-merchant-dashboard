import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  User, 
  Store, 
  Bell, 
  CreditCard, 
  Moon,
  Camera,
  Trash2,
  X,
  Check,
  Upload,
  Palette,
  Globe,
  FileText,
  Calendar,
  Eye,
  RefreshCw,
  Download,
  Plus
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface Card {
  id: string;
  number: string; // masked
  expiry: string;
  type: string; // VISA, Mastercard, etc.
  holder: string;
}

export const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    marketing: false
  });

  const location = useLocation();
  const navigate = useNavigate();
  const [storeOpen, setStoreOpen] = useState(true);
  const [showSubModal, setShowSubModal] = useState(false);
  const [showCardModal, setShowCardModal] = useState(false);
  const [currentPlan, setCurrentPlan] = useState('Professional');
  const [darkMode, setDarkMode] = useState(false);
  
  // Profile State
  const [profilePhone, setProfilePhone] = useState('+971 50 123 4567');
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const profileInputRef = useRef<HTMLInputElement>(null);
  
  // Store State
  const [storePhone, setStorePhone] = useState('+971 50 000 0000');
  const [storeLogo, setStoreLogo] = useState<string | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  
  // New State fields
  const [uploadedLicence, setUploadedLicence] = useState('Trade_Licence_2024.pdf');
  const [licenceExpiry, setLicenceExpiry] = useState('2024-12-31');
  const [idExpiry, setIdExpiry] = useState('2026-05-15');

  // Card State
  const [savedCards, setSavedCards] = useState<Card[]>([
      { id: '1', number: '•••• •••• •••• 4242', expiry: '12/24', type: 'VISA', holder: 'Joe Doe' }
  ]);
  const [cardForm, setCardForm] = useState({ number: '', expiry: '', cvc: '', holder: '' });

  const { t, setLanguage, language } = useLanguage();

  useEffect(() => {
    // Sync state with local storage on mount
    const isDark = localStorage.getItem('darkMode') === 'true';
    setDarkMode(isDark);
    
    // Handle incoming navigation state
    if (location.state && (location.state as any).activeTab) {
        setActiveTab((location.state as any).activeTab);
    }

    // Load persisted settings
    const savedSettings = localStorage.getItem('lastbite_merchant_settings');
    if (savedSettings) {
        try {
            const parsed = JSON.parse(savedSettings);
            if (parsed.profilePhoto) setProfilePhoto(parsed.profilePhoto);
            if (parsed.storeLogo) setStoreLogo(parsed.storeLogo);
            if (parsed.savedCards) setSavedCards(parsed.savedCards);
        } catch (e) {
            console.error("Failed to load settings", e);
        }
    }
  }, [location.state]);

  const saveSettingsToStorage = (updates: any) => {
      const current = localStorage.getItem('lastbite_merchant_settings') 
        ? JSON.parse(localStorage.getItem('lastbite_merchant_settings')!) 
        : {};
      const newSettings = { ...current, ...updates };
      localStorage.setItem('lastbite_merchant_settings', JSON.stringify(newSettings));
  };

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', String(newMode));
    if (newMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleLanguageChange = (lang: 'en' | 'ar') => {
    setLanguage(lang);
  };

  const handleSave = () => {
      alert("Settings saved successfully!");
  }

  const handleDeleteAccount = () => {
      if(window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
          localStorage.clear();
          navigate('/login');
      }
  }

  const handleDownloadInvoice = (id: string) => {
      const invoiceContent = `
INVOICE ${id}
--------------------------
Date: ${new Date().toLocaleDateString()}
Merchant: Joe's Grocery
Items: Subscription Plan (${currentPlan})
Amount: AED 99.00
Status: Paid

Thank you for using LastBite!
      `;
      
      const blob = new Blob([invoiceContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${id}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
  };

  // --- Image Handling ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'profile' | 'logo') => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
              const base64 = reader.result as string;
              if (type === 'profile') {
                  setProfilePhoto(base64);
                  saveSettingsToStorage({ profilePhoto: base64 });
              } else {
                  setStoreLogo(base64);
                  saveSettingsToStorage({ storeLogo: base64 });
              }
          };
          reader.readAsDataURL(file);
      }
  };

  const deleteImage = (e: React.MouseEvent, type: 'profile' | 'logo') => {
      e.stopPropagation();
      if (type === 'profile') {
          setProfilePhoto(null);
          saveSettingsToStorage({ profilePhoto: null });
      } else {
          setStoreLogo(null);
          saveSettingsToStorage({ storeLogo: null });
      }
  };

  // --- Payment Handling ---
  const formatCardNumber = (val: string) => {
      // Remove all non-digits
      const v = val.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
      // Group by 4
      const matches = v.match(/\d{4,16}/g);
      const match = matches && matches[0] || "";
      const parts = [];
      for (let i = 0, len = match.length; i < len; i += 4) {
          parts.push(match.substring(i, i + 4));
      }
      if (parts.length) {
          return parts.join(" ");
      } else {
          return v;
      }
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      const formatted = formatCardNumber(val);
      // Limit to 19 characters (16 digits + 3 spaces)
      if (formatted.length <= 19) {
          setCardForm({...cardForm, number: formatted});
      }
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let val = e.target.value.replace(/\D/g, ''); // Remove non-digits
      if (val.length > 4) val = val.slice(0, 4); // Max 4 digits
      
      if (val.length >= 3) {
          val = `${val.slice(0,2)}/${val.slice(2)}`;
      }
      setCardForm({...cardForm, expiry: val});
  };

  const handleCvcChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value.replace(/\D/g, '').slice(0, 4);
      setCardForm({...cardForm, cvc: val});
  };

  const handleSaveCard = () => {
      if (cardForm.number.replace(/\s/g, '').length < 15 || !cardForm.expiry || !cardForm.cvc || !cardForm.holder) {
          alert("Please fill in all card details correctly.");
          return;
      }

      const firstDigit = cardForm.number.charAt(0);
      const type = firstDigit === '4' ? 'VISA' : firstDigit === '5' ? 'Mastercard' : 'Card';

      const newCard: Card = {
          id: Date.now().toString(),
          number: `•••• •••• •••• ${cardForm.number.replace(/\s/g, '').slice(-4)}`,
          expiry: cardForm.expiry,
          type,
          holder: cardForm.holder
      };

      const updatedCards = [...savedCards, newCard];
      setSavedCards(updatedCards);
      saveSettingsToStorage({ savedCards: updatedCards });
      
      setCardForm({ number: '', expiry: '', cvc: '', holder: '' });
      setShowCardModal(false);
  };

  const handleDeleteCard = (id: string) => {
      if (window.confirm("Remove this payment method?")) {
          const updated = savedCards.filter(c => c.id !== id);
          setSavedCards(updated);
          saveSettingsToStorage({ savedCards: updated });
      }
  };

  const plans = [
      { name: 'Free', price: 0, features: ['5 Products', 'Basic Analytics', 'Standard Support'] },
      { name: 'Professional', price: 99, features: ['Unlimited Products', 'Advanced Analytics', 'Priority Support', 'Marketing Tools'] },
      { name: 'Enterprise', price: 299, features: ['Multi-branch', 'API Access', 'Dedicated Account Manager', 'Custom Branding'] },
  ];

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 relative">
      <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">{t('settings_title')}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Sidebar Navigation */}
        <div className="space-y-2">
          {[
            { id: 'profile', icon: <User size={18} />, label: t('profile') },
            { id: 'store', icon: <Store size={18} />, label: t('store_settings') },
            { id: 'language', icon: <Globe size={18} />, label: t('language_label') },
            { id: 'appearance', icon: <Palette size={18} />, label: t('appearance') },
            { id: 'notifications', icon: <Bell size={18} />, label: t('notifications') },
            { id: 'plan', icon: <CreditCard size={18} />, label: t('plan_billing') },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all border ${
                activeTab === item.id 
                  ? 'bg-brand-600 text-white shadow-glow border-transparent' 
                  : 'bg-white dark:bg-slate-800 border-transparent hover:border-gray-200 dark:hover:border-slate-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700 hover:text-gray-900 dark:hover:text-white shadow-sm'
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
          
          <div className="pt-4 mt-4 border-t border-gray-200 dark:border-slate-700">
             <button 
                onClick={handleDeleteAccount}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all"
             >
                <Trash2 size={18} />
                {t('delete_account')}
             </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Profile Section */}
          {activeTab === 'profile' && (
             <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-soft p-8 space-y-8 animate-in fade-in duration-300 border border-transparent dark:border-slate-700">
                <div className="flex items-center gap-6">
                   <input 
                      type="file" 
                      ref={profileInputRef} 
                      className="hidden" 
                      accept="image/*" 
                      onChange={(e) => handleFileChange(e, 'profile')} 
                   />
                   <div 
                      className="relative group cursor-pointer"
                      onClick={() => profileInputRef.current?.click()}
                   >
                      <div className="w-24 h-24 rounded-full bg-brand-100 dark:bg-brand-900 border-4 border-white dark:border-slate-700 shadow-md flex items-center justify-center text-3xl font-bold text-brand-600 dark:text-brand-300 overflow-hidden relative">
                         {profilePhoto ? (
                             <img src={profilePhoto} alt="Avatar" className="w-full h-full object-cover" />
                         ) : (
                             <User size={40} />
                         )}
                      </div>
                      
                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                         <Camera className="text-white" size={20} />
                         {profilePhoto && (
                             <button 
                                onClick={(e) => deleteImage(e, 'profile')}
                                className="p-1.5 bg-rose-500 rounded-full text-white hover:bg-rose-600 transition-colors"
                             >
                                <Trash2 size={14} />
                             </button>
                         )}
                      </div>
                   </div>
                   
                   <div>
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white">Joe Doe</h2>
                      <p className="text-gray-500 dark:text-gray-400 font-medium">{t('owner_role')} • Joe's Grocery</p>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div>
                      <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">{t('full_name')}</label>
                      <input type="text" defaultValue="Joe Doe" className="w-full px-5 py-3.5 bg-cream-50 dark:bg-slate-900 border border-transparent dark:border-slate-700 rounded-xl font-medium text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all outline-none" />
                   </div>
                   <div>
                      <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">{t('email_address')}</label>
                      <input type="email" defaultValue="joe@example.com" className="w-full px-5 py-3.5 bg-cream-50 dark:bg-slate-900 border border-transparent dark:border-slate-700 rounded-xl font-medium text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all outline-none" />
                   </div>
                   <div>
                      <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">{t('phone_number')}</label>
                      <input type="tel" value={profilePhone} onChange={(e) => setProfilePhone(e.target.value)} className="w-full px-5 py-3.5 bg-cream-50 dark:bg-slate-900 border border-transparent dark:border-slate-700 rounded-xl font-medium text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all outline-none" />
                   </div>
                   <div>
                      <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">{t('uae_id_expiry')}</label>
                      <div className="relative">
                          <input 
                            type="date" 
                            value={idExpiry} 
                            onChange={(e) => setIdExpiry(e.target.value)}
                            className="w-full px-5 py-3.5 bg-cream-50 dark:bg-slate-900 border border-transparent dark:border-slate-700 rounded-xl font-medium text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all outline-none [&::-webkit-calendar-picker-indicator]:w-6 [&::-webkit-calendar-picker-indicator]:h-6 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-60 [&::-webkit-calendar-picker-indicator]:hover:opacity-100 [&::-webkit-calendar-picker-indicator]:dark:invert" 
                          />
                      </div>
                   </div>
                </div>
                
                <div className="flex justify-end pt-4">
                   <button onClick={handleSave} className="px-8 py-3 bg-brand-600 text-white rounded-xl font-bold shadow-lg shadow-brand-200 hover:bg-brand-700 transition-all">
                      {t('save_changes')}
                   </button>
                </div>
             </div>
          )}

          {/* Store Settings */}
          {activeTab === 'store' && (
             <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-soft p-8 space-y-8 animate-in fade-in duration-300 border border-transparent dark:border-slate-700">
                {/* Store Status Toggle */}
                <div className="flex items-center justify-between p-6 bg-brand-50 dark:bg-slate-700/50 rounded-2xl border border-brand-100 dark:border-slate-600">
                   <div>
                      <h3 className="text-lg font-bold text-brand-900 dark:text-white">{t('store_status')}</h3>
                      <p className="text-brand-700/70 dark:text-gray-400 text-sm font-medium">{t('store_status_desc')}</p>
                   </div>
                   <button 
                      onClick={() => setStoreOpen(!storeOpen)}
                      className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${storeOpen ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                   >
                      <span className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-sm transition transition-transform ${storeOpen ? (language === 'ar' ? '-translate-x-7' : 'translate-x-7') : (language === 'ar' ? '-translate-x-1' : 'translate-x-1')}`} />
                   </button>
                </div>

                {/* Logo Upload Section */}
                <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-gray-100 dark:border-slate-700">
                    <input 
                      type="file" 
                      ref={logoInputRef} 
                      className="hidden" 
                      accept="image/*" 
                      onChange={(e) => handleFileChange(e, 'logo')} 
                    />
                    <div 
                        onClick={() => logoInputRef.current?.click()}
                        className="relative group cursor-pointer shrink-0"
                    >
                        {storeLogo ? (
                            <div className="w-28 h-28 rounded-2xl overflow-hidden border-2 border-transparent group-hover:border-brand-400 transition-all shadow-md">
                                <img src={storeLogo} alt="Store Logo" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <RefreshCw className="text-white" size={20} />
                                    <button 
                                        onClick={(e) => deleteImage(e, 'logo')}
                                        className="p-1.5 bg-rose-500 rounded-lg text-white hover:bg-rose-600 transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="w-28 h-28 rounded-2xl bg-cream-50 dark:bg-slate-900 border-2 border-dashed border-gray-300 dark:border-slate-600 flex items-center justify-center text-gray-400 overflow-hidden group-hover:border-brand-400 group-hover:text-brand-500 transition-colors">
                                <Store size={32} />
                            </div>
                        )}
                        
                        {!storeLogo && (
                            <div className="absolute inset-0 bg-black/5 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Camera className="text-gray-600 dark:text-gray-300" size={24} />
                            </div>
                        )}
                    </div>
                    
                    <div className="text-center sm:text-left flex-1">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t('grocery_logo')}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{t('upload_logo_desc')}</p>
                        <button 
                            onClick={() => logoInputRef.current?.click()}
                            className="px-4 py-2 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl text-sm font-bold text-gray-600 dark:text-white hover:bg-gray-50 dark:hover:bg-slate-600 flex items-center gap-2 mx-auto sm:mx-0"
                        >
                            <Upload size={16} /> {storeLogo ? 'Change Logo' : t('upload_new_logo')}
                        </button>
                    </div>
                </div>

                <div className="space-y-6">
                   <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t('store_info')}</h3>
                   
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div className="md:col-span-2">
                          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">{t('store_name')}</label>
                          <input type="text" defaultValue="Joe's Grocery" className="w-full px-5 py-3.5 bg-cream-50 dark:bg-slate-900 border border-transparent dark:border-slate-700 rounded-xl font-medium text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all outline-none" />
                       </div>
                       
                       <div className="md:col-span-2">
                          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">{t('description')}</label>
                          <textarea rows={3} placeholder="e.g. Fresh organic produce sourced locally..." className="w-full px-5 py-3.5 bg-cream-50 dark:bg-slate-900 border border-transparent dark:border-slate-700 rounded-xl font-medium text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all outline-none resize-none" />
                       </div>

                       <div>
                          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">{t('email_address')}</label>
                          <input type="email" placeholder="store@example.com" className="w-full px-5 py-3.5 bg-cream-50 dark:bg-slate-900 border border-transparent dark:border-slate-700 rounded-xl font-medium text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all outline-none" />
                       </div>
                       <div>
                          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">{t('phone_number')}</label>
                          <input type="tel" value={storePhone} onChange={(e) => setStorePhone(e.target.value)} className="w-full px-5 py-3.5 bg-cream-50 dark:bg-slate-900 border border-transparent dark:border-slate-700 rounded-xl font-medium text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all outline-none" />
                       </div>

                       <div className="md:col-span-2">
                          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">{t('address')}</label>
                          <textarea rows={2} defaultValue="P.O. Box 12345, Business Bay, Dubai, UAE" className="w-full px-5 py-3.5 bg-cream-50 dark:bg-slate-900 border border-transparent dark:border-slate-700 rounded-xl font-medium text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all outline-none resize-none" />
                       </div>

                       <div>
                          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">{t('trade_licence_expiry')}</label>
                          <div className="relative">
                              <input 
                                type="date" 
                                value={licenceExpiry}
                                onChange={(e) => setLicenceExpiry(e.target.value)}
                                className="w-full px-5 py-3.5 bg-cream-50 dark:bg-slate-900 border border-transparent dark:border-slate-700 rounded-xl font-medium text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all outline-none [&::-webkit-calendar-picker-indicator]:w-6 [&::-webkit-calendar-picker-indicator]:h-6 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-60 [&::-webkit-calendar-picker-indicator]:hover:opacity-100 [&::-webkit-calendar-picker-indicator]:dark:invert" 
                              />
                          </div>
                       </div>

                       <div>
                          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">{t('uploaded_licence')}</label>
                          {uploadedLicence ? (
                              <div className="flex items-center justify-between p-3 bg-cream-50 dark:bg-slate-900 border border-brand-200 dark:border-brand-900/30 rounded-xl">
                                  <div className="flex items-center gap-3 overflow-hidden">
                                      <div className="p-2 bg-white dark:bg-slate-800 rounded-lg text-rose-500 shadow-sm shrink-0">
                                          <FileText size={20} />
                                      </div>
                                      <span className="text-sm font-bold text-gray-900 dark:text-white truncate">{uploadedLicence}</span>
                                  </div>
                                  <div className="flex items-center gap-1 shrink-0">
                                      <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors" title={t('view')}>
                                          <Eye size={16} />
                                      </button>
                                      <button className="p-2 text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/20 rounded-lg transition-colors" title={t('update')}>
                                          <RefreshCw size={16} />
                                      </button>
                                  </div>
                              </div>
                          ) : (
                              <button className="w-full py-3.5 border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-xl text-sm font-bold text-gray-500 dark:text-gray-400 hover:border-brand-400 hover:text-brand-600 dark:hover:border-brand-600 dark:hover:text-brand-400 transition-all flex items-center justify-center gap-2">
                                  <Upload size={18} /> {t('upload_new_logo')}
                              </button>
                          )}
                       </div>
                   </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-slate-700">
                   <button onClick={handleSave} className="px-8 py-3 bg-brand-600 text-white rounded-xl font-bold shadow-lg shadow-brand-200 hover:bg-brand-700 transition-all">
                      {t('update_store_info')}
                   </button>
                </div>
             </div>
          )}

          {/* Language Selection */}
          {activeTab === 'language' && (
             <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-soft p-8 space-y-8 animate-in fade-in duration-300 border border-transparent dark:border-slate-700">
                <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{t('language_settings')}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('select_language')}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button 
                        onClick={() => handleLanguageChange('en')}
                        className={`relative p-6 rounded-2xl border-2 text-left transition-all ${
                            language === 'en' 
                            ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20' 
                            : 'border-gray-100 dark:border-slate-700 hover:border-brand-200 dark:hover:border-slate-600'
                        }`}
                    >
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-2xl">🇬🇧</span>
                            {language === 'en' && <Check className="text-brand-600" size={20} />}
                        </div>
                        <h4 className="font-bold text-gray-900 dark:text-white text-lg">English</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Default</p>
                    </button>

                    <button 
                        onClick={() => handleLanguageChange('ar')}
                        className={`relative p-6 rounded-2xl border-2 text-left transition-all ${
                            language === 'ar' 
                            ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20' 
                            : 'border-gray-100 dark:border-slate-700 hover:border-brand-200 dark:hover:border-slate-600'
                        }`}
                    >
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-2xl">🇦🇪</span>
                            {language === 'ar' && <Check className="text-brand-600" size={20} />}
                        </div>
                        <h4 className="font-bold text-gray-900 dark:text-white text-lg font-sans">العربية</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Arabic</p>
                    </button>
                </div>
             </div>
          )}

          {/* Appearance (Dark Mode Only) */}
          {activeTab === 'appearance' && (
             <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-soft p-8 space-y-6 animate-in fade-in duration-300 border border-transparent dark:border-slate-700">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{t('interface_customization')}</h3>
                
                <div className="flex items-center justify-between py-4 border-b border-gray-100 dark:border-slate-700">
                   <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-2xl ${darkMode ? 'bg-indigo-900 text-indigo-300' : 'bg-indigo-50 text-indigo-600'}`}>
                         <Moon size={24} />
                      </div>
                      <div>
                         <h4 className="font-bold text-gray-900 dark:text-white">{t('dark_mode')}</h4>
                         <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('dark_mode_desc')}</p>
                      </div>
                   </div>
                   <button 
                       onClick={toggleDarkMode}
                       className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${darkMode ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-600'}`}
                   >
                       <span className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-sm transition transition-transform ${darkMode ? (language === 'ar' ? '-translate-x-7' : 'translate-x-7') : (language === 'ar' ? '-translate-x-1' : 'translate-x-1')}`} />
                   </button>
                </div>
             </div>
          )}

          {/* Notifications */}
          {activeTab === 'notifications' && (
             <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-soft p-8 space-y-6 animate-in fade-in duration-300 border border-transparent dark:border-slate-700">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{t('notifications')}</h3>
                
                {[
                  { id: 'email', label: 'Email Notifications', desc: 'Receive daily summaries and critical alerts via email.' },
                  { id: 'push', label: 'Push Notifications', desc: 'Get real-time updates for new orders on your device.' },
                  { id: 'marketing', label: 'Marketing Updates', desc: 'Receive tips on how to reduce waste and grow sales.' },
                ].map((item) => (
                   <div key={item.id} className="flex items-center justify-between py-4 border-b border-gray-100 dark:border-slate-700 last:border-0">
                      <div>
                         <h4 className="font-bold text-gray-900 dark:text-white">{item.label}</h4>
                         <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{item.desc}</p>
                      </div>
                      <button 
                          onClick={() => setNotifications(prev => ({...prev, [item.id]: !prev[item.id as keyof typeof notifications]}))}
                          className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${notifications[item.id as keyof typeof notifications] ? 'bg-brand-600' : 'bg-gray-200 dark:bg-gray-600'}`}
                      >
                          <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition transition-transform ${notifications[item.id as keyof typeof notifications] ? (language === 'ar' ? '-translate-x-6' : 'translate-x-6') : (language === 'ar' ? '-translate-x-1' : 'translate-x-1')}`} />
                      </button>
                   </div>
                ))}
             </div>
          )}

          {/* Plan & Billing */}
          {activeTab === 'plan' && (
             <div className="space-y-6 animate-in fade-in duration-300">
                <div className="bg-gradient-to-br from-brand-600 to-brand-800 rounded-3xl shadow-glow p-8 text-white relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                   
                   <div className="relative z-10 flex justify-between items-start">
                      <div>
                         <p className="text-brand-200 font-bold uppercase tracking-wider text-sm mb-2">Current Plan</p>
                         <h2 className="text-3xl font-extrabold mb-1">{currentPlan}</h2>
                         <p className="text-brand-100 opacity-90">AED {plans.find(p => p.name === currentPlan)?.price}.00 / month</p>
                      </div>
                      <span className="bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-md text-xs font-bold border border-white/20">Active</span>
                   </div>
                   
                   <div className="mt-8 pt-8 border-t border-white/10 flex justify-between items-center relative z-10">
                      <div className="text-sm">
                         <p className="opacity-75">Next billing date</p>
                         <p className="font-bold">October 24, 2023</p>
                      </div>
                      <button 
                        onClick={() => setShowSubModal(true)}
                        className="px-6 py-2 bg-white text-brand-800 rounded-xl font-bold hover:bg-brand-50 transition-colors shadow-lg"
                      >
                         Manage Subscription
                      </button>
                   </div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-soft p-8 border border-transparent dark:border-slate-700">
                   <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Payment Methods</h3>
                   <div className="space-y-3">
                       {savedCards.map((card) => (
                           <div key={card.id} className="flex items-center justify-between p-4 border border-gray-100 dark:border-slate-700 rounded-2xl bg-cream-50 dark:bg-slate-900">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-8 bg-gray-200 dark:bg-slate-700 rounded-md flex items-center justify-center font-bold text-xs text-gray-500 uppercase">{card.type}</div>
                                    <div>
                                        <p className="font-bold text-gray-900 dark:text-white">{card.number}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Expires {card.expiry}</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => handleDeleteCard(card.id)}
                                    className="p-2 text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors"
                                    title="Remove Card"
                                >
                                    <Trash2 size={16} />
                                </button>
                           </div>
                       ))}
                   </div>
                   
                   <button 
                     onClick={() => setShowCardModal(true)}
                     className="mt-4 w-full py-3 border border-dashed border-gray-300 dark:border-slate-600 rounded-2xl text-gray-500 dark:text-gray-400 font-bold hover:bg-gray-50 dark:hover:bg-slate-700 hover:border-gray-400 transition-all flex items-center justify-center gap-2"
                   >
                      <Plus size={18} /> Add New Card
                   </button>
                </div>

                {/* Payment History Section */}
                <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-soft p-8 border border-transparent dark:border-slate-700">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Payment History</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-100 dark:border-slate-700 text-xs font-bold text-gray-400 uppercase tracking-wider">
                                    <th className="pb-3">Invoice</th>
                                    <th className="pb-3">Date</th>
                                    <th className="pb-3">Amount</th>
                                    <th className="pb-3">Status</th>
                                    <th className="pb-3 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                                {[
                                    { id: 'INV-2023-001', date: 'Oct 24, 2023', amount: 'AED 99.00', status: 'Paid' },
                                    { id: 'INV-2023-002', date: 'Sep 24, 2023', amount: 'AED 99.00', status: 'Paid' },
                                    { id: 'INV-2023-003', date: 'Aug 24, 2023', amount: 'AED 99.00', status: 'Paid' },
                                    { id: 'INV-2023-004', date: 'Jul 24, 2023', amount: 'AED 99.00', status: 'Refunded' },
                                ].map((payment, i) => (
                                    <tr key={i} className="group border-b border-gray-50 dark:border-slate-700/50 last:border-0 hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
                                        <td className="py-4 font-medium text-gray-900 dark:text-white">{payment.id}</td>
                                        <td className="py-4 text-gray-500 dark:text-gray-400">{payment.date}</td>
                                        <td className="py-4 font-bold text-gray-900 dark:text-white">{payment.amount}</td>
                                        <td className="py-4">
                                            <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${
                                                payment.status === 'Paid' 
                                                ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' 
                                                : 'bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-gray-400'
                                            }`}>
                                                {payment.status}
                                            </span>
                                        </td>
                                        <td className="py-4 text-right">
                                            <button 
                                                onClick={() => handleDownloadInvoice(payment.id)}
                                                className="flex items-center justify-end gap-1 w-full text-brand-600 dark:text-brand-400 hover:text-brand-700 font-bold text-xs"
                                            >
                                                <Download size={14} /> Download
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
             </div>
          )}
        </div>
      </div>

      {/* Subscription Modal */}
      {showSubModal && (
        <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
           <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200">
               <div className="p-6 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center sticky top-0 bg-white dark:bg-slate-800 z-10">
                   <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">Manage Subscription</h2>
                   <button onClick={() => setShowSubModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full text-gray-500 dark:text-gray-400"><X size={20} /></button>
               </div>
               <div className="p-8 space-y-6">
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                       {plans.map((plan) => (
                           <div key={plan.name} className={`p-4 rounded-2xl border-2 flex flex-col h-full ${currentPlan === plan.name ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20' : 'border-gray-100 dark:border-slate-700 hover:border-brand-200 dark:hover:border-slate-600'}`}>
                               <div className="mb-4">
                                   <h3 className="font-bold text-gray-900 dark:text-white">{plan.name}</h3>
                                   <p className="text-2xl font-extrabold text-brand-600 dark:text-brand-400 mt-1">AED {plan.price}</p>
                                   <p className="text-xs text-gray-500 dark:text-gray-400">/ month</p>
                               </div>
                               <ul className="space-y-2 mb-6 flex-1">
                                   {plan.features.map((feat, i) => (
                                       <li key={i} className="text-xs font-medium text-gray-600 dark:text-gray-300 flex items-start gap-2">
                                           <Check size={14} className="text-brand-500 shrink-0 mt-0.5" /> {feat}
                                       </li>
                                   ))}
                               </ul>
                               {currentPlan === plan.name ? (
                                   <button disabled className="w-full py-2 rounded-xl bg-brand-600 text-white text-sm font-bold opacity-80 cursor-default flex items-center justify-center gap-2">
                                       <Check size={16} /> Current
                                   </button>
                               ) : (
                                   <button 
                                      onClick={() => { setCurrentPlan(plan.name); setShowSubModal(false); }}
                                      className={`w-full py-2 rounded-xl border text-sm font-bold transition-all ${
                                          plan.price > plans.find(p => p.name === currentPlan)!.price 
                                          ? 'bg-gray-900 text-white hover:bg-black dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200' 
                                          : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 dark:bg-slate-700 dark:border-slate-600 dark:text-gray-300 dark:hover:bg-slate-600'
                                      }`}
                                   >
                                      {plan.price > plans.find(p => p.name === currentPlan)!.price ? 'Upgrade' : 'Downgrade'}
                                   </button>
                               )}
                           </div>
                       ))}
                   </div>
               </div>
           </div>
        </div>
      )}

      {/* Add/Edit Card Modal */}
      {showCardModal && (
        <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
           <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
               <div className="p-6 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center">
                   <h2 className="text-xl font-extrabold text-gray-900 dark:text-white">Add Payment Method</h2>
                   <button onClick={() => setShowCardModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full text-gray-500 dark:text-gray-400"><X size={20} /></button>
               </div>
               <div className="p-6 space-y-4">
                   <div>
                       <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Card Number</label>
                       <div className="relative">
                           <CreditCard className={`absolute top-1/2 -translate-y-1/2 text-gray-400 ${language === 'ar' ? 'right-4' : 'left-4'}`} size={18} />
                           <input 
                                type="text" 
                                value={cardForm.number}
                                onChange={handleCardNumberChange}
                                placeholder="0000 0000 0000 0000" 
                                maxLength={19}
                                className={`w-full py-3 bg-cream-50 dark:bg-slate-900 rounded-xl font-medium border-none focus:ring-2 focus:ring-brand-500/20 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 ${language === 'ar' ? 'pr-12 pl-4' : 'pl-12 pr-4'}`} 
                           />
                       </div>
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                       <div>
                           <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Expiry Date</label>
                           <input 
                                type="text" 
                                value={cardForm.expiry}
                                onChange={handleExpiryChange}
                                placeholder="MM/YY" 
                                maxLength={5}
                                className="w-full px-4 py-3 bg-cream-50 dark:bg-slate-900 rounded-xl font-medium border-none focus:ring-2 focus:ring-brand-500/20 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500" 
                           />
                       </div>
                       <div>
                           <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">CVC</label>
                           <input 
                                type="text" 
                                value={cardForm.cvc}
                                onChange={handleCvcChange}
                                placeholder="123" 
                                maxLength={4}
                                className="w-full px-4 py-3 bg-cream-50 dark:bg-slate-900 rounded-xl font-medium border-none focus:ring-2 focus:ring-brand-500/20 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500" 
                           />
                       </div>
                   </div>
                   <div>
                       <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Cardholder Name</label>
                       <input 
                            type="text" 
                            value={cardForm.holder}
                            onChange={(e) => setCardForm({...cardForm, holder: e.target.value})}
                            placeholder="John Doe" 
                            className="w-full px-4 py-3 bg-cream-50 dark:bg-slate-900 rounded-xl font-medium border-none focus:ring-2 focus:ring-brand-500/20 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500" 
                        />
                   </div>
                   <div className="pt-4 flex gap-3">
                       <button onClick={() => setShowCardModal(false)} className="flex-1 py-3 text-gray-600 dark:text-gray-300 font-bold hover:bg-gray-50 dark:hover:bg-slate-700 rounded-xl transition-colors">Cancel</button>
                       <button onClick={handleSaveCard} className="flex-1 py-3 bg-brand-600 text-white font-bold rounded-xl shadow-lg shadow-brand-200 hover:bg-brand-700 transition-all">Save Card</button>
                   </div>
               </div>
           </div>
        </div>
      )}
    </div>
  );
};