import React, { createContext, useContext, useState } from 'react';
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

    const value = {
        searchQuery,
        setSearchQuery,
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
