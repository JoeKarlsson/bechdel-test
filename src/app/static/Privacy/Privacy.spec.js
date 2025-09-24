import React from 'react';
import { render } from '@testing-library/react';
import Privacy from './Privacy';

describe('Privacy Page', () => {
	describe('rendering', () => {
		it('match the snapshot', () => {
			const { container } = render(<Privacy />);
			expect(container.firstChild).toMatchSnapshot();
		});
	});
});
