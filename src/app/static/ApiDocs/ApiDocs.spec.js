import React from 'react';
import { render } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import ApiDocs from './ApiDocs';

describe('Api Docs Page', () => {
	describe('rendering', () => {
		it('match the snapshot', () => {
			const { container } = render(
				<HelmetProvider>
					<ApiDocs />
				</HelmetProvider>
			);
			expect(container.firstChild).toMatchSnapshot();
		});
	});
});
