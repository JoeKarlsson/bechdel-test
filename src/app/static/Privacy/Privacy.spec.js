import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import Privacy from './Privacy';

describe('Privacy Page', () => {
	describe('rendering', () => {
		it('match the snapshot', () => {
			const { container } = render(
				<HelmetProvider>
					<MemoryRouter>
						<Privacy />
					</MemoryRouter>
				</HelmetProvider>
			);
			expect(container.firstChild).toMatchSnapshot();
		});
	});
});
