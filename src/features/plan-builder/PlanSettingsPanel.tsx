import { useState } from 'react';
import { ChevronDown, Settings2, Sparkles } from 'lucide-react';
import type { DietPlan, MacroTargets, Trainee } from '../../types/nutrition';
import { computeTraineeNutritionStats } from '../../utils/calculator';

interface PlanSettingsPanelProps {
  trainee: Trainee;
  plan: DietPlan;
  onSavePlan: (plan: DietPlan) => void;
}

const TARGET_FIELDS: { key: keyof Omit<MacroTargets, 'proteinRatio'>; label: string }[] = [
  { key: 'calories', label: 'السعرات اليومية' },
  { key: 'proteinGrams', label: 'بروتين (جرام)' },
  { key: 'carbsGrams', label: 'كارب (جرام)' },
  { key: 'fatsGrams', label: 'دهون (جرام)' }
];

const inputClass =
  'w-full bg-[#0D0D0D] border border-[#262626] focus:border-[#9CFF00] text-white text-xs rounded-xl py-2 px-3 outline-none';
const labelClass = 'text-[11px] font-bold text-gray-400 block mb-1';

const toNumber = (value: string) => Math.max(0, Number(value) || 0);
const toLines = (text: string) => text.split('\n').map(l => l.trim()).filter(Boolean);

/** Everything the trainee sees besides meals and exercises: targets, water, sleep, supplements, notes. */
export function PlanSettingsPanel({ trainee, plan, onSavePlan }: PlanSettingsPanelProps) {
  const [open, setOpen] = useState(false);
  // Kept as raw text so the coach can type new lines; saved as a list.
  const [supplementsText, setSupplementsText] = useState(() => plan.supplements.join('\n'));

  const save = (patch: Partial<DietPlan>) => onSavePlan({ ...plan, ...patch });
  const setTarget = (key: keyof MacroTargets, value: number) =>
    save({ targetMacros: { ...plan.targetMacros, [key]: value } });

  const recalculate = () => {
    const { macros } = computeTraineeNutritionStats(trainee);
    save({ targetMacros: macros });
  };

  return (
    <div className="bg-[#161616] border border-[#2A2A2A] rounded-3xl">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        className="w-full flex items-center justify-between gap-3 p-4 sm:p-5 cursor-pointer text-right"
      >
        <span className="flex items-center gap-2">
          <Settings2 className="w-4 h-4 text-[#9CFF00]" />
          <span className="text-sm font-extrabold text-white">إعدادات النظام</span>
          <span className="hidden sm:inline text-[11px] text-gray-500">الأهداف، المية، النوم، المكملات، ملاحظاتك</span>
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="px-4 sm:px-5 pb-5 space-y-5 border-t border-[#222] pt-4">
          <div>
            <label className={labelClass}>اسم النظام (بيظهر للمتدرب)</label>
            <input type="text" value={plan.planName} onChange={e => save({ planName: e.target.value })} className={inputClass} />
          </div>

          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-bold text-white">الأهداف اليومية</span>
              <button
                type="button"
                onClick={recalculate}
                className="text-[11px] bg-[#9CFF00]/10 hover:bg-[#9CFF00]/20 border border-[#9CFF00]/30 text-[#9CFF00] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3 h-3" />
                احسبها من بيانات المتدرب
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {TARGET_FIELDS.map(f => (
                <label key={f.key} className="block">
                  <span className={labelClass}>{f.label}</span>
                  <input
                    type="number"
                    min={0}
                    inputMode="numeric"
                    value={plan.targetMacros[f.key] || ''}
                    onFocus={e => e.target.select()}
                    onChange={e => setTarget(f.key, toNumber(e.target.value))}
                    className={`${inputClass} text-center`}
                  />
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <label className="block">
              <span className={labelClass}>المية اليومية (لتر)</span>
              <input
                type="number"
                min={0}
                step={0.5}
                inputMode="decimal"
                value={plan.hydrationLiters || ''}
                onChange={e => save({ hydrationLiters: toNumber(e.target.value) })}
                className={`${inputClass} text-center`}
              />
            </label>
            <label className="block">
              <span className={labelClass}>ساعات النوم</span>
              <input
                type="number"
                min={0}
                step={0.5}
                inputMode="decimal"
                value={plan.sleepHours || ''}
                onChange={e => save({ sleepHours: toNumber(e.target.value) })}
                className={`${inputClass} text-center`}
              />
            </label>
          </div>

          <label className="block">
            <span className={labelClass}>المكملات (كل مكمل في سطر)</span>
            <textarea
              rows={3}
              value={supplementsText}
              onChange={e => {
                setSupplementsText(e.target.value);
                save({ supplements: toLines(e.target.value) });
              }}
              placeholder={'كرياتين: 5 جرام\nأوميجا 3: كبسولة بعد الغدا'}
              className={`${inputClass} resize-y`}
            />
          </label>

          <label className="block">
            <span className={labelClass}>ملاحظاتك للمتدرب</span>
            <textarea
              rows={3}
              value={plan.coachNotes}
              onChange={e => save({ coachNotes: e.target.value })}
              placeholder="مثال: ركز على النوم والمية، وابعتلي وزنك كل جمعة."
              className={`${inputClass} resize-y`}
            />
          </label>
        </div>
      )}
    </div>
  );
}
