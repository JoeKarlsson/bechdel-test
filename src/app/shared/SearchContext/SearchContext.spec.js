import React from 'react';
import { render } from '@testing-library/react';
import { SearchProvider, useSearch } from './SearchContext';

describe('SearchContext', () => {
	it('should provide search context', () => {
		const TestComponent = () => {
			const { searchQuery } = useSearch();
			return <div>{searchQuery || 'No query'}</div>;
		};

		const { getByText } = render(
			<SearchProvider>
				<TestComponent />
			</SearchProvider>
		);

		expect(getByText('No query')).toBeInTheDocument();
	});
});
