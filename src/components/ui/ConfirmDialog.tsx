import { useEffect, type ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  title: string;
  message: ReactNode;
  confirmLabel: string;
  /** danger = red (destructive), primary = brand green */
  tone?: 'danger' | 'primary';
  onCancel: () => void;
  onConfirm: () => void;
}

const TONES = {
  danger: {
    border: 'border-red-500/30',
    icon: 'bg-red-500/10 border-red-500/30 text-red-400',
    button: 'bg-red-500 hover:bg-red-600 text-white'
  },
  primary: {
    border: 'border-[#9CFF00]/30',
    icon: 'bg-[#9CFF00]/10 border-[#9CFF00]/30 text-[#9CFF00]',
    button: 'bg-[#9CFF00] hover:bg-[#8BE600] text-black'
  }
};

export function ConfirmDialog({ title, message, confirmLabel, tone = 'danger', onCancel, onConfirm }: ConfirmDialogProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onCancel();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onCancel]);

  const t = TONES[tone];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      onClick={onCancel}
    >
      <div
        className={`bg-[#161616] border ${t.border} rounded-3xl w-full max-w-sm p-6 space-y-4 text-center shadow-2xl`}
        onClick={e => e.stopPropagation()}
      >
        <div className={`w-12 h-12 rounded-2xl border mx-auto flex items-center justify-center ${t.icon}`}>
          <AlertTriangle className="w-6 h-6" />
        </div>

        <div>
          <h3 className="text-base font-black text-white">{title}</h3>
          <p className="text-xs text-gray-400 mt-1 leading-relaxed">{message}</p>
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
            className={`w-1/2 py-2.5 rounded-xl text-xs font-black transition-colors cursor-pointer ${t.button}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
