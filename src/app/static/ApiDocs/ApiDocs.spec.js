import React from 'react';
import { render } from '../../test-utils';
import ApiDocs from './ApiDocs';

describe('Api Docs Page', () => {
	describe('rendering', () => {
		it('match the snapshot', () => {
			const { container } = render(<ApiDocs />);
			expect(container.firstChild).toMatchSnapshot();
		});
	});
});
