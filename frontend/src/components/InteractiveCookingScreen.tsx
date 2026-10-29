import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Flame,
  Clock,
  Sparkles,
  ChefHat,
  Volume2,
  Utensils,
  Award,
  Bookmark,
} from 'lucide-react';
import { Recipe, CookingStep, VisualType } from '../types';
import { api } from '../services/api';

interface InteractiveCookingScreenProps {
  recipe: Recipe;
  onClose: () => void;
  onSaveRecipe?: () => void;
  isSaved?: boolean;
}

// Visual technique illustration helper
const VisualTechniqueCard: React.FC<{ visualType: VisualType; heatLevel?: string }> = ({
  visualType,
  heatLevel,
}) => {
  const getTechniqueDetails = (type: VisualType) => {
    switch (type) {
      case 'chop':
        return {
          icon: '🔪',
          title: 'Prep & Chop',
          desc: 'Finely dice or slice ingredients evenly on your cutting board.',
          bg: 'bg-amber-50 border-amber-200 text-amber-900',
        };
      case 'heat_oil':
        return {
          icon: '🫒',
          title: 'Heat Oil / Fat',
          desc: 'Warm cooking oil or ghee until shimmering, not smoking.',
          bg: 'bg-orange-50 border-orange-200 text-orange-900',
        };
      case 'temper_spices':
        return {
          icon: '✨',
          title: 'Thalippu / Tempering',
          desc: 'Splutter mustard seeds, cumin, and curry leaves in hot oil.',
          bg: 'bg-yellow-50 border-yellow-300 text-yellow-950',
        };
      case 'saute':
        return {
          icon: '🍳',
          title: 'Sauté & Brown',
          desc: 'Stir vigorously over medium heat until fragrant and tender.',
          bg: 'bg-amber-50 border-amber-200 text-amber-900',
        };
      case 'add_ingredients':
        return {
          icon: '🥣',
          title: 'Combine & Stir',
          desc: 'Incorporate measured spices and liquids thoroughly.',
          bg: 'bg-emerald-50 border-emerald-200 text-emerald-900',
        };
      case 'boil':
        return {
          icon: '🫧',
          title: 'Rolling Boil',
          desc: 'Bring liquid to vigorous bubbling to cook pulses or grains.',
          bg: 'bg-sky-50 border-sky-200 text-sky-900',
        };
      case 'simmer':
        return {
          icon: '🍲',
          title: 'Gentle Simmer',
          desc: 'Reduce flame, cover with lid, and allow flavors to meld.',
          bg: 'bg-indigo-50 border-indigo-200 text-indigo-900',
        };
      case 'steam':
        return {
          icon: '♨️',
          title: 'Steam Cook',
          desc: 'Cook under steam pressure until tender and fluffy.',
          bg: 'bg-slate-50 border-slate-200 text-slate-900',
        };
      case 'blend':
        return {
          icon: '🌪️',
          title: 'Grind / Blend',
          desc: 'Process to smooth paste or coarse masala in mixer grinder.',
          bg: 'bg-purple-50 border-purple-200 text-purple-900',
        };
      case 'garnish':
        return {
          icon: '🌿',
          title: 'Fresh Garnish',
          desc: 'Top with fresh coriander leaves, ghee, or fried cashews.',
          bg: 'bg-green-50 border-green-200 text-green-900',
        };
      case 'serve':
        return {
          icon: '🍽️',
          title: 'Plate & Serve',
          desc: 'Serve immediately piping hot with accompaniments.',
          bg: 'bg-rose-50 border-rose-200 text-rose-900',
        };
      default:
        return {
          icon: '🥘',
          title: 'Cook',
          desc: 'Follow the step instructions carefully.',
          bg: 'bg-stone-50 border-stone-200 text-stone-900',
        };
    }
  };

  const details = getTechniqueDetails(visualType);

  const getHeatBadge = (heat?: string) => {
    switch (heat) {
      case 'high':
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-red-600 text-white flex items-center gap-1"><Flame className="w-3 h-3" /> High Heat</span>;
      case 'medium':
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-500 text-white flex items-center gap-1"><Flame className="w-3 h-3" /> Medium Heat</span>;
      case 'low':
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-500 text-white flex items-center gap-1"><Flame className="w-3 h-3" /> Low Heat</span>;
      case 'off':
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-gray-500 text-white">Flame Off</span>;
      default:
        return null;
    }
  };

  return (
    <div className={`p-4 rounded-2xl border ${details.bg} flex items-center justify-between shadow-sm`}>
      <div className="flex items-center gap-3">
        <span className="text-3xl">{details.icon}</span>
        <div>
          <h4 className="font-extrabold text-sm">{details.title}</h4>
          <p className="text-xs opacity-90 max-w-sm">{details.desc}</p>
        </div>
      </div>
      <div>
        {getHeatBadge(heatLevel)}
      </div>
    </div>
  );
};

