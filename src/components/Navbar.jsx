import React, { useState, useEffect } from 'react';
import { Search, Menu, X, Film, User, LogOut } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '../utils/firebase';
import './Navbar.css';

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
    <nav className={`navbar ${isScrolled ? 'scrolled glass-panel' : ''}`}>
      <div className="container nav-container">
        <div className="nav-brand" onClick={() => setActiveCategory('all')}>
          <img src="/logo.jpg" alt="Binge Watcher" style={{ height: '40px', objectFit: 'contain' }} />
        </div>

        {/* Desktop Navigation */}
        <div className="nav-links desktop-only">
          {navItems.map(item => (
            <button
              key={item.id}
              className={`nav-link ${activeCategory === item.id ? 'active' : ''}`}
              onClick={() => setActiveCategory(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="nav-actions desktop-only">
          {/* Search Bar */}
          <form className="search-form" onSubmit={handleSearchSubmit}>
            <div className="search-input-wrapper">
              <Search className="search-icon" size={18} />
              <input
                type="text"
                placeholder="Search movies, anime..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="search-input"
              />
            </div>
          </form>

          {/* Auth Button */}
          {currentUser ? (
            <button className="auth-btn user-logged-in" onClick={handleSignOut} title="Sign Out">
              <LogOut size={20} />
            </button>
          ) : (
            <button className="btn-primary auth-btn" onClick={onOpenAuth}>
              <User size={18} />
              Sign In
            </button>
          )}
        </div>

        {/* Mobile Toggle */}
        <button 
          className="mobile-toggle mobile-only"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="mobile-menu">
          <form className="search-form-mobile" onSubmit={handleSearchSubmit}>
            <div className="search-input-wrapper">
              <Search className="search-icon" size={18} />
              <input
                type="text"
                placeholder="Search..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="search-input"
              />
            </div>
          </form>
          <div className="mobile-nav-links">
            {navItems.map(item => (
              <button
                key={item.id}
                className={`mobile-nav-link ${activeCategory === item.id ? 'active' : ''}`}
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
