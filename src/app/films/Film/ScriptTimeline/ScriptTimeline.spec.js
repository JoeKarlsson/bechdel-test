import React from 'react';
import { render } from '@testing-library/react';
import ScriptTimeline from './ScriptTimeline';

describe('ScriptTimeline', () => {
	const mockBechdelResults = {
		scenesThatPass: [
			'INT. COFFEE SHOP - DAY\nALICE: Hello there!\nBOB: Hi Alice!',
			'EXT. PARK - AFTERNOON\nALICE: Beautiful weather today.\nCAROL: Indeed it is.',
		],
		numScenesPass: 2,
		numScenesDontPass: 5,
	};

	const mockCharacters = [
		{ cleanCharName: 'ALICE', gender: 1 },
		{ cleanCharName: 'CAROL', gender: 1 },
		{ cleanCharName: 'BOB', gender: 0 },
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
				bechdelResults={{ scenesThatPass: [], numScenesPass: 0, numScenesDontPass: 0 }}
				characters={[]}
			/>
		);
		expect(container).toBeInTheDocument();
	});
});
