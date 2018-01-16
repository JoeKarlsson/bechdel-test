import React from 'react';
import { NavLink } from 'react-router-dom';
import './Footer.scss';

const Footer = () => (
	<footer className="footer">
		<div className="footer_content">
			<a
				target="_blank"
				rel="noopener noreferrer"
				href="https://github.com/JoeKarlsson/bechdel-test"
			>
				<p>{new Date().getFullYear()} - a karlsson production.</p>
			</a>
			<NavLink to="/privacy">privacy policy</NavLink>
		</div>
	</footer>
);

export default Footer;
