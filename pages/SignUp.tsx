import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Leaf, ArrowRight, Check, Lock, Mail, Phone, Eye, EyeOff, MessageSquare } from 'lucide-react';
import { registerApi } from '../utils/api';

export const SignUp: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<'form' | 'otp'>('form');
  
  const [formData, setFormData] = useState({
    ownerName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // OTP State
  const [otp, setOtp] = useState(['', '', '', '']);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call to send OTP
    setTimeout(() => {
      setIsLoading(false);
      setStep('otp');
    }, 1000);
  };

  const handleOtpChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 3) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async () => {
    setIsLoading(true);
    try {
      const nameParts = formData.ownerName.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      await registerApi({
        firstName,
        lastName,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        storeName: `${firstName}'s Store`,
      });
      localStorage.setItem('kycStatus', 'pending');
      localStorage.setItem('trialStartDate', new Date().toISOString());
      localStorage.setItem('ownerName', formData.ownerName);
      navigate('/kyc');
    } catch (err: any) {
      alert(err.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white font-sans text-gray-900">
      
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gray-900 relative overflow-hidden flex-col justify-between p-16 text-white">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-600 rounded-full blur-3xl opacity-20 -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-500 rounded-full blur-3xl opacity-10 translate-y-1/3 -translate-x-1/3"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-white/10 p-2.5 rounded-2xl backdrop-blur-md border border-white/20">
              <Leaf size={24} className="text-brand-300" strokeWidth={2.5} />
            </div>
            <span className="text-2xl font-bold tracking-tight">LastBite</span>
          </div>
          
          <h1 className="text-5xl font-extrabold leading-tight mb-6">
            Join the movement.<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-300 to-emerald-200">Stop wasting food.</span>
          </h1>
          
          <div className="space-y-6 mt-12">
            {[
                'Access to 50,000+ local customers',
                'Real-time inventory management',
                'Detailed analytics & waste reporting',
                'UAE Compliant Payouts'
            ].map((item, i) => (
                <div key={i} className="flex items-center gap-4">
                    <div className="w-6 h-6 rounded-full bg-brand-500/20 flex items-center justify-center text-brand-400 shrink-0">
                        <Check size={14} strokeWidth={3} />
                    </div>
                    <p className="font-medium text-lg text-gray-300">{item}</p>
                </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-sm text-gray-500">
           © 2023 LastBite Technologies. Designed for UAE Merchants.
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-cream-50 overflow-y-auto relative">
        <div className="w-full max-w-lg space-y-8 my-auto transition-all duration-500">
          
          {step === 'form' ? (
            <>
                <div className="text-center lg:text-left">
                    <Link to="/login" className="lg:hidden inline-flex items-center gap-2 mb-8 justify-center">
                    <div className="bg-brand-600 p-2 rounded-xl text-white">
                        <Leaf size={20} />
                    </div>
                    <span className="text-xl font-bold text-gray-900">LastBite</span>
                    </Link>
                    <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Create Merchant Account</h2>
                    <p className="text-gray-500">Start your 30-day free trial. No credit card required.</p>
                </div>

                <form onSubmit={handleSignUp} className="space-y-5">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Owner Name</label>
                        <div className="relative group">
                        <input 
                            type="text" 
                            value={formData.ownerName}
                            onChange={(e) => setFormData({...formData, ownerName: e.target.value})}
                            className="w-full px-4 py-3.5 bg-white border-none shadow-soft rounded-xl focus:ring-2 focus:ring-brand-500/20 outline-none font-medium transition-all"
                            placeholder="Joe Doe"
                            required
                        />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Work Email</label>
                        <div className="relative group">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-600 transition-colors" size={18} />
                            <input 
                            type="email" 
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                            className="w-full pl-12 pr-4 py-3.5 bg-white border-none shadow-soft rounded-xl focus:ring-2 focus:ring-brand-500/20 outline-none font-medium transition-all"
                            placeholder="merchant@business.com"
                            required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">UAE Mobile Number</label>
                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-sm border-r border-gray-200 pr-2">
                                +971
                            </div>
                            <input 
                            type="tel" 
                            value={formData.phone}
                            onChange={(e) => {
                                // Allow only numbers, max 9 digits
                                let val = e.target.value.replace(/\D/g, '');
                                if (val.length > 9) val = val.slice(0, 9);
                                
                                // Format: 50 123 4567
                                let formatted = val;
                                if (val.length > 2) {
                                    formatted = `${val.slice(0, 2)} ${val.slice(2)}`;
                                }
                                if (val.length > 5) {
                                    formatted = `${formatted.slice(0, 6)} ${val.slice(5)}`;
                                }
                                
                                setFormData({...formData, phone: formatted});
                            }}
                            className="w-full pl-20 pr-4 py-3.5 bg-white border-none shadow-soft rounded-xl focus:ring-2 focus:ring-brand-500/20 outline-none font-medium transition-all"
                            placeholder="50 123 4567"
                            maxLength={11}
                            required
                            />
                        </div>
                        <p className="text-[10px] text-gray-400 mt-1 pl-1">Format: 50 123 4567</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-600 transition-colors" size={18} />
                                <input 
                                    type={showPassword ? "text" : "password"}
                                    value={formData.password}
                                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                                    className="w-full pl-12 pr-10 py-3.5 bg-white border-none shadow-soft rounded-xl focus:ring-2 focus:ring-brand-500/20 outline-none font-medium transition-all"
                                    placeholder="••••••••"
                                    required
                                />
                                <button 
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Confirm Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-600 transition-colors" size={18} />
                                <input 
                                    type={showConfirmPassword ? "text" : "password"}
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                                    className="w-full pl-12 pr-10 py-3.5 bg-white border-none shadow-soft rounded-xl focus:ring-2 focus:ring-brand-500/20 outline-none font-medium transition-all"
                                    placeholder="••••••••"
                                    required
                                />
                                <button 
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex items-start gap-3 pt-2">
                        <input type="checkbox" id="terms" className="mt-1 w-4 h-4 text-brand-600 rounded focus:ring-brand-500 border-gray-300" required />
                        <label htmlFor="terms" className="text-sm text-gray-500">
                            I agree to the <a href="#" className="text-brand-600 font-bold hover:underline">Terms of Service</a> and <a href="#" className="text-brand-600 font-bold hover:underline">Privacy Policy</a>.
                        </label>
                    </div>

                    <button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-full py-4 bg-brand-600 text-white rounded-2xl font-bold text-lg shadow-lg shadow-brand-200 hover:bg-brand-700 hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                    >
                    {isLoading ? (
                        <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        <>Create Account <ArrowRight size={20} /></>
                    )}
                    </button>
                </form>

                <div className="text-center pt-4">
                    <p className="text-sm text-gray-500 font-medium">
                    Already have an account?{' '}
                    <Link to="/login" className="text-brand-600 font-bold hover:underline">Sign In</Link>
                    </p>
                </div>
            </>
          ) : (
            <div className="animate-in fade-in slide-in-from-right duration-300">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-6 text-brand-600">
                        <MessageSquare size={32} />
                    </div>
                    <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Verify Mobile Number</h2>
                    <p className="text-gray-500">We sent a 4-digit code to <span className="font-bold text-gray-900">+971 {formData.phone}</span></p>
                </div>

                <div className="space-y-8">
                    <div className="flex justify-center gap-4">
                        {otp.map((digit, index) => (
                            <input
                                key={index}
                                ref={(el) => { otpRefs.current[index] = el; }}
                                type="text"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleOtpChange(index, e.target.value)}
                                onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                className="w-16 h-20 rounded-2xl border-2 border-gray-200 text-center text-3xl font-extrabold text-gray-900 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/20 outline-none transition-all bg-white"
                            />
                        ))}
                    </div>

                    <button 
                        onClick={handleVerifyOtp}
                        disabled={otp.join('').length !== 4 || isLoading}
                        className="w-full py-4 bg-brand-600 text-white rounded-2xl font-bold text-lg shadow-lg shadow-brand-200 hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>Verify & Continue <ArrowRight size={20} /></>
                        )}
                    </button>

                    <div className="text-center">
                        <button 
                            onClick={() => setStep('form')}
                            className="text-sm font-bold text-gray-400 hover:text-gray-600"
                        >
                            Change Number?
                        </button>
                    </div>
                </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};