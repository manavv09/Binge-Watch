import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Film, Filter } from 'lucide-react';
import MovieCard from './MovieCard';

const GENRES = {
  movie: [
    { id: 28, name: 'Action' },
    { id: 12, name: 'Adventure' },
    { id: 16, name: 'Animation' },
    { id: 35, name: 'Comedy' },
    { id: 80, name: 'Crime' },
    { id: 18, name: 'Drama' },
    { id: 14, name: 'Fantasy' },
    { id: 27, name: 'Horror' },
    { id: 10749, name: 'Romance' },
    { id: 878, name: 'Sci-Fi' },
    { id: 53, name: 'Thriller' }
  ],
  tv: [
    { id: 10759, name: 'Action & Adventure' },
    { id: 16, name: 'Animation' },
    { id: 35, name: 'Comedy' },
    { id: 80, name: 'Crime' },
    { id: 18, name: 'Drama' },
    { id: 10751, name: 'Family' },
    { id: 10765, name: 'Sci-Fi & Fantasy' }
  ],
  anime: [
    { id: 1, name: 'Action' },
    { id: 2, name: 'Adventure' },
    { id: 4, name: 'Comedy' },
    { id: 8, name: 'Drama' },
    { id: 10, name: 'Fantasy' },
    { id: 7, name: 'Mystery' },
    { id: 22, name: 'Romance' },
    { id: 24, name: 'Sci-Fi' },
    { id: 37, name: 'Supernatural' }
  ]
};

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.9, y: 20 },
  show: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', bounce: 0.3 } }
};

const ContentGrid = ({ title, items, onOpenDetails, loading, onLoadMore, activeCategory }) => {
  const [selectedGenre, setSelectedGenre] = useState(null);

  // Reset genre filter when category changes
  useEffect(() => {
    setSelectedGenre(null);
  }, [activeCategory]);

  const genres = GENRES[activeCategory] || (activeCategory === 'all' ? GENRES.movie : []);

  const filteredItems = selectedGenre 
    ? items.filter(item => {
        if (activeCategory === 'anime') {
          return item.genres?.some(g => g.mal_id === selectedGenre);
        }
        return item.genre_ids?.includes(selectedGenre);
      })
    : items;

  return (
    <section className="container pt-12 pb-16">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <h2 className="text-[2.2rem] flex items-center gap-3 font-outfit font-extrabold tracking-tight">
            <div className="w-1.5 h-8 bg-accent-primary rounded-full shadow-[0_0_15px_var(--accent-glow)]"></div>
            {title}
          </h2>
          <p className="text-text-muted mt-1 text-[0.95rem]">
            {filteredItems.length} titles found in this category
          </p>
        </div>

        {/* Genre Chips */}
        {genres.length > 0 && (
          <div className="flex items-center gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-glass-border text-text-muted shrink-0">
              <Filter size={14} />
              <span className="text-[0.75rem] font-bold uppercase tracking-wider">Filter</span>
            </div>
            <button
              onClick={() => setSelectedGenre(null)}
              className={`px-4 py-1.5 rounded-full text-[0.85rem] font-semibold transition-all whitespace-nowrap ${!selectedGenre ? 'bg-accent-primary text-white shadow-lg shadow-accent-primary/20' : 'bg-white/5 text-text-secondary hover:bg-white/10 hover:text-text-primary border border-glass-border'}`}
            >
              All
            </button>
            {genres.map(genre => (
              <button
                key={genre.id}
                onClick={() => setSelectedGenre(genre.id)}
                className={`px-4 py-1.5 rounded-full text-[0.85rem] font-semibold transition-all whitespace-nowrap ${selectedGenre === genre.id ? 'bg-accent-primary text-white shadow-lg shadow-accent-primary/20' : 'bg-white/5 text-text-secondary hover:bg-white/10 hover:text-text-primary border border-glass-border'}`}
              >
                {genre.name}
              </button>
            ))}
          </div>
        )}
      </div>
      
      {loading && items.length === 0 ? (
        <div className="p-20 flex flex-col items-center justify-center gap-6 min-h-[400px] bg-bg-surface backdrop-blur-md border border-glass-border rounded-[2rem]">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-accent-primary/20 border-t-accent-primary rounded-full"
          />
          <p className="text-text-secondary font-semibold animate-pulse">Scanning the multiverse...</p>
        </div>
      ) : (!filteredItems || filteredItems.length === 0) ? (
        <div className="p-20 text-center bg-bg-surface backdrop-blur-md border border-glass-border rounded-[2rem] flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-text-muted">
            <Film size={32} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-text-primary">No titles found</h3>
            <p className="text-text-muted mt-1">Try adjusting your filters or category.</p>
          </div>
        </div>
      ) : (
        <motion.div 
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 lg:gap-8"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          <AnimatePresence mode="popLayout">
            {filteredItems.map((item, index) => {
              const id = item.id || item.mal_id || index;
              return (
                <motion.div 
                  key={`${id}-${index}`} 
                  variants={itemVariants} 
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                >
                  <MovieCard item={item} onOpenDetails={onOpenDetails} />
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      )}

      {onLoadMore && !loading && items.length > 0 && !selectedGenre && (
        <div className="text-center mt-16">
          <button 
            className="inline-flex items-center justify-center gap-2 bg-text-primary text-bg-base px-10 py-4 rounded-full font-bold text-[0.95rem] transition-all hover:scale-105 active:scale-95 shadow-xl"
            onClick={onLoadMore}
          >
            Show More Results
          </button>
        </div>
      )}
    </section>
  );
};

export default ContentGrid;
