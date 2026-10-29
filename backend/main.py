import os
from typing import List, Optional, Dict, Any
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

from models import (
    Ingredient, Recipe, RecipeSearchRequest, RecipeSearchResult,
    LeftoverRescueRequest, MealPlan, MealPlanDay, GroceryListResponse,
    GroceryItem, PantryItem, VisionDetectionResponse
)
from database import (
    INGREDIENTS_DB, INGREDIENT_CATEGORIES, RECIPES_DB,
    DEFAULT_MEAL_PLAN, DEFAULT_PANTRY
)
from ai_engine import detect_ingredients_from_image_data, generate_ai_recipe

app = FastAPI(
    title="SAMACHIFY API",
    description="Backend API for SAMACHIFY — AI-Powered Global Kitchen & Recipe Assistant",
    version="1.0.0"
)

# Enable CORS for Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage for runtime persistence
saved_recipes_store: List[str] = ["tomato-egg-curry", "egg-fried-rice"]
current_meal_plan: MealPlan = DEFAULT_MEAL_PLAN
pantry_store: List[PantryItem] = list(DEFAULT_PANTRY)

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "app": "SAMACHIFY",
        "tagline": "Your Kitchen. Your Rules. Our Smart Ideas.",
        "version": "1.0.0",
        "ingredients_count": len(INGREDIENTS_DB),
        "recipes_count": len(RECIPES_DB)
    }

@app.get("/api/categories")
def get_categories():
    return INGREDIENT_CATEGORIES

@app.get("/api/ingredients", response_model=List[Ingredient])
def get_ingredients(
    query: Optional[str] = Query(None, description="Search by name or regional alias"),
    category: Optional[str] = Query(None, description="Filter by ingredient category")
):
    results = INGREDIENTS_DB
    if category and category != "all":
        results = [i for i in results if i.category.lower() == category.lower()]
    
    if query:
        q = query.strip().lower()
        filtered = []
        for ing in results:
            if q in ing.name.lower() or any(q in alias.lower() for alias in ing.aliases):
                filtered.append(ing)
        return filtered
    
    return results

@app.post("/api/recipes/search", response_model=List[RecipeSearchResult])
def search_recipes(req: RecipeSearchRequest):
    user_ings = [i.strip().lower() for i in req.ingredients if i.strip()]
    pantry_staples = [s.strip().lower() for s in (req.pantry_staples or []) if s.strip()]
    user_allergies = [a.strip().lower() for a in (req.allergies or []) if a.strip()]
    results = []

    for recipe in RECIPES_DB:
        # Check cuisine filter
        if req.cuisine and req.cuisine.lower() != "all":
            c_req = req.cuisine.lower()
            if c_req not in recipe.cuisine.lower() and c_req not in recipe.country.lower():
                continue
        
        # Check budget filter
        if req.max_budget_inr and recipe.estimated_total_cost_inr > req.max_budget_inr:
            continue

        # Check dietary filter
        if req.dietary_preference and req.dietary_preference.lower() != "all":
            pref = req.dietary_preference.lower()
            if not any(pref in tag.lower() for tag in recipe.dietary_labels):
                continue

        # Check cooking time filter
        if req.max_cooking_time_minutes and (recipe.prep_time_minutes + recipe.cook_time_minutes) > req.max_cooking_time_minutes:
            continue

        # Check difficulty filter
        if req.difficulty and req.difficulty.lower() != "all" and recipe.difficulty.lower() != req.difficulty.lower():
            continue

        # Match ingredients
        matched = []
        missing = []
        missing_cost = 0.0
        essential_missing_count = 0

        # Check allergy safety
        allergy_triggers = []
        for a in user_allergies:
            for r_ing in recipe.ingredients:
                if a in r_ing.name.lower() or any(a in sub.lower() for sub in r_ing.substitutions):
                    allergy_triggers.append(f"{a.title()} (in {r_ing.name})")

        is_safe = len(allergy_triggers) == 0
        allergy_warning = f"Contains {', '.join(set(allergy_triggers))}. Reminder: Image recognition cannot guarantee absence of allergens or cross-contamination." if not is_safe else None

        for r_ing in recipe.ingredients:
            r_name = r_ing.name.lower()
            # Check match against confirmed user ingredients
            is_in_user = any(u_ing in r_name or r_name in u_ing for u_ing in user_ings)
            # Check if covered by declared pantry staples
            is_in_staples = any(s in r_name or r_name in s for s in pantry_staples)

            if is_in_user or is_in_staples:
                matched.append(r_ing.name)
            else:
                missing.append({
                    "name": r_ing.name,
                    "quantity": r_ing.quantity,
                    "unit": r_ing.unit,
                    "is_optional": r_ing.is_optional,
                    "estimated_cost_inr": r_ing.estimated_cost_inr,
                    "substitutions": r_ing.substitutions
                })
                if not r_ing.is_optional:
                    missing_cost += r_ing.estimated_cost_inr
                    essential_missing_count += 1

        total_ingredients_count = len(recipe.ingredients)
        match_pct = round((len(matched) / total_ingredients_count) * 100) if total_ingredients_count > 0 else 0
        can_cook_without_shopping = (essential_missing_count == 0)

        # If user enabled "Cook Without Buying Anything", enforce can_cook_without_shopping
        if req.no_additional_shopping and not can_cook_without_shopping:
            continue

        # Include recipe if at least 1 ingredient matches or if no ingredients were specified
        if not user_ings or len(matched) > 0:
            results.append(RecipeSearchResult(
                recipe=recipe,
                match_percentage=match_pct,
                matched_ingredients=matched,
                missing_ingredients=missing,
                total_missing_cost_inr=missing_cost,
                can_cook_without_shopping=can_cook_without_shopping,
                is_safe_for_allergies=is_safe,
                allergy_warning=allergy_warning
            ))

    # Prioritize: 1) Can cook without shopping, 2) Match percentage descending, 3) Lowest missing cost
    results.sort(key=lambda r: (1 if r.can_cook_without_shopping else 0, r.match_percentage, -r.total_missing_cost_inr), reverse=True)
    return results

