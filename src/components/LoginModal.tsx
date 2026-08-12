import React, { useState } from 'react';
import { LimbyLogo } from './LimbyLogo';
import { Lock, Mail, ShieldCheck, Dumbbell, Sparkles } from 'lucide-react';

interface LoginModalProps {
  onLoginSuccess: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('coach@limbyfit.com');
  const [password, setPassword] = useState('limby2026');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    setTimeout(() => {
      if (password === 'limby2026' || password.length >= 4) {
        onLoginSuccess();
      } else {
        setError('كلمة المرور غير صحيحة. استخدم كلمة المرور الافتراضية: limby2026');
      }
      setLoading(false);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#050505]/95 backdrop-blur-md p-4">
      {/* Container matching mobile login mockup in prompt image */}
      <div className="w-full max-w-md bg-[#161616] border border-[#2A2A2A] rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#9CFF00]/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-[#9CFF00]/5 rounded-full blur-3xl pointer-events-none"></div>

        {/* Logo Section */}
        <div className="text-center mb-8">
          <LimbyLogo size="lg" showSubtitle={true} />
          
          <div className="mt-6 inline-flex items-center gap-2 bg-[#9CFF00]/10 border border-[#9CFF00]/30 px-3 py-1 rounded-full text-xs font-bold text-[#9CFF00]">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>نظام الإدارة الخاص بالكابتن فقط (Admin Panel)</span>
          </div>

          <h2 className="text-xl font-black text-white mt-4 tracking-tight">
            Welcome Back, Coach! 🦾
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            تسجيل دخول الكابتن لبناء ومتابعة الأنظمة الغذائية للمتدربين
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-300 mb-1.5 mr-1">
              البريد الإلكتروني للـ Admin
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute right-3.5 top-3.5" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="coach@limbyfit.com"
                className="w-full bg-[#0A0A0A] border border-[#2A2A2A] focus:border-[#9CFF00] text-white rounded-xl py-3 pr-10 pl-4 text-sm outline-none transition-all duration-200 placeholder:text-gray-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-300 mb-1.5 mr-1">
              كلمة السر (Passcode)
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute right-3.5 top-3.5" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full bg-[#0A0A0A] border border-[#2A2A2A] focus:border-[#9CFF00] text-white rounded-xl py-3 pr-10 pl-4 text-sm outline-none transition-all duration-200"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-400">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#9CFF00] hover:bg-[#8BE600] text-black font-black py-3.5 rounded-xl text-sm transition-all duration-200 shadow-[0_0_20px_rgba(156,255,0,0.3)] hover:shadow-[0_0_30px_rgba(156,255,0,0.5)] flex items-center justify-center gap-2 mt-2 cursor-pointer"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <Dumbbell className="w-4 h-4 stroke-[2.5]" />
                <span>دخول لوحة التحكم | Login</span>
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Login Option */}
        <div className="mt-6 pt-6 border-t border-[#2A2A2A] text-center">
          <button
            onClick={onLoginSuccess}
            className="text-xs text-gray-400 hover:text-[#9CFF00] flex items-center justify-center gap-1.5 mx-auto transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#9CFF00]" />
            <span>تجربة النظام فوراً بحساب الكابتن (Demo Coach Login)</span>
          </button>
        </div>

        <div className="mt-4 text-center">
          <p className="text-[10px] text-gray-500 font-mono">
            Built for Coaches. Made for Results. — LIMBY FIT v1.0
          </p>
        </div>
      </div>
    </div>
  );
};
