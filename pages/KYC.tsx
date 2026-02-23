import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, 
  FileText, 
  CreditCard, 
  CheckCircle2, 
  Upload, 
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  AlertCircle,
  RefreshCw,
  Eye,
  Check,
  Store,
  Mail
} from 'lucide-react';

export const KYC: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  // Form State
  const [businessData, setBusinessData] = useState({
    companyName: '',
    storeName: '',
    licenseNumber: '',
    authority: 'Dubai Economy (DED)',
    trn: '',
    expiryDate: ''
  });

  const [payoutData, setPayoutData] = useState({
    accountHolder: '',
    bankName: 'Emirates NBD',
    iban: ''
  });

  // File Upload State
  const [files, setFiles] = useState<{
    tradeLicence: File | null;
    emiratesId: File | null;
    vatCert: File | null;
  }>({
    tradeLicence: null,
    emiratesId: null,
    vatCert: null
  });

  // Refs for hidden inputs
  const tradeLicenceRef = useRef<HTMLInputElement>(null);
  const emiratesIdRef = useRef<HTMLInputElement>(null);
  const vatCertRef = useRef<HTMLInputElement>(null);

  const totalSteps = 3;

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, key: keyof typeof files) => {
    if (e.target.files && e.target.files[0]) {
      setFiles({ ...files, [key]: e.target.files[0] });
    }
  };

  const triggerFileUpload = (ref: React.RefObject<HTMLInputElement>) => {
    ref.current?.click();
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    // Mock Submission
    setTimeout(() => {
        localStorage.setItem('kycStatus', 'submitted');
        // Save store name to use in Dashboard
        if(businessData.storeName) localStorage.setItem('storeName', businessData.storeName);
        
        setIsSubmitting(false);
        setIsComplete(true); // Show confirmation screen instead of redirecting
    }, 2000);
  };

  const StepIndicator = () => (
    <div className="flex items-center justify-center mb-10">
        {[1, 2, 3].map((i) => (
            <React.Fragment key={i}>
                <div className={`flex flex-col items-center gap-2 relative z-10`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                        step >= i 
                        ? 'bg-brand-600 text-white shadow-glow' 
                        : 'bg-white border-2 border-gray-200 text-gray-400'
                    }`}>
                        {step > i ? <CheckCircle2 size={20} /> : i}
                    </div>
                    <span className={`text-xs font-bold absolute -bottom-6 w-32 text-center ${step >= i ? 'text-brand-700' : 'text-gray-400'}`}>
                        {i === 1 ? 'Business Details' : i === 2 ? 'Documents' : 'Payouts'}
                    </span>
                </div>
                {i < 3 && (
                    <div className={`h-1 w-24 -mx-2 mb-2 rounded-full transition-all duration-300 ${step > i ? 'bg-brand-500' : 'bg-gray-200'}`}></div>
                )}
            </React.Fragment>
        ))}
    </div>
  );

  // === SUCCESS / CONFIRMATION VIEW ===
  if (isComplete) {
      return (
        <div className="min-h-screen bg-cream-50 font-sans text-gray-900 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl p-8 md:p-12 animate-in zoom-in-95 duration-500 text-center">
                <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-600">
                    <ShieldCheck size={48} strokeWidth={2.5} />
                </div>
                <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Verification Submitted!</h2>
                <p className="text-gray-500 text-lg mb-8">We have received your details. Our team will verify your documents within 24 hours.</p>
                
                {/* Summary Card */}
                <div className="bg-gray-50 rounded-2xl p-6 text-left border border-gray-100 mb-8 space-y-4">
                    <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                        <h4 className="font-bold text-gray-700 text-sm uppercase tracking-wider">Business Summary</h4>
                        <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-md font-bold">Pending Review</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <p className="text-gray-400 font-bold text-xs">Store Name</p>
                            <p className="font-medium">{businessData.storeName || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-gray-400 font-bold text-xs">Company Name</p>
                            <p className="font-medium">{businessData.companyName || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-gray-400 font-bold text-xs">Licence No.</p>
                            <p className="font-medium">{businessData.licenseNumber || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-gray-400 font-bold text-xs">Bank</p>
                            <p className="font-medium">{payoutData.bankName}</p>
                        </div>
                        <div>
                            <p className="text-gray-400 font-bold text-xs">Documents</p>
                            <p className="font-medium flex items-center gap-1 text-emerald-600">
                                <Check size={14} /> {Object.values(files).filter(f => f).length} Uploaded
                            </p>
                        </div>
                    </div>
                </div>

                {/* Email Verification Alert */}
                <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex items-start gap-4 mb-8 text-left">
                    <div className="bg-white p-2 rounded-lg text-blue-600 shrink-0 shadow-sm border border-blue-100">
                        <Mail size={20} />
                    </div>
                    <div>
                        <h4 className="font-bold text-blue-900 text-sm">Check Your Email</h4>
                        <p className="text-sm text-blue-700 mt-1 leading-relaxed">
                            We've sent a verification link to your email address. Please click the link to verify your account before logging in to the portal.
                        </p>
                    </div>
                </div>

                <button 
                    onClick={() => navigate('/login')}
                    className="w-full py-4 bg-brand-600 text-white rounded-2xl font-bold text-lg hover:bg-brand-700 shadow-lg shadow-brand-200 transition-all flex items-center justify-center gap-2"
                >
                    Log In to Merchant Portal <ArrowRight size={20} />
                </button>
            </div>
        </div>
      );
  }

  // === MAIN FORM VIEW ===
  return (
    <div className="min-h-screen bg-cream-50 font-sans text-gray-900 flex flex-col">
        {/* Simple Header */}
        <header className="h-20 bg-white border-b border-gray-100 flex items-center px-8 md:px-16 justify-between">
            <div className="flex items-center gap-2 text-brand-700">
                <ShieldCheck size={28} />
                <span className="text-xl font-extrabold tracking-tight">LastBite Merchant Verification</span>
            </div>
            <button onClick={() => navigate('/login')} className="text-sm font-bold text-gray-500 hover:text-gray-900">Sign Out</button>
        </header>

        <div className="flex-1 flex flex-col items-center justify-start pt-12 pb-12 px-4">
            <div className="w-full max-w-3xl">
                <StepIndicator />

                <div className="bg-white rounded-3xl shadow-soft p-8 md:p-12 mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    
                    {/* STEP 1: BUSINESS DETAILS */}
                    {step === 1 && (
                        <div className="space-y-6">
                            <div className="text-center mb-8">
                                <h2 className="text-2xl font-extrabold text-gray-900">UAE Business Details</h2>
                                <p className="text-gray-500 mt-2">Please provide your registered business information as per DED.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Registered Company Name</label>
                                    <div className="relative">
                                        <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <input 
                                            type="text" 
                                            value={businessData.companyName}
                                            onChange={(e) => setBusinessData({...businessData, companyName: e.target.value})}
                                            placeholder="Official LLC Name" 
                                            className="w-full pl-12 pr-5 py-3.5 bg-cream-50 rounded-xl font-medium border-none focus:ring-2 focus:ring-brand-500/20" 
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Store Name</label>
                                    <div className="relative">
                                        <Store className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <input 
                                            type="text" 
                                            value={businessData.storeName}
                                            onChange={(e) => setBusinessData({...businessData, storeName: e.target.value})}
                                            placeholder="Display Name on App" 
                                            className="w-full pl-12 pr-5 py-3.5 bg-cream-50 rounded-xl font-medium border-none focus:ring-2 focus:ring-brand-500/20" 
                                        />
                                    </div>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Trade Licence Number</label>
                                    <input 
                                        type="text" 
                                        value={businessData.licenseNumber}
                                        onChange={(e) => setBusinessData({...businessData, licenseNumber: e.target.value})}
                                        placeholder="License No." 
                                        className="w-full px-5 py-3.5 bg-cream-50 rounded-xl font-medium border-none focus:ring-2 focus:ring-brand-500/20" 
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Issuing Authority</label>
                                    <select 
                                        value={businessData.authority}
                                        onChange={(e) => setBusinessData({...businessData, authority: e.target.value})}
                                        className="w-full px-5 py-3.5 bg-cream-50 rounded-xl font-medium border-none focus:ring-2 focus:ring-brand-500/20 appearance-none cursor-pointer"
                                    >
                                        <option>Dubai Economy (DED)</option>
                                        <option>Abu Dhabi DED</option>
                                        <option>Sharjah SEDD</option>
                                        <option>DMCC Freezone</option>
                                        <option>DIFC</option>
                                        <option>Other</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">VAT TRN (Optional)</label>
                                    <input 
                                        type="text" 
                                        inputMode="numeric"
                                        value={businessData.trn}
                                        onChange={(e) => {
                                            const val = e.target.value.replace(/\D/g, '').slice(0, 15);
                                            setBusinessData({...businessData, trn: val});
                                        }}
                                        placeholder="15-digit Tax Registration Number" 
                                        maxLength={15}
                                        className="w-full px-5 py-3.5 bg-cream-50 rounded-xl font-medium border-none focus:ring-2 focus:ring-brand-500/20" 
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Licence Expiry Date</label>
                                    <div className="relative">
                                        <input 
                                            type="date" 
                                            value={businessData.expiryDate}
                                            onChange={(e) => setBusinessData({...businessData, expiryDate: e.target.value})}
                                            className="w-full px-5 py-3.5 bg-cream-50 rounded-xl font-medium border-none focus:ring-2 focus:ring-brand-500/20 text-gray-900 [color-scheme:light]" 
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 2: DOCUMENTS */}
                    {step === 2 && (
                        <div className="space-y-6">
                            <div className="text-center mb-8">
                                <h2 className="text-2xl font-extrabold text-gray-900">Upload Documents</h2>
                                <p className="text-gray-500 mt-2">Upload clear scans or photos of your legal documents.</p>
                            </div>

                            <div className="space-y-4">
                                {/* Hidden Inputs */}
                                <input type="file" ref={tradeLicenceRef} className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => handleFileChange(e, 'tradeLicence')} />
                                <input type="file" ref={emiratesIdRef} className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => handleFileChange(e, 'emiratesId')} />
                                <input type="file" ref={vatCertRef} className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => handleFileChange(e, 'vatCert')} />

                                {/* Trade Licence Upload */}
                                <div 
                                    onClick={() => triggerFileUpload(tradeLicenceRef)}
                                    className={`border-2 border-dashed rounded-2xl p-6 flex items-center gap-6 transition-all cursor-pointer group ${files.tradeLicence ? 'bg-brand-50 border-brand-300' : 'border-gray-200 hover:bg-cream-50 hover:border-brand-300'}`}
                                >
                                    <div className={`w-16 h-16 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform ${files.tradeLicence ? 'bg-white text-brand-600' : 'bg-blue-50 text-blue-600'}`}>
                                        {files.tradeLicence ? <CheckCircle2 size={28} /> : <Building2 size={28} />}
                                    </div>
                                    <div className="flex-1 overflow-hidden">
                                        <h4 className="font-bold text-gray-900 truncate">{files.tradeLicence ? files.tradeLicence.name : 'Trade Licence Copy'}</h4>
                                        <p className="text-sm text-gray-500">{files.tradeLicence ? 'Ready to upload' : 'PDF or JPG. Make sure expiry date is visible.'}</p>
                                    </div>
                                    <button className={`px-4 py-2 border rounded-xl text-sm font-bold shadow-sm ${files.tradeLicence ? 'bg-white text-brand-700 border-brand-200' : 'bg-white text-gray-600 border-gray-200'}`}>
                                        {files.tradeLicence ? 'Change' : 'Select File'}
                                    </button>
                                </div>

                                {/* Emirates ID Upload */}
                                <div 
                                    onClick={() => triggerFileUpload(emiratesIdRef)}
                                    className={`border-2 border-dashed rounded-2xl p-6 flex items-center gap-6 transition-all cursor-pointer group ${files.emiratesId ? 'bg-brand-50 border-brand-300' : 'border-gray-200 hover:bg-cream-50 hover:border-brand-300'}`}
                                >
                                    <div className={`w-16 h-16 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform ${files.emiratesId ? 'bg-white text-brand-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                        {files.emiratesId ? <CheckCircle2 size={28} /> : <CreditCard size={28} />}
                                    </div>
                                    <div className="flex-1 overflow-hidden">
                                        <h4 className="font-bold text-gray-900 truncate">{files.emiratesId ? files.emiratesId.name : 'Emirates ID (Owner/Manager)'}</h4>
                                        <p className="text-sm text-gray-500">{files.emiratesId ? 'Ready to upload' : 'Front and Back sides combined or separate.'}</p>
                                    </div>
                                    <button className={`px-4 py-2 border rounded-xl text-sm font-bold shadow-sm ${files.emiratesId ? 'bg-white text-brand-700 border-brand-200' : 'bg-white text-gray-600 border-gray-200'}`}>
                                        {files.emiratesId ? 'Change' : 'Select File'}
                                    </button>
                                </div>

                                {/* VAT Cert Upload */}
                                <div 
                                    onClick={() => triggerFileUpload(vatCertRef)}
                                    className={`border-2 border-dashed rounded-2xl p-6 flex items-center gap-6 transition-all cursor-pointer group ${files.vatCert ? 'bg-brand-50 border-brand-300' : 'border-gray-200 hover:bg-cream-50 hover:border-brand-300'}`}
                                >
                                    <div className={`w-16 h-16 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform ${files.vatCert ? 'bg-white text-brand-600' : 'bg-amber-50 text-amber-600'}`}>
                                        {files.vatCert ? <CheckCircle2 size={28} /> : <FileText size={28} />}
                                    </div>
                                    <div className="flex-1 overflow-hidden">
                                        <h4 className="font-bold text-gray-900 truncate">{files.vatCert ? files.vatCert.name : 'VAT Registration Certificate'}</h4>
                                        <p className="text-sm text-gray-500">{files.vatCert ? 'Ready to upload' : 'Optional if not VAT registered.'}</p>
                                    </div>
                                    <button className={`px-4 py-2 border rounded-xl text-sm font-bold shadow-sm ${files.vatCert ? 'bg-white text-brand-700 border-brand-200' : 'bg-white text-gray-600 border-gray-200'}`}>
                                        {files.vatCert ? 'Change' : 'Select File'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 3: PAYOUT INFO */}
                    {step === 3 && (
                        <div className="space-y-6">
                             <div className="text-center mb-8">
                                <h2 className="text-2xl font-extrabold text-gray-900">Payout Details</h2>
                                <p className="text-gray-500 mt-2">Provide your UAE bank details to receive payments.</p>
                            </div>

                            <div className="bg-brand-50 border border-brand-100 p-4 rounded-xl flex items-start gap-3 mb-6">
                                <AlertCircle className="text-brand-600 shrink-0 mt-0.5" size={20} />
                                <p className="text-sm text-brand-800 font-medium">Bank account holder name must match the company name on the Trade Licence.</p>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Account Holder Name</label>
                                    <input 
                                        type="text" 
                                        value={payoutData.accountHolder}
                                        onChange={(e) => setPayoutData({...payoutData, accountHolder: e.target.value})}
                                        placeholder="Company Name L.L.C" 
                                        className="w-full px-5 py-3.5 bg-cream-50 rounded-xl font-medium border-none focus:ring-2 focus:ring-brand-500/20" 
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Bank Name</label>
                                    <select 
                                        value={payoutData.bankName}
                                        onChange={(e) => setPayoutData({...payoutData, bankName: e.target.value})}
                                        className="w-full px-5 py-3.5 bg-cream-50 rounded-xl font-medium border-none focus:ring-2 focus:ring-brand-500/20 cursor-pointer"
                                    >
                                        <option>Emirates NBD</option>
                                        <option>ADCB</option>
                                        <option>Dubai Islamic Bank</option>
                                        <option>Mashreq</option>
                                        <option>FAB</option>
                                        <option>Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">IBAN</label>
                                    <div className="relative">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400">AE</div>
                                        <input 
                                            type="text" 
                                            value={payoutData.iban}
                                            onChange={(e) => {
                                                // Allow numbers only for UAE IBAN tail
                                                const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 21);
                                                setPayoutData({...payoutData, iban: val});
                                            }}
                                            placeholder="00 0000 0000 0000 0000 000" 
                                            maxLength={21}
                                            className="w-full pl-12 pr-4 py-3.5 bg-cream-50 rounded-xl font-medium border-none focus:ring-2 focus:ring-brand-500/20" 
                                        />
                                    </div>
                                    <p className="text-xs text-gray-400 mt-2 pl-1">21 digits required (after AE)</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex items-center justify-between mt-10 pt-6 border-t border-gray-100">
                        {step > 1 ? (
                            <button 
                                onClick={handleBack}
                                className="px-6 py-3 text-gray-600 font-bold hover:bg-gray-100 rounded-xl transition-colors flex items-center gap-2"
                            >
                                <ArrowLeft size={18} /> Back
                            </button>
                        ) : (
                            <div></div>
                        )}

                        <button 
                            onClick={handleNext}
                            disabled={isSubmitting}
                            className="px-8 py-3 bg-brand-600 text-white font-bold rounded-xl shadow-lg shadow-brand-200 hover:bg-brand-700 transition-all flex items-center gap-2"
                        >
                            {isSubmitting ? (
                                <>Processing...</>
                            ) : (
                                step === totalSteps ? 'Submit Application' : <>Next Step <ArrowRight size={18} /></>
                            )}
                        </button>
                    </div>

                </div>
            </div>
        </div>
    </div>
  );
};