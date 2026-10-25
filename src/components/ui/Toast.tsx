import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';
import { Check, X } from 'lucide-react';

type ToastTone = 'success' | 'error';
interface ToastState {
  id: number;
  message: string;
  tone: ToastTone;
}

const TOAST_DURATION_MS = 2500;

const ToastContext = createContext<(message: string, tone?: ToastTone) => void>(() => {});

/** Short, non-blocking feedback ("copied", "saved") instead of alert() popups. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastState | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>();

  const show = useCallback((message: string, tone: ToastTone = 'success') => {
    clearTimeout(timer.current);
    setToast({ id: Date.now(), message, tone });
    timer.current = setTimeout(() => setToast(null), TOAST_DURATION_MS);
  }, []);

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div aria-live="polite" className="no-print fixed bottom-5 inset-x-0 z-[60] flex justify-center px-4 pointer-events-none">
        {toast && (
          <div
            key={toast.id}
            className={`flex items-center gap-2 max-w-sm rounded-2xl border px-4 py-2.5 text-xs font-bold shadow-2xl backdrop-blur-md ${
              toast.tone === 'success'
                ? 'bg-[#161616]/95 border-[#9CFF00]/40 text-[#9CFF00]'
                : 'bg-[#1A1010]/95 border-red-500/40 text-red-300'
            }`}
          >
            {toast.tone === 'success' ? <Check className="w-4 h-4 shrink-0" /> : <X className="w-4 h-4 shrink-0" />}
            <span className="break-all">{toast.message}</span>
          </div>
        )}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
