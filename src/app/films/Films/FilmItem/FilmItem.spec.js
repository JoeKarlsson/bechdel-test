import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { render } from '@testing-library/react';
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
				const { container } = render(
					<MemoryRouter>
						<FilmItem />
					</MemoryRouter>
				);
				expect(container.firstChild).toBeTruthy();
			});
		});

		describe('with film data', () => {
			it('renders film poster and help text', () => {
				const { getByAltText, getByText } = render(
					<MemoryRouter>
						<FilmItem film={mockFilmPassing} />
					</MemoryRouter>
				);

				expect(getByAltText('Test Movie Passing')).toBeTruthy();
				expect(getByText('Help')).toBeTruthy();
			});

			it('shows checkmark for passing films', () => {
				const { getByText } = render(
					<MemoryRouter>
						<FilmItem film={mockFilmPassing} />
					</MemoryRouter>
				);

				expect(getByText('✓')).toBeTruthy();
			});

			it('shows X for failing films', () => {
				const { getByText } = render(
					<MemoryRouter>
						<FilmItem film={mockFilmFailing} />
					</MemoryRouter>
				);

				expect(getByText('✗')).toBeTruthy();
			});
		});
	});
});
