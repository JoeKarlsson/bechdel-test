import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import renderer from 'react-test-renderer';
import { shallow, configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import FilmsContainer from './FilmsContainer';

jest.mock('../../helper/api');

configure({ adapter: new Adapter() });

describe('FilmsContainer', () => {
	let wrapper;
	let inst;

	beforeEach(() => {
		wrapper = shallow(
			<MemoryRouter>
				<FilmsContainer />
			</MemoryRouter>
		);
		inst = wrapper.instance();
	});

	describe('rendering', () => {
		describe('initial state', () => {
			it('match the snapshot', () => {
				const component = renderer.create(
					<MemoryRouter>
						<FilmsContainer />
					</MemoryRouter>
				);
				const tree = component.toJSON();
				expect(tree).toMatchSnapshot();
			});
			it('is rendered correctly', () => {
				expect(wrapper).toHaveLength(1);
			});
			it('should not have any inital props', () => {
				const initialProps = inst.props;
				const expectedProps = {
					children: <FilmsContainer />,
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
