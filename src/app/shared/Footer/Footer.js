import React from 'react';
import styles from './Footer.scss';

const Footer = () => (
	<footer className={styles.footer}>
		<div className={styles.footer_content}>
			<a
				target="_blank"
				rel="noopener noreferrer"
				href="https://github.com/JoeKarlsson/bechdel-test"
			>
				<p>a karlsson production.</p>
			</a>
		</div>
	</footer>
);

export default Footer;
