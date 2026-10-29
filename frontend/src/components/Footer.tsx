import React from 'react';
import { Link } from 'react-router-dom';
import { ChefHat, Heart, Sparkles, ArrowRight, ShieldCheck, Leaf } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-20 border-t border-[#FDE68A] bg-[#FEFCE8] text-deep overflow-hidden relative">
      
      {/* Editorial CTA Banner */}
      <div className="relative bg-gradient-to-b from-[#FFFDF5] to-[#FEF3C7] py-16 px-4 text-center border-b border-[#FDE68A]">
        {/* Botanical leaves accents */}
        <div className="absolute left-6 top-8 hidden lg:block opacity-70">
          <Leaf className="w-10 h-10 text-forest rotate-[-25deg]" />
        </div>
        <div className="absolute right-8 bottom-6 hidden lg:block opacity-70">
          <Leaf className="w-12 h-12 text-forest rotate-[45deg]" />
        </div>

        <div className="max-w-3xl mx-auto space-y-4">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-forest tracking-tight">
            Less Thinking. More Cooking.
          </h2>
          <p className="text-base sm:text-lg text-deep-muted font-medium">
            Your ingredients are waiting. Your stomach is impatient. Let's fix this.
          </p>
          <div className="pt-2">
            <Link
              to="/recipes"
              className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full bg-forest text-white font-bold text-base hover:bg-forest-light transition-all shadow-card hover:scale-105"
            >
              <span>LET'S COOK</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Main Footer Links & Signature */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand Col */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-forest flex items-center justify-center text-white">
                <ChefHat className="w-5 h-5 text-white" />
              </div>
              <span className="font-extrabold text-xl text-forest tracking-tight">SAMACHIFY</span>
            </div>
            <p className="text-sm text-deep-muted font-medium">
              Your Kitchen. Your Rules. Our Smart Ideas.
            </p>
            <div className="inline-block px-3 py-1.5 rounded-lg bg-forest text-[#DCE9DC] text-xs font-serif italic">
              "Nalla Saapadu, Nalla Naal..."
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h3 className="font-bold text-forest text-sm uppercase tracking-wider">Features</h3>
            <ul className="space-y-2 text-sm text-deep-muted">
              <li><Link to="/recipes" className="hover:text-forest transition-colors">Smart Ingredient Search</Link></li>
              <li><Link to="/meal-plan" className="hover:text-forest transition-colors">Weekly Meal Planner</Link></li>
              <li><Link to="/leftovers" className="hover:text-forest transition-colors">Leftover Rescue Engine</Link></li>
              <li><Link to="/pantry" className="hover:text-forest transition-colors">My Kitchen Pantry</Link></li>
              <li><Link to="/cuisines" className="hover:text-forest transition-colors">Worldwide Cuisines</Link></li>
            </ul>
          </div>

          {/* Cuisines */}
          <div className="space-y-3">
            <h3 className="font-bold text-forest text-sm uppercase tracking-wider">Cuisines</h3>
            <ul className="space-y-2 text-sm text-deep-muted">
              <li><Link to="/cuisines" className="hover:text-forest transition-colors">South Indian Traditional</Link></li>
              <li><Link to="/cuisines" className="hover:text-forest transition-colors">East Asian & Wok Bowls</Link></li>
              <li><Link to="/cuisines" className="hover:text-forest transition-colors">Italian & Mediterranean</Link></li>
              <li><Link to="/cuisines" className="hover:text-forest transition-colors">Mexican Street Tacos</Link></li>
              <li><Link to="/cuisines" className="hover:text-forest transition-colors">Middle Eastern Classics</Link></li>
            </ul>
          </div>

          {/* Cooking Intelligence */}
          <div className="space-y-3">
            <h3 className="font-bold text-forest text-sm uppercase tracking-wider">Culinary AI</h3>
            <div className="p-3 rounded-xl bg-cream/70 border border-cream-border text-xs space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-forest">
                <ShieldCheck className="w-4 h-4 text-forest" />
                <span>Groq High-Speed Engine</span>
              </div>
              <p className="text-deep-muted">
                Powered by Groq Llama 3.3 with authentic Tamil Nadu culinary rules and sensory cues.
              </p>
            </div>
          </div>
        </div>


        <div className="mt-12 pt-6 border-t border-cream-border flex flex-col sm:flex-row items-center justify-between text-xs text-deep-muted gap-4">
          <p>© {new Date().getFullYear()} SAMACHIFY. All rights reserved. Made for smart home cooks.</p>
          <div className="flex items-center gap-4">
            <a href="#privacy" className="hover:text-forest">Privacy Policy</a>
            <span>•</span>
            <a href="#terms" className="hover:text-forest">Terms of Service</a>
            <span>•</span>
            <span className="text-spice font-semibold">Food Safety Standard Compliant</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
