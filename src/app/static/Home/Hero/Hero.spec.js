import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { render } from '@testing-library/react';
import Hero from './Hero';

describe('Hero Page', () => {
	describe('rendering', () => {
		it('match the snapshot', () => {
			const { container } = render(
				<MemoryRouter>
					<Hero />
				</MemoryRouter>
			);
			expect(container.firstChild).toMatchSnapshot();
		});
	});
});
