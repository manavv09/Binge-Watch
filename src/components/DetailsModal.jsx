import React, { useState, useEffect } from 'react';
import { X, Star, MessageSquare, Send, Bookmark, BookmarkCheck, Ticket, MonitorPlay } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getTMDBDetails, getAnimeDetails } from '../utils/api';
import { addToWatchlist, removeFromWatchlist, getWatchlist } from '../utils/firestore';
import BookingPartnersModal from './BookingPartnersModal';
import { useToast } from './ToastProvider';

// Helper function to generate direct search links for popular OTTs
const getDirectOttLink = (providerName, title) => {
  if (!title || !providerName) return null;
  const encodedTitle = encodeURIComponent(title);
  const name = providerName.toLowerCase();
  
  if (name.includes('netflix')) return `https://www.netflix.com/search?q=${encodedTitle}`;
  if (name.includes('amazon') || name.includes('prime')) return `https://www.primevideo.com/search/ref=atv_sr_sug_1?phrase=${encodedTitle}`;
  if (name.includes('hotstar')) return `https://www.hotstar.com/in/explore?search_query=${encodedTitle}`;
  if (name.includes('zee5')) return `https://www.zee5.com/search?q=${encodedTitle}`;
  if (name.includes('sonyliv')) return `https://www.sonyliv.com/search?query=${encodedTitle}`;
  if (name.includes('apple')) return `https://tv.apple.com/search?q=${encodedTitle}`;
  if (name.includes('youtube')) return `https://www.youtube.com/results?search_query=${encodedTitle}+movie`;
  if (name.includes('google play')) return `https://play.google.com/store/search?q=${encodedTitle}&c=movies`;
  if (name.includes('jio')) return `https://www.jiocinema.com/search?q=${encodedTitle}`;
  if (name.includes('hulu')) return `https://www.hulu.com/search?q=${encodedTitle}`;
  if (name.includes('max') || name.includes('hbo')) return `https://www.max.com/search?q=${encodedTitle}`;
  if (name.includes('disney')) return `https://www.disneyplus.com/search?q=${encodedTitle}`;
  if (name.includes('crunchyroll')) return `https://www.crunchyroll.com/search?q=${encodedTitle}`;
  
  return null;
};

// A movie is bookable if it's a movie (not anime/tv) and release date is within 90 days from today
const isMovieBookable = (item, details) => {
  if (!item || item.mal_id) return false; // exclude anime
  const mediaType = details?.media_type || item?.media_type || (item?.first_air_date ? 'tv' : 'movie');
  if (mediaType === 'tv') return false;
  const releaseDate = details?.release_date || item?.release_date;
  if (!releaseDate) return false;
  const release = new Date(releaseDate);
  const now = new Date();
  const ninetyDaysAgo = new Date(now);
  ninetyDaysAgo.setDate(now.getDate() - 90);
  const ninetyDaysAhead = new Date(now);
  ninetyDaysAhead.setDate(now.getDate() + 90);
  return release >= ninetyDaysAgo && release <= ninetyDaysAhead;
};

