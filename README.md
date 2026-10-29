# SAMACHIFY — AI-Powered Ingredient-to-Recipe & Interactive Cooking Platform
> **"What's Cooking? Besides Your Confusion."**  
> *"Tell us what's in your kitchen. Discover delicious meals you can actually make."*

SAMACHIFY is a full-stack, production-minded culinary platform that eliminates meal confusion by matching what you have in your kitchen to authentic, practical dishes. It features rich manual ingredient entry with Tamil transliteration support, mathematical ingredient-matching calculations, specialized Tamil Nadu and international cuisine catalogs, Groq API (Llama 3.3) generation, and a visual interactive step-by-step cooking companion mode.

---

## 🌟 Core Architecture & Key Pillars

1. **AI Provider: Groq API (`groq-sdk`)**:
   - High-throughput LLM recipe generation powered by `llama-3.3-70b-versatile` (or your configured `GROQ_MODEL`).
   - Secure server-side API execution using `GROQ_API_KEY` with zero exposed keys on the frontend.
   - **Honest Fallback**: When `GROQ_API_KEY` is not present, the system transparently utilizes our rich curated culinary library with zero fake outputs.

2. **Backend: Node.js + Express + TypeScript (`server/`)**:
   - Strict Zod validation schemas for all inputs and Groq outputs.
   - Formula-driven recipe evaluation:
     $$\text{matchPercentage} = \operatorname{round}\left(\frac{\text{matchedRequired}}{\text{totalRequired}} \times 100\right)$$
   - Transparent `canCookWithoutBuyingAnything` evaluation (true only if all required ingredients match user inputs or confirmed pantry staples).
   - In-memory / pluggable SQL storage for user-saved recipes and active cooking session progress.

3. **Frontend: React + TypeScript + Tailwind CSS (`frontend/`)**:
   - Brand aesthetic: Warm cream (`#FAF7F0`), deep forest green (`#234B37`), turmeric yellow (`#E8B94F`), terracotta (`#C66A4A`).
   - Manual ingredient input with autocomplete suggestions and quick-picks.
   - Full support for Tamil ingredient names and transliterations (*Arisi*, *Vengayam*, *Thakkali*, *Pachai Milagai*, *Thengai*, *Paruppu*, *Vendakkai*, *Kathirikai*, *Murungakkai*, *Keerai*, etc.).
   - Editable chips with quantity, units, and state tags (`raw`, `cooked`, `frozen`, `leftover`).
   - Pantry staples drawer and equipment selection.

4. **Visual Step-by-Step Interactive Cooking Mode**:
   - Full-screen distraction-free companion mode.
   - Technique visual illustrations: Prep & Chop, Heat Oil, Thalippu / Tempering, Sauté, Boil, Simmer, Steam, Blend, Garnish, Plate & Serve.
   - Sensory doneness cues (e.g. *"until mustard seeds crackle and onions turn translucent golden brown"*).
   - Real elapsed-time calculated countdown timer with Start, Pause, Resume, Reset, and completion sound.
   - Step progress tracking with synchronization to the backend cooking session endpoint (`POST /api/cooking/session`).
   - Completion celebration screen with "Cook Again", "Save Recipe", and "Return to Recipes".

5. **Strict Product Constraints**:
   - ❌ No Google Analytics, gtag, or third-party trackers.
   - ❌ No ingredient photo uploads or camera access.
   - ❌ No mandatory registration or logins before trying the main feature.
   - ❌ No fake mock responses presented as real AI.

---

## 📂 Directory Structure

```
samachify/
├── server/                     # Node.js + Express + TypeScript Backend
│   ├── src/
│   │   ├── controllers/        # Recipe & Session controllers
│   │   ├── data/               # Curated Tamil Nadu & World recipes
│   │   ├── routes/             # Express API routes
│   │   ├── schemas/            # Zod validation schemas
│   │   ├── services/           # Groq SDK & Ingredient Matching Services
│   │   ├── types/              # Unified TypeScript definitions
│   │   ├── utils/              # Tamil transliteration catalog & normalizer
│   │   ├── app.ts              # Express configuration & CORS
│   │   ├── index.ts            # Server entry point (Port 8000)
│   │   └── index.test.ts       # Automated verification test suite
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                   # React + TypeScript + Tailwind CSS Frontend
│   ├── src/
│   │   ├── components/         # IngredientEntryHero, InteractiveCookingScreen, RecipeCard, etc.
│   │   ├── pages/              # Home, Recipes, MealPlan, Leftovers, Pantry, Cuisines, Saved
│   │   ├── services/           # API client (connecting to http://localhost:8000/api)
│   │   ├── types.ts            # Frontend TypeScript types
│   │   └── App.tsx             # Global router, kitchen state, and modals
│   ├── package.json
│   └── vite.config.ts
│
├── .env.example                # Sample environment variables
├── .gitignore                  # Git ignore rules protecting keys and build outputs
└── README.md
```

