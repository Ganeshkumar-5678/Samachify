import { Recipe } from '../types/index.js';

export const CURATED_RECIPES: Recipe[] = [
  // 1. TAMIL NADU - Tomato Rice (Thakkali Sadam)
  {
    id: 'thakkali-sadam',
    title: 'Thakkali Sadam (South Indian Tomato Rice)',
    description: 'Fragrant, tangy Tamil Nadu style spiced rice prepared with ripe tomatoes, sautéed onions, fresh curry leaves, and crunchy mustard tempering.',
    cuisine: 'Tamil Nadu',
    region: 'South India',
    mealType: 'Lunch',
    provenance: 'curated',
    prepTimeMinutes: 10,
    cookTimeMinutes: 15,
    difficulty: 'Easy',
    servings: 2,
    equipment: ['Kadai / Heavy-bottom Skillet', 'Spatula', 'Chef Knife'],
    ingredients: [
      { name: 'Rice', quantity: 200, unit: 'g', isOptional: false, substitutions: ['Brown Rice', 'Millets', 'Quinoa'] },
      { name: 'Tomato', quantity: 250, unit: 'g', isOptional: false, substitutions: ['Canned Crushed Tomatoes'] },
      { name: 'Onion', quantity: 120, unit: 'g', isOptional: false, substitutions: ['Shallots / Sambhar Onion'] },
      { name: 'Green Chilli', quantity: 2, unit: 'pieces', isOptional: false, substitutions: ['Red Chilli Powder'] },
      { name: 'Mustard Seeds', quantity: 1, unit: 'tsp', isOptional: false, substitutions: ['Cumin Seeds'] },
      { name: 'Curry Leaves', quantity: 1, unit: 'sprig', isOptional: true, substitutions: ['Fresh Coriander'] },
      { name: 'Turmeric Powder', quantity: 0.5, unit: 'tsp', isOptional: false, substitutions: [] },
      { name: 'Chilli Powder', quantity: 1, unit: 'tsp', isOptional: false, substitutions: ['Paprika', 'Black Pepper'] },
      { name: 'Cooking Oil', quantity: 2, unit: 'tbsp', isOptional: false, substitutions: ['Ghee', 'Gingelly Oil'] },
      { name: 'Salt', quantity: 1, unit: 'tsp', isOptional: false, substitutions: [] }
    ],
    steps: [
      {
        stepNumber: 1,
        instruction: 'Finely slice 120g onions, dice 250g ripe tomatoes, and slit 2 green chillies lengthwise.',
        visualType: 'chop',
        ingredients: [{ name: 'Onion', quantity: 120, unit: 'g' }, { name: 'Tomato', quantity: 250, unit: 'g' }, { name: 'Green Chilli', quantity: 2, unit: 'pieces' }],
        equipment: ['Chef Knife', 'Cutting Board'],
        durationMinutes: 4,
        donenessCue: 'Onions and tomatoes chopped into uniform bite-sized pieces'
      },
      {
        stepNumber: 2,
        instruction: 'Heat 2 tablespoons of cooking oil in a wide kadai over medium heat until gently shimmering.',
        visualType: 'heat_oil',
        ingredients: [{ name: 'Cooking Oil', quantity: 2, unit: 'tbsp' }],
        equipment: ['Kadai / Heavy-bottom Skillet'],
        heatLevel: 'medium',
        durationMinutes: 1,
        timerSeconds: 60,
        donenessCue: 'Oil is hot and shimmering lightly but not smoking'
      },
      {
        stepNumber: 3,
        instruction: 'Add 1 teaspoon mustard seeds and curry leaves. Let the mustard seeds crackle and splutter vigorously.',
        visualType: 'temper_spices',
        ingredients: [{ name: 'Mustard Seeds', quantity: 1, unit: 'tsp' }, { name: 'Curry Leaves', quantity: 1, unit: 'sprig' }],
        equipment: ['Kadai / Heavy-bottom Skillet', 'Spatula'],
        heatLevel: 'medium',
        durationMinutes: 1,
        timerSeconds: 45,
        donenessCue: 'Mustard seeds pop completely and curry leaves release fresh aroma'
      },
      {
        stepNumber: 4,
        instruction: 'Add sliced onions and slit green chillies. Sauté for 4 minutes until onions turn soft and translucent golden.',
        visualType: 'saute',
        ingredients: [{ name: 'Onion', quantity: 120, unit: 'g' }, { name: 'Green Chilli', quantity: 2, unit: 'pieces' }],
        equipment: ['Kadai / Heavy-bottom Skillet', 'Spatula'],
        heatLevel: 'medium',
        durationMinutes: 4,
        timerSeconds: 240,
        donenessCue: 'Onions are glossy, tender, and pale golden along edges'
      },
      {
        stepNumber: 5,
        instruction: 'Add diced tomatoes, turmeric powder, chilli powder, and salt. Stir well to coat with the aromatics.',
        visualType: 'add_ingredients',
        ingredients: [{ name: 'Tomato', quantity: 250, unit: 'g' }, { name: 'Turmeric Powder', quantity: 0.5, unit: 'tsp' }, { name: 'Chilli Powder', quantity: 1, unit: 'tsp' }, { name: 'Salt', quantity: 1, unit: 'tsp' }],
        equipment: ['Kadai / Heavy-bottom Skillet', 'Spatula'],
        heatLevel: 'medium',
        durationMinutes: 2,
        donenessCue: 'Tomatoes mixed evenly with spices and begin to release moisture'
      },
      {
        stepNumber: 6,
        instruction: 'Cover and simmer on medium-low flame for 6 minutes until tomatoes turn mushy, glossy, and oil begins separating.',
        visualType: 'simmer',
        ingredients: [],
        equipment: ['Kadai Lid'],
        heatLevel: 'low',
        durationMinutes: 6,
        timerSeconds: 360,
        donenessCue: 'Thick, jammy tomato masala paste with oil droplets pooling at sides'
      },
      {
        stepNumber: 7,
        instruction: 'Add cooked rice into the tomato gravy. Gently toss using a spatula without mashing the grains until evenly coated.',
        visualType: 'saute',
        ingredients: [{ name: 'Rice', quantity: 200, unit: 'g' }],
        equipment: ['Kadai / Heavy-bottom Skillet', 'Spatula'],
        heatLevel: 'low',
        durationMinutes: 2,
        timerSeconds: 120,
        donenessCue: 'Every rice grain is uniformly stained orange-red with no white patches'
      },
      {
        stepNumber: 8,
        instruction: 'Turn off the heat. Let the tomato rice rest covered for 2 minutes, then serve hot with appalam or cucumber raita.',
        visualType: 'serve',
        ingredients: [],
        equipment: ['Serving Bowl'],
        heatLevel: 'off',
        donenessCue: 'Aromatic, steaming tomato rice ready for serving'
      }
    ],
    dietaryLabels: ['Vegetarian', 'Vegan', 'Gluten-Free', 'Tamil Nadu Special'],
    allergenInfo: ['Mustard'],
    safetyAdvice: 'Ensure cooked rice is consumed fresh or cooled and refrigerated within 2 hours.',
    storageAdvice: 'Keeps well refrigerated in an airtight container for up to 2 days.',
    imageUrl: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&w=800&q=80',
    tips: [
      'Use cooled or day-old cooked rice so the grains stay separate and do not get mushy.',
      'A pinch of jaggery balances the natural acidity of country tomatoes.'
    ],
    estimatedCostInr: 45
  },

  // 2. TAMIL NADU - Ven Pongal (Clarified Butter & Pepper Khichdi)
  {
    id: 'ven-pongal',
    title: 'Traditional Ven Pongal',
    description: 'Iconic Tamil Nadu breakfast made with tender rice and moong dal, infused with crushed black pepper, fresh ginger, cumin, and golden cashews in ghee.',
    cuisine: 'Tamil Nadu',
    region: 'South India',
    mealType: 'Breakfast',
    provenance: 'curated',
    prepTimeMinutes: 5,
    cookTimeMinutes: 20,
    difficulty: 'Easy',
    servings: 3,
    equipment: ['Pressure Cooker', 'Small Tadka Pan', 'Ladle'],
    ingredients: [
      { name: 'Rice', quantity: 180, unit: 'g', isOptional: false, substitutions: ['Millets', 'Raw Rice'] },
      { name: 'Moong Dal', quantity: 60, unit: 'g', isOptional: false, substitutions: ['Toor Dal'] },
      { name: 'Ghee', quantity: 3, unit: 'tbsp', isOptional: false, substitutions: ['Cooking Oil', 'Butter'] },
      { name: 'Cumin Seeds', quantity: 1, unit: 'tsp', isOptional: false, substitutions: [] },
      { name: 'Black Pepper', quantity: 1.5, unit: 'tsp', isOptional: false, substitutions: ['Crushed Pepper'] },
      { name: 'Ginger', quantity: 15, unit: 'g', isOptional: false, substitutions: ['Dry Ginger Powder'] },
      { name: 'Curry Leaves', quantity: 1, unit: 'sprig', isOptional: true, substitutions: [] },
      { name: 'Asafoetida / Hing', quantity: 1, unit: 'pinch', isOptional: true, substitutions: [] },
      { name: 'Salt', quantity: 1, unit: 'tsp', isOptional: false, substitutions: [] }
    ],
    steps: [
      {
        stepNumber: 1,
        instruction: 'Dry roast 60g moong dal in a pan on medium flame for 3 minutes until lightly aromatic and pale golden. Rinse with 180g rice.',
        visualType: 'saute',
        ingredients: [{ name: 'Moong Dal', quantity: 60, unit: 'g' }, { name: 'Rice', quantity: 180, unit: 'g' }],
        equipment: ['Pressure Cooker'],
        heatLevel: 'medium',
        durationMinutes: 3,
        timerSeconds: 180,
        donenessCue: 'Dal is fragrant with no raw smell'
      },
      {
        stepNumber: 2,
        instruction: 'Add 4.5 cups of water and 1 teaspoon salt to the rice and dal. Pressure cook for 4 whistles, then allow pressure to release naturally.',
        visualType: 'boil',
        ingredients: [{ name: 'Salt', quantity: 1, unit: 'tsp' }],
        equipment: ['Pressure Cooker'],
        heatLevel: 'medium',
        durationMinutes: 12,
        donenessCue: 'Rice and dal are exceptionally soft, creamy, and mashable with a ladle'
      },
      {
        stepNumber: 3,
        instruction: 'Heat 3 tablespoons of ghee in a small tadka pan over medium-low heat.',
        visualType: 'heat_oil',
        ingredients: [{ name: 'Ghee', quantity: 3, unit: 'tbsp' }],
        equipment: ['Small Tadka Pan'],
        heatLevel: 'low',
        durationMinutes: 1,
        timerSeconds: 60,
        donenessCue: 'Ghee melted and fragrant'
      },
      {
        stepNumber: 4,
        instruction: 'Add cumin seeds, whole or cracked black peppercorns, finely minced ginger, and curry leaves. Sauté until sizzling.',
        visualType: 'temper_spices',
        ingredients: [{ name: 'Cumin Seeds', quantity: 1, unit: 'tsp' }, { name: 'Black Pepper', quantity: 1.5, unit: 'tsp' }, { name: 'Ginger', quantity: 15, unit: 'g' }, { name: 'Curry Leaves', quantity: 1, unit: 'sprig' }, { name: 'Asafoetida / Hing', quantity: 1, unit: 'pinch' }],
        equipment: ['Small Tadka Pan'],
        heatLevel: 'low',
        durationMinutes: 2,
        timerSeconds: 90,
        donenessCue: 'Pepper is aromatic and ginger is lightly golden'
      },
      {
        stepNumber: 5,
        instruction: 'Pour the hot ghee tempering directly over the mashed pongal. Stir vigorously until completely incorporated.',
        visualType: 'add_ingredients',
        ingredients: [],
        equipment: ['Pressure Cooker', 'Ladle'],
        heatLevel: 'off',
        donenessCue: 'Glistening, velvety pongal with ghee coating throughout'
      },
      {
        stepNumber: 6,
        instruction: 'Serve hot alongside freshly ground coconut chutney and piping hot tiffin sambar.',
        visualType: 'serve',
        ingredients: [],
        equipment: ['Serving Bowl'],
        heatLevel: 'off',
        donenessCue: 'Steaming hot Ven Pongal with a rich aroma of ghee and pepper'
      }
    ],
    dietaryLabels: ['Vegetarian', 'Gluten-Free', 'High-Protein', 'Tamil Nadu Special'],
    allergenInfo: ['Dairy (Ghee)'],
    safetyAdvice: 'Serve immediately while steaming hot.',
    storageAdvice: 'Pongal thickens upon cooling; reheat with 2 tablespoons of warm water and a dollop of ghee.',
    imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80',
    tips: [
      'Roasting moong dal first keeps the pongal aromatic and velvety without becoming gluey.',
      'Generous ghee gives the classic temple-style melt-in-mouth mouthfeel.'
    ],
    estimatedCostInr: 60
  },

  // 3. TAMIL NADU - South Indian Sambar
  {
    id: 'tamil-sambar',
    title: 'Authentic Tamil Nadu Sambar',
    description: 'The soul of Tamil dining: yellow toor dal simmered with vegetables, tamarind extract, freshly ground coriander-chilli sambar spices, and mustard tempering.',
    cuisine: 'Tamil Nadu',
    region: 'South India',
    mealType: 'Lunch',
    provenance: 'curated',
    prepTimeMinutes: 10,
    cookTimeMinutes: 20,
    difficulty: 'Medium',
    servings: 4,
    equipment: ['Pressure Cooker', 'Kadai / Sambar Pot', 'Ladle'],
    ingredients: [
      { name: 'Toor Dal', quantity: 150, unit: 'g', isOptional: false, substitutions: ['Moong Dal'] },
      { name: 'Onion', quantity: 100, unit: 'g', isOptional: false, substitutions: ['Shallots / Chinna Vengayam'] },
      { name: 'Tomato', quantity: 150, unit: 'g', isOptional: false, substitutions: [] },
      { name: 'Drumstick', quantity: 1, unit: 'pieces', isOptional: true, substitutions: ['Potato', 'Carrot', 'Brinjal'] },
      { name: 'Tamarind', quantity: 20, unit: 'g', isOptional: false, substitutions: ['Lemon Juice', 'Amchur'] },
      { name: 'Turmeric Powder', quantity: 0.5, unit: 'tsp', isOptional: false, substitutions: [] },
      { name: 'Chilli Powder', quantity: 1.5, unit: 'tsp', isOptional: false, substitutions: ['Sambar Powder'] },
      { name: 'Mustard Seeds', quantity: 1, unit: 'tsp', isOptional: false, substitutions: [] },
      { name: 'Curry Leaves', quantity: 1, unit: 'sprig', isOptional: true, substitutions: [] },
      { name: 'Cooking Oil', quantity: 1.5, unit: 'tbsp', isOptional: false, substitutions: ['Gingelly Oil', 'Ghee'] },
      { name: 'Salt', quantity: 1.5, unit: 'tsp', isOptional: false, substitutions: [] }
    ],
    steps: [
      {
        stepNumber: 1,
        instruction: 'Cook 150g toor dal with 0.5 tsp turmeric and 2 cups water in a pressure cooker for 4 whistles until completely tender and mashable.',
        visualType: 'boil',
        ingredients: [{ name: 'Toor Dal', quantity: 150, unit: 'g' }, { name: 'Turmeric Powder', quantity: 0.5, unit: 'tsp' }],
        equipment: ['Pressure Cooker'],
        heatLevel: 'medium',
        durationMinutes: 12,
        donenessCue: 'Dal is completely soft and dissolves smoothly when whisked'
      },
      {
        stepNumber: 2,
        instruction: 'Soak tamarind in 1 cup of warm water for 5 minutes, extract the tangy pulp, and discard fibrous solids.',
        visualType: 'add_ingredients',
        ingredients: [{ name: 'Tamarind', quantity: 20, unit: 'g' }],
        equipment: ['Small Bowl'],
        durationMinutes: 5,
        donenessCue: 'Smooth, golden-brown tamarind liquid without seeds'
      },
      {
        stepNumber: 3,
        instruction: 'In a pot, combine tamarind extract, chopped vegetables (onions, tomatoes, drumstick), chilli powder, and salt. Boil for 8 minutes until vegetables are tender.',
        visualType: 'boil',
        ingredients: [{ name: 'Onion', quantity: 100, unit: 'g' }, { name: 'Tomato', quantity: 150, unit: 'g' }, { name: 'Drumstick', quantity: 1, unit: 'pieces' }, { name: 'Chilli Powder', quantity: 1.5, unit: 'tsp' }, { name: 'Salt', quantity: 1.5, unit: 'tsp' }],
        equipment: ['Kadai / Sambar Pot'],
        heatLevel: 'medium',
        durationMinutes: 8,
        timerSeconds: 480,
        donenessCue: 'Vegetables are tender to a fork and raw tamarind smell is gone'
      },
      {
        stepNumber: 4,
        instruction: 'Pour the whisked cooked toor dal into the vegetable broth. Stir to combine and simmer on low for 4 minutes to harmonize flavours.',
        visualType: 'simmer',
        ingredients: [],
        equipment: ['Kadai / Sambar Pot', 'Ladle'],
        heatLevel: 'low',
        durationMinutes: 4,
        timerSeconds: 240,
        donenessCue: 'Sambar turns frothy and gently bubbles with a luscious aroma'
      },
      {
        stepNumber: 5,
        instruction: 'Heat oil in a small pan, crackle mustard seeds and curry leaves for 45 seconds, then pour the aromatic tadka into the bubbling sambar.',
        visualType: 'temper_spices',
        ingredients: [{ name: 'Mustard Seeds', quantity: 1, unit: 'tsp' }, { name: 'Curry Leaves', quantity: 1, unit: 'sprig' }, { name: 'Cooking Oil', quantity: 1.5, unit: 'tbsp' }],
        equipment: ['Small Tadka Pan'],
        heatLevel: 'medium',
        durationMinutes: 1,
        timerSeconds: 45,
        donenessCue: 'Mustard seeds popped and sizzling'
      },
      {
        stepNumber: 6,
        instruction: 'Stir in fresh coriander leaves, turn off the flame, and serve with hot steamed rice and a drop of ghee.',
        visualType: 'serve',
        ingredients: [],
        equipment: ['Serving Bowl'],
        heatLevel: 'off',
        donenessCue: 'Comforting, richly flavored Tamil Sambar ready to relish'
      }
    ],
    dietaryLabels: ['Vegetarian', 'Vegan', 'Gluten-Free', 'High-Protein', 'Tamil Nadu Special'],
    allergenInfo: ['Mustard'],
    safetyAdvice: 'Refrigerate leftovers within 2 hours. Boil thoroughly when reheating.',
    storageAdvice: 'Sambar tastes even better the next day! Keeps refrigerated for up to 3 days.',
    imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80',
    tips: [
      'Using small shallots (chinna vengayam) imparts the sweetest, most authentic Tamil Nadu flavor.',
      'Do not boil dal aggressively after adding tamarind; gentle simmering preserves dal sweetness.'
    ],
    estimatedCostInr: 55
  },

  // 4. TAMIL NADU - Medu Vadai (Crispy Spiced Lentil Fritters)
  {
    id: 'medu-vadai',
    title: 'Crispy Medu Vadai (Ulundhu Vadai)',
    description: 'Golden, crispy on the outside, fluffy and airy inside. Classic South Indian savoury doughnut fritters made from stone-ground urad dal, peppercorns, and fresh curry leaves.',
    cuisine: 'Tamil Nadu',
    region: 'South India',
    mealType: 'Snacks',
    provenance: 'curated',
    prepTimeMinutes: 15,
    cookTimeMinutes: 15,
    difficulty: 'Medium',
    servings: 3,
    equipment: ['Wet Grinder / Mixer', 'Kadai for Deep Frying', 'Slotted Spoon'],
    ingredients: [
      { name: 'Urad Dal', quantity: 200, unit: 'g', isOptional: false, substitutions: [] },
      { name: 'Onion', quantity: 80, unit: 'g', isOptional: false, substitutions: ['Shallots'] },
      { name: 'Green Chilli', quantity: 2, unit: 'pieces', isOptional: false, substitutions: [] },
      { name: 'Black Pepper', quantity: 1, unit: 'tsp', isOptional: false, substitutions: [] },
      { name: 'Curry Leaves', quantity: 1, unit: 'sprig', isOptional: true, substitutions: [] },
      { name: 'Ginger', quantity: 10, unit: 'g', isOptional: false, substitutions: [] },
      { name: 'Cooking Oil', quantity: 300, unit: 'ml', isOptional: false, substitutions: [] },
      { name: 'Salt', quantity: 1, unit: 'tsp', isOptional: false, substitutions: [] }
    ],
    steps: [
      {
        stepNumber: 1,
        instruction: 'Soak 200g urad dal in water for 2 hours. Drain thoroughly and grind to a thick, fluffy, aerated batter adding only 2-3 tablespoons of cold water.',
        visualType: 'blend',
        ingredients: [{ name: 'Urad Dal', quantity: 200, unit: 'g' }],
        equipment: ['Wet Grinder / Mixer'],
        durationMinutes: 10,
        donenessCue: 'Batter drops softly and floats like a cloud in a cup of water'
      },
      {
        stepNumber: 2,
        instruction: 'Fold in finely minced onions, green chillies, ginger, whole black peppercorns, chopped curry leaves, and salt. Beat batter with hands for 1 minute for extra fluffiness.',
        visualType: 'add_ingredients',
        ingredients: [{ name: 'Onion', quantity: 80, unit: 'g' }, { name: 'Green Chilli', quantity: 2, unit: 'pieces' }, { name: 'Black Pepper', quantity: 1, unit: 'tsp' }, { name: 'Ginger', quantity: 10, unit: 'g' }, { name: 'Curry Leaves', quantity: 1, unit: 'sprig' }, { name: 'Salt', quantity: 1, unit: 'tsp' }],
        equipment: ['Mixing Bowl'],
        durationMinutes: 3,
        donenessCue: 'Fluffy batter with seasoning evenly dispersed'
      },
      {
        stepNumber: 3,
        instruction: 'Heat cooking oil in a kadai over medium heat (approx. 175°C / 350°F).',
        visualType: 'heat_oil',
        ingredients: [{ name: 'Cooking Oil', quantity: 300, unit: 'ml' }],
        equipment: ['Kadai for Deep Frying'],
        heatLevel: 'medium',
        durationMinutes: 3,
        timerSeconds: 180,
        donenessCue: 'A drop of batter dropped in oil rises steadily to top within 2 seconds without browning instantly'
      },
      {
        stepNumber: 4,
        instruction: 'Wet hands with water, take a small ball of batter, flatten on fingers, make a hole in center with thumb, and gently slide into hot oil.',
        visualType: 'add_ingredients',
        ingredients: [],
        equipment: ['Kadai for Deep Frying'],
        heatLevel: 'medium',
        durationMinutes: 2,
        donenessCue: 'Vada retains round doughnut shape in bubbling oil'
      },
      {
        stepNumber: 5,
        instruction: 'Fry vadas on medium flame for 4-5 minutes, turning occasionally, until all sides are uniformly deep golden and ultra-crisp.',
        visualType: 'boil',
        ingredients: [],
        equipment: ['Kadai for Deep Frying', 'Slotted Spoon'],
        heatLevel: 'medium',
        durationMinutes: 5,
        timerSeconds: 270,
        donenessCue: 'Vadas are golden amber with crispy exterior and zero sogginess'
      },
      {
        stepNumber: 6,
        instruction: 'Drain on kitchen paper towels and serve piping hot with thick coconut chutney and filter coffee.',
        visualType: 'serve',
        ingredients: [],
        equipment: ['Serving Plate'],
        heatLevel: 'off',
        donenessCue: 'Hot, crunchy, fluffy Medu Vada ready to enjoy'
      }
    ],
    dietaryLabels: ['Vegetarian', 'Vegan', 'Gluten-Free', 'High-Protein', 'Tamil Nadu Special'],
    allergenInfo: [],
    safetyAdvice: 'Handle hot oil with extreme caution. Never allow water drops to splatter into hot oil.',
    storageAdvice: 'Best consumed immediately while hot and crispy.',
    imageUrl: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=800&q=80',
    tips: [
      'The water test is foolproof: drop a tiny ball of batter into water; if it floats immediately, your vadas will be airy.',
      'Keep your hands wet between each vada so the batter releases cleanly into the oil.'
    ],
    estimatedCostInr: 40
  },

  // 5. TAMIL NADU - Lemon Rice (Elumichai Sadam)
  {
    id: 'lemon-rice',
    title: 'Tangy Lemon Rice (Elumichai Sadam)',
    description: 'Refreshing Tamil Nadu lunchbox staple flavored with freshly squeezed lemon juice, golden crunchy peanuts, mustard, curry leaves, and vibrant turmeric.',
    cuisine: 'Tamil Nadu',
    region: 'South India',
    mealType: 'Lunch',
    provenance: 'curated',
    prepTimeMinutes: 5,
    cookTimeMinutes: 10,
    difficulty: 'Easy',
    servings: 2,
    equipment: ['Kadai / Skillet', 'Spatula'],
    ingredients: [
      { name: 'Rice', quantity: 250, unit: 'g', isOptional: false, substitutions: ['Cooked Rice', 'Millets'] },
      { name: 'Cooking Oil', quantity: 2, unit: 'tbsp', isOptional: false, substitutions: ['Gingelly Oil', 'Groundnut Oil'] },
      { name: 'Mustard Seeds', quantity: 1, unit: 'tsp', isOptional: false, substitutions: [] },
      { name: 'Green Chilli', quantity: 2, unit: 'pieces', isOptional: false, substitutions: [] },
      { name: 'Curry Leaves', quantity: 1, unit: 'sprig', isOptional: true, substitutions: [] },
      { name: 'Turmeric Powder', quantity: 0.5, unit: 'tsp', isOptional: false, substitutions: [] },
      { name: 'Ginger', quantity: 10, unit: 'g', isOptional: true, substitutions: [] },
      { name: 'Salt', quantity: 1, unit: 'tsp', isOptional: false, substitutions: [] }
    ],
    steps: [
      {
        stepNumber: 1,
        instruction: 'Cook 250g rice and spread out on a broad plate to cool down to room temperature so grains stay separate.',
        visualType: 'add_ingredients',
        ingredients: [{ name: 'Rice', quantity: 250, unit: 'g' }],
        equipment: ['Plate'],
        durationMinutes: 5,
        donenessCue: 'Rice grains are cool and distinct with no stickiness'
      },
      {
        stepNumber: 2,
        instruction: 'Heat 2 tablespoons of oil in a kadai over medium heat until shimmering.',
        visualType: 'heat_oil',
        ingredients: [{ name: 'Cooking Oil', quantity: 2, unit: 'tbsp' }],
        equipment: ['Kadai / Skillet'],
        heatLevel: 'medium',
        durationMinutes: 1,
        timerSeconds: 60,
        donenessCue: 'Oil is hot and shimmering'
      },
      {
        stepNumber: 3,
        instruction: 'Add mustard seeds, slit green chillies, minced ginger, and curry leaves. Sauté for 1 minute until fragrant.',
        visualType: 'temper_spices',
        ingredients: [{ name: 'Mustard Seeds', quantity: 1, unit: 'tsp' }, { name: 'Green Chilli', quantity: 2, unit: 'pieces' }, { name: 'Ginger', quantity: 10, unit: 'g' }, { name: 'Curry Leaves', quantity: 1, unit: 'sprig' }],
        equipment: ['Kadai / Skillet', 'Spatula'],
        heatLevel: 'medium',
        durationMinutes: 1,
        timerSeconds: 60,
        donenessCue: 'Mustard seeds splutter and chillies blister lightly'
      },
      {
        stepNumber: 4,
        instruction: 'Lower heat, stir in turmeric powder and salt, then turn off the heat immediately so turmeric does not burn.',
        visualType: 'add_ingredients',
        ingredients: [{ name: 'Turmeric Powder', quantity: 0.5, unit: 'tsp' }, { name: 'Salt', quantity: 1, unit: 'tsp' }],
        equipment: ['Kadai / Skillet'],
        heatLevel: 'off',
        durationMinutes: 1,
        donenessCue: 'Bright golden aromatic oil base'
      },
      {
        stepNumber: 5,
        instruction: 'Pour the spiced tempering over the cooled rice. Squeeze in fresh lemon juice and toss gently until all rice is sun-yellow.',
        visualType: 'saute',
        ingredients: [],
        equipment: ['Kadai / Skillet', 'Spatula'],
        heatLevel: 'off',
        durationMinutes: 2,
        donenessCue: 'Evenly distributed bright yellow rice with tangy scent'
      },
      {
        stepNumber: 6,
        instruction: 'Serve at room temperature with potato fry or crunchy vadam.',
        visualType: 'serve',
        ingredients: [],
        equipment: ['Serving Bowl'],
        heatLevel: 'off',
        donenessCue: 'Zesty, appetizing Lemon Rice ready to eat'
      }
    ],
    dietaryLabels: ['Vegetarian', 'Vegan', 'Gluten-Free', 'Tamil Nadu Special', 'Under 15 Minutes'],
    allergenInfo: ['Mustard'],
    safetyAdvice: 'Never boil lemon juice on high heat as it turns bitter.',
    storageAdvice: 'Pack in a lunchbox or store at room temperature for up to 8 hours.',
    imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80',
    tips: [
      'Always squeeze lemon juice after the pan is removed from heat to preserve vitamin C and avoid bitterness.'
    ],
    estimatedCostInr: 30
  },

  // 6. INTERNATIONAL - Quick Wok Egg Fried Rice (East Asian)
  {
    id: 'wok-egg-fried-rice',
    title: 'Quick Wok Egg Fried Rice',
    description: 'High-heat stir-fried rice with fluffy scrambled eggs, crisp caramelized onions, garlic, and savory soy seasoning.',
    cuisine: 'East Asian',
    region: 'International',
    mealType: 'Dinner',
    provenance: 'curated',
    prepTimeMinutes: 5,
    cookTimeMinutes: 10,
    difficulty: 'Easy',
    servings: 2,
    equipment: ['Wok / Wide Skillet', 'Spatula'],
    ingredients: [
      { name: 'Rice', quantity: 300, unit: 'g', isOptional: false, substitutions: ['Cooked Rice', 'Jasmine Rice'] },
      { name: 'Eggs', quantity: 3, unit: 'pieces', isOptional: false, substitutions: ['Tofu'] },
      { name: 'Onion', quantity: 80, unit: 'g', isOptional: false, substitutions: ['Spring Onion'] },
      { name: 'Garlic', quantity: 4, unit: 'cloves', isOptional: false, substitutions: ['Garlic Powder'] },
      { name: 'Cooking Oil', quantity: 2, unit: 'tbsp', isOptional: false, substitutions: [] },
      { name: 'Soy Sauce', quantity: 2, unit: 'tbsp', isOptional: false, substitutions: ['Tamari', 'Salt with dash of vinegar'] },
      { name: 'Black Pepper', quantity: 0.5, unit: 'tsp', isOptional: false, substitutions: ['White Pepper'] },
      { name: 'Salt', quantity: 0.5, unit: 'tsp', isOptional: false, substitutions: [] }
    ],
    steps: [
      {
        stepNumber: 1,
        instruction: 'Mince 4 cloves of garlic and finely chop 80g onions.',
        visualType: 'chop',
        ingredients: [{ name: 'Garlic', quantity: 4, unit: 'cloves' }, { name: 'Onion', quantity: 80, unit: 'g' }],
        equipment: ['Chef Knife', 'Cutting Board'],
        durationMinutes: 2,
        donenessCue: 'Uniformly minced aromatics'
      },
      {
        stepNumber: 2,
        instruction: 'Heat 1 tablespoon oil in a wok on high heat. Crack 3 eggs in, scramble lightly for 1 minute until 80% set, then remove to a plate.',
        visualType: 'saute',
        ingredients: [{ name: 'Eggs', quantity: 3, unit: 'pieces' }, { name: 'Cooking Oil', quantity: 1, unit: 'tbsp' }],
        equipment: ['Wok / Wide Skillet', 'Spatula'],
        heatLevel: 'high',
        durationMinutes: 1,
        timerSeconds: 60,
        donenessCue: 'Eggs are soft, glossy curds, not dry'
      },
      {
        stepNumber: 3,
        instruction: 'Add remaining 1 tbsp oil to hot wok. Sauté minced garlic and onions on high flame for 1 minute until fragrant.',
        visualType: 'saute',
        ingredients: [{ name: 'Garlic', quantity: 4, unit: 'cloves' }, { name: 'Onion', quantity: 80, unit: 'g' }, { name: 'Cooking Oil', quantity: 1, unit: 'tbsp' }],
        equipment: ['Wok / Wide Skillet', 'Spatula'],
        heatLevel: 'high',
        durationMinutes: 1,
        timerSeconds: 60,
        donenessCue: 'Garlic is golden and fragrant with wok-hei aroma'
      },
      {
        stepNumber: 4,
        instruction: 'Add chilled cooked rice, soy sauce, black pepper, and salt. Stir-fry rapidly on high flame for 3 minutes tossing continuously.',
        visualType: 'saute',
        ingredients: [{ name: 'Rice', quantity: 300, unit: 'g' }, { name: 'Soy Sauce', quantity: 2, unit: 'tbsp' }, { name: 'Black Pepper', quantity: 0.5, unit: 'tsp' }, { name: 'Salt', quantity: 0.5, unit: 'tsp' }],
        equipment: ['Wok / Wide Skillet', 'Spatula'],
        heatLevel: 'high',
        durationMinutes: 3,
        timerSeconds: 180,
        donenessCue: 'Rice grains are steaming, lightly seared, and seasoned'
      },
      {
        stepNumber: 5,
        instruction: 'Fold in the scrambled eggs, toss for 30 seconds to distribute, and serve hot.',
        visualType: 'serve',
        ingredients: [],
        equipment: ['Serving Bowl'],
        heatLevel: 'off',
        donenessCue: 'Piping hot restaurant-style egg fried rice'
      }
    ],
    dietaryLabels: ['High-Protein', 'Dairy-Free', 'Under 15 Minutes', 'International'],
    allergenInfo: ['Eggs', 'Soy'],
    safetyAdvice: 'Cook eggs thoroughly. When reheating rice, ensure it is heated until piping hot (75°C).',
    storageAdvice: 'Refrigerate within 2 hours. Consume within 2 days.',
    imageUrl: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=800&q=80',
    tips: [
      'High flame stir-frying is the secret to non-sticky, smoky egg fried rice.',
      'Cold, day-old cooked rice delivers the crispiest individual grains.'
    ],
    estimatedCostInr: 45
  },

  // 7. INTERNATIONAL - Classic Tomato Garlic Pasta (Italian)
  {
    id: 'classic-tomato-garlic-pasta',
    title: 'Classic Garlic & Tomato Penne',
    description: 'Rustic Italian comfort food made by simmering ripe tomatoes in extra virgin olive oil, sliced garlic, and tossing with al dente pasta.',
    cuisine: 'Italian',
    region: 'International',
    mealType: 'Dinner',
    provenance: 'curated',
    prepTimeMinutes: 5,
    cookTimeMinutes: 15,
    difficulty: 'Easy',
    servings: 2,
    equipment: ['Pasta Pot', 'Saucepan', 'Colander'],
    ingredients: [
      { name: 'Pasta', quantity: 200, unit: 'g', isOptional: false, substitutions: ['Penne', 'Spaghetti', 'Macaroni'] },
      { name: 'Tomato', quantity: 300, unit: 'g', isOptional: false, substitutions: ['Crushed Tomatoes'] },
      { name: 'Garlic', quantity: 5, unit: 'cloves', isOptional: false, substitutions: [] },
      { name: 'Cooking Oil', quantity: 2, unit: 'tbsp', isOptional: false, substitutions: ['Olive Oil'] },
      { name: 'Black Pepper', quantity: 0.5, unit: 'tsp', isOptional: false, substitutions: [] },
      { name: 'Salt', quantity: 1, unit: 'tsp', isOptional: false, substitutions: [] }
    ],
    steps: [
      {
        stepNumber: 1,
        instruction: 'Bring 2 liters of water to a rolling boil with 1 tablespoon of salt. Add 200g pasta and boil for 9 minutes until al dente.',
        visualType: 'boil',
        ingredients: [{ name: 'Pasta', quantity: 200, unit: 'g' }, { name: 'Salt', quantity: 1, unit: 'tsp' }],
        equipment: ['Pasta Pot'],
        heatLevel: 'high',
        durationMinutes: 9,
        timerSeconds: 540,
        donenessCue: 'Pasta is tender with a slight, pleasant bite in center'
      },
      {
        stepNumber: 2,
        instruction: 'Heat 2 tablespoons of oil in a skillet over medium heat. Sauté thinly sliced garlic for 1 minute until fragrant and lightly golden.',
        visualType: 'saute',
        ingredients: [{ name: 'Cooking Oil', quantity: 2, unit: 'tbsp' }, { name: 'Garlic', quantity: 5, unit: 'cloves' }],
        equipment: ['Saucepan'],
        heatLevel: 'medium',
        durationMinutes: 1,
        timerSeconds: 60,
        donenessCue: 'Garlic is golden and fragrant without browning excessively'
      },
      {
        stepNumber: 3,
        instruction: 'Add finely chopped ripe tomatoes, black pepper, and salt. Cook down for 7 minutes on medium heat until a glistening sauce forms.',
        visualType: 'simmer',
        ingredients: [{ name: 'Tomato', quantity: 300, unit: 'g' }, { name: 'Black Pepper', quantity: 0.5, unit: 'tsp' }],
        equipment: ['Saucepan'],
        heatLevel: 'medium',
        durationMinutes: 7,
        timerSeconds: 420,
        donenessCue: 'Sauce is reduced, thick, and coats the back of a spoon'
      },
      {
        stepNumber: 4,
        instruction: 'Drain pasta (reserve 2 tbsp pasta water). Add drained pasta and pasta water directly to tomato sauce. Toss for 1 minute.',
        visualType: 'add_ingredients',
        ingredients: [],
        equipment: ['Saucepan', 'Colander'],
        heatLevel: 'medium',
        durationMinutes: 1,
        timerSeconds: 60,
        donenessCue: 'Pasta is glossy and thoroughly enveloped by the rich tomato sauce'
      },
      {
        stepNumber: 5,
        instruction: 'Plate onto shallow bowls, drizzle a drop of fresh oil on top, and serve warm.',
        visualType: 'serve',
        ingredients: [],
        equipment: ['Serving Bowl'],
        heatLevel: 'off',
        donenessCue: 'Vibrant, aromatic Italian pasta ready to savor'
      }
    ],
    dietaryLabels: ['Vegetarian', 'Vegan', 'Under 30 Minutes', 'International'],
    allergenInfo: ['Gluten (Wheat Pasta)'],
    safetyAdvice: 'Consume immediately while warm for optimal pasta texture.',
    storageAdvice: 'Store leftover pasta in airtight container in fridge for up to 3 days.',
    imageUrl: 'https://images.unsplash.com/photo-1621996346565-e3d5d6281072?auto=format&fit=crop&w=800&q=80',
    tips: [
      'Reserving a splash of starchy cooking water creates a glossy emulsion that clings to the pasta.'
    ],
    estimatedCostInr: 50
  }
];
