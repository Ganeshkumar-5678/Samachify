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

  // Backwards compatibility helpers
  async getMealPlan(): Promise<MealPlan> {
    return {
      id: 'local-plan',
      title: 'Weekly Meal Plan',
      week_range: 'This Week',
      days: [],
    };
  },

  async updateMealPlan(plan: MealPlan): Promise<MealPlan> {
    return plan;
  },

  async generateGroceryList(plan: MealPlan): Promise<{ items: any[]; total_estimated_cost_inr: number }> {
    return { items: [], total_estimated_cost_inr: 0 };
  },

  async getPantry(): Promise<PantryItem[]> {
    return [];
  },

  async updatePantry(items: PantryItem[]): Promise<PantryItem[]> {
    return items;
  },

  async rescueLeftovers(payload: any): Promise<any> {
    return {
      storage_safety_evaluation: 'Safe to consume if refrigerated.',
      safe_reheating_steps: ['Reheat until piping hot above 75°C.'],
    };
  },
};

