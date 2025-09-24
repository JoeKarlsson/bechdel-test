import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { render } from '@testing-library/react';
import Hero from './Hero';

describe('Hero', () => {
	const title = 'Boyhood';
	const bechdelResults = {
		pass: true,
		bechdelScore: 3,
	};
	const images = {};

	describe('rendering', () => {
		describe('initial state', () => {
			it('match the snapshot', () => {
				const { container } = render(
					<MemoryRouter>
						<Hero title={title} bechdelResults={bechdelResults} images={images} />
					</MemoryRouter>
				);
				expect(container.firstChild).toMatchSnapshot();
			});
			it('is rendered correctly', () => {
				const { container } = render(
					<MemoryRouter>
						<Hero title={title} bechdelResults={bechdelResults} images={images} />
					</MemoryRouter>
				);
				expect(container.firstChild).toBeTruthy();
			});
		});
	});
});
