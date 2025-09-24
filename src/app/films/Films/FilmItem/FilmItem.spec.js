import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { render } from '@testing-library/react';
import FilmItem from './FilmItem';

describe('FilmItem', () => {
	global.requestAnimationFrame = callback => {
		setTimeout(callback, 0);
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
	});
});
