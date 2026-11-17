import { Router } from 'express';
import {
  getStatus,
  normalizeIngredientsEndpoint,
  recommendRecipes,
  getRecipeById,
  getAllRecipes,
  saveRecipe,
  getSavedRecipes,
  updateCookingSession,
  getCookingSession,
  getMealPlan,
  updateMealPlan,
  generateGroceryList,
} from '../controllers/recipeController.js';

const router = Router();

router.get('/status', getStatus);
router.all('/ingredients/normalize', normalizeIngredientsEndpoint);
router.post('/recipes/recommend', recommendRecipes);
router.get('/recipes', getAllRecipes);
router.get('/recipes/saved', getSavedRecipes);
router.post('/recipes/save', saveRecipe);
router.get('/recipes/:id', getRecipeById);
router.post('/cooking/session', updateCookingSession);
router.get('/cooking/session/:id', getCookingSession);
router.get('/mealplan', getMealPlan);
router.post('/mealplan', updateMealPlan);
router.post('/mealplan/grocery', generateGroceryList);

export default router;
