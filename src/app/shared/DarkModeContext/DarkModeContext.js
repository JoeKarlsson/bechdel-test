import React, { createContext, useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const DarkModeContext = createContext();

export const useDarkMode = () => {
	const context = useContext(DarkModeContext);
	if (!context) {
		// Return default values instead of throwing error to prevent crashes
		return {
			isDarkMode: false,
			toggleDarkMode: () => { },
		};
	}
	return context;
};

export const DarkModeProvider = ({ children }) => {
	const [isDarkMode, setIsDarkMode] = useState(() => {
		// Check localStorage for saved preference, default to false
		const saved = localStorage.getItem('darkMode');
		return saved ? JSON.parse(saved) : false;
	});

	useEffect(() => {
		// Save preference to localStorage whenever it changes
		localStorage.setItem('darkMode', JSON.stringify(isDarkMode));

		// Apply dark mode class to document body
		if (isDarkMode) {
			document.body.classList.add('dark-mode');
		} else {
			document.body.classList.remove('dark-mode');
		}
	}, [isDarkMode]);

	const toggleDarkMode = () => {
		setIsDarkMode(prev => !prev);
	};

	const value = {
		isDarkMode,
		toggleDarkMode,
	};

	return (
		<DarkModeContext.Provider value={value}>
			{children}
		</DarkModeContext.Provider>
	);
};

DarkModeProvider.propTypes = {
	children: PropTypes.node.isRequired,
};
