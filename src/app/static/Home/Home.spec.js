import React from 'react';
import { render } from '../../test-utils';
import Home from './Home';

describe('Home Page', () => {
	describe('rendering', () => {
		it('match the snapshot', () => {
			const { container } = render(<Home />);
			expect(container.firstChild).toMatchSnapshot();
		});
	});
});
