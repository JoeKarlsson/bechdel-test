import React from 'react';
import { render } from '../../../test-utils';
import FilmItem from './FilmItem';

describe('FilmItem', () => {
	global.requestAnimationFrame = callback => {
		setTimeout(callback, 0);
	};

	const mockFilmPassing = {
		_id: '507f1f77bcf86cd799439011',
		title: 'test-movie-passing',
		images: {
			poster: 'https://example.com/poster.jpg'
		},
		bechdelResults: {
			pass: true
		}
	};

	const mockFilmFailing = {
		_id: '507f1f77bcf86cd799439012',
		title: 'test_movie_failing',
		images: {
			poster: 'https://example.com/poster2.jpg'
		},
		bechdelResults: {
			pass: false
		}
	};

	describe('rendering', () => {
		describe('initial state', () => {
			it('is rendered correctly', () => {
				const { container } = render(<FilmItem />);
				expect(container.firstChild).toBeTruthy();
			});
		});

		describe('with film data', () => {
			it('renders film poster and title', () => {
				const { getByAltText, getByText } = render(
					<FilmItem film={mockFilmPassing} />
				);

				expect(getByAltText('test-movie-passing')).toBeTruthy();
				expect(getByText('test-movie-passing')).toBeTruthy();
			});

			it('shows checkmark for passing films', () => {
				const { getByText } = render(
					<FilmItem film={mockFilmPassing} />
				);

				expect(getByText('✓')).toBeTruthy();
			});

			it('shows X for failing films', () => {
				const { getByText } = render(
					<FilmItem film={mockFilmFailing} />
				);

				expect(getByText('✗')).toBeTruthy();
			});
		});
	});
});
