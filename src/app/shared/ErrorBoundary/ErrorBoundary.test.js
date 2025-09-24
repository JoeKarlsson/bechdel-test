import React from 'react';
import { render } from '@testing-library/react';
import renderer from 'react-test-renderer';
import ErrorBoundary from './ErrorBoundary';

// Mock console.error to avoid noise in test output
const originalError = console.error;
beforeAll(() => {
	console.error = jest.fn();
});

afterAll(() => {
	console.error = originalError;
});

describe('Error Boundary', () => {
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
				const { container } = render(
					<ErrorBoundary>
						When you buy a lottery ticket, you are investing in the dreams of the winner.
					</ErrorBoundary>
				);
				expect(container.firstChild).toBeTruthy();
			});

			it('should render to static HTML', () => {
				const { getByText } = render(
					<ErrorBoundary>
						When you buy a lottery ticket, you are investing in the dreams of the winner.
					</ErrorBoundary>
				);
				expect(getByText('When you buy a lottery ticket, you are investing in the dreams of the winner.')).toBeTruthy();
			});
		});
	});

	describe('error handling', () => {
		class BuggyComponent extends React.Component {
			componentDidMount() {
				throw new Error('I crashed!');
			}
			render() {
				return <h1>Buggy Component</h1>;
			}
		}

		it('should render error message when child component throws', () => {
			const { getByText } = render(
				<ErrorBoundary>
					<BuggyComponent />
				</ErrorBoundary>
			);
			
			// Error boundary should catch the error and render fallback UI
			expect(getByText('Something went wrong.')).toBeTruthy();
		});
	});
});
