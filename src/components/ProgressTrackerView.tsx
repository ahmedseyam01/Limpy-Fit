import React, { useState } from 'react';
import { Trainee, ProgressLog } from '../types/nutrition';
import { TrendingUp, Plus, Calendar, Scale, Activity } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface ProgressTrackerViewProps {
  trainees: Trainee[];
  selectedTraineeId: string;
  onSelectTraineeId: (id: string) => void;
  onAddProgressLog: (traineeId: string, log: ProgressLog) => void;
}

export const ProgressTrackerView: React.FC<ProgressTrackerViewProps> = ({
  trainees,
  selectedTraineeId,
  onSelectTraineeId,
  onAddProgressLog
}) => {
  const selectedTrainee = trainees.find(t => t.id === selectedTraineeId) || trainees[0];

  const [weight, setWeight] = useState<number>(selectedTrainee ? selectedTrainee.weight : 80);
  const [waistCm, setWaistCm] = useState<number>(85);
  const [chestCm, setChestCm] = useState<number>(100);
  const [armCm, setArmCm] = useState<number>(38);
  const [notes, setNotes] = useState('');

  const handleAddLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTrainee) return;

    const newLog: ProgressLog = {
      id: `p-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      weight: Number(weight),
      waistCm: Number(waistCm),
      chestCm: Number(chestCm),
      armCm: Number(armCm),
      notes
    };

    onAddProgressLog(selectedTrainee.id, newLog);
    setNotes('');
  };

  const logs = selectedTrainee ? selectedTrainee.progressLogs : [];
  const chartData = logs.map(l => ({
    date: l.date,
    weight: l.weight,
    waist: l.waistCm || null
  }));

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="bg-[#161616] border border-[#2A2A2A] rounded-3xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#9CFF00]" />
            <span className="text-xs font-mono text-[#9CFF00] font-bold uppercase tracking-widest">
              PROGRESS TRACKER & MEASUREMENTS
            </span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1">
            متابعة الوزن والقياسات والصور
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">
            تسجيل ومتابعة التطور الأسبوعي للمتدربين بالرسم البياني
          </p>
        </div>

        <div className="bg-[#0A0A0A] border border-[#2A2A2A] rounded-2xl px-3 py-1.5 flex items-center gap-2">
          <span className="text-xs text-gray-400 font-bold">المتدرب:</span>
          <select
            value={selectedTraineeId}
            onChange={(e) => onSelectTraineeId(e.target.value)}
            className="bg-transparent text-white font-bold text-xs outline-none cursor-pointer"
          >
            {trainees.map(t => (
              <option key={t.id} value={t.id} className="bg-[#161616]">
                {t.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Progress Chart */}
      <div className="bg-[#161616] border border-[#2A2A2A] rounded-3xl p-6">
        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
          <Activity className="w-4 h-4 text-[#9CFF00]" />
          المنحنى البياني لنزول/زيادة الوزن للمتدرب ({selectedTrainee?.name})
        </h3>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData.length > 0 ? chartData : [{ date: 'البداية', weight: selectedTrainee?.weight || 80 }]}>
              <defs>
                <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#9CFF00" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#9CFF00" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#222222" />
              <XAxis dataKey="date" stroke="#666666" fontSize={11} />
              <YAxis stroke="#666666" fontSize={11} domain={['dataMin - 3', 'dataMax + 3']} />
              <Tooltip
                contentStyle={{ backgroundColor: '#111111', borderColor: '#333333', borderRadius: '12px', fontSize: '12px' }}
                itemStyle={{ color: '#9CFF00' }}
              />
              <Area type="monotone" dataKey="weight" name="الوزن (كجم)" stroke="#9CFF00" strokeWidth={3} fillOpacity={1} fill="url(#weightGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Add New Entry Form & Past Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="bg-[#161616] border border-[#2A2A2A] rounded-3xl p-6">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <Plus className="w-4 h-4 text-[#9CFF00]" />
            تسجيل قياس أسبوعي جديد
          </h3>

          <form onSubmit={handleAddLog} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1">الوزن الجديد (كجم) *</label>
              <input
                type="number"
                step="0.1"
                required
                value={weight}
                onChange={(e) => setWeight(Number(e.target.value))}
                className="w-full bg-[#0A0A0A] border border-[#2A2A2A] text-[#9CFF00] font-black rounded-xl p-2.5 text-sm outline-none"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[10px] text-gray-400 mb-1">محيط الخصر (سم)</label>
                <input
                  type="number"
                  value={waistCm}
                  onChange={(e) => setWaistCm(Number(e.target.value))}
                  className="w-full bg-[#0A0A0A] border border-[#2A2A2A] text-white font-bold rounded-xl p-2 text-xs text-center outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] text-gray-400 mb-1">محيط الصدر (سم)</label>
                <input
                  type="number"
                  value={chestCm}
                  onChange={(e) => setChestCm(Number(e.target.value))}
                  className="w-full bg-[#0A0A0A] border border-[#2A2A2A] text-white font-bold rounded-xl p-2 text-xs text-center outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] text-gray-400 mb-1">محيط الذراع (سم)</label>
                <input
                  type="number"
                  value={armCm}
                  onChange={(e) => setArmCm(Number(e.target.value))}
                  className="w-full bg-[#0A0A0A] border border-[#2A2A2A] text-white font-bold rounded-xl p-2 text-xs text-center outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1">ملاحظات القياس</label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="تحسن ملحوظ في عضلات البطن..."
                className="w-full bg-[#0A0A0A] border border-[#2A2A2A] text-white rounded-xl p-2 text-xs outline-none resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#9CFF00] hover:bg-[#8BE600] text-black font-black py-3 rounded-xl text-xs shadow-[0_0_15px_rgba(156,255,0,0.3)] transition-all cursor-pointer"
            >
              حفظ القياس الأسبوعي
            </button>
          </form>
        </div>

        {/* History Table */}
        <div className="lg:col-span-2 bg-[#161616] border border-[#2A2A2A] rounded-3xl p-6">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#9CFF00]" />
            سجل القياسات السابقة ({logs.length})
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="border-b border-[#2A2A2A] text-gray-400 font-bold">
                  <th className="pb-3">التاريخ</th>
                  <th className="pb-3">الوزن</th>
                  <th className="pb-3">الخصر</th>
                  <th className="pb-3">الصدر</th>
                  <th className="pb-3">الذراع</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#222222]">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#1C1C1C]">
                    <td className="py-3 text-gray-300 font-mono">{log.date}</td>
                    <td className="py-3 font-black text-[#9CFF00]">{log.weight} كجم</td>
                    <td className="py-3 text-white">{log.waistCm || '-'} سم</td>
                    <td className="py-3 text-white">{log.chestCm || '-'} سم</td>
                    <td className="py-3 text-white">{log.armCm || '-'} سم</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
