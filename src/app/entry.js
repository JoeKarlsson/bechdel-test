import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import PrimaryLayout from './shared/PrimaryLayout/PrimaryLayout';
import ErrorBoundary from './shared/ErrorBoundary/ErrorBoundary';

ReactDOM.render(
	<ErrorBoundary>
		<Router>
			<PrimaryLayout />
		</Router>
	</ErrorBoundary>,
	document.getElementById('root')
);
