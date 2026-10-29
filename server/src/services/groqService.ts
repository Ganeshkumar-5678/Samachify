import { Groq } from 'groq-sdk';
import dotenv from 'dotenv';
import path from 'path';
import { Recipe, UserIngredient, VisualType } from '../types/index.js';
import { CURATED_RECIPES } from '../data/curatedRecipes.js';

export const SUPPORTED_GROQ_MODELS = [
  'llama-3.3-70b-versatile',
  'llama-3.1-8b-instant',
  'qwen/qwen3.8-27b',
  'openai/gpt-oss-120b',
  'openai/gpt-oss-20b',
  'mixtral-8x7b-32768',
  'gemma2-9b-it',
] as const;

export function getVerifiedGroqModel(): string {
  const configured = process.env.GROQ_MODEL?.trim();
  if (configured && (SUPPORTED_GROQ_MODELS as readonly string[]).includes(configured)) {
    return configured;
  }
  return 'llama-3.3-70b-versatile';
}

let currentApiKey: string | null = null;
let groqClient: Groq | null = null;

export function getGroqClient(): Groq | null {
  // Dynamically check if .env on disk has been updated
  const keyCandidate = process.env.GROQ_API_KEY?.trim();
  if (
    !keyCandidate ||
    keyCandidate === 'PASTE_YOUR_KEY_HERE' ||
    keyCandidate === 'your_groq_api_key_here' ||
    keyCandidate === 'YOUR_GROQ_API_KEY'
  ) {
    dotenv.config();
    dotenv.config({ path: path.resolve(process.cwd(), '.env'), override: true });
    dotenv.config({ path: path.resolve(process.cwd(), '../.env'), override: true });
  }

  const apiKey = process.env.GROQ_API_KEY?.trim();
  if (
    !apiKey ||
    apiKey === '' ||
    apiKey === 'PASTE_YOUR_KEY_HERE' ||
    apiKey === 'your_groq_api_key_here' ||
    apiKey === 'YOUR_GROQ_API_KEY'
  ) {
    groqClient = null;
    currentApiKey = null;
    return null;
  }

  if (!groqClient || currentApiKey !== apiKey) {
    currentApiKey = apiKey;
    groqClient = new Groq({ apiKey });
  }
  return groqClient;
}

export function isGroqConfigured(): boolean {
  return getGroqClient() !== null;
}

const VALID_VISUAL_TYPES: VisualType[] = [
  'chop',
  'heat_oil',
  'temper_spices',
  'saute',
  'add_ingredients',
  'boil',
  'simmer',
  'steam',
  'blend',
  'garnish',
  'serve',
];

/**
 * Generate a tailored recipe using Groq Llama 3.3 model based strictly on user ingredients.
 */
