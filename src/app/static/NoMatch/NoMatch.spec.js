import React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import NoMatch from './NoMatch';

// Mock fetch for the useEffect
global.fetch = jest.fn(() =>
	Promise.resolve({
		ok: true,
		json: () => Promise.resolve({ films: [] }),
	})
);

describe('No Match Page', () => {
	beforeEach(() => {
		fetch.mockClear();
	});

	describe('rendering', () => {
		it('match the snapshot', () => {
			const { container } = render(
				<BrowserRouter>
					<NoMatch />
				</BrowserRouter>
			);
			expect(container.firstChild).toMatchSnapshot();
		});
	});
});
