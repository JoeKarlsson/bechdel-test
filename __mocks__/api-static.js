/**
 * Mock for api-static.js used in tests
 */

export const getFilms = jest.fn(() =>
  Promise.resolve({
    films: [],
    pagination: {
      currentPage: 1,
      totalPages: 1,
      totalCount: 0,
      limit: 20,
      hasNextPage: false,
      hasPrevPage: false,
    },
  })
);

export const getFilm = jest.fn((id) =>
  Promise.resolve({
    _id: id,
    title: 'Test Film',
    year: 2020,
    genres: ['Drama'],
    bechdelResults: {
      pass: true,
      bechdelScore: 3,
    },
  })
);

export const getFilmCount = jest.fn(() => Promise.resolve(0));

export const getGenres = jest.fn(() => Promise.resolve(['Drama', 'Comedy', 'Action']));

export const getYearRange = jest.fn(() =>
  Promise.resolve({ min: 1990, max: 2024 })
);

export default {
  getFilms,
  getFilm,
  getFilmCount,
  getGenres,
  getYearRange,
};
