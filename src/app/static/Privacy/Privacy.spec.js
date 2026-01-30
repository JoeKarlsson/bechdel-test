import React from 'react';
import { render } from '../../test-utils';
import Privacy from './Privacy';

describe('Privacy Page', () => {
	describe('rendering', () => {
		it('match the snapshot', () => {
			const { container } = render(<Privacy />);
			expect(container.firstChild).toMatchSnapshot();
		});
	});
});
