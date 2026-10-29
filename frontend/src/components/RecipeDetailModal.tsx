import React, { useState, useEffect } from 'react';
import {
  X, Clock, BarChart2, IndianRupee, Users, Plus, Minus,
  Bookmark, CalendarPlus, Printer, Check, AlertCircle, Sparkles, Shield,
  Play, ChevronLeft, ChevronRight, RotateCcw, AlertTriangle
} from 'lucide-react';
import { Recipe } from '../types';

interface RecipeDetailModalProps {
  recipe: Recipe | null;
  onClose: () => void;
  isSaved?: boolean;
  onToggleSave?: (recipeId: string) => void;
  onAddToMealPlan?: (recipe: Recipe) => void;
  onStartInteractiveCooking?: (recipe: Recipe) => void;
  userIngredients?: string[];
  userAllergies?: string[];
}

export const RecipeDetailModal: React.FC<RecipeDetailModalProps> = ({
  recipe,
  onClose,
  isSaved = false,
  onToggleSave,
  onAddToMealPlan,
  onStartInteractiveCooking,
  userIngredients = [],
  userAllergies = [],
}) => {
  if (!recipe) return null;

  const [currentServings, setCurrentServings] = useState<number>(recipe.servings || 2);
  const [checkedIngredients, setCheckedIngredients] = useState<Record<string, boolean>>({});
  
  // Interactive "Let's Start Cooking" beginner mode
  const [isCookingMode, setIsCookingMode] = useState<boolean>(false);
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const [timerSeconds, setTimerSeconds] = useState<number | null>(null);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);

  // Scaling factor for proportional ingredient quantities
  const scaleRatio = currentServings / (recipe.servings || 2);
  const instructions = recipe.instructions || (recipe.steps ? recipe.steps.map((s) => s.instruction) : []);

  // Step countdown timer effect
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && timerSeconds !== null && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => (prev !== null && prev > 0 ? prev - 1 : 0));
      }, 1000);
    } else if (timerSeconds === 0) {
      setIsTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSeconds]);

  const toggleCheck = (name: string) => {
    setCheckedIngredients((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSave = () => {
    if (onToggleSave) {
      onToggleSave(recipe.id);
    }
  };

  const handleAddToMealPlan = () => {
    if (onAddToMealPlan) {
      onAddToMealPlan(recipe);
    }
  };

  const isIngredientAvailable = (ingName: string) => {
    const clean = ingName.toLowerCase();
    return userIngredients.some((u) => clean.includes(u.toLowerCase()) || u.toLowerCase().includes(clean));
  };

  // Allergy warning calculation
  const allergenMatches = userAllergies.filter((allergen) => {
    const a = allergen.toLowerCase();
    return recipe.ingredients.some((i) => i.name.toLowerCase().includes(a));
  });

  const startCookingStep = (index: number) => {
    setActiveStepIndex(index);
    const instructions = recipe.instructions || (recipe.steps ? recipe.steps.map(s => s.instruction) : []);
    const stepText = instructions[index] || '';
    const minMatch = stepText.match(/(\d+)\s*(?:-|to)?\s*(\d+)?\s*(?:minutes|mins|min)/i);
    if (minMatch) {
      const minutes = parseInt(minMatch[2] || minMatch[1], 10);
      setTimerSeconds(minutes * 60);
      setIsTimerRunning(false);
    } else {
      setTimerSeconds(null);
      setIsTimerRunning(false);
    }
  };

  const handleStartCookingClick = () => {
    if (onStartInteractiveCooking) {
      onStartInteractiveCooking(recipe);
      onClose();
      return;
    }
    setIsCookingMode(true);
    startCookingStep(0);
  };


  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl overflow-hidden shadow-2xl border border-cream-border my-auto max-h-[92vh] flex flex-col">
        
        {/* Modal Top Hero & Close */}
        <div className="relative h-60 sm:h-72 w-full shrink-0 bg-cream">
          <img
            src={recipe.imageUrl || recipe.image_url || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80'}
            alt={recipe.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />

          {/* Close button */}
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="absolute top-4 right-4 p-2.5 rounded-full bg-white/80 hover:bg-white text-forest shadow-md transition-all z-10"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Floating Save & Action buttons */}
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <button
              onClick={handleSave}
              className={`px-4 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-md transition-all ${
                isSaved ? 'bg-spice text-white' : 'bg-white/90 text-forest hover:bg-white'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
              <span>{isSaved ? 'Saved' : 'Save Recipe'}</span>
            </button>

            {recipe.source === 'ai_generated' ? (
              <span className="px-3 py-1.5 rounded-full bg-spice text-white text-xs font-bold flex items-center gap-1 shadow-md">
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Recipe</span>
              </span>
            ) : (
              <span className="px-3 py-1.5 rounded-full bg-forest-light text-white text-xs font-bold flex items-center gap-1 shadow-md">
                <span>Verified Kitchen Recipe</span>
              </span>
            )}
          </div>

          {/* Title & Metadata over hero */}
          <div className="absolute bottom-5 left-5 right-5 text-white space-y-2">
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
              <span className="px-3 py-1 rounded-full bg-spice text-white font-bold">
                {recipe.cuisine} {recipe.country ? `• ${recipe.country}` : ''}
              </span>
              {recipe.dish_type && (
                <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md">
                  {recipe.dish_type}
                </span>
              )}
              {recipe.provenance === 'ai_generated' && (
                <span className="px-3 py-1 rounded-full bg-purple-700/90 text-white font-bold flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-[#E8B94F]" />
                  <span>Groq AI Crafted</span>
                </span>
              )}
              {(recipe.dietary_labels || recipe.dietaryLabels || []).map((diet) => (
                <span key={diet} className="px-3 py-1 rounded-full bg-sage/90 text-forest font-bold">
                  {diet}
                </span>
              ))}
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {recipe.title}
            </h2>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto p-6 space-y-6 flex-1">
          
          {/* Allergy Warning Alert if user has declared allergies matching recipe */}
          {allergenMatches.length > 0 && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 space-y-1">
              <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-amber-800">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Allergen Notice: Contains {allergenMatches.join(', ')}</span>
              </div>
              <p className="text-xs text-amber-800 leading-relaxed">
                Please check ingredients carefully. Remember: Image recognition cannot establish allergen absence or guarantee protection against cross-contamination.
              </p>
            </div>
          )}

          {/* Quick Stats & Serving Scaler */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-cream-surface border border-cream-border text-center">
            <div className="space-y-1">
              <div className="flex items-center justify-center gap-1 text-xs text-deep-muted font-semibold">
                <Clock className="w-3.5 h-3.5 text-spice" />
                <span>Total Time</span>
              </div>
              <p className="text-base font-bold text-forest">
                {(recipe.prep_time_minutes || recipe.prepTimeMinutes || 10) +
                  (recipe.cook_time_minutes || recipe.cookTimeMinutes || 15)}{' '}
                mins
              </p>
              <p className="text-[11px] text-deep-subtle">
                Prep {recipe.prep_time_minutes || recipe.prepTimeMinutes || 10}m • Cook{' '}
                {recipe.cook_time_minutes || recipe.cookTimeMinutes || 15}m
              </p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-center gap-1 text-xs text-deep-muted font-semibold">
                <BarChart2 className="w-3.5 h-3.5 text-forest" />
                <span>Difficulty</span>
              </div>
              <p className="text-base font-bold text-forest">{recipe.difficulty}</p>
              <p className="text-[11px] text-deep-subtle">Beginner friendly</p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-center gap-1 text-xs text-deep-muted font-semibold">
                <IndianRupee className="w-3.5 h-3.5 text-spice" />
                <span>Estimated Cost</span>
              </div>
              <p className="text-base font-bold text-forest">
                ₹{Math.round((recipe.estimated_total_cost_inr || recipe.estimatedCostInr || 45) * scaleRatio)}
              </p>
              <p className="text-[11px] text-deep-subtle">
                ~₹{Math.round(recipe.estimated_cost_per_serving_inr || ((recipe.estimated_total_cost_inr || recipe.estimatedCostInr || 45) / (recipe.servings || 2)))} / serving
              </p>
            </div>

            {/* Serving Scaler */}
            <div className="space-y-1">
              <div className="flex items-center justify-center gap-1 text-xs text-deep-muted font-semibold">
                <Users className="w-3.5 h-3.5 text-forest" />
                <span>Servings</span>
              </div>
              <div className="flex items-center justify-center gap-2 pt-0.5">
                <button
                  onClick={() => setCurrentServings(Math.max(1, currentServings - 1))}
                  className="w-6 h-6 rounded-full bg-cream hover:bg-cream-border text-forest flex items-center justify-center font-bold text-xs"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="font-extrabold text-forest text-base w-6 text-center">
                  {currentServings}
                </span>
                <button
                  onClick={() => setCurrentServings(currentServings + 1)}
                  className="w-6 h-6 rounded-full bg-cream hover:bg-cream-border text-forest flex items-center justify-center font-bold text-xs"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
              <p className="text-[10px] text-deep-subtle">Auto-scales ingredients</p>
            </div>
          </div>

          {/* Description */}
          <p className="text-deep leading-relaxed text-sm">
            {recipe.description}
          </p>

          {/* "Let's Start Cooking" Highlighted Banner */}
          {!isCookingMode && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-forest to-forest-light text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
              <div className="space-y-1 text-center sm:text-left">
                <h4 className="font-extrabold text-base flex items-center justify-center sm:justify-start gap-2 text-spice">
                  <Play className="w-4 h-4 fill-current" />
                  <span>Ready to prepare this meal?</span>
                </h4>
                <p className="text-xs text-white/80">
                  Switch to our beginner-friendly, step-by-step interactive cooking assistant with timers!
                </p>
              </div>
              <button
                onClick={handleStartCookingClick}
                className="px-6 py-2.5 rounded-full bg-spice hover:bg-spice-hover text-white font-extrabold text-xs shadow-md transition-transform hover:scale-105 shrink-0 flex items-center gap-2"
              >
                <span>Let's Start Cooking</span>
                <Play className="w-3.5 h-3.5 fill-current" />
              </button>
            </div>
          )}

          {/* Interactive Cooking Mode Display */}
          {isCookingMode && (
            <div className="p-5 rounded-3xl bg-forest-muted/10 border-2 border-forest space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-forest text-white text-xs font-extrabold">
                    Step {activeStepIndex + 1} of {instructions.length}
                  </span>
                  <span className="text-xs font-bold text-forest">Beginner Cooking Mode</span>
                </div>
                <button
                  onClick={() => setIsCookingMode(false)}
                  className="text-xs font-bold text-deep-muted hover:text-forest underline"
                >
                  Exit Cooking Mode
                </button>
              </div>

              {/* Active Step Content */}
              <div className="p-4 rounded-2xl bg-white border border-cream-border shadow-sm space-y-3">
                <p className="text-base sm:text-lg font-bold text-forest leading-relaxed">
                  {instructions[activeStepIndex]}
                </p>

                {/* Step Timer if available */}
                {timerSeconds !== null && (
                  <div className="pt-2 flex items-center gap-3">
                    <div className="px-3 py-1.5 rounded-xl bg-spice/10 border border-spice/20 text-spice font-mono font-extrabold text-sm flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>{formatTimer(timerSeconds)}</span>
                    </div>
                    <button
                      onClick={() => setIsTimerRunning(!isTimerRunning)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold text-white transition-colors ${
                        isTimerRunning ? 'bg-amber-600' : 'bg-forest'
                      }`}
                    >
                      {isTimerRunning ? 'Pause Timer' : 'Start Timer'}
                    </button>
                    <button
                      onClick={() => {
                        setIsTimerRunning(false);
                        startCookingStep(activeStepIndex);
                      }}
                      className="p-1.5 rounded-xl bg-cream hover:bg-cream-border text-deep-muted"
                      title="Reset timer"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Step Navigation Controls */}
              <div className="flex items-center justify-between pt-2">
                <button
                  disabled={activeStepIndex === 0}
                  onClick={() => startCookingStep(Math.max(0, activeStepIndex - 1))}
                  className="px-4 py-2 rounded-xl bg-white border border-cream-border text-forest text-xs font-bold disabled:opacity-40 flex items-center gap-1.5"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                <div className="flex gap-1.5">
                  {instructions.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => startCookingStep(i)}
                      className={`w-2.5 h-2.5 rounded-full transition-all ${
                        i === activeStepIndex ? 'bg-spice w-6' : i < activeStepIndex ? 'bg-forest' : 'bg-cream-border'
                      }`}
                    />
                  ))}
                </div>

                {activeStepIndex < instructions.length - 1 ? (
                  <button
                    onClick={() => startCookingStep(activeStepIndex + 1)}
                    className="px-5 py-2 rounded-xl bg-forest hover:bg-forest-light text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
                  >
                    <span>Next Step</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setIsCookingMode(false);
                    }}
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-sm"
                  >
                    <Check className="w-4 h-4" />
                    <span>Meal Finished!</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Ingredients Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-forest flex items-center gap-2">
                <span>Ingredients Checklist</span>
                <span className="text-xs font-semibold text-deep-muted bg-cream px-2.5 py-0.5 rounded-full">
                  {recipe.ingredients.length} items
                </span>
              </h3>
              <span className="text-xs text-deep-subtle hidden sm:inline">
                Tap items you have ready
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {recipe.ingredients.map((ing, i) => {
                const scaledQty = Math.round(ing.quantity * scaleRatio * 10) / 10;
                const isChecked = !!checkedIngredients[ing.name];
                const available = isIngredientAvailable(ing.name);

                return (
                  <div
                    key={i}
                    onClick={() => toggleCheck(ing.name)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                      isChecked
                        ? 'bg-sage/40 border-sage text-forest line-through opacity-70'
                        : 'bg-white border-cream-border hover:border-forest/40'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-md flex items-center justify-center border text-xs ${
                        isChecked ? 'bg-forest text-white border-forest' : 'border-deep-subtle/50'
                      }`}>
                        {isChecked && <Check className="w-3.5 h-3.5" />}
                      </div>
                      <div>
                        <span className="text-sm font-semibold text-deep">{ing.name}</span>
                        {(ing.is_optional || ing.isOptional) && (
                          <span className="ml-2 text-[10px] text-deep-subtle italic">(Optional)</span>
                        )}
                        {ing.substitutions?.length > 0 && (
                          <p className="text-[11px] text-deep-muted">
                            Sub: {ing.substitutions.join(', ')}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-bold text-forest">
                        {scaledQty} {ing.unit}
                      </span>
                      <div className="mt-0.5">
                        {available ? (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                            In your pantry
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full">
                            ~₹{Math.round((ing.estimated_cost_inr || 10) * scaleRatio)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Cooking Instructions (Full standard list) */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-forest">Step-by-Step Cooking Instructions</h3>
            <div className="space-y-3">
              {instructions.map((step, idx) => (
                <div key={idx} className="flex gap-4 p-4 rounded-2xl bg-cream-surface border border-cream-border">
                  <div className="w-7 h-7 rounded-full bg-forest text-white font-bold text-xs flex items-center justify-center shrink-0">
                    {idx + 1}
                  </div>
                  <p className="text-sm text-deep leading-relaxed pt-0.5">
                    {step}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Chef Tips */}
          {recipe.tips && recipe.tips.length > 0 && (
            <div className="p-4 rounded-2xl bg-spice/10 border border-spice/20 space-y-2">
              <h4 className="text-xs font-bold text-spice-hover uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-spice" />
                <span>Chef's Pro Tips</span>
              </h4>
              <ul className="space-y-1.5 text-xs text-deep leading-relaxed">
                {recipe.tips.map((tip, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-spice">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Food Safety & Storage Advice */}
          {recipe.safety_advice && (
            <div className="p-4 rounded-2xl bg-sage/30 border border-sage space-y-1.5">
              <div className="flex items-center gap-2 text-forest font-bold text-xs uppercase tracking-wider">
                <Shield className="w-4 h-4 text-forest" />
                <span>Storage & Reheating Food Safety</span>
              </div>
              <p className="text-xs text-deep leading-relaxed">
                {recipe.safety_advice}
              </p>
            </div>
          )}
        </div>

        {/* Modal Bottom Action Bar */}
        <div className="p-4 bg-cream/70 border-t border-cream-border flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2.5 rounded-xl border border-cream-border bg-white text-xs font-bold text-forest hover:bg-cream transition-colors flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Print</span>
            </button>
            <button
              onClick={handleStartCookingClick}
              className="px-5 py-2.5 rounded-xl bg-spice hover:bg-spice-hover text-white text-xs font-extrabold flex items-center gap-2 shadow-sm transition-all"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Let's Start Cooking</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleAddToMealPlan}
              className="px-4 py-2.5 rounded-xl bg-forest hover:bg-forest-light text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all"
            >
              <CalendarPlus className="w-4 h-4 text-spice" />
              <span className="hidden sm:inline">Add to Meal Plan</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-cream-border text-deep text-xs font-semibold hover:bg-cream transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
