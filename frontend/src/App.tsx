import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { RecipeDetailModal } from './components/RecipeDetailModal';
import { InteractiveCookingScreen } from './components/InteractiveCookingScreen';
import { AuthModal } from './components/AuthModal';

import { Home } from './pages/Home';
import { Recipes } from './pages/Recipes';
import { MealPlanPage } from './pages/MealPlanPage';
import { LeftoverRescuePage } from './pages/LeftoverRescuePage';
import { PantryPage } from './pages/PantryPage';
import { CuisinesPage } from './pages/CuisinesPage';
import { SavedRecipesPage } from './pages/SavedRecipesPage';

import { Recipe, UserIngredient, SavedRecipeRecord } from './types';
import { api } from './services/api';

const DEFAULT_INGREDIENTS: UserIngredient[] = [
  { name: 'Rice', state: 'raw' },
  { name: 'Tomato', state: 'raw' },
  { name: 'Onion', state: 'raw' },
];

const DEFAULT_STAPLES = [
  'Cooking Oil',
  'Mustard Seeds',
  'Salt',
  'Turmeric Powder',
  'Chilli Powder',
  'Cumin Seeds',
];

const DEFAULT_EQUIPMENT = [
  'Kadaai / Wok',
  'Pressure Cooker',
];

export function AppContent() {
  const navigate = useNavigate();

  // Kitchen State preserved across navigation
  const [userIngredients, setUserIngredients] = useState<UserIngredient[]>(DEFAULT_INGREDIENTS);
  const [pantryStaples, setPantryStaples] = useState<string[]>(DEFAULT_STAPLES);
  const [equipment, setEquipment] = useState<string[]>(DEFAULT_EQUIPMENT);

  // Selected recipe for detail modal
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  // Active cooking companion mode recipe
  const [cookingRecipe, setCookingRecipe] = useState<Recipe | null>(null);

  // Saved recipes state
  const [savedRecipeIds, setSavedRecipeIds] = useState<string[]>([]);
  const [savedRecords, setSavedRecords] = useState<SavedRecipeRecord[]>([]);

  // Auth modal
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [user, setUser] = useState<{ name: string; isGuest: boolean } | null>({
    name: 'Home Chef',
    isGuest: true,
  });

  // Load saved recipes on mount
  useEffect(() => {
    const loadSaved = async () => {
      try {
        const records = await api.getSavedRecipes();
        setSavedRecords(records);
        setSavedRecipeIds(records.map((r) => r.recipeId));
      } catch (err) {
        console.warn('Could not load saved recipes:', err);
      }
    };
    loadSaved();
  }, []);

  const handleToggleSave = async (recipeId: string) => {
    if (savedRecipeIds.includes(recipeId)) {
      setSavedRecipeIds((prev) => prev.filter((id) => id !== recipeId));
      setSavedRecords((prev) => prev.filter((r) => r.recipeId !== recipeId));
    } else {
      setSavedRecipeIds((prev) => [...prev, recipeId]);
      // If selected recipe matches, save to backend
      const target = selectedRecipe && selectedRecipe.id === recipeId ? selectedRecipe : cookingRecipe;
      if (target) {
        try {
          await api.saveRecipe({
            recipeId: target.id,
            recipeTitle: target.title,
            cuisine: target.cuisine,
            imageUrl: target.imageUrl || target.image_url || '',
            prepTimeMinutes: target.prepTimeMinutes || target.prep_time_minutes || 10,
            cookTimeMinutes: target.cookTimeMinutes || target.cook_time_minutes || 15,
            difficulty: target.difficulty,
          });
        } catch (err) {
          console.warn('Failed to save recipe record to API:', err);
        }
      }
    }
  };

  const handleStartCooking = (recipe: Recipe) => {
    setSelectedRecipe(null);
    setCookingRecipe(recipe);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#FAF7F0] text-[#242820]">
      {/* Global Navigation */}
      <Navbar
        onOpenAuth={() => setAuthModalOpen(true)}
        user={user}
        savedCount={savedRecipeIds.length}
      />

      {/* Main Routed Content */}
      <main className="flex-1">
        <Routes>
          <Route
            path="/"
            element={
              <Home
                recipes={[]}
                onSelectRecipe={setSelectedRecipe}
                onStartCooking={handleStartCooking}
                savedRecipeIds={savedRecipeIds}
                onToggleSave={handleToggleSave}
                userIngredients={userIngredients}
                onUserIngredientsChange={setUserIngredients}
                pantryStaples={pantryStaples}
                onPantryStaplesChange={setPantryStaples}
                equipment={equipment}
                onEquipmentChange={setEquipment}
              />
            }
          />
          <Route
            path="/recipes"
            element={
              <Recipes
                onSelectRecipe={setSelectedRecipe}
                onStartCooking={handleStartCooking}
                savedRecipeIds={savedRecipeIds}
                onToggleSave={handleToggleSave}
                initialIngredients={userIngredients}
              />
            }
          />
          <Route
            path="/meal-plan"
            element={
              <MealPlanPage
                allRecipes={[]}
                onSelectRecipe={setSelectedRecipe}
              />
            }
          />
          <Route
            path="/leftovers"
            element={
              <LeftoverRescuePage
                allRecipes={[]}
                onSelectRecipe={setSelectedRecipe}
                savedRecipeIds={savedRecipeIds}
                onToggleSave={handleToggleSave}
                onOpenPhotoModal={() => navigate('/recipes')}
              />
            }
          />
          <Route path="/pantry" element={<PantryPage />} />
          <Route
            path="/cuisines"
            element={
              <CuisinesPage
                allRecipes={[]}
                onSelectRecipe={setSelectedRecipe}
                savedRecipeIds={savedRecipeIds}
                onToggleSave={handleToggleSave}
              />
            }
          />
          <Route
            path="/saved"
            element={
              <SavedRecipesPage
                allRecipes={[]}
                savedRecipeIds={savedRecipeIds}
                onToggleSave={handleToggleSave}
                onSelectRecipe={setSelectedRecipe}
              />
            }
          />
        </Routes>
      </main>

      {/* Global Footer */}
      <Footer />

      {/* Recipe Detail Modal */}
      <RecipeDetailModal
        recipe={selectedRecipe}
        onClose={() => setSelectedRecipe(null)}
        isSaved={selectedRecipe ? savedRecipeIds.includes(selectedRecipe.id) : false}
        onToggleSave={handleToggleSave}
        onStartInteractiveCooking={handleStartCooking}
        userIngredients={userIngredients.map((i) => i.name)}
      />

      {/* Full-screen Visual Interactive Cooking Mode */}
      {cookingRecipe && (
        <InteractiveCookingScreen
          recipe={cookingRecipe}
          onClose={() => setCookingRecipe(null)}
          isSaved={savedRecipeIds.includes(cookingRecipe.id)}
          onSaveRecipe={() => handleToggleSave(cookingRecipe.id)}
        />
      )}

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        currentUser={user}
        onLogin={(u) => setUser(u)}
        onLogout={() => setUser(null)}
      />
    </div>
  );
}

export function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
