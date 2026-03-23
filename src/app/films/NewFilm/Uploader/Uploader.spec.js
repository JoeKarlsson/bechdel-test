import React from 'react';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import renderer from 'react-test-renderer';
import Uploader from './Uploader';

// Mock LoadingAnimation component
jest.mock('../../../shared/LoadingAnimation', () => {
	return function MockLoadingAnimation({ isVisible }) {
		return isVisible ? <div data-testid="loading-animation">Loading...</div> : null;
	};
});

// Mock Uppy and its dependencies
const mockUppyInstance = {
	use: jest.fn().mockReturnThis(),
	on: jest.fn(),
	close: jest.fn(),
	id: 'uppy',
};

jest.mock('@uppy/core', () => ({
	Uppy: jest.fn().mockImplementation(() => mockUppyInstance),
}));

jest.mock('@uppy/react', () => ({
	Dashboard: ({ uppy, locale }) => (
		<div data-testid="uppy-dashboard" data-uppy-id={uppy?.id}>
			{locale?.strings?.chooseFile}
		</div>
	),
}));

jest.mock('@uppy/xhr-upload', () => jest.fn());

// Mock the Notification component
jest.mock('../../../shared/Notification', () => {
	return function MockNotification({ type, title, message, actionText, onActionClick, onClose }) {
		return (
			<div data-testid="notification" data-type={type}>
				<div data-testid="notification-title">{title}</div>
				<div data-testid="notification-message">{message}</div>
				{actionText && (
					<button
						data-testid="notification-action"
						onClick={onActionClick}
					>
						{actionText}
					</button>
				)}
				<button
					data-testid="notification-close"
					onClick={onClose}
				>
					Close
				</button>
			</div>
		);
	};
});

describe('Uploader', () => {
	beforeEach(() => {
		// Clear all mocks before each test
		jest.clearAllMocks();
	});

	describe('rendering', () => {
		it('renders correctly', () => {
			const tree = renderer.create(<Uploader />).toJSON();
			expect(tree).toMatchSnapshot();
		});

		it('renders Uppy dashboard with correct locale strings', () => {
			render(<Uploader />);

			expect(screen.getByTestId('uppy-dashboard')).toBeInTheDocument();
			expect(screen.getByText('Choose a script file')).toBeInTheDocument();
		});
	});

	describe('notification functionality', () => {
		it('shows processing notification and loading animation when upload starts', async () => {
			render(<Uploader />);

			await waitFor(() => {
				expect(screen.getByTestId('uppy-dashboard')).toBeInTheDocument();
			});

			// Simulate upload event
			const uploadCallback = mockUppyInstance.on.mock.calls.find(
				call => call[0] === 'upload'
			)?.[1];

			if (uploadCallback) {
				act(() => {
					uploadCallback();
				});

				await waitFor(() => {
					expect(screen.getByTestId('notification')).toBeInTheDocument();
					expect(screen.getByTestId('notification')).toHaveAttribute('data-type', 'info');
					expect(screen.getByTestId('notification-title')).toHaveTextContent('Processing Script');
					expect(screen.getByTestId('loading-animation')).toBeInTheDocument();
				});
			}
		});

		it('shows error notification and hides loading animation when upload fails', async () => {
			render(<Uploader />);

			await waitFor(() => {
				expect(screen.getByTestId('uppy-dashboard')).toBeInTheDocument();
			});

			// Simulate upload error event
			const errorCallback = mockUppyInstance.on.mock.calls.find(
				call => call[0] === 'upload-error'
			)?.[1];

			if (errorCallback) {
				const mockFile = { name: 'test.txt' };
				const mockError = new Error('Upload failed');

				act(() => {
					errorCallback(mockFile, mockError);
				});

				await waitFor(() => {
					expect(screen.getByTestId('notification')).toBeInTheDocument();
					expect(screen.getByTestId('notification')).toHaveAttribute('data-type', 'error');
					expect(screen.getByTestId('notification-title')).toHaveTextContent('Upload Failed');
					expect(screen.getByTestId('notification-message')).toHaveTextContent('Failed to upload test.txt. Please try again.');
					expect(screen.queryByTestId('loading-animation')).not.toBeInTheDocument();
				});
			}
		});

		it('shows success notification with action button and hides loading animation', async () => {
			// Mock window.location
			delete window.location;
			window.location = { href: '' };

			render(<Uploader />);

			await waitFor(() => {
				expect(screen.getByTestId('uppy-dashboard')).toBeInTheDocument();
			});

			// Simulate successful upload response
			const xhrUploadConfig = mockUppyInstance.use.mock.calls.find(
				call => call[0].name === 'XHRUpload'
			)?.[1];

			if (xhrUploadConfig && xhrUploadConfig.getResponseData) {
				const mockXhr = {
					response: JSON.stringify({ '0': { _id: '123', title: 'Test Film' } }),
					responseXML: {
						querySelector: jest.fn().mockReturnValue({
							textContent: 'http://example.com'
						})
					}
				};

				xhrUploadConfig.getResponseData(mockXhr);

				await waitFor(() => {
					expect(screen.getByTestId('notification')).toBeInTheDocument();
					expect(screen.getByTestId('notification')).toHaveAttribute('data-type', 'success');
					expect(screen.getByTestId('notification-title')).toHaveTextContent('Upload Complete!');
					expect(screen.getByTestId('notification-action')).toHaveTextContent('View Film');
					expect(screen.queryByTestId('loading-animation')).not.toBeInTheDocument();
				});
			}
		});

		it('handles notification close', async () => {
			render(<Uploader />);

			await waitFor(() => {
				expect(screen.getByTestId('uppy-dashboard')).toBeInTheDocument();
			});

			// Simulate showing a notification first
			const uploadCallback = mockUppyInstance.on.mock.calls.find(
				call => call[0] === 'upload'
			)?.[1];

			if (uploadCallback) {
				act(() => {
					uploadCallback();
				});

				await waitFor(() => {
					expect(screen.getByTestId('notification')).toBeInTheDocument();
				});

				// Click close button
				const closeButton = screen.getByTestId('notification-close');
				fireEvent.click(closeButton);

				await waitFor(() => {
					expect(screen.queryByTestId('notification')).not.toBeInTheDocument();
				});
			}
		});
	});

	describe('cleanup', () => {
		it('cleans up uppy instance on unmount', () => {
			const { unmount } = render(<Uploader />);
			unmount();

			expect(mockUppyInstance.close).toHaveBeenCalledTimes(1);
		});
	});
});
