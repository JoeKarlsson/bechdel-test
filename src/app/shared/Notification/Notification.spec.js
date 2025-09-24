import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import renderer from 'react-test-renderer';
import Notification from './Notification';

describe('Notification', () => {
    describe('rendering', () => {
        it('renders correctly with default props', () => {
            const tree = renderer
                .create(<Notification message="Test message" />)
                .toJSON();
            expect(tree).toMatchSnapshot();
        });

        it('renders correctly with all props', () => {
            const mockActionClick = jest.fn();
            const mockClose = jest.fn();

            const tree = renderer
                .create(
                    <Notification
                        type="success"
                        message="Test message"
                        title="Test title"
                        duration={5000}
                        onClose={mockClose}
                        show={true}
                        actionText="Action"
                        onActionClick={mockActionClick}
                        persistent={false}
                    />
                )
                .toJSON();
            expect(tree).toMatchSnapshot();
        });

        it('renders different notification types', () => {
            const types = ['success', 'error', 'warning', 'info'];

            types.forEach(type => {
                const { container } = render(
                    <Notification
                        type={type}
                        message={`${type} message`}
                    />
                );
                expect(container.firstChild).toHaveClass(`notification--${type}`);
            });
        });

        it('does not render when show is false', () => {
            const { container } = render(
                <Notification message="Test message" show={false} />
            );
            expect(container.firstChild).toBeNull();
        });
    });

    describe('functionality', () => {
        it('calls onClose when close button is clicked', async () => {
            const mockClose = jest.fn();
            render(
                <Notification
                    message="Test message"
                    onClose={mockClose}
                />
            );

            const closeButton = screen.getByLabelText('Close notification');
            fireEvent.click(closeButton);

            await waitFor(() => {
                expect(mockClose).toHaveBeenCalledTimes(1);
            });
        });

        it('calls onActionClick when action button is clicked', () => {
            const mockActionClick = jest.fn();
            render(
                <Notification
                    message="Test message"
                    actionText="Action"
                    onActionClick={mockActionClick}
                />
            );

            const actionButton = screen.getByText('Action');
            fireEvent.click(actionButton);

            expect(mockActionClick).toHaveBeenCalledTimes(1);
        });

        it('auto-dismisses after duration when not persistent', async () => {
            const mockClose = jest.fn();
            render(
                <Notification
                    message="Test message"
                    duration={100}
                    onClose={mockClose}
                />
            );

            await waitFor(() => {
                expect(mockClose).toHaveBeenCalledTimes(1);
            }, { timeout: 500 });
        });

        it('does not auto-dismiss when persistent', async () => {
            const mockClose = jest.fn();
            render(
                <Notification
                    message="Test message"
                    duration={100}
                    persistent={true}
                    onClose={mockClose}
                />
            );

            // Wait longer than duration
            await new Promise(resolve => setTimeout(resolve, 200));

            expect(mockClose).not.toHaveBeenCalled();
        });

        it('does not show close button when persistent', () => {
            render(
                <Notification
                    message="Test message"
                    persistent={true}
                />
            );

            const closeButton = screen.queryByLabelText('Close notification');
            expect(closeButton).toBeNull();
        });

        it('shows correct icons for different types', () => {
            const typeIconMap = {
                success: '✅',
                error: '❌',
                warning: '⚠️',
                info: 'ℹ️'
            };

            Object.entries(typeIconMap).forEach(([type, icon]) => {
                const { container } = render(
                    <Notification
                        type={type}
                        message={`${type} message`}
                    />
                );
                expect(container.querySelector('.notification__icon')).toHaveTextContent(icon);
            });
        });

        it('displays title and message correctly', () => {
            render(
                <Notification
                    title="Test Title"
                    message="Test message"
                />
            );

            expect(screen.getByText('Test Title')).toBeInTheDocument();
            expect(screen.getByText('Test message')).toBeInTheDocument();
        });

        it('handles missing title gracefully', () => {
            render(
                <Notification
                    message="Test message"
                />
            );

            expect(screen.getByText('Test message')).toBeInTheDocument();
            expect(screen.queryByRole('heading')).toBeNull();
        });
    });

    describe('accessibility', () => {
        it('has correct ARIA attributes', () => {
            render(
                <Notification
                    message="Test message"
                    title="Test title"
                />
            );

            const notification = screen.getByRole('alert');
            expect(notification).toHaveAttribute('aria-live', 'polite');
        });

        it('has accessible close button', () => {
            render(
                <Notification
                    message="Test message"
                />
            );

            const closeButton = screen.getByLabelText('Close notification');
            expect(closeButton).toBeInTheDocument();
        });

        it('has accessible action button', () => {
            render(
                <Notification
                    message="Test message"
                    actionText="Action"
                    onActionClick={jest.fn()}
                />
            );

            const actionButton = screen.getByText('Action');
            expect(actionButton).toBeInTheDocument();
        });
    });
});
