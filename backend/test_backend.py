import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["app"] == "SAMACHIFY"

def test_ingredients_search():
    # Search by English name
    response = client.get("/api/ingredients?query=tomato")
    assert response.status_code == 200
    items = response.json()
    assert any(i["id"] == "tomato" for i in items)

    # Search by regional alias (thakkali)
    response_alias = client.get("/api/ingredients?query=thakkali")
    assert response_alias.status_code == 200
    items_alias = response_alias.json()
    assert any(i["id"] == "tomato" for i in items_alias)

def test_recipes_search_and_matching():
    payload = {
        "ingredients": ["egg", "rice", "tomato"],
        "servings": 2
    }
    response = client.post("/api/recipes/search", json=payload)
    assert response.status_code == 200
    results = response.json()
    assert len(results) > 0
    # The top recipes should have egg/rice matched
    top_recipe = results[0]
    assert "recipe" in top_recipe
    assert "match_percentage" in top_recipe
    assert top_recipe["match_percentage"] > 0

def test_budget_filter():
    payload = {
        "ingredients": ["rice"],
        "max_budget_inr": 50.0
    }
    response = client.post("/api/recipes/search", json=payload)
    assert response.status_code == 200
    results = response.json()
    for item in results:
        assert item["recipe"]["estimated_total_cost_inr"] <= 50.0

def test_leftover_rescue():
    payload = {
        "leftovers": ["cooked rice", "boiled potatoes"],
        "storage_duration_days": 1,
        "storage_type": "refrigerated"
    }
    response = client.post("/api/leftover/rescue", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert "suggested_rescue_recipes" in data
    assert len(data["suggested_rescue_recipes"]) > 0

def test_meal_plans_and_grocery():
    response = client.get("/api/meal-plans")
    assert response.status_code == 200
    plan = response.json()
    assert "days" in plan

    # Generate grocery list from plan
    grocery_resp = client.post("/api/meal-plans/grocery-list", json=plan)
    assert grocery_resp.status_code == 200
    grocery_data = grocery_resp.json()
    assert "items" in grocery_data
    assert grocery_data["total_estimated_cost_inr"] > 0

def test_photo_identification_and_confidence():
    fake_img = b"fake_jpeg_image_data_bytes_for_testing"
    files = {"file": ("test_kitchen.jpg", fake_img, "image/jpeg")}
    data = {"manual_notes": "cooked rice, curry leaves"}
    response = client.post("/api/vision/identify", files=files, data=data)
    assert response.status_code == 200
    res = response.json()
    assert "detected_ingredients" in res
    assert len(res["detected_ingredients"]) >= 5
    first = res["detected_ingredients"][0]
    assert "name" in first
    assert "category" in first
    assert "confidence" in first
    assert "uncertainty_indicator" in first
    # Check that user manual notes were incorporated
    assert any("rice" in i["name"].lower() for i in res["detected_ingredients"])

def test_cook_without_buying_anything_filter():
    # When user has rice, onion, and tomato and declared pantry staples
    payload = {
        "ingredients": ["rice", "onion", "tomato"],
        "pantry_staples": ["cooking oil", "chilli powder", "salt", "mustard seeds", "curry leaves"],
        "no_additional_shopping": True
    }
    response = client.post("/api/recipes/search", json=payload)
    assert response.status_code == 200
    results = response.json()
    assert len(results) > 0
    # Every returned result must have can_cook_without_shopping == True
    for item in results:
        assert item["can_cook_without_shopping"] is True
    # The tomato rice sadam should be found
    titles = [item["recipe"]["title"] for item in results]
    assert any("Tomato Rice" in t for t in titles)

def test_allergy_warning_detection():
    payload = {
        "ingredients": ["egg", "rice", "tomato"],
        "allergies": ["egg"]
    }
    response = client.post("/api/recipes/search", json=payload)
    assert response.status_code == 200
    results = response.json()
    egg_recipes = [r for r in results if any("egg" in i.lower() for i in r["matched_ingredients"])]
    assert len(egg_recipes) > 0
    for er in egg_recipes:
        assert er["is_safe_for_allergies"] is False
        assert "Allergen" in er["allergy_warning"] or "Egg" in er["allergy_warning"]

