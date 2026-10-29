import { Recipe, RecipeIngredient, RecipeRecommendation, UserIngredient } from '../types/index.js';
import { normalizeIngredient } from '../utils/tamilNormalization.js';

export interface MatchFilterOptions {
  dietary?: string[];
  cuisine?: string[];
  mealType?: string[];
  maxTimeMinutes?: number;
  mustHaveIngredients?: string[];
  excludeIngredients?: string[];
  cookWithoutBuyingOnly?: boolean;
}

/**
 * Checks if a recipe ingredient is matched by any available user ingredient or pantry staple.
 */
function isIngredientMatched(
  recipeIng: RecipeIngredient,
  userNormalizedMap: Map<string, UserIngredient>,
  pantrySet: Set<string>
): { matched: boolean; matchedName?: string; isSubstituted?: boolean; substitute?: string } {
  const normRecipeName = normalizeIngredient(recipeIng.name).normalized;

  // 1. Direct or normalized match with user ingredients
  if (userNormalizedMap.has(normRecipeName)) {
    return { matched: true, matchedName: recipeIng.name };
  }

  // 2. Partial substring matching (e.g. "onion" in "red onion" or vice versa)
  for (const [normUser, userIng] of userNormalizedMap.entries()) {
    if (
      normRecipeName.includes(normUser) ||
      normUser.includes(normRecipeName) ||
      normRecipeName.replace(/\s+/g, '') === normUser.replace(/\s+/g, '')
    ) {
      return { matched: true, matchedName: userIng.name };
    }
  }

  // 3. Pantry staples check
  if (pantrySet.has(normRecipeName)) {
    return { matched: true, matchedName: `${recipeIng.name} (Pantry Staple)` };
  }
  for (const staple of pantrySet) {
    if (normRecipeName.includes(staple) || staple.includes(normRecipeName)) {
      return { matched: true, matchedName: `${recipeIng.name} (Pantry Staple)` };
    }
  }

  // 4. Recipe substitutions check
  for (const sub of recipeIng.substitutions) {
    const normSub = normalizeIngredient(sub).normalized;
    if (userNormalizedMap.has(normSub)) {
      return {
        matched: true,
        matchedName: recipeIng.name,
        isSubstituted: true,
        substitute: sub,
      };
    }
    for (const [normUser] of userNormalizedMap.entries()) {
      if (normSub.includes(normUser) || normUser.includes(normSub)) {
        return {
          matched: true,
          matchedName: recipeIng.name,
          isSubstituted: true,
          substitute: sub,
        };
      }
    }
  }

  return { matched: false };
}

/**
 * Evaluate a recipe against a user's ingredients and declared pantry staples.
 */
export function evaluateRecipe(
  recipe: Recipe,
  userIngredients: UserIngredient[],
  pantryStaples: string[] = []
): RecipeRecommendation {
  const userNormalizedMap = new Map<string, UserIngredient>();
  for (const u of userIngredients) {
    userNormalizedMap.set(u.normalizedName, u);
  }

  const pantrySet = new Set<string>(
    pantryStaples.map((s) => normalizeIngredient(s).normalized)
  );

  const requiredIngredients = recipe.ingredients.filter((i) => !i.isOptional);
  const optionalIngredients = recipe.ingredients.filter((i) => i.isOptional);

  const matchedIngredients: string[] = [];
  const missingRequiredIngredients: RecipeIngredient[] = [];
  const missingOptionalIngredients: RecipeIngredient[] = [];
  const possibleSubstitutions: { original: string; substitute: string }[] = [];

  for (const req of requiredIngredients) {
    const match = isIngredientMatched(req, userNormalizedMap, pantrySet);
    if (match.matched) {
      matchedIngredients.push(req.name);
      if (match.isSubstituted && match.substitute) {
        possibleSubstitutions.push({
          original: req.name,
          substitute: match.substitute,
        });
      }
    } else {
      missingRequiredIngredients.push(req);
    }
  }

  for (const opt of optionalIngredients) {
    const match = isIngredientMatched(opt, userNormalizedMap, pantrySet);
    if (match.matched) {
      matchedIngredients.push(`${opt.name} (Optional)`);
    } else {
      missingOptionalIngredients.push(opt);
    }
  }

  const totalRequired = requiredIngredients.length;
  const matchedRequiredCount = totalRequired - missingRequiredIngredients.length;

  const matchPercentage =
    totalRequired > 0
      ? Math.round((matchedRequiredCount / totalRequired) * 100)
      : 100;

  const canCookWithoutBuyingAnything = missingRequiredIngredients.length === 0;

  // Construct honest match explanation
  let matchExplanation = '';
  if (canCookWithoutBuyingAnything) {
    if (possibleSubstitutions.length > 0) {
      matchExplanation = `100% ready to cook using your items and substitutions (${possibleSubstitutions
        .map((s) => `${s.substitute} for ${s.original}`)
        .join(', ')}). No shopping needed!`;
    } else {
      matchExplanation = '100% ready to cook! All required ingredients are in your kitchen and pantry.';
    }
  } else {
    matchExplanation = `You have ${matchedRequiredCount} of ${totalRequired} required ingredients (${matchPercentage}% match). Missing ${missingRequiredIngredients.length} essential items: ${missingRequiredIngredients
      .map((i) => i.name)
      .join(', ')}.`;
  }

  return {
    recipe,
    matchPercentage,
    matchedIngredients,
    missingRequiredIngredients,
    missingOptionalIngredients,
    possibleSubstitutions,
    canCookWithoutBuyingAnything,
    matchExplanation,
  };
}

