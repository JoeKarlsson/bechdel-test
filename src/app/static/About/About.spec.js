import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { render } from '@testing-library/react';
import About from './About';

describe('About Page', () => {
	describe('rendering', () => {
		it('match the snapshot', () => {
			const { container } = render(
				<MemoryRouter>
					<About />
				</MemoryRouter>
			);
			expect(container.firstChild).toMatchSnapshot();
		});
	});
});
