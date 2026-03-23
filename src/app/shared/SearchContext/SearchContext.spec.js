import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { SearchProvider, useSearch } from './SearchContext';

describe('SearchContext', () => {
	it('should provide search context', () => {
		const TestComponent = () => {
			const { searchQuery } = useSearch();
			return <div>{searchQuery || 'No query'}</div>;
		};

		const { getByText } = render(
			<MemoryRouter>
				<SearchProvider>
					<TestComponent />
				</SearchProvider>
			</MemoryRouter>
		);

		expect(getByText('No query')).toBeInTheDocument();
	});
});
