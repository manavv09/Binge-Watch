import React, { useState, useEffect } from 'react';
import { X, Star, MessageSquare, Send, Bookmark, BookmarkCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getTMDBDetails, getAnimeDetails } from '../utils/api';
import { addToWatchlist, removeFromWatchlist, getWatchlist } from '../utils/firestore';
import './DetailsModal.css';

const DetailsModal = ({ item, onClose, currentUser, onRequireAuth }) => {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Interactive features state
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([]);
  const [isWatchlisted, setIsWatchlisted] = useState(false);

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
      return;
    }
    
    if (isWatchlisted) {
      const success = await removeFromWatchlist(currentUser.uid, item);
      if (success) setIsWatchlisted(false);
    } else {
      const success = await addToWatchlist(currentUser.uid, details || item);
      if (success) setIsWatchlisted(true);
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

  return (
    <AnimatePresence>
      <div className="modal-overlay" onClick={onClose}>
        <motion.div 
          className="modal-content glass-panel"
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.95 }}
          transition={{ duration: 0.3 }}
          onClick={e => e.stopPropagation()}
        >
          <div className="modal-actions">
            <button 
              className={`watchlist-btn btn-icon ${isWatchlisted ? 'active' : ''}`} 
              onClick={handleWatchlistToggle}
              title={isWatchlisted ? "Remove from Watchlist" : "Add to Watchlist"}
            >
              {isWatchlisted ? <BookmarkCheck size={20} color="var(--accent-primary)" /> : <Bookmark size={20} />}
            </button>
            <button className="modal-close btn-icon" onClick={onClose}>
              <X size={24} />
            </button>
          </div>

          <div className="modal-header" style={{ backgroundImage: `url(${backdrop})` }}>
            <div className="modal-header-overlay" />
          </div>

          <div className="modal-body">
            <div className="modal-main-info">
              <img src={poster} alt={title} className="modal-poster" />
              <div className="modal-details">
                <h2 className="modal-title">{title}</h2>
                <div className="modal-meta">
                  <span className="rating-badge">
                    <Star size={16} fill="var(--warning)" color="var(--warning)" />
                    {details?.vote_average ? Number(details.vote_average).toFixed(1) : (details?.score || 'N/A')}
                  </span>
                  <span className="release-year">
                    {details?.release_date?.split('-')[0] || details?.first_air_date?.split('-')[0] || details?.year || ''}
                  </span>
                  <span className="media-type-badge">
                    {isAnime ? 'ANIME' : (details?.media_type || 'MEDIA').toUpperCase()}
                  </span>
                </div>
                
                <p className="modal-overview">{loading ? 'Loading details...' : overview}</p>

                {cast.length > 0 && (
                  <div className="cast-section">
                    <h3>Top Cast</h3>
                    <div className="cast-list">
                      {cast.map(person => (
                        <div key={person.id} className="cast-item">
                          <img 
                            src={person.profile_path ? `https://image.tmdb.org/t/p/w185${person.profile_path}` : 'https://via.placeholder.com/185x185?text=NA'} 
                            alt={person.name} 
                            className="cast-avatar" 
                          />
                          <span className="cast-name">{person.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="interactive-section">
              <div className="rating-section">
                <h3>Rate this</h3>
                <div className="star-rating">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      className={`star-btn ${star <= (hoverRating || userRating) ? 'active' : ''}`}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => handleRating(star)}
                    >
                      <Star size={32} fill={star <= (hoverRating || userRating) ? "var(--warning)" : "transparent"} color="var(--warning)" />
                    </button>
                  ))}
                  <span className="rating-text">
                    {userRating > 0 ? `You rated this ${userRating}/5` : 'Click to rate'}
                  </span>
                </div>
              </div>

              <div className="comments-section">
                <h3><MessageSquare size={20} className="inline-icon" /> Comments</h3>
                
                <form className="comment-form" onSubmit={handleAddComment}>
                  <input
                    type="text"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Share your thoughts..."
                    className="comment-input"
                  />
                  <button type="submit" className="btn-primary comment-submit" disabled={!comment.trim()}>
                    <Send size={18} />
                  </button>
                </form>

                <div className="comments-list">
                  {comments.length === 0 ? (
                    <p className="no-comments">No comments yet. Be the first to share your thoughts!</p>
                  ) : (
                    comments.map(c => (
                      <div key={c.id} className="comment-card">
                        <div className="comment-header">
                          <span className="comment-user">{c.user}</span>
                          <span className="comment-date">{c.date}</span>
                        </div>
                        <p className="comment-text">{c.text}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default DetailsModal;
