import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Leaf, ArrowRight, Check, Lock, Mail, ArrowLeft, Send } from 'lucide-react';
import { loginApi, forgotPasswordApi } from '../utils/api';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const [view, setView] = useState<'login' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResetSent, setIsResetSent] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const data = await loginApi(email, password);
      // Store trial date from subscription if available
      if (data.user?.tenant?.subscription?.trialEndsAt) {
        localStorage.setItem('trialStartDate', data.user.tenant.subscription.startDate || new Date().toISOString());
      }
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    setError('');
    try {
      await forgotPasswordApi(email);
      setIsResetSent(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send reset link');
    } finally {
      setIsLoading(false);
    }
  };

  const resetFlow = () => {
      setView('login');
      setIsResetSent(false);
      setPassword('');
  };

  return (
    <div className="min-h-screen flex bg-white font-sans text-gray-900">
      
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-brand-800 relative overflow-hidden flex-col justify-between p-16 text-white">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-600 rounded-full blur-3xl opacity-20 -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-400 rounded-full blur-3xl opacity-10 translate-y-1/3 -translate-x-1/3"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-white/10 p-2.5 rounded-2xl backdrop-blur-md border border-white/20">
              <Leaf size={24} className="text-emerald-300" strokeWidth={2.5} />
            </div>
            <span className="text-2xl font-bold tracking-tight">LastBite</span>
          </div>
          
          <h1 className="text-5xl font-extrabold leading-tight mb-6">
            Turn waste into <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-teal-200">revenue</span> today.
          </h1>
          <p className="text-brand-100 text-lg max-w-md leading-relaxed opacity-90">
            Join 12,000+ merchants saving food and increasing profits with LastBite's intelligent inventory management.
          </p>
        </div>

        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-4 p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 max-w-md">
             <div className="w-10 h-10 rounded-full bg-emerald-400/20 flex items-center justify-center text-emerald-300">
                <Check size={20} strokeWidth={3} />
             </div>
             <div>
                <p className="font-bold">Zero Setup Fee</p>
                <p className="text-sm text-brand-200 opacity-80">Start your 30-day free trial instantly.</p>
             </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Content */}
      <div className="flex-1 flex items-center justify-center p-8 bg-cream-50 overflow-hidden relative">
        <div className="w-full max-w-md space-y-10 transition-all duration-500">
          
          {/* === LOGIN VIEW === */}
          {view === 'login' && (
            <div className="animate-in fade-in slide-in-from-left duration-300">
                <div className="text-center lg:text-left">
                    <div className="inline-flex lg:hidden items-center gap-2 mb-8 justify-center">
                    <div className="bg-brand-600 p-2 rounded-xl text-white">
                        <Leaf size={20} />
                    </div>
                    <span className="text-xl font-bold text-gray-900">LastBite</span>
                    </div>
                    <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Welcome Back</h2>
                    <p className="text-gray-500">Enter your credentials to access your dashboard.</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6 mt-10">
                    {error && (
                      <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-sm font-medium">
                        {error}
                      </div>
                    )}
                    <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
                        <div className="relative group">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-600 transition-colors" size={20} />
                        <input 
                            type="email" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 bg-white border-none shadow-soft rounded-2xl focus:ring-2 focus:ring-brand-500/20 outline-none font-medium transition-all"
                            placeholder="merchant@lastbite.com"
                            required
                        />
                        </div>
                    </div>
                    
                    <div>
                        <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-bold text-gray-700">Password</label>
                        <button type="button" onClick={() => setView('forgot')} className="text-xs font-bold text-brand-600 hover:text-brand-700 hover:underline">Forgot Password?</button>
                        </div>
                        <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-600 transition-colors" size={20} />
                        <input 
                            type="password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 bg-white border-none shadow-soft rounded-2xl focus:ring-2 focus:ring-brand-500/20 outline-none font-medium transition-all"
                            placeholder="••••••••"
                            required
                        />
                        </div>
                    </div>
                    </div>

                    <button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-full py-4 bg-brand-600 text-white rounded-2xl font-bold text-lg shadow-lg shadow-brand-200 hover:bg-brand-700 hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                    >
                    {isLoading ? (
                        <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        <>Sign In <ArrowRight size={20} /></>
                    )}
                    </button>
                </form>

                <div className="text-center mt-6">
                    <p className="text-sm text-gray-500 font-medium">
                    Don't have an account?{' '}
                    <Link to="/signup" className="text-brand-600 font-bold hover:underline">Start 30-day Free Trial</Link>
                    </p>
                </div>
                
                <div className="pt-8 border-t border-gray-200 mt-8">
                    <div className="flex justify-center gap-6 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
                        {/* Mock Logos */}
                        <div className="h-6 w-20 bg-gray-400 rounded-md"></div>
                        <div className="h-6 w-20 bg-gray-400 rounded-md"></div>
                        <div className="h-6 w-20 bg-gray-400 rounded-md"></div>
                    </div>
                </div>
            </div>
          )}

          {/* === FORGOT PASSWORD VIEW === */}
          {view === 'forgot' && (
              <div className="animate-in fade-in slide-in-from-right duration-300">
                  {!isResetSent ? (
                      <>
                        <div className="text-center lg:text-left">
                            <button onClick={resetFlow} className="inline-flex items-center gap-2 text-gray-400 hover:text-gray-600 mb-6 font-bold text-sm transition-colors">
                                <ArrowLeft size={16} /> Back to Sign In
                            </button>
                            <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Reset Password</h2>
                            <p className="text-gray-500">Enter the email associated with your account and we'll send you a reset link.</p>
                        </div>

                        <form onSubmit={handleForgotPassword} className="space-y-6 mt-8">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
                                <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-600 transition-colors" size={20} />
                                <input 
                                    type="email" 
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 bg-white border-none shadow-soft rounded-2xl focus:ring-2 focus:ring-brand-500/20 outline-none font-medium transition-all"
                                    placeholder="merchant@lastbite.com"
                                    required
                                />
                                </div>
                            </div>

                            <button 
                                type="submit" 
                                disabled={isLoading || !email}
                                className="w-full py-4 bg-brand-600 text-white rounded-2xl font-bold text-lg shadow-lg shadow-brand-200 hover:bg-brand-700 hover:scale-[1.01] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                            >
                                {isLoading ? (
                                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>Send Reset Link <Send size={20} /></>
                                )}
                            </button>
                        </form>
                      </>
                  ) : (
                      <div className="text-center animate-in zoom-in-95 duration-300">
                          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-600">
                              <Mail size={40} />
                          </div>
                          <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Check your email</h2>
                          <p className="text-gray-500 mb-8 leading-relaxed">
                              We have sent a password reset link to <br/>
                              <span className="font-bold text-gray-900">{email}</span>
                          </p>
                          
                          <button 
                            onClick={resetFlow}
                            className="w-full py-4 bg-white border-2 border-gray-200 text-gray-700 rounded-2xl font-bold text-lg hover:bg-gray-50 hover:border-gray-300 transition-all"
                          >
                              Back to Sign In
                          </button>
                          
                          <p className="mt-6 text-sm text-gray-400">
                              Didn't receive the email? <button onClick={() => setIsResetSent(false)} className="text-brand-600 font-bold hover:underline">Click to retry</button>
                          </p>
                      </div>
                  )}
              </div>
          )}

        </div>
      </div>
    </div>
  );
};