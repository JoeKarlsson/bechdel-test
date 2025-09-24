import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import PrimaryLayout from './shared/PrimaryLayout/PrimaryLayout';
import ErrorBoundary from './shared/ErrorBoundary/ErrorBoundary';

const container = document.getElementById('root');
const root = createRoot(container);

root.render(
	<ErrorBoundary>
		<Router>
			<PrimaryLayout />
		</Router>
	</ErrorBoundary>
);