@app.get("/api/recipes/{recipe_id}", response_model=Recipe)
def get_recipe_details(recipe_id: str):
    for r in RECIPES_DB:
        if r.id == recipe_id:
            return r
    raise HTTPException(status_code=404, detail="Recipe not found")

@app.post("/api/recipes/generate", response_model=Recipe)
def generate_recipe(req: RecipeSearchRequest):
    if not req.ingredients:
        raise HTTPException(status_code=400, detail="Please provide at least one ingredient to generate a recipe.")
    
    new_recipe = generate_ai_recipe(
        ingredients=req.ingredients,
        cuisine=req.cuisine,
        max_budget_inr=req.max_budget_inr,
        dietary_preference=req.dietary_preference,
        servings=req.servings or 2,
        allergies=req.allergies
    )
    # Add to in-memory database
    RECIPES_DB.append(new_recipe)
    return new_recipe

@app.post("/api/vision/identify")
async def identify_food_photo(
    file: UploadFile = File(...),
    manual_notes: Optional[str] = Form(None)
):
    if not file.filename.lower().endswith(('.jpg', '.jpeg', '.png', '.webp')):
        raise HTTPException(status_code=400, detail="Invalid file type. Please upload a JPG, JPEG, PNG, or WebP image.")
    
    content = await file.read()
    if len(content) > 10 * 1024 * 1024:  # 10MB limit
        raise HTTPException(status_code=400, detail="Image exceeds 10MB file size limit.")

    result = detect_ingredients_from_image_data(file.filename, content, manual_notes)
    return result

