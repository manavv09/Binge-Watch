import React, { useState, useEffect, useRef } from 'react';
import { Search, X, User, LogOut, Star } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '../utils/firebase';
import { searchTMDB, searchAnime } from '../utils/api';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = ({ activeCategory, setActiveCategory, onSearch, currentUser, onOpenAuth }) => {
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
    <nav className={`fixed top-[0.75rem] md:top-[1.2rem] left-[50%] -translate-x-1/2 w-[94%] md:w-[96%] xl:w-[92%] max-w-[1400px] h-[60px] md:h-[64px] lg:h-[68px] z-[1000] rounded-full border border-transparent flex items-center transition-all duration-300 ${isScrolled ? 'glass-panel !border-glass-border shadow-[0_10px_30px_rgba(2,6,23,0.45)]' : 'bg-transparent'}`}>
      <div className="flex items-center justify-between h-full w-full max-w-container mx-auto px-4 md:px-5 lg:px-8">
        <div className="flex items-center gap-2 lg:gap-3 cursor-pointer no-underline shrink-0" onClick={() => setActiveCategory('all')}>
          <img src="/binge-watch-icon.png" alt="BingeWatch" className="h-9 w-9 md:h-8 md:w-8 lg:h-10 lg:w-10 object-contain rounded-xl ring-1 ring-white/15" />
          <span className="font-outfit font-extrabold tracking-tight text-[0.95rem] md:text-[0.95rem] lg:text-[1.15rem] text-text-primary">
            BingeWatch
          </span>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-2 md:gap-3 lg:gap-6 shrink-0">
          {navItems.map(item => (
            <button
              key={item.id}
              className={`text-[0.85rem] lg:text-[0.95rem] font-medium transition-all duration-150 py-2 relative inline-block group hover:text-text-primary hover:-translate-y-0.5 after:content-[''] after:absolute after:bottom-0 after:left-0 after:h-[2px] after:bg-accent-primary after:transition-all after:duration-150 after:rounded-sm after:w-0 group-hover:after:w-full ${activeCategory === item.id ? 'text-text-primary -translate-y-0.5 after:!w-full drop-shadow-[0_0_8px_var(--accent-glow)]' : 'text-text-secondary'}`}
              onClick={() => setActiveCategory(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 lg:gap-6 shrink-0">
          {/* Search Bar */}
          <div className="relative group" ref={searchRef}>
            <form className="w-[130px] sm:w-[220px] md:w-[150px] lg:w-[240px] xl:w-[320px]" onSubmit={handleSearchSubmit}>
              <div className="relative flex items-center w-full">
                <Search className="absolute left-3 sm:left-4 text-text-muted transition-colors group-focus-within:text-accent-primary" size={16} />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchValue}
                  onChange={handleSearchChange}
                  onFocus={() => searchValue && setIsSuggestionsOpen(true)}
                  className="w-full bg-black/35 border border-glass-border rounded-full py-2 sm:py-2.5 pr-4 pl-9 sm:pl-11 text-text-primary text-[0.8rem] sm:text-[0.85rem] transition-all duration-200 focus:outline-none focus:border-accent-primary focus:bg-black/60 focus:ring-4 focus:ring-accent-primary/10"
                />
              </div>
            </form>

            <AnimatePresence>
              {isSuggestionsOpen && suggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full mt-3 right-0 md:left-0 md:right-auto w-[280px] md:w-full bg-[#030712] sm:bg-bg-surface-active backdrop-blur-3xl border border-white/10 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden p-2 z-[1500]"
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
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
