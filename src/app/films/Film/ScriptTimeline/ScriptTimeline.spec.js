import React from 'react';
import { render } from '@testing-library/react';
import ScriptTimeline from './ScriptTimeline';

describe('ScriptTimeline', () => {
	const mockBechdelResults = {
		scenesThatPass: [
			{ sceneNumber: 1, dialogue: 'Test dialogue 1' },
			{ sceneNumber: 2, dialogue: 'Test dialogue 2' },
		],
	};

	const mockCharacters = [
		{ cleanCharName: 'CHARACTER1', gender: 1 },
		{ cleanCharName: 'CHARACTER2', gender: 1 },
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
