import React, { useState } from 'react';
import { CoachProfile } from '../types/nutrition';
import { Settings, ShieldCheck, Sparkles, Phone, Instagram, Check, Save } from 'lucide-react';
import { LimbyLogo } from './LimbyLogo';

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
    </div>
  );
};
