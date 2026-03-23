import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import renderer from 'react-test-renderer';
import FilmList from './FilmList';

describe('FilmList', () => {
	global.requestAnimationFrame = callback => {
		setTimeout(callback, 0);
	};

	describe('rendering', () => {
		describe('initial state', () => {
			it('is rendered', () => {
				const component = renderer.create(
					<MemoryRouter>
						<FilmList />
					</MemoryRouter>
				);
				const tree = component.toJSON();
				expect(tree).toMatchSnapshot();
			});

			it('returns null when no films provided', () => {
				const { container } = render(
					<MemoryRouter>
						<FilmList />
					</MemoryRouter>
				);
				// FilmList returns null when films array is empty
				expect(container.firstChild).toBeNull();
			});

			it('renders films when provided', () => {
				const mockFilms = [
					{ _id: '1', title: 'Test Film', images: { poster: 'test.jpg' }, bechdelResults: { pass: true } }
				];
				const { container } = render(
					<MemoryRouter>
						<FilmList films={mockFilms} />
					</MemoryRouter>
				);
				expect(container.firstChild).toBeTruthy();
			});
		});
	});
});
