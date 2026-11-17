import React, { useState, useEffect } from 'react';
import { Plus, X, Info, RotateCcw, Sparkles } from 'lucide-react';
import { RecipeCard } from '../components/RecipeCard';
import { Recipe, UserIngredient, RecipeRecommendation } from '../types';
import { api } from '../services/api';

interface HomeProps {
  recipes: Recipe[];
  onSelectRecipe: (recipe: Recipe) => void;
  onStartCooking?: (recipe: Recipe) => void;
  savedRecipeIds: string[];
  onToggleSave: (recipeId: string) => void;
  userIngredients: UserIngredient[];
  onUserIngredientsChange: (ingredients: UserIngredient[]) => void;
  pantryStaples: string[];
  onPantryStaplesChange: (staples: string[]) => void;
  equipment: string[];
  onEquipmentChange: (equipment: string[]) => void;
}

export const Home: React.FC<HomeProps> = ({
  onSelectRecipe,
  onStartCooking,
  savedRecipeIds,
  onToggleSave,
  userIngredients,
  onUserIngredientsChange,
  pantryStaples,
}) => {
  const [recommendations, setRecommendations] = useState<RecipeRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Quick Add input state
  const [isAddingIngredient, setIsAddingIngredient] = useState(false);
  const [newIngredientName, setNewIngredientName] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);

  // Fetch recommendations from backend
  const fetchRecipes = async () => {
    if (userIngredients.length === 0) {
      setRecommendations([]);
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const response = await api.recommendRecipes({
        ingredients: userIngredients.map((i) => ({
          name: i.name,
          quantity: i.quantity,
          unit: i.unit,
          state: i.state,
        })),
        pantryStaples,
      });

      if (response && response.recommendations) {
        setRecommendations(response.recommendations);
      }
    } catch (err: any) {
      console.error('Error fetching recipes:', err);
      setErrorMsg(
        err?.message || 'Could not fetch recipes from server. Please verify backend is running.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecipes();
  }, [userIngredients, pantryStaples]);

  // Handle remove ingredient chip
  const handleRemoveChip = (indexToRemove: number) => {
    onUserIngredientsChange(userIngredients.filter((_, idx) => idx !== indexToRemove));
  };

  // Handle add ingredient
  const handleAddIngredient = (nameToAdd?: string) => {
    const raw = (nameToAdd || newIngredientName).trim();
    if (!raw) return;

    if (!userIngredients.some((i) => i.name.toLowerCase() === raw.toLowerCase())) {
      onUserIngredientsChange([...userIngredients, { name: raw, state: 'raw' }]);
    }
    setNewIngredientName('');
    setIsAddingIngredient(false);
    setSuggestions([]);
  };

  // Compute Missing Ingredients across top recommendations
  const getMissingIngredients = () => {
    const map = new Map<string, { name: string; price: number; icon: string }>();

    const getIconForIngredient = (name: string) => {
      const lower = name.toLowerCase();
      if (lower.includes('garlic')) return '🧄';
      if (lower.includes('ginger')) return '🫚';
      if (lower.includes('oil')) return '🫒';
      if (lower.includes('egg')) return '🥚';
      if (lower.includes('chilli') || lower.includes('pepper')) return '🌶️';
      if (lower.includes('coriander') || lower.includes('curry')) return '🌿';
      return '🌱';
    };

    const getPriceForIngredient = (name: string, estimated?: number) => {
      if (estimated) return estimated;
      const lower = name.toLowerCase();
      if (lower.includes('oil')) return 30;
      if (lower.includes('egg')) return 15;
      if (lower.includes('garlic')) return 5;
      if (lower.includes('ginger')) return 5;
      if (lower.includes('pasta')) return 40;
      return 10;
    };

    recommendations.slice(0, 4).forEach((rec) => {
      const allMissing = [
        ...rec.missingRequiredIngredients,
        ...(rec.missingOptionalIngredients || []),
      ];

      allMissing.forEach((item) => {
        const isAlreadyHave = userIngredients.some(
          (u) => u.name.toLowerCase() === item.name.toLowerCase()
        );
        if (!isAlreadyHave && !map.has(item.name.toLowerCase())) {
          map.set(item.name.toLowerCase(), {
            name: item.name,
            price: getPriceForIngredient(item.name, item.estimated_cost_inr),
            icon: getIconForIngredient(item.name),
          });
        }
      });
    });

    const list = Array.from(map.values());
    if (list.length > 0) return list.slice(0, 3); // Top 3 as shown in the reference image

    // Fallback if top matches are 100% or default view
    return [
      { name: 'Garlic', price: 5, icon: '🧄' },
      { name: 'Ginger', price: 5, icon: '🫚' },
      { name: 'Cooking Oil', price: 30, icon: '🫒' },
    ];
  };

  const missingIngredientsList = getMissingIngredients();

  return (
    <div className="space-y-7 pb-16">
      {/* 1. Header Section */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B3B24] tracking-tight font-sans">
          Recipe Suggestions
        </h1>
        <p className="text-sm text-[#5D6F65] mt-1 font-medium">
          Here are some delicious recipes you can make with your ingredients.
        </p>
      </div>

      {/* 2. Top Controls Row: Your Ingredients & Missing Ingredients */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left: Your Ingredients Panel */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-5 sm:p-6 border border-[#ECE7DE] shadow-xs">
          <h2 className="text-sm sm:text-base font-bold text-[#0B3B24] mb-3.5">
            Your Ingredients
          </h2>

          <div className="flex flex-wrap items-center gap-2.5">
            {userIngredients.map((ing, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EDF2EE] text-[#1E3B2B] text-xs sm:text-sm font-semibold transition-all hover:bg-[#E2EBE4]"
              >
                <span>{ing.name}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveChip(idx)}
                  className="p-0.5 rounded-full text-[#5A7365] hover:text-red-500 hover:bg-black/5 transition-colors"
                  aria-label={`Remove ${ing.name}`}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}

            {/* Inline Add Button or Input */}
            {isAddingIngredient ? (
              <div className="inline-flex items-center gap-1.5 bg-[#F5EFE6] px-3 py-1 rounded-full border border-[#D5DDD7]">
                <input
                  type="text"
                  autoFocus
                  value={newIngredientName}
                  onChange={(e) => setNewIngredientName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddIngredient();
                    } else if (e.key === 'Escape') {
                      setIsAddingIngredient(false);
                    }
                  }}
                  placeholder="e.g. Garlic, Egg, Carrot..."
                  className="bg-transparent text-xs sm:text-sm text-[#11241A] placeholder-[#8A9C92] focus:outline-none w-36 sm:w-44"
                />
                <button
                  type="button"
                  onClick={() => handleAddIngredient()}
                  className="text-xs font-bold text-[#0B3B24] hover:text-[#072818] px-1"
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddingIngredient(false)}
                  className="text-[#8A9C92] hover:text-red-500"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsAddingIngredient(true)}
                className="w-8 h-8 rounded-full bg-white border border-[#D5DDD7] shadow-2xs flex items-center justify-center text-[#1E3B2B] hover:bg-[#EDF2EE] hover:scale-105 transition-all"
                title="Add ingredient"
                aria-label="Add ingredient"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
              </button>
            )}
          </div>
        </div>

        {/* Right: Missing Ingredients Panel */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-5 sm:p-6 border border-[#ECE7DE] shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-[#0B3B24] mb-3">
              Missing Ingredients
            </h2>

            <div className="space-y-2.5">
              {missingIngredientsList.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs sm:text-sm">
                  <div className="flex items-center gap-2 text-[#2C3E35] font-medium">
                    <span className="text-sm shrink-0">{item.icon}</span>
                    <span>{item.name}</span>
                  </div>
                  <span className="font-bold text-[#11241A]">₹{item.price}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="text-[11px] text-[#7A8C82] flex items-center gap-1.5 mt-3.5 pt-3 border-t border-[#F0ECE4]">
            <Info className="w-3.5 h-3.5 shrink-0 text-[#7A8C82]" />
            <span>(Optional but recommended)</span>
          </div>
        </div>
      </div>

      {/* 3. Error Banner */}
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm flex items-center justify-between">
          <span>{errorMsg}</span>
          <button
            type="button"
            onClick={fetchRecipes}
            className="flex items-center gap-1 px-3 py-1 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Retry</span>
          </button>
        </div>
      )}

      {/* 4. Recipe Cards Grid */}
      <div>
        {isLoading ? (
          /* Loading Skeletons */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className="bg-white rounded-3xl overflow-hidden border border-[#ECE7DE] animate-pulse"
              >
                <div className="h-48 bg-[#EDE8DE]" />
                <div className="p-5 space-y-3">
                  <div className="h-5 bg-[#EDE8DE] rounded-md w-3/4" />
                  <div className="h-3.5 bg-[#EDE8DE] rounded-md w-1/2" />
                  <div className="h-6 bg-[#EDE8DE] rounded-full w-2/3" />
                  <div className="h-3 bg-[#EDE8DE] rounded-md w-full" />
                  <div className="h-10 bg-[#EDE8DE] rounded-xl w-full mt-4" />
                </div>
              </div>
            ))}
          </div>
        ) : recommendations.length === 0 ? (
          /* Empty State */
          <div className="text-center py-16 bg-white rounded-3xl border border-[#ECE7DE] p-8">
            <p className="text-sm text-[#5D6F65]">
              No recipes found for these ingredients. Try adding more staples or clicking the + button.
            </p>
          </div>
        ) : (
          /* 4 Recipe Cards in Responsive Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 xl:gap-6">
            {recommendations.slice(0, 4).map((rec, index) => (
              <RecipeCard
                key={rec.recipe.id || index}
                recipe={rec.recipe}
                matchPercentage={rec.matchPercentage}
                matchedIngredients={rec.matchedIngredients}
                missingIngredients={rec.missingRequiredIngredients}
                canCookWithoutShopping={rec.canCookWithoutBuyingAnything}
                isSaved={savedRecipeIds.includes(rec.recipe.id)}
                onToggleSave={onToggleSave}
                onSelectRecipe={onSelectRecipe}
                onStartCooking={onStartCooking}
                isBestMatch={index === 0}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
