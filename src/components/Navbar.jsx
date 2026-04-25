import React, { useState, useEffect } from 'react';
import { Search, Menu, X, Film, User, LogOut } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '../utils/firebase';

const Navbar = ({ activeCategory, setActiveCategory, onSearch, currentUser, onOpenAuth }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { id: 'all', label: 'Home' },
    { id: 'movie', label: 'Movies' },
    { id: 'tv', label: 'TV Series' },
    { id: 'anime', label: 'Anime' },
    { id: 'upcoming', label: 'News & Upcoming' }
  ];

  if (currentUser) {
    navItems.push({ id: 'watchlist', label: 'My List' });
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchValue.trim()) {
      onSearch(searchValue);
      setIsMobileMenuOpen(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <nav className={`fixed top-[1.5rem] left-[5%] w-[90%] h-[70px] z-[1000] rounded-full border border-transparent flex items-center transition-all duration-300 ${isScrolled ? 'bg-bg-surface backdrop-blur-md !border-glass-border shadow-[0_4px_20px_rgba(0,0,0,0.4)]' : 'bg-transparent'}`}>
      <div className="flex items-center justify-between h-full w-full max-w-container mx-auto px-4 md:px-8">
        <div className="flex items-center gap-3 cursor-pointer no-underline" onClick={() => setActiveCategory('all')}>
          <img src="/logo.jpg" alt="Binge Watcher" style={{ height: '40px', objectFit: 'contain' }} />
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          {navItems.map(item => (
            <button
              key={item.id}
              className={`text-[0.95rem] font-medium transition-all duration-150 py-2 relative inline-block group hover:text-text-primary hover:-translate-y-0.5 hover:scale-105 after:content-[''] after:absolute after:bottom-0 after:left-0 after:h-[2px] after:bg-accent-primary after:transition-all after:duration-150 after:rounded-sm after:w-0 group-hover:after:w-full ${activeCategory === item.id ? 'text-text-primary -translate-y-0.5 scale-105 after:!w-full' : 'text-text-secondary'}`}
              style={{ '--tw-drop-shadow': 'drop-shadow(0 0 10px var(--accent-glow))', filter: activeCategory === item.id || 'group-hover' ? 'var(--tw-drop-shadow)' : 'none' }}
              onClick={() => setActiveCategory(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-6">
          {/* Search Bar */}
          <form className="basis-[300px]" onSubmit={handleSearchSubmit}>
            <div className="relative flex items-center w-full">
              <Search className="absolute left-4 text-text-muted" size={18} />
              <input
                type="text"
                placeholder="Search movies, anime..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="w-full bg-black/40 border border-glass-border rounded-full py-2.5 pr-4 pl-11 text-text-primary text-[0.9rem] transition-all duration-150 focus:outline-none focus:border-accent-primary focus:bg-black/60"
                style={{ boxShadow: 'focus: 0 0 0 3px var(--accent-glow)' }}
              />
            </div>
          </form>

          {/* Auth Button */}
          {currentUser ? (
            <button className="bg-white/10 text-text-primary border border-glass-border w-10 h-10 rounded-full flex items-center justify-center transition-all duration-150 hover:bg-red-500/20 hover:text-danger hover:border-red-500/40" onClick={handleSignOut} title="Sign Out">
              <LogOut size={20} />
            </button>
          ) : (
            <button className="inline-flex items-center justify-center gap-2 bg-text-primary text-bg-base px-6 py-2.5 rounded-full font-semibold transition-all duration-150 hover:bg-slate-200 hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(255,255,255,0.1)] whitespace-nowrap" onClick={onOpenAuth}>
              <User size={18} />
              Sign In
            </button>
          )}
        </div>

        {/* Mobile Toggle */}
        <button 
          className="block md:hidden bg-transparent border-none text-text-primary cursor-pointer"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="absolute top-[80px] left-0 w-full bg-bg-surface-active backdrop-blur-xl border-b border-glass-border p-4 flex flex-col gap-4 shadow-glass rounded-2xl md:hidden">
          <form className="w-full" onSubmit={handleSearchSubmit}>
            <div className="relative flex items-center w-full">
              <Search className="absolute left-4 text-text-muted" size={18} />
              <input
                type="text"
                placeholder="Search..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="w-full bg-black/40 border border-glass-border rounded-full py-2.5 pr-4 pl-11 text-text-primary text-[0.9rem] transition-all duration-150 focus:outline-none focus:border-accent-primary focus:bg-black/60"
              />
            </div>
          </form>
          <div className="flex flex-col gap-2">
            {navItems.map(item => (
              <button
                key={item.id}
                className={`w-full text-left p-4 rounded-lg text-[1.1rem] font-medium transition-all duration-150 hover:bg-white/5 hover:text-text-primary hover:pl-6 ${activeCategory === item.id ? 'bg-white/5 text-text-primary pl-6' : 'text-text-secondary'}`}
                onClick={() => {
                  setActiveCategory(item.id);
                  setIsMobileMenuOpen(false);
                }}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
