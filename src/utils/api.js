// API configurations
// IMPORTANT: You need a TMDB API key. 
// Get one at https://developer.themoviedb.org/docs/getting-started
const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY || 'DEMO_KEY'; // Replace with real key or use .env
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const JIKAN_BASE_URL = 'https://api.jikan.moe/v4';

const fetchFromTMDB = async (endpoint, params = {}) => {
  if (TMDB_API_KEY === 'DEMO_KEY') {
    console.warn('Using demo mode for TMDB. Data might be limited or mocked.');
    return generateMockTMDBData(endpoint);
  }

  const queryParams = new URLSearchParams({
    api_key: TMDB_API_KEY,
    ...params
  });

  try {
    const response = await fetch(`${TMDB_BASE_URL}${endpoint}?${queryParams}`);
    if (!response.ok) throw new Error('TMDB API Error');
    return await response.json();
  } catch (error) {
    console.error('Error fetching from TMDB:', error);
    return null;
  }
};

const fetchFromJikan = async (endpoint, params = {}) => {
  const queryParams = new URLSearchParams(params);
  const queryString = queryParams.toString() ? `?${queryParams}` : '';
  
  try {
    const response = await fetch(`${JIKAN_BASE_URL}${endpoint}${queryString}`);
    if (!response.ok) throw new Error('Jikan API Error');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching from Jikan:', error);
    return null;
  }
};

// --- Movie & Series (TMDB) ---

export const getTrending = async (mediaType = 'all', page = 1) => {
  // mediaType: 'all', 'movie', 'tv'
  const data = await fetchFromTMDB(`/trending/${mediaType}/day`, { page });
  return data ? data.results : [];
};

export const getUpcomingMovies = async () => {
  const data = await fetchFromTMDB('/movie/upcoming');
  return data ? data.results : [];
};

export const getAiringSeries = async (page = 1) => {
  const data = await fetchFromTMDB('/tv/on_the_air', { page });
  return data ? data.results : [];
};

export const searchTMDB = async (query, type = 'multi', page = 1) => {
  // type: 'multi', 'movie', 'tv'
  const data = await fetchFromTMDB(`/search/${type}`, { query, page });
  return data ? data.results : [];
};

export const getTMDBDetails = async (id, type) => {
  // type: 'movie' or 'tv'
  const data = await fetchFromTMDB(`/${type}/${id}`, { append_to_response: 'credits,videos' });
  return data;
};

// --- Anime (Jikan) ---

export const getTrendingAnime = async (page = 1) => {
  const data = await fetchFromJikan('/top/anime', { filter: 'airing', limit: 20, page });
  return data?.data || [];
};

export const getUpcomingAnime = async () => {
  const data = await fetchFromJikan('/seasons/upcoming', { limit: 20 });
  return data?.data || [];
};

export const searchAnime = async (query, page = 1) => {
  const data = await fetchFromJikan('/anime', { q: query, limit: 20, page });
  return data?.data || [];
};

export const getAnimeDetails = async (id) => {
  const data = await fetchFromJikan(`/anime/${id}/full`);
  return data?.data || null;
};

// --- Mock Data Generator for when TMDB API Key is missing ---
// This ensures the app looks good even without an API key.

function generateMockTMDBData(endpoint) {
  const mockPosters = [
    'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&auto=format&fit=crop&q=60',
    'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?w=500&auto=format&fit=crop&q=60',
    'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=500&auto=format&fit=crop&q=60'
  ];

  if (endpoint.includes('trending') || endpoint.includes('upcoming') || endpoint.includes('search')) {
    return {
      results: Array.from({ length: 10 }).map((_, i) => ({
        id: `mock_${i}`,
        title: `Mock Title ${i + 1}`,
        name: `Mock Series ${i + 1}`,
        overview: 'This is a mock description because the TMDB API key is missing. Please add your key to the .env file.',
        poster_path: null, // We'll handle this in the UI
        backdrop_path: null,
        mock_image: mockPosters[i % mockPosters.length],
        vote_average: (Math.random() * 4 + 6).toFixed(1),
        release_date: '2026-05-01',
        media_type: i % 2 === 0 ? 'movie' : 'tv'
      }))
    };
  }
  
  if (endpoint.match(/\/(movie|tv)\/\d+/)) {
    return {
      id: 'mock_detail',
      title: 'Mock Details View',
      overview: 'Detailed mock overview for testing the UI.',
      credits: { cast: [] },
      videos: { results: [] }
    };
  }

  return { results: [] };
}
