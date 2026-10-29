import React, { useState } from 'react';
import { Globe, ArrowRight, Sparkles, ChefHat } from 'lucide-react';
import { Recipe } from '../types';
import { RecipeCard } from '../components/RecipeCard';

interface CuisinesPageProps {
  allRecipes: Recipe[];
  onSelectRecipe: (recipe: Recipe) => void;
  savedRecipeIds: string[];
  onToggleSave: (recipeId: string) => void;
}

export const CuisinesPage: React.FC<CuisinesPageProps> = ({
  allRecipes,
  onSelectRecipe,
  savedRecipeIds,
  onToggleSave,
}) => {
  const [selectedCuisine, setSelectedCuisine] = useState('All');

  const cuisineCategories = [
    { name: 'All', title: 'World Kitchen', desc: 'Browse recipes across all continents', flag: '🌍' },
    { name: 'South Indian', title: 'South Indian Heritage', desc: 'Tamil, Kerala, Andhra & Chettinad flavors', flag: '🍛' },
    { name: 'East Asian', title: 'East & Southeast Asian', desc: 'Wok tossed fried rice, noodles, and dim sum', flag: '🥢' },
    { name: 'European', title: 'Italian & Mediterranean', desc: 'Al dente pastas, rustic garlic sauces, fresh herbs', flag: '🍝' },
    { name: 'Middle Eastern', title: 'Levantine & Middle Eastern', desc: 'Shakshuka, aromatic cumin stews, falafel', flag: '🧆' },
    { name: 'Americas', title: 'Mexican & Americas', desc: 'Spiced potato tacos, burrito bowls, fresh salsa', flag: '🌮' },
  ];

  const handleSelectCuisine = (cuisineName: string) => {
    setSelectedCuisine(cuisineName);
  };


  const filtered = selectedCuisine === 'All'
    ? allRecipes
    : allRecipes.filter((r) => r.cuisine.toLowerCase().includes(selectedCuisine.toLowerCase()));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-2xl bg-forest text-white flex items-center justify-center">
            <Globe className="w-5 h-5 text-spice" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-forest tracking-tight">
            Global Cuisine Explorer
          </h1>
        </div>
        <p className="text-deep-muted font-medium text-base">
          Discover culinary traditions from around the globe that you can cook with simple home ingredients.
        </p>
      </div>

      {/* Cuisine Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {cuisineCategories.map((c) => {
          const isSelected = selectedCuisine === c.name;
          return (
            <button
              key={c.name}
              onClick={() => handleSelectCuisine(c.name)}
              className={`p-4 rounded-2xl text-left transition-all border flex flex-col justify-between space-y-2 ${
                isSelected
                  ? 'bg-forest text-white border-forest shadow-card scale-102'
                  : 'bg-white hover:bg-cream-surface text-deep border-cream-border'
              }`}
            >
              <div className="text-2xl">{c.flag}</div>
              <div>
                <h4 className="font-extrabold text-xs tracking-tight">{c.name}</h4>
                <p className={`text-[10px] mt-0.5 line-clamp-2 ${isSelected ? 'text-white/80' : 'text-deep-muted'}`}>
                  {c.desc}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Recipe Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-extrabold text-forest">
            {selectedCuisine} Dishes ({filtered.length})
          </h3>
          <span className="text-xs text-deep-muted font-semibold">
            Real global recipes using home pantry staples
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filtered.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              isSaved={savedRecipeIds.includes(recipe.id)}
              onToggleSave={onToggleSave}
              onSelectRecipe={(r) => {
                onSelectRecipe(r);
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
