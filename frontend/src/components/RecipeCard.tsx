import React from 'react';
import { Clock, BarChart2, Bookmark, ArrowRight, Sparkles, Check, ShoppingCart, Play } from 'lucide-react';
import { Recipe } from '../types';

interface RecipeCardProps {
  recipe: Recipe;
  matchPercentage?: number;
  matchedIngredients?: string[];
  missingIngredients?: { name: string; quantity?: number; unit?: string }[];
  canCookWithoutShopping?: boolean;
  isSaved?: boolean;
  onToggleSave?: (recipeId: string) => void;
  onSelectRecipe: (recipe: Recipe) => void;
  onStartCooking?: (recipe: Recipe) => void;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({
  recipe,
  matchPercentage,
  matchedIngredients = [],
  missingIngredients = [],
  canCookWithoutShopping = false,
  isSaved = false,
  onToggleSave,
  onSelectRecipe,
  onStartCooking,
}) => {
  const imageUrl =
    recipe.imageUrl ||
    recipe.image_url ||
    'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80';

  const totalTime =
    (recipe.prepTimeMinutes || recipe.prep_time_minutes || 10) +
    (recipe.cookTimeMinutes || recipe.cook_time_minutes || 15);

  const cost =
    recipe.estimatedCostInr ||
    recipe.estimated_total_cost_inr ||
    45;

  const handleCardClick = () => {
    onSelectRecipe(recipe);
  };

  const handleSaveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleSave) {
      onToggleSave(recipe.id);
    }
  };

  const handleStartCookingClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onStartCooking) {
      onStartCooking(recipe);
    } else {
      onSelectRecipe(recipe);
    }
  };

  const isBestMatch = matchPercentage !== undefined && matchPercentage >= 80;

  return (
    <div
      onClick={handleCardClick}
      className="group relative bg-white rounded-3xl overflow-hidden border-2 border-[#FDE68A] shadow-sm hover:shadow-xl hover:border-[#CA8A04] cursor-pointer flex flex-col justify-between transition-all duration-300 transform hover:-translate-y-1"
    >
      {/* Top Image & Floating Badges */}
      <div className="relative h-48 w-full overflow-hidden bg-[#FEFCE8]">
        <img
          src={imageUrl}
          alt={recipe.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

        {/* Save button */}
        <button
          type="button"
          onClick={handleSaveClick}
          aria-label={isSaved ? 'Remove from saved recipes' : 'Save recipe'}
          className={`absolute top-3 right-3 p-2.5 rounded-full backdrop-blur-md transition-all shadow-md ${
            isSaved
              ? 'bg-[#D97706] text-white'
              : 'bg-white/90 hover:bg-white text-[#854D0E] hover:scale-110'
          }`}
        >
          <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
        </button>

        {/* Match / Ready to Cook Pill */}
        <div className="absolute top-3 left-3 flex flex-col gap-1 items-start">
          {(recipe.provenance === 'ai_generated' || recipe.source === 'ai_generated') && (
            <span className="px-2.5 py-0.5 rounded-full bg-amber-700/90 backdrop-blur-sm text-white text-[10px] font-extrabold shadow-md flex items-center gap-1 border border-amber-400/40">
              <Sparkles className="w-3 h-3 text-[#FACC15]" />
              <span>Groq AI Crafted</span>
            </span>
          )}
          {canCookWithoutShopping ? (
            <span className="px-3 py-1 rounded-full bg-emerald-600 text-white text-[11px] font-extrabold tracking-wide shadow-md flex items-center gap-1">
              <Check className="w-3.5 h-3.5 stroke-[3]" />
              <span>Zero Shopping Needed</span>
            </span>
          ) : isBestMatch ? (
            <span className="px-3 py-1 rounded-full bg-[#FACC15] text-[#361E04] text-[11px] font-extrabold tracking-wide shadow-md flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{matchPercentage}% Match</span>
            </span>
          ) : matchPercentage !== undefined && matchPercentage > 0 ? (
            <span className="px-2.5 py-1 rounded-full bg-[#CA8A04] text-white text-[11px] font-bold shadow-md">
              {matchPercentage}% Match
            </span>
          ) : null}
        </div>

        {/* Cuisine Badge */}
        <div className="absolute bottom-3 left-3 px-2.5 py-0.5 rounded-md bg-white/95 backdrop-blur-sm text-[11px] font-bold text-[#854D0E]">
          {recipe.cuisine}
        </div>
      </div>

      {/* Content Body */}
      <div className="p-5 flex flex-col flex-1 justify-between space-y-3">
        <div className="space-y-2">
          <h3 className="font-extrabold text-lg text-[#361E04] tracking-tight group-hover:text-[#CA8A04] transition-colors line-clamp-1">
            {recipe.title}
          </h3>

          {/* Quick Metrics */}
          <div className="flex items-center gap-2 text-xs font-semibold text-[#785E3A]">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[#D97706]" />
              {totalTime} mins
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <BarChart2 className="w-3.5 h-3.5 text-[#CA8A04]" />
              {recipe.difficulty}
            </span>
            <span>•</span>
            <span className="flex items-center text-[#854D0E] font-bold">
              ₹{Math.round(cost)}
            </span>
            <span>•</span>
            <span className="text-[11px]">Serves {recipe.servings}</span>
          </div>

          {/* Ingredient status */}
          <div className="flex items-center gap-1.5 text-xs font-bold">
            {canCookWithoutShopping ? (
              <span className="text-[#854D0E] flex items-center gap-1">
                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Uses all your available ingredients</span>
              </span>
            ) : (
              <span className="text-[#785E3A] text-[11px]">
                {matchedIngredients.length} ingredients matched
              </span>
            )}
          </div>

          <p className="text-xs text-[#785E3A] line-clamp-2 leading-relaxed">
            {recipe.description}
          </p>

          {/* Missing Ingredients Preview */}
          {missingIngredients.length > 0 && !canCookWithoutShopping && (
            <div className="pt-1 flex items-center gap-1.5 text-[11px] text-amber-950 bg-amber-50 px-2.5 py-1.5 rounded-xl border border-amber-200">
              <ShoppingCart className="w-3.5 h-3.5 text-[#D97706] shrink-0" />
              <span className="truncate">
                Need: {missingIngredients.slice(0, 2).map((m) => m.name).join(', ')}
                {missingIngredients.length > 2 && ` +${missingIngredients.length - 2} more`}
              </span>
            </div>
          )}
        </div>

        {/* Action Buttons: View Recipe and Start Cooking */}
        <div className="pt-2 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={handleCardClick}
            className="py-2.5 px-3 rounded-xl border border-[#FDE68A] hover:bg-[#FEFCE8] text-[#854D0E] text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
          >
            <span>View Recipe</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={handleStartCookingClick}
            className="py-2.5 px-3 rounded-xl bg-[#CA8A04] hover:bg-[#854D0E] text-white text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all shadow-sm group-hover:shadow"
          >
            <Play className="w-3.5 h-3.5 fill-current text-[#FEF08A]" />
            <span>Cook Now</span>
          </button>
        </div>
      </div>
    </div>
  );
};
