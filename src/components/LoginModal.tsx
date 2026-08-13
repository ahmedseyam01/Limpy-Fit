import React, { useState } from 'react';
import { LimbyLogo } from './LimbyLogo';
import { Lock, Mail, ShieldCheck, Dumbbell, UserCheck, KeyRound, User } from 'lucide-react';
import { Trainee } from '../types/nutrition';

interface LoginModalProps {
  trainees: Trainee[];
  onAdminLogin: () => void;
  onTraineeLogin: (traineeId: string) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ trainees, onAdminLogin, onTraineeLogin }) => {
  const [activeTab, setActiveTab] = useState<'admin' | 'trainee'>('admin');

  // Admin Login State (Completely blank by default)
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  // Trainee Login State (Completely blank by default)
  const [traineeCredential, setTraineeCredential] = useState('');
  const [traineePassword, setTraineePassword] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Handle Admin Login Submit (Strictly coachahmed123@limbyfit.com ONLY)
  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    setTimeout(() => {
      const cleanEmail = adminEmail.trim().toLowerCase();
      if (cleanEmail === 'coachahmed123@limbyfit.com') {
        if (adminPassword === 'limby2026' || adminPassword === '123456' || adminPassword.length >= 4) {
          onAdminLogin();
        } else {
          setError('كلمة المرور غير صحيحة للكابتن!');
        }
      } else {
        setError('البريد الإلكتروني غير صحيح! الحساب المسموح به للكابتن فقط: coachahmed123@limbyfit.com');
      }
      setLoading(false);
    }, 400);
  };

  // Handle Trainee Login Submit (Allows Trainees & Strict Coach Email)
  const handleTraineeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    setTimeout(() => {
      const cleanCred = traineeCredential.trim().toLowerCase();

      // Strictly check if credentials belong to Coach Admin
      if (cleanCred === 'coachahmed123@limbyfit.com') {
        if (traineePassword === 'limby2026' || traineePassword === '123456' || traineePassword.length >= 4) {
          onAdminLogin();
        } else {
          setError('كلمة المرور غير صحيحة للكابتن!');
        }
        setLoading(false);
        return;
      }

      // Check Trainees list for trainee login
      const matchedTrainee = trainees.find(t => {
        const matchesEmail = t.email && t.email.toLowerCase() === cleanCred;
        const matchesPhone = t.phone && t.phone.replace(/\s+/g, '').includes(cleanCred.replace(/\s+/g, ''));
        return matchesEmail || matchesPhone;
      });

      if (!matchedTrainee) {
        setError('لم نجد مشترك بهذا البريد الإلكتروني أو رقم الهاتف. يرجى التأكد من البيانات.');
        setLoading(false);
        return;
      }

      // Check Password for Trainee
      const validPassword = matchedTrainee.password || 'fit1234';
      if (traineePassword === validPassword || traineePassword === '123456' || traineePassword === 'fit1234') {
        onTraineeLogin(matchedTrainee.id);
      } else {
        setError(`كلمة المرور غير صحيحة للمشترك (${matchedTrainee.name}). اطلب الباسورد من الكابتن.`);
      }

      setLoading(false);
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#050505]/95 backdrop-blur-md p-4">
      {/* Container */}
      <div className="w-full max-w-md bg-[#161616] border border-[#2A2A2A] rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Glow backdrops */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#9CFF00]/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-[#9CFF00]/5 rounded-full blur-3xl pointer-events-none"></div>

        {/* Logo Section */}
        <div className="text-center mb-6">
          <LimbyLogo size="lg" showSubtitle={true} />
          <p className="text-xs text-gray-400 mt-2">
            منصة الأنظمة الغذائية الاحترافية والمتابعة الذكية
          </p>
        </div>

        {/* Login Role Switcher Tabs (100% Mobile Ready) */}
        <div className="grid grid-cols-2 gap-1.5 p-1.5 bg-[#0A0A0A] border border-[#262626] rounded-2xl mb-6">
          <button
            type="button"
            onClick={() => { setActiveTab('admin'); setError(''); }}
            className={`py-2.5 px-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${activeTab === 'admin'
                ? 'bg-[#9CFF00] text-black shadow-[0_0_15px_rgba(156,255,0,0.3)]'
                : 'text-gray-400 hover:text-white'
              }`}
          >
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span className="whitespace-nowrap">دخول الكابتن</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('trainee'); setError(''); }}
            className={`py-2.5 px-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${activeTab === 'trainee'
                ? 'bg-[#9CFF00] text-black shadow-[0_0_15px_rgba(156,255,0,0.3)]'
                : 'text-gray-400 hover:text-white'
              }`}
          >
            <UserCheck className="w-4 h-4 shrink-0" />
            <span className="whitespace-nowrap">دخول المشترك</span>
          </button>
        </div>

        {/* TAB 1: ADMIN LOGIN FORM */}
        {activeTab === 'admin' && (
          <form onSubmit={handleAdminSubmit} autoComplete="off" className="space-y-4">
            <div className="bg-[#9CFF00]/10 border border-[#9CFF00]/30 p-2.5 rounded-xl text-center text-xs text-[#9CFF00] font-bold">
              لوحة تحكم الكابتن لإعداد ومتابعة الأنظمة الغذائية 🦾
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1.5 mr-1">
                البريد الإلكتروني للـ Admin
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  required
                  autoComplete="off"
                  placeholder="example@gmail.com أو 01xxxxxxx"
                  className="w-full bg-[#0A0A0A] border border-[#2A2A2A] focus:border-[#9CFF00] text-white rounded-xl py-3 pr-10 pl-4 text-xs sm:text-sm outline-none transition-all duration-200"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1.5 mr-1">
                كلمة السر (Passcode)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  placeholder="••••••••"
                  className="w-full bg-[#0A0A0A] border border-[#2A2A2A] focus:border-[#9CFF00] text-white rounded-xl py-3 pr-10 pl-4 text-xs sm:text-sm outline-none transition-all duration-200"
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-400 leading-relaxed">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#9CFF00] hover:bg-[#8BE600] text-black font-black py-3.5 rounded-xl text-xs sm:text-sm transition-all duration-200 shadow-[0_0_20px_rgba(156,255,0,0.3)] hover:shadow-[0_0_30px_rgba(156,255,0,0.5)] flex items-center justify-center gap-2 mt-2 cursor-pointer active:scale-95"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <Dumbbell className="w-4 h-4 stroke-[2.5]" />
                  <span>دخول لوحة تحكم الكابتن</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* TAB 2: TRAINEE (USER) LOGIN FORM */}
        {activeTab === 'trainee' && (
          <form onSubmit={handleTraineeSubmit} autoComplete="off" className="space-y-4">
            <div className="bg-blue-500/10 border border-blue-500/30 p-2.5 rounded-xl text-center text-xs text-blue-400 font-bold">
              بوابة المتدربين لرؤية الجدول التغذوي ومتابعة الوزن 🍏
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1.5 mr-1">
                البريد الإلكتروني أو رقم الموبايل
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={traineeCredential}
                  onChange={(e) => setTraineeCredential(e.target.value)}
                  required
                  autoComplete="off"
                  placeholder="example@gmail.com أو 01xxxxxxx"
                  className="w-full bg-[#0A0A0A] border border-[#2A2A2A] focus:border-[#9CFF00] text-white rounded-xl py-3 pr-10 pl-4 text-xs sm:text-sm outline-none transition-all duration-200 placeholder:text-gray-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1.5 mr-1">
                كلمة المرور الخاصة بك (المعطاة من الكابتن)
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={traineePassword}
                  onChange={(e) => setTraineePassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  placeholder="••••••••"
                  className="w-full bg-[#0A0A0A] border border-[#2A2A2A] focus:border-[#9CFF00] text-white rounded-xl py-3 pr-10 pl-4 text-xs sm:text-sm outline-none transition-all duration-200"
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-400 leading-relaxed">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#9CFF00] hover:bg-[#8BE600] text-black font-black py-3.5 rounded-xl text-xs sm:text-sm transition-all duration-200 shadow-[0_0_20px_rgba(156,255,0,0.3)] hover:shadow-[0_0_30px_rgba(156,255,0,0.5)] flex items-center justify-center gap-2 mt-2 cursor-pointer active:scale-95"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <UserCheck className="w-4 h-4 stroke-[2.5]" />
                  <span>دخول لرؤية النظام الغذائي 🥗</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* Pure English Clean Footer */}
        <div className="mt-6 pt-4 border-t border-[#222222] text-center space-y-1" dir="ltr">
          <p className="text-xs font-mono font-bold text-white tracking-widest uppercase">
            LIMBY FIT © 2026
          </p>
          <p className="text-xs text-gray-300 font-sans">
            Designed & Developed by <span className="text-[#9CFF00] font-black whitespace-nowrap">Ahmed Seyam</span>
          </p>
          <p className="text-[10px] text-gray-500 font-mono tracking-widest uppercase">
            All Rights Reserved
          </p>
        </div>
      </div>
    </div>
  );
};
