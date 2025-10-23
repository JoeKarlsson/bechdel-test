import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import renderer from 'react-test-renderer';
import LoadingAnimation from './LoadingAnimation';

describe('LoadingAnimation', () => {
	beforeEach(() => {
		jest.useFakeTimers();
	});

	afterEach(() => {
		jest.useRealTimers();
	});

	describe('rendering', () => {
		it('renders correctly when visible', () => {
			const tree = renderer.create(<LoadingAnimation isVisible />).toJSON();
			expect(tree).toMatchSnapshot();
		});

		it('renders correctly when not visible', () => {
			const tree = renderer.create(<LoadingAnimation isVisible={false} />).toJSON();
			expect(tree).toMatchSnapshot();
		});

		it('renders with default props', () => {
			const tree = renderer.create(<LoadingAnimation />).toJSON();
			expect(tree).toMatchSnapshot();
		});

		it('shows loading animation when visible', () => {
			render(<LoadingAnimation isVisible />);

			expect(screen.getByTestId('loading-animation')).toBeInTheDocument();
			expect(screen.getByText(/Analyzing Script/)).toBeInTheDocument();
		});

		it('does not show loading animation when not visible', () => {
			render(<LoadingAnimation isVisible={false} />);

			expect(screen.queryByTestId('loading-animation')).not.toBeInTheDocument();
		});
	});

	describe('joke rotation', () => {
		it('rotates through different jokes', async () => {
			render(<LoadingAnimation isVisible />);

			// Initial joke should be about analyzing script
			expect(screen.getByText(/Analyzing Script/)).toBeInTheDocument();

			// Fast-forward time to trigger joke rotation
			act(() => {
				jest.advanceTimersByTime(3000);
			});

			await waitFor(() => {
				expect(screen.getByText(/Processing Dialogue/)).toBeInTheDocument();
			});
		});

		it('cycles back to first joke after all jokes', async () => {
			render(<LoadingAnimation isVisible />);

			// Fast-forward through all jokes (7 jokes * 3 seconds = 21 seconds)
			act(() => {
				jest.advanceTimersByTime(21000);
			});

			await waitFor(() => {
				expect(screen.getByText(/Analyzing Script/)).toBeInTheDocument();
			});
		});
	});

	describe('dots animation', () => {
		it('animates dots correctly', async () => {
			render(<LoadingAnimation isVisible />);

			// Initial state should have no dots
			expect(screen.getByText(/Counting female characters who actually talk to each other/)).toBeInTheDocument();

			// Fast-forward to see dots appear
			act(() => {
				jest.advanceTimersByTime(500);
			});

			await waitFor(() => {
				expect(screen.getByText(/Counting female characters who actually talk to each other\./)).toBeInTheDocument();
			});
		});
	});

	describe('accessibility', () => {
		it('has proper ARIA attributes', () => {
			render(<LoadingAnimation isVisible />);

			const loadingElement = screen.getByTestId('loading-animation');
			expect(loadingElement).toBeInTheDocument();
		});
	});
});
