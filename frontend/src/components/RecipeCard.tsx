import React from 'react';
import { Clock, Heart, Check, ArrowRight } from 'lucide-react';
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
  isBestMatch?: boolean;
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
  isBestMatch,
}) => {
  const imageUrl =
    recipe.imageUrl ||
    recipe.image_url ||
    'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80';

  const totalTime =
    (recipe.prepTimeMinutes || recipe.prep_time_minutes || 10) +
    (recipe.cookTimeMinutes || recipe.cook_time_minutes || 10);

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

  const handleViewRecipeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelectRecipe(recipe);
  };

  // Determine if best match flag should show
  const showBestMatch = isBestMatch || (matchPercentage !== undefined && matchPercentage >= 85);

  // Status indicator text: "Uses your ingredients" vs "Uses most ingredients"
  const usesYourIngredients = canCookWithoutShopping || (matchPercentage !== undefined && matchPercentage >= 80);

  return (
    <div
      onClick={handleCardClick}
      className="group relative bg-white rounded-3xl overflow-hidden border border-[#ECE7DE] shadow-xs hover:shadow-xl cursor-pointer flex flex-col justify-between transition-all duration-300 transform hover:-translate-y-1"
    >
      {/* Top Image Container */}
      <div className="relative h-48 w-full overflow-hidden bg-[#F5EFE6]">
        <img
          src={imageUrl}
          alt={recipe.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            // High quality fallback
            (e.currentTarget as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=800&q=80';
          }}
        />

        {/* Subtle Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20 pointer-events-none" />

        {/* Top-Left Best Match Pill */}
        {showBestMatch && (
          <div className="absolute top-3 left-3 z-10">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#E67E22] text-white text-[11px] font-bold shadow-md tracking-wide">
              <span>★</span>
              <span>Best Match</span>
            </span>
          </div>
        )}

        {/* Top-Right Favorite / Save Heart Icon */}
        <button
          type="button"
          onClick={handleSaveClick}
          aria-label={isSaved ? 'Remove from saved' : 'Save recipe'}
          className={`absolute top-3 right-3 z-10 p-2 rounded-full backdrop-blur-md transition-all shadow-sm ${
            isSaved
              ? 'bg-[#E67E22] text-white scale-105'
              : 'bg-black/30 hover:bg-black/50 text-white hover:scale-110'
          }`}
        >
          <Heart
            className={`w-4 h-4 transition-transform ${
              isSaved ? 'fill-white text-white' : 'stroke-[2.2]'
            }`}
          />
        </button>
      </div>

      {/* Card Content */}
      <div className="p-5 flex flex-col flex-1 justify-between">
        <div>
          {/* Recipe Name */}
          <h3 className="font-bold text-[17px] text-[#11241A] tracking-tight line-clamp-1 group-hover:text-[#0B3B24] transition-colors">
            {recipe.title}
          </h3>

          {/* Cooking Time, Difficulty & Estimated Cost */}
          <div className="flex items-center gap-1.5 text-xs text-[#5D6F65] font-medium mt-1.5">
            <Clock className="w-3.5 h-3.5 shrink-0 text-[#5D6F65]" />
            <span>{totalTime} mins</span>
            <span className="text-[#A8B5AE]">•</span>
            <span>{recipe.difficulty}</span>
            <span className="text-[#A8B5AE]">•</span>
            <span className="font-bold text-[#11241A]">₹{cost}</span>
          </div>

          {/* Available Ingredients Indicator Pill */}
          <div className="mt-3">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#FCEBD8] text-[#B95A00] text-xs font-bold">
              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>{usesYourIngredients ? 'Uses your ingredients' : 'Uses most ingredients'}</span>
            </span>
          </div>

          {/* Short Description */}
          <p className="text-xs text-[#63756C] mt-2.5 line-clamp-2 leading-relaxed">
            {recipe.description || 'A quick and delicious dish prepared with fresh ingredients.'}
          </p>
        </div>

        {/* Functional View Recipe Button */}
        <div className="mt-4 pt-2">
          <button
            type="button"
            onClick={handleViewRecipeClick}
            className="w-full py-2.5 px-4 rounded-xl bg-[#0B3B24] hover:bg-[#072818] active:bg-[#051F13] text-white text-sm font-bold flex items-center justify-center gap-1.5 shadow-xs hover:shadow-md transition-all duration-200"
          >
            <span>View Recipe</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
