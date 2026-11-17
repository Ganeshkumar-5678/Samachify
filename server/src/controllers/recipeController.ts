import { Request, Response } from 'express';
import { RecommendRequestSchema, SaveRecipeRequestSchema, CookingSessionProgressSchema } from '../schemas/index.js';
import { CURATED_RECIPES } from '../data/curatedRecipes.js';
import { evaluateRecipe, rankRecommendations } from '../services/matchingService.js';
import { generateRecipeWithGroq, isGroqConfigured, getVerifiedGroqModel } from '../services/groqService.js';
import { normalizeIngredient, searchTamilIngredients } from '../utils/tamilNormalization.js';
import { CookingSession, Recipe, SavedRecipeRecord, UserIngredient } from '../types/index.js';

// In-memory stores for runtime persistence (compatible with SQLite/Postgres pluggability)
const savedRecipesStore: Map<string, SavedRecipeRecord> = new Map();
const cookingSessionsStore: Map<string, CookingSession> = new Map();
const dynamicRecipeCache: Map<string, Recipe> = new Map();

// Initialize dynamic recipe cache with curated recipes
CURATED_RECIPES.forEach((r) => dynamicRecipeCache.set(r.id, r));

/**
 * Health check & status
 */
export async function getStatus(req: Request, res: Response) {
  return res.json({
    status: 'ok',
    service: 'SAMACHIFY AI Recipe Engine',
    groqConfigured: isGroqConfigured(),
    groqModel: getVerifiedGroqModel(),
    curatedRecipeCount: CURATED_RECIPES.length,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Autocomplete and normalize ingredients (with Tamil transliterations)
 */
export async function normalizeIngredientsEndpoint(req: Request, res: Response) {
  try {
    const { query } = req.query;
    if (typeof query === 'string' && query.trim().length > 0) {
      const suggestions = searchTamilIngredients(query);
      return res.json({ suggestions });
    }

    const { items } = req.body;
    if (!Array.isArray(items)) {
      return res.status(400).json({ error: 'Expected items array' });
    }

    const normalized = items.map((item: string) => normalizeIngredient(item));
    return res.json({ normalized });
  } catch (error: any) {
    return res.status(500).json({ error: error?.message || 'Error normalizing ingredients' });
  }
}

/**
 * Recommend recipes based on manual ingredients, pantry staples, and equipment
 */
export async function recommendRecipes(req: Request, res: Response) {
  try {
    const parseResult = RecommendRequestSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: parseResult.error.issues,
      });
    }

    const { ingredients, pantryStaples, equipment, preferences } = parseResult.data;

    // Prepare normalized user ingredients
    const userIngredients: UserIngredient[] = ingredients.map((ing) => {
      const norm = normalizeIngredient(ing.name);
      return {
        name: ing.name.trim(),
        normalizedName: norm.normalized,
        quantity: ing.quantity,
        unit: ing.unit,
        state: ing.state,
        notes: ing.notes,
      };
    });

    const evaluatedList = CURATED_RECIPES.map((recipe) =>
      evaluateRecipe(recipe, userIngredients, pantryStaples)
    );

    let groqRecipeAdded = false;

    // If Groq is configured, attempt to generate a personalized recipe
    if (isGroqConfigured()) {
      try {
        const groqRecipe = await generateRecipeWithGroq(
          userIngredients,
          pantryStaples,
          equipment,
          preferences
        );
        if (groqRecipe) {
          dynamicRecipeCache.set(groqRecipe.id, groqRecipe);
          const evaluatedGroq = evaluateRecipe(groqRecipe, userIngredients, pantryStaples);
          evaluatedList.push(evaluatedGroq);
          groqRecipeAdded = true;
        }
      } catch (err) {
        console.warn('[Recommend] Groq recipe generation failed, continuing with curated:', err);
      }
    }

    // Rank and filter recommendations
    const ranked = rankRecommendations(evaluatedList, preferences);

    return res.json({
      success: true,
      recommendations: ranked,
      metadata: {
        totalEvaluated: evaluatedList.length,
        totalReturned: ranked.length,
        groqUsed: groqRecipeAdded,
        groqConfigured: isGroqConfigured(),
        cookWithoutBuyingCount: ranked.filter((r) => r.canCookWithoutBuyingAnything).length,
      },
    });
  } catch (error: any) {
    console.error('[Recommend] Internal error:', error);
    return res.status(500).json({ error: error?.message || 'Error generating recommendations' });
  }
}

/**
 * Get recipe by ID
 */
export async function getRecipeById(req: Request, res: Response) {
  const { id } = req.params;
  const recipe = dynamicRecipeCache.get(id);

  if (!recipe) {
    return res.status(404).json({ error: `Recipe with ID '${id}' not found` });
  }

  return res.json({ recipe });
}

