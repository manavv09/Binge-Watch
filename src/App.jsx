import React, { useState, useEffect, Suspense, lazy } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './utils/firebase';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ContentGrid from './components/ContentGrid';
import MobileBottomNav from './components/MobileBottomNav';
import { ToastProvider } from './components/ToastProvider';
import { 
  getTrending, 
  getUpcomingMovies, 
  getAiringSeries, 
  searchTMDB,
  getTrendingAnime,
  getUpcomingAnime,
  searchAnime
} from './utils/api';
import { getWatchlist } from './utils/firestore';

const DetailsModal = lazy(() => import('./components/DetailsModal'));
const AuthModal = lazy(() => import('./components/AuthModal'));

function App() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [heroItem, setHeroItem] = useState(null);
  const [gridData, setGridData] = useState({ title: '', items: [] });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  
  const [selectedItem, setSelectedItem] = useState(null);
  
  // Auth state
  const [currentUser, setCurrentUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  const handleSearch = (query) => {
    setSearchQuery(query);
    setActiveCategory('search');
    setPage(1);
  };

  useEffect(() => {
    setPage(1);
  }, [activeCategory]);

  useEffect(() => {
    const fetchData = async () => {
      if (page === 1) setLoading(true);
      else setIsLoadingMore(true);

      try {
        let newItems = [];
        let newTitle = '';
        let newHero = null;

        if (activeCategory === 'search' && searchQuery) {
          const tmdbRes = await searchTMDB(searchQuery, 'multi', page);
          const animeRes = await searchAnime(searchQuery, page);
          newItems = [...tmdbRes, ...animeRes];
          newTitle = `Search Results for "${searchQuery}"`;
          if (page === 1) {
            const firstRealTMDB = tmdbRes.find(item => !String(item.id).startsWith('mock_'));
            newHero = firstRealTMDB || animeRes[0] || tmdbRes[0];
          }
          
        } else if (activeCategory === 'all') {
          const trendingMovies = await getTrending('movie', page);
          const trendingAnime = await getTrendingAnime(page);
          newItems = [...(trendingMovies || []).slice(0, 10), ...(trendingAnime || []).slice(0, 10)];
          newTitle = 'Trending Today';
          if (page === 1) {
            const firstRealTMDB = trendingMovies.find(item => !String(item.id).startsWith('mock_'));
            newHero = firstRealTMDB || trendingAnime[0] || trendingMovies[0];
          }
          
        } else if (activeCategory === 'movie') {
          const movies = await getTrending('movie', page);
          newItems = movies;
          newTitle = 'Trending Movies';
          if (page === 1) newHero = movies[0];
          
        } else if (activeCategory === 'tv') {
          const tv = await getTrending('tv', page);
          newItems = tv;
          newTitle = 'Trending TV Series';
          if (page === 1) newHero = tv[0];
          
        } else if (activeCategory === 'anime') {
          const anime = await getTrendingAnime(page);
          newItems = anime;
          newTitle = 'Top Airing Anime';
          if (page === 1) newHero = anime[0];
          
        } else if (activeCategory === 'upcoming') {
          // APIs don't typically paginate upcoming easily without specific endpoints, but we can pass page
          const upcomingMovies = await getUpcomingMovies(); // Might need page support
          const upcomingAnime = await getUpcomingAnime();
          newItems = page === 1 ? [...upcomingMovies.slice(0, 10), ...(upcomingAnime || []).slice(0, 10)] : [];
          newTitle = 'Upcoming Movies & Anime News';
          if (page === 1) {
            const firstRealTMDB = upcomingMovies.find(item => !String(item.id).startsWith('mock_'));
            newHero = firstRealTMDB || upcomingAnime?.[0] || upcomingMovies[0];
          }

        } else if (activeCategory === 'watchlist') {
          if (currentUser) {
            const userWatchlist = await getWatchlist(currentUser.uid);
            newItems = userWatchlist;
            newTitle = 'My Watchlist';
            if (page === 1) newHero = userWatchlist[0];
          } else {
            newItems = [];
            newTitle = 'Please Log In to View Watchlist';
            newHero = null;
          }
        }

        if (page === 1) {
          setGridData({ title: newTitle, items: newItems });
          if (newHero) setHeroItem(newHero);
        } else {
          setGridData(prev => ({ ...prev, items: [...prev.items, ...newItems] }));
        }

      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
        setIsLoadingMore(false);
      }
    };

    fetchData();
  }, [activeCategory, searchQuery, page, currentUser]);

  return (
    <ToastProvider>
      <div className="min-h-screen bg-bg-base text-text-primary font-sans pb-24 md:pb-0">
        <Navbar 
          activeCategory={activeCategory} 
          setActiveCategory={(cat) => {
            setActiveCategory(cat);
            setSearchQuery('');
          }}
          onSearch={handleSearch} 
          currentUser={currentUser}
          onOpenAuth={() => setShowAuthModal(true)}
        />
        
        <main>
          <Hero item={heroItem} onOpenDetails={setSelectedItem} />
          <ContentGrid 
            title={gridData.title} 
            items={gridData.items} 
            loading={loading}
            onOpenDetails={setSelectedItem}
            onLoadMore={activeCategory !== 'watchlist' && activeCategory !== 'upcoming' ? () => setPage(p => p + 1) : null}
            activeCategory={activeCategory}
          />
        </main>

        <MobileBottomNav
          activeCategory={activeCategory}
          setActiveCategory={(cat) => {
            setActiveCategory(cat);
            setSearchQuery('');
          }}
          currentUser={currentUser}
          onOpenAuth={() => setShowAuthModal(true)}
        />

        <Suspense fallback={null}>
          {selectedItem && (
            <DetailsModal 
              item={selectedItem} 
              onClose={() => setSelectedItem(null)} 
              currentUser={currentUser}
              onRequireAuth={() => setShowAuthModal(true)}
            />
          )}

          {showAuthModal && (
            <AuthModal 
              onClose={() => setShowAuthModal(false)} 
              onAuthSuccess={() => setShowAuthModal(false)} 
            />
          )}
        </Suspense>
      </div>
    </ToastProvider>
  );
}

export default App;
