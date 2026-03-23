import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { render } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import Home from './Home';

// Mock fetch for useEffect calls
global.fetch = jest.fn(() =>
	Promise.resolve({
		ok: true,
		json: () => Promise.resolve({ films: [] }),
	})
);

describe('Home Page', () => {
	beforeEach(() => {
		fetch.mockClear();
	});

	describe('rendering', () => {
		it('match the snapshot', () => {
			const { container } = render(
				<HelmetProvider>
					<MemoryRouter>
						<Home />
					</MemoryRouter>
				</HelmetProvider>
			);
			expect(container.firstChild).toMatchSnapshot();
		});
	});
});
