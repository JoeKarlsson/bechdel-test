import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Header from './Header';
import { SearchProvider } from '../SearchContext/SearchContext';

const renderWithProviders = (component) => {
	return render(
		<MemoryRouter>
			<SearchProvider>
				{component}
			</SearchProvider>
		</MemoryRouter>
	);
};

describe('Header Component', () => {
	describe('rendering', () => {
		it('renders the logo and navigation links', () => {
			renderWithProviders(<Header />);

			expect(screen.getByText('bechdel.io')).toBeInTheDocument();
			expect(screen.getByText('about')).toBeInTheDocument();
			expect(screen.getByText('case study')).toBeInTheDocument();
		});

		it('renders mobile menu button', () => {
			renderWithProviders(<Header />);

			const mobileMenuButton = screen.getByLabelText('Toggle navigation menu');
			expect(mobileMenuButton).toBeInTheDocument();
		});

		it('has proper ARIA attributes', () => {
			renderWithProviders(<Header />);

			expect(screen.getByRole('banner')).toBeInTheDocument();
			expect(screen.getByRole('navigation')).toBeInTheDocument();
			expect(screen.getByLabelText('Main navigation')).toBeInTheDocument();
		});

		it('match the snapshot', () => {
			const { container } = renderWithProviders(<Header />);
			expect(container.firstChild).toMatchSnapshot();
		});
	});

	describe('mobile menu functionality', () => {
		it('toggles mobile menu when hamburger button is clicked', () => {
			renderWithProviders(<Header />);

			const mobileMenuButton = screen.getByLabelText('Toggle navigation menu');
			const navigation = screen.getByRole('navigation');

			// Initially closed
			expect(mobileMenuButton).toHaveAttribute('aria-expanded', 'false');

			// Click to open
			fireEvent.click(mobileMenuButton);
			expect(mobileMenuButton).toHaveAttribute('aria-expanded', 'true');
			expect(navigation).toHaveClass('mobile_menu_open');

			// Click to close
			fireEvent.click(mobileMenuButton);
			expect(mobileMenuButton).toHaveAttribute('aria-expanded', 'false');
			expect(navigation).not.toHaveClass('mobile_menu_open');
		});

		it('closes mobile menu when navigation link is clicked', () => {
			renderWithProviders(<Header />);

			const mobileMenuButton = screen.getByLabelText('Toggle navigation menu');
			const aboutLink = screen.getByText('about');

			// Open menu
			fireEvent.click(mobileMenuButton);
			expect(mobileMenuButton).toHaveAttribute('aria-expanded', 'true');

			// Click navigation link
			fireEvent.click(aboutLink);
			expect(mobileMenuButton).toHaveAttribute('aria-expanded', 'false');
		});
	});

	describe('search functionality', () => {
		it('shows magnifying glass icon when search is empty', async () => {
			renderWithProviders(<Header />);

			// Wait for the initial debounce to complete
			await waitFor(() => {
				const searchIcon = document.querySelector('.search_icon');
				expect(searchIcon).toHaveTextContent('🔍');
				expect(searchIcon).not.toHaveClass('clearable');
			}, { timeout: 1000 });
		});

		it('shows X icon and becomes clickable when search has content', async () => {
			renderWithProviders(<Header />);

			const searchInput = screen.getByPlaceholderText('Search films... (Ctrl+K)');
			const searchIcon = document.querySelector('.search_icon');

			// Wait for initial debounce to complete
			await waitFor(() => {
				expect(searchIcon).toHaveTextContent('🔍');
			}, { timeout: 1000 });

			// Type in search input
			fireEvent.change(searchInput, { target: { value: 'test search' } });

			// Wait for the debounce to complete after typing
			await waitFor(() => {
				expect(searchIcon).toHaveTextContent('✕');
				expect(searchIcon).toHaveClass('clearable');
				expect(searchIcon).toHaveStyle('cursor: pointer');
			}, { timeout: 1000 });
		});

		it('clears search when X icon is clicked', async () => {
			renderWithProviders(<Header />);

			const searchInput = screen.getByPlaceholderText('Search films... (Ctrl+K)');
			const searchIcon = document.querySelector('.search_icon');

			// Wait for initial debounce to complete
			await waitFor(() => {
				expect(searchIcon).toHaveTextContent('🔍');
			}, { timeout: 1000 });

			// Type in search input
			fireEvent.change(searchInput, { target: { value: 'test search' } });
			expect(searchInput).toHaveValue('test search');

			// Wait for the debounce to complete after typing
			await waitFor(() => {
				expect(searchIcon).toHaveTextContent('✕');
			}, { timeout: 1000 });

			// Click the X icon to clear
			fireEvent.click(searchIcon);

			// Check that search is cleared and wait for debounce to complete
			expect(searchInput).toHaveValue('');

			await waitFor(() => {
				expect(searchIcon).toHaveTextContent('🔍');
				expect(searchIcon).not.toHaveClass('clearable');
			}, { timeout: 1000 });
		});
	});
});
