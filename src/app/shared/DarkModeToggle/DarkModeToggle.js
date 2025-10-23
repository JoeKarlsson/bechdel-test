import React from 'react';
import { useDarkMode } from '../DarkModeContext/DarkModeContext';
import './DarkModeToggle.scss';

const DarkModeToggle = () => {
	const { isDarkMode, toggleDarkMode } = useDarkMode();

	return (
		<button
			type="button"
			className={`dark-mode-toggle ${isDarkMode ? 'dark' : 'light'}`}
			onClick={toggleDarkMode}
			aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
			title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
		>
			<span className="toggle-icon">
				{isDarkMode ? '☀️' : '🌙'}
			</span>
		</button>
	);
};

export default DarkModeToggle;
