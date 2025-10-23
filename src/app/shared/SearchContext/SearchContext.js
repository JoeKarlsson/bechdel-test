import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';

const SearchContext = createContext();

export const useSearch = () => {
	const context = useContext(SearchContext);
	if (!context) {
		// Return default values instead of throwing error to prevent crashes
		return {
			searchQuery: '',
			setSearchQuery: () => { },
		};
	}
	return context;
};

export const SearchProvider = ({ children }) => {
	const [searchQuery, setSearchQuery] = useState('');
	const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
	const [isSearching, setIsSearching] = useState(false);
	const navigate = useNavigate();
	const location = useLocation();

	// Debounce search query updates
	useEffect(() => {
		setIsSearching(true);
		const timeoutId = setTimeout(() => {
			setDebouncedSearchQuery(searchQuery);
			setIsSearching(false);
		}, 300); // 300ms delay

		return () => clearTimeout(timeoutId);
	}, [searchQuery]);

	// Function to handle search
	const handleSearch = (query) => {
		setSearchQuery(query);
	};

	// Effect to handle navigation after debounce
	useEffect(() => {
		if (debouncedSearchQuery && location.pathname !== '/') {
			navigate('/');
		}
	}, [debouncedSearchQuery, location.pathname, navigate]);

	const value = {
		searchQuery,
		setSearchQuery: handleSearch,
		debouncedSearchQuery,
		isSearching,
	};

	return (
		<SearchContext.Provider value={value}>
			{children}
		</SearchContext.Provider>
	);
};

SearchProvider.propTypes = {
	children: PropTypes.node.isRequired,
};
