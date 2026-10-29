export interface IngredientAlias {
  canonical: string;
  category: string;
  tamilNames: string[];
  aliases: string[];
  defaultUnit: string;
}

export const TAMIL_INGREDIENT_CATALOG: IngredientAlias[] = [
  {
    canonical: 'Rice',
    category: 'Grains & Cereals',
    tamilNames: ['Arisi', 'Puzhungal Arisi', 'Pacharisi', 'Chawal'],
    aliases: ['raw rice', 'boiled rice', 'sona masoori', 'basmati', 'ponni'],
    defaultUnit: 'g'
  },
  {
    canonical: 'Onion',
    category: 'Vegetables',
    tamilNames: ['Vengayam', 'Periya Vengayam', 'Chinna Vengayam', 'Shallots'],
    aliases: ['onions', 'red onion', 'small onion', 'sambhar onion', 'pyaz'],
    defaultUnit: 'g'
  },
  {
    canonical: 'Tomato',
    category: 'Vegetables',
    tamilNames: ['Thakkali', 'Naattu Thakkali'],
    aliases: ['tomatoes', 'tamatar'],
    defaultUnit: 'g'
  },
  {
    canonical: 'Green Chilli',
    category: 'Vegetables',
    tamilNames: ['Pachai Milagai', 'Milagai'],
    aliases: ['chilli', 'green chilies', 'hari mirch'],
    defaultUnit: 'pieces'
  },
  {
    canonical: 'Coconut',
    category: 'Fruits & Nuts',
    tamilNames: ['Thengai', 'Thengai Thuruval', 'Nariyal'],
    aliases: ['grated coconut', 'fresh coconut', 'coconut slices'],
    defaultUnit: 'g'
  },
  {
    canonical: 'Curry Leaves',
    category: 'Herbs & Spices',
    tamilNames: ['Kariveppilai', 'Kadi Patta'],
    aliases: ['curry leaf', 'sweet neem'],
    defaultUnit: 'sprigs'
  },
  {
    canonical: 'Mustard Seeds',
    category: 'Herbs & Spices',
    tamilNames: ['Kadugu', 'Rai'],
    aliases: ['black mustard', 'kaduku'],
    defaultUnit: 'tsp'
  },
  {
    canonical: 'Toor Dal',
    category: 'Pulses & Legumes',
    tamilNames: ['Thuvaram Paruppu', 'Paruppu'],
    aliases: ['pigeon pea', 'tuvar dal', 'arhar dal', 'dal'],
    defaultUnit: 'g'
  },
  {
    canonical: 'Moong Dal',
    category: 'Pulses & Legumes',
    tamilNames: ['Paasi Paruppu', 'Payatham Paruppu'],
    aliases: ['yellow moong dal', 'split mung dal'],
    defaultUnit: 'g'
  },
  {
    canonical: 'Urad Dal',
    category: 'Pulses & Legumes',
    tamilNames: ['Ulutham Paruppu', 'Ulandhu'],
    aliases: ['black gram', 'split urad dal'],
    defaultUnit: 'g'
  },
  {
    canonical: 'Chana Dal',
    category: 'Pulses & Legumes',
    tamilNames: ['Kadalai Paruppu'],
    aliases: ['bengal gram', 'split chickpea'],
    defaultUnit: 'g'
  },
  {
    canonical: 'Eggs',
    category: 'Meat & Eggs',
    tamilNames: ['Muttai', 'Anda'],
    aliases: ['egg', 'chicken egg'],
    defaultUnit: 'pieces'
  },
  {
    canonical: 'Paneer',
    category: 'Dairy',
    tamilNames: ['Paneer', 'Cottage Cheese'],
    aliases: ['indian cottage cheese'],
    defaultUnit: 'g'
  },
  {
    canonical: 'Chicken',
    category: 'Meat & Eggs',
    tamilNames: ['Kozhi Kari', 'Kozhi', 'Murgh'],
    aliases: ['chicken breast', 'poultry'],
    defaultUnit: 'g'
  },
  {
    canonical: 'Potato',
    category: 'Vegetables',
    tamilNames: ['Urulaikizhangu', 'Urulai', 'Aloo'],
    aliases: ['potatoes'],
    defaultUnit: 'g'
  },
  {
    canonical: 'Wheat Flour',
    category: 'Grains & Cereals',
    tamilNames: ['Godhumai Maavu', 'Atta'],
    aliases: ['chapati flour', 'whole wheat flour', 'flour'],
    defaultUnit: 'g'
  },
  {
    canonical: 'Okra / Ladies Finger',
    category: 'Vegetables',
    tamilNames: ['Vendakkai', 'Bhindi'],
    aliases: ['okra', 'ladies finger'],
    defaultUnit: 'g'
  },
  {
    canonical: 'Brinjal / Eggplant',
    category: 'Vegetables',
    tamilNames: ['Kathirikai', 'Baingan'],
    aliases: ['eggplant', 'aubergine', 'brinjal'],
    defaultUnit: 'g'
  },
  {
    canonical: 'Drumstick',
    category: 'Vegetables',
    tamilNames: ['Murungakkai', 'Sahjan'],
    aliases: ['moringa drumstick'],
    defaultUnit: 'pieces'
  },
  {
    canonical: 'Spinach',
    category: 'Vegetables',
    tamilNames: ['Keerai', 'Arai Keerai', 'Palak', 'Pasalai Keerai'],
    aliases: ['spinach leaves', 'greens'],
    defaultUnit: 'g'
  },
  {
    canonical: 'Garlic',
    category: 'Vegetables',
    tamilNames: ['Poondu', 'Vellai Poondu', 'Lehsun'],
    aliases: ['garlic cloves'],
    defaultUnit: 'cloves'
  },
  {
    canonical: 'Ginger',
    category: 'Vegetables',
    tamilNames: ['Inji', 'Adrak'],
    aliases: ['fresh ginger', 'ginger root'],
    defaultUnit: 'g'
  },
  {
    canonical: 'Cumin Seeds',
    category: 'Herbs & Spices',
    tamilNames: ['Seeragam', 'Jeera'],
    aliases: ['cumin'],
    defaultUnit: 'tsp'
  },
  {
    canonical: 'Turmeric Powder',
    category: 'Herbs & Spices',
    tamilNames: ['Manjal Thool', 'Haldi'],
    aliases: ['turmeric', 'manjal'],
    defaultUnit: 'tsp'
  },
  {
    canonical: 'Tamarind',
    category: 'Herbs & Spices',
    tamilNames: ['Puli', 'Imli'],
    aliases: ['tamarind paste', 'tamarind pulp'],
    defaultUnit: 'g'
  },
  {
    canonical: 'Cooking Oil',
    category: 'Oils & Condiments',
    tamilNames: ['Ennai', 'Nallennai', 'Kadalai Ennai', 'Tel'],
    aliases: ['oil', 'gingelly oil', 'sesame oil', 'groundnut oil', 'sunflower oil'],
    defaultUnit: 'tbsp'
  },
  {
    canonical: 'Ghee',
    category: 'Dairy',
    tamilNames: ['Nei', 'Clarified Butter'],
    aliases: ['ghee', 'cow ghee'],
    defaultUnit: 'tsp'
  },
  {
    canonical: 'Curd / Yogurt',
    category: 'Dairy',
    tamilNames: ['Thayir', 'Dahi'],
    aliases: ['curd', 'yogurt', 'plain yogurt'],
    defaultUnit: 'g'
  },
  {
    canonical: 'Black Pepper',
    category: 'Herbs & Spices',
    tamilNames: ['Milagu', 'Kali Mirch'],
    aliases: ['crushed pepper', 'pepper powder', 'black peppercorns'],
    defaultUnit: 'tsp'
  },
  {
    canonical: 'Salt',
    category: 'Pantry Staples',
    tamilNames: ['Uppu', 'Kal Uppu', 'Namak'],
    aliases: ['table salt', 'sea salt', 'rock salt'],
    defaultUnit: 'tsp'
  },
  {
    canonical: 'Chilli Powder',
    category: 'Herbs & Spices',
    tamilNames: ['Milagai Thool', 'Lal Mirch'],
    aliases: ['red chilli powder', 'kashmiri chilli powder'],
    defaultUnit: 'tsp'
  },
  {
    canonical: 'Coriander Leaves',
    category: 'Herbs & Spices',
    tamilNames: ['Kothamalli', 'Dhaniya Patta'],
    aliases: ['fresh cilantro', 'coriander'],
    defaultUnit: 'sprigs'
  },
  {
    canonical: 'Asafoetida / Hing',
    category: 'Herbs & Spices',
    tamilNames: ['Perungayam', 'Hing'],
    aliases: ['compounded asafoetida', 'asafoetida powder'],
    defaultUnit: 'pinch'
  },
  {
    canonical: 'Semolina / Rava',
    category: 'Grains & Cereals',
    tamilNames: ['Rava', 'Sooji', 'Suji'],
    aliases: ['semolina', 'bombay rava'],
    defaultUnit: 'g'
  },
  {
    canonical: 'Pasta',
    category: 'Grains & Cereals',
    tamilNames: ['Pasta'],
    aliases: ['penne', 'spaghetti', 'macaroni', 'fusilli'],
    defaultUnit: 'g'
  },
  {
    canonical: 'Noodles',
    category: 'Grains & Cereals',
    tamilNames: ['Noodles'],
    aliases: ['hakka noodles', 'ramen', 'egg noodles'],
    defaultUnit: 'g'
  },
  {
    canonical: 'Soy Sauce',
    category: 'Oils & Condiments',
    tamilNames: ['Soy Sauce'],
    aliases: ['dark soy sauce', 'light soy sauce', 'tamari'],
    defaultUnit: 'tbsp'
  }
];

