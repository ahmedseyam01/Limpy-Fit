import React, { useState } from 'react';
import { Trainee, DietPlan, CoachProfile } from '../types/nutrition';
import { Copy, Check, Download, Upload, Cloud, RefreshCw, X, ShieldCheck, Sparkles } from 'lucide-react';
import { saveFirebaseConfig, getStoredFirebaseConfig, isFirebaseConnected, removeFirebaseConfig } from '../lib/firebase';

interface SyncModalProps {
  trainees: Trainee[];
  dietPlans: DietPlan[];
  coachProfile: CoachProfile;
  onImportData: (trainees: Trainee[], plans: DietPlan[], profile?: CoachProfile) => void;
  onClose: () => void;
}

export const SyncModal: React.FC<SyncModalProps> = ({
  trainees,
  dietPlans,
  coachProfile,
  onImportData,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'quick' | 'firebase'>('quick');
  const [copied, setCopied] = useState(false);
  const [importCode, setImportCode] = useState('');
  const [importStatus, setImportStatus] = useState<{ success: boolean; message: string } | null>(null);

  // Firebase Config State
  const [firebaseConfig, setFirebaseConfig] = useState(() => 
    getStoredFirebaseConfig() || { apiKey: '', projectId: '', authDomain: '', storageBucket: '' }
  );
  const [fbConnected, setFbConnected] = useState(() => isFirebaseConnected());
  const [fbSaved, setFbSaved] = useState(false);

  // Export Data as Encoded JSON String
  const handleExportData = () => {
    try {
      const payload = {
        v: 1,
        date: new Date().toISOString(),
        trainees,
        dietPlans,
        coachProfile
      };
      const jsonStr = JSON.stringify(payload);
      // Encode to base64 for clean copy-paste
      const encoded = btoa(encodeURIComponent(jsonStr));
      navigator.clipboard.writeText(encoded);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      alert('حدث خطأ أثناء نسخ البيانات');
    }
  };

  // Import Data from Encoded JSON String
  const handleImportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setImportStatus(null);
    try {
      const cleanCode = importCode.trim();
      if (!cleanCode) return;

      const jsonStr = decodeURIComponent(atob(cleanCode));
      const parsed = JSON.parse(jsonStr);

      if (parsed && Array.isArray(parsed.trainees)) {
        onImportData(parsed.trainees, parsed.dietPlans || [], parsed.coachProfile);
        setImportStatus({
          success: true,
          message: `تم استيراد ${parsed.trainees.length} متدرب و ${parsed.dietPlans?.length || 0} نظام غذائي بنجاح!`
        });
        setImportCode('');
      } else {
        setImportStatus({
          success: false,
          message: 'كود المزامنة غير صالح! يرجى التأكد من نسخ الكود كاملاً.'
        });
      }
    } catch (err) {
      setImportStatus({
        success: false,
        message: 'كود المزامنة غير صحيح أو تالف.'
      });
    }
  };

  // Firebase Save Handler
  const handleSaveFirebase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
      alert('يرجى كتابة API Key و Project ID الخاص بمشروع Firebase');
      return;
    }
    saveFirebaseConfig(firebaseConfig);
    setFbConnected(isFirebaseConnected());
    setFbSaved(true);
    setTimeout(() => setFbSaved(false), 3000);
  };

  const handleDisconnectFirebase = () => {
    removeFirebaseConfig();
    setFirebaseConfig({ apiKey: '', projectId: '', authDomain: '', storageBucket: '' });
    setFbConnected(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3.5 sm:p-4 overflow-hidden min-h-screen">
      <div className="bg-[#161616] border border-[#2A2A2A] rounded-3xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl relative my-auto overflow-hidden">
        
        {/* Modal Header */}
        <div className="shrink-0 bg-[#161616] px-4 sm:px-6 py-3.5 border-b border-[#262626] flex items-center justify-between gap-2 rounded-t-3xl z-20">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-[#9CFF00] text-black flex items-center justify-center font-black shrink-0 shadow-[0_0_10px_rgba(156,255,0,0.3)]">
              <RefreshCw className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div className="min-w-0">
              <h2 className="text-xs sm:text-base font-black text-white leading-tight truncate">المزامنة ونقل البيانات بين الموبايل واللابتوب</h2>
              <p className="text-[10px] sm:text-[11px] text-gray-400 truncate">نقل البيانات فوراً في ثانية واحدة أو تفعيل السحابة</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="bg-[#222222] hover:bg-red-500/20 text-gray-300 hover:text-red-400 border border-[#333333] hover:border-red-500/40 p-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0"
          >
            <X className="w-4 h-4 text-red-400" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="p-3.5 pb-0 bg-[#121212] border-b border-[#222]">
          <div className="grid grid-cols-2 gap-2 p-1 bg-[#0A0A0A] border border-[#262626] rounded-2xl">
            <button
              type="button"
              onClick={() => setActiveTab('quick')}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'quick'
                  ? 'bg-[#9CFF00] text-black font-black shadow-[0_0_12px_rgba(156,255,0,0.25)]'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Download className="w-3.5 h-3.5" />
              <span>مزامنة سريعة (كود 1-Click)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('firebase')}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'firebase'
                  ? 'bg-[#9CFF00] text-black font-black shadow-[0_0_12px_rgba(156,255,0,0.25)]'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Cloud className="w-3.5 h-3.5" />
              <span>سحابة دائمية (Firebase)</span>
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 no-scrollbar">

          {/* TAB 1: QUICK CODE SYNC */}
          {activeTab === 'quick' && (
            <div className="space-y-5">
              
              {/* Step 1: Export */}
              <div className="bg-[#0A0A0A] border border-[#2A2A2A] rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-[#9CFF00]/20 text-[#9CFF00] text-[10px] font-black flex items-center justify-center">1</span>
                    تصدير البيانات من هذا الجهاز (الموبايل / اللابتوب)
                  </span>
                  <span className="text-[10px] text-gray-400 font-mono">{trainees.length} متدربين</span>
                </div>

                <p className="text-[11px] text-gray-400 leading-relaxed">
                  اضغط على الزر أدناه لنسخ جميع بيانات المتدربين والأنظمة الغذائية الحالية من هذا الجهاز:
                </p>

                <button
                  type="button"
                  onClick={handleExportData}
                  className="w-full bg-[#9CFF00] hover:bg-[#8BE600] text-black font-black py-3 rounded-xl text-xs flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(156,255,0,0.25)] transition-all cursor-pointer active:scale-95"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>تم نسخ كود المزامنة بنجاح إلى الحافظة! 📋</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 stroke-[2.5]" />
                      <span>نسخ كود المزامنة (Copy Sync Code)</span>
                    </>
                  )}
                </button>
              </div>

              {/* Step 2: Import */}
              <form onSubmit={handleImportSubmit} className="bg-[#0A0A0A] border border-[#2A2A2A] rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 text-[10px] font-black flex items-center justify-center">2</span>
                    استيراد وتحديث البيانات على هذا الجهاز
                  </span>
                </div>

                <p className="text-[11px] text-gray-400 leading-relaxed">
                  قم بلصق الكود الذي قمت بنسخه من الجهاز الآخر واضغط على تحديث:
                </p>

                <textarea
                  rows={3}
                  required
                  value={importCode}
                  onChange={(e) => setImportCode(e.target.value)}
                  placeholder="اصق كود المزامنة هنا (ey...)"
                  className="w-full bg-[#161616] border border-[#262626] focus:border-[#9CFF00] text-white font-mono text-[11px] rounded-xl p-3 outline-none resize-none"
                />

                {importStatus && (
                  <div className={`p-2.5 rounded-xl text-xs font-bold flex items-center gap-2 ${
                    importStatus.success
                      ? 'bg-[#9CFF00]/10 border border-[#9CFF00]/30 text-[#9CFF00]'
                      : 'bg-red-500/10 border border-red-500/30 text-red-400'
                  }`}>
                    {importStatus.success ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                    <span>{importStatus.message}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-3 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer active:scale-95"
                >
                  <Upload className="w-4 h-4 stroke-[2.5]" />
                  <span>استيراد وتحديث البيانات الآن 📥</span>
                </button>
              </form>
            </div>
          )}

          {/* TAB 2: FIREBASE SETTINGS */}
          {activeTab === 'firebase' && (
            <form onSubmit={handleSaveFirebase} className="space-y-4">
              <div className="bg-[#0A0A0A] border border-[#2A2A2A] rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-[#222] pb-2.5">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Cloud className="w-4 h-4 text-[#9CFF00]" />
                    المزامنة السحابية التلقائية 24/7
                  </span>
                  {fbConnected ? (
                    <span className="text-[10px] bg-[#9CFF00]/10 text-[#9CFF00] border border-[#9CFF00]/30 px-2 py-0.5 rounded-full font-bold">
                      متصل بالسحابة
                    </span>
                  ) : (
                    <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold">
                      تخزين محلي
                    </span>
                  )}
                </div>

                {fbSaved && (
                  <div className="bg-[#9CFF00]/10 border border-[#9CFF00]/30 text-[#9CFF00] p-2.5 rounded-xl text-xs font-bold flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    <span>تم حفظ إعدادات Firebase وتفعيل المزامنة الفورية!</span>
                  </div>
                )}

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1">Firebase API Key *</label>
                    <input
                      type="text"
                      dir="ltr"
                      required
                      placeholder="AIzaSy..."
                      value={firebaseConfig.apiKey}
                      onChange={(e) => setFirebaseConfig({ ...firebaseConfig, apiKey: e.target.value })}
                      className="w-full bg-[#161616] border border-[#262626] focus:border-[#9CFF00] text-white font-mono rounded-xl p-2.5 text-xs outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1">Firebase Project ID *</label>
                    <input
                      type="text"
                      dir="ltr"
                      required
                      placeholder="limby-fit-app"
                      value={firebaseConfig.projectId}
                      onChange={(e) => setFirebaseConfig({ ...firebaseConfig, projectId: e.target.value })}
                      className="w-full bg-[#161616] border border-[#262626] focus:border-[#9CFF00] text-white font-mono rounded-xl p-2.5 text-xs outline-none"
                    />
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between gap-2">
                  {fbConnected && (
                    <button
                      type="button"
                      onClick={handleDisconnectFirebase}
                      className="bg-red-500/10 text-red-400 text-xs font-bold px-3 py-2 rounded-xl"
                    >
                      فصل السحابة
                    </button>
                  )}

                  <button
                    type="submit"
                    className="bg-[#9CFF00] hover:bg-[#8BE600] text-black font-black text-xs px-5 py-2.5 rounded-xl flex items-center gap-1.5 ml-auto cursor-pointer"
                  >
                    <Cloud className="w-4 h-4 stroke-[2.5]" />
                    <span>تفعيل المزامنة السحابية</span>
                  </button>
                </div>
              </div>
            </form>
          )}

        </div>

      </div>
    </div>
  );
};
