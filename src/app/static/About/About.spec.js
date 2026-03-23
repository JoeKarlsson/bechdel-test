import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { render } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import About from './About';

describe('About Page', () => {
	describe('rendering', () => {
		it('match the snapshot', () => {
			const { container } = render(
				<HelmetProvider>
					<MemoryRouter>
						<About />
					</MemoryRouter>
				</HelmetProvider>
			);
			expect(container.firstChild).toMatchSnapshot();
		});
	});
});
