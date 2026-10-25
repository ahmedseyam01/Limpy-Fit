import { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDeleteModalProps {
  traineeName: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export function ConfirmDeleteModal({ traineeName, onCancel, onConfirm }: ConfirmDeleteModalProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onCancel();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onCancel]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      onClick={onCancel}
    >
      <div
        className="bg-[#161616] border border-red-500/30 rounded-3xl w-full max-w-sm p-6 space-y-4 text-center shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 mx-auto flex items-center justify-center">
          <AlertTriangle className="w-6 h-6" />
        </div>

        <div>
          <h3 className="text-base font-black text-white">تأكيد مسح المشترك</h3>
          <p className="text-xs text-gray-400 mt-1">
            هل أنت متأكد من مسح حساب المشترك <span className="text-white font-bold">"{traineeName}"</span> والنظام الخاص به نهائياً؟
          </p>
        </div>

        <div className="flex items-center gap-2 pt-2">
          <button
            onClick={onCancel}
            className="w-1/2 py-2.5 rounded-xl bg-[#262626] text-gray-300 text-xs font-bold transition-colors cursor-pointer"
          >
            إلغاء
          </button>
          <button
            onClick={onConfirm}
            className="w-1/2 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-xs font-black transition-colors cursor-pointer"
          >
            مسح المشترك 🗑️
          </button>
        </div>
      </div>
    </div>
  );
}
