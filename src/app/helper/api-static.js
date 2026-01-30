/**
 * Static API service for GitHub Pages deployment
 *
 * Replaces the dynamic API calls with static JSON data
 * loaded at build time. Supports client-side filtering,
 * sorting, and pagination.
 */

import filmsData from '../data/films.json';

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

  let filtered = [...filmsData];

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
 * Get a single film by ID
 * @param {string} id - Film MongoDB ObjectId
 * @returns {Object|null} - Film object or null
 */
export const getFilm = (id) => {
  const film = filmsData.find(f => f._id === id);
  if (!film) {
    return Promise.reject(new Error('Film not found'));
  }
  return Promise.resolve(film);
};

/**
 * Get total film count
 * @returns {number}
 */
export const getFilmCount = () => {
  return Promise.resolve(filmsData.length);
};

/**
 * Get all unique genres
 * @returns {string[]}
 */
export const getGenres = () => {
  const genreSet = new Set();
  filmsData.forEach(film => {
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
  const years = filmsData
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