export const InteractiveCookingScreen: React.FC<InteractiveCookingScreenProps> = ({
  recipe,
  onClose,
  onSaveRecipe,
  isSaved = false,
}) => {
  // Normalize steps: fallback to instructions array if steps is missing
  const steps: CookingStep[] =
    recipe.steps && recipe.steps.length > 0
      ? recipe.steps
      : (recipe.instructions || []).map((instruction, idx) => ({
          stepNumber: idx + 1,
          instruction,
          visualType: 'saute',
          ingredients: [],
          timerSeconds: 120,
          heatLevel: 'medium',
        }));

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);

  const currentStep = steps[currentStepIndex];

  // Timer logic with elapsed time calculation
  const initialDuration = currentStep?.timerSeconds || (currentStep?.durationMinutes || 2) * 60;
  const [timeLeft, setTimeLeft] = useState(initialDuration);
  const [timerRunning, setTimerRunning] = useState(false);
  const timerRef = useRef<any>(null);

  // Reset timer on step change
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setTimerRunning(false);
    setTimeLeft(currentStep?.timerSeconds || (currentStep?.durationMinutes || 2) * 60);
  }, [currentStepIndex]);

  // Accurate countdown timer
  useEffect(() => {
    if (timerRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setTimerRunning(false);
            // Audio cue / visual alert when done
            if (typeof window !== 'undefined' && 'Notification' in window) {
              try {
                // browser beep
                const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
                const osc = audioCtx.createOscillator();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(800, audioCtx.currentTime);
                osc.connect(audioCtx.destination);
                osc.start();
                osc.stop(audioCtx.currentTime + 0.5);
              } catch (e) {
                // Ignore audio context error if restricted
              }
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timerRunning]);

  // Sync session with backend API
  const syncSession = async (newIndex: number, newCompleted: number[], complete: boolean) => {
    try {
      await api.updateCookingSession({
        recipeId: recipe.id,
        currentStep: newIndex + 1,
        completedSteps: newCompleted,
        isComplete: complete,
      });
    } catch (err) {
      // Non-blocking sync error
      console.warn('Could not sync cooking session to server:', err);
    }
  };

  const handleNextStep = () => {
    const updatedCompleted = Array.from(new Set([...completedSteps, currentStep.stepNumber]));
    setCompletedSteps(updatedCompleted);

    if (currentStepIndex < steps.length - 1) {
      const nextIdx = currentStepIndex + 1;
      setCurrentStepIndex(nextIdx);
      syncSession(nextIdx, updatedCompleted, false);
    } else {
      setIsCompleted(true);
      syncSession(currentStepIndex, updatedCompleted, true);
    }
  };

  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      const prevIdx = currentStepIndex - 1;
      setCurrentStepIndex(prevIdx);
      syncSession(prevIdx, completedSteps, false);
    }
  };

  const toggleStepCompleted = (stepNum: number) => {
    let updated: number[];
    if (completedSteps.includes(stepNum)) {
      updated = completedSteps.filter((s) => s !== stepNum);
    } else {
      updated = [...completedSteps, stepNum];
    }
    setCompletedSteps(updated);
    syncSession(currentStepIndex, updated, isCompleted);
  };

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const progressPercentage = Math.round(
    ((currentStepIndex + 1) / steps.length) * 100
  );

  return (
    <div className="fixed inset-0 z-50 bg-[#FAF7F0] flex flex-col overflow-hidden animate-in fade-in duration-200">
      {/* Top Header Bar */}
      <header className="bg-white border-b border-[#E8DDCB] px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#234B37] text-white flex items-center justify-center font-bold">
            <ChefHat className="w-5 h-5 text-[#E8B94F]" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-[#173526] line-clamp-1">
              {recipe.title}
            </h2>
            <p className="text-xs text-[#73766E]">
              {recipe.cuisine} • Interactive Companion Mode
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {onSaveRecipe && (
            <button
              type="button"
              onClick={onSaveRecipe}
              className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
                isSaved
                  ? 'bg-[#E8B94F]/20 border-[#E8B94F] text-[#234B37]'
                  : 'bg-white border-[#E8DDCB] text-[#73766E] hover:border-[#234B37]'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-[#E8B94F] text-[#E8B94F]' : ''}`} />
              <span className="hidden sm:inline">{isSaved ? 'Saved' : 'Save'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="p-2.5 rounded-xl bg-[#FAF7F0] hover:bg-[#E8DDCB] text-[#242820] transition-colors"
            title="Exit Cooking Mode"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="w-full bg-[#E8DDCB]/50 h-1.5 relative">
        <div
          className="bg-[#234B37] h-1.5 transition-all duration-300"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-8 max-w-4xl mx-auto w-full flex flex-col justify-between">
        {!isCompleted ? (
          <div className="space-y-6">
            {/* Step Count & Doneness Cue Banner */}
            <div className="flex items-center justify-between">
              <span className="px-3.5 py-1 rounded-full bg-[#234B37] text-white text-xs font-extrabold uppercase tracking-wider">
                Step {currentStepIndex + 1} of {steps.length}
              </span>

              <button
                type="button"
                onClick={() => toggleStepCompleted(currentStep.stepNumber)}
                className={`text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1.5 transition-all ${
                  completedSteps.includes(currentStep.stepNumber)
                    ? 'bg-emerald-100 text-emerald-800 font-bold'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  {completedSteps.includes(currentStep.stepNumber)
                    ? 'Step Completed'
                    : 'Mark as done'}
                </span>
              </button>
            </div>

            {/* Technique Illustration Banner */}
            <VisualTechniqueCard
              visualType={currentStep.visualType}
              heatLevel={currentStep.heatLevel}
            />

            {/* Core Step Instruction */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8DDCB] shadow-sm">
              <h3 className="text-xl sm:text-2xl font-bold text-[#173526] leading-relaxed">
                {currentStep.instruction}
              </h3>

              {currentStep.donenessCue && (
                <div className="mt-4 p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/80 flex items-start gap-2.5 text-xs text-amber-950">
                  <Sparkles className="w-4 h-4 text-[#C66A4A] shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-bold">Sensory Doneness Cue: </strong>
                    <span>{currentStep.donenessCue}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Step Timer and Ingredients Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Step Timer Card */}
              <div className="bg-white rounded-3xl p-5 border border-[#E8DDCB] shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#234B37]">
                    <Clock className="w-4 h-4 text-[#E8B94F]" />
                    <span>Step Timer</span>
                  </div>
                  {timeLeft === 0 && (
                    <span className="text-xs font-bold text-red-600 animate-pulse">
                      Time's Up!
                    </span>
                  )}
                </div>

                <div className="text-center my-3">
                  <div className={`text-4xl sm:text-5xl font-mono font-black tracking-tight ${timeLeft === 0 ? 'text-red-600' : 'text-[#173526]'}`}>
                    {formatTimer(timeLeft)}
                  </div>
                  <span className="text-xs text-[#73766E] mt-1 block">
                    Calculated countdown
                  </span>
                </div>

                <div className="flex items-center justify-center gap-2 pt-2 border-t border-[#E8DDCB]/60">
                  {!timerRunning ? (
                    <button
                      type="button"
                      onClick={() => setTimerRunning(true)}
                      className="px-4 py-2 rounded-xl bg-[#234B37] text-white text-xs font-bold flex items-center gap-1.5 hover:bg-[#173526] transition-colors"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>{timeLeft === 0 ? 'Restart' : 'Start Timer'}</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setTimerRunning(false)}
                      className="px-4 py-2 rounded-xl bg-amber-500 text-white text-xs font-bold flex items-center gap-1.5 hover:bg-amber-600 transition-colors"
                    >
                      <Pause className="w-3.5 h-3.5 fill-current" />
                      <span>Pause</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setTimerRunning(false);
                      setTimeLeft(currentStep?.timerSeconds || 120);
                    }}
                    className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
                    title="Reset"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Step Ingredients & Equipment Card */}
              <div className="bg-white rounded-3xl p-5 border border-[#E8DDCB] shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#234B37] mb-3">
                    <Utensils className="w-4 h-4 text-[#C66A4A]" />
                    <span>Needed for this Step</span>
                  </div>

                  {currentStep.ingredients && currentStep.ingredients.length > 0 ? (
                    <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                      {currentStep.ingredients.map((ing, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between text-xs py-1 px-2.5 rounded-lg bg-[#FAF7F0] text-[#242820]"
                        >
                          <span className="font-semibold">{ing.name}</span>
                          {ing.quantity && (
                            <span className="text-[#73766E] font-mono">
                              {ing.quantity} {ing.unit || ''}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-[#73766E] italic py-2">
                      Use the cookware and items previously assembled.
                    </p>
                  )}
                </div>

                {currentStep.equipment && currentStep.equipment.length > 0 && (
                  <div className="mt-3 pt-2 border-t border-[#E8DDCB]/60 text-xs text-[#73766E]">
                    <strong>Cookware: </strong>
                    <span>{currentStep.equipment.join(', ')}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Dish Completion Celebration Screen */
          <div className="my-auto py-12 text-center bg-white rounded-3xl border border-[#E8DDCB] p-8 sm:p-12 shadow-xl animate-in zoom-in-95 duration-200">
            <div className="w-20 h-20 rounded-full bg-[#E8B94F]/20 text-[#234B37] flex items-center justify-center mx-auto mb-6">
              <Award className="w-10 h-10 text-[#C66A4A]" />
            </div>

            <h3 className="text-2xl sm:text-4xl font-extrabold text-[#173526] font-serif">
              Bravo! Your Dish Is Ready!
            </h3>

            <p className="mt-3 text-base text-[#73766E] max-w-lg mx-auto">
              You just prepared <strong>{recipe.title}</strong> using what you already had in your kitchen.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setCurrentStepIndex(0);
                  setIsCompleted(false);
                }}
                className="px-5 py-3 rounded-2xl bg-[#FAF7F0] border border-[#E8DDCB] text-[#234B37] font-bold text-sm hover:bg-[#E8DDCB] transition-colors flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Cook Again</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 rounded-2xl bg-[#234B37] text-white font-extrabold text-sm hover:bg-[#173526] transition-all shadow-md"
              >
                Return to Recipe Discovery
              </button>
            </div>
          </div>
        )}

        {/* Bottom Navigation Buttons */}
        {!isCompleted && (
          <div className="pt-6 border-t border-[#E8DDCB]/80 flex items-center justify-between gap-3 mt-6">
            <button
              type="button"
              onClick={handlePrevStep}
              disabled={currentStepIndex === 0}
              className="px-5 py-3 rounded-2xl border border-[#E8DDCB] bg-white text-[#234B37] font-bold text-sm hover:bg-[#FAF7F0] disabled:opacity-40 disabled:pointer-events-none transition-colors flex items-center gap-1.5"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <button
              type="button"
              onClick={handleNextStep}
              className="px-6 py-3 rounded-2xl bg-[#234B37] hover:bg-[#173526] text-white font-extrabold text-sm sm:text-base transition-all shadow-md hover:shadow-lg flex items-center gap-2"
            >
              <span>
                {currentStepIndex === steps.length - 1 ? 'Finish Cooking 🎉' : 'Next Step'}
              </span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
