import React from 'react';
import { render } from '@testing-library/react';
import NoMatch from './NoMatch';

describe('No Match Page', () => {
	describe('rendering', () => {
		it('match the snapshot', () => {
			const { container } = render(<NoMatch />);
			expect(container.firstChild).toMatchSnapshot();
		});
	});
});
