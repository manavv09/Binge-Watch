import React, { useState, useRef, useEffect } from 'react';
import { Play, Info, Star } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { FastAverageColor } from 'fast-average-color';
import { getTMDBDetails, getAnimeDetails } from '../utils/api';
import VideoModal from './VideoModal';

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

  if (!item) return <div className="w-full h-[75vh] md:h-[85vh] min-h-[600px] bg-gradient-to-r from-bg-surface via-bg-surface-hover to-bg-surface bg-[length:200%_100%] animate-[pulse_2s_infinite]"></div>;

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
    <div className="relative w-full h-[75vh] md:h-[85vh] min-h-[600px] flex items-center overflow-hidden" ref={containerRef}>
      <motion.div 
        className="absolute inset-0 w-full h-full bg-cover bg-[center_20%] z-0"
        style={{ 
          backgroundImage: `url(${bgImage})`,
          y: backgroundY,
          scale: 1.1 
        }}
      />
      <div 
        className="absolute inset-0 z-[1]" 
        style={{ background: 'linear-gradient(to top, var(--bg-base) 0%, transparent 80%), linear-gradient(to right, var(--bg-base) 0%, transparent 100%)' }}
      />
      
      <div className="relative z-10 pt-[80px] w-full max-w-container mx-auto px-4 md:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          style={{ y: textY, opacity }}
          className="max-w-[600px]"
        >
          <h1 className="text-[2.5rem] md:text-[clamp(2.5rem,5vw,4.5rem)] leading-[1.1] mb-4 text-shadow-lg font-bold">{title}</h1>
          
          <div className="flex items-center gap-4 mb-6 text-[0.95rem] font-medium">
            <span className="flex items-center gap-1 text-white">
              <Star size={16} fill="var(--warning)" color="var(--warning)" />
              {rating}
            </span>
            {item.release_date && <span className="text-text-secondary">{item.release_date.split('-')[0]}</span>}
            {item.media_type && <span className="bg-white/10 px-2.5 py-1 rounded text-xs tracking-widest">{item.media_type.toUpperCase()}</span>}
          </div>
          
          <p className="text-base md:text-lg leading-relaxed text-text-secondary mb-8 line-clamp-3 md:line-clamp-4 drop-shadow-md">{overview}</p>
          
          <div className="flex flex-col md:flex-row gap-4 w-full max-w-[300px] md:max-w-none">
            <button 
              className="inline-flex items-center justify-center gap-2 bg-text-primary text-bg-base px-6 py-3 rounded-full font-semibold transition-all duration-150 hover:bg-slate-200 hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(255,255,255,0.1)] disabled:opacity-70" 
              onClick={handleWatchTrailer} 
              disabled={isLoadingVideo}
              style={{ boxShadow: '0 0 15px var(--accent-glow)' }}
            >
              <Play size={20} fill="currentColor" />
              {isLoadingVideo ? 'Loading...' : 'Watch Trailer'}
            </button>
            <button 
              className="inline-flex items-center justify-center gap-2 bg-white/10 text-white px-6 py-3 rounded-full font-semibold transition-all duration-150 backdrop-blur-md border border-white/10 hover:bg-white/20 hover:-translate-y-0.5" 
              onClick={() => onOpenDetails(item)}
            >
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
