import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
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
			expect(screen.getByText('About')).toBeInTheDocument();
			expect(screen.getByText('Case Study')).toBeInTheDocument();
			expect(screen.getByText('API Docs')).toBeInTheDocument();
			expect(screen.getByText('Privacy')).toBeInTheDocument();
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
});
