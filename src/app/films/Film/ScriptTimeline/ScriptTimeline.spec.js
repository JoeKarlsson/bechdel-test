import React from 'react';
import { render } from '@testing-library/react';
import ScriptTimeline from './ScriptTimeline';

describe('ScriptTimeline', () => {
	const mockBechdelResults = {
		scenesThatPass: [
			'INT. KITCHEN - DAY\n\nMARY\nHello there.\n\nJANE\nHi Mary!',
			'EXT. PARK - AFTERNOON\n\nSUSAN\nNice weather today.\n\nLISA\nIndeed it is.',
		],
	};

	const mockCharacters = [
		{ cleanCharName: 'MARY', gender: 1 },
		{ cleanCharName: 'JANE', gender: 1 },
	];

	it('should render without crashing', () => {
		const { container } = render(
			<ScriptTimeline
				bechdelResults={mockBechdelResults}
				characters={mockCharacters}
			/>
		);
		expect(container).toBeInTheDocument();
	});

	it('should render with empty scenes', () => {
		const { container } = render(
			<ScriptTimeline
				bechdelResults={{ scenesThatPass: [] }}
				characters={[]}
			/>
		);
		expect(container).toBeInTheDocument();
	});
});
