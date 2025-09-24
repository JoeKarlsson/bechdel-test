import React, { createContext, useContext, useState, useEffect } from 'react';
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

    // Debounce search query updates
    useEffect(() => {
        setIsSearching(true);
        const timeoutId = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery);
            setIsSearching(false);
        }, 300); // 300ms delay

        return () => clearTimeout(timeoutId);
    }, [searchQuery]);

    const value = {
        searchQuery,
        setSearchQuery,
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
