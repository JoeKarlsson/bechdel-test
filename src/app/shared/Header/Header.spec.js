import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import Header from './Header';

describe('Header Component', () => {
	describe('rendering', () => {
		it('renders the logo and navigation links', () => {
			render(
				<MemoryRouter>
					<Header />
				</MemoryRouter>
			);

			expect(screen.getByText('bechdel.io')).toBeInTheDocument();
			expect(screen.getByText('about')).toBeInTheDocument();
			expect(screen.getByText('case study')).toBeInTheDocument();
		});

		it('renders mobile menu button', () => {
			render(
				<MemoryRouter>
					<Header />
				</MemoryRouter>
			);

			const mobileMenuButton = screen.getByLabelText('Toggle navigation menu');
			expect(mobileMenuButton).toBeInTheDocument();
		});

		it('has proper ARIA attributes', () => {
			render(
				<MemoryRouter>
					<Header />
				</MemoryRouter>
			);

			expect(screen.getByRole('banner')).toBeInTheDocument();
			expect(screen.getByRole('navigation')).toBeInTheDocument();
			expect(screen.getByLabelText('Main navigation')).toBeInTheDocument();
		});

		it('match the snapshot', () => {
			const { container } = render(
				<MemoryRouter>
					<Header />
				</MemoryRouter>
			);
			expect(container.firstChild).toMatchSnapshot();
		});
	});

	describe('mobile menu functionality', () => {
		it('toggles mobile menu when hamburger button is clicked', () => {
			render(
				<MemoryRouter>
					<Header />
				</MemoryRouter>
			);

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
			render(
				<MemoryRouter>
					<Header />
				</MemoryRouter>
			);

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
});
