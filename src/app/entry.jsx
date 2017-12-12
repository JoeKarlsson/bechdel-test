import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import App from './App';
import ErrorBoundary from './shared/ErrorBoundary/ErrorBoundary';

ReactDOM.render(
	<ErrorBoundary>
		<Router>
			<App />
		</Router>
	</ErrorBoundary>,
	document.getElementById('root')
);
