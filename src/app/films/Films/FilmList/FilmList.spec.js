import React from 'react';
import { render } from '../../../test-utils';
import FilmList from './FilmList';

describe('FilmList', () => {
	global.requestAnimationFrame = callback => {
		setTimeout(callback, 0);
	};

	const mockFilms = [
		{
			_id: '1',
			title: 'Test Film 1',
			images: { poster: 'https://example.com/poster1.jpg' },
			bechdelResults: { pass: true },
		},
		{
			_id: '2',
			title: 'Test Film 2',
			images: { poster: 'https://example.com/poster2.jpg' },
			bechdelResults: { pass: false },
		},
	];

	describe('rendering', () => {
		describe('with no films', () => {
			it('renders null when films array is empty', () => {
				const { container } = render(<FilmList films={[]} />);
				expect(container.firstChild).toBeNull();
			});
		});

		describe('with films', () => {
			it('renders film items', () => {
				const { container } = render(<FilmList films={mockFilms} />);
				expect(container.firstChild).toBeTruthy();
				expect(container.querySelector('.FilmList')).toBeInTheDocument();
			});
		});
	});
});
