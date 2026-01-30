/**
 * Static API service for GitHub Pages deployment
 *
 * Uses lightweight summary data for list views (fast initial load)
 * and fetches full detail files on demand for individual films.
 *
 * Initial load: ~93KB (summary)
 * Detail files: ~600KB each (loaded on demand)
 */

import filmsSummary from '../data/films-summary.json';

// Cache for fetched film details
const filmDetailCache = new Map();

// Base path for GitHub Pages deployment
const BASE_PATH = '/bechdel-test';

/**
 * Filter and sort films based on query parameters
 * @param {Object} params - Query parameters
 * @returns {Object} - Filtered films with pagination info
 */
export const getFilms = (params = {}) => {
  const {
    page = 1,
    limit = 20,
    sort = 'popularity',
    pass,
    genres,
    yearMin,
    yearMax,
    minRating,
  } = params;

  let filtered = [...filmsSummary];

  // Apply filters
  if (pass !== undefined && pass !== null && pass !== '') {
    const passFilter = pass === 'true' || pass === true;
    filtered = filtered.filter(film =>
      film.bechdelResults && film.bechdelResults.pass === passFilter
    );
  }

  if (genres && genres.length > 0) {
    const genreList = Array.isArray(genres) ? genres : genres.split(',');
    filtered = filtered.filter(film =>
      film.genres && film.genres.some(g => genreList.includes(g))
    );
  }

  if (yearMin) {
    const minYear = parseInt(yearMin, 10);
    filtered = filtered.filter(film => film.year >= minYear);
  }

  if (yearMax) {
    const maxYear = parseInt(yearMax, 10);
    filtered = filtered.filter(film => film.year <= maxYear);
  }

  if (minRating && parseFloat(minRating) > 0) {
    const rating = parseFloat(minRating);
    filtered = filtered.filter(film =>
      film.rating && parseFloat(film.rating) >= rating
    );
  }

  // Apply sorting
  filtered.sort((a, b) => {
    switch (sort) {
      case 'popularity':
        // Sort by rating then metascore
        const ratingDiff = (parseFloat(b.rating) || 0) - (parseFloat(a.rating) || 0);
        if (ratingDiff !== 0) return ratingDiff;
        return (b.metascore || 0) - (a.metascore || 0);
      case 'rating':
        return (parseFloat(b.rating) || 0) - (parseFloat(a.rating) || 0);
      case 'newest':
        return new Date(b.dateUploaded || 0) - new Date(a.dateUploaded || 0);
      case 'oldest':
        return new Date(a.dateUploaded || 0) - new Date(b.dateUploaded || 0);
      case 'title-asc':
        return (a.title || '').localeCompare(b.title || '');
      case 'title-desc':
        return (b.title || '').localeCompare(a.title || '');
      case 'year-desc':
        return (b.year || 0) - (a.year || 0);
      case 'year-asc':
        return (a.year || 0) - (b.year || 0);
      case 'bechdel-score':
        return (b.bechdelResults?.bechdelScore || 0) - (a.bechdelResults?.bechdelScore || 0);
      default:
        return (parseFloat(b.rating) || 0) - (parseFloat(a.rating) || 0);
    }
  });

  // Apply pagination
  const totalCount = filtered.length;
  const totalPages = Math.ceil(totalCount / limit);
  const currentPage = Math.min(Math.max(1, parseInt(page, 10)), totalPages || 1);
  const skip = (currentPage - 1) * limit;
  const paginatedFilms = filtered.slice(skip, skip + limit);

  return Promise.resolve({
    films: paginatedFilms,
    pagination: {
      currentPage,
      totalPages,
      totalCount,
      limit: parseInt(limit, 10),
      hasNextPage: currentPage < totalPages,
      hasPrevPage: currentPage > 1,
    },
  });
};

/**
 * Get a single film by ID (lazy loads full detail)
 * @param {string} id - Film MongoDB ObjectId
 * @returns {Promise<Object>} - Film object with full details
 */
export const getFilm = async (id) => {
  // Check cache first
  if (filmDetailCache.has(id)) {
    return filmDetailCache.get(id);
  }

  // Verify film exists in summary
  const summaryFilm = filmsSummary.find(f => f._id === id);
  if (!summaryFilm) {
    throw new Error('Film not found');
  }

  try {
    // Fetch full detail file
    const response = await fetch(`${BASE_PATH}/data/films/${id}.json`);
    if (!response.ok) {
      throw new Error('Failed to load film details');
    }
    const film = await response.json();

    // Cache the result
    filmDetailCache.set(id, film);

    return film;
  } catch (error) {
    // Fall back to summary data if detail fetch fails
    console.warn(`Failed to load detail for film ${id}, using summary:`, error);
    return summaryFilm;
  }
};

/**
 * Get total film count
 * @returns {number}
 */
export const getFilmCount = () => {
  return Promise.resolve(filmsSummary.length);
};

/**
 * Get all unique genres
 * @returns {string[]}
 */
export const getGenres = () => {
  const genreSet = new Set();
  filmsSummary.forEach(film => {
    if (film.genres) {
      film.genres.forEach(genre => genreSet.add(genre));
    }
  });
  return Promise.resolve(Array.from(genreSet).sort());
};

/**
 * Get year range of films
 * @returns {Object} - { min, max }
 */
export const getYearRange = () => {
  const years = filmsSummary
    .filter(f => f.year)
    .map(f => f.year);
  return Promise.resolve({
    min: Math.min(...years),
    max: Math.max(...years),
  });
};

export default {
  getFilms,
  getFilm,
  getFilmCount,
  getGenres,
  getYearRange,
};
