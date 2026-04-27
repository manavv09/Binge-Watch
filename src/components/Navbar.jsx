import React, { useState, useEffect, useRef } from 'react';
import { Search, Menu, X, User, LogOut, Star } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '../utils/firebase';
import { searchTMDB, searchAnime } from '../utils/api';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = ({ activeCategory, setActiveCategory, onSearch, currentUser, onOpenAuth }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [avatarLoadFailed, setAvatarLoadFailed] = useState(false);
  const searchRef = useRef(null);
  const profileRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSuggestionsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setAvatarLoadFailed(false);
  }, [currentUser?.uid, currentUser?.photoURL]);

  const fetchSuggestions = async (query) => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    let results = [];
    if (activeCategory === 'anime') {
      results = await searchAnime(query);
    } else {
      results = await searchTMDB(query);
    }
    setSuggestions(results.slice(0, 5));
    setIsSuggestionsOpen(true);
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchValue(value);

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      fetchSuggestions(value);
    }, 300);
  };

  const navItems = [
    { id: 'all', label: 'Home' },
    { id: 'movie', label: 'Movies' },
    { id: 'tv', label: 'TV Series' },
    { id: 'anime', label: 'Anime' },
    { id: 'upcoming', label: 'News' }
  ];

  if (currentUser) {
    navItems.push({ id: 'watchlist', label: 'My List' });
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchValue.trim()) {
      onSearch(searchValue);
      setIsMobileMenuOpen(false);
      setIsSuggestionsOpen(false);
    }
  };

  const handleSuggestionClick = (item) => {
    setSearchValue('');
    setIsSuggestionsOpen(false);
    onSearch(item.title || item.name || item.title_english);
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setIsProfileOpen(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const providerProfile = currentUser?.providerData?.find(
    (p) => p?.providerId === 'google.com' || p?.providerId === 'github.com'
  );
  const avatarUrl = providerProfile?.photoURL || currentUser?.photoURL;
  const providerName = providerProfile?.providerId === 'google.com'
    ? 'Google'
    : providerProfile?.providerId === 'github.com'
      ? 'GitHub'
      : 'Email';
  const displayName = currentUser?.displayName || currentUser?.email || 'User';
  const avatarFallback = displayName.trim().charAt(0).toUpperCase();

  return (
    <nav className={`fixed top-[0.75rem] md:top-[1.2rem] left-[50%] -translate-x-1/2 w-[94%] md:w-[92%] max-w-[1400px] h-[68px] z-[1000] rounded-full border border-transparent flex items-center transition-all duration-300 ${isScrolled ? 'glass-panel !border-glass-border shadow-[0_10px_30px_rgba(2,6,23,0.45)]' : 'bg-transparent'}`}>
      <div className="flex items-center justify-between h-full w-full max-w-container mx-auto px-4 md:px-8">
        <div className="flex items-center gap-3 cursor-pointer no-underline shrink-0" onClick={() => setActiveCategory('all')}>
          <img src="/logo.jpg" alt="Binge Watcher" className="h-8 md:h-10 w-auto object-contain rounded-xl ring-1 ring-white/15" />
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-4 lg:gap-6">
          {navItems.map(item => (
            <button
              key={item.id}
              className={`text-[0.9rem] lg:text-[0.95rem] font-medium transition-all duration-150 py-2 relative inline-block group hover:text-text-primary hover:-translate-y-0.5 after:content-[''] after:absolute after:bottom-0 after:left-0 after:h-[2px] after:bg-accent-primary after:transition-all after:duration-150 after:rounded-sm after:w-0 group-hover:after:w-full ${activeCategory === item.id ? 'text-text-primary -translate-y-0.5 after:!w-full drop-shadow-[0_0_8px_var(--accent-glow)]' : 'text-text-secondary'}`}
              onClick={() => setActiveCategory(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 lg:gap-6">
          {/* Search Bar */}
          <div className="hidden md:block relative group" ref={searchRef}>
            <form className="w-[220px] lg:w-[320px]" onSubmit={handleSearchSubmit}>
              <div className="relative flex items-center w-full">
                <Search className="absolute left-4 text-text-muted transition-colors group-focus-within:text-accent-primary" size={16} />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchValue}
                  onChange={handleSearchChange}
                  onFocus={() => searchValue && setIsSuggestionsOpen(true)}
                  className="w-full bg-black/35 border border-glass-border rounded-full py-2.5 pr-4 pl-11 text-text-primary text-[0.85rem] transition-all duration-200 focus:outline-none focus:border-accent-primary focus:bg-black/60 focus:ring-4 focus:ring-accent-primary/10"
                />
              </div>
            </form>

            <AnimatePresence>
              {isSuggestionsOpen && suggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full mt-3 left-0 w-full bg-bg-surface-active backdrop-blur-xl border border-glass-border rounded-2xl shadow-2xl overflow-hidden p-2 z-[1100]"
                >
                  {suggestions.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleSuggestionClick(item)}
                      className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-bg-surface-hover transition-all text-left group"
                    >
                      <div className="w-10 h-14 bg-white/5 rounded-lg overflow-hidden shrink-0 border border-glass-border">
                        <img 
                          src={item.poster_path ? `https://image.tmdb.org/t/p/w92${item.poster_path}` : (item.images?.jpg?.image_url || '/placeholder-poster.jpg')} 
                          alt="" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-text-primary truncate group-hover:text-accent-primary transition-colors">
                          {item.title || item.name || item.title_english}
                        </p>
                        <p className="text-[0.75rem] text-text-muted flex items-center gap-1">
                          <Star size={10} className="text-warning fill-warning" />
                          {Number(item.vote_average || item.score || 0).toFixed(1)} • {item.release_date?.split('-')[0] || item.aired?.from?.split('-')[0] || 'N/A'}
                        </p>
                      </div>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Auth Button */}
          {currentUser ? (
            <div className="relative" ref={profileRef}>
              <button
                className="w-10 h-10 rounded-full border border-glass-border bg-bg-surface-active overflow-hidden shadow-sm flex items-center justify-center text-sm font-bold text-text-primary transition-all duration-150 hover:-translate-y-0.5 hover:border-accent-primary/60"
                title={displayName}
                onClick={() => setIsProfileOpen((prev) => !prev)}
              >
                {avatarUrl && !avatarLoadFailed ? (
                  <img
                    src={avatarUrl}
                    alt={displayName}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                    onError={() => setAvatarLoadFailed(true)}
                  />
                ) : (
                  <span>{avatarFallback}</span>
                )}
              </button>

              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.98 }}
                    transition={{ duration: 0.16 }}
                    className="absolute right-0 top-[calc(100%+12px)] w-[250px] rounded-2xl glass-panel p-3 z-[1200]"
                  >
                    <div className="px-3 py-2 border-b border-glass-border">
                      <p className="text-sm font-semibold text-text-primary truncate">{currentUser.displayName || 'Signed in user'}</p>
                      <p className="text-xs text-text-muted truncate">{currentUser.email || 'No email available'}</p>
                      <p className="text-[11px] text-accent-primary mt-1 font-semibold">{providerName} profile</p>
                    </div>

                    <div className="mt-2 flex flex-col gap-1">
                      <button
                        className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-white/5 transition-all"
                        onClick={() => {
                          setActiveCategory('watchlist');
                          setIsProfileOpen(false);
                        }}
                      >
                        My List
                      </button>
                      <button
                        className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium text-text-secondary hover:text-danger hover:bg-danger/10 transition-all inline-flex items-center gap-2"
                        onClick={handleSignOut}
                      >
                        <LogOut size={16} />
                        Sign Out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <button className="hidden sm:inline-flex items-center justify-center gap-2 bg-text-primary text-bg-base px-6 py-2.5 rounded-full font-bold text-[0.85rem] transition-all duration-150 hover:bg-accent-primary hover:text-white hover:-translate-y-0.5 shadow-lg active:scale-95 whitespace-nowrap" onClick={onOpenAuth}>
              <User size={16} />
              SIGN IN
            </button>
          )}

          {/* Mobile Toggle */}
          <button 
            className="block md:hidden bg-transparent border-none text-text-primary cursor-pointer p-1"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-[80px] left-0 w-full glass-panel p-4 flex flex-col gap-4 shadow-2xl rounded-2xl md:hidden z-[999]"
          >
            <form className="w-full" onSubmit={handleSearchSubmit}>
              <div className="relative flex items-center w-full">
                <Search className="absolute left-4 text-text-muted" size={18} />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchValue}
                  onChange={handleSearchChange}
                  className="w-full bg-black/40 border border-glass-border rounded-full py-3 pr-4 pl-11 text-text-primary text-[0.95rem] focus:outline-none focus:border-accent-primary focus:bg-black/60"
                />
              </div>
            </form>
            <div className="flex flex-col gap-1">
              {navItems.map(item => (
                <button
                  key={item.id}
                  className={`w-full text-left p-4 rounded-xl text-[1rem] font-semibold transition-all duration-150 hover:bg-white/5 ${activeCategory === item.id ? 'bg-white/5 text-accent-primary' : 'text-text-secondary'}`}
                  onClick={() => {
                    setActiveCategory(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
