/*
	eslint-disable class-methods-use-this
*/

import React from 'react';
import { shallow, configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import renderer from 'react-test-renderer';
import Uploader from './Uploader';

jest.mock('uppy/lib/core', () => {
	class UppyClass {
		use() {
			return jest.fn();
		}
		on() {
			return jest.fn();
		}
		run() {
			return jest.fn();
		}
	}

	const Uppy = () => {
		return new UppyClass();
	};

	return Uppy;
});
jest.mock('uppy/lib/plugins/XHRUpload');
jest.mock('uppy/lib/react/DragDrop', () => {
	const DragDrop = () => <div>Drag and Drop</div>;
	return DragDrop;
});

configure({ adapter: new Adapter() });

describe('Uploader', () => {
	let wrapper;

	global.requestAnimationFrame = callback => {
		setTimeout(callback, 0);
	};

	beforeEach(() => {
		wrapper = shallow(<Uploader />);
	});

	describe('rendering', () => {
		describe('initial state', () => {
			it('is rendered', () => {
				const component = renderer.create(<Uploader />);
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
