import React from 'react';
import {
	shallow,
	configure,
} from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import renderer from 'react-test-renderer';
import Footer from './Footer';

configure({ adapter: new Adapter() });

describe('Footer', () => {
	let wrapper;

	global.requestAnimationFrame = (callback) => {
		setTimeout(callback, 0);
	};

	beforeEach(() => {
		wrapper = shallow(<Footer />);
	});

	describe('rendering', () => {
		describe('initial state', () => {
			it('is rendered', () => {
				const component = renderer.create(<Footer />);
				const tree = component.toJSON();
				expect(tree).toMatchSnapshot();
			});

			it('is rendered correctly', () => {
				expect(wrapper).toHaveLength(1);
			});

			it('should be selectable by the class `footer`', () => {
				expect(wrapper.is('.footer')).toBe(true);
			});

			it('should mount in the full DOM', () => {
				expect(wrapper.find('.footer').length).toBe(1);
			});

			it('should have correct inital instance', () => {
				const initialInstance = wrapper.instance();
				const expectedInstance = null;
				expect(initialInstance).toBe(expectedInstance);
			});
		});
	});
});
