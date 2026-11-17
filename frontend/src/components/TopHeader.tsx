import React, { useState } from 'react';
import { Menu, Search, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface TopHeaderProps {
  onToggleSidebar: () => void;
  onOpenAuth: () => void;
  user: { name: string; isGuest: boolean } | null;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  onToggleSidebar,
  onOpenAuth,
  user,
}) => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/recipes?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-[#FBF8F2]/90 backdrop-blur-md px-4 sm:px-6 lg:px-10 py-4 flex items-center justify-between">
      {/* Mobile Hamburger Button */}
      <div className="flex items-center gap-3 lg:hidden">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="p-2 rounded-xl text-[#0B3B24] hover:bg-[#EEF3EF] transition-colors"
          aria-label="Open menu"
        >
          <Menu className="w-6 h-6" />
        </button>
        <span className="font-extrabold text-lg text-[#0B3B24] tracking-wider lg:hidden">
          SAMACHIFY
        </span>
      </div>

      {/* Spacer on Desktop */}
      <div className="hidden lg:block flex-1 max-w-md">
        {searchOpen && (
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search recipes, ingredients..."
              className="w-full bg-white border border-[#ECE7DE] rounded-full py-2 pl-10 pr-10 text-sm text-[#11241A] placeholder-[#8A9C92] focus:outline-none focus:ring-2 focus:ring-[#0B3B24] shadow-xs"
            />
            <Search className="w-4 h-4 text-[#5D6F65] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <button
              type="button"
              onClick={() => setSearchOpen(false)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8A9C92] hover:text-[#11241A]"
            >
              <X className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>

      {/* Right Controls: Search Icon & User Avatar */}
      <div className="flex items-center gap-4 ml-auto">
        {!searchOpen && (
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="p-2.5 rounded-full text-[#11241A] hover:bg-[#EEF3EF] hover:text-[#0B3B24] transition-colors"
            aria-label="Search recipes"
            title="Search recipes"
          >
            <Search className="w-5 h-5 stroke-[2.2]" />
          </button>
        )}

        {/* User Avatar Circle */}
        <button
          type="button"
          onClick={onOpenAuth}
          className="relative group p-0.5 rounded-full ring-2 ring-[#0B3B24]/20 hover:ring-[#0B3B24] transition-all"
          title={user ? `${user.name} (Click for account)` : 'Sign in'}
        >
          <img
            src="/assets/chef_avatar.jpg"
            alt={user?.name || 'User Profile'}
            className="w-9 h-9 rounded-full object-cover"
            onError={(e) => {
              // Fallback to stylized SVG avatar
              (e.currentTarget as HTMLElement).style.display = 'none';
              const fallback = e.currentTarget.parentElement?.querySelector('.avatar-fallback') as HTMLElement;
              if (fallback) fallback.style.display = 'flex';
            }}
          />
          <div className="avatar-fallback hidden w-9 h-9 rounded-full bg-[#0B3B24] text-white text-xs font-bold items-center justify-center">
            {user?.name?.slice(0, 2).toUpperCase() || 'SC'}
          </div>
        </button>
      </div>
    </header>
  );
};
