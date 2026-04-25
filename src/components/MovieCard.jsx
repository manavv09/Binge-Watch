import React from 'react';
import { Star } from 'lucide-react';
import { motion } from 'framer-motion';

const MovieCard = ({ item, onOpenDetails }) => {
  const title = item.title || item.name || item.title_english || 'Unknown';
  
  let poster = item.mock_image;
  if (!poster) {
    if (item.poster_path) {
      poster = `https://image.tmdb.org/t/p/w500${item.poster_path}`;
    } else if (item.images?.jpg?.image_url) {
      poster = item.images.jpg.image_url;
    } else {
      poster = 'https://via.placeholder.com/500x750?text=No+Image';
    }
  }

  const rating = item.vote_average ? Number(item.vote_average).toFixed(1) : (item.score ? item.score : null);

  return (
    <motion.div 
      className="flex flex-col gap-3 cursor-pointer group"
      whileHover={{ y: -8 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      onClick={() => onOpenDetails(item)}
    >
      <div className="relative aspect-[2/3] rounded-[20px] overflow-hidden bg-bg-surface border border-glass-border">
        <img src={poster} alt={title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 flex items-end justify-center pb-8 transition-all duration-300 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0">
          <span className="bg-accent-primary text-white px-4 py-2 rounded-full text-[0.85rem] font-semibold translate-y-5 transition-all duration-300 opacity-0 group-hover:translate-y-0 group-hover:opacity-100">View Details</span>
        </div>
        {rating && (
          <div className="absolute top-2 right-2 bg-black/75 backdrop-blur-sm text-warning text-[0.8rem] font-semibold px-2 py-1 rounded-lg flex items-center gap-1 border border-white/10">
            <Star size={12} fill="currentColor" />
            <span>{rating}</span>
          </div>
        )}
      </div>
      <div className="px-1">
        <h3 className="font-sans text-base font-semibold truncate mb-1">{title}</h3>
        <p className="text-[0.85rem] text-text-muted">
          {item.release_date ? item.release_date.split('-')[0] : 
           item.first_air_date ? item.first_air_date.split('-')[0] : 
           item.year ? item.year : ''}
        </p>
      </div>
    </motion.div>
  );
};

export default MovieCard;
