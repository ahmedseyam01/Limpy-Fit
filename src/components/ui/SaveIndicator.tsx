import { useEffect, useState } from 'react';
import { Check, CloudOff, Loader2 } from 'lucide-react';
import type { SaveStatus } from '../../lib/cloudSync';

const SAVED_VISIBLE_MS = 2000;

/** Small pill in the corner so the coach knows edits are being saved (they save automatically). */
export function SaveIndicator({ status }: { status: SaveStatus }) {
  const [showSaved, setShowSaved] = useState(false);

  useEffect(() => {
    if (status !== 'saved') return;
    setShowSaved(true);
    const id = setTimeout(() => setShowSaved(false), SAVED_VISIBLE_MS);
    return () => clearTimeout(id);
  }, [status]);

  if (status === 'idle' || (status === 'saved' && !showSaved)) return null;

  const content = {
    saving: { icon: <Loader2 className="w-3.5 h-3.5 animate-spin" />, text: 'جاري الحفظ...', cls: 'text-gray-300 border-[#333]' },
    saved: { icon: <Check className="w-3.5 h-3.5" />, text: 'اتحفظ', cls: 'text-[#9CFF00] border-[#9CFF00]/40' },
    error: { icon: <CloudOff className="w-3.5 h-3.5" />, text: 'مش متحفظ على السيرفر لسه — هيتحفظ لما الاتصال يرجع', cls: 'text-amber-300 border-amber-500/40' }
  }[status];

  return (
    <div
      role="status"
      className={`no-print fixed bottom-4 left-4 z-40 flex items-center gap-1.5 bg-[#161616]/95 backdrop-blur-md border rounded-full px-3 py-1.5 text-[11px] font-bold shadow-lg max-w-[calc(100vw-2rem)] ${content.cls}`}
    >
      {content.icon}
      <span>{content.text}</span>
    </div>
  );
}
