import { z } from 'zod';

export const UserIngredientInputSchema = z.union([
  z.string().min(1, 'Ingredient name cannot be empty').transform((name) => ({
    name,
    quantity: undefined as number | undefined,
    unit: undefined as string | undefined,
    state: undefined as 'raw' | 'cooked' | 'frozen' | 'leftover' | undefined,
    notes: undefined as string | undefined,
  })),
  z.object({
    name: z.string().min(1, 'Ingredient name cannot be empty'),
    quantity: z.number().optional(),
    unit: z.string().optional(),
    state: z.enum(['raw', 'cooked', 'frozen', 'leftover']).optional(),
    notes: z.string().optional(),
  }),
]);

export const FilterPreferencesSchema = z.object({
  dietary: z.array(z.string()).optional(),
  cuisine: z.array(z.string()).optional(),
  mealType: z.array(z.string()).optional(),
  maxTimeMinutes: z.number().optional(),
  mustHaveIngredients: z.array(z.string()).optional(),
  excludeIngredients: z.array(z.string()).optional(),
  cookWithoutBuyingOnly: z.boolean().optional(),
  pantryStaples: z.array(z.string()).optional(),
  equipment: z.array(z.string()).optional(),
  servings: z.number().min(1).max(20).optional(),
});

export const RecommendRequestSchema = z.object({
  ingredients: z.array(UserIngredientInputSchema).min(1, 'At least one ingredient is required'),
  pantryStaples: z.array(z.string()).optional().default([]),
  equipment: z.array(z.string()).optional().default([]),
  preferences: FilterPreferencesSchema.optional(),
});

export const SaveRecipeRequestSchema = z.object({
  recipeId: z.string().min(1),
  recipeTitle: z.string().min(1),
  cuisine: z.string().min(1),
  imageUrl: z.string().url().or(z.string()),
  prepTimeMinutes: z.number().nonnegative(),
  cookTimeMinutes: z.number().nonnegative(),
  difficulty: z.string(),
  userId: z.string().default('guest_user'),
});

export const CookingSessionProgressSchema = z.object({
  recipeId: z.string().min(1),
  currentStep: z.number().int().min(1),
  completedSteps: z.array(z.number().int()),
  isComplete: z.boolean().optional().default(false),
});
