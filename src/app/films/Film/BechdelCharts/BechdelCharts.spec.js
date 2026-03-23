import React from 'react';
import { render } from '@testing-library/react';
import BechdelCharts from './BechdelCharts';

describe('BechdelCharts', () => {
	const mockBechdelResults = {
		pass: true,
		bechdelScore: 3,
		numScenesPass: 5,
		numScenesDontPass: 10,
		numOfFemalesChars: 4,
		numOfMaleChars: 6,
		numOfFemalesCharsWithDialogue: 3,
		numOfMaleCharsWithDialogue: 5,
		totalLinesFemaleDialogue: 100,
		totalLinesMaleDialogue: 200,
	};

	it('should render without crashing', () => {
		const { container } = render(
			<BechdelCharts bechdelResults={mockBechdelResults} />
		);
		expect(container).toBeInTheDocument();
	});
});
