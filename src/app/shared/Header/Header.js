import React from 'react';
import {
	NavLink,
} from 'react-router-dom';
import styles from './Header.scss';

const activeStyles = {
	color: 'red',
};

const Header = () => {
	return (
		<header className={styles.header_bar}>
			<NavLink to="/" className={styles.header_logo}>
				bechdel.io
			</NavLink>
			<ul className={styles.header_nav}>
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
