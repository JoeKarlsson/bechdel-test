import React from 'react';
import {
	shallow,
	configure,
} from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import renderer from 'react-test-renderer';
import NoMatch from './NoMatch';

configure({ adapter: new Adapter() });

describe('NoMatch', () => {
	let wrapper;

	global.requestAnimationFrame = (callback) => {
		setTimeout(callback, 0);
	};

	beforeEach(() => {
		wrapper = shallow(<NoMatch />);
	});

	describe('rendering', () => {
		describe('initial state', () => {
			it('is rendered', () => {
				const component = renderer.create(<NoMatch />);
				const tree = component.toJSON();
				expect(tree).toMatchSnapshot();
			});

			it('is rendered correctly', () => {
				expect(wrapper).toHaveLength(1);
			});

			it('should have correct inital instance', () => {
				const initialInstance = wrapper.instance();
				const expectedInstance = null;
				expect(initialInstance).toBe(expectedInstance);
			});
		});
	});
});
