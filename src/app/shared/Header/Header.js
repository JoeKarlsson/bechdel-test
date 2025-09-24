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

			// Close mobile menu with Escape key
			if (event.key === 'Escape' && isMobileMenuOpen) {
				setIsMobileMenuOpen(false);
			}
		};

		document.addEventListener('keydown', handleKeyDown);
		return () => document.removeEventListener('keydown', handleKeyDown);
	}, [isMobileMenuOpen]);

	const toggleMobileMenu = () => {
		setIsMobileMenuOpen(!isMobileMenuOpen);
	};

	const closeMobileMenu = () => {
		setIsMobileMenuOpen(false);
	};

	const clearSearch = () => {
		setSearchQuery('');
		searchInputRef.current?.focus();
	};

	return (
		<>
			<a href="#main-content" className="skip-link">
				Skip to main content
			</a>
			<a href="#navigation" className="skip-link skip-link--nav">
				Skip to navigation
			</a>
			<a href="#search" className="skip-link skip-link--search">
				Skip to search
			</a>
			<header className="header_bar" role="banner">
				<NavLink to="/" className="header_logo" aria-label="bechdel.io - Home">
					bechdel.io
				</NavLink>

				<div className="header_right">
					<nav id="navigation" className={`header_nav ${isMobileMenuOpen ? 'mobile_menu_open' : ''}`} role="navigation" aria-label="Main navigation" aria-expanded={isMobileMenuOpen}>
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
					<div id="search" className={`header_search ${isMobileMenuOpen ? 'mobile_menu_open' : ''}`}>
						<label htmlFor="search-input" className="sr-only">Search films</label>
						<div className="search_container">
							<input
								id="search-input"
								type="text"
								placeholder="Search films... (Ctrl+K)"
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="search_input"
								ref={searchInputRef}
								aria-describedby="search-help"
							/>
							<div id="search-help" className="sr-only">
								Use Ctrl+K to quickly focus this search field
							</div>
							<div
								className={`search_icon ${isSearching ? 'searching' : ''} ${searchQuery ? 'clearable' : ''}`}
								aria-hidden="true"
								onClick={searchQuery ? clearSearch : undefined}
								style={{ cursor: searchQuery ? 'pointer' : 'default' }}
								title={searchQuery ? 'Clear search' : 'Search'}
							>
								{isSearching ? '⏳' : (searchQuery ? '✕' : '🔍')}
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
						aria-controls="navigation"
					>
						<span className="hamburger_line" />
						<span className="hamburger_line" />
						<span className="hamburger_line" />
					</button>
				</div>
			</header>
		</>
	);
};

export default Header;
