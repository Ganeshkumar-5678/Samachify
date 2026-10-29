import React, { useState } from 'react';
import { Bookmark, Search, ChefHat, Sparkles, ArrowRight } from 'lucide-react';
import { Recipe } from '../types';
import { RecipeCard } from '../components/RecipeCard';
import { Link } from 'react-router-dom';

interface SavedRecipesPageProps {
  allRecipes: Recipe[];
  savedRecipeIds: string[];
  onToggleSave: (recipeId: string) => void;
  onSelectRecipe: (recipe: Recipe) => void;
}

export const SavedRecipesPage: React.FC<SavedRecipesPageProps> = ({
  allRecipes,
  savedRecipeIds,
  onToggleSave,
  onSelectRecipe,
}) => {
  const [filterQuery, setFilterQuery] = useState('');

  const savedRecipes = allRecipes.filter((r) => savedRecipeIds.includes(r.id));
  const filtered = savedRecipes.filter((r) =>
    r.title.toLowerCase().includes(filterQuery.toLowerCase()) ||
    r.cuisine.toLowerCase().includes(filterQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-forest text-white flex items-center justify-center">
              <Bookmark className="w-5 h-5 text-spice" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-forest tracking-tight">
              Saved Recipes
            </h1>
          </div>
          <p className="text-deep-muted font-medium text-sm mt-1">
            Your personal cookbook of kitchen favorites.
          </p>
        </div>

        {savedRecipes.length > 0 && (
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-deep-subtle absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search your saved dishes..."
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-cream-border text-xs focus:outline-none focus:border-forest bg-white"
            />
          </div>
        )}
      </div>

      {savedRecipes.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-cream-border p-8 space-y-4">
          <div className="w-16 h-16 rounded-full bg-cream mx-auto flex items-center justify-center text-forest">
            <Bookmark className="w-8 h-8 text-spice" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-forest">Your cookbook is empty</h3>
            <p className="text-xs text-deep-muted max-w-sm mx-auto">
              Tap the bookmark icon on any recipe to save it here for fast kitchen access anytime.
            </p>
          </div>
          <Link
            to="/recipes"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-forest text-white font-bold text-xs hover:bg-forest-light transition-all"
          >
            <span>Browse Recipes</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filtered.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              isSaved={true}
              onToggleSave={onToggleSave}
              onSelectRecipe={(r) => {
                onSelectRecipe(r);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};
