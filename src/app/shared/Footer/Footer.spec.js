import React from 'react';
import { shallow, configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import renderer from 'react-test-renderer';
import { MemoryRouter } from 'react-router-dom';
import Footer from './Footer';

configure({ adapter: new Adapter() });

describe('Footer', () => {
	let wrapper;

	global.requestAnimationFrame = callback => {
		setTimeout(callback, 0);
	};

	beforeEach(() => {
		wrapper = shallow(
			<MemoryRouter>
				<Footer />
			</MemoryRouter>
		);
	});

	describe('rendering', () => {
		describe('initial state', () => {
			it('is rendered', () => {
				const component = renderer.create(
					<MemoryRouter>
						<Footer />
					</MemoryRouter>
				);
				const tree = component.toJSON();
				expect(tree).toMatchSnapshot();
			});

			it('is rendered correctly', () => {
				expect(wrapper).toHaveLength(1);
			});

			it('should have correct inital instance', () => {
				const initialState = wrapper
					.dive()
					.dive()
					.instance();
				const expectedIntialState = null;
				expect(initialState).toBe(expectedIntialState);
			});
		});
	});
});
