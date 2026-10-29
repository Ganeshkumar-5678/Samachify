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
