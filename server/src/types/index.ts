export type IngredientState = 'raw' | 'cooked' | 'frozen' | 'leftover';

export interface UserIngredient {
  name: string;
  normalizedName: string;
  quantity?: number;
  unit?: string;
  state?: IngredientState;
  notes?: string;
}

export interface RecipeIngredient {
  name: string;
  quantity: number;
  unit: string;
  isOptional: boolean;
  substitutions: string[];
  notes?: string;
}

export type VisualType = 'chop' | 'heat_oil' | 'temper_spices' | 'saute' | 'add_ingredients' | 'boil' | 'simmer' | 'steam' | 'blend' | 'garnish' | 'serve';

export interface CookingStep {
  stepNumber: number;
  instruction: string;
  visualType: VisualType;
  visualUrl?: string;
  ingredients: { name: string; quantity?: number; unit?: string }[];
  equipment?: string[];
  heatLevel?: 'low' | 'medium' | 'high' | 'off';
  durationMinutes?: number;
  timerSeconds?: number;
  donenessCue?: string;
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  cuisine: string;
  region: string;
  mealType: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snacks' | 'Desserts';
  provenance: 'curated' | 'ai_generated';
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  servings: number;
  equipment: string[];
  ingredients: RecipeIngredient[];
  steps: CookingStep[];
  instructions?: string[];
  dietaryLabels: string[]; // 'Vegetarian', 'Vegan', 'High-Protein', 'Gluten-Free', etc.
  allergenInfo: string[];
  safetyAdvice?: string;
  storageAdvice?: string;
  imageUrl: string;
  tips: string[];
  estimatedCostInr?: number;
}

export interface RecipeRecommendation {
  recipe: Recipe;
  matchPercentage: number;
  matchedIngredients: string[];
  missingRequiredIngredients: RecipeIngredient[];
  missingOptionalIngredients: RecipeIngredient[];
  possibleSubstitutions: { original: string; substitute: string }[];
  canCookWithoutBuyingAnything: boolean;
  matchExplanation: string;
}

export interface CookingSession {
  id: string;
  recipeId: string;
  currentStep: number;
  completedSteps: number[];
  startedAt: string;
  updatedAt: string;
  isComplete: boolean;
}

export interface SavedRecipeRecord {
  id: string;
  recipeId: string;
  recipeTitle: string;
  cuisine: string;
  imageUrl: string;
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  difficulty: string;
  userId: string;
  savedAt: string;
}
