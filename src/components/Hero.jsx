import React, { useState, useRef, useEffect } from 'react';
import { Play, Info, Star } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { FastAverageColor } from 'fast-average-color';
import { getTMDBDetails, getAnimeDetails } from '../utils/api';
import VideoModal from './VideoModal';
import './Hero.css';

const Hero = ({ item, onOpenDetails }) => {
  const [videoKey, setVideoKey] = useState(null);
  const [showVideo, setShowVideo] = useState(false);
  const [isLoadingVideo, setIsLoadingVideo] = useState(false);

  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "150%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  let bgImage = item?.mock_image;
  if (!bgImage && item) {
    if (item.backdrop_path) {
      bgImage = `https://image.tmdb.org/t/p/original${item.backdrop_path}`;
    } else if (item.images?.jpg?.large_image_url) {
      bgImage = item.images.jpg.large_image_url;
    } else if (item.poster_path) {
      bgImage = `https://image.tmdb.org/t/p/original${item.poster_path}`;
    }
  }

  useEffect(() => {
    if (!bgImage) return;

    const fac = new FastAverageColor();
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src = bgImage;

    img.onload = () => {
      fac.getColorAsync(img)
        .then(color => {
          document.documentElement.style.setProperty('--accent-primary', color.hex);
          const [r, g, b] = color.value;
          document.documentElement.style.setProperty('--accent-glow', `rgba(${r}, ${g}, ${b}, 0.5)`);
          
          const invertedColor = `rgba(${255 - r}, ${255 - g}, ${255 - b}, 0.8)`;
          document.documentElement.style.setProperty('--accent-secondary', invertedColor);
        })
        .catch(e => {
          console.log('Color extraction failed:', e);
          document.documentElement.style.removeProperty('--accent-primary');
          document.documentElement.style.removeProperty('--accent-glow');
          document.documentElement.style.removeProperty('--accent-secondary');
        });
    };

    return () => {
      fac.destroy();
    };
  }, [bgImage]);

  if (!item) return <div className="hero-skeleton"></div>;

  const handleWatchTrailer = async () => {
    setIsLoadingVideo(true);
    try {
      if (item.mal_id) {
        const details = await getAnimeDetails(item.mal_id);
        if (details?.trailer?.youtube_id) {
          setVideoKey(details.trailer.youtube_id);
          setShowVideo(true);
        } else {
          alert('No trailer available for this anime.');
        }
      } else {
        const mediaType = item.media_type || (item.first_air_date ? 'tv' : 'movie');
        const details = await getTMDBDetails(item.id, mediaType);
        const trailer = details?.videos?.results?.find(v => v.site === 'YouTube' && v.type === 'Trailer');
        if (trailer) {
          setVideoKey(trailer.key);
          setShowVideo(true);
        } else {
          alert('No trailer available.');
        }
      }
    } catch (error) {
      console.error(error);
      alert('Error loading trailer.');
    } finally {
      setIsLoadingVideo(false);
    }
  };

  const title = item.title || item.name || item.title_english || 'Unknown Title';
  const overview = item.overview || item.synopsis || 'No description available.';
  
  const rating = item.vote_average ? Number(item.vote_average).toFixed(1) : (item.score ? item.score : 'N/A');

  return (
    <div className="hero-container" ref={containerRef}>
      <motion.div 
        className="hero-background"
        style={{ 
          backgroundImage: `url(${bgImage})`,
          y: backgroundY,
          scale: 1.1 // Prevent edges showing during scroll
        }}
      />
      <div className="hero-overlay" />
      
      <div className="container hero-content">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          style={{ y: textY, opacity }}
          className="hero-info"
        >
          <h1 className="hero-title">{title}</h1>
          
          <div className="hero-meta">
            <span className="rating-badge">
              <Star size={16} fill="var(--warning)" color="var(--warning)" />
              {rating}
            </span>
            {item.release_date && <span className="release-year">{item.release_date.split('-')[0]}</span>}
            {item.media_type && <span className="media-type-badge">{item.media_type.toUpperCase()}</span>}
          </div>
          
          <p className="hero-overview">{overview}</p>
          
          <div className="hero-actions">
            <button className="btn-primary" onClick={handleWatchTrailer} disabled={isLoadingVideo}>
              <Play size={20} fill="currentColor" />
              {isLoadingVideo ? 'Loading...' : 'Watch Trailer'}
            </button>
            <button className="btn-secondary" onClick={() => onOpenDetails(item)}>
              <Info size={20} />
              More Info
            </button>
          </div>
        </motion.div>
      </div>

      {showVideo && (
        <VideoModal 
          videoKey={videoKey} 
          onClose={() => setShowVideo(false)} 
        />
      )}
    </div>
  );
};
export default Hero;
