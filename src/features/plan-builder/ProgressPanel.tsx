import { useMemo, useState } from 'react';
import { ChevronDown, Scale, TrendingDown, TrendingUp } from 'lucide-react';
import type { Trainee } from '../../types/nutrition';

/** Weight logs oldest → newest. */
export function sortLogsByDate(logs: Trainee['progressLogs'] = []) {
  return [...logs].sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id));
}

const formatKg = (n: number) => `${Math.round(n * 10) / 10}`;

/** Small inline chart of the weight trend (no chart library needed). */
function Sparkline({ values }: { values: number[] }) {
  if (values.length < 2) return null;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const points = values
    .map((v, i) => `${(i / (values.length - 1)) * 100},${36 - ((v - min) / range) * 32}`)
    .join(' ');
  return (
    <svg viewBox="0 0 100 40" preserveAspectRatio="none" className="w-full h-12" aria-hidden="true">
      <polyline points={points} fill="none" stroke="#9CFF00" strokeWidth="2" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

/** Lets the coach follow the weight entries a trainee logs from their portal. */
export function ProgressPanel({ trainee }: { trainee: Trainee }) {
  const [open, setOpen] = useState(false);
  const logs = useMemo(() => sortLogsByDate(trainee.progressLogs), [trainee.progressLogs]);

  const first = logs[0];
  const last = logs[logs.length - 1];
  const change = first && last ? last.weight - first.weight : 0;
  const losingGoal = trainee.goal === 'fat_loss' || trainee.goal === 'extreme_cut';
  const goodDirection = change === 0 ? null : losingGoal ? change < 0 : trainee.goal === 'muscle_gain' ? change > 0 : null;

  return (
    <div className="bg-[#161616] border border-[#2A2A2A] rounded-3xl">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        className="w-full flex items-center justify-between gap-3 p-4 sm:p-5 cursor-pointer text-right"
      >
        <span className="flex items-center gap-2 flex-wrap">
          <Scale className="w-4 h-4 text-[#9CFF00]" />
          <span className="text-sm font-extrabold text-white">متابعة الوزن</span>
          {logs.length > 0 && (
            <span className="text-xs text-gray-300">
              {formatKg(last.weight)} كجم
              {logs.length > 1 && (
                <span className={`ms-1.5 font-bold ${goodDirection === false ? 'text-amber-400' : 'text-[#9CFF00]'}`}>
                  (<bdi dir="ltr">{change > 0 ? '+' : ''}{formatKg(change)}</bdi> كجم)
                </span>
              )}
            </span>
          )}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="px-4 sm:px-5 pb-5 space-y-4 border-t border-[#222] pt-4">
          {logs.length === 0 ? (
            <p className="text-xs text-gray-400">المتدرب لسه مسجلش أي وزن من بوابته.</p>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-[#0D0D0D] border border-[#262626] rounded-2xl p-2.5">
                  <span className="text-[11px] text-gray-400 block">أول وزن</span>
                  <span className="text-base font-black text-white">{formatKg(first.weight)}</span>
                  <span className="text-[11px] text-gray-400 block">{first.date}</span>
                </div>
                <div className="bg-[#0D0D0D] border border-[#262626] rounded-2xl p-2.5">
                  <span className="text-[11px] text-gray-400 block">آخر وزن</span>
                  <span className="text-base font-black text-[#9CFF00]">{formatKg(last.weight)}</span>
                  <span className="text-[11px] text-gray-400 block">{last.date}</span>
                </div>
                <div className="bg-[#0D0D0D] border border-[#262626] rounded-2xl p-2.5">
                  <span className="text-[11px] text-gray-400 block">التغيير</span>
                  <span
                    className={`text-base font-black flex items-center justify-center gap-1 ${goodDirection === false ? 'text-amber-400' : 'text-[#9CFF00]'}`}
                  >
                    {change < 0 ? <TrendingDown className="w-4 h-4" /> : change > 0 ? <TrendingUp className="w-4 h-4" /> : null}
                    <bdi dir="ltr">{change > 0 ? '+' : ''}{formatKg(change)}</bdi>
                  </span>
                  <span className="text-[11px] text-gray-400 block">كجم</span>
                </div>
              </div>

              <Sparkline values={logs.map(l => l.weight)} />

              <ul className="space-y-1.5 max-h-60 overflow-y-auto">
                {[...logs].reverse().map((log, i, arr) => {
                  const prev = arr[i + 1];
                  const diff = prev ? log.weight - prev.weight : 0;
                  return (
                    <li key={log.id} className="flex items-center justify-between bg-[#0D0D0D] border border-[#222] rounded-xl px-3 py-2 text-xs">
                      <span className="text-gray-300">{log.date}</span>
                      <span className="flex items-center gap-2">
                        {prev && (
                          <bdi dir="ltr" className={diff <= 0 ? 'text-[#9CFF00]' : 'text-amber-400'}>
                            {diff > 0 ? '+' : ''}{formatKg(diff)}
                          </bdi>
                        )}
                        <span className="font-black text-white">{formatKg(log.weight)} كجم</span>
                      </span>
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  );
}
