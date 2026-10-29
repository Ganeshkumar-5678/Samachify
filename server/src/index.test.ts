import { normalizeIngredient, searchTamilIngredients } from './utils/tamilNormalization.js';
import { CURATED_RECIPES } from './data/curatedRecipes.js';
import { evaluateRecipe, rankRecommendations } from './services/matchingService.js';
import { isGroqConfigured, getVerifiedGroqModel, SUPPORTED_GROQ_MODELS, generateRecipeWithGroq } from './services/groqService.js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '../.env'), override: true });
dotenv.config({ path: path.resolve(process.cwd(), '.env'), override: true });

async function runTests() {
  console.log('🧪 Starting SAMACHIFY Engine Verification Tests...');
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, msg: string) {
    if (condition) {
      console.log(`  ✅ PASS: ${msg}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${msg}`);
      failed++;
    }
  }

  // Test 1: Tamil transliteration normalization
  const thakkaliNorm = normalizeIngredient('Thakkali');
  assert(thakkaliNorm.normalized === 'tomato', 'Thakkali should normalize to tomato');
  assert(thakkaliNorm.matchedTamilWord === 'thakkali', 'Tamil word should be recognized');

  const vengayamNorm = normalizeIngredient('Vengayam');
  assert(vengayamNorm.normalized === 'onion', 'Vengayam should normalize to onion');

  const arisiNorm = normalizeIngredient('Arisi');
  assert(arisiNorm.normalized === 'rice', 'Arisi should normalize to rice');

  // Test 2: Tamil search autocomplete
  const suggestions = searchTamilIngredients('milag');
  assert(
    suggestions.some((s) => s.normalized === 'green chilli' || s.normalized === 'black pepper'),
    'Autocomplete should match milagai / milagu'
  );

  // Test 3: Curated recipe count and presence
  assert(CURATED_RECIPES.length >= 7, 'Should have at least 7 curated recipes');
  const thakkaliSadam = CURATED_RECIPES.find((r) => r.title.includes('Thakkali Sadam'));
  assert(!!thakkaliSadam, 'Thakkali Sadam should exist in curated library');

  // Test 4: Evaluation and Match Percentage formula
  if (thakkaliSadam) {
    // User with rice, tomato, onion, curry leaves, oil, mustard seeds
    const userIngredients = [
      { name: 'Rice', normalizedName: 'rice' },
      { name: 'Tomato', normalizedName: 'tomato' },
      { name: 'Onion', normalizedName: 'onion' },
    ];
    const staples = ['oil', 'mustard seeds', 'salt', 'turmeric powder', 'chilli powder'];

    const rec = evaluateRecipe(thakkaliSadam, userIngredients, staples);
    assert(rec.matchPercentage > 70, `Match percentage should be high with key ingredients, got ${rec.matchPercentage}%`);
    assert(typeof rec.canCookWithoutBuyingAnything === 'boolean', 'canCookWithoutBuyingAnything should be boolean');
  }

  // Test 5: Groq fallback check
  assert(typeof isGroqConfigured() === 'boolean', 'isGroqConfigured returns valid boolean without throwing');

  // Test 6: Groq model verification
  const verifiedModel = getVerifiedGroqModel();
  assert(
    (SUPPORTED_GROQ_MODELS as readonly string[]).includes(verifiedModel),
    `Verified model '${verifiedModel}' is in supported Groq models catalog`
  );

  // Test 7: Filter logic - Cook without buying anything
  const dummyUserIngs = [
    { name: 'Rice', normalizedName: 'rice' },
    { name: 'Tomato', normalizedName: 'tomato' },
    { name: 'Onion', normalizedName: 'onion' },
    { name: 'Green Chilli', normalizedName: 'green chilli' },
    { name: 'Ginger', normalizedName: 'ginger' },
    { name: 'Garlic', normalizedName: 'garlic' },
    { name: 'Curry Leaves', normalizedName: 'curry leaves' },
  ];
  const allStaples = ['oil', 'mustard seeds', 'salt', 'turmeric powder', 'chilli powder', 'water'];
  const evaluatedAll = CURATED_RECIPES.map((r) => evaluateRecipe(r, dummyUserIngs, allStaples));
  const ranked = rankRecommendations(evaluatedAll, { cookWithoutBuyingOnly: true });

  assert(
    ranked.every((r) => r.canCookWithoutBuyingAnything),
    'All recipes in cookWithoutBuyingOnly filter must have canCookWithoutBuyingAnything === true'
  );

  // Test 8: Filter logic - Dietary Vegetarian filter
  const vegRanked = rankRecommendations(evaluatedAll, { dietary: ['Vegetarian'] });
  assert(
    vegRanked.every((r) => r.recipe.dietaryLabels.includes('Vegetarian')),
    'Vegetarian filter strictly returns recipes with Vegetarian label'
  );

  // Test 9: Groq Live AI Recipe Generation
  if (isGroqConfigured()) {
    assert(isGroqConfigured(), 'Groq API is successfully configured');
    const aiRecipe = await generateRecipeWithGroq(
      [
        { name: 'Tomato', normalizedName: 'tomato' },
        { name: 'Rice', normalizedName: 'rice' },
      ],
      ['oil', 'salt', 'mustard seeds'],
      ['kadai'],
      { cuisine: ['Tamil Nadu'] }
    );
    assert(!!aiRecipe, 'Groq should return a generated recipe');
    if (aiRecipe) {
      assert(aiRecipe.provenance === 'ai_generated', 'Recipe provenance should be ai_generated');
      assert(typeof aiRecipe.title === 'string' && aiRecipe.title.length > 0, 'Recipe must have a valid title');
      assert(Array.isArray(aiRecipe.steps) && aiRecipe.steps.length > 0, 'Recipe must have valid cooking steps');
    }
  }

  console.log(`\nResults: ${passed} passed, ${failed} failed.`);
  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