export function normalizeIngredientName(raw: string): { canonical: string; matchedAlias?: string } {
  const clean = raw.trim().toLowerCase();
  if (!clean) return { canonical: raw };

  for (const item of TAMIL_INGREDIENT_CATALOG) {
    if (item.canonical.toLowerCase() === clean) {
      return { canonical: item.canonical };
    }
    for (const tamil of item.tamilNames) {
      if (clean === tamil.toLowerCase() || clean.includes(tamil.toLowerCase()) || tamil.toLowerCase().includes(clean)) {
        return { canonical: item.canonical, matchedAlias: tamil };
      }
    }
    for (const alias of item.aliases) {
      if (clean === alias.toLowerCase() || clean.includes(alias.toLowerCase())) {
        return { canonical: item.canonical, matchedAlias: alias };
      }
    }
  }

  // Capitalize neatly if not in catalog
  return { canonical: raw.trim().charAt(0).toUpperCase() + raw.trim().slice(1) };
}

export function searchIngredientSuggestions(query: string): { name: string; category: string; tamilName?: string }[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const results: { name: string; category: string; tamilName?: string }[] = [];
  for (const item of TAMIL_INGREDIENT_CATALOG) {
    const canonicalMatch = item.canonical.toLowerCase().includes(q);
    const tamilMatch = item.tamilNames.find((t) => t.toLowerCase().includes(q));
    const aliasMatch = item.aliases.find((a) => a.toLowerCase().includes(q));

    if (canonicalMatch || tamilMatch || aliasMatch) {
      results.push({
        name: item.canonical,
        category: item.category,
        tamilName: item.tamilNames[0]
      });
    }
  }

  return results.slice(0, 8);
}

export function normalizeIngredient(raw: string): { original: string; normalized: string; matchedTamilWord?: string } {
  const result = normalizeIngredientName(raw);
  return {
    original: raw,
    normalized: result.canonical.toLowerCase(),
    matchedTamilWord: result.matchedAlias?.toLowerCase(),
  };
}

export function searchTamilIngredients(query: string): { original: string; normalized: string; category: string; tamilName?: string }[] {
  const suggestions = searchIngredientSuggestions(query);
  return suggestions.map((s) => ({
    original: s.name,
    normalized: s.name.toLowerCase(),
    category: s.category,
    tamilName: s.tamilName,
  }));
}

