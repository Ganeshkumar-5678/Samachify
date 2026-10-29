import { Router } from 'express';
import {
  getStatus,
  normalizeIngredientsEndpoint,
  recommendRecipes,
  getRecipeById,
  saveRecipe,
  getSavedRecipes,
  updateCookingSession,
  getCookingSession,
} from '../controllers/recipeController.js';

const router = Router();

router.get('/status', getStatus);
router.all('/ingredients/normalize', normalizeIngredientsEndpoint);
router.post('/recipes/recommend', recommendRecipes);
router.get('/recipes/saved', getSavedRecipes);
router.post('/recipes/save', saveRecipe);
router.get('/recipes/:id', getRecipeById);
router.post('/cooking/session', updateCookingSession);
router.get('/cooking/session/:id', getCookingSession);

export default router;
