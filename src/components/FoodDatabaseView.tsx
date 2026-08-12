import React, { useState } from 'react';
import { FoodItem, FoodCategory } from '../types/nutrition';
import { Search, Plus, Database, Sparkles, Filter } from 'lucide-react';

interface FoodDatabaseViewProps {
  foodDatabase: FoodItem[];
  onAddFoodItem: (food: FoodItem) => void;
}

export const FoodDatabaseView: React.FC<FoodDatabaseViewProps> = ({
  foodDatabase,
  onAddFoodItem
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // New food form state
  const [nameAr, setNameAr] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [category, setCategory] = useState<FoodCategory>('protein');
  const [servingSize, setServingSize] = useState(100);
  const [calories, setCalories] = useState(150);
  const [protein, setProtein] = useState(25);
  const [carbs, setCarbs] = useState(0);
  const [fats, setFats] = useState(3);

  const filteredFoods = foodDatabase.filter(food => {
    const matchesSearch = food.nameAr.includes(searchQuery) || food.nameEn.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'all' || food.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameAr.trim()) return;

    const newFood: FoodItem = {
      id: `food-${Date.now()}`,
      nameAr,
      nameEn: nameEn || nameAr,
      category,
      servingSizeGrams: Number(servingSize),
      calories: Number(calories),
      protein: Number(protein),
      carbs: Number(carbs),
      fats: Number(fats)
    };

    onAddFoodItem(newFood);
    setShowAddModal(false);
    setNameAr('');
    setNameEn('');
  };

  const categoryBadges: Record<string, { label: string; bg: string }> = {
    protein: { label: 'بروتين (Proteins)', bg: 'bg-blue-500/10 text-blue-400 border-blue-500/30' },
    carbs: { label: 'نشويات (Carbs)', bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
    fats: { label: 'دهون صحية (Fats)', bg: 'bg-amber-500/10 text-amber-400 border-amber-500/30' },
    veggies: { label: 'خضروات (Veggies)', bg: 'bg-green-500/10 text-green-400 border-green-500/30' },
    fruits: { label: 'فواكه (Fruits)', bg: 'bg-purple-500/10 text-purple-400 border-purple-500/30' },
    dairy: { label: 'ألبان وجودة (Dairy)', bg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30' },
    supplements: { label: 'مكملات (Supplements)', bg: 'bg-[#9CFF00]/10 text-[#9CFF00] border-[#9CFF00]/30' }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="bg-[#161616] border border-[#2A2A2A] rounded-3xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-[#9CFF00]" />
            <span className="text-xs font-mono text-[#9CFF00] font-bold uppercase tracking-widest">
              FOOD & ALTERNATIVES DATABASE
            </span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1">
            قاعدة بيانات الأطعمة والبدائل
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">
            تحتوي على الأطعمة العربية والمصرية والعالمية لحساب الماكروز بدقة
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="bg-[#9CFF00] hover:bg-[#8BE600] text-black font-black px-5 py-3 rounded-2xl text-xs flex items-center gap-2 shadow-[0_0_20px_rgba(156,255,0,0.3)] transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>إضافة صنف طعام جديد</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-[#161616] border border-[#2A2A2A] rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-500 absolute right-3.5 top-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث باسم الطعام..."
            className="w-full bg-[#0A0A0A] border border-[#2A2A2A] focus:border-[#9CFF00] text-xs text-white rounded-xl py-2.5 pr-10 pl-4 outline-none"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              selectedCategory === 'all'
                ? 'bg-[#9CFF00] text-black font-black'
                : 'bg-[#222222] text-gray-400 hover:text-white'
            }`}
          >
            الكل ({foodDatabase.length})
          </button>

          {Object.keys(categoryBadges).map(catKey => (
            <button
              key={catKey}
              onClick={() => setSelectedCategory(catKey)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                selectedCategory === catKey
                  ? 'bg-[#9CFF00] text-black font-black'
                  : 'bg-[#222222] text-gray-400 hover:text-white'
              }`}
            >
              {categoryBadges[catKey].label.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Foods Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredFoods.map(food => {
          const badge = categoryBadges[food.category] || categoryBadges['protein'];

          return (
            <div
              key={food.id}
              className="bg-[#161616] border border-[#2A2A2A] hover:border-[#9CFF00]/40 rounded-2xl p-5 transition-all relative overflow-hidden"
            >
              {food.isEgyptianSpecialty && (
                <span className="absolute top-3 left-3 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-[#9CFF00]/10 text-[#9CFF00] border border-[#9CFF00]/30">
                  صنف مصري
                </span>
              )}

              <div className="mb-3">
                <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${badge.bg}`}>
                  {badge.label}
                </span>
                <h3 className="text-sm font-bold text-white mt-2">{food.nameAr}</h3>
                <p className="text-[10px] text-gray-500 font-mono">{food.nameEn}</p>
              </div>

              <div className="bg-[#0A0A0A] border border-[#222222] p-3 rounded-xl grid grid-cols-4 gap-2 text-center text-xs">
                <div>
                  <span className="text-[9px] text-gray-500 block">السعرات</span>
                  <span className="font-black text-[#9CFF00]">{food.calories}</span>
                </div>
                <div>
                  <span className="text-[9px] text-gray-500 block">بروتين</span>
                  <span className="font-bold text-white">{food.protein}g</span>
                </div>
                <div>
                  <span className="text-[9px] text-gray-500 block">نشويات</span>
                  <span className="font-bold text-white">{food.carbs}g</span>
                </div>
                <div>
                  <span className="text-[9px] text-gray-500 block">دهون</span>
                  <span className="font-bold text-white">{food.fats}g</span>
                </div>
              </div>

              <div className="mt-3 text-[10px] text-gray-500 font-mono text-left">
                Per {food.servingSizeGrams}g portion
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Food Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#161616] border border-[#2A2A2A] rounded-3xl w-full max-w-md p-6 shadow-2xl">
            <h3 className="text-lg font-black text-white mb-4">إضافة صنف طعام جديد لقاعدة البيانات</h3>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">الاسم بالعربية</label>
                <input
                  type="text"
                  required
                  value={nameAr}
                  onChange={(e) => setNameAr(e.target.value)}
                  placeholder="مثال: لحم ضأن مشوي"
                  className="w-full bg-[#0A0A0A] border border-[#2A2A2A] text-white rounded-xl p-2.5 text-xs outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">الاسم بالإنجليزية</label>
                <input
                  type="text"
                  value={nameEn}
                  onChange={(e) => setNameEn(e.target.value)}
                  placeholder="Grilled Lamb Steak"
                  className="w-full bg-[#0A0A0A] border border-[#2A2A2A] text-white rounded-xl p-2.5 text-xs outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">التصنيف</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as FoodCategory)}
                    className="w-full bg-[#0A0A0A] border border-[#2A2A2A] text-white rounded-xl p-2.5 text-xs outline-none font-bold"
                  >
                    <option value="protein">بروتين (Proteins)</option>
                    <option value="carbs">نشويات (Carbs)</option>
                    <option value="fats">دهون صحية (Fats)</option>
                    <option value="veggies">خضروات</option>
                    <option value="fruits">فواكه</option>
                    <option value="dairy">ألبان</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">حجم الحصة (جرام)</label>
                  <input
                    type="number"
                    value={servingSize}
                    onChange={(e) => setServingSize(Number(e.target.value))}
                    className="w-full bg-[#0A0A0A] border border-[#2A2A2A] text-white rounded-xl p-2.5 text-xs outline-none text-center font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2 text-center">
                <div>
                  <label className="block text-[10px] text-gray-400 mb-1">السعرات</label>
                  <input
                    type="number"
                    value={calories}
                    onChange={(e) => setCalories(Number(e.target.value))}
                    className="w-full bg-[#0A0A0A] border border-[#2A2A2A] text-[#9CFF00] rounded-xl p-2 text-xs text-center font-black"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-400 mb-1">بروتين</label>
                  <input
                    type="number"
                    value={protein}
                    onChange={(e) => setProtein(Number(e.target.value))}
                    className="w-full bg-[#0A0A0A] border border-[#2A2A2A] text-white rounded-xl p-2 text-xs text-center font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-400 mb-1">نشويات</label>
                  <input
                    type="number"
                    value={carbs}
                    onChange={(e) => setCarbs(Number(e.target.value))}
                    className="w-full bg-[#0A0A0A] border border-[#2A2A2A] text-white rounded-xl p-2 text-xs text-center font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-400 mb-1">دهون</label>
                  <input
                    type="number"
                    value={fats}
                    onChange={(e) => setFats(Number(e.target.value))}
                    className="w-full bg-[#0A0A0A] border border-[#2A2A2A] text-white rounded-xl p-2 text-xs text-center font-bold"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#262626]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-[#262626] text-gray-300 text-xs font-bold cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#9CFF00] text-black font-black text-xs shadow-[0_0_15px_rgba(156,255,0,0.3)] cursor-pointer"
                >
                  حفظ الصنف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
