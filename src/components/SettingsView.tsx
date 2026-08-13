import React, { useState } from 'react';
import { CoachProfile } from '../types/nutrition';
import { Settings, ShieldCheck, Sparkles, Phone, Instagram, Check, Save, Cloud } from 'lucide-react';
import { LimbyLogo } from './LimbyLogo';
import { getStoredFirebaseConfig, saveFirebaseConfig, removeFirebaseConfig, isFirebaseConnected } from '../lib/firebase';

interface SettingsViewProps {
  coachProfile: CoachProfile;
  onUpdateProfile: (profile: CoachProfile) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  coachProfile,
  onUpdateProfile
}) => {
  const [name, setName] = useState(coachProfile.name);
  const [title, setTitle] = useState(coachProfile.title);
  const [brandName, setBrandName] = useState(coachProfile.brandName);
  const [slogan, setSlogan] = useState(coachProfile.slogan);
  const [phone, setPhone] = useState(coachProfile.phone);
  const [whatsapp, setWhatsapp] = useState(coachProfile.whatsapp);
  const [instagram, setInstagram] = useState(coachProfile.instagram);
  const [instructions, setInstructions] = useState(coachProfile.generalInstructions.join('\n'));
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const updated: CoachProfile = {
      ...coachProfile,
      name,
      title,
      brandName,
      slogan,
      phone,
      whatsapp,
      instagram,
      generalInstructions: instructions.split('\n').filter(i => i.trim().length > 0)
    };

    onUpdateProfile(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="bg-[#161616] border border-[#2A2A2A] rounded-3xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-[#9CFF00]" />
            <span className="text-xs font-mono text-[#9CFF00] font-bold uppercase tracking-widest">
              BRAND & COACH PROFILE SETTINGS
            </span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1">
            إعدادات هوية الكابتن واللوجو (Brand Identity)
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">
            تخصيص البيانات واللوجو وروابط التواصل التي تظهر في ملفات الـ PDF المطبوعة
          </p>
        </div>

        {saved && (
          <div className="bg-[#9CFF00]/10 border border-[#9CFF00]/40 text-[#9CFF00] font-bold text-xs px-4 py-2 rounded-2xl flex items-center gap-2">
            <Check className="w-4 h-4" />
            <span>تم حفظ التعديلات بنجاح!</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Brand Preview Card matching prompt logo specs */}
        <div className="bg-[#161616] border border-[#2A2A2A] rounded-3xl p-6 flex flex-col items-center justify-between text-center min-h-[350px]">
          <div>
            <span className="text-[10px] text-gray-500 font-mono block mb-4">LIVE PDF LOGO PREVIEW</span>
            <LimbyLogo size="xl" showSubtitle={true} />
          </div>

          <div className="w-full bg-[#0A0A0A] border border-[#262626] p-4 rounded-2xl space-y-1">
            <span className="text-sm font-black text-white block">{name}</span>
            <span className="text-xs text-[#9CFF00] font-mono block">{title}</span>
            <span className="text-[10px] text-gray-500 font-mono block">{whatsapp}</span>
          </div>
        </div>

        {/* Profile Inputs (2 Columns) */}
        <div className="lg:col-span-2 bg-[#161616] border border-[#2A2A2A] rounded-3xl p-6 space-y-5">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 pb-3 border-b border-[#262626]">
            <ShieldCheck className="w-4 h-4 text-[#9CFF00]" />
            بيانات الكابتن والمؤسسة
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1">اسم الكابتن / الأدمن</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#0A0A0A] border border-[#2A2A2A] text-white rounded-xl p-2.5 text-xs outline-none focus:border-[#9CFF00]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1">المسمى الوظيفي (Title)</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-[#0A0A0A] border border-[#2A2A2A] text-white rounded-xl p-2.5 text-xs outline-none focus:border-[#9CFF00]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1">اسم البراند (Brand Name)</label>
              <input
                type="text"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                className="w-full bg-[#0A0A0A] border border-[#2A2A2A] text-[#9CFF00] font-black rounded-xl p-2.5 text-xs outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1">الشعار اللفظي (Slogan)</label>
              <input
                type="text"
                value={slogan}
                onChange={(e) => setSlogan(e.target.value)}
                className="w-full bg-[#0A0A0A] border border-[#2A2A2A] text-white font-mono rounded-xl p-2.5 text-xs outline-none focus:border-[#9CFF00]"
              />
            </div>
          </div>

          {/* Contact Channels */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-[#262626]">
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1">رقم الهاتف</label>
              <input
                type="text"
                dir="ltr"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-[#0A0A0A] border border-[#2A2A2A] text-white font-mono rounded-xl p-2.5 text-xs outline-none text-left focus:border-[#9CFF00]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1">الواتساب (WhatsApp)</label>
              <input
                type="text"
                dir="ltr"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                className="w-full bg-[#0A0A0A] border border-[#2A2A2A] text-white font-mono rounded-xl p-2.5 text-xs outline-none text-left focus:border-[#9CFF00]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1">حساب الانستجرام</label>
              <input
                type="text"
                dir="ltr"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                className="w-full bg-[#0A0A0A] border border-[#2A2A2A] text-white font-mono rounded-xl p-2.5 text-xs outline-none text-left focus:border-[#9CFF00]"
              />
            </div>
          </div>

          {/* General Instructions Template */}
          <div>
            <label className="block text-xs font-bold text-gray-300 mb-1">تعليمات الكابتن العامة (تظهر في أسفل الـ PDF)</label>
            <textarea
              rows={4}
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              className="w-full bg-[#0A0A0A] border border-[#2A2A2A] text-white rounded-xl p-3 text-xs outline-none resize-none"
            />
          </div>

          <div className="pt-4 border-t border-[#262626] flex justify-end">
            <button
              type="submit"
              className="bg-[#9CFF00] hover:bg-[#8BE600] text-black font-black px-6 py-3 rounded-2xl text-xs flex items-center gap-2 shadow-[0_0_20px_rgba(156,255,0,0.3)] transition-all cursor-pointer"
            >
              <Save className="w-4 h-4 stroke-[2.5]" />
              <span>حفظ التعديلات والتطبيق المباشر</span>
            </button>
          </div>
        </div>
      </form>

      {/* Firebase Cloud Sync Settings Panel */}
      <CloudSyncConfigPanel />
    </div>
  );
};

// Sub-component for Firebase Cloud Sync Settings
const CloudSyncConfigPanel: React.FC = () => {
  const [config, setConfig] = useState(() => getStoredFirebaseConfig() || { apiKey: '', projectId: '', authDomain: '', storageBucket: '', appId: '' });
  const [connected, setConnected] = useState(() => isFirebaseConnected());
  const [syncSaved, setSyncSaved] = useState(false);

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (!config.apiKey || !config.projectId) {
      alert('يرجى إدخال API Key و Project ID على الأقل للربط السحابي');
      return;
    }
    const success = saveFirebaseConfig(config);
    setConnected(isFirebaseConnected());
    setSyncSaved(true);
    setTimeout(() => setSyncSaved(false), 3000);
  };

  const handleDisconnect = () => {
    removeFirebaseConfig();
    setConfig({ apiKey: '', projectId: '', authDomain: '', storageBucket: '', appId: '' });
    setConnected(false);
  };

  return (
    <div className="bg-[#161616] border border-[#2A2A2A] rounded-3xl p-6 space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-[#262626]">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Cloud className="w-4 h-4 text-[#9CFF00]" />
            <span>المزامنة السحابية الفورية (Firebase Cloud Sync)</span>
          </h3>
          <p className="text-xs text-gray-400 mt-1">
            ربط التطبيق بالسحابة لكي تظهر التعديلات والمتدربين فوراً بين الهاتف واللابتوب
          </p>
        </div>

        <div className="flex items-center gap-2">
          {connected ? (
            <span className="bg-[#9CFF00]/10 border border-[#9CFF00]/40 text-[#9CFF00] font-bold text-xs px-3 py-1.5 rounded-xl flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#9CFF00] animate-pulse"></span>
              متصل بالسحابة (Cloud Active)
            </span>
          ) : (
            <span className="bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold text-xs px-3 py-1.5 rounded-xl flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              تخزين محلي فقط (Local Storage Only)
            </span>
          )}
        </div>
      </div>

      {syncSaved && (
        <div className="bg-[#9CFF00]/10 border border-[#9CFF00]/40 text-[#9CFF00] font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>تم حفظ إعدادات المزامنة السحابية بنجاح! يتم الآن المزامنة التلقائية.</span>
        </div>
      )}

      <form onSubmit={handleSaveConfig} className="space-y-4 pt-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-300 mb-1">Firebase API Key *</label>
            <input
              type="text"
              dir="ltr"
              required
              placeholder="AIzaSy..."
              value={config.apiKey}
              onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
              className="w-full bg-[#0A0A0A] border border-[#2A2A2A] text-white font-mono rounded-xl p-2.5 text-xs outline-none text-left focus:border-[#9CFF00]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-300 mb-1">Firebase Project ID *</label>
            <input
              type="text"
              dir="ltr"
              required
              placeholder="limby-fit-app"
              value={config.projectId}
              onChange={(e) => setConfig({ ...config, projectId: e.target.value })}
              className="w-full bg-[#0A0A0A] border border-[#2A2A2A] text-white font-mono rounded-xl p-2.5 text-xs outline-none text-left focus:border-[#9CFF00]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-300 mb-1">Auth Domain (اختياري)</label>
            <input
              type="text"
              dir="ltr"
              placeholder="limby-fit-app.firebaseapp.com"
              value={config.authDomain || ''}
              onChange={(e) => setConfig({ ...config, authDomain: e.target.value })}
              className="w-full bg-[#0A0A0A] border border-[#2A2A2A] text-white font-mono rounded-xl p-2.5 text-xs outline-none text-left focus:border-[#9CFF00]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-300 mb-1">Storage Bucket (اختياري)</label>
            <input
              type="text"
              dir="ltr"
              placeholder="limby-fit-app.appspot.com"
              value={config.storageBucket || ''}
              onChange={(e) => setConfig({ ...config, storageBucket: e.target.value })}
              className="w-full bg-[#0A0A0A] border border-[#2A2A2A] text-white font-mono rounded-xl p-2.5 text-xs outline-none text-left focus:border-[#9CFF00]"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="text-[11px] text-gray-400">
            * يمكنك الحصول على هذه البيانات مجاناً من <a href="https://console.firebase.google.com" target="_blank" rel="noreferrer" className="text-[#9CFF00] underline">Firebase Console</a>
          </div>

          <div className="flex items-center gap-2">
            {connected && (
              <button
                type="button"
                onClick={handleDisconnect}
                className="bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold px-4 py-2.5 rounded-xl text-xs transition-all cursor-pointer"
              >
                فصل السحابة
              </button>
            )}

            <button
              type="submit"
              className="bg-[#9CFF00] hover:bg-[#8BE600] text-black font-bold px-5 py-2.5 rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(156,255,0,0.2)]"
            >
              <Cloud className="w-4 h-4 stroke-[2.5]" />
              <span>تفعيل المزامنة السحابية</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
