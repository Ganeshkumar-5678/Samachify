import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  LayoutGrid,
  Calendar,
  ShoppingBag,
  Bookmark,
  Leaf,
  X,
  ChefHat,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  savedCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, savedCount = 0 }) => {
  const location = useLocation();

  const navItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Recipe Suggestions', path: '/recipes', icon: LayoutGrid },
    { name: 'Meal Plan', path: '/meal-plan', icon: Calendar },
    { name: 'My Kitchen', path: '/pantry', icon: ShoppingBag },
    { name: 'Saved Recipes', path: '/saved', icon: Bookmark, badge: savedCount },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-xs transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 xl:w-72 bg-[#0B3B24] text-white flex flex-col justify-between py-7 px-5 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top: Logo & Close Button (Mobile) */}
        <div>
          <div className="flex items-center justify-between mb-9 px-2">
            <Link
              to="/"
              onClick={onClose}
              className="flex items-center gap-3 group"
            >
              {/* Logo Hat with Green Outline & Orange Leaf Accent */}
              <div className="relative w-10 h-10 rounded-xl flex items-center justify-center">
                <ChefHat className="w-8 h-8 text-[#85C441] stroke-[2.2]" />
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#E67E22] rounded-full ring-2 ring-[#0B3B24]" />
              </div>
              <span className="text-xl font-extrabold tracking-wider text-white font-sans">
                SAMACHIFY
              </span>
            </Link>

            {/* Mobile close button */}
            <button
              type="button"
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-lg text-[#A3B8AD] hover:text-white hover:bg-white/10"
              aria-label="Close navigation"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5" aria-label="Main Navigation">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.path === '/'
                  ? location.pathname === '/'
                  : location.pathname.startsWith(item.path);

              return (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={onClose}
                  className={`flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-[#134D31] text-white shadow-xs'
                      : 'text-[#A3B8AD] hover:text-white hover:bg-[#134D31]/40'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <Icon className="w-5 h-5 shrink-0 stroke-[2.2]" />
                    <span>{item.name}</span>
                  </div>

                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-[#E67E22] text-white">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Tagline & Eco Leaf Badge */}
        <div className="px-3 pt-6 border-t border-white/10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-[#134D31] flex items-center justify-center">
              <Leaf className="w-5 h-5 text-[#85C441] stroke-[2.2]" />
            </div>
            <div className="text-[12px] font-medium leading-tight text-[#C0D2C7]">
              <p>Less food waste.</p>
              <p>More good meals.</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
