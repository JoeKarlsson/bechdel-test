import React from 'react';
import { render } from '@testing-library/react';
import Error from './Error';

describe('Error Page', () => {
	describe('rendering', () => {
		it('match the snapshot', () => {
			const { container } = render(<Error />);
			expect(container.firstChild).toMatchSnapshot();
		});
	});
});
