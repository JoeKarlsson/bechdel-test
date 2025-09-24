import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useSearch } from '../SearchContext/SearchContext';
import './Header.scss';

const Header = () => {
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
	const { searchQuery, setSearchQuery } = useSearch();

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

			<div className="header_right">
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

				{/* Search bar */}
				<div className="header_search">
					<div className="search_container">
						<input
							type="text"
							placeholder="Search films..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="search_input"
						/>
						<div className="search_icon">🔍</div>
					</div>
				</div>

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
			</div>
		</header>
	);
};

export default Header;
