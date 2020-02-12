import React from 'react';
import { shallow, configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import renderer from 'react-test-renderer';
import FilmContainer from './FilmContainer';

jest.mock('../../helper/api');

configure({ adapter: new Adapter() });

describe('FilmContainer', () => {
	let wrapper;
	let inst;
	const router = {
		params: {
			id: 1234,
		},
	};

	beforeEach(() => {
		wrapper = shallow(<FilmContainer match={router} />);
		inst = wrapper.instance();
	});

	describe('rendering', () => {
		describe('initial state', () => {
			it('should render zero state correctly', () => {
				const component = renderer.create(<FilmContainer match={router} />);
				const tree = component.toJSON();
				expect(tree).toMatchSnapshot();
			});
			it('is rendered correctly', () => {
				expect(wrapper).toHaveLength(1);
			});
			it('should not have any inital props', () => {
				const initialProps = inst.props;
				const expectedProps = {
					match: {
						params: {
							id: 1234,
						},
					},
				};
				expect(initialProps).toMatchObject(expectedProps);
			});
			it('should not have any inital state', () => {
				const initialState = inst.state;
				const expectedState = {
					film: {
						title: '',
						images: {
							poster: '',
							backdrop: '',
						},
						plot: '',
						directors: [],
						writers: [],
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
				};
				expect(initialState).toMatchObject(expectedState);
			});
		});
	});
});
