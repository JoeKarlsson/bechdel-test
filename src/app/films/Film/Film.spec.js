import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { render } from '@testing-library/react';
import renderer from 'react-test-renderer';
import { HelmetProvider } from 'react-helmet-async';
import Film from './Film';

jest.mock('../../helper/api');

// Mock recharts ResponsiveContainer which requires DOM measurements
jest.mock('recharts', () => {
	const OriginalModule = jest.requireActual('recharts');
	return {
		...OriginalModule,
		ResponsiveContainer: ({ children }) => <div style={{ width: 400, height: 300 }}>{children}</div>,
	};
});

const Wrapper = ({ children }) => (
	<HelmetProvider>
		<MemoryRouter>
			{children}
		</MemoryRouter>
	</HelmetProvider>
);

describe('Film', () => {
	const zeroState = {
		film: {
			title: '',
			images: {
				poster: '',
				backdrop: '',
			},
			plot: '',
			directors: [{ name: '' }],
			writers: [{ name: '' }],
			genres: [],
			rated: '',
			bechdelResults: {
				pass: false,
				bechdelScore: 0,
				numScenesPass: 0,
				scenesThatPass: [],
				numScenesDontPass: 0,
				numOfFemalesChars: 0,
				numOfMaleChars: 0,
				numOfFemalesCharsWithDialogue: 0,
				numOfMaleCharsWithDialogue: 0,
				totalLinesFemaleDialogue: 0,
				totalLinesMaleDialogue: 0,
			},
		},
		loading: true,
	};

	const filmData = {
		film: {
			title: 'Boyhood',
			images: {
				backdrop:
					'https://image.tmdb.org/t/p/w1000/aE1gbq6nw8zyVqvEBXMVMCqZpCs.jpg',
				poster:
					'https://image.tmdb.org/t/p/w300/eKi4e5zXhQKs0De4xu5AAMvu376.jpg',
			},
			plot:
				'The life of Mason, from early childhood to his arrival at college.',
			directors: [{ name: 'Richard Linklater' }, { name: 'John Doe' }],
			writers: [{ name: 'Richard Linklater' }, { name: 'John Doe' }],
			genres: ['Comedy', 'Drama'],
			rated: '97',
			bechdelResults: {
				pass: true,
				bechdelScore: 1,
				numScenesPass: 45,
				scenesThatPass: ['Scene1', 'Scene2', 'Scene3'],
				numScenesDontPass: 123,
				numOfFemalesChars: 23,
				numOfMaleChars: 54,
				numOfFemalesCharsWithDialogue: 12,
				numOfMaleCharsWithDialogue: 23,
				totalLinesFemaleDialogue: 1012,
				totalLinesMaleDialogue: 1202,
			},
		},
		loading: false,
	};

	const errorData = {
		film: {
			title: '',
		},
		loading: false,
	};

	describe('rendering', () => {
		describe('initial state', () => {
			it('should render zero state correctly', () => {
				const component = renderer.create(
					<Wrapper>
						<Film {...zeroState} />
					</Wrapper>
				);
				const tree = component.toJSON();
				expect(tree).toMatchSnapshot();
			});

			it('should render data state correctly', () => {
				const tree = renderer.create(
					<Wrapper>
						<Film {...filmData} />
					</Wrapper>
				).toJSON();
				expect(tree).toMatchSnapshot();
			});

			it('should render error state correctly', () => {
				const component = renderer.create(
					<Wrapper>
						<Film {...errorData} />
					</Wrapper>
				);
				const tree = component.toJSON();
				expect(tree).toMatchSnapshot();
			});

			it('is rendered correctly', () => {
				const { container } = render(
					<Wrapper>
						<Film {...zeroState} />
					</Wrapper>
				);
				expect(container.firstChild).toBeTruthy();
			});
		});
	});
});
