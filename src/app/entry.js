import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import PrimaryLayout from './shared/PrimaryLayout/PrimaryLayout';
import ErrorBoundary from './shared/ErrorBoundary/ErrorBoundary';

// Get the root element
const container = document.getElementById('root');

if (!container) {
	throw new Error('Root element not found. Make sure there is an element with id="root" in your HTML.');
}

// Create React root
const root = createRoot(container);

// App-level error fallback component
const AppErrorFallback = ({ error, errorInfo, retryCount, onRetry, onReportError }) => (
	<div className="app-error" role="alert" aria-live="polite">
		<div className="app-error__container">
			<div className="app-error__icon" aria-hidden="true">
				🚨
			</div>
			<h1 className="app-error__title">Application Error</h1>
			<p className="app-error__message">
				Something went wrong with the application. Please try refreshing the page.
			</p>
			<div className="app-error__actions">
				<button
					type="button"
					className="app-error__button app-error__button--primary"
					onClick={() => window.location.reload()}
					aria-label="Refresh the page to try again"
				>
					Refresh Page
				</button>
				<button
					type="button"
					className="app-error__button app-error__button--secondary"
					onClick={onReportError}
					aria-label="Report this error to help us improve"
				>
					Report Error
				</button>
			</div>
			{process.env.NODE_ENV === 'development' && error && (
				<details className="app-error__details">
					<summary className="app-error__summary">
						Error Details (Development Only)
					</summary>
					<div className="app-error__error-content">
						<pre>{error.toString()}</pre>
						{errorInfo && errorInfo.componentStack && (
							<pre>{errorInfo.componentStack}</pre>
						)}
					</div>
				</details>
			)}
		</div>
	</div>
);

// Render the app
root.render(
	<ErrorBoundary fallback={AppErrorFallback}>
		<Router>
			<PrimaryLayout />
		</Router>
	</ErrorBoundary>
);
