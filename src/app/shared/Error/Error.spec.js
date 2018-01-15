import React from 'react';
import { shallow, configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import renderer from 'react-test-renderer';
import Error from './Error';

configure({ adapter: new Adapter() });

describe('Error', () => {
	let wrapper;

	global.requestAnimationFrame = callback => {
		setTimeout(callback, 0);
	};

	beforeEach(() => {
		wrapper = shallow(<Error />);
	});

	describe('rendering', () => {
		describe('initial state', () => {
			it('is rendered', () => {
				const component = renderer.create(<Error />);
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
