import React from 'react';
import { shallow, configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import renderer from 'react-test-renderer';
import NewFilm from './NewFilm';

jest.mock('./Uploader/Uploader');

// jest.mock('uppy');
// jest.mock('uppy/lib');
// jest.mock('uppy/lib/core');
// jest.mock('uppy/lib/core/Core.js');
// jest.mock('uppy/lib/plugins/XHRUpload');
// jest.mock('uppy/lib/react');
// jest.mock('uppy/lib/react/DragDrop');

global.window = {
	navigator: {
		onLine: true,
	},
};

configure({ adapter: new Adapter() });

describe('NewFilm', () => {
	let wrapper;

	beforeEach(() => {
		wrapper = shallow(<NewFilm />);
	});

	describe('rendering', () => {
		describe('initial state', () => {
			it('is rendered', () => {
				const component = renderer.create(<NewFilm />);
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
