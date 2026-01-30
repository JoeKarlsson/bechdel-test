import React from 'react';
import { render } from '../../test-utils';
import About from './About';

describe('About Page', () => {
	describe('rendering', () => {
		it('match the snapshot', () => {
			const { container } = render(<About />);
			expect(container.firstChild).toMatchSnapshot();
		});
	});
});
