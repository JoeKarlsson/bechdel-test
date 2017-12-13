import React from 'react';
import {
	shallow,
	configure,
} from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import renderer from 'react-test-renderer';
import FilmList from './FilmList';

configure({ adapter: new Adapter() });

describe('FilmList', () => {
	let wrapper;

	global.requestAnimationFrame = (callback) => {
		setTimeout(callback, 0);
	};

	beforeEach(() => {
		wrapper = shallow(<FilmList />);
	});

	describe('rendering', () => {
		describe('initial state', () => {
			it('is rendered', () => {
				const component = renderer.create(<FilmList />);
				const tree = component.toJSON();
				expect(tree).toMatchSnapshot();
			});

			it('is rendered correctly', () => {
				expect(wrapper).toHaveLength(1);
			});

			it('should be selectable by the class `FilmList`', () => {
				expect(wrapper.is('.FilmList')).toBe(true);
			});

			it('should mount in the full DOM', () => {
				expect(wrapper.find('.FilmList').length).toBe(1);
			});

			it('should have correct inital instance', () => {
				const initialInstance = wrapper.instance();
				const expectedInstance = null;
				expect(initialInstance).toBe(expectedInstance);
			});
		});
	});
});
