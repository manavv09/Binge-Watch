import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Film } from 'lucide-react';
import MovieCard from './MovieCard';
import './ContentGrid.css';

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
    <section className="container grid-section">
      <h2 className="section-title heading">{title}</h2>
      
      {loading && items.length === 0 ? (
        <div className="custom-loader glass-panel">
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5], rotate: [0, 360] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <Film size={48} color="var(--accent-primary)" />
          </motion.div>
          <p className="text-gradient">Loading the magic...</p>
        </div>
      ) : (!items || items.length === 0) ? (
        <div className="empty-state glass-panel">
          <p>No content found.</p>
        </div>
      ) : (
        <motion.div 
          className="content-grid"
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
        <div style={{ textAlign: 'center', marginTop: '3rem' }}>
          <button className="btn-secondary" onClick={onLoadMore}>
            Load More
          </button>
        </div>
      )}
    </section>
  );
};

export default ContentGrid;
