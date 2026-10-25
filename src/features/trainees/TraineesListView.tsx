import { useDeferredValue, useMemo, useState } from 'react';
import { Plus, Search, UserPlus } from 'lucide-react';
import type { Trainee } from '../../types/nutrition';
import type { AdminView } from '../../constants';
import { TraineeCard } from './TraineeCard';

interface TraineesListViewProps {
  trainees: Trainee[];
  onOpenTrainee: (traineeId: string, view: AdminView) => void;
  onRequestDelete: (trainee: Trainee) => void;
  onRequestEdit: (trainee: Trainee) => void;
  onAddTrainee: () => void;
}

export function TraineesListView({ trainees, onOpenTrainee, onRequestDelete, onRequestEdit, onAddTrainee }: TraineesListViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const deferredSearch = useDeferredValue(searchTerm);

  const filteredTrainees = useMemo(() => {
    const q = deferredSearch.trim().toLowerCase();
    if (!q) return trainees;
    return trainees.filter(t => t.name.toLowerCase().includes(q) || t.notes?.toLowerCase().includes(q));
  }, [trainees, deferredSearch]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#161616] border border-[#2A2A2A] rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-full bg-[#9CFF00]/5 blur-3xl pointer-events-none"></div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#9CFF00] animate-pulse shadow-[0_0_10px_#9CFF00]"></span>
              <span className="text-xs font-mono text-[#9CFF00] font-bold uppercase tracking-widest">
                LIMBY FIT PRIVATE CLIENTS
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">قائمة المشتركين ({trainees.length})</h1>
            <p className="text-xs sm:text-sm text-gray-400 mt-1">
              إدارة المشتركين، إنشاء حسابات التغذية، توليد بيانات الدخول، وإرسالها بضغطة زر.
            </p>
          </div>

          <button
            onClick={onAddTrainee}
            className="bg-[#9CFF00] hover:bg-[#8BE600] text-black font-black px-5 py-3 rounded-2xl text-xs flex items-center gap-2 shadow-[0_0_25px_rgba(156,255,0,0.35)] hover:shadow-[0_0_35px_rgba(156,255,0,0.55)] transition-all cursor-pointer shrink-0"
          >
            <UserPlus className="w-4 h-4 stroke-[2.5]" />
            <span className="font-extrabold">+ إضافة مشترك جديد</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="mt-5 relative max-w-md">
          <Search className="w-4 h-4 text-gray-500 absolute right-3.5 top-3" />
          <input
            type="search"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="ابحث عن مشترك بالاسم أو الهدف..."
            className="w-full bg-[#0D0D0D] border border-[#262626] focus:border-[#9CFF00] text-white text-xs rounded-2xl py-2.5 pr-10 pl-3 outline-none transition-all placeholder:text-gray-600"
          />
        </div>
      </div>

      {filteredTrainees.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTrainees.map(t => (
            <TraineeCard key={t.id} trainee={t} onOpen={onOpenTrainee} onRequestDelete={onRequestDelete} onRequestEdit={onRequestEdit} />
          ))}
        </div>
      ) : (
        <div className="bg-[#161616] border border-[#2A2A2A] rounded-3xl p-8 sm:p-12 text-center space-y-4 shadow-2xl relative overflow-hidden my-4">
          <div className="w-16 h-16 rounded-3xl bg-[#9CFF00]/10 border border-[#9CFF00]/30 text-[#9CFF00] flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(156,255,0,0.2)]">
            <UserPlus className="w-8 h-8 stroke-[2]" />
          </div>
          <div className="max-w-md mx-auto space-y-2">
            <h3 className="text-xl font-black text-white">لا يوجد مشتركين حالياً 🏋️‍♂️</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              {searchTerm
                ? 'لم يتم العثور على مشترك مطابق للبحث. جرب البحث باسم آخر.'
                : 'قائمة المشتركين فارغة تماماً. يمكنك إضافة مشترك جديد الآن وبدء تصميم نظامه التغذوي بضغطة زر.'}
            </p>
          </div>
          {!searchTerm && (
            <button
              onClick={onAddTrainee}
              className="bg-[#9CFF00] hover:bg-[#8BE600] text-black font-black px-6 py-3 rounded-2xl text-xs inline-flex items-center gap-2 shadow-[0_0_25px_rgba(156,255,0,0.35)] transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>إضافة أول مشترك الآن</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
