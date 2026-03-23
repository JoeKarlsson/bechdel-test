import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { render } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import Hero from './Hero';

describe('Hero Page', () => {
	describe('rendering', () => {
		it('match the snapshot', () => {
			const { container } = render(
				<HelmetProvider>
					<MemoryRouter>
						<Hero />
					</MemoryRouter>
				</HelmetProvider>
			);
			expect(container.firstChild).toMatchSnapshot();
		});
	});
});