const DetailsModal = ({ item, onClose, currentUser, onRequireAuth }) => {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  
  // Interactive features state
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([]);
  const [isWatchlisted, setIsWatchlisted] = useState(false);
  const [showBooking, setShowBooking] = useState(false);

  const id = item?.id || item?.mal_id;
  const isAnime = !!item?.mal_id;

  useEffect(() => {
    if (!item) return;

    const fetchDetails = async () => {
      setLoading(true);
      try {
        if (isAnime) {
          const data = await getAnimeDetails(item.mal_id);
          setDetails(data || item);
        } else {
          // TMDB details
          const mediaType = item.media_type || (item.first_air_date ? 'tv' : 'movie');
          const data = await getTMDBDetails(item.id, mediaType);
          setDetails(data || item);
        }
      } catch (error) {
        console.error('Failed to fetch details:', error);
        setDetails(item); // fallback to basic item info
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();

    // Check watchlist status
    const checkWatchlist = async () => {
      if (currentUser) {
        const list = await getWatchlist(currentUser.uid);
        setIsWatchlisted(list.some(i => (i.id === id || i.mal_id === id)));
      } else {
        setIsWatchlisted(false);
      }
    };
    checkWatchlist();

    // Load user data from localStorage (For ratings/comments, still local for now)
    const savedData = JSON.parse(localStorage.getItem(`media_${id}`)) || { rating: 0, comments: [] };
    setUserRating(savedData.rating);
    setComments(savedData.comments);

    // Lock body scroll
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [item, id, isAnime, currentUser]);

  const handleWatchlistToggle = async () => {
    if (!currentUser) {
      onRequireAuth();
      toast.push({ type: 'info', title: 'Sign in required', message: 'Please sign in to use your watchlist.' });
      return;
    }
    
    if (isWatchlisted) {
      const success = await removeFromWatchlist(currentUser.uid, item);
      if (success) {
        setIsWatchlisted(false);
        toast.push({ type: 'success', title: 'Removed from watchlist', message: 'This title was removed from your list.' });
      } else {
        toast.push({ type: 'error', title: 'Could not remove', message: 'Please try again.' });
      }
    } else {
      const success = await addToWatchlist(currentUser.uid, details || item);
      if (success) {
        setIsWatchlisted(true);
        toast.push({ type: 'success', title: 'Added to watchlist', message: 'Saved to your list.' });
      } else {
        toast.push({ type: 'error', title: 'Could not add', message: 'Please try again.' });
      }
    }
  };

  const handleSaveData = (newRating, newComments) => {
    localStorage.setItem(`media_${id}`, JSON.stringify({
      rating: newRating,
      comments: newComments
    }));
  };

  const handleRating = (rating) => {
    setUserRating(rating);
    handleSaveData(rating, comments);
  };

  const handleAddComment = (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    
    const newComment = {
      id: Date.now(),
      text: comment,
      date: new Date().toLocaleDateString(),
      user: currentUser ? (currentUser.email.split('@')[0]) : 'Guest User'
    };
    
    const updatedComments = [newComment, ...comments];
    setComments(updatedComments);
    setComment('');
    handleSaveData(userRating, updatedComments);
  };

  if (!item) return null;

  const title = details?.title || details?.name || details?.title_english || 'Unknown Title';
  const overview = details?.overview || details?.synopsis || 'No description available.';
  
  let backdrop = details?.backdrop_path ? `https://image.tmdb.org/t/p/original${details.backdrop_path}` : null;
  if (!backdrop && details?.images?.jpg?.large_image_url) {
    backdrop = details.images.jpg.large_image_url;
  }
  if (!backdrop) backdrop = item.mock_image || 'https://via.placeholder.com/1200x600?text=No+Backdrop';

  let poster = details?.poster_path ? `https://image.tmdb.org/t/p/w500${details.poster_path}` : null;
  if (!poster && details?.images?.jpg?.image_url) poster = details.images.jpg.image_url;
  if (!poster) poster = item.mock_image || 'https://via.placeholder.com/500x750?text=No+Poster';

  // Extract cast
  let cast = [];
  if (details?.credits?.cast) {
    cast = details.credits.cast.slice(0, 6);
  }

  // Extract streaming providers
  let streamingProviders = [];
  let streamingLink = null;

  const getProviderLogo = (name, originalPath) => {
    if (originalPath && originalPath.startsWith('/')) {
      return `https://image.tmdb.org/t/p/original${originalPath}`;
    }
    const lowerName = name.toLowerCase();
    if (lowerName.includes('netflix')) return 'https://images.justwatch.com/icon/207360008/s100';
    if (lowerName.includes('prime') || lowerName.includes('amazon')) return 'https://images.justwatch.com/icon/52449861/s100';
    if (lowerName.includes('hotstar') || lowerName.includes('disney')) return 'https://images.justwatch.com/icon/313118777/s100';
    if (lowerName.includes('apple')) return 'https://images.justwatch.com/icon/190848813/s100';
    if (lowerName.includes('jio')) return 'https://images.justwatch.com/icon/138047862/s100';
    if (lowerName.includes('zee5')) return 'https://images.justwatch.com/icon/93715891/s100';
    if (lowerName.includes('sonyliv')) return 'https://images.justwatch.com/icon/207436034/s100';
    if (lowerName.includes('hulu')) return 'https://images.justwatch.com/icon/11714414/s100';
    if (lowerName.includes('max') || lowerName.includes('hbo')) return 'https://images.justwatch.com/icon/333334547/s100';
    if (lowerName.includes('crunchyroll')) return 'https://images.justwatch.com/icon/128557227/s100';
    if (lowerName.includes('youtube')) return 'https://images.justwatch.com/icon/59562412/s100';
    if (lowerName.includes('google play')) return 'https://images.justwatch.com/icon/169478387/s100';
    return null;
  };

  if (isAnime && details?.streaming) {
    streamingProviders = details.streaming.map(s => ({
      provider_name: s.name,
      url: s.url,
      logo_path: getProviderLogo(s.name, null)
    }));
  } else if (details?.['watch/providers']?.results) {
    const results = details['watch/providers'].results;
    const countryData = results.IN || results.US || Object.values(results)[0];
    
    if (countryData) {
      streamingLink = countryData.link;
      // Combine flatrate, rent, buy
      const allProviders = [
        ...(countryData.flatrate || []),
        ...(countryData.rent || []),
        ...(countryData.buy || [])
      ];

      const normalizeProviderName = (name) => {
        if (!name) return '';
        const lowerName = name.toLowerCase();
        if (lowerName.includes('amazon') || lowerName.includes('prime')) return 'Amazon Prime Video';
        if (lowerName.includes('netflix')) return 'Netflix';
        if (lowerName.includes('apple')) return 'Apple TV';
        if (lowerName.includes('disney') || lowerName.includes('hotstar')) return 'Disney+ Hotstar';
        if (lowerName.includes('hulu')) return 'Hulu';
        if (lowerName.includes('max') || lowerName.includes('hbo')) return 'Max';
        if (lowerName.includes('crunchyroll')) return 'Crunchyroll';
        if (lowerName.includes('jio')) return 'JioCinema';
        if (lowerName.includes('youtube')) return 'YouTube';
        if (lowerName.includes('google play')) return 'Google Play Movies';
        if (lowerName.includes('zee5')) return 'ZEE5';
        if (lowerName.includes('sonyliv')) return 'Sony LIV';
        return name;
      };
      
      const uniqueProviders = [];
      const seenNames = new Set();
      
      allProviders.forEach(p => {
        const normalizedName = normalizeProviderName(p.provider_name);
        if (normalizedName && !seenNames.has(normalizedName)) {
          seenNames.add(normalizedName);
          uniqueProviders.push({
            provider_name: normalizedName,
            logo_path: getProviderLogo(normalizedName, p.logo_path)
          });
        }
      });
      streamingProviders = uniqueProviders;
    }
  }

  return (
    <>
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/60 backdrop-blur-xl z-[2000] flex items-center justify-center md:p-4"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div 
          className="w-full h-full md:rounded-[24px] bg-bg-surface overflow-x-hidden overflow-y-auto relative flex flex-col backdrop-blur-md border border-glass-border shadow-2xl"
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24, scale: 0.98 }}
          transition={{ duration: 0.24, ease: "easeOut" }}
          onClick={e => e.stopPropagation()}
        >
          <div className="absolute top-4 right-4 z-10 flex gap-2">
            <button 
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-150 bg-bg-surface-active text-text-primary border border-glass-border hover:-translate-y-0.5 shadow-lg ${isWatchlisted ? 'bg-accent-primary/20 !border-accent-primary' : ''}`} 
              onClick={handleWatchlistToggle}
              title={isWatchlisted ? "Remove from Watchlist" : "Add to Watchlist"}
            >
              {isWatchlisted ? <BookmarkCheck size={20} color="var(--accent-primary)" /> : <Bookmark size={20} />}
            </button>
            <button className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-150 bg-bg-surface-active text-text-primary border border-glass-border hover:-translate-y-0.5 shadow-lg" onClick={onClose}>
              <X size={24} />
            </button>
          </div>

          <div className="w-full h-[40vh] min-h-[300px] md:h-[50vh] md:min-h-[400px] bg-cover bg-center relative shrink-0" style={{ backgroundImage: `url(${backdrop})` }}>
            <div className="absolute inset-0 bg-gradient-to-t from-bg-surface to-transparent" />
          </div>

          <div className="p-4 md:p-8 xl:p-16 max-w-[1400px] mx-auto w-full flex flex-col gap-6 xl:gap-8 -mt-[100px] md:-mt-[120px] xl:-mt-[150px] relative z-10">
            <div className="flex flex-col xl:flex-row gap-6 xl:gap-8 items-center xl:items-start text-center xl:text-left">
              <img src={poster} alt={title} className="w-[160px] md:w-[240px] xl:w-[300px] h-[240px] md:h-[360px] xl:h-[450px] rounded-xl object-cover shadow-volumetric border border-glass-border shrink-0 -mt-[40px] md:-mt-[60px] xl:mt-0" />
              <div className="grow w-full max-w-[100%] min-w-0">
                <h2 className="text-3xl sm:text-4xl md:text-5xl xl:text-5xl 2xl:text-6xl mb-5 leading-snug text-text-primary drop-shadow-md font-bold break-words">{title}</h2>
                <div className="flex flex-wrap items-center justify-center xl:justify-start gap-3 xl:gap-4 mb-6 text-[0.85rem] md:text-[0.95rem]">
                  <span className="flex items-center gap-1 text-text-primary font-bold">
                    <Star size={16} fill="var(--warning)" color="var(--warning)" />
                    {details?.vote_average ? Number(details.vote_average).toFixed(1) : (details?.score || 'N/A')}
                  </span>
                  <span className="text-text-secondary">
                    {details?.release_date?.split('-')[0] || details?.first_air_date?.split('-')[0] || details?.year || ''}
                  </span>
                  <span className="bg-bg-surface-active border border-glass-border px-2.5 py-1 rounded text-xs tracking-widest text-text-primary font-bold">
                    {isAnime ? 'ANIME' : (details?.media_type || 'MEDIA').toUpperCase()}
                  </span>
                </div>
                
                <p className="text-[1.05rem] leading-relaxed text-text-secondary mb-6 max-w-3xl">{loading ? 'Loading details...' : overview}</p>

                {/* Book Ticket Button */}
                {isMovieBookable(item, details) && (
                  <div className="mb-6">
                    <button
                      type="button"
                      onClick={() => setShowBooking(true)}
                      className="inline-flex items-center gap-2.5 px-8 py-4 rounded-full bg-gradient-to-r from-accent-primary to-accent-secondary text-white font-bold text-sm shadow-[0_4px_20px_rgba(59,130,246,0.3)] hover:shadow-[0_4px_25px_rgba(59,130,246,0.5)] hover:-translate-y-0.5 active:scale-95 transition-all duration-200"
                    >
                      <Ticket size={18} />
                      Book Tickets
                    </button>
                    <p className="mt-3 text-text-muted text-xs font-medium">Official Ticketing Partner · Starts from ₹250</p>
                  </div>
                )}

                {/* Where to Watch */}
                {streamingProviders.length > 0 && (
                  <div className="mb-8">
                    <h3 className="mb-4 text-[1.2rem] font-bold text-text-primary flex items-center gap-2">
                      <MonitorPlay size={20} className="text-accent-primary" />
                      Where to Watch
                    </h3>
                    <div className="flex flex-wrap gap-3">
                      {streamingProviders.map((provider, index) => {
                        const directUrl = provider.url || getDirectOttLink(provider.provider_name, title);
                        const finalUrl = directUrl || streamingLink;

                        const content = (
                          <div key={index} className="flex items-center gap-2 bg-bg-surface-active border border-glass-border rounded-lg p-2 pr-4 shadow-sm hover:-translate-y-1 hover:shadow-[0_4px_15px_rgba(59,130,246,0.2)] hover:border-accent-primary/60 hover:bg-black/40 transition-all duration-300 group cursor-pointer">
                            {provider.logo_path ? (
                              <div className="overflow-hidden rounded-md">
                                <img src={provider.logo_path} alt={provider.provider_name} className="w-8 h-8 object-cover group-hover:scale-110 transition-transform duration-300" />
                              </div>
                            ) : (
                              <div className="w-8 h-8 rounded-md bg-accent-primary/10 flex items-center justify-center group-hover:bg-accent-primary/20 transition-colors duration-300">
                                <MonitorPlay size={16} className="text-accent-primary group-hover:scale-110 transition-transform duration-300" />
                              </div>
                            )}
                            <span className="text-[0.85rem] font-medium text-text-primary group-hover:text-accent-primary transition-colors duration-300">{provider.provider_name}</span>
                          </div>
                        );

                        return finalUrl ? (
                          <a href={finalUrl} target="_blank" rel="noopener noreferrer" key={index} className="block" title={directUrl ? `Open in ${provider.provider_name}` : "Powered by JustWatch"}>
                            {content}
                          </a>
                        ) : (
                          content
                        );
                      })}
                    </div>
                  </div>
                )}

                {cast.length > 0 && (
                  <div>
                    <h3 className="mb-4 text-[1.2rem] font-bold text-text-primary">Top Cast</h3>
                    <div className="flex gap-4 overflow-x-auto pb-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                      {cast.map(person => (
                        <div key={person.id} className="flex flex-col items-center gap-2 w-[80px] shrink-0">
                          <img 
                            src={person.profile_path ? `https://image.tmdb.org/t/p/w185${person.profile_path}` : 'https://via.placeholder.com/185x185?text=NA'} 
                            alt={person.name} 
                            className="w-[60px] h-[60px] rounded-full object-cover border-2 border-glass-border shadow-sm" 
                          />
                          <span className="text-[0.75rem] text-center text-text-secondary font-medium truncate w-full">{person.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-[1fr_2fr] gap-8 border-t border-glass-border pt-8">
              <div>
                <h3 className="mb-4 flex items-center gap-2 font-bold text-[1.2rem] text-text-primary">Rate this</h3>
                <div className="flex flex-col gap-1">
                  <div className="flex flex-row items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        className="p-1 transition-transform duration-150 hover:scale-110 inline-flex items-center justify-center"
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => handleRating(star)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                      >
                        <Star
                          size={32}
                          fill={star <= (hoverRating || userRating) ? '#f59e0b' : 'none'}
                          color="#f59e0b"
                          strokeWidth={1.5}
                        />
                      </button>
                    ))}
                  </div>
                  <span className="text-[0.9rem] text-text-muted mt-2">
                    {userRating > 0 ? `You rated this ${userRating}/5` : 'Click to rate'}
                  </span>
                </div>
              </div>

              <div>
                <h3 className="mb-4 flex items-center gap-2 font-bold text-[1.2rem]"><MessageSquare size={20} /> Comments</h3>
                
                <form className="flex gap-2 mb-6" onSubmit={handleAddComment}>
                  <input
                    type="text"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Share your thoughts..."
                    className="grow bg-black/40 border border-glass-border p-3 rounded-lg text-white focus:outline-none focus:border-accent-primary focus:shadow-[0_0_0_3px_var(--accent-glow)] focus:bg-black/60 transition-all"
                  />
                  <button type="submit" className="btn-primary px-6 py-3 rounded-lg disabled:opacity-50" disabled={!comment.trim()}>
                    <Send size={18} />
                  </button>
                </form>

                <div className="flex flex-col gap-4 max-h-[300px] overflow-y-auto pr-2">
                  {comments.length === 0 ? (
                    <p className="text-text-muted italic text-[0.9rem]">No comments yet. Be the first to share your thoughts!</p>
                  ) : (
                    comments.map(c => (
                      <div key={c.id} className="bg-white/5 p-4 rounded-lg border border-glass-border">
                        <div className="flex justify-between mb-2 text-[0.85rem]">
                          <span className="font-semibold text-accent-secondary">{c.user}</span>
                          <span className="text-text-muted">{c.date}</span>
                        </div>
                        <p className="text-[0.95rem] leading-[1.4] text-text-primary">{c.text}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>

    {/* Booking Partners Modal */}
    {showBooking && (
      <BookingPartnersModal
        item={details || item}
        onClose={() => setShowBooking(false)}
      />
    )}
  </>
  );
};

export default DetailsModal;
