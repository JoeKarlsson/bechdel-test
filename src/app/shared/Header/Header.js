import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import './Header.scss';

const Header = () => {
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

	const toggleMobileMenu = () => {
		setIsMobileMenuOpen(!isMobileMenuOpen);
	};

	const closeMobileMenu = () => {
		setIsMobileMenuOpen(false);
	};

	return (
		<header className="header_bar" role="banner">
			<NavLink to="/" className="header_logo" aria-label="bechdel.io - Home">
				bechdel.io
			</NavLink>

			{/* Mobile menu button */}
			<button
				type="button"
				className="mobile_menu_button"
				onClick={toggleMobileMenu}
				aria-label="Toggle navigation menu"
				aria-expanded={isMobileMenuOpen}
			>
				<span className="hamburger_line" />
				<span className="hamburger_line" />
				<span className="hamburger_line" />
			</button>

			<nav className={`header_nav ${isMobileMenuOpen ? 'mobile_menu_open' : ''}`} role="navigation" aria-label="Main navigation">
				<ul className="nav_list">
					<li>
						<NavLink
							to="/about"
							className={({ isActive }) => isActive ? 'nav_link active' : 'nav_link'}
							onClick={closeMobileMenu}
						>
							about
						</NavLink>
					</li>
					<li>
						<NavLink
							to="/case-study"
							className={({ isActive }) => isActive ? 'nav_link active' : 'nav_link'}
							onClick={closeMobileMenu}
						>
							case study
						</NavLink>
					</li>
				</ul>
			</nav>
		</header>
	);
};

export default Header;
