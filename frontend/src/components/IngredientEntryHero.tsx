import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Plus,
  X,
  Trash2,
  Edit2,
  Check,
  Search,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  ChefHat,
  Info,
  Flame,
  CheckCircle2,
} from 'lucide-react';
import { UserIngredient, IngredientState } from '../types';
import { api } from '../services/api';

interface IngredientEntryHeroProps {
  ingredients: UserIngredient[];
  onIngredientsChange: (ingredients: UserIngredient[]) => void;
  pantryStaples: string[];
  onPantryStaplesChange: (staples: string[]) => void;
  equipment: string[];
  onEquipmentChange: (equipment: string[]) => void;
  onFindRecipes: () => void;
  isLoading: boolean;
}

const COMMON_QUICK_PICKS = [
  { name: 'Rice', tamil: 'Arisi', icon: '🍚' },
  { name: 'Onion', tamil: 'Vengayam', icon: '🧅' },
  { name: 'Tomato', tamil: 'Thakkali', icon: '🍅' },
  { name: 'Green Chilli', tamil: 'Pachai Milagai', icon: '🌶️' },
  { name: 'Toor Dal', tamil: 'Thuvaram Paruppu', icon: '🥣' },
  { name: 'Curry Leaves', tamil: 'Kariveppilai', icon: '🍃' },
  { name: 'Potato', tamil: 'Urulaikizhangu', icon: '🥔' },
  { name: 'Eggs', tamil: 'Muttai', icon: '🥚' },
  { name: 'Paneer', tamil: 'Paneer', icon: '🧀' },
];

const POPULAR_PANTRY_STAPLES = [
  'Cooking Oil',
  'Mustard Seeds',
  'Salt',
  'Turmeric Powder',
  'Chilli Powder',
  'Cumin Seeds',
  'Asafoetida / Hing',
  'Ghee',
  'Tamarind',
];

const COMMON_EQUIPMENT = [
  'Kadaai / Wok',
  'Pressure Cooker',
  'Tawa / Flat Skillet',
  'Mixer Grinder / Blender',
  'Saucepan',
];

const INGREDIENT_STATES: { label: string; value: IngredientState }[] = [
  { label: 'Raw', value: 'raw' },
  { label: 'Cooked', value: 'cooked' },
  { label: 'Frozen', value: 'frozen' },
  { label: 'Leftover', value: 'leftover' },
];

