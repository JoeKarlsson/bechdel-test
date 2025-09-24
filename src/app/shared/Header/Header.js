import React, { useState, useRef, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useSearch } from '../SearchContext/SearchContext';
import DarkModeToggle from '../DarkModeToggle/DarkModeToggle';
import './Header.scss';

const Header = () => {
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
	const { searchQuery, setSearchQuery, isSearching } = useSearch();
	const searchInputRef = useRef(null);

	// Keyboard shortcut to focus search (Ctrl/Cmd + K)
	useEffect(() => {
		const handleKeyDown = (event) => {
			if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
				event.preventDefault();
				searchInputRef.current?.focus();
			}
		};

		document.addEventListener('keydown', handleKeyDown);
		return () => document.removeEventListener('keydown', handleKeyDown);
	}, []);

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
							placeholder="Search films... (Ctrl+K)"
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="search_input"
							ref={searchInputRef}
						/>
						<div className={`search_icon ${isSearching ? 'searching' : ''}`}>
							{isSearching ? '⏳' : '🔍'}
						</div>
					</div>
				</div>

				{/* Dark mode toggle */}
				<DarkModeToggle />

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
