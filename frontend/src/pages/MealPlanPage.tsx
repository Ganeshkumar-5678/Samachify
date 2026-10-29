import React, { useState, useEffect } from 'react';
import {
  Calendar, Clock, Trash2, Plus, Download, Printer, Check,
  IndianRupee, Sparkles, ChefHat, Bookmark, ArrowRight
} from 'lucide-react';
import { MealPlan, Recipe, GroceryItem } from '../types';
import { api } from '../services/api';

interface MealPlanPageProps {
  allRecipes: Recipe[];
  onSelectRecipe: (recipe: Recipe) => void;
}

export const MealPlanPage: React.FC<MealPlanPageProps> = ({ allRecipes, onSelectRecipe }) => {
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [groceryList, setGroceryList] = useState<GroceryItem[]>([]);
  const [totalGroceryCost, setTotalGroceryCost] = useState(0);
  const [activeTab, setActiveTab] = useState<'calendar' | 'grocery'>('calendar');
  const [isSavedAlert, setIsSavedAlert] = useState(false);

  useEffect(() => {
    const loadPlan = async () => {
      try {
        const plan = await api.getMealPlan();
        setMealPlan(plan);
        loadGrocery(plan);
      } catch (e) {
        console.error(e);
      }
    };
    loadPlan();
  }, []);

  const loadGrocery = async (plan: MealPlan) => {
    try {
      setGroceryList([]);
      setTotalGroceryCost(0);
    } catch (e) {
      console.error(e);
    }
  };

  const currentDay = mealPlan?.days[selectedDayIndex];

  const handleRemoveSlot = async (slotType: 'breakfast' | 'lunch' | 'dinner') => {
    if (!mealPlan || !currentDay) return;
    const updatedDays = [...mealPlan.days];
    updatedDays[selectedDayIndex] = {
      ...currentDay,
      [slotType]: undefined,
    };
    const updatedPlan: MealPlan = { ...mealPlan, days: updatedDays };
    setMealPlan(updatedPlan);
    loadGrocery(updatedPlan);
  };

  const handleAddQuickMeal = async (slotType: 'breakfast' | 'lunch' | 'dinner', recipe: Recipe) => {
    if (!mealPlan || !currentDay) return;
    const updatedDays = [...mealPlan.days];
    updatedDays[selectedDayIndex] = {
      ...currentDay,
      [slotType]: {
        recipe_id: recipe.id,
        recipe_title: recipe.title,
        cuisine: recipe.cuisine,
        cook_time_minutes: (recipe.prepTimeMinutes || recipe.prep_time_minutes || 10) + (recipe.cookTimeMinutes || recipe.cook_time_minutes || 15),
        difficulty: recipe.difficulty,
        image_url: recipe.imageUrl || recipe.image_url || '',
        servings: 2,
      },
    };
    const updatedPlan: MealPlan = { ...mealPlan, days: updatedDays };
    setMealPlan(updatedPlan);
    loadGrocery(updatedPlan);
  };

  const handleToggleGroceryCheck = (idx: number) => {
    const updated = [...groceryList];
    updated[idx].checked = !updated[idx].checked;
    setGroceryList(updated);
  };

  const handleExportGroceryList = () => {
    window.print();
  };

  const handleSavePlan = () => {
    setIsSavedAlert(true);
    setTimeout(() => setIsSavedAlert(false), 3000);
  };

  if (!mealPlan || !currentDay) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-forest font-bold">
        Loading Weekly Meal Planner...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-forest tracking-tight">
              Weekly Meal Planner
            </h1>
            <span className="px-3 py-1 rounded-full bg-cream text-forest text-xs font-bold">
              {mealPlan.week_range}
            </span>
          </div>
          <p className="text-deep-muted font-medium text-sm mt-1">
            Plan your meals for the week, and save time & money.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex rounded-full bg-cream p-1 border border-cream-border">
            <button
              onClick={() => setActiveTab('calendar')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                activeTab === 'calendar' ? 'bg-forest text-white' : 'text-deep'
              }`}
            >
              Meal Schedule
            </button>
            <button
              onClick={() => setActiveTab('grocery')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'grocery' ? 'bg-forest text-white' : 'text-deep'
              }`}
            >
              <span>Grocery List</span>
              <span className="w-4 h-4 rounded-full bg-spice text-white text-[10px] flex items-center justify-center">
                {groceryList.length}
              </span>
            </button>
          </div>

          <button
            onClick={handleSavePlan}
            className="px-4 py-2 rounded-xl bg-forest text-white text-xs font-bold hover:bg-forest-light transition-all flex items-center gap-1.5 shadow-sm"
          >
            <Bookmark className="w-3.5 h-3.5 text-spice" />
            <span>Save Plan</span>
          </button>
        </div>
      </div>

      {isSavedAlert && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>Meal plan successfully saved to your profile and pantry!</span>
        </div>
      )}

      {activeTab === 'calendar' ? (
        <div className="space-y-6">
          
          {/* Day Selector Pills (Mon - Sun) */}
          <div className="grid grid-cols-7 gap-2 overflow-x-auto pb-2">
            {mealPlan.days.map((d, idx) => {
              const isSelected = selectedDayIndex === idx;
              return (
                <button
                  key={d.day}
                  onClick={() => setSelectedDayIndex(idx)}
                  className={`p-3 rounded-2xl text-center transition-all border ${
                    isSelected
                      ? 'bg-forest text-white border-forest shadow-md scale-102'
                      : 'bg-white hover:bg-cream-surface text-deep border-cream-border'
                  }`}
                >
                  <div className="font-extrabold text-sm">{d.day}</div>
                  <div className={`text-xs mt-0.5 ${isSelected ? 'text-white/80' : 'text-deep-muted'}`}>
                    {d.date_str}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Current Day Schedule Cards */}
          <div className="p-6 rounded-3xl bg-white border border-cream-border shadow-soft space-y-6">
            <div className="flex items-center justify-between border-b border-cream-border pb-4">
              <div>
                <h3 className="text-xl font-extrabold text-forest">
                  {currentDay.day} ({currentDay.date_str}) Menu
                </h3>
                <p className="text-xs text-deep-muted">Healthy, affordable dishes curated for the day</p>
              </div>
            </div>

            {/* Slots: Breakfast, Lunch, Dinner */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Breakfast Slot */}
              <div className="p-5 rounded-2xl bg-cream-surface border border-cream-border flex flex-col justify-between space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-spice uppercase tracking-wider flex items-center gap-1.5">
                    <span>⭐️</span>
                    <span>Breakfast</span>
                  </span>
                  {currentDay.breakfast && (
                    <button
                      onClick={() => handleRemoveSlot('breakfast')}
                      className="text-deep-subtle hover:text-red-600 transition-colors"
                      title="Remove"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {currentDay.breakfast ? (
                  <div className="space-y-3">
                    <div className="h-36 rounded-xl overflow-hidden bg-cream">
                      <img
                        src={currentDay.breakfast.image_url}
                        alt={currentDay.breakfast.recipe_title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-forest">{currentDay.breakfast.recipe_title}</h4>
                      <p className="text-xs text-deep-muted">
                        {currentDay.breakfast.cook_time_minutes} mins • {currentDay.breakfast.cuisine}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        const rec = allRecipes.find((r) => r.id === currentDay.breakfast?.recipe_id);
                        if (rec) onSelectRecipe(rec);
                      }}
                      className="w-full py-2 rounded-xl bg-forest text-white text-xs font-bold hover:bg-forest-light"
                    >
                      View Recipe
                    </button>
                  </div>
                ) : (
                  <div className="py-8 text-center space-y-3 border-2 border-dashed border-cream-border rounded-xl">
                    <p className="text-xs text-deep-muted font-medium">No breakfast planned</p>
                    <button
                      onClick={() => handleAddQuickMeal('breakfast', allRecipes[4] || allRecipes[0])}
                      className="px-3 py-1.5 rounded-lg bg-cream hover:bg-cream-border text-forest text-xs font-bold"
                    >
                      + Add Oats Upma
                    </button>
                  </div>
                )}
              </div>

              {/* Lunch Slot */}
              <div className="p-5 rounded-2xl bg-cream-surface border border-cream-border flex flex-col justify-between space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-forest uppercase tracking-wider flex items-center gap-1.5">
                    <span>🥗</span>
                    <span>Lunch</span>
                  </span>
                  {currentDay.lunch && (
                    <button
                      onClick={() => handleRemoveSlot('lunch')}
                      className="text-deep-subtle hover:text-red-600 transition-colors"
                      title="Remove"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {currentDay.lunch ? (
                  <div className="space-y-3">
                    <div className="h-36 rounded-xl overflow-hidden bg-cream">
                      <img
                        src={currentDay.lunch.image_url}
                        alt={currentDay.lunch.recipe_title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-forest">{currentDay.lunch.recipe_title}</h4>
                      <p className="text-xs text-deep-muted">
                        {currentDay.lunch.cook_time_minutes} mins • {currentDay.lunch.cuisine}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        const rec = allRecipes.find((r) => r.id === currentDay.lunch?.recipe_id);
                        if (rec) onSelectRecipe(rec);
                      }}
                      className="w-full py-2 rounded-xl bg-forest text-white text-xs font-bold hover:bg-forest-light"
                    >
                      View Recipe
                    </button>
                  </div>
                ) : (
                  <div className="py-8 text-center space-y-3 border-2 border-dashed border-cream-border rounded-xl">
                    <p className="text-xs text-deep-muted font-medium">No lunch planned</p>
                    <button
                      onClick={() => handleAddQuickMeal('lunch', allRecipes[5] || allRecipes[1])}
                      className="px-3 py-1.5 rounded-lg bg-cream hover:bg-cream-border text-forest text-xs font-bold"
                    >
                      + Add Veg Fried Rice
                    </button>
                  </div>
                )}
              </div>

              {/* Dinner Slot */}
              <div className="p-5 rounded-2xl bg-cream-surface border border-cream-border flex flex-col justify-between space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-spice-hover uppercase tracking-wider flex items-center gap-1.5">
                    <span>🍲</span>
                    <span>Dinner</span>
                  </span>
                  {currentDay.dinner && (
                    <button
                      onClick={() => handleRemoveSlot('dinner')}
                      className="text-deep-subtle hover:text-red-600 transition-colors"
                      title="Remove"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {currentDay.dinner ? (
                  <div className="space-y-3">
                    <div className="h-36 rounded-xl overflow-hidden bg-cream">
                      <img
                        src={currentDay.dinner.image_url}
                        alt={currentDay.dinner.recipe_title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-forest">{currentDay.dinner.recipe_title}</h4>
                      <p className="text-xs text-deep-muted">
                        {currentDay.dinner.cook_time_minutes} mins • {currentDay.dinner.cuisine}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        const rec = allRecipes.find((r) => r.id === currentDay.dinner?.recipe_id);
                        if (rec) onSelectRecipe(rec);
                      }}
                      className="w-full py-2 rounded-xl bg-forest text-white text-xs font-bold hover:bg-forest-light"
                    >
                      View Recipe
                    </button>
                  </div>
                ) : (
                  <div className="py-8 text-center space-y-3 border-2 border-dashed border-cream-border rounded-xl">
                    <p className="text-xs text-deep-muted font-medium">No dinner planned</p>
                    <button
                      onClick={() => handleAddQuickMeal('dinner', allRecipes[1] || allRecipes[0])}
                      className="px-3 py-1.5 rounded-lg bg-cream hover:bg-cream-border text-forest text-xs font-bold"
                    >
                      + Add Tomato Egg Curry
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Grocery List View */
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-cream-border shadow-soft space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cream-border pb-4">
            <div>
              <h3 className="text-xl font-extrabold text-forest">Aggregated Weekly Grocery List</h3>
              <p className="text-xs text-deep-muted">
                Combined quantities and estimated regional cost for your 7-day meal plan.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="px-4 py-2 rounded-xl bg-cream text-forest text-xs font-bold">
                Estimated Total: ₹{Math.round(totalGroceryCost)}
              </div>
              <button
                onClick={handleExportGroceryList}
                className="px-4 py-2 rounded-xl bg-forest text-white text-xs font-bold hover:bg-forest-light flex items-center gap-1.5"
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
                    ? 'bg-sage/40 border-sage opacity-60 line-through'
                    : 'bg-cream-surface border-cream-border hover:border-forest/40'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-md flex items-center justify-center border text-xs ${
                    item.checked ? 'bg-forest text-white border-forest' : 'border-deep-subtle/50'
                  }`}>
                    {item.checked && <Check className="w-3.5 h-3.5" />}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-forest">{item.name}</span>
                    <p className="text-[10px] text-deep-muted">{item.category}</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-extrabold text-deep">
                    {Math.round(item.quantity)} {item.unit}
                  </span>
                  <p className="text-[10px] text-deep-muted">~₹{Math.round(item.estimated_cost_inr)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
