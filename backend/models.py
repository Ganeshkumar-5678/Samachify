from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class Ingredient(BaseModel):
    id: str
    name: str
    category: str
    aliases: List[str] = []
    unit_default: str = "g"
    estimated_price_per_unit_inr: float = 10.0
    common_states: List[str] = ["fresh", "frozen", "canned", "dried", "cooked"]
    image_url: Optional[str] = None

class IngredientMatch(BaseModel):
    id: str
    name: str
    matched: bool
    state: Optional[str] = "fresh"
    estimated_cost_inr: Optional[float] = 0.0

class RecipeIngredient(BaseModel):
    name: str
    quantity: float
    unit: str
    is_optional: bool = False
    substitutions: List[str] = []
    estimated_cost_inr: float = 10.0

class Recipe(BaseModel):
    id: str
    title: str
    description: str
    cuisine: str
    country: str
    dish_type: str  # Breakfast, Lunch, Dinner, Snack
    prep_time_minutes: int
    cook_time_minutes: int
    difficulty: str  # Easy, Medium, Hard
    servings: int = 2
    estimated_total_cost_inr: float
    estimated_cost_per_serving_inr: float
    dietary_labels: List[str] = []  # Vegetarian, Vegan, High-Protein, Dairy-Free, Gluten-Free
    image_url: str
    ingredients: List[RecipeIngredient]
    instructions: List[str]
    tips: List[str] = []
    safety_advice: Optional[str] = None
    source: str = "curated"  # "curated" or "ai_generated"

class RecipeSearchRequest(BaseModel):
    ingredients: List[str]
    cuisine: Optional[str] = None
    max_budget_inr: Optional[float] = None
    dietary_preference: Optional[str] = None
    max_cooking_time_minutes: Optional[int] = None
    difficulty: Optional[str] = None
    servings: Optional[int] = 2
    no_additional_shopping: Optional[bool] = False
    allergies: Optional[List[str]] = []
    pantry_staples: Optional[List[str]] = []

class RecipeSearchResult(BaseModel):
    recipe: Recipe
    match_percentage: int
    matched_ingredients: List[str]
    missing_ingredients: List[Dict[str, Any]]
    total_missing_cost_inr: float
    can_cook_without_shopping: bool = False
    is_safe_for_allergies: bool = True
    allergy_warning: Optional[str] = None

class LeftoverRescueRequest(BaseModel):
    leftovers: List[str]
    storage_duration_days: Optional[int] = 1
    storage_type: Optional[str] = "refrigerated"  # refrigerated, frozen, room_temp
    extra_ingredients_available: Optional[List[str]] = []

class MealPlanSlot(BaseModel):
    recipe_id: str
    recipe_title: str
    cuisine: str
    cook_time_minutes: int
    difficulty: str
    image_url: str
    servings: int = 2

class MealPlanDay(BaseModel):
    day: str  # Mon, Tue, Wed, Thu, Fri, Sat, Sun
    date_str: str  # e.g., "Oct 21"
    breakfast: Optional[MealPlanSlot] = None
    lunch: Optional[MealPlanSlot] = None
    dinner: Optional[MealPlanSlot] = None
    snacks: Optional[MealPlanSlot] = None

class MealPlan(BaseModel):
    id: str
    title: str
    week_range: str
    days: List[MealPlanDay]

class GroceryItem(BaseModel):
    name: str
    quantity: float
    unit: str
    estimated_cost_inr: float
    checked: bool = False
    category: str = "Pantry"

class GroceryListResponse(BaseModel):
    items: List[GroceryItem]
    total_estimated_cost_inr: float
    item_count: int

class PantryItem(BaseModel):
    id: str
    name: str
    category: str
    quantity: float
    unit: str
    state: str = "fresh"  # fresh, frozen, canned, cooked, dried
    purchase_date: Optional[str] = None
    expiry_date: Optional[str] = None
    days_to_expiry: Optional[int] = None
    is_expiring_soon: bool = False

class VisionDetectionItem(BaseModel):
    name: str
    category: str
    confidence: float
    uncertainty_indicator: str = "High Confidence"  # "High Confidence", "Moderate Confidence", "Uncertain / Needs Confirmation"
    approximate_quantity: Optional[str] = None
    identification_notes: Optional[str] = None
    is_cooked: bool = False

class VisionDetectionResponse(BaseModel):
    detected_ingredients: List[VisionDetectionItem]
    confidence_summary: str
    provider: str
    is_live_ai: bool = False
    image_preview: Optional[str] = None
