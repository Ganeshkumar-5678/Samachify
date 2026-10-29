import React, { useState } from 'react';
import { X, User, ChefHat, Sparkles, Check, Shield } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: { name: string; isGuest: boolean } | null;
  onLogin: (user: { name: string; isGuest: boolean }) => void;
  onLogout: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLogin,
  onLogout,
}) => {
  if (!isOpen) return null;

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const displayName = name.trim() || email.split('@')[0] || 'Chef';
    const userObj = { name: displayName, isGuest: false };
    onLogin(userObj);
    onClose();
  };

  const handleContinueAsGuest = () => {
    const guestUser = { name: 'Guest Chef', isGuest: true };
    onLogin(guestUser);
    onClose();
  };


  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl border border-cream-border my-auto">
        
        {/* Header */}
        <div className="bg-forest px-6 py-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-forest-muted text-white/80"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <ChefHat className="w-6 h-6 text-spice" />
            <span className="font-extrabold text-lg tracking-tight">SAMACHIFY</span>
          </div>

          <h3 className="text-xl font-bold">
            {currentUser
              ? 'Chef Profile'
              : mode === 'signin'
              ? 'Welcome Back to Your Kitchen'
              : 'Create Your Kitchen Account'}
          </h3>
          <p className="text-xs text-white/70 mt-1">
            "Your Kitchen. Your Rules. Our Smart Ideas."
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {currentUser ? (
            <div className="space-y-4 text-center py-2">
              <div className="w-16 h-16 rounded-full bg-cream mx-auto flex items-center justify-center text-forest font-bold text-xl">
                {currentUser.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h4 className="font-bold text-lg text-forest">{currentUser.name}</h4>
                <p className="text-xs text-deep-muted">
                  {currentUser.isGuest ? 'Active in Guest Mode (Local Storage)' : 'Cloud Synchronized Account'}
                </p>
              </div>

              <div className="pt-4 border-t border-cream-border flex gap-2">
                <button
                  onClick={onLogout}
                  className="w-full py-2.5 rounded-xl border border-red-200 text-red-600 font-bold text-xs hover:bg-red-50 transition-colors"
                >
                  Sign Out
                </button>
                <button
                  onClick={onClose}
                  className="w-full py-2.5 rounded-xl bg-forest text-white font-bold text-xs hover:bg-forest-light transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <>
              <form onSubmit={handleSubmit} className="space-y-3">
                {mode === 'signup' && (
                  <div>
                    <label className="block text-xs font-bold text-forest mb-1">Your Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Anand"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-cream-border text-xs focus:outline-none focus:border-forest"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-forest mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="chef@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-cream-border text-xs focus:outline-none focus:border-forest"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-forest mb-1">Password</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-cream-border text-xs focus:outline-none focus:border-forest"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-forest hover:bg-forest-light text-white font-bold text-xs tracking-wide shadow-sm transition-all"
                >
                  {mode === 'signin' ? 'Sign In to Kitchen' : 'Create Free Account'}
                </button>
              </form>

              <div className="relative my-4 text-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-cream-border"></div>
                </div>
                <span className="relative px-3 bg-white text-[11px] font-semibold text-deep-subtle uppercase">
                  or
                </span>
              </div>

              {/* Guest Mode option */}
              <button
                type="button"
                onClick={handleContinueAsGuest}
                className="w-full py-2.5 rounded-xl border border-forest/30 text-forest hover:bg-cream-surface font-bold text-xs transition-colors flex items-center justify-center gap-2"
              >
                <Sparkles className="w-3.5 h-3.5 text-spice" />
                <span>Continue as Guest (No Password Needed)</span>
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
                  className="text-xs text-deep-muted hover:text-forest"
                >
                  {mode === 'signin'
                    ? "Don't have an account? Sign up"
                    : 'Already have an account? Sign in'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
