import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { render } from '@testing-library/react';
import Header from './Header';

describe('Header Page', () => {
	describe('rendering', () => {
		it('match the snapshot', () => {
			const { container } = render(
				<MemoryRouter>
					<Header />
				</MemoryRouter>
			);
			expect(container.firstChild).toMatchSnapshot();
		});
	});
});
