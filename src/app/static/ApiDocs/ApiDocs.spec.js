import React from 'react';
import { shallow, configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import renderer from 'react-test-renderer';
import ApiDocs from './ApiDocs';

configure({ adapter: new Adapter() });

describe('ApiDocs', () => {
	let wrapper;

	global.requestAnimationFrame = callback => {
		setTimeout(callback, 0);
	};

	beforeEach(() => {
		wrapper = shallow(<ApiDocs />);
	});

	describe('rendering', () => {
		describe('initial state', () => {
			it('is rendered', () => {
				const component = renderer.create(<ApiDocs />);
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
