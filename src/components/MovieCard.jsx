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
      className="movie-card"
      whileHover={{ y: -8 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      onClick={() => onOpenDetails(item)}
    >
      <div className="card-image-wrapper">
        <img src={poster} alt={title} className="card-image" loading="lazy" />
        <div className="card-overlay">
          <span className="card-btn">View Details</span>
        </div>
        {rating && (
          <div className="card-rating">
            <Star size={12} fill="currentColor" />
            <span>{rating}</span>
          </div>
        )}
      </div>
      <div className="card-info">
        <h3 className="card-title">{title}</h3>
        <p className="card-year">
          {item.release_date ? item.release_date.split('-')[0] : 
           item.first_air_date ? item.first_air_date.split('-')[0] : 
           item.year ? item.year : ''}
        </p>
      </div>
    </motion.div>
  );
};

export default MovieCard;