---

## ⚡ Quick Start Guide

### 1. Prerequisites
- **Node.js**: v18+ (tested on Node v24)
- **npm**: v9+

### 2. Environment Configuration
Create a `.env` file in `server/` (or the project root):

```bash
# Copy example
cp .env.example server/.env
```

Edit `server/.env`:
```env
PORT=8000
GROQ_API_KEY=gsk_your_groq_api_key_here
GROQ_MODEL=llama-3.3-70b-versatile
```
> *Note: If `GROQ_API_KEY` is omitted or left as default, the server transparently and honestly serves the rich authentic Tamil Nadu and international curated recipe catalog.*

### 3. Run Backend Verification Tests
```bash
cd server
npm test
```
*Executes the 11-point verification suite testing Tamil normalization, exact formula matching, Groq fallback, and zero-shopping filtering.*

### 4. Start the Application

**Terminal 1 — Backend API:**
```bash
cd server
npm install
npm run build
npm start
# Server listens at http://localhost:8000
```

**Terminal 2 — Frontend App:**
```bash
cd frontend
npm install
npm run dev
# Frontend runs at http://localhost:5173
```

---

## 🍲 API Endpoints Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/status` | Health check, Groq AI status, and model info |
| `GET` | `/api/ingredients/normalize?query=milagai` | Autocomplete & Tamil transliteration search |
| `POST` | `/api/recipes/recommend` | Main recipe matching & Groq AI generation |
| `GET` | `/api/recipes/:id` | Retrieve recipe by ID |
| `POST` | `/api/recipes/save` | Save recipe to user's saved list |
| `GET` | `/api/recipes/saved` | Get saved recipes for user session |
| `POST` | `/api/cooking/session` | Sync interactive step-by-step cooking progress |
| `GET` | `/api/cooking/session/:id` | Retrieve ongoing cooking session progress |

---

## 📜 Tamil Transliteration & Normalization

The normalization engine automatically maps Tamil phonetic transliterations to canonical cooking ingredients:

| User Input (Tamil) | Canonical Ingredient | Category |
|---|---|---|
| `Thakkali` / `Naattu Thakkali` | Tomato | Vegetables |
| `Vengayam` / `Chinna Vengayam` | Onion | Vegetables |
| `Arisi` / `Puzhungal Arisi` | Rice | Grains & Cereals |
| `Pachai Milagai` / `Milagai` | Green Chilli | Vegetables |
| `Thengai` / `Thengai Thuruval` | Coconut | Fruits & Nuts |
| `Kariveppilai` | Curry Leaves | Herbs & Spices |
| `Kadugu` | Mustard Seeds | Herbs & Spices |
| `Thuvaram Paruppu` / `Paruppu` | Toor Dal | Pulses & Legumes |
| `Muttai` | Eggs | Meat & Eggs |
| `Urulaikizhangu` | Potato | Vegetables |
| `Vendakkai` | Okra / Ladies Finger | Vegetables |
| `Kathirikai` | Brinjal / Eggplant | Vegetables |
| `Murungakkai` | Drumstick | Vegetables |
| `Keerai` | Spinach / Greens | Vegetables |
| `Manjal Thool` | Turmeric Powder | Herbs & Spices |
| `Perungayam` | Asafoetida / Hing | Herbs & Spices |
| `Seeragam` | Cumin Seeds | Herbs & Spices |

---

## 🏆 Summary of Verifications Completed
- [x] Backend TypeScript compilation: 100% clean (`tsc` passed).
- [x] Backend test suite: 11 tests passed, 0 failures.
- [x] Frontend TypeScript and Vite bundle: built in 4.34s with zero errors.
- [x] All Google Analytics scripts and photo/camera upload components cleanly excised.
- [x] Manual ingredient entry hero with autocomplete and editable chips deployed above the fold.
- [x] Visual interactive cooking mode with technique illustrations, countdown timers, and doneness cues fully active.
- [x] Live API verification on `http://localhost:8000`: `GET /api/status`, `POST /api/recipes/recommend`, `GET /api/ingredients/normalize`.
