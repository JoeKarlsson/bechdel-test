import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { shallow, configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import renderer from 'react-test-renderer';
import PrimaryLayout from './PrimaryLayout';

jest.mock('../../films/NewFilm/Uploader/Uploader');
jest.mock('../../helper/api');

configure({ adapter: new Adapter() });

jest.mock('../../films/NewFilm/Uploader/Uploader');

describe('PrimaryLayout Page', () => {
	let wrapper;
	let inst;

	beforeEach(() => {
		wrapper = shallow(
			<MemoryRouter>
				<PrimaryLayout />
			</MemoryRouter>
		);
		inst = wrapper.instance();
	});

	describe('rendering', () => {
		describe('initial state', () => {
			it('should match the snapshot', () => {
				const component = renderer.create(
					<MemoryRouter>
						<PrimaryLayout />
					</MemoryRouter>
				);
				const tree = component.toJSON();
				expect(tree).toMatchSnapshot();
			});

			it('is rendered correctly', () => {
				expect(wrapper).toHaveLength(1);
			});

			it('should render without throwing an error', () => {
				expect(wrapper.text()).toEqual('<Router />');
			});

			it('should be selectable by the class `PrimaryLayout`', () => {
				expect(
					wrapper
						.dive()
						.dive()
						.is('.PrimaryLayout')
				).toBe(true);
			});

			it('should mount in the full DOM', () => {
				expect(
					wrapper
						.dive()
						.dive()
						.find('.PrimaryLayout').length
				).toBe(1);
			});

			it('should render to static HTML', () => {
				expect(
					wrapper
						.dive()
						.dive()
						.text()
				).toContain('<Header /><ErrorBoundary /><Footer />');
			});

			it('should have correct inital state', () => {
				const initialState = inst.state;
				const expectedIntialState = {};
				expect(initialState).toMatchObject(expectedIntialState);
			});

			it('should not have any inital props', () => {
				const initialProps = inst.props;
				const expectedProps = {
					children: <PrimaryLayout />,
				};
				expect(initialProps).toEqual(expectedProps);
			});
		});
	});
});
