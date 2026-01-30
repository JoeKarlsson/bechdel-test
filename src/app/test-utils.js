/**
 * Test utilities for wrapping components with required providers
 */
import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { SearchProvider } from './shared/SearchContext/SearchContext';
import { DarkModeProvider } from './shared/DarkModeContext/DarkModeContext';

/**
 * Wrapper component that provides all required context providers for testing
 */
const AllTheProviders = ({ children }) => {
  return (
    <HelmetProvider>
      <MemoryRouter>
        <DarkModeProvider>
          <SearchProvider>
            {children}
          </SearchProvider>
        </DarkModeProvider>
      </MemoryRouter>
    </HelmetProvider>
  );
};

/**
 * Custom render function that wraps components with all providers
 */
const customRender = (ui, options) =>
  render(ui, { wrapper: AllTheProviders, ...options });

// Re-export everything
export * from '@testing-library/react';

// Override render method
export { customRender as render, AllTheProviders };
