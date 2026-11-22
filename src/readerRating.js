const fs = require('fs');
const path = require('path');

/** A bechdeltest.com rating (from data/eval/bechdeltest-ratings.json) in the shape a film's bechdelData takes on the site */
const siteRating = rating => rating && ({ rating: rating.rating, dubious: rating.dubious ? 1 : 0, id: Number(rating.url.match(/\/view\/(\d+)/)?.[1]) || undefined });

/**
 * Give each film file in filmsDir its newest rating from ratings (IMDb id ->
 * bechdeltest.com rating): a film carries the rating it had when analyzed.
 * Returns how many films changed.
 */
const updateFilmRatings = (filmsDir, ratings) => {
	let updated = 0;
	for (const file of fs.readdirSync(filmsDir).filter(name => name.endsWith('.json'))) {
		const filmPath = path.join(filmsDir, file);
		const film = JSON.parse(fs.readFileSync(filmPath, 'utf8'));
		const bechdelData = siteRating(ratings[film.idIMDB]);
		if (!bechdelData || JSON.stringify(bechdelData) === JSON.stringify(film.bechdelData)) continue;
		fs.writeFileSync(filmPath, `${JSON.stringify({ ...film, bechdelData }, null, 2)}\n`);
		updated++;
	}
	return updated;
};

module.exports = { siteRating, updateFilmRatings };
