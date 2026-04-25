import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Film } from 'lucide-react';
import MovieCard from './MovieCard';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.9 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', bounce: 0.4 } }
};

const ContentGrid = ({ title, items, onOpenDetails, loading, onLoadMore }) => {
  return (
    <section className="container pt-12 pb-8">
      <h2 className="text-[1.8rem] mb-6 flex items-center gap-2 font-bold tracking-tight before:content-[''] before:inline-block before:w-1 before:h-6 before:bg-accent-primary before:rounded-sm" style={{ '--tw-drop-shadow': 'drop-shadow(0 0 10px var(--accent-glow))' }}>
        <span className="relative flex items-center gap-2">
          <div className="w-1 h-6 bg-accent-primary rounded-sm shadow-[0_0_10px_var(--accent-glow)]"></div>
          {title}
        </span>
      </h2>
      
      {loading && items.length === 0 ? (
        <div className="p-16 flex flex-col items-center justify-center gap-6 min-h-[300px] bg-bg-surface backdrop-blur-md border border-glass-border shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-1px_rgba(0,0,0,0.06)] rounded-3xl">
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5], rotate: [0, 360] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <Film size={48} color="var(--accent-primary)" />
          </motion.div>
          <p className="bg-gradient-to-br from-accent-primary to-accent-secondary bg-clip-text text-transparent font-medium">Loading the magic...</p>
        </div>
      ) : (!items || items.length === 0) ? (
        <div className="p-12 text-center text-text-muted bg-bg-surface backdrop-blur-md border border-glass-border shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-1px_rgba(0,0,0,0.06)] rounded-3xl">
          <p>No content found.</p>
        </div>
      ) : (
        <motion.div 
          className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] sm:grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4 sm:gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          <AnimatePresence>
            {items.map((item, index) => {
              const id = item.id || item.mal_id || index;
              return (
                <motion.div key={`${id}-${index}`} variants={itemVariants} layoutId={`card-${id}`}>
                  <MovieCard item={item} onOpenDetails={onOpenDetails} />
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      )}

      {onLoadMore && !loading && items.length > 0 && (
        <div className="text-center mt-12">
          <button className="inline-flex items-center justify-center gap-2 bg-white/10 text-white px-6 py-3 rounded-full font-semibold transition-all duration-150 backdrop-blur-md border border-white/10 hover:bg-white/20 hover:-translate-y-0.5" onClick={onLoadMore}>
            Load More
          </button>
        </div>
      )}
    </section>
  );
};

export default ContentGrid;
