import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  Plus,
  X,
  Filter,
  Sparkles,
  Clock,
  ChefHat,
  AlertCircle,
  SlidersHorizontal,
  Check,
  CheckCircle2,
  DollarSign,
  Flame,
  Info,
  RotateCcw,
} from 'lucide-react';
import { Recipe, RecipeRecommendation, UserIngredient } from '../types';
import { RecipeCard } from '../components/RecipeCard';
import { api } from '../services/api';

interface RecipesProps {
  allRecipes?: Recipe[];
  onSelectRecipe: (recipe: Recipe) => void;
  onStartCooking?: (recipe: Recipe) => void;
  savedRecipeIds: string[];
  onToggleSave: (recipeId: string) => void;
  initialIngredients?: UserIngredient[];
}

export const Recipes: React.FC<RecipesProps> = ({
  onSelectRecipe,
  onStartCooking,
  savedRecipeIds,
  onToggleSave,
  initialIngredients = [],
}) => {
  const [searchParams] = useSearchParams();
  const qParam = searchParams.get('q') || '';

  // User ingredients
  const [ingredients, setIngredients] = useState<UserIngredient[]>(() => {
    if (initialIngredients.length > 0) return initialIngredients;
    if (qParam) {
      return qParam.split(',').map((s) => ({ name: s.trim(), state: 'raw' }));
    }
    return [
      { name: 'Rice', state: 'raw' },
      { name: 'Tomato', state: 'raw' },
      { name: 'Onion', state: 'raw' },
    ];
  });

  const [newIngredientInput, setNewIngredientInput] = useState('');
  const [suggestions, setSuggestions] = useState<{ original: string; category: string; tamilName?: string }[]>([]);

  // Filter States
  const [cookWithoutBuyingOnly, setCookWithoutBuyingOnly] = useState<boolean>(false);
  const [selectedCuisine, setSelectedCuisine] = useState<string>('all');
  const [selectedDiet, setSelectedDiet] = useState<string>('all');
  const [selectedMealType, setSelectedMealType] = useState<string>('all');
  const [maxCookingTime, setMaxCookingTime] = useState<number>(60);
  const [pantryStaples, setPantryStaples] = useState<string[]>([
    'Cooking Oil',
    'Mustard Seeds',
    'Salt',
    'Turmeric Powder',
    'Chilli Powder',
  ]);

  // Results & Loading State
  const [recommendations, setRecommendations] = useState<RecipeRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [groqMeta, setGroqMeta] = useState<{ groqUsed: boolean; groqConfigured: boolean } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Suggestions search debounce
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (newIngredientInput.trim().length >= 2) {
        const res = await api.searchIngredients(newIngredientInput.trim());
        setSuggestions(res);
      } else {
        setSuggestions([]);
      }
    }, 150);
    return () => clearTimeout(timer);
  }, [newIngredientInput]);

  // Fetch recommendations from API
  const fetchRecommendations = async () => {
    if (ingredients.length === 0) {
      setRecommendations([]);
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const response = await api.recommendRecipes({
        ingredients: ingredients.map((i) => ({
          name: i.name,
          quantity: i.quantity,
          unit: i.unit,
          state: i.state,
        })),
        pantryStaples,
        preferences: {
          dietary: selectedDiet !== 'all' ? [selectedDiet] : undefined,
          cuisine: selectedCuisine !== 'all' ? [selectedCuisine] : undefined,
          mealType: selectedMealType !== 'all' ? [selectedMealType] : undefined,
          maxTimeMinutes: maxCookingTime < 60 ? maxCookingTime : undefined,
          cookWithoutBuyingOnly,
        },
      });

      setRecommendations(response.recommendations || []);
      setGroqMeta({
        groqUsed: response.metadata.groqUsed,
        groqConfigured: response.metadata.groqConfigured,
      });
    } catch (err: any) {
      console.error('Failed to get recommendations:', err);
      setErrorMsg(err?.message || 'Could not fetch recipes. Please check the backend connection.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, [ingredients, pantryStaples, cookWithoutBuyingOnly, selectedCuisine, selectedDiet, selectedMealType, maxCookingTime]);

  const handleAddIngredient = (nameToAdd?: string) => {
    const name = nameToAdd || newIngredientInput.trim();
    if (!name) return;

    if (!ingredients.some((i) => i.name.toLowerCase() === name.toLowerCase())) {
      setIngredients([...ingredients, { name, state: 'raw' }]);
    }
    setNewIngredientInput('');
    setSuggestions([]);
  };

  const handleRemoveIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, idx) => idx !== index));
  };

  return (
    <div className="min-h-screen bg-[#FAF7F0] pb-24">
      {/* Top Banner / Hero */}
      <section className="bg-white border-b border-[#E8DDCB] pt-8 pb-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#234B37]/10 text-[#234B37] text-xs font-bold uppercase tracking-wider mb-2">
                <Sparkles className="w-3.5 h-3.5 text-[#E8B94F]" />
                Ingredient Match Engine
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-[#173526] font-serif">
                Your Ingredients. Your Next Delicious Meal.
              </h1>
              <p className="text-sm text-[#73766E] mt-1">
                Personalized recipe matches calculated from what's in your kitchen.
              </p>
            </div>

            {/* Groq Engine Status Pill */}
            {groqMeta && (
              <div className="bg-[#FAF7F0] border border-[#E8DDCB] px-4 py-2.5 rounded-2xl flex items-center gap-3 shrink-0 self-start md:self-auto">
                <div className={`w-2.5 h-2.5 rounded-full ${groqMeta.groqConfigured ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                <div className="text-xs">
                  <span className="font-bold text-[#173526] block">
                    {groqMeta.groqConfigured ? 'Groq AI Active' : 'Curated Library Mode'}
                  </span>
                  <span className="text-[#73766E] text-[11px]">
                    {groqMeta.groqConfigured ? 'Personalized dishes generated' : 'Authentic curated Tamil & World recipes'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Quick Ingredient Management Row */}
          <div className="mt-6 pt-5 border-t border-[#E8DDCB]/60">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="text-xs font-bold uppercase tracking-wide text-[#234B37]">
                Active Ingredients:
              </span>
              {ingredients.map((ing, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF7F0] border border-[#E8DDCB] text-xs font-bold text-[#173526]"
                >
                  <span>{ing.name}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveIngredient(idx)}
                    className="p-0.5 text-[#73766E] hover:text-red-600 rounded"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}

              {/* Inline quick-add input */}
              <div className="relative inline-flex items-center">
                <input
                  type="text"
                  value={newIngredientInput}
                  onChange={(e) => setNewIngredientInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddIngredient()}
                  placeholder="+ Add ingredient..."
                  className="px-3 py-1 text-xs bg-white border border-[#E8DDCB] focus:border-[#234B37] rounded-full text-[#242820] outline-none w-36 sm:w-44"
                />
                {suggestions.length > 0 && (
                  <div className="absolute left-0 top-full mt-1 bg-white border border-[#E8DDCB] rounded-xl shadow-lg z-20 w-48 max-h-40 overflow-y-auto divide-y divide-gray-100">
                    {suggestions.map((s, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onMouseDown={() => handleAddIngredient(s.original)}
                        className="w-full text-left px-3 py-1.5 text-xs hover:bg-[#FAF7F0] flex justify-between"
                      >
                        <span className="font-semibold text-[#234B37]">{s.original}</span>
                        {s.tamilName && <span className="text-[#73766E] text-[10px]">({s.tamilName})</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area: Filters & Recipe Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {/* Comprehensive Filter Bar */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#E8DDCB] shadow-sm mb-8 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* PRIORITIZED FILTER: Cook Without Buying Anything */}
            <button
              type="button"
              onClick={() => setCookWithoutBuyingOnly(!cookWithoutBuyingOnly)}
              className={`px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all border ${
                cookWithoutBuyingOnly
                  ? 'bg-emerald-600 border-emerald-600 text-white shadow-md'
                  : 'bg-[#FAF7F0] border-[#E8DDCB] text-[#234B37] hover:border-[#234B37]'
              }`}
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Cook Without Buying Anything</span>
              {cookWithoutBuyingOnly && <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded">Active</span>}
            </button>

            {/* Total count indicator */}
            <div className="text-xs font-semibold text-[#73766E]">
              Showing <strong>{recommendations.length}</strong> matching recipes
            </div>
          </div>

          {/* Secondary Filters Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-[#E8DDCB]/60 text-xs">
            {/* Cuisine Filter */}
            <div>
              <label className="block text-[11px] font-bold text-[#73766E] uppercase tracking-wider mb-1">
                Cuisine
              </label>
              <select
                value={selectedCuisine}
                onChange={(e) => setSelectedCuisine(e.target.value)}
                className="w-full px-3 py-2 bg-[#FAF7F0] border border-[#E8DDCB] rounded-xl text-[#242820] font-semibold outline-none"
              >
                <option value="all">All Cuisines</option>
                <option value="Tamil Nadu">Tamil Nadu Authentic</option>
                <option value="Indian">Indian Classic</option>
                <option value="East Asian">East Asian / Chinese</option>
                <option value="Italian">Italian / Pasta</option>
              </select>
            </div>

            {/* Dietary Filter */}
            <div>
              <label className="block text-[11px] font-bold text-[#73766E] uppercase tracking-wider mb-1">
                Dietary
              </label>
              <select
                value={selectedDiet}
                onChange={(e) => setSelectedDiet(e.target.value)}
                className="w-full px-3 py-2 bg-[#FAF7F0] border border-[#E8DDCB] rounded-xl text-[#242820] font-semibold outline-none"
              >
                <option value="all">Any Diet</option>
                <option value="Vegetarian">Vegetarian</option>
                <option value="Vegan">Vegan</option>
                <option value="High-Protein">High-Protein</option>
                <option value="Gluten-Free">Gluten-Free</option>
              </select>
            </div>

            {/* Meal Type Filter */}
            <div>
              <label className="block text-[11px] font-bold text-[#73766E] uppercase tracking-wider mb-1">
                Meal Type
              </label>
              <select
                value={selectedMealType}
                onChange={(e) => setSelectedMealType(e.target.value)}
                className="w-full px-3 py-2 bg-[#FAF7F0] border border-[#E8DDCB] rounded-xl text-[#242820] font-semibold outline-none"
              >
                <option value="all">All Meals</option>
                <option value="Breakfast">Breakfast</option>
                <option value="Lunch">Lunch</option>
                <option value="Dinner">Dinner</option>
                <option value="Snacks">Snacks & Tiffin</option>
              </select>
            </div>

            {/* Max Cooking Time */}
            <div>
              <label className="block text-[11px] font-bold text-[#73766E] uppercase tracking-wider mb-1">
                Max Time: {maxCookingTime < 60 ? `${maxCookingTime} mins` : 'Any'}
              </label>
              <select
                value={maxCookingTime}
                onChange={(e) => setMaxCookingTime(Number(e.target.value))}
                className="w-full px-3 py-2 bg-[#FAF7F0] border border-[#E8DDCB] rounded-xl text-[#242820] font-semibold outline-none"
              >
                <option value="60">Any Cooking Time</option>
                <option value="15">Under 15 minutes</option>
                <option value="30">Under 30 minutes</option>
                <option value="45">Under 45 minutes</option>
              </select>
            </div>
          </div>
        </div>

        {/* Loading Spinner */}
        {isLoading && (
          <div className="py-20 text-center">
            <div className="w-12 h-12 border-4 border-[#234B37] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-base font-bold text-[#173526]">Calculating optimal recipe matches...</p>
            <p className="text-xs text-[#73766E] mt-1">Cross-referencing ingredients, spices, and cooking times</p>
          </div>
        )}

        {/* Error message with Retry Action */}
        {!isLoading && errorMsg && (
          <div className="p-5 rounded-2xl bg-red-50 border border-red-200 text-red-900 text-sm mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />
              <div>
                <strong className="font-bold">Unable to fetch recipes: </strong>
                <span>{errorMsg}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => fetchRecommendations()}
              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition-colors shrink-0 self-start sm:self-auto flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retry Search</span>
            </button>
          </div>
        )}

        {/* Results Grid */}
        {!isLoading && !errorMsg && (
          <>
            {recommendations.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {recommendations.map((rec) => (
                  <RecipeCard
                    key={rec.recipe.id}
                    recipe={rec.recipe}
                    matchPercentage={rec.matchPercentage}
                    matchedIngredients={rec.matchedIngredients}
                    missingIngredients={rec.missingRequiredIngredients}
                    canCookWithoutShopping={rec.canCookWithoutBuyingAnything}
                    isSaved={savedRecipeIds.includes(rec.recipe.id)}
                    onToggleSave={onToggleSave}
                    onSelectRecipe={onSelectRecipe}
                    onStartCooking={onStartCooking}
                  />
                ))}
              </div>
            ) : (
              /* Empty state */
              <div className="py-16 text-center bg-white rounded-3xl border border-[#E8DDCB] p-8 max-w-xl mx-auto shadow-sm">
                <ChefHat className="w-12 h-12 text-[#234B37]/40 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-[#173526]">No exact matches found with current filters</h3>
                <p className="text-xs text-[#73766E] mt-2 leading-relaxed">
                  {cookWithoutBuyingOnly
                    ? 'None of the recipes can be made 100% without extra ingredients based on your current selection. Try unchecking "Cook Without Buying Anything" or adding more staple ingredients (e.g. Rice, Onion, Tomato, Dal).'
                    : 'Try relaxing your cuisine, dietary, or time filters, or adding a few more ingredients.'}
                </p>
                {cookWithoutBuyingOnly && (
                  <button
                    type="button"
                    onClick={() => setCookWithoutBuyingOnly(false)}
                    className="mt-5 px-5 py-2.5 rounded-xl bg-[#234B37] text-white text-xs font-bold hover:bg-[#173526] transition-colors"
                  >
                    Show All Recipes (Including Missing Items)
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
