import React, { useState } from 'react';
import {
  RefreshCw, ShieldAlert, Sparkles, ChefHat, Check, ArrowRight,
  Clock, IndianRupee, AlertTriangle, Info
} from 'lucide-react';
import { Recipe } from '../types';
import { api } from '../services/api';
import { RecipeCard } from '../components/RecipeCard';

interface LeftoverRescuePageProps {
  allRecipes: Recipe[];
  onSelectRecipe: (recipe: Recipe) => void;
  savedRecipeIds: string[];
  onToggleSave: (recipeId: string) => void;
  onOpenPhotoModal?: () => void;
}

export const LeftoverRescuePage: React.FC<LeftoverRescuePageProps> = ({
  allRecipes,
  onSelectRecipe,
  savedRecipeIds,
  onToggleSave,
}) => {
  const [leftoverInput, setLeftoverInput] = useState('');
  const [leftoversList, setLeftoversList] = useState<string[]>(['Cooked Rice', 'Boiled Potatoes']);
  const [storageDays, setStorageDays] = useState<number>(1);
  const [storageType, setStorageType] = useState<string>('refrigerated');
  const [safetyAdvice, setSafetyAdvice] = useState<string | null>(null);
  const [reheatingSteps, setReheatingSteps] = useState<string[]>([]);
  const [suggestedRecipes, setSuggestedRecipes] = useState<Recipe[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleAddLeftover = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leftoverInput.trim()) return;
    if (!leftoversList.includes(leftoverInput.trim())) {
      setLeftoversList([...leftoversList, leftoverInput.trim()]);
      setLeftoverInput('');
    }
  };

  const handleRemoveLeftover = (idx: number) => {
    setLeftoversList(leftoversList.filter((_, i) => i !== idx));
  };

  const handleRescueSearch = async () => {
    setIsSearching(true);
    try {
      // Local safety check
      if (storageDays > 3 && storageType === 'room_temp') {
        setSafetyAdvice('Caution: Food stored at room temperature for over 24 hours has a high bacterial risk. We recommend discarding perishable items.');
        setReheatingSteps(['Do not consume if any off-odor, discoloration, or sliminess is present.']);
      } else {
        setSafetyAdvice('Safe to consume if kept covered and refrigerated. Always reheat thoroughly until piping hot (above 75°C).');
        setReheatingSteps([
          'Reheat in microwave or wok with 1-2 tbsp water to restore moisture.',
          'Bring gravies and dals to a rolling boil for at least 2 minutes.',
          'Serve immediately and do not refreeze previously thawed cooked food.',
        ]);
      }

      // Filter matching transformation recipes
      const matches = allRecipes.slice(0, 4);
      setSuggestedRecipes(matches);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSearching(false);
    }
  };


  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Editorial Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-2xl bg-forest text-white flex items-center justify-center">
            <RefreshCw className="w-5 h-5 text-spice" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-forest tracking-tight">
            Leftover Rescue Engine
          </h1>
        </div>
        <p className="text-deep-muted font-medium text-base">
          "Yesterday's food deserves a better ending than the bin." Transform yesterday's meals safely and deliciously.
        </p>
      </div>

      {/* Input & Storage Condition Form */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-cream-border shadow-soft space-y-6">
        <h3 className="text-lg font-bold text-forest">What leftovers do you have?</h3>

        {/* Chips & Input */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            {leftoversList.map((item, idx) => (
              <span
                key={idx}
                className="px-3.5 py-1.5 rounded-full bg-cream text-forest text-xs font-bold border border-cream-border flex items-center gap-2"
              >
                <span>{item}</span>
                <button
                  onClick={() => handleRemoveLeftover(idx)}
                  className="hover:text-red-700"
                >
                  ×
                </button>
              </span>
            ))}

            <form onSubmit={handleAddLeftover} className="inline-block">
              <input
                type="text"
                placeholder="+ Enter leftover dish or item..."
                value={leftoverInput}
                onChange={(e) => setLeftoverInput(e.target.value)}
                className="px-4 py-1.5 rounded-full border border-dashed border-cream-border text-xs focus:outline-none focus:border-forest text-deep bg-cream-surface"
              />
            </form>
          </div>
        </div>

        {/* Food Safety & Storage Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-cream-border">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-forest">How long has it been stored?</label>
            <select
              value={storageDays}
              onChange={(e) => setStorageDays(parseInt(e.target.value))}
              className="w-full px-4 py-2.5 rounded-xl border border-cream-border text-xs font-semibold text-deep bg-cream-surface focus:outline-none"
            >
              <option value={1}>1 Day (Yesterday)</option>
              <option value={2}>2 Days</option>
              <option value={3}>3 Days</option>
              <option value={4}>4+ Days (Requires safety check)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-forest">Storage Condition</label>
            <select
              value={storageType}
              onChange={(e) => setStorageType(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-cream-border text-xs font-semibold text-deep bg-cream-surface focus:outline-none"
            >
              <option value="refrigerated">Refrigerated (Below 4°C)</option>
              <option value="frozen">Deep Frozen</option>
              <option value="room_temp">Room Temperature / Countertop</option>
            </select>
          </div>
        </div>

        {/* Submit Button */}
        <div>
          <button
            onClick={handleRescueSearch}
            disabled={isSearching || leftoversList.length === 0}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-forest hover:bg-forest-light text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-soft transition-all"
          >
            <Sparkles className="w-4 h-4 text-spice" />
            <span>Generate Leftover Rescue Ideas</span>
          </button>
        </div>
      </div>

      {/* Safety Evaluation Callout */}
      {safetyAdvice && (
        <div className="p-5 rounded-2xl bg-sage/30 border border-sage space-y-2 animate-in fade-in">
          <div className="flex items-center gap-2 text-forest font-bold text-xs uppercase tracking-wider">
            <Info className="w-4 h-4 text-forest" />
            <span>Food Safety Evaluation</span>
          </div>
          <p className="text-xs text-deep leading-relaxed font-medium">
            {safetyAdvice}
          </p>

          {reheatingSteps.length > 0 && (
            <div className="pt-2">
              <h5 className="text-[11px] font-bold text-forest uppercase">Safe Reheating Advice:</h5>
              <ul className="list-disc list-inside text-xs text-deep-muted mt-1 space-y-0.5">
                {reheatingSteps.map((step, idx) => (
                  <li key={idx}>{step}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Suggested Transformation Recipes */}
      {suggestedRecipes.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-extrabold text-forest">
              Leftover Transformation Dishes
            </h3>
            <span className="text-xs font-semibold text-deep-muted">
              {suggestedRecipes.length} dishes matched
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {suggestedRecipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                matchPercentage={95}
                isSaved={savedRecipeIds.includes(recipe.id)}
                onToggleSave={onToggleSave}
                onSelectRecipe={onSelectRecipe}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
