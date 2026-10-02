import React, { useState } from 'react';
import { Loader2, Lock, Mail, LogIn, KeyRound } from 'lucide-react';
import { authService } from '../services/authService';
import { DiyaIcon } from '../../../components/shared/DevotionalIcons';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading || googleLoading) return;
    setLoading(true);
    setError(null);
    setInfo(null);

    const res = await authService.login(email.trim(), password);
    if (!res.success) {
      setError(res.error || 'लॉगिन विफल। कृपया पुनः प्रयास करें।');
    }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    if (loading || googleLoading) return;
    setGoogleLoading(true);
    setError(null);
    setInfo(null);

    const res = await authService.loginWithGoogle();
    if (!res.success) {
      setError(res.error || 'गूगल लॉगिन विफल। कृपया पुनः प्रयास करें।');
    }
    setGoogleLoading(false);
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
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-7">
          {/* Google Sign-In Option */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading || googleLoading}
            className="w-full px-4 py-2.5 bg-stone-50 hover:bg-stone-100 disabled:opacity-60 border border-stone-200 text-stone-800 rounded-xl font-bold text-xs flex items-center justify-center gap-3 transition-colors mb-5 shadow-2xs"
          >
            {googleLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
                <span>गूगल प्रमाणीकरण जारी है…</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.15C3.26 21.3 7.31 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.24c-.25-.72-.38-1.49-.38-2.24s.13-1.52.38-2.24V6.61H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.39l3.99-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.61l3.99 3.15c.95-2.85 3.6-4.96 6.72-4.96z"
                  />
                </svg>
                <span>गूगल से प्रवेश करें (Continue with Google)</span>
              </>
            )}
          </button>

          <div className="relative flex items-center justify-center mb-5">
            <div className="border-t border-stone-200 w-full" />
            <span className="bg-white px-3 text-[0.7rem] text-stone-400 font-bold uppercase tracking-wider absolute">
              अथवा (OR)
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label htmlFor="admin-email" className="block font-bold text-stone-700 text-xs mb-1.5">
                ईमेल पता (Admin Email)
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="admin-email"
                  name="email"
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
              <label htmlFor="admin-password" className="block font-bold text-stone-700 text-xs mb-1.5">
                पासवर्ड
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="admin-password"
                  name="password"
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
              <div className="px-3.5 py-2.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-bold leading-relaxed">
                {error}
              </div>
            )}
            {info && (
              <div className="px-3.5 py-2.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-bold leading-relaxed">
                {info}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || googleLoading}
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
                  <span>ईमेल से एडमिन लॉगिन करें</span>
                </>
              )}
            </button>
          </form>

          {/* Forgot password */}
          <div className="mt-4 pt-4 border-t border-stone-100 flex items-center justify-center">
            <button
              type="button"
              onClick={handleForgotPassword}
              disabled={loading || googleLoading}
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