/**
 * Save a recipe for guest user / current session
 */
export async function saveRecipe(req: Request, res: Response) {
  try {
    const parseResult = SaveRecipeRequestSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: 'Invalid save request', details: parseResult.error.issues });
    }

    const data = parseResult.data;
    const record: SavedRecipeRecord = {
      id: `save-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      ...data,
      savedAt: new Date().toISOString(),
    };

    savedRecipesStore.set(record.id, record);
    return res.json({ success: true, savedRecord: record });
  } catch (error: any) {
    return res.status(500).json({ error: error?.message || 'Failed to save recipe' });
  }
}

/**
 * Retrieve saved recipes
 */
export async function getSavedRecipes(req: Request, res: Response) {
  const userId = (req.query.userId as string) || 'guest_user';
  const list = Array.from(savedRecipesStore.values()).filter((r) => r.userId === userId);
  return res.json({ savedRecipes: list });
}

/**
 * Track cooking session progress (Step-by-step interactive mode)
 */
export async function updateCookingSession(req: Request, res: Response) {
  try {
    const parseResult = CookingSessionProgressSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: 'Invalid session update', details: parseResult.error.issues });
    }

    const { recipeId, currentStep, completedSteps, isComplete } = parseResult.data;
    const sessionId = (req.headers['x-session-id'] as string) || `session-${recipeId}`;

    const session: CookingSession = {
      id: sessionId,
      recipeId,
      currentStep,
      completedSteps,
      startedAt: cookingSessionsStore.get(sessionId)?.startedAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isComplete: !!isComplete,
    };

    cookingSessionsStore.set(sessionId, session);
    return res.json({ success: true, session });
  } catch (error: any) {
    return res.status(500).json({ error: error?.message || 'Failed to update cooking session' });
  }
}

/**
 * Get cooking session status
 */
export async function getCookingSession(req: Request, res: Response) {
  const { id } = req.params;
  const session = cookingSessionsStore.get(id);
  if (!session) {
    return res.status(404).json({ error: 'Cooking session not found' });
  }
  return res.json({ session });
}

/**
 * Get all available recipes
 */
export async function getAllRecipes(req: Request, res: Response) {
  const recipes = Array.from(dynamicRecipeCache.values());
  return res.json({ success: true, recipes, count: recipes.length });
}

// In-memory meal plan store
let currentMealPlan: any = {
  id: 'weekly-plan-1',
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

/**
 * Get Weekly Meal Plan
 */
export async function getMealPlan(req: Request, res: Response) {
  return res.json({ success: true, mealPlan: currentMealPlan });
}

/**
 * Update Weekly Meal Plan
 */
export async function updateMealPlan(req: Request, res: Response) {
  const { mealPlan } = req.body;
  if (mealPlan && Array.isArray(mealPlan.days)) {
    currentMealPlan = mealPlan;
    return res.json({ success: true, mealPlan: currentMealPlan });
  }
  return res.status(400).json({ error: 'Invalid meal plan structure' });
}

/**
 * Generate Grocery List from Meal Plan
 */
export async function generateGroceryList(req: Request, res: Response) {
  const plan = req.body.mealPlan || currentMealPlan;
  const groceryMap = new Map<string, { name: string; quantity: number; unit: string; estimated_cost_inr: number; category: string }>();

  if (plan && Array.isArray(plan.days)) {
    for (const day of plan.days) {
      const slots = [day.breakfast, day.lunch, day.dinner, day.snacks].filter(Boolean);
      for (const slot of slots) {
        const recipe = dynamicRecipeCache.get(slot.recipe_id);
        if (recipe && recipe.ingredients) {
          for (const ing of recipe.ingredients) {
            const key = ing.name.toLowerCase();
            const existing = groceryMap.get(key);
            const cost = ing.estimated_cost_inr || 15;
            if (existing) {
              existing.quantity += ing.quantity || 1;
              existing.estimated_cost_inr += cost;
            } else {
              groceryMap.set(key, {
                name: ing.name,
                quantity: ing.quantity || 1,
                unit: ing.unit || '',
                estimated_cost_inr: cost,
                category: 'Pantry & Fresh',
              });
            }
          }
        }
      }
    }
  }

  const items = Array.from(groceryMap.values()).map((item, idx) => ({
    id: `g-${idx}`,
    ...item,
    checked: false,
  }));

  const totalCost = items.reduce((acc, item) => acc + item.estimated_cost_inr, 0);
  return res.json({ success: true, items, total_estimated_cost_inr: totalCost });
}
