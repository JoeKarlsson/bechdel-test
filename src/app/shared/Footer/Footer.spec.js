import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { render } from '@testing-library/react';
import Footer from './Footer';

describe('Footer Page', () => {
	describe('rendering', () => {
		it('match the snapshot', () => {
			const { container } = render(
				<MemoryRouter>
					<Footer />
				</MemoryRouter>
			);
			expect(container.firstChild).toMatchSnapshot();
		});
	});
});
