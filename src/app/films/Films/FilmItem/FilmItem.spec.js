import React from 'react';
import {
	MemoryRouter,
} from 'react-router-dom';
import {
	shallow,
	configure,
} from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import renderer from 'react-test-renderer';
import FilmItem from './FilmItem';

configure({ adapter: new Adapter() });

describe('FilmItem', () => {
	let wrapper;

	global.requestAnimationFrame = (callback) => {
		setTimeout(callback, 0);
	};

	beforeEach(() => {
		wrapper = shallow(
			<MemoryRouter>
				<FilmItem />
			</MemoryRouter>,
		);
	});

	describe('rendering', () => {
		describe('initial state', () => {
			it('is rendered', () => {
				const component = renderer.create(
					<MemoryRouter>
						<FilmItem />
					</MemoryRouter>,
				);
				const tree = component.toJSON();
				expect(tree).toMatchSnapshot();
			});

			it('is rendered correctly', () => {
				expect(wrapper).toHaveLength(1);
			});

			it('should have correct inital instance', () => {
				const initialState = wrapper.dive().dive().instance();
				const expectedIntialState = null;
				expect(initialState).toBe(expectedIntialState);
			});
		});
	});
});
