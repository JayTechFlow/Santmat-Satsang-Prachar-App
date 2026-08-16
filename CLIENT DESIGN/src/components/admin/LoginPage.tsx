/**
 * ============================================================================
 * Santmat Satsang Prachar - Admin Login Page
 * ============================================================================
 * Real email/password admin sign-in backed by Firebase Auth with claim-gating.
 * Non-admin or suspended accounts are rejected by authService. No PIN, no mock
 * sessions — the app renders this page until a valid admin session exists.
 */

import React, { useState } from 'react';
import { Loader2, Lock, Mail, LogIn, KeyRound } from 'lucide-react';
import { authService } from '../../services/authService';
import { DiyaIcon } from '../shared/DevotionalIcons';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError(null);
    setInfo(null);

    const res = await authService.login(email.trim(), password);
    if (!res.success) {
      setError(res.error || 'लॉगिन विफल। कृपया पुनः प्रयास करें।');
    }
    setLoading(false);
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      setError('पासवर्ड रीसेट करने के लिए कृपया अपना ईमेल दर्ज करें।');
      return;
    }
    setError(null);
    setInfo(null);
    const res = await authService.resetPassword(email.trim());
    if (res.success) {
      setInfo('पासवर्ड रीसेट लिंक आपके ईमेल पर भेज दिया गया है।');
    } else {
      setError(res.error || 'पासवर्ड रीसेट भेजने में त्रुटि।');
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#FBF9F5] flex items-center justify-center p-4 select-none font-['Mukta']">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 shadow-xs mb-3">
            <DiyaIcon className="w-14 h-14" />
          </div>
          <h1 className="font-black text-2xl text-stone-900 leading-tight">
            संतमत सत्संग प्रचार
          </h1>
          <p className="text-xs text-stone-500 font-semibold mt-1">
            एडमिन पोर्टल — सुरक्षित प्रवेश (Secure Admin Access)
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-7">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block font-bold text-stone-700 text-xs mb-1.5">
                ईमेल पता (Admin Email)
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@santmatsatsang.org"
                  required
                  autoComplete="email"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:border-amber-500 text-sm font-semibold text-stone-900 transition-colors"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block font-bold text-stone-700 text-xs mb-1.5">
                पासवर्ड
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:border-amber-500 text-sm font-semibold text-stone-900 transition-colors"
                />
              </div>
            </div>

            {/* Error / Info messages */}
            {error && (
              <div className="px-3.5 py-2.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-bold">
                {error}
              </div>
            )}
            {info && (
              <div className="px-3.5 py-2.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-bold">
                {info}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full px-5 py-3 bg-[#EA580C] hover:bg-[#C2410C] disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-xl shadow-md font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>प्रमाणित हो रहा है…</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>एडमिन लॉगिन करें</span>
                </>
              )}
            </button>
          </form>

          {/* Forgot password */}
          <div className="mt-4 pt-4 border-t border-stone-100 flex items-center justify-center">
            <button
              type="button"
              onClick={handleForgotPassword}
              disabled={loading}
              className="flex items-center gap-1.5 text-xs font-bold text-amber-800 hover:text-amber-900 hover:underline disabled:opacity-60"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>पासवर्ड भूल गए? रीसेट लिंक प्राप्त करें</span>
            </button>
          </div>
        </div>

        {/* Footer note */}
        <p className="text-center text-[0.68rem] text-stone-400 font-semibold mt-5">
          केवल अधिकृत एडमिन खाते ही इस पोर्टल में प्रवेश कर सकते हैं।
        </p>
      </div>
    </div>
  );
};
