import React from 'react';
import { shallow, configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import renderer from 'react-test-renderer';
import { MemoryRouter } from 'react-router-dom';
import Home from './Home';

jest.mock('../../helper/api');

configure({ adapter: new Adapter() });

describe('Home', () => {
	let wrapper;
	let inst;

	global.requestAnimationFrame = callback => {
		setTimeout(callback, 0);
	};

	beforeEach(() => {
		wrapper = shallow(
			<MemoryRouter>
				<Home />
			</MemoryRouter>
		);
		inst = wrapper.instance();
	});

	describe('Home', () => {
		describe('initial state', () => {
			it('is rendered', () => {
				const component = renderer.create(
					<MemoryRouter>
						<Home />
					</MemoryRouter>
				);
				const tree = component.toJSON();
				expect(tree).toMatchSnapshot();
			});

			it('should not have any inital props', () => {
				const initialProps = inst.props;
				const expectedProps = {
					children: <Home />,
				};
				expect(initialProps).toMatchObject(expectedProps);
			});
			it('should not have any inital state', () => {
				const initialState = inst.state;
				const expectedState = {};
				expect(initialState).toMatchObject(expectedState);
			});
		});
	});
});
