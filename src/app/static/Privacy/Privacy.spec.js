import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Privacy from './Privacy';

describe('Privacy Page', () => {
	describe('rendering', () => {
		it('match the snapshot', () => {
			const { container } = render(
				<MemoryRouter>
					<Privacy />
				</MemoryRouter>
			);
			expect(container.firstChild).toMatchSnapshot();
		});
	});
});
