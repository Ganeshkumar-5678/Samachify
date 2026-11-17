import React, { useState, useEffect } from 'react';
import {
  Calendar, Clock, Trash2, Plus, Download, Printer, Check,
  IndianRupee, Sparkles, ChefHat, Bookmark, ArrowRight, X, Utensils
} from 'lucide-react';
import { MealPlan, Recipe, GroceryItem } from '../types';
import { api } from '../services/api';

interface MealPlanPageProps {
  allRecipes: Recipe[];
  onSelectRecipe: (recipe: Recipe) => void;
}

export const MealPlanPage: React.FC<MealPlanPageProps> = ({ allRecipes = [], onSelectRecipe }) => {
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [groceryList, setGroceryList] = useState<GroceryItem[]>([]);
  const [totalGroceryCost, setTotalGroceryCost] = useState(0);
  const [activeTab, setActiveTab] = useState<'calendar' | 'grocery'>('calendar');
  const [isSavedAlert, setIsSavedAlert] = useState(false);
  const [recipePickerSlot, setRecipePickerSlot] = useState<'breakfast' | 'lunch' | 'dinner' | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load meal plan on mount
  useEffect(() => {
    const loadPlan = async () => {
      setIsLoading(true);
      try {
        const plan = await api.getMealPlan();
        setMealPlan(plan);
        await loadGrocery(plan);
      } catch (e) {
        console.error('Error loading meal plan:', e);
      } finally {
        setIsLoading(false);
      }
    };
    loadPlan();
  }, []);

  const loadGrocery = async (plan: MealPlan) => {
    try {
      const res = await api.generateGroceryList(plan);
      if (res && res.items) {
        setGroceryList(res.items);
        setTotalGroceryCost(res.total_estimated_cost_inr || 0);
      }
    } catch (e) {
      console.error('Error loading grocery list:', e);
    }
  };

  const currentDay = mealPlan?.days?.[selectedDayIndex] || mealPlan?.days?.[0];

  const handleRemoveSlot = async (slotType: 'breakfast' | 'lunch' | 'dinner') => {
    if (!mealPlan || !currentDay) return;
    const updatedDays = [...mealPlan.days];
    updatedDays[selectedDayIndex] = {
      ...currentDay,
      [slotType]: undefined,
    };
    const updatedPlan: MealPlan = { ...mealPlan, days: updatedDays };
    setMealPlan(updatedPlan);
    await api.updateMealPlan(updatedPlan);
    await loadGrocery(updatedPlan);
  };

  const handleAddMealToSlot = async (slotType: 'breakfast' | 'lunch' | 'dinner', recipe: Recipe) => {
    if (!mealPlan || !currentDay) return;
    const updatedDays = [...mealPlan.days];
    updatedDays[selectedDayIndex] = {
      ...currentDay,
      [slotType]: {
        recipe_id: recipe.id,
        recipe_title: recipe.title,
        cuisine: recipe.cuisine,
        cook_time_minutes:
          (recipe.prepTimeMinutes || recipe.prep_time_minutes || 10) +
          (recipe.cookTimeMinutes || recipe.cook_time_minutes || 15),
        difficulty: recipe.difficulty,
        image_url:
          recipe.imageUrl ||
          recipe.image_url ||
          'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=400&q=80',
        servings: 2,
      },
    };
    const updatedPlan: MealPlan = { ...mealPlan, days: updatedDays };
    setMealPlan(updatedPlan);
    setRecipePickerSlot(null);
    await api.updateMealPlan(updatedPlan);
    await loadGrocery(updatedPlan);
  };

  const handleViewRecipe = async (recipeId: string) => {
    let rec = allRecipes.find((r) => r.id === recipeId);
    if (!rec) {
      try {
        rec = await api.getRecipe(recipeId);
      } catch (e) {
        console.warn('Could not fetch recipe details:', e);
      }
    }
    if (rec) {
      onSelectRecipe(rec);
    }
  };

  const handleToggleGroceryCheck = (idx: number) => {
    const updated = [...groceryList];
    updated[idx].checked = !updated[idx].checked;
    setGroceryList(updated);
  };

  const handleExportGroceryList = () => {
    window.print();
  };

  const handleSavePlan = async () => {
    if (mealPlan) {
      await api.updateMealPlan(mealPlan);
      setIsSavedAlert(true);
      setTimeout(() => setIsSavedAlert(false), 3000);
    }
  };

  if (isLoading || !mealPlan || !currentDay) {
    return (
      <div className="space-y-6 animate-pulse py-8">
        <div className="h-10 bg-[#EDE8DE] rounded-2xl w-1/3" />
        <div className="h-14 bg-[#EDE8DE] rounded-2xl w-full" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-64 bg-[#EDE8DE] rounded-3xl" />
          <div className="h-64 bg-[#EDE8DE] rounded-3xl" />
          <div className="h-64 bg-[#EDE8DE] rounded-3xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-7 pb-16">
      {/* 1. Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B3B24] tracking-tight font-sans">
              Weekly Meal Planner
            </h1>
            <span className="px-3 py-1 rounded-full bg-[#EDF2EE] text-[#0B3B24] text-xs font-bold">
              {mealPlan.week_range}
            </span>
          </div>
          <p className="text-sm text-[#5D6F65] mt-1 font-medium">
            Plan your meals for the week, reduce waste, and generate your smart grocery checklist.
          </p>
        </div>

        {/* Tab & Action Controls */}
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <div className="flex rounded-full bg-white p-1 border border-[#ECE7DE] shadow-2xs">
            <button
              type="button"
              onClick={() => setActiveTab('calendar')}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                activeTab === 'calendar'
                  ? 'bg-[#0B3B24] text-white shadow-xs'
                  : 'text-[#5D6F65] hover:text-[#0B3B24]'
              }`}
            >
              Meal Schedule
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('grocery')}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'grocery'
                  ? 'bg-[#0B3B24] text-white shadow-xs'
                  : 'text-[#5D6F65] hover:text-[#0B3B24]'
              }`}
            >
              <span>Grocery List</span>
              {groceryList.length > 0 && (
                <span className="w-4 h-4 rounded-full bg-[#E67E22] text-white text-[10px] flex items-center justify-center font-bold">
                  {groceryList.length}
                </span>
              )}
            </button>
          </div>

          <button
            type="button"
            onClick={handleSavePlan}
            className="px-4 py-2 rounded-full bg-[#0B3B24] text-white text-xs font-bold hover:bg-[#072818] transition-all flex items-center gap-1.5 shadow-2xs"
          >
            <Bookmark className="w-3.5 h-3.5 text-[#E67E22]" />
            <span>Save Plan</span>
          </button>
        </div>
      </div>

      {/* Saved Toast Alert */}
      {isSavedAlert && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 shadow-xs">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>Meal plan successfully saved to your profile and pantry!</span>
        </div>
      )}

      {/* 2. Main Content Tab */}
      {activeTab === 'calendar' ? (
        <div className="space-y-6">
          {/* Day Selector Pills (Mon - Sun) */}
          <div className="grid grid-cols-7 gap-2.5 overflow-x-auto pb-1">
            {mealPlan.days.map((d, idx) => {
              const isSelected = selectedDayIndex === idx;
              return (
                <button
                  key={d.day}
                  type="button"
                  onClick={() => setSelectedDayIndex(idx)}
                  className={`p-3.5 rounded-2xl text-center transition-all border ${
                    isSelected
                      ? 'bg-[#0B3B24] text-white border-[#0B3B24] shadow-sm scale-102'
                      : 'bg-white hover:bg-[#EDF2EE] text-[#11241A] border-[#ECE7DE]'
                  }`}
                >
                  <div className="font-extrabold text-sm">{d.day}</div>
                  <div
                    className={`text-[11px] mt-0.5 font-medium ${
                      isSelected ? 'text-white/80' : 'text-[#7A8C82]'
                    }`}
                  >
                    {d.date_str}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Current Day Schedule Card */}
          <div className="p-6 rounded-3xl bg-white border border-[#ECE7DE] shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-[#F0ECE4] pb-4">
              <div>
                <h3 className="text-xl font-bold text-[#0B3B24]">
                  {currentDay.day} ({currentDay.date_str}) Menu
                </h3>
                <p className="text-xs text-[#5D6F65] mt-0.5">
                  Healthy, affordable dishes curated for the day
                </p>
              </div>
            </div>

            {/* 3 Slots: Breakfast, Lunch, Dinner */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Breakfast Slot */}
              <div className="p-5 rounded-2xl bg-[#FBF8F2] border border-[#ECE7DE] flex flex-col justify-between space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#B95A00] uppercase tracking-wider flex items-center gap-1.5">
                    <span>🍳</span>
                    <span>Breakfast</span>
                  </span>
                  {currentDay.breakfast && (
                    <button
                      type="button"
                      onClick={() => handleRemoveSlot('breakfast')}
                      className="text-[#7A8C82] hover:text-red-600 transition-colors p-1"
                      title="Remove"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {currentDay.breakfast ? (
                  <div className="space-y-3">
                    <div className="h-36 rounded-xl overflow-hidden bg-[#EDE8DE]">
                      <img
                        src={currentDay.breakfast.image_url}
                        alt={currentDay.breakfast.recipe_title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-[#0B3B24]">
                        {currentDay.breakfast.recipe_title}
                      </h4>
                      <p className="text-xs text-[#5D6F65] mt-0.5">
                        {currentDay.breakfast.cook_time_minutes} mins • {currentDay.breakfast.cuisine}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleViewRecipe(currentDay.breakfast!.recipe_id)}
                      className="w-full py-2.5 rounded-xl bg-[#0B3B24] text-white text-xs font-bold hover:bg-[#072818] transition-colors"
                    >
                      View Recipe
                    </button>
                  </div>
                ) : (
                  <div className="py-10 text-center space-y-3 border-2 border-dashed border-[#D5DDD7] rounded-xl">
                    <p className="text-xs text-[#7A8C82] font-medium">No breakfast planned</p>
                    <button
                      type="button"
                      onClick={() => setRecipePickerSlot('breakfast')}
                      className="px-3.5 py-1.5 rounded-lg bg-white border border-[#ECE7DE] hover:bg-[#EDF2EE] text-[#0B3B24] text-xs font-bold shadow-2xs"
                    >
                      + Choose Breakfast
                    </button>
                  </div>
                )}
              </div>

              {/* Lunch Slot */}
              <div className="p-5 rounded-2xl bg-[#FBF8F2] border border-[#ECE7DE] flex flex-col justify-between space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#0B3B24] uppercase tracking-wider flex items-center gap-1.5">
                    <span>🥗</span>
                    <span>Lunch</span>
                  </span>
                  {currentDay.lunch && (
                    <button
                      type="button"
                      onClick={() => handleRemoveSlot('lunch')}
                      className="text-[#7A8C82] hover:text-red-600 transition-colors p-1"
                      title="Remove"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {currentDay.lunch ? (
                  <div className="space-y-3">
                    <div className="h-36 rounded-xl overflow-hidden bg-[#EDE8DE]">
                      <img
                        src={currentDay.lunch.image_url}
                        alt={currentDay.lunch.recipe_title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-[#0B3B24]">
                        {currentDay.lunch.recipe_title}
                      </h4>
                      <p className="text-xs text-[#5D6F65] mt-0.5">
                        {currentDay.lunch.cook_time_minutes} mins • {currentDay.lunch.cuisine}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleViewRecipe(currentDay.lunch!.recipe_id)}
                      className="w-full py-2.5 rounded-xl bg-[#0B3B24] text-white text-xs font-bold hover:bg-[#072818] transition-colors"
                    >
                      View Recipe
                    </button>
                  </div>
                ) : (
                  <div className="py-10 text-center space-y-3 border-2 border-dashed border-[#D5DDD7] rounded-xl">
                    <p className="text-xs text-[#7A8C82] font-medium">No lunch planned</p>
                    <button
                      type="button"
                      onClick={() => setRecipePickerSlot('lunch')}
                      className="px-3.5 py-1.5 rounded-lg bg-white border border-[#ECE7DE] hover:bg-[#EDF2EE] text-[#0B3B24] text-xs font-bold shadow-2xs"
                    >
                      + Choose Lunch
                    </button>
                  </div>
                )}
              </div>

              {/* Dinner Slot */}
              <div className="p-5 rounded-2xl bg-[#FBF8F2] border border-[#ECE7DE] flex flex-col justify-between space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#E67E22] uppercase tracking-wider flex items-center gap-1.5">
                    <span>🍲</span>
                    <span>Dinner</span>
                  </span>
                  {currentDay.dinner && (
                    <button
                      type="button"
                      onClick={() => handleRemoveSlot('dinner')}
                      className="text-[#7A8C82] hover:text-red-600 transition-colors p-1"
                      title="Remove"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {currentDay.dinner ? (
                  <div className="space-y-3">
                    <div className="h-36 rounded-xl overflow-hidden bg-[#EDE8DE]">
                      <img
                        src={currentDay.dinner.image_url}
                        alt={currentDay.dinner.recipe_title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-[#0B3B24]">
                        {currentDay.dinner.recipe_title}
                      </h4>
                      <p className="text-xs text-[#5D6F65] mt-0.5">
                        {currentDay.dinner.cook_time_minutes} mins • {currentDay.dinner.cuisine}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleViewRecipe(currentDay.dinner!.recipe_id)}
                      className="w-full py-2.5 rounded-xl bg-[#0B3B24] text-white text-xs font-bold hover:bg-[#072818] transition-colors"
                    >
                      View Recipe
                    </button>
                  </div>
                ) : (
                  <div className="py-10 text-center space-y-3 border-2 border-dashed border-[#D5DDD7] rounded-xl">
                    <p className="text-xs text-[#7A8C82] font-medium">No dinner planned</p>
                    <button
                      type="button"
                      onClick={() => setRecipePickerSlot('dinner')}
                      className="px-3.5 py-1.5 rounded-lg bg-white border border-[#ECE7DE] hover:bg-[#EDF2EE] text-[#0B3B24] text-xs font-bold shadow-2xs"
                    >
                      + Choose Dinner
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Grocery List View */
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#ECE7DE] shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#F0ECE4] pb-4">
            <div>
              <h3 className="text-xl font-bold text-[#0B3B24]">
                Aggregated Weekly Grocery List
              </h3>
              <p className="text-xs text-[#5D6F65] mt-0.5">
                Combined quantities and estimated regional cost for your 7-day meal plan.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="px-4 py-2 rounded-xl bg-[#EDF2EE] text-[#0B3B24] text-xs font-bold">
                Estimated Total: ₹{Math.round(totalGroceryCost)}
              </div>
              <button
                type="button"
                onClick={handleExportGroceryList}
                className="px-4 py-2 rounded-xl bg-[#0B3B24] text-white text-xs font-bold hover:bg-[#072818] flex items-center gap-1.5 shadow-2xs"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Checklist</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {groceryList.map((item, idx) => (
              <div
                key={idx}
                onClick={() => handleToggleGroceryCheck(idx)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                  item.checked
                    ? 'bg-[#EDF2EE]/50 border-[#D5DDD7] opacity-60 line-through'
                    : 'bg-[#FBF8F2] border-[#ECE7DE] hover:border-[#0B3B24]/40'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-md flex items-center justify-center border text-xs ${
                      item.checked
                        ? 'bg-[#0B3B24] text-white border-[#0B3B24]'
                        : 'border-[#7A8C82]/50'
                    }`}
                  >
                    {item.checked && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#0B3B24]">{item.name}</span>
                    <p className="text-[10px] text-[#7A8C82]">{item.category}</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-bold text-[#11241A]">
                    {Math.round(item.quantity)} {item.unit}
                  </span>
                  <p className="text-[10px] text-[#7A8C82]">
                    ~₹{Math.round(item.estimated_cost_inr)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recipe Picker Modal */}
      {recipePickerSlot && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-xl border border-[#ECE7DE] max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-[#F0ECE4] pb-4 mb-4">
              <div>
                <h3 className="text-lg font-bold text-[#0B3B24] capitalize">
                  Select {recipePickerSlot} Recipe
                </h3>
                <p className="text-xs text-[#5D6F65]">
                  Pick a recipe to add to {currentDay.day}'s menu
                </p>
              </div>
              <button
                type="button"
                onClick={() => setRecipePickerSlot(null)}
                className="p-1 rounded-full text-[#7A8C82] hover:text-black hover:bg-[#EDF2EE]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto space-y-2.5 flex-1 pr-1">
              {allRecipes.map((rec) => (
                <div
                  key={rec.id}
                  onClick={() => handleAddMealToSlot(recipePickerSlot, rec)}
                  className="p-3 rounded-2xl border border-[#ECE7DE] hover:border-[#0B3B24] hover:bg-[#FBF8F2] cursor-pointer flex items-center justify-between transition-all"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={rec.imageUrl || rec.image_url}
                      alt={rec.title}
                      className="w-12 h-12 rounded-xl object-cover"
                    />
                    <div>
                      <h4 className="text-sm font-bold text-[#11241A]">{rec.title}</h4>
                      <p className="text-xs text-[#5D6F65]">
                        {rec.cuisine} • {rec.difficulty} • ₹{rec.estimatedCostInr || 45}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-[#0B3B24] bg-[#EDF2EE] px-3 py-1 rounded-full">
                    Select
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