export async function generateRecipeWithGroq(
  userIngredients: UserIngredient[],
  pantryStaples: string[] = [],
  equipment: string[] = [],
  preferences?: {
    dietary?: string[];
    cuisine?: string[];
    mealType?: string[];
  }
): Promise<Recipe | null> {
  const client = getGroqClient();
  if (!client) {
    console.info('[GroqService] Groq API key is not configured. Falling back transparently to curated recipe library.');
    return null;
  }

  const model = getVerifiedGroqModel();

  const ingredientListStr = userIngredients
    .map(
      (ing) =>
        `- ${ing.name}${ing.quantity ? ` (${ing.quantity} ${ing.unit || ''})` : ''}${
          ing.state ? ` [State: ${ing.state}]` : ''
        }`
    )
    .join('\n');

  const staplesStr = pantryStaples.length > 0 ? pantryStaples.join(', ') : 'Basic salt and water only';
  const equipmentStr = equipment.length > 0 ? equipment.join(', ') : 'Standard kitchen cookware';
  const dietaryStr = preferences?.dietary?.length ? preferences.dietary.join(', ') : 'Any';
  const cuisineStr = preferences?.cuisine?.length ? preferences.cuisine.join(', ') : 'Tamil Nadu or Indian preferred';

  const systemPrompt = `You are SAMACHIFY's Chef AI, an expert culinary assistant specializing in Tamil Nadu home cooking, South Indian cuisine, and international cooking.
Your role is to create delicious, practical, authentic recipes that maximize the user's available ingredients while minimizing or eliminating missing ingredients.

STRICT RULES:
1. Prioritize Tamil Nadu authentic dishes if the ingredients support it (e.g., Thakkali Sadam, Sambar, Rasam, Kootu, Poriyal, Biryani, Upma).
2. DO NOT pretend the user has ingredients they did not provide, except the declared pantry staples.
3. Keep the recipe concise with 4 to 6 numbered cooking steps.
4. Every step MUST include:
   - "visualType" strictly chosen from: ${VALID_VISUAL_TYPES.join(', ')}
   - "instruction" clearly explaining the action
   - "timerSeconds" (number of seconds to count down, or 0 if instantaneous)
   - "donenessCue" (sensory cue like "until onions turn translucent golden brown" or "mustard seeds crackle")
   - "heatLevel" ('low' | 'medium' | 'high' | 'off')
5. Return ONLY valid JSON matching the exact schema requested. No markdown formatting, no code fences, no conversational prose.`;

  const userPrompt = `The user has these available ingredients:
${ingredientListStr}

Declared pantry staples:
${staplesStr}

Available equipment:
${equipmentStr}

Preferences:
Dietary: ${dietaryStr}
Cuisine: ${cuisineStr}

Generate a complete, delicious recipe that strictly utilizes these ingredients. Return ONLY the JSON object conforming to this TypeScript shape:
{
  "id": "ai-recipe-" + Date.now(),
  "title": string,
  "description": string,
  "cuisine": string,
  "region": string,
  "mealType": "Breakfast" | "Lunch" | "Dinner" | "Snacks" | "Desserts",
  "provenance": "ai_generated",
  "prepTimeMinutes": number,
  "cookTimeMinutes": number,
  "difficulty": "Easy" | "Medium" | "Hard",
  "servings": number,
  "equipment": string[],
  "ingredients": [
    {
      "name": string,
      "quantity": number,
      "unit": string,
      "isOptional": boolean,
      "substitutions": string[],
      "notes": string
    }
  ],
  "steps": [
    {
      "stepNumber": number,
      "instruction": string,
      "visualType": "chop" | "heat_oil" | "temper_spices" | "saute" | "add_ingredients" | "boil" | "simmer" | "steam" | "blend" | "garnish" | "serve",
      "ingredients": [{"name": string, "quantity": number, "unit": string}],
      "equipment": string[],
      "heatLevel": "low" | "medium" | "high" | "off",
      "durationMinutes": number,
      "timerSeconds": number,
      "donenessCue": string
    }
  ],
  "dietaryLabels": string[],
  "allergenInfo": string[],
  "safetyAdvice": string,
  "storageAdvice": string,
  "imageUrl": string,
  "tips": string[],
  "estimatedCostInr": number
}`;

  try {
    let completion;
    try {
      completion = await client.chat.completions.create({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.3,
        max_tokens: 950,
        response_format: { type: 'json_object' },
      });
    } catch (modelErr: any) {
      if (modelErr?.status === 404 || modelErr?.message?.includes('model_not_found') || modelErr?.message?.includes('does not exist')) {
        console.warn(`[GroqService] Model ${model} not available in this Groq account. Retrying with qwen/qwen3.8-27b...`);
        completion = await client.chat.completions.create({
          model: 'qwen/qwen3.8-27b',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0.3,
          max_tokens: 950,
          response_format: { type: 'json_object' },
        });
      } else {
        throw modelErr;
      }
    }

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      console.warn('[GroqService] Received empty content from Groq');
      return null;
    }

    const parsed = JSON.parse(content) as Recipe;
    parsed.id = parsed.id || `groq-${Date.now()}`;
    parsed.provenance = 'ai_generated';
    parsed.prepTimeMinutes = Number(parsed.prepTimeMinutes) || 15;
    parsed.cookTimeMinutes = Number(parsed.cookTimeMinutes) || 20;
    parsed.servings = Number(parsed.servings) || 2;
    parsed.difficulty = (['Easy', 'Medium', 'Hard'].includes(parsed.difficulty) ? parsed.difficulty : 'Medium') as 'Easy' | 'Medium' | 'Hard';
    parsed.dietaryLabels = Array.isArray(parsed.dietaryLabels) ? parsed.dietaryLabels : ['Vegetarian'];
    parsed.allergenInfo = Array.isArray(parsed.allergenInfo) ? parsed.allergenInfo : [];
    parsed.tips = Array.isArray(parsed.tips) ? parsed.tips : [];
    parsed.equipment = Array.isArray(parsed.equipment) ? parsed.equipment : [];

    // Normalize ingredients
    parsed.ingredients = (parsed.ingredients || []).map((ing) => ({
      name: ing.name || 'Ingredient',
      quantity: Number(ing.quantity) || 1,
      unit: ing.unit || '',
      isOptional: Boolean(ing.isOptional),
      substitutions: Array.isArray(ing.substitutions) ? ing.substitutions : [],
      notes: ing.notes || '',
    }));

    // Normalize steps
    parsed.steps = (parsed.steps || []).map((step, idx) => ({
      ...step,
      stepNumber: idx + 1,
      instruction: step.instruction || '',
      visualType: VALID_VISUAL_TYPES.includes(step.visualType) ? step.visualType : 'saute',
      heatLevel: (['low', 'medium', 'high', 'off'].includes(step.heatLevel || '') ? step.heatLevel : 'medium') as any,
      timerSeconds: typeof step.timerSeconds === 'number' ? step.timerSeconds : (Number(step.durationMinutes) || 2) * 60,
      donenessCue: step.donenessCue || '',
      ingredients: Array.isArray(step.ingredients) ? step.ingredients : [],
      equipment: Array.isArray(step.equipment) ? step.equipment : [],
    }));

    parsed.instructions = parsed.steps.map((s) => s.instruction);

    // Context-sensitive fallback image
    if (!parsed.imageUrl || !parsed.imageUrl.startsWith('http')) {
      const titleLower = (parsed.title || '').toLowerCase();
      if (titleLower.includes('rice') || titleLower.includes('sadam') || titleLower.includes('biryani') || titleLower.includes('pongal')) {
        parsed.imageUrl = 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=800&q=80';
      } else if (titleLower.includes('sambar') || titleLower.includes('curry') || titleLower.includes('kootu') || titleLower.includes('dal')) {
        parsed.imageUrl = 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80';
      } else if (titleLower.includes('pasta') || titleLower.includes('noodle')) {
        parsed.imageUrl = 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=800&q=80';
      } else {
        parsed.imageUrl = 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80';
      }
    }

    return parsed;
  } catch (error: any) {
    console.error('[GroqService] Error invoking Groq API:', error?.message || error);
    return null;
  }
}