/**
 * Filter and rank recipe recommendations.
 */
export function rankRecommendations(
  recommendations: RecipeRecommendation[],
  filters?: MatchFilterOptions
): RecipeRecommendation[] {
  let filtered = [...recommendations];

  if (!filters) {
    return sortRecommendations(filtered);
  }

  // 1. Dietary filter (Vegetarian, Vegan, High-Protein, etc.)
  if (filters.dietary && filters.dietary.length > 0) {
    filtered = filtered.filter((rec) => {
      return filters.dietary!.every((label) =>
        rec.recipe.dietaryLabels.some(
          (dl) => dl.toLowerCase() === label.toLowerCase()
        )
      );
    });
  }

  // 2. Cuisine filter
  if (filters.cuisine && filters.cuisine.length > 0) {
    filtered = filtered.filter((rec) =>
      filters.cuisine!.some((c) =>
        rec.recipe.cuisine.toLowerCase().includes(c.toLowerCase()) ||
        rec.recipe.region.toLowerCase().includes(c.toLowerCase())
      )
    );
  }

  // 3. Meal Type
  if (filters.mealType && filters.mealType.length > 0) {
    filtered = filtered.filter((rec) =>
      filters.mealType!.some(
        (mt) => rec.recipe.mealType.toLowerCase() === mt.toLowerCase()
      )
    );
  }

  // 4. Max cooking time
  if (filters.maxTimeMinutes && filters.maxTimeMinutes > 0) {
    filtered = filtered.filter(
      (rec) =>
        rec.recipe.prepTimeMinutes + rec.recipe.cookTimeMinutes <=
        filters.maxTimeMinutes!
    );
  }

  // 5. Must-have ingredients filter
  if (filters.mustHaveIngredients && filters.mustHaveIngredients.length > 0) {
    const normalizedMustHave = filters.mustHaveIngredients.map(
      (m) => normalizeIngredient(m).normalized
    );
    filtered = filtered.filter((rec) => {
      const recipeIngs = rec.recipe.ingredients.map(
        (i) => normalizeIngredient(i.name).normalized
      );
      return normalizedMustHave.every((must) =>
        recipeIngs.some((ring) => ring.includes(must) || must.includes(ring))
      );
    });
  }

  // 6. Exclude ingredients filter
  if (filters.excludeIngredients && filters.excludeIngredients.length > 0) {
    const normalizedExclude = filters.excludeIngredients.map(
      (e) => normalizeIngredient(e).normalized
    );
    filtered = filtered.filter((rec) => {
      const recipeIngs = rec.recipe.ingredients.map(
        (i) => normalizeIngredient(i.name).normalized
      );
      return !normalizedExclude.some((excl) =>
        recipeIngs.some((ring) => ring.includes(excl) || excl.includes(ring))
      );
    });
  }

  // 7. Cook without buying anything filter
  if (filters.cookWithoutBuyingOnly) {
    filtered = filtered.filter((rec) => rec.canCookWithoutBuyingAnything);
  }

  return sortRecommendations(filtered);
}

function sortRecommendations(
  recommendations: RecipeRecommendation[]
): RecipeRecommendation[] {
  return recommendations.sort((a, b) => {
    // 1. Can cook without buying anything first
    if (a.canCookWithoutBuyingAnything && !b.canCookWithoutBuyingAnything) return -1;
    if (!a.canCookWithoutBuyingAnything && b.canCookWithoutBuyingAnything) return 1;

    // 2. Highest match percentage
    if (b.matchPercentage !== a.matchPercentage) {
      return b.matchPercentage - a.matchPercentage;
    }

    // 3. AI generated recipe prioritization when matches are equal
    if (a.recipe.provenance === 'ai_generated' && b.recipe.provenance !== 'ai_generated') return -1;
    if (a.recipe.provenance !== 'ai_generated' && b.recipe.provenance === 'ai_generated') return 1;

    // 4. Shortest total time
    const totalTimeA = a.recipe.prepTimeMinutes + a.recipe.cookTimeMinutes;
    const totalTimeB = b.recipe.prepTimeMinutes + b.recipe.cookTimeMinutes;
    return totalTimeA - totalTimeB;
  });
}
