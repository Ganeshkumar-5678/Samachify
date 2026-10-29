import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChefHat, Sparkles, User, Bookmark, Menu, X } from 'lucide-react';

interface NavbarProps {
  onOpenAuth: () => void;
  user: { name: string; isGuest: boolean } | null;
  savedCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAuth, user, savedCount }) => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Recipes', path: '/recipes' },
    { name: 'Meal Plan', path: '/meal-plan' },
    { name: 'Leftover Rescue', path: '/leftovers' },
    { name: 'My Kitchen', path: '/pantry' },
    { name: 'Cuisines', path: '/cuisines' },
  ];

  const handleNavClick = () => {
    setMobileMenuOpen(false);
  };


  return (
    <header className="sticky top-0 z-40 bg-[#FEFCE8]/90 backdrop-blur-md border-b border-[#FDE68A]/80 transition-all relative overflow-hidden">
      {/* Background Grand Royal Thali Feast Image Overlay - 60% transparency */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-40 pointer-events-none mix-blend-multiply scale-105"
        style={{ backgroundImage: "url('/assets/grand_thali_bg.png')" }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[#FEFCE8]/85 via-[#FEFCE8]/65 to-[#FEFCE8]/85 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Logo & Tagline */}
          <Link 
            to="/" 
            className="flex items-center gap-3 group"
            onClick={() => handleNavClick()}
          >
            <div className="w-12 h-12 rounded-2xl bg-[#CA8A04] flex items-center justify-center text-white shadow-soft group-hover:scale-105 transition-transform duration-200">
              <div className="relative">
                <ChefHat className="w-7 h-7 text-white" />
                <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-[#D97706] rounded-full border-2 border-[#854D0E]"></span>
              </div>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-2xl tracking-tight text-[#854D0E]">SAMACHIFY</span>
                <Sparkles className="w-4 h-4 text-[#D97706]" />
              </div>
              <span className="text-[11px] font-semibold text-[#854D0E]/80 tracking-wide uppercase hidden sm:block">
                Your Kitchen. Your Rules. Our Smart Ideas.
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-[#FEF3C7]/90 px-3 py-1.5 rounded-full border border-[#FDE68A] shadow-xs">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => handleNavClick()}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-forest text-white shadow-sm'
                      : 'text-deep hover:text-forest hover:bg-cream-surface'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Right Actions */}
          <div className="hidden sm:flex items-center gap-3">
            <Link
              to="/saved"
              onClick={() => handleNavClick()}
              className="relative p-2.5 rounded-full bg-cream hover:bg-cream-border text-deep transition-colors"
              title="Saved Recipes"
            >
              <Bookmark className="w-5 h-5" />
              {savedCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-spice text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                  {savedCount}
                </span>
              )}
            </Link>

            <button
              onClick={onOpenAuth}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-forest text-white text-sm font-semibold hover:bg-forest-light transition-all shadow-sm"
            >
              <User className="w-4 h-4" />
              <span>{user ? user.name : 'Sign In'}</span>
              {user?.isGuest && (
                <span className="text-[10px] bg-spice px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                  Guest
                </span>
              )}
            </button>
          </div>

          {/* Mobile hamburger button */}
          <div className="flex sm:hidden items-center gap-2">
            <Link
              to="/saved"
              className="p-2 rounded-full bg-cream text-deep relative"
            >
              <Bookmark className="w-5 h-5" />
              {savedCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-spice text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {savedCount}
                </span>
              )}
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-xl bg-forest text-white"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden bg-forest text-white px-6 py-6 border-t border-forest-light space-y-4 animate-in slide-in-from-top duration-200">
          <div className="flex items-center gap-3 pb-4 border-b border-forest-muted">
            <ChefHat className="w-6 h-6 text-spice" />
            <span className="font-bold text-lg">SAMACHIFY Menu</span>
          </div>

          <div className="flex flex-col space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => handleNavClick()}
                className={`px-4 py-3 rounded-xl text-base font-semibold flex items-center justify-between ${
                  location.pathname === link.path
                    ? 'bg-forest-light text-spice-light border border-spice/40'
                    : 'text-white/90 hover:bg-forest-muted'
                }`}
              >
                <span>{link.name}</span>
                <span>→</span>
              </Link>
            ))}
            <Link
              to="/saved"
              onClick={() => handleNavClick()}
              className="px-4 py-3 rounded-xl text-base font-semibold text-white/90 hover:bg-forest-muted flex justify-between"
            >
              <span>Saved Recipes ({savedCount})</span>
              <span>★</span>
            </Link>
          </div>

          <div className="pt-4 border-t border-forest-muted">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAuth();
              }}
              className="w-full py-3 rounded-xl bg-spice text-white font-bold text-center flex items-center justify-center gap-2"
            >
              <User className="w-4 h-4" />
              <span>{user ? `Account: ${user.name}` : 'Sign In / Register'}</span>
            </button>
            <p className="text-xs text-white/60 text-center mt-3 italic">
              "Less food waste. More good meals."
            </p>
          </div>
        </div>
      )}
    </header>
  );
};
