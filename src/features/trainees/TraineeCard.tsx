import React, { memo } from 'react';
import { Copy, Dumbbell, FileText, Key, MessageCircle, Trash2 } from 'lucide-react';
import type { Trainee } from '../../types/nutrition';
import { GOAL_LABELS_AR, type AdminView } from '../../constants';
import {
  buildWhatsAppCredentialsUrl,
  copyToClipboard,
  getTraineeEmail,
  getTraineePassword
} from '../../utils/trainee';

interface TraineeCardProps {
  trainee: Trainee;
  onOpen: (traineeId: string, view: AdminView) => void;
  onRequestDelete: (trainee: Trainee) => void;
}

async function copyWithAlert(text: string, successMessage: string) {
  const ok = await copyToClipboard(text);
  alert(ok ? successMessage : `تعذر النسخ تلقائياً، انسخ يدوياً: ${text}`);
}

/** Runs a card action without also triggering the card's own click (open plan). */
const stop = (fn: () => void) => (e: React.MouseEvent) => {
  e.stopPropagation();
  fn();
};

export const TraineeCard = memo(function TraineeCard({ trainee: t, onOpen, onRequestDelete }: TraineeCardProps) {
  const email = getTraineeEmail(t);
  const password = getTraineePassword(t);

  return (
    <div
      onClick={() => onOpen(t.id, 'plan')}
      className="bg-[#161616] border border-[#262626] hover:border-[#9CFF00]/60 rounded-3xl p-5 flex flex-col justify-between cursor-pointer transition-all hover:scale-[1.01] shadow-xl group space-y-4"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#222222] border border-[#333333] group-hover:border-[#9CFF00] font-black text-[#9CFF00] flex items-center justify-center text-base shadow-sm shrink-0">
            {t.name.slice(0, 2)}
          </div>
          <div>
            <h3 className="text-base font-bold text-white group-hover:text-[#9CFF00] transition-colors leading-tight">
              {t.name}
            </h3>
            <span className="text-[11px] text-gray-400 font-mono block mt-0.5">{t.phone}</span>
          </div>
        </div>

        <div className="bg-[#0D0D0D] border border-[#262626] px-2.5 py-1 rounded-xl text-[10px] text-[#9CFF00] font-mono font-bold shrink-0">
          {t.weight} كجم | {t.height} سم
        </div>
      </div>

      {/* Login credentials */}
      <div className="bg-[#0A0A0A] border border-[#262626] rounded-2xl p-3 space-y-2">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-gray-400 font-mono font-bold flex items-center gap-1">
            <Key className="w-3 h-3 text-[#9CFF00]" />
            بيانات دخول المشترك:
          </span>
          <button
            type="button"
            onClick={stop(() => window.open(buildWhatsAppCredentialsUrl(t), '_blank', 'noopener'))}
            className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded text-[10px] flex items-center gap-1 transition-colors cursor-pointer"
            title="إرسال عبر الواتساب"
          >
            <MessageCircle className="w-3 h-3" />
            <span>إرسال بالواتساب 💬</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono">
          <button
            type="button"
            onClick={stop(() => copyWithAlert(email, `تم نسخ البريد بنجاح: ${email}`))}
            className="bg-[#141414] hover:bg-[#1F1F1F] px-2.5 py-1.5 rounded-xl border border-[#222] hover:border-[#9CFF00]/50 text-gray-300 flex items-center justify-between gap-1.5 transition-all cursor-pointer group/mail"
            title="اضغط لنسخ البريد الإلكتروني"
          >
            <span className="truncate">✉️ {email}</span>
            <Copy className="w-3 h-3 text-gray-500 group-hover/mail:text-[#9CFF00] shrink-0" />
          </button>

          <button
            type="button"
            onClick={stop(() => copyWithAlert(password, `تم نسخ كلمة المرور بنجاح: ${password}`))}
            className="bg-[#141414] hover:bg-[#1F1F1F] px-2.5 py-1.5 rounded-xl border border-[#222] hover:border-[#9CFF00]/50 text-[#9CFF00] font-bold flex items-center justify-between gap-1.5 transition-all cursor-pointer group/pass"
            title="اضغط لنسخ كلمة المرور"
          >
            <span className="truncate">🔑 {password}</span>
            <Copy className="w-3 h-3 text-gray-500 group-hover/pass:text-[#9CFF00] shrink-0" />
          </button>
        </div>
      </div>

      {/* Goal */}
      <div className="bg-[#0D0D0D] border border-[#262626] p-2.5 rounded-2xl text-xs text-gray-300 font-medium flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-[#9CFF00] font-bold shrink-0">🎯 الهدف:</span>
          <span className="font-extrabold text-white truncate">{GOAL_LABELS_AR[t.goal] ?? GOAL_LABELS_AR.fat_loss}</span>
        </div>
        {t.notes && (
          <span className="text-[10px] text-gray-400 truncate max-w-[140px]" title={t.notes}>
            ({t.notes})
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="pt-3 border-t border-[#222222] flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <button
            onClick={stop(() => onOpen(t.id, 'plan'))}
            className="bg-[#9CFF00] hover:bg-[#8BE600] text-black font-black px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-[0_0_15px_rgba(156,255,0,0.25)] transition-all cursor-pointer"
          >
            <Dumbbell className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>تصميم النظام 📝</span>
          </button>

          <button
            onClick={stop(() => onOpen(t.id, 'pdf'))}
            className="bg-[#222222] hover:bg-[#2F2F2F] text-white border border-[#383838] px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-blue-400" />
            <span>PDF 📄</span>
          </button>
        </div>

        <button
          onClick={stop(() => onRequestDelete(t))}
          className="p-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/25 border border-red-500/20 transition-all cursor-pointer shrink-0"
          title="مسح المشترك"
          aria-label="مسح المشترك"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
});
