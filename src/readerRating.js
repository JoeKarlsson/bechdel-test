/** A bechdeltest.com rating (from data/eval/bechdeltest-ratings.json) in the shape a film's bechdelData takes on the site */
const siteRating = rating => rating && ({ rating: rating.rating, dubious: rating.dubious ? 1 : 0, id: Number(rating.url.match(/\/view\/(\d+)/)?.[1]) || undefined });

module.exports = { siteRating };