export const IngredientEntryHero: React.FC<IngredientEntryHeroProps> = ({
  ingredients,
  onIngredientsChange,
  pantryStaples,
  onPantryStaplesChange,
  equipment,
  onEquipmentChange,
  onFindRecipes,
  isLoading,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');
  const [suggestions, setSuggestions] = useState<{ original: string; normalized: string; category: string; tamilName?: string }[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const [showStaplesDrawer, setShowStaplesDrawer] = useState(false);
  const [showEquipmentDrawer, setShowEquipmentDrawer] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch autocomplete suggestions as the user types
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (inputValue.trim().length >= 2) {
        const results = await api.searchIngredients(inputValue.trim());
        setSuggestions(results);
      } else {
        setSuggestions([]);
      }
    }, 150);
    return () => clearTimeout(timer);
  }, [inputValue]);

  // Handle adding an ingredient by name (supports comma separation)
  const handleAddIngredient = (nameToAdd?: string) => {
    const raw = nameToAdd || inputValue;
    if (!raw.trim()) return;

    // Check if comma-separated
    if (raw.includes(',')) {
      const parts = raw
        .split(',')
        .map((p) => p.trim())
        .filter((p) => p.length > 0);

      const newItems: UserIngredient[] = parts
        .filter((part) => !ingredients.some((i) => i.name.toLowerCase() === part.toLowerCase()))
        .map((part) => ({
          name: part,
          state: 'raw',
        }));

      if (newItems.length > 0) {
        onIngredientsChange([...ingredients, ...newItems]);
      }
    } else {
      const trimmed = raw.trim();
      const exists = ingredients.some((i) => i.name.toLowerCase() === trimmed.toLowerCase());
      if (!exists) {
        onIngredientsChange([
          ...ingredients,
          {
            name: trimmed,
            state: 'raw',
          },
        ]);
      }
    }

    setInputValue('');
    setSuggestions([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (suggestions.length > 0 && inputValue.length > 1) {
        handleAddIngredient(suggestions[0].original);
      } else {
        handleAddIngredient();
      }
    }
  };

  const handleRemove = (index: number) => {
    const updated = ingredients.filter((_, i) => i !== index);
    onIngredientsChange(updated);
  };

  const handleStartEdit = (index: number) => {
    setEditingIndex(index);
    setEditValue(ingredients[index].name);
  };

  const handleSaveEdit = (index: number) => {
    if (!editValue.trim()) return;
    const updated = [...ingredients];
    updated[index].name = editValue.trim();
    onIngredientsChange(updated);
    setEditingIndex(null);
  };

  const handleStateChange = (index: number, state: IngredientState) => {
    const updated = [...ingredients];
    updated[index].state = state;
    onIngredientsChange(updated);
  };

  const handleQuantityChange = (index: number, quantityStr: string) => {
    const qty = parseFloat(quantityStr);
    const updated = [...ingredients];
    updated[index].quantity = isNaN(qty) ? undefined : qty;
    onIngredientsChange(updated);
  };

  const handleUnitChange = (index: number, unit: string) => {
    const updated = [...ingredients];
    updated[index].unit = unit;
    onIngredientsChange(updated);
  };

  const handleClearAll = () => {
    onIngredientsChange([]);
    setShowClearConfirm(false);
  };

  const togglePantryStaple = (staple: string) => {
    if (pantryStaples.includes(staple)) {
      onPantryStaplesChange(pantryStaples.filter((s) => s !== staple));
    } else {
      onPantryStaplesChange([...pantryStaples, staple]);
    }
  };

  const toggleEquipment = (eq: string) => {
    if (equipment.includes(eq)) {
      onEquipmentChange(equipment.filter((e) => e !== eq));
    } else {
      onEquipmentChange([...equipment, eq]);
    }
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#FFFDF5] via-[#FEFCE8] to-[#FFFBEB] pt-12 pb-16 border-b border-[#FDE68A]">
      {/* Grand Royal Thali Feast Background Image - 60% transparent (40% opacity) */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-40 pointer-events-none mix-blend-multiply scale-105 transition-transform duration-1000"
        style={{ backgroundImage: "url('/assets/grand_thali_bg.png')" }}
      />
      {/* Light warm ambient wash */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#FFFDF5]/65 via-[#FFFDF5]/40 to-[#FFFDF5]/70 pointer-events-none" />

      {/* Subtle organic decorative backdrop in mustard yellow */}
      <div className="absolute top-0 right-0 -mr-24 -mt-24 w-96 h-96 rounded-full bg-[#CA8A04]/15 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-24 -mb-24 w-96 h-96 rounded-full bg-[#D97706]/15 blur-3xl pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Brand headline */}
        <div className="text-center mb-8 relative">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#CA8A04]/15 border border-[#CA8A04]/30 text-[#854D0E] text-xs font-bold uppercase tracking-wider mb-4 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#D97706]" />
            AI Ingredient-to-Recipe Engine
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-[#361E04] tracking-tight leading-tight font-serif drop-shadow-xs">
            What's Cooking? <br className="hidden sm:inline" />
            <span className="text-[#CA8A04]">Besides Your Confusion.</span>
          </h1>

          <p className="mt-3 text-base sm:text-lg text-[#785E3A] max-w-2xl mx-auto leading-relaxed">
            Enter the ingredients you already have. We'll find authentic meals you can actually make without extra grocery runs.
          </p>
        </div>

        {/* Main Focused Ingredient Card in Mustard Yellow */}
        <div className="bg-white/95 rounded-3xl shadow-xl border-2 border-[#FDE68A] p-6 sm:p-8 backdrop-blur-md transition-all">
          {/* Autocomplete Input Bar */}
          <div className="relative">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#854D0E] mb-2">
              Add Kitchen Ingredients (Tamil or English):
            </label>

            <div className="relative flex items-center">
              <Search className="w-5 h-5 text-[#A1824A] absolute left-4 pointer-events-none" />
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setTimeout(() => setIsFocused(false), 200)}
                onKeyDown={handleKeyDown}
                placeholder="e.g. Rice, Thakkali, Onion, Pachai Milagai, Toor dal..."
                className="w-full pl-12 pr-28 py-3.5 bg-[#FFFDF5] border-2 border-[#FDE68A] focus:border-[#CA8A04] focus:bg-white rounded-2xl text-[#2D1E0B] text-base placeholder-[#A1824A]/70 outline-none transition-all shadow-inner"
              />
              <button
                type="button"
                onClick={() => handleAddIngredient()}
                disabled={!inputValue.trim()}
                className="absolute right-2.5 px-4 py-2 bg-[#CA8A04] hover:bg-[#854D0E] disabled:bg-amber-200 text-white font-semibold text-sm rounded-xl transition-all flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Add</span>
              </button>
            </div>

            {/* Autocomplete Dropdown */}
            {isFocused && suggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-2xl border-2 border-[#FDE68A] overflow-hidden z-30 divide-y divide-[#FEFCE8]">
                {suggestions.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onMouseDown={() => handleAddIngredient(item.original)}
                    className="w-full text-left px-5 py-3 hover:bg-[#FEFCE8] transition-colors flex items-center justify-between text-sm group"
                  >
                    <div>
                      <span className="font-bold text-[#854D0E] group-hover:text-[#CA8A04]">
                        {item.original}
                      </span>
                      {item.tamilName && (
                        <span className="ml-2 text-xs text-[#785E3A] italic">
                          ({item.tamilName})
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-[#854D0E] bg-[#FEF3C7] px-2.5 py-1 rounded-full group-hover:bg-white">
                      {item.category}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick-Pick Popular Ingredients */}
          <div className="mt-4 flex flex-wrap items-center gap-1.5 sm:gap-2">
            <span className="text-xs font-semibold text-[#785E3A] flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-[#D97706]" /> Quick picks:
            </span>
            {COMMON_QUICK_PICKS.map((quick) => {
              const alreadyAdded = ingredients.some(
                (i) => i.name.toLowerCase() === quick.name.toLowerCase()
              );
              return (
                <button
                  key={quick.name}
                  type="button"
                  onClick={() => !alreadyAdded && handleAddIngredient(quick.name)}
                  disabled={alreadyAdded}
                  className={`text-xs px-2.5 py-1 rounded-full transition-all border flex items-center gap-1.5 ${
                    alreadyAdded
                      ? 'bg-amber-50 text-amber-300 border-amber-200 cursor-default'
                      : 'bg-[#FFFDF5] hover:bg-[#CA8A04] hover:text-white text-[#854D0E] border-[#FDE68A] shadow-xs'
                  }`}
                >
                  <span className="text-sm">{quick.icon}</span>
                  <span>+ {quick.name}</span>
                  <span className="opacity-75 text-[10px] font-medium">({quick.tamil})</span>
                </button>
              );
            })}
          </div>

          {/* Active Ingredient Chips List */}
          <div className="mt-6 pt-5 border-t border-[#FDE68A]/60">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-[#361E04]">
                  Available in Your Kitchen ({ingredients.length})
                </span>
                {ingredients.length > 0 && (
                  <span className="text-xs bg-[#CA8A04]/15 text-[#854D0E] font-semibold px-2 py-0.5 rounded-full border border-[#CA8A04]/30">
                    Ready
                  </span>
                )}
              </div>

              {ingredients.length > 0 && (
                <div>
                  {showClearConfirm ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-red-600 font-semibold">Clear all?</span>
                      <button
                        type="button"
                        onClick={handleClearAll}
                        className="text-xs px-2 py-0.5 bg-red-600 text-white rounded font-bold hover:bg-red-700"
                      >
                        Yes
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowClearConfirm(false)}
                        className="text-xs px-2 py-0.5 bg-gray-200 text-gray-700 rounded font-medium"
                      >
                        No
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowClearConfirm(true)}
                      className="text-xs text-[#785E3A] hover:text-red-600 flex items-center gap-1 font-medium transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Clear all</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {ingredients.length === 0 ? (
              <div className="bg-[#FFFDF5] border-2 border-dashed border-[#FDE68A] rounded-2xl p-6 text-center">
                <ChefHat className="w-8 h-8 text-[#CA8A04]/50 mx-auto mb-2" />
                <p className="text-sm font-semibold text-[#2D1E0B]">
                  No ingredients added yet
                </p>
                <p className="text-xs text-[#785E3A] mt-1 max-w-md mx-auto">
                  Type your available ingredients above or click quick-picks (e.g. <em>Rice, Tomato, Onion</em>). You can also paste a comma-separated list!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {ingredients.map((ing, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col p-3 rounded-2xl bg-[#FFFDF5] border border-[#FDE68A] hover:border-[#CA8A04]/60 transition-all text-sm group shadow-xs"
                  >
                    <div className="flex items-center justify-between gap-2">
                      {editingIndex === idx ? (
                        <div className="flex items-center gap-1.5 flex-1">
                          <input
                            type="text"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="w-full px-2 py-1 text-xs bg-white border border-[#CA8A04] rounded-lg text-[#2D1E0B] outline-none"
                            autoFocus
                            onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit(idx)}
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveEdit(idx)}
                            className="p-1 bg-[#CA8A04] text-white rounded hover:bg-[#854D0E]"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <span className="font-bold text-[#361E04] truncate">
                            {ing.name}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleStartEdit(idx)}
                            className="opacity-0 group-hover:opacity-100 p-1 text-[#785E3A] hover:text-[#CA8A04] transition-opacity"
                            title="Edit name"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => handleRemove(idx)}
                        className="p-1 text-[#785E3A] hover:text-red-600 transition-colors rounded"
                        title="Remove"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Quantity & State Selector Row */}
                    <div className="mt-2.5 pt-2 border-t border-[#FDE68A]/60 flex items-center justify-between text-xs gap-2">
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          placeholder="Qty"
                          min="0"
                          step="any"
                          value={ing.quantity !== undefined ? ing.quantity : ''}
                          onChange={(e) => handleQuantityChange(idx, e.target.value)}
                          className="w-14 px-1.5 py-0.5 text-[11px] bg-white border border-[#FDE68A] rounded text-center text-[#2D1E0B]"
                        />
                        <input
                          type="text"
                          placeholder="Unit (g, cups)"
                          value={ing.unit || ''}
                          onChange={(e) => handleUnitChange(idx, e.target.value)}
                          className="w-20 px-1.5 py-0.5 text-[11px] bg-white border border-[#FDE68A] rounded text-center text-[#2D1E0B]"
                        />
                      </div>

                      <div className="flex items-center gap-1">
                        {INGREDIENT_STATES.map((st) => (
                          <button
                            key={st.value}
                            type="button"
                            onClick={() => handleStateChange(idx, st.value)}
                            className={`text-[10px] px-1.5 py-0.5 rounded transition-all font-medium capitalize ${
                              ing.state === st.value
                                ? 'bg-[#CA8A04] text-white font-bold shadow-2xs'
                                : 'bg-white text-[#785E3A] border border-[#FDE68A] hover:bg-amber-50'
                            }`}
                          >
                            {st.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pantry Staples & Equipment Accordions */}
          <div className="mt-6 pt-5 border-t border-[#FDE68A]/60 space-y-3">
            {/* Pantry Staples Toggle */}
            <div className="bg-[#FFFDF5] rounded-2xl border border-[#FDE68A] overflow-hidden">
              <button
                type="button"
                onClick={() => setShowStaplesDrawer(!showStaplesDrawer)}
                className="w-full px-4 py-3 flex items-center justify-between text-left text-xs font-bold text-[#854D0E] uppercase tracking-wide hover:bg-[#FEFCE8] transition-colors"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#D97706]" />
                  <span>
                    Pantry Staples Declared ({pantryStaples.length} selected)
                  </span>
                </div>
                {showStaplesDrawer ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showStaplesDrawer && (
                <div className="p-4 pt-1 bg-white border-t border-[#FDE68A]/60 flex flex-wrap gap-2 animate-in fade-in duration-200">
                  {POPULAR_PANTRY_STAPLES.map((staple) => {
                    const isSelected = pantryStaples.includes(staple);
                    return (
                      <button
                        key={staple}
                        type="button"
                        onClick={() => togglePantryStaple(staple)}
                        className={`text-xs px-3 py-1.5 rounded-full font-semibold transition-all border ${
                          isSelected
                            ? 'bg-[#CA8A04] text-white border-[#CA8A04] shadow-2xs'
                            : 'bg-[#FFFDF5] text-[#785E3A] border-[#FDE68A] hover:border-[#CA8A04]'
                        }`}
                      >
                        {isSelected ? '✓ ' : '+ '}
                        {staple}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Equipment Selection Toggle */}
            <div className="bg-[#FFFDF5] rounded-2xl border border-[#FDE68A] overflow-hidden">
              <button
                type="button"
                onClick={() => setShowEquipmentDrawer(!showEquipmentDrawer)}
                className="w-full px-4 py-3 flex items-center justify-between text-left text-xs font-bold text-[#854D0E] uppercase tracking-wide hover:bg-[#FEFCE8] transition-colors"
              >
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-[#D97706]" />
                  <span>
                    Cooking Equipment ({equipment.length} selected)
                  </span>
                </div>
                {showEquipmentDrawer ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showEquipmentDrawer && (
                <div className="p-4 pt-1 bg-white border-t border-[#FDE68A]/60 flex flex-wrap gap-2 animate-in fade-in duration-200">
                  {COMMON_EQUIPMENT.map((eq) => {
                    const isSelected = equipment.includes(eq);
                    return (
                      <button
                        key={eq}
                        type="button"
                        onClick={() => toggleEquipment(eq)}
                        className={`text-xs px-3 py-1.5 rounded-full font-semibold transition-all border ${
                          isSelected
                            ? 'bg-[#854D0E] text-white border-[#854D0E] shadow-2xs'
                            : 'bg-[#FFFDF5] text-[#785E3A] border-[#FDE68A] hover:border-[#854D0E]'
                        }`}
                      >
                        {isSelected ? '✓ ' : '+ '}
                        {eq}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Primary CTA Button */}
          <div className="mt-8 pt-4">
            <button
              type="button"
              onClick={onFindRecipes}
              disabled={ingredients.length === 0 || isLoading}
              className="w-full py-4 rounded-2xl bg-[#CA8A04] hover:bg-[#854D0E] disabled:bg-amber-200 text-white font-extrabold text-base sm:text-lg transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3 transform hover:-translate-y-0.5 active:translate-y-0"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Analyzing Ingredients & Cooking Recipes...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 text-[#FEF08A]" />
                  <span>Find My Recipes</span>
                  {ingredients.length > 0 && (
                    <span className="text-xs bg-white/25 px-2.5 py-1 rounded-full font-semibold">
                      ({ingredients.length} items)
                    </span>
                  )}
                </>
              )}
            </button>
            <p className="text-center text-xs text-[#785E3A] mt-3 flex items-center justify-center gap-1">
              <Info className="w-3.5 h-3.5 text-[#CA8A04]" />
              <span>Prioritizes 100% cookable dishes with zero required shopping first</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
