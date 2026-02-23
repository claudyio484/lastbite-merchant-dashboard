import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Leaf, ArrowRight, Check, Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { resetPasswordApi } from '../utils/api';

export const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (!token) {
      setError('Invalid or missing reset token. Please request a new reset link.');
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      await resetPasswordApi(token, password);
      setIsSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to reset password. The link may have expired.');
    } finally {
      setIsLoading(false);
    }
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
            Secure your<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-teal-200">account</span> today.
          </h1>
          <p className="text-brand-100 text-lg max-w-md leading-relaxed opacity-90">
            Choose a strong password to keep your merchant dashboard safe and secure.
          </p>
        </div>

        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-4 p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 max-w-md">
             <div className="w-10 h-10 rounded-full bg-emerald-400/20 flex items-center justify-center text-emerald-300">
                <ShieldCheck size={20} strokeWidth={2.5} />
             </div>
             <div>
                <p className="font-bold">Password Security</p>
                <p className="text-sm text-brand-200 opacity-80">Use at least 8 characters with mixed case.</p>
             </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-cream-50 overflow-hidden relative">
        <div className="w-full max-w-md space-y-10 transition-all duration-500">

          {!isSuccess ? (
            <div className="animate-in fade-in slide-in-from-right duration-300">
              <div className="text-center lg:text-left">
                <div className="inline-flex lg:hidden items-center gap-2 mb-8 justify-center">
                  <div className="bg-brand-600 p-2 rounded-xl text-white">
                    <Leaf size={20} />
                  </div>
                  <span className="text-xl font-bold text-gray-900">LastBite</span>
                </div>
                <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Set New Password</h2>
                <p className="text-gray-500">Enter your new password below to regain access to your account.</p>
              </div>

              <form onSubmit={handleReset} className="space-y-6 mt-8">
                {error && (
                  <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-sm font-medium">
                    {error}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">New Password</label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-600 transition-colors" size={20} />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-12 pr-12 py-4 bg-white border-none shadow-soft rounded-2xl focus:ring-2 focus:ring-brand-500/20 outline-none font-medium transition-all"
                      placeholder="••••••••"
                      required
                      minLength={8}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Confirm New Password</label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-600 transition-colors" size={20} />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-12 pr-12 py-4 bg-white border-none shadow-soft rounded-2xl focus:ring-2 focus:ring-brand-500/20 outline-none font-medium transition-all"
                      placeholder="••••••••"
                      required
                      minLength={8}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !password || !confirmPassword}
                  className="w-full py-4 bg-brand-600 text-white rounded-2xl font-bold text-lg shadow-lg shadow-brand-200 hover:bg-brand-700 hover:scale-[1.01] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>Reset Password <ArrowRight size={20} /></>
                  )}
                </button>
              </form>

              <div className="text-center mt-6">
                <Link to="/login" className="text-sm text-gray-500 font-medium hover:text-brand-600 transition-colors">
                  Back to Sign In
                </Link>
              </div>
            </div>
          ) : (
            <div className="text-center animate-in zoom-in-95 duration-300">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-600">
                <Check size={40} strokeWidth={2.5} />
              </div>
              <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Password Reset!</h2>
              <p className="text-gray-500 mb-8 leading-relaxed">
                Your password has been successfully updated.<br/>
                You can now sign in with your new password.
              </p>

              <Link
                to="/login"
                className="w-full inline-flex items-center justify-center gap-2 py-4 bg-brand-600 text-white rounded-2xl font-bold text-lg shadow-lg shadow-brand-200 hover:bg-brand-700 hover:scale-[1.01] active:scale-[0.98] transition-all"
              >
                Go to Sign In <ArrowRight size={20} />
              </Link>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};