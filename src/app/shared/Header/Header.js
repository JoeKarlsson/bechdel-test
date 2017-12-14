import React from 'react';
import {
	NavLink,
} from 'react-router-dom';
import './Header.scss';

const activeStyles = {
	color: 'red',
};

const Header = () => {
	return (
		<header className="header_bar">
			<NavLink to="/" className="header_logo">
				bechdel.io
			</NavLink>
			<ul className="header_nav">
				<li>
					<NavLink to="/about" activeStyle={activeStyles}>about</NavLink>
				</li>
				<li>
					<NavLink to="/case-study"activeStyle={activeStyles}>case study</NavLink>
				</li>
			</ul>
		</header>
	);
};

export default Header;
