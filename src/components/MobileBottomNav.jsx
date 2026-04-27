import React from 'react';
import { Film, Tv, Home, Sparkles, Bookmark, User } from 'lucide-react';

const ITEMS = [
  { id: 'all', label: 'Home', icon: Home },
  { id: 'movie', label: 'Movies', icon: Film },
  { id: 'tv', label: 'TV', icon: Tv },
  { id: 'anime', label: 'Anime', icon: Sparkles },
];

export default function MobileBottomNav({ activeCategory, setActiveCategory, currentUser, onOpenAuth }) {
  const items = [...ITEMS];
  if (currentUser) items.push({ id: 'watchlist', label: 'My List', icon: Bookmark });
  else items.push({ id: 'auth', label: 'Sign In', icon: User });

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[1500] md:hidden">
      <div className="glass-panel border-t border-glass-border rounded-t-3xl px-3 py-2">
        <div className="grid grid-cols-5 gap-1">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = item.id !== 'auth' && activeCategory === item.id;
            return (
              <button
                key={item.id}
                className={`flex flex-col items-center justify-center gap-1 py-2.5 rounded-2xl transition-all ${
                  isActive ? 'bg-white/5 text-accent-primary' : 'text-text-muted hover:text-text-primary hover:bg-white/5'
                }`}
                onClick={() => {
                  if (item.id === 'auth') onOpenAuth();
                  else setActiveCategory(item.id);
                }}
                title={item.label}
              >
                <Icon size={18} />
                <span className="text-[0.7rem] font-bold tracking-wide">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
      <div className="h-[env(safe-area-inset-bottom)] bg-transparent" />
    </div>
  );
}

