import React from 'react';
import { NavLink } from 'react-router-dom';
import './Footer.scss';

const Footer = () => (
	<footer className="footer">
		<div className="footer_content">
			<div className="footer_links">
				<NavLink to="/api-docs">api docs</NavLink>
				<NavLink to="/film/new">upload script</NavLink>
				<NavLink to="/privacy">privacy policy</NavLink>
				<a
					target="_blank"
					rel="noopener noreferrer"
					href="https://github.com/JoeKarlsson/bechdel-test"
				>
					code
				</a>
				<a
					target="_blank"
					rel="noopener noreferrer"
					href="https://github.com/JoeKarlsson/bechdel-test/issues"
				>
					help
				</a>
			</div>
			<a
				target="_blank"
				rel="noopener noreferrer"
				href="https://www.joekarlsson.com/"
			>
				<p>© {new Date().getFullYear()} - a karlsson production.</p>
			</a>
		</div>
	</footer>
);

export default Footer;
