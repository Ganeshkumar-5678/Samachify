export type IngredientState = 'raw' | 'cooked' | 'frozen' | 'leftover';

export interface UserIngredient {
  id?: string;
  name: string;
  normalizedName?: string;
  quantity?: number;
  unit?: string;
  state?: IngredientState;
  notes?: string;
}

export interface RecipeIngredient {
  name: string;
  quantity: number;
  unit: string;
  isOptional?: boolean;
  is_optional?: boolean;
  substitutions: string[];
  notes?: string;
  estimated_cost_inr?: number;
}

export type VisualType =
  | 'chop'
  | 'heat_oil'
  | 'temper_spices'
  | 'saute'
  | 'add_ingredients'
  | 'boil'
  | 'simmer'
  | 'steam'
  | 'blend'
  | 'garnish'
  | 'serve';

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
  region?: string;
  country?: string;
  mealType?: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snacks' | 'Desserts' | string;
  dish_type?: string;
  provenance?: 'curated' | 'ai_generated';
  source?: 'curated' | 'ai_generated';
  prepTimeMinutes?: number;
  prep_time_minutes?: number;
  cookTimeMinutes?: number;
  cook_time_minutes?: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  servings: number;
  equipment?: string[];
  ingredients: RecipeIngredient[];
  steps?: CookingStep[];
  instructions?: string[];
  dietaryLabels?: string[];
  dietary_labels?: string[];
  allergenInfo?: string[];
  safetyAdvice?: string;
  safety_advice?: string;
  storageAdvice?: string;
  imageUrl?: string;
  image_url?: string;
  tips?: string[];
  estimatedCostInr?: number;
  estimated_total_cost_inr?: number;
  estimated_cost_per_serving_inr?: number;
}

export interface RecipeRecommendation {
  recipe: Recipe;
  matchPercentage: number;
  matchedIngredients: string[];
  missingRequiredIngredients: RecipeIngredient[];
  missingOptionalIngredients?: RecipeIngredient[];
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

// Legacy aliases for MealPlan & Pantry
export interface MealPlanSlot {
  recipe_id: string;
  recipe_title: string;
  cuisine: string;
  cook_time_minutes: number;
  difficulty: string;
  image_url: string;
  servings: number;
}

export interface MealPlanDay {
  day: string;
  date_str: string;
  breakfast?: MealPlanSlot;
  lunch?: MealPlanSlot;
  dinner?: MealPlanSlot;
  snacks?: MealPlanSlot;
}

export interface MealPlan {
  id: string;
  title: string;
  week_range: string;
  days: MealPlanDay[];
}

export interface PantryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  state: 'fresh' | 'frozen' | 'canned' | 'cooked' | 'dried';
  purchase_date?: string;
  expiry_date?: string;
  days_to_expiry?: number;
  is_expiring_soon?: boolean;
}

export interface GroceryItem {
  name: string;
  quantity: number;
  unit: string;
  estimated_cost_inr: number;
  checked: boolean;
  category: string;
}

