import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { render } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import Hero from './Hero';

const renderWithProviders = (ui) => render(
	<HelmetProvider>
		<MemoryRouter>
			{ui}
		</MemoryRouter>
	</HelmetProvider>
);

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
				const { container } = renderWithProviders(
					<Hero title={title} bechdelResults={bechdelResults} images={images} />
				);
				expect(container.firstChild).toMatchSnapshot();
			});
			it('is rendered correctly', () => {
				const { container } = renderWithProviders(
					<Hero title={title} bechdelResults={bechdelResults} images={images} />
				);
				expect(container.firstChild).toBeTruthy();
			});
		});
	});
});
