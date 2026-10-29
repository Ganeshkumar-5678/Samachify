import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  ChefHat,
  Check,
  Heart,
  Leaf,
  Calendar,
  Utensils,
  ArrowRight,
  Flame,
  Award,
  ShieldCheck,
  AlertCircle,
  RotateCcw,
} from 'lucide-react';
import { IngredientEntryHero } from '../components/IngredientEntryHero';
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
  recipes,
  onSelectRecipe,
  onStartCooking,
  savedRecipeIds,
  onToggleSave,
  userIngredients,
  onUserIngredientsChange,
  pantryStaples,
  onPantryStaplesChange,
  equipment,
  onEquipmentChange,
}) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [homeError, setHomeError] = useState<string | null>(null);
  const [inlineRecommendations, setInlineRecommendations] = useState<RecipeRecommendation[]>([]);

  const handleFindRecipes = async () => {
    if (userIngredients.length === 0) return;

    setIsLoading(true);
    setHomeError(null);
    try {
      const response = await api.recommendRecipes({
        ingredients: userIngredients.map((i) => ({
          name: i.name,
          quantity: i.quantity,
          unit: i.unit,
          state: i.state,
        })),
        pantryStaples,
        equipment,
      });

      if (response.recommendations && response.recommendations.length > 0) {
        setInlineRecommendations(response.recommendations);
        // Also smoothly scroll to results
        setTimeout(() => {
          const el = document.getElementById('discovery-results');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } else {
        navigate(`/recipes?q=${encodeURIComponent(userIngredients.map((i) => i.name).join(','))}`);
      }
    } catch (err: any) {
      console.error('Error fetching recipes:', err);
      setHomeError(err?.message || 'Could not connect to the recipe server. Please ensure the backend is running.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFDF5]">
      {/* 1. Core Ingredient Entry Hero Component */}
      <IngredientEntryHero
        ingredients={userIngredients}
        onIngredientsChange={onUserIngredientsChange}
        pantryStaples={pantryStaples}
        onPantryStaplesChange={onPantryStaplesChange}
        equipment={equipment}
        onEquipmentChange={onEquipmentChange}
        onFindRecipes={handleFindRecipes}
        isLoading={isLoading}
      />

      {/* Error state with retry action */}
      {homeError && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 mt-6">
          <div className="p-5 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 text-amber-600" />
              <div>
                <strong className="font-bold">Error finding recipes: </strong>
                <span>{homeError}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleFindRecipes}
              className="px-4 py-2 rounded-xl bg-[#CA8A04] hover:bg-[#854D0E] text-white font-bold text-xs transition-colors shrink-0 self-start sm:self-auto flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retry Search</span>
            </button>
          </div>
        </div>
      )}

      {/* 2. Inline Instant Recipe Discovery Results (if generated) */}
      {inlineRecommendations.length > 0 && (
        <section id="discovery-results" className="py-14 bg-white border-b border-[#FDE68A]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#CA8A04] flex items-center gap-1.5 mb-1">
                  <Sparkles className="w-4 h-4 text-[#D97706]" />
                  Curated Culinary Matches
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#361E04] font-serif">
                  Your Ingredients. Your Next Delicious Meal.
                </h2>
              </div>

              <button
                type="button"
                onClick={() => navigate('/recipes')}
                className="self-start sm:self-auto px-4 py-2 rounded-xl bg-[#CA8A04] text-white text-xs font-bold hover:bg-[#854D0E] transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <span>View Full Filterable Catalog</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {inlineRecommendations.slice(0, 6).map((rec) => (
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
          </div>
        </section>
      )}

      {/* 3. Appetizing Food Showcase: What You Can Cook Right Now */}
      <section className="py-14 bg-[#FFFDF5] border-b border-[#FDE68A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FEF3C7] border border-[#FDE68A] text-[#854D0E] text-xs font-bold uppercase tracking-wider mb-2">
                <Flame className="w-3.5 h-3.5 text-[#D97706]" />
                Flavors of South India
              </div>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-[#361E04] font-serif">
                Popular Dishes You Can Cook at Home
              </h2>
              <p className="mt-2 text-sm text-[#785E3A] max-w-xl">
                Click any dish to automatically load its pantry ingredients and let SAMACHIFY guide you through every step.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start md:self-auto">
              <span className="text-xs font-semibold text-[#854D0E] flex items-center gap-1">
                <ChefHat className="w-4 h-4 text-[#CA8A04]" /> Verified Homestyle Recipes
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Dish 1: Thakkali Sadam */}
            <div className="group bg-white rounded-3xl overflow-hidden border border-[#FDE68A] shadow-sm hover:shadow-xl hover:border-[#CA8A04] transition-all duration-300 flex flex-col">
              <div className="relative h-48 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&w=600&q=80"
                  alt="Thakkali Sadam (Tomato Rice)"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-[#361E04]/85 backdrop-blur-xs text-white text-[11px] font-bold">
                  ⏱️ 15 Mins
                </span>
                <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-[#FACC15] text-[#361E04] text-[11px] font-black">
                  Tamil Favorite
                </span>
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-extrabold text-base text-[#361E04] group-hover:text-[#CA8A04] transition-colors">
                    Thakkali Sadam (Tomato Rice)
                  </h3>
                  <p className="text-xs text-[#785E3A] mt-1 line-clamp-2">
                    Tangy, spiced Tamil Nadu lunchbox favorite made with country tomatoes, onions, and crisp tempering.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-1">
                    <span className="text-[10px] bg-[#FFFDF5] px-2 py-0.5 rounded-md border border-[#FDE68A] text-[#854D0E] font-medium">🍚 Rice</span>
                    <span className="text-[10px] bg-[#FFFDF5] px-2 py-0.5 rounded-md border border-[#FDE68A] text-[#854D0E] font-medium">🍅 Tomato</span>
                    <span className="text-[10px] bg-[#FFFDF5] px-2 py-0.5 rounded-md border border-[#FDE68A] text-[#854D0E] font-medium">🧅 Onion</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onUserIngredientsChange([
                      { name: 'Rice', state: 'raw' },
                      { name: 'Tomato', state: 'raw' },
                      { name: 'Onion', state: 'raw' },
                      { name: 'Green Chilli', state: 'raw' },
                    ]);
                    handleFindRecipes();
                  }}
                  className="mt-4 w-full py-2.5 px-3 rounded-xl bg-[#CA8A04] hover:bg-[#854D0E] text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#FEF08A]" />
                  <span>Load & Cook This</span>
                </button>
              </div>
            </div>

            {/* Dish 2: Crispy Masala Dosa */}
            <div className="group bg-white rounded-3xl overflow-hidden border border-[#FDE68A] shadow-sm hover:shadow-xl hover:border-[#CA8A04] transition-all duration-300 flex flex-col">
              <div className="relative h-48 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=600&q=80"
                  alt="Crispy Masala Dosa"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-[#361E04]/85 backdrop-blur-xs text-white text-[11px] font-bold">
                  ⏱️ 20 Mins
                </span>
                <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-[#CA8A04] text-white text-[11px] font-bold">
                  Breakfast Classic
                </span>
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-extrabold text-base text-[#361E04] group-hover:text-[#CA8A04] transition-colors">
                    Crispy Golden Masala Dosa
                  </h3>
                  <p className="text-xs text-[#785E3A] mt-1 line-clamp-2">
                    Golden fermented rice-lentil crepe stuffed with aromatic spiced potato masala and fresh ginger.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-1">
                    <span className="text-[10px] bg-[#FFFDF5] px-2 py-0.5 rounded-md border border-[#FDE68A] text-[#854D0E] font-medium">🥔 Potato</span>
                    <span className="text-[10px] bg-[#FFFDF5] px-2 py-0.5 rounded-md border border-[#FDE68A] text-[#854D0E] font-medium">🧅 Onion</span>
                    <span className="text-[10px] bg-[#FFFDF5] px-2 py-0.5 rounded-md border border-[#FDE68A] text-[#854D0E] font-medium">🌾 Rice Batter</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onUserIngredientsChange([
                      { name: 'Potato', state: 'cooked' },
                      { name: 'Onion', state: 'raw' },
                      { name: 'Green Chilli', state: 'raw' },
                      { name: 'Rice', state: 'raw' },
                    ]);
                    handleFindRecipes();
                  }}
                  className="mt-4 w-full py-2.5 px-3 rounded-xl bg-[#CA8A04] hover:bg-[#854D0E] text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#FEF08A]" />
                  <span>Load & Cook This</span>
                </button>
              </div>
            </div>

            {/* Dish 3: Authentic Sambar */}
            <div className="group bg-white rounded-3xl overflow-hidden border border-[#FDE68A] shadow-sm hover:shadow-xl hover:border-[#CA8A04] transition-all duration-300 flex flex-col">
              <div className="relative h-48 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80"
                  alt="Traditional Sambar"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-[#361E04]/85 backdrop-blur-xs text-white text-[11px] font-bold">
                  ⏱️ 25 Mins
                </span>
                <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-[#D97706] text-white text-[11px] font-bold">
                  Homestyle Sambar
                </span>
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-extrabold text-base text-[#361E04] group-hover:text-[#CA8A04] transition-colors">
                    Authentic Tamil Sambar
                  </h3>
                  <p className="text-xs text-[#785E3A] mt-1 line-clamp-2">
                    Protein-rich yellow toor dal simmered with country vegetables, tangy tamarind, and freshly roasted spice podi.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-1">
                    <span className="text-[10px] bg-[#FFFDF5] px-2 py-0.5 rounded-md border border-[#FDE68A] text-[#854D0E] font-medium">🥣 Toor Dal</span>
                    <span className="text-[10px] bg-[#FFFDF5] px-2 py-0.5 rounded-md border border-[#FDE68A] text-[#854D0E] font-medium">🍅 Tomato</span>
                    <span className="text-[10px] bg-[#FFFDF5] px-2 py-0.5 rounded-md border border-[#FDE68A] text-[#854D0E] font-medium">🧅 Onion</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onUserIngredientsChange([
                      { name: 'Toor Dal', state: 'raw' },
                      { name: 'Tomato', state: 'raw' },
                      { name: 'Onion', state: 'raw' },
                      { name: 'Curry Leaves', state: 'raw' },
                    ]);
                    handleFindRecipes();
                  }}
                  className="mt-4 w-full py-2.5 px-3 rounded-xl bg-[#CA8A04] hover:bg-[#854D0E] text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#FEF08A]" />
                  <span>Load & Cook This</span>
                </button>
              </div>
            </div>

            {/* Dish 4: Ven Pongal */}
            <div className="group bg-white rounded-3xl overflow-hidden border border-[#FDE68A] shadow-sm hover:shadow-xl hover:border-[#CA8A04] transition-all duration-300 flex flex-col">
              <div className="relative h-48 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=600&q=80"
                  alt="Traditional Ghee Ven Pongal"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-[#361E04]/85 backdrop-blur-xs text-white text-[11px] font-bold">
                  ⏱️ 20 Mins
                </span>
                <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-[#FACC15] text-[#361E04] text-[11px] font-black">
                  Comfort Food
                </span>
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-extrabold text-base text-[#361E04] group-hover:text-[#CA8A04] transition-colors">
                    Ghee Ven Pongal
                  </h3>
                  <p className="text-xs text-[#785E3A] mt-1 line-clamp-2">
                    Melt-in-mouth rice and yellow lentils tempered in golden ghee with crushed black pepper, ginger, and curry leaves.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-1">
                    <span className="text-[10px] bg-[#FFFDF5] px-2 py-0.5 rounded-md border border-[#FDE68A] text-[#854D0E] font-medium">🍚 Rice</span>
                    <span className="text-[10px] bg-[#FFFDF5] px-2 py-0.5 rounded-md border border-[#FDE68A] text-[#854D0E] font-medium">🥣 Moong Dal</span>
                    <span className="text-[10px] bg-[#FFFDF5] px-2 py-0.5 rounded-md border border-[#FDE68A] text-[#854D0E] font-medium">🧈 Ghee</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onUserIngredientsChange([
                      { name: 'Rice', state: 'raw' },
                      { name: 'Moong Dal', state: 'raw' },
                      { name: 'Ginger', state: 'raw' },
                      { name: 'Curry Leaves', state: 'raw' },
                    ]);
                    handleFindRecipes();
                  }}
                  className="mt-4 w-full py-2.5 px-3 rounded-xl bg-[#CA8A04] hover:bg-[#854D0E] text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#FEF08A]" />
                  <span>Load & Cook This</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Editorial Spotlight: Tamil Nadu Specialization Banner with Rich Food Imagery in Mustard Theme */}
      <section className="py-16 bg-[#FEFCE8] border-b border-[#FDE68A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-[#854D0E] via-[#A16207] to-[#713F12] rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden shadow-xl">
            <div className="absolute right-0 top-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-[#FACC15]/20 blur-2xl pointer-events-none" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
              <div className="lg:col-span-7">
                <span className="px-3.5 py-1 rounded-full bg-[#FACC15] text-[#361E04] text-xs font-black uppercase tracking-wider mb-4 inline-block shadow-xs">
                  Regional Specialization
                </span>
                <h2 className="text-2xl sm:text-4xl font-extrabold font-serif leading-tight">
                  Traditional Tamil Nadu Cooking Meets Modern AI Precision.
                </h2>
                <p className="mt-3 text-sm sm:text-base text-amber-100 leading-relaxed">
                  From fragrant Thakkali Sadam and hot pepper Ven Pongal to authentic Thalippu tempering techniques. Full transliteration support for <em>Arisi, Vengayam, Thakkali, Milagai</em>, and more.
                </p>

                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      onUserIngredientsChange([
                        { name: 'Rice', state: 'raw' },
                        { name: 'Tomato', state: 'raw' },
                        { name: 'Onion', state: 'raw' },
                      ]);
                      handleFindRecipes();
                    }}
                    className="px-5 py-3 rounded-2xl bg-[#FACC15] hover:bg-yellow-300 text-[#361E04] font-extrabold text-sm transition-all shadow-md flex items-center gap-2"
                  >
                    <Sparkles className="w-4 h-4 text-[#854D0E]" />
                    <span>Try Tamil Quick Combo (Rice + Tomato + Onion)</span>
                  </button>
                </div>
              </div>

              {/* Food Visual Collage in Banner - purely delicious food photography */}
              <div className="lg:col-span-5 grid grid-cols-2 gap-3.5">
                <div className="space-y-3.5">
                  <div className="rounded-2xl overflow-hidden shadow-lg border border-white/20 aspect-4/3">
                    <img
                      src="https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&w=400&q=80"
                      alt="Thakkali Sadam"
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="rounded-2xl overflow-hidden shadow-lg border border-white/20 aspect-square">
                    <img
                      src="https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=400&q=80"
                      alt="Traditional Sambar"
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                </div>
                <div className="space-y-3.5 pt-4">
                  <div className="rounded-2xl overflow-hidden shadow-lg border border-white/20 aspect-square">
                    <img
                      src="https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=400&q=80"
                      alt="Golden Masala Dosa"
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="rounded-2xl overflow-hidden shadow-lg border border-white/20 aspect-4/3">
                    <img
                      src="https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?auto=format&fit=crop&w=400&q=80"
                      alt="Tangy Lemon Rice"
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Feature Highlights in Mustard Yellow */}
      <section className="py-16 bg-[#FFFDF5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#361E04] font-serif">
              Built for Real Home Cooks
            </h2>
            <p className="mt-2 text-sm text-[#785E3A]">
              Zero fake recipes, zero mandatory signups, honest ingredient matching.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-3xl bg-white border-2 border-[#FDE68A] shadow-sm space-y-3 hover:border-[#CA8A04] transition-all">
              <div className="w-12 h-12 rounded-2xl bg-[#CA8A04] text-white flex items-center justify-center font-bold shadow-xs">
                <Check className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-extrabold text-lg text-[#361E04]">Cook Without Shopping</h3>
              <p className="text-xs text-[#785E3A] leading-relaxed">
                Prioritizes meals that strictly use only what you already own. Never invents surprise ingredients as if you had them.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white border-2 border-[#FDE68A] shadow-sm space-y-3 hover:border-[#CA8A04] transition-all">
              <div className="w-12 h-12 rounded-2xl bg-[#D97706] text-white flex items-center justify-center font-bold shadow-xs">
                <Flame className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-extrabold text-lg text-[#361E04]">Visual Interactive Cooking</h3>
              <p className="text-xs text-[#785E3A] leading-relaxed">
                Full-screen distraction-free companion mode with visual technique cards, sensory doneness cues, and elapsed countdown timers.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white border-2 border-[#FDE68A] shadow-sm space-y-3 hover:border-[#CA8A04] transition-all">
              <div className="w-12 h-12 rounded-2xl bg-[#854D0E] text-white flex items-center justify-center font-bold shadow-xs">
                <Sparkles className="w-6 h-6 text-[#FACC15]" />
              </div>
              <h3 className="font-extrabold text-lg text-[#361E04]">High-Performance Groq AI</h3>
              <p className="text-xs text-[#785E3A] leading-relaxed">
                Powered by Llama 3.3 on Groq with transparent fallback to our rich Tamil Nadu and world cuisine library when offline.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
