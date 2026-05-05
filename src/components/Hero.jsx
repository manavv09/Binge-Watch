import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Play, Info, Star } from 'lucide-react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { FastAverageColor } from 'fast-average-color';
import { getTMDBDetails, getAnimeDetails } from '../utils/api';
import VideoModal from './VideoModal';
import { useToast } from './ToastProvider';

const Hero = ({ items, onOpenDetails }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [videoKey, setVideoKey] = useState(null);
  const [showVideo, setShowVideo] = useState(false);
  const [isLoadingVideo, setIsLoadingVideo] = useState(false);
  const [extractedColors, setExtractedColors] = useState({});
  const toast = useToast();

  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "150%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const heroList = useMemo(() => Array.isArray(items) ? items : (items ? [items] : []), [items]);
  const item = heroList[currentIndex];

  // Map out backgrounds for all items
  const backgrounds = useMemo(() => {
    return heroList.map(h => {
      if (h?.mock_image) return h.mock_image;
      if (h?.backdrop_path) return `https://image.tmdb.org/t/p/original${h.backdrop_path}`;
      if (h?.images?.jpg?.large_image_url) return h.images.jpg.large_image_url;
      if (h?.poster_path) return `https://image.tmdb.org/t/p/original${h.poster_path}`;
      return null;
    });
  }, [heroList]);

  // Pre-calculate average colors for all slides exactly once when they mount
  useEffect(() => {
    if (backgrounds.length === 0) return;
    const fac = new FastAverageColor();
    
    backgrounds.forEach(bgImage => {
      if (!bgImage || extractedColors[bgImage]) return;
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      // Append query param to bypass cached non-CORS CSS background request
      img.src = bgImage.includes('?') ? `${bgImage}&cors=1` : `${bgImage}?cors=1`;
      img.onload = () => {
        fac.getColorAsync(img).then(color => {
          setExtractedColors(prev => ({ ...prev, [bgImage]: color }));
        }).catch(e => console.log('Color extraction failed:', e));
      };
    });

    return () => fac.destroy();
  }, [backgrounds, extractedColors]);

  // Apply colors seamlessly when currentIndex changes (no blocking main thread with calculation)
  useEffect(() => {
    if (!item) return;
    const currentBg = backgrounds[currentIndex];
    const color = extractedColors[currentBg];
    
    if (color) {
      document.documentElement.style.setProperty('--accent-primary', color.hex);
      const [r, g, b] = color.value;
      document.documentElement.style.setProperty('--accent-glow', `rgba(${r}, ${g}, ${b}, 0.5)`);
      const invertedColor = `rgba(${255 - r}, ${255 - g}, ${255 - b}, 0.8)`;
      document.documentElement.style.setProperty('--accent-secondary', invertedColor);
    }
  }, [currentIndex, extractedColors, item, backgrounds]);

  // Auto-rotation interval
  useEffect(() => {
    if (heroList.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % heroList.length);
    }, 8500);
    return () => clearInterval(interval);
  }, [heroList.length]);

  if (!item) return <div className="w-full h-[72vh] md:h-[84vh] min-h-[560px] bg-gradient-to-r from-bg-surface via-bg-surface-hover to-bg-surface bg-[length:200%_100%] animate-[pulse_2s_infinite]"></div>;

  const handleWatchTrailer = async () => {
    setIsLoadingVideo(true);
    try {
      if (item.mal_id) {
        const details = await getAnimeDetails(item.mal_id);
        if (details?.trailer?.youtube_id) {
          setVideoKey(details.trailer.youtube_id);
          setShowVideo(true);
        } else {
          toast.push({ type: 'warning', title: 'Trailer not available', message: 'No trailer found for this anime.' });
        }
      } else {
        const mediaType = item.media_type || (item.first_air_date ? 'tv' : 'movie');
        const details = await getTMDBDetails(item.id, mediaType);
        const trailer = details?.videos?.results?.find(v => v.site === 'YouTube' && v.type === 'Trailer');
        if (trailer) {
          setVideoKey(trailer.key);
          setShowVideo(true);
        } else {
          toast.push({ type: 'warning', title: 'Trailer not available', message: 'No trailer found for this title.' });
        }
      }
    } catch (error) {
      console.error(error);
      toast.push({ type: 'error', title: 'Could not load trailer', message: 'Please try again in a moment.' });
    } finally {
      setIsLoadingVideo(false);
    }
  };

  const title = item.title || item.name || item.title_english || 'Unknown Title';
  const overview = item.overview || item.synopsis || 'No description available.';
  const rating = item.vote_average ? Number(item.vote_average).toFixed(1) : (item.score ? item.score : 'N/A');

  return (
    <div className="relative w-full h-[72vh] md:h-[84vh] min-h-[560px] flex items-center overflow-hidden" ref={containerRef}>
      
      {/* Background Layers: Kept in DOM, toggle opacity for huge performance gain */}
      {backgrounds.map((bg, idx) => (
        <motion.div 
          key={idx}
          initial={false}
          animate={{ opacity: currentIndex === idx ? 1 : 0 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          className="absolute inset-0 w-full h-full bg-cover bg-center z-0 pointer-events-none will-change-opacity"
          style={{ 
            backgroundImage: `url(${bg})`,
            y: backgroundY,
            scale: 1.1 
          }}
        />
      ))}

      <div 
        className="absolute inset-0 z-[1] pointer-events-none" 
        style={{ background: 'linear-gradient(to top, var(--bg-base) 0%, transparent 80%), linear-gradient(to right, var(--bg-base) 0%, transparent 100%)' }}
      />
      
      <div className="relative z-10 pt-[88px] w-full max-w-container mx-auto px-4 md:px-8">
        <AnimatePresence mode="wait">
          <motion.div 
            key={item.id || item.mal_id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            style={{ y: textY }}
            className="max-w-[680px] will-change-transform will-change-opacity"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4 text-[0.72rem] tracking-[0.16em] uppercase font-bold bg-bg-surface/70 border border-glass-border text-text-secondary">
              Featured Pick
            </div>
            <h1 className="text-[2.2rem] sm:text-[2.6rem] md:text-[clamp(2.7rem,5vw,4.6rem)] leading-[1.04] mb-4 text-shadow-lg font-bold line-clamp-2">{title}</h1>
            
            <div className="flex items-center gap-4 mb-6 text-[0.95rem] font-bold">
              <span className="flex items-center gap-1 text-text-primary">
                <Star size={16} fill="var(--warning)" color="var(--warning)" />
                {rating}
              </span>
              {item.release_date && <span className="text-text-secondary">{item.release_date.split('-')[0]}</span>}
              {item.media_type && <span className="bg-bg-surface-active border border-glass-border px-2.5 py-1 rounded text-xs tracking-widest text-text-primary uppercase">{item.media_type}</span>}
            </div>
            
            <p className="text-[0.98rem] md:text-lg leading-relaxed text-text-secondary mb-8 line-clamp-3 md:line-clamp-4 max-w-2xl">{overview}</p>
            
            <div className="flex flex-col sm:flex-row gap-3.5 w-full max-w-[320px] sm:max-w-none">
              <button 
                className="btn-primary px-8 py-3.5 disabled:opacity-70" 
                onClick={handleWatchTrailer} 
                disabled={isLoadingVideo}
                style={{ boxShadow: '0 0 20px var(--accent-glow)' }}
              >
                <Play size={20} fill="currentColor" />
                {isLoadingVideo ? 'Loading...' : 'WATCH TRAILER'}
              </button>
              <button 
                className="btn-secondary px-8 py-3.5" 
                onClick={() => onOpenDetails(item)}
              >
                <Info size={20} />
                MORE INFO
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {heroList.length > 1 && (
        <div className="absolute bottom-6 md:bottom-10 left-[50%] -translate-x-1/2 z-20 flex gap-2">
          {heroList.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`h-2 rounded-full transition-all duration-300 ${
                idx === currentIndex ? 'w-8 bg-accent-primary' : 'w-2 bg-white/30 hover:bg-white/60'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      )}

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
