import React from 'react';
import {
	shallow,
	configure,
} from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import renderer from 'react-test-renderer';
import ErrorBoundary from './ErrorBoundary';

configure({ adapter: new Adapter() });

describe('Error Boundary', () => {
	let wrapper;
	let inst;

	beforeEach(() => {
		wrapper = shallow(
			<ErrorBoundary>
				When you buy a lottery ticket, you are investing in the dreams of the winner.
			</ErrorBoundary>,
		);
		inst = wrapper.instance();
	});

	describe('rendering', () => {
		describe('initial state', () => {
			it('should match the snapshot', () => {
				const component = renderer.create(
					<ErrorBoundary>
						When you buy a lottery ticket, you are investing in the dreams of the winner.
					</ErrorBoundary>,
				);
				const tree = component.toJSON();
				expect(tree).toMatchSnapshot();
			});

			it('is rendered correctly', () => {
				expect(wrapper).toHaveLength(1);
			});

			it('should render to static HTML', () => {
				expect(wrapper.text()).toContain('When you buy a lottery ticket, you are investing in the dreams of the winner.');
			});

			it('should have correct inital state', () => {
				const initialState = inst.state;
				const expectedIntialState = {
					hasError: false,
				};
				expect(initialState).toMatchObject(expectedIntialState);
			});

			it('should not have any inital props', () => {
				const initialProps = inst.props;
				const expectedProps = {
					children: 'When you buy a lottery ticket, you are investing in the dreams of the winner.',
				};
				expect(initialProps).toMatchObject(expectedProps);
			});
		});
	});

	describe('callbacks', () => {

		class BuggyComponent extends React.Component {
			componentDidMount() {
				throw new Error('I crashed!');
			}
			render() {
				return <h1>Buggy Component</h1>;
			}
		}

		it('should only render error message when `hasError` is true', () => {

			wrapper = shallow(
				<ErrorBoundary>
					<BuggyComponent />
				</ErrorBoundary>,
			);

			wrapper
				.instance()
				.componentDidCatch({ toString: () => 'error' }, { componentStack: { toString: () => 'info' } });

			wrapper.update();
			expect(wrapper.text()).toBe('Something went wrong.error');
		});

	});
});
