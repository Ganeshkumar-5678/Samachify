import {
  UserIngredient,
  Recipe,
  RecipeRecommendation,
  SavedRecipeRecord,
  CookingSession,
  MealPlan,
  PantryItem,
} from '../types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

export interface RecommendPayload {
  ingredients: {
    name: string;
    quantity?: number;
    unit?: string;
    state?: 'raw' | 'cooked' | 'frozen' | 'leftover';
    notes?: string;
  }[];
  pantryStaples?: string[];
  equipment?: string[];
  preferences?: {
    dietary?: string[];
    cuisine?: string[];
    mealType?: string[];
    maxTimeMinutes?: number;
    mustHaveIngredients?: string[];
    excludeIngredients?: string[];
    cookWithoutBuyingOnly?: boolean;
    servings?: number;
  };
}

export const api = {
  async getStatus() {
    try {
      const res = await fetch(`${API_BASE}/status`);
      return await res.json();
    } catch {
      return {
        status: 'offline',
        service: 'SAMACHIFY (Standalone Client Mode)',
        groqConfigured: false,
      };
    }
  },

  async searchIngredients(query: string) {
    try {
      const res = await fetch(`${API_BASE}/ingredients/normalize?query=${encodeURIComponent(query)}`);
      if (!res.ok) return [];
      const data = await res.json();
      return data.suggestions || [];
    } catch (e) {
      console.warn('Failed to search ingredients from API:', e);
      return [];
    }
  },

  async recommendRecipes(payload: RecommendPayload): Promise<{
    success: boolean;
    recommendations: RecipeRecommendation[];
    metadata: {
      totalEvaluated: number;
      totalReturned: number;
      groqUsed: boolean;
      groqConfigured: boolean;
      cookWithoutBuyingCount: number;
    };
  }> {
    const res = await fetch(`${API_BASE}/recipes/recommend`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to fetch recommendations');
    }

    return await res.json();
  },

  async getRecipe(id: string): Promise<Recipe> {
    const res = await fetch(`${API_BASE}/recipes/${id}`);
    if (!res.ok) throw new Error(`Recipe ${id} not found`);
    const data = await res.json();
    return data.recipe;
  },

  async saveRecipe(recipe: Partial<SavedRecipeRecord> & { recipeId: string; recipeTitle: string; cuisine: string; imageUrl: string; prepTimeMinutes: number; cookTimeMinutes: number; difficulty: string }) {
    const res = await fetch(`${API_BASE}/recipes/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(recipe),
    });
    return await res.json();
  },

  async getSavedRecipes(userId = 'guest_user'): Promise<SavedRecipeRecord[]> {
    try {
      const res = await fetch(`${API_BASE}/recipes/saved?userId=${userId}`);
      if (!res.ok) return [];
      const data = await res.json();
      return data.savedRecipes || [];
    } catch {
      return [];
    }
  },

  async updateCookingSession(session: {
    recipeId: string;
    currentStep: number;
    completedSteps: number[];
    isComplete?: boolean;
  }): Promise<{ success: boolean; session: CookingSession }> {
    const res = await fetch(`${API_BASE}/cooking/session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(session),
    });
    return await res.json();
  },

  async getCookingSession(sessionId: string): Promise<CookingSession> {
    const res = await fetch(`${API_BASE}/cooking/session/${sessionId}`);
    const data = await res.json();
    return data.session;
  },

  async getAllRecipes(): Promise<Recipe[]> {
    try {
      const res = await fetch(`${API_BASE}/recipes`);
      if (res.ok) {
        const data = await res.json();
        if (data.recipes && Array.isArray(data.recipes)) {
          return data.recipes;
        }
      }
    } catch (e) {
      console.warn('Could not fetch all recipes from API:', e);
    }
    return [];
  },

  // Meal Plan API with robust local storage & server synchronization
  async getMealPlan(): Promise<MealPlan> {
    try {
      const res = await fetch(`${API_BASE}/mealplan`);
      if (res.ok) {
        const data = await res.json();
        if (data.mealPlan && data.mealPlan.days && data.mealPlan.days.length > 0) {
          localStorage.setItem('samachify_meal_plan', JSON.stringify(data.mealPlan));
          return data.mealPlan;
        }
      }
    } catch (e) {
      console.warn('Could not fetch meal plan from API, checking local storage:', e);
    }

    const saved = localStorage.getItem('samachify_meal_plan');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.days && parsed.days.length > 0) return parsed;
      } catch (err) {
        // ignore parse error
      }
    }

    // Default 7-day meal plan fallback with authentic recipes
    return {
      id: 'family-plan-week',
      title: 'Weekly Meal Plan',
      week_range: 'This Week',
      days: [
        {
          day: 'Mon',
          date_str: 'Day 1',
          breakfast: {
            recipe_id: 'ven-pongal',
            recipe_title: 'Traditional Ven Pongal',
            cuisine: 'Tamil Nadu',
            cook_time_minutes: 20,
            difficulty: 'Easy',
            image_url: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=400&q=80',
            servings: 2,
          },
          lunch: {
            recipe_id: 'thakkali-sadam',
            recipe_title: 'South Indian Tomato Rice',
            cuisine: 'Tamil Nadu',
            cook_time_minutes: 25,
            difficulty: 'Easy',
            image_url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=400&q=80',
            servings: 2,
          },
          dinner: {
            recipe_id: 'potato-curry',
            recipe_title: 'Potato Curry',
            cuisine: 'South Indian',
            cook_time_minutes: 30,
            difficulty: 'Medium',
            image_url: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=400&q=80',
            servings: 2,
          },
        },
        {
          day: 'Tue',
          date_str: 'Day 2',
          breakfast: {
            recipe_id: 'onion-tomato-omelette',
            recipe_title: 'Onion Tomato Omelette',
            cuisine: 'Indian',
            cook_time_minutes: 10,
            difficulty: 'Easy',
            image_url: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=400&q=80',
            servings: 1,
          },
          lunch: {
            recipe_id: 'lemon-rice',
            recipe_title: 'Tangy Lemon Rice',
            cuisine: 'Tamil Nadu',
            cook_time_minutes: 15,
            difficulty: 'Easy',
            image_url: 'https://images.unsplash.com/photo-1633964913295-ceb43826e7c9?auto=format&fit=crop&w=400&q=80',
            servings: 2,
          },
          dinner: {
            recipe_id: 'veg-fried-rice',
            recipe_title: 'Veg Fried Rice',
            cuisine: 'Indo-Chinese',
            cook_time_minutes: 20,
            difficulty: 'Easy',
            image_url: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=400&q=80',
            servings: 2,
          },
        },
        {
          day: 'Wed',
          date_str: 'Day 3',
          breakfast: {
            recipe_id: 'medu-vadai',
            recipe_title: 'Crispy Medu Vadai',
            cuisine: 'Tamil Nadu',
            cook_time_minutes: 20,
            difficulty: 'Medium',
            image_url: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=400&q=80',
            servings: 2,
          },
          lunch: {
            recipe_id: 'tamil-sambar',
            recipe_title: 'Authentic Tamil Nadu Sambar',
            cuisine: 'Tamil Nadu',
            cook_time_minutes: 30,
            difficulty: 'Medium',
            image_url: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=400&q=80',
            servings: 2,
          },
          dinner: {
            recipe_id: 'tomato-egg-curry',
            recipe_title: 'Tomato Egg Curry',
            cuisine: 'South Indian',
            cook_time_minutes: 25,
            difficulty: 'Medium',
            image_url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=400&q=80',
            servings: 2,
          },
        },
        {
          day: 'Thu',
          date_str: 'Day 4',
          breakfast: {
            recipe_id: 'ven-pongal',
            recipe_title: 'Traditional Ven Pongal',
            cuisine: 'Tamil Nadu',
            cook_time_minutes: 20,
            difficulty: 'Easy',
            image_url: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=400&q=80',
            servings: 2,
          },
          lunch: {
            recipe_id: 'veg-fried-rice',
            recipe_title: 'Veg Fried Rice',
            cuisine: 'Indo-Chinese',
            cook_time_minutes: 20,
            difficulty: 'Easy',
            image_url: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=400&q=80',
            servings: 2,
          },
          dinner: {
            recipe_id: 'potato-curry',
            recipe_title: 'Potato Curry',
            cuisine: 'South Indian',
            cook_time_minutes: 30,
            difficulty: 'Medium',
            image_url: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=400&q=80',
            servings: 2,
          },
        },
        {
          day: 'Fri',
          date_str: 'Day 5',
          breakfast: {
            recipe_id: 'onion-tomato-omelette',
            recipe_title: 'Onion Tomato Omelette',
            cuisine: 'Indian',
            cook_time_minutes: 10,
            difficulty: 'Easy',
            image_url: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=400&q=80',
            servings: 1,
          },
          lunch: {
            recipe_id: 'thakkali-sadam',
            recipe_title: 'South Indian Tomato Rice',
            cuisine: 'Tamil Nadu',
            cook_time_minutes: 25,
            difficulty: 'Easy',
            image_url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=400&q=80',
            servings: 2,
          },
          dinner: {
            recipe_id: 'garlic-tomato-pasta',
            recipe_title: 'Classic Garlic & Tomato Penne',
            cuisine: 'Italian',
            cook_time_minutes: 20,
            difficulty: 'Easy',
            image_url: 'https://images.unsplash.com/photo-1621996346565-e3d5d6281072?auto=format&fit=crop&w=400&q=80',
            servings: 2,
          },
        },
        {
          day: 'Sat',
          date_str: 'Day 6',
          breakfast: {
            recipe_id: 'medu-vadai',
            recipe_title: 'Crispy Medu Vadai',
            cuisine: 'Tamil Nadu',
            cook_time_minutes: 20,
            difficulty: 'Medium',
            image_url: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=400&q=80',
            servings: 2,
          },
          lunch: {
            recipe_id: 'tamil-sambar',
            recipe_title: 'Authentic Tamil Nadu Sambar',
            cuisine: 'Tamil Nadu',
            cook_time_minutes: 30,
            difficulty: 'Medium',
            image_url: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=400&q=80',
            servings: 2,
          },
          dinner: {
            recipe_id: 'tomato-egg-curry',
            recipe_title: 'Tomato Egg Curry',
            cuisine: 'South Indian',
            cook_time_minutes: 25,
            difficulty: 'Medium',
            image_url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=400&q=80',
            servings: 2,
          },
        },
        {
          day: 'Sun',
          date_str: 'Day 7',
          breakfast: {
            recipe_id: 'ven-pongal',
            recipe_title: 'Traditional Ven Pongal',
            cuisine: 'Tamil Nadu',
            cook_time_minutes: 20,
            difficulty: 'Easy',
            image_url: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=400&q=80',
            servings: 2,
          },
          lunch: {
            recipe_id: 'veg-fried-rice',
            recipe_title: 'Veg Fried Rice',
            cuisine: 'Indo-Chinese',
            cook_time_minutes: 20,
            difficulty: 'Easy',
            image_url: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=400&q=80',
            servings: 2,
          },
          dinner: {
            recipe_id: 'potato-curry',
            recipe_title: 'Potato Curry',
            cuisine: 'South Indian',
            cook_time_minutes: 30,
            difficulty: 'Medium',
            image_url: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=400&q=80',
            servings: 2,
          },
        },
      ],
    };
  },

  async updateMealPlan(plan: MealPlan): Promise<MealPlan> {
    localStorage.setItem('samachify_meal_plan', JSON.stringify(plan));
    try {
      await fetch(`${API_BASE}/mealplan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mealPlan: plan }),
      });
    } catch (e) {
      console.warn('Failed to save meal plan to API:', e);
    }
    return plan;
  },

  async generateGroceryList(plan: MealPlan): Promise<{ items: any[]; total_estimated_cost_inr: number }> {
    try {
      const res = await fetch(`${API_BASE}/mealplan/grocery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mealPlan: plan }),
      });
      if (res.ok) {
        const data = await res.json();
        return {
          items: data.items || [],
          total_estimated_cost_inr: data.total_estimated_cost_inr || 0,
        };
      }
    } catch (e) {
      console.warn('Could not generate grocery list from API, computing locally:', e);
    }

    // Local fallback computation
    const defaultGroceries = [
      { id: 'g-1', name: 'Rice', quantity: 1000, unit: 'g', estimated_cost_inr: 60, category: 'Grains', checked: false },
      { id: 'g-2', name: 'Tomatoes', quantity: 800, unit: 'g', estimated_cost_inr: 35, category: 'Vegetables', checked: false },
      { id: 'g-3', name: 'Onions', quantity: 600, unit: 'g', estimated_cost_inr: 30, category: 'Vegetables', checked: false },
      { id: 'g-4', name: 'Potatoes', quantity: 500, unit: 'g', estimated_cost_inr: 25, category: 'Vegetables', checked: false },
      { id: 'g-5', name: 'Eggs', quantity: 6, unit: 'pieces', estimated_cost_inr: 42, category: 'Dairy & Eggs', checked: false },
      { id: 'g-6', name: 'Cooking Oil', quantity: 500, unit: 'ml', estimated_cost_inr: 65, category: 'Pantry Staples', checked: false },
      { id: 'g-7', name: 'Garlic & Ginger', quantity: 100, unit: 'g', estimated_cost_inr: 20, category: 'Aromatics', checked: false },
      { id: 'g-8', name: 'Toor Dal / Moong Dal', quantity: 300, unit: 'g', estimated_cost_inr: 45, category: 'Pulses', checked: false },
    ];
    const totalCost = defaultGroceries.reduce((sum, item) => sum + item.estimated_cost_inr, 0);
    return { items: defaultGroceries, total_estimated_cost_inr: totalCost };
  },

  async getPantry(): Promise<PantryItem[]> {
    const saved = localStorage.getItem('samachify_pantry');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    const defaultPantry: PantryItem[] = [
      { id: 'p1', name: 'Rice', category: 'Grains', quantity: 2000, unit: 'g', state: 'dried', purchase_date: '2026-10-15', expiry_date: '2027-04-15', days_to_expiry: 169, is_expiring_soon: false },
      { id: 'p2', name: 'Eggs', category: 'Dairy & Eggs', quantity: 12, unit: 'pieces', state: 'fresh', purchase_date: '2026-10-24', expiry_date: '2026-11-25', days_to_expiry: 8, is_expiring_soon: true },
      { id: 'p3', name: 'Tomatoes', category: 'Vegetables', quantity: 500, unit: 'g', state: 'fresh', purchase_date: '2026-10-25', expiry_date: '2026-11-22', days_to_expiry: 5, is_expiring_soon: true },
      { id: 'p4', name: 'Onions', category: 'Vegetables', quantity: 1000, unit: 'g', state: 'fresh', purchase_date: '2026-10-20', expiry_date: '2026-12-15', days_to_expiry: 28, is_expiring_soon: false },
      { id: 'p5', name: 'Garlic', category: 'Vegetables', quantity: 100, unit: 'g', state: 'fresh', purchase_date: '2026-10-18', expiry_date: '2026-12-20', days_to_expiry: 33, is_expiring_soon: false },
      { id: 'p6', name: 'Cooking Oil', category: 'Oils', quantity: 1000, unit: 'ml', state: 'canned', purchase_date: '2026-10-01', expiry_date: '2027-03-01', days_to_expiry: 124, is_expiring_soon: false },
      { id: 'p7', name: 'Chili Powder', category: 'Spices', quantity: 200, unit: 'g', state: 'dried', purchase_date: '2026-09-10', expiry_date: '2027-09-10', days_to_expiry: 317, is_expiring_soon: false },
    ];
    localStorage.setItem('samachify_pantry', JSON.stringify(defaultPantry));
    return defaultPantry;
  },

  async updatePantry(items: PantryItem[]): Promise<PantryItem[]> {
    localStorage.setItem('samachify_pantry', JSON.stringify(items));
    return items;
  },

  async rescueLeftovers(payload: any): Promise<any> {
    return {
      storage_safety_evaluation: 'Safe to consume if refrigerated.',
      safe_reheating_steps: ['Reheat until piping hot above 75°C.'],
    };
  },
};