@app.post("/api/leftover/rescue")
def rescue_leftovers(req: LeftoverRescueRequest):
    if not req.leftovers:
        raise HTTPException(status_code=400, detail="Please enter at least one leftover item.")
    
    # Check food safety rules
    safety_warning = None
    if req.storage_type == "room_temp" and (req.storage_duration_days or 0) > 1:
        safety_warning = "Caution: Cooked food stored at room temperature for over 24 hours poses high bacterial risk. Inspect carefully for odor and discard if in doubt."
    elif (req.storage_duration_days or 0) > 4 and req.storage_type == "refrigerated":
        safety_warning = "Food safety notice: Refrigerated leftovers older than 4 days should be evaluated cautiously. Always boil or thoroughly reheat to at least 75°C (165°F)."

    # Find or adapt recipes for leftovers
    matched_recipes = []
    leftover_terms = [l.lower() for l in req.leftovers]
    
    # Check existing recipes
    for r in RECIPES_DB:
        title_lower = r.title.lower()
        if any(term in title_lower for term in leftover_terms) or "leftover" in title_lower:
            matched_recipes.append(r)
    
    # If cutlet or fried rice wasn't matched, add the cutlet recipe
    if not matched_recipes:
        cutlet = next((r for r in RECIPES_DB if r.id == "leftover-rice-crispy-cutlets"), None)
        if cutlet:
            matched_recipes.append(cutlet)

    return {
        "status": "success",
        "leftovers_provided": req.leftovers,
        "storage_safety_evaluation": safety_warning or "Storage duration is within safe thresholds. Ensure complete reheating before consumption.",
        "safe_reheating_steps": [
            "Reheat leftovers until steaming hot throughout (at least 75°C / 165°F).",
            "Do not reheat the same leftover portion more than once.",
            "Cover dishes in microwave or skillet to retain moisture while heating evenly."
        ],
        "suggested_rescue_recipes": matched_recipes
    }

@app.get("/api/meal-plans", response_model=MealPlan)
def get_meal_plan():
    global current_meal_plan
    return current_meal_plan

@app.post("/api/meal-plans", response_model=MealPlan)
def update_meal_plan(plan: MealPlan):
    global current_meal_plan
    current_meal_plan = plan
    return current_meal_plan

@app.post("/api/meal-plans/grocery-list", response_model=GroceryListResponse)
def generate_grocery_list(plan: MealPlan):
    grocery_dict: Dict[str, GroceryItem] = {}
    
    for day in plan.days:
        for slot in [day.breakfast, day.lunch, day.dinner]:
            if slot:
                # Find recipe ingredients
                rec = next((r for r in RECIPES_DB if r.id == slot.recipe_id), None)
                if rec:
                    for ing in rec.ingredients:
                        name_key = ing.name.split('(')[0].strip()
                        if name_key in grocery_dict:
                            grocery_dict[name_key].quantity += ing.quantity
                            grocery_dict[name_key].estimated_cost_inr += ing.estimated_cost_inr
                        else:
                            grocery_dict[name_key] = GroceryItem(
                                name=name_key,
                                quantity=ing.quantity,
                                unit=ing.unit,
                                estimated_cost_inr=ing.estimated_cost_inr,
                                checked=False,
                                category="Produce" if any(w in name_key.lower() for w in ["tomato", "onion", "garlic", "carrot"]) else "Staples"
                            )

    items = list(grocery_dict.values())
    total_cost = sum(i.estimated_cost_inr for i in items)
    return GroceryListResponse(
        items=items,
        total_estimated_cost_inr=round(total_cost, 2),
        item_count=len(items)
    )

@app.get("/api/pantry", response_model=List[PantryItem])
def get_pantry():
    return pantry_store

@app.post("/api/pantry", response_model=List[PantryItem])
def update_pantry(items: List[PantryItem]):
    global pantry_store
    pantry_store = items
    return pantry_store

@app.get("/api/saved-recipes")
def get_saved_recipes():
    saved = [r for r in RECIPES_DB if r.id in saved_recipes_store]
    return saved

@app.post("/api/saved-recipes/toggle")
def toggle_save_recipe(recipe_id: str = Query(...)):
    if recipe_id in saved_recipes_store:
        saved_recipes_store.remove(recipe_id)
        return {"saved": False, "recipe_id": recipe_id}
    else:
        saved_recipes_store.append(recipe_id)
        return {"saved": True, "recipe_id": recipe_id}

@app.get("/api/cuisines")
def get_cuisines():
    return [
        {"id": "all", "name": "All Cuisines", "count": len(RECIPES_DB)},
        {"id": "south-indian", "name": "South Indian (Tamil, Kerala, Andhra)", "count": 4},
        {"id": "east-asian", "name": "East Asian (Chinese, Japanese)", "count": 2},
        {"id": "indian-fusion", "name": "North & Fusion Indian", "count": 3},
        {"id": "european", "name": "Italian & Mediterranean", "count": 2},
        {"id": "middle-eastern", "name": "Middle Eastern & Levantine", "count": 1},
        {"id": "americas", "name": "Mexican & Americas", "count": 1},
    ]

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
