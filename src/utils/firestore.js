// Switched from Firestore to LocalStorage to avoid Google's new billing requirements
// The watchlist is still tied to the specific user's UID so it works correctly with Auth.

export const getWatchlist = async (userId) => {
  if (!userId) return [];
  try {
    const data = localStorage.getItem(`watchlist_${userId}`);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error fetching watchlist:', error);
    return [];
  }
};

export const addToWatchlist = async (userId, item) => {
  if (!userId) return false;
  try {
    const currentList = await getWatchlist(userId);
    
    // Normalize item to only save necessary data
    const savedItem = {
      id: item.id || item.mal_id || Date.now(),
      title: item.title || item.name || item.title_english || 'Unknown',
      poster_path: item.poster_path || null,
      backdrop_path: item.backdrop_path || null,
      media_type: item.media_type || (item.mal_id ? 'anime' : 'movie'),
      vote_average: item.vote_average || item.score || 0,
      release_date: item.release_date || item.first_air_date || item.year || '',
      mock_image: item.mock_image || null,
      images: item.images || null,
    };

    // Check if already exists to prevent duplicates
    if (!currentList.some(i => i.id === savedItem.id)) {
      currentList.push(savedItem);
      localStorage.setItem(`watchlist_${userId}`, JSON.stringify(currentList));
    }
    return true;
  } catch (error) {
    console.error('Error adding to watchlist:', error);
    return false;
  }
};

export const removeFromWatchlist = async (userId, item) => {
  if (!userId) return false;
  try {
    const currentList = await getWatchlist(userId);
    const itemId = item.id || item.mal_id;
    
    const updatedList = currentList.filter(i => i.id !== itemId);
    localStorage.setItem(`watchlist_${userId}`, JSON.stringify(updatedList));
    
    return true;
  } catch (error) {
    console.error('Error removing from watchlist:', error);
    return false;
  }
};
