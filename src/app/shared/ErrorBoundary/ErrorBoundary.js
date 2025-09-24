import React from 'react';
import PropTypes from 'prop-types';
import './ErrorBoundary.scss';

class ErrorBoundary extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			hasError: false,
			error: null,
			errorInfo: null,
			retryCount: 0,
		};
	}

	static getDerivedStateFromError(error) {
		// Update state so the next render will show the fallback UI
		return { hasError: true };
	}

	componentDidCatch(error, errorInfo) {
		// Log error details
		this.setState({
			error,
			errorInfo,
		});

		// Log to console in development
		if (process.env.NODE_ENV === 'development') {
			console.error('ErrorBoundary caught an error:', error, errorInfo);
		}

		// In production, you might want to log to an error reporting service
		// Example: errorReportingService.logError(error, errorInfo);
	}

	handleRetry = () => {
		this.setState(prevState => ({
			hasError: false,
			error: null,
			errorInfo: null,
			retryCount: prevState.retryCount + 1,
		}));
	};

	handleReportError = () => {
		const { error, errorInfo } = this.state;
		const errorReport = {
			message: error?.message || 'Unknown error',
			stack: error?.stack,
			componentStack: errorInfo?.componentStack,
			userAgent: navigator.userAgent,
			url: window.location.href,
			timestamp: new Date().toISOString(),
		};

		// In a real application, you would send this to your error reporting service
		console.log('Error report:', errorReport);

		// For now, we'll just show an alert
		alert('Error has been reported. Thank you for helping us improve!');
	};

	render() {
		const { hasError, error, errorInfo, retryCount } = this.state;
		const { children, fallback: FallbackComponent } = this.props;

		if (hasError) {
			// Use custom fallback component if provided
			if (FallbackComponent) {
				return (
					<FallbackComponent
						error={error}
						errorInfo={errorInfo}
						retryCount={retryCount}
						onRetry={this.handleRetry}
						onReportError={this.handleReportError}
					/>
				);
			}

			// Default error UI
			return (
				<div className="error-boundary" role="alert" aria-live="polite">
					<div className="error-boundary__container">
						<div className="error-boundary__icon" aria-hidden="true">
							⚠️
						</div>

						<h1 className="error-boundary__title">
							Oops! Something went wrong
						</h1>

						<p className="error-boundary__message">
							We're sorry, but something unexpected happened. This might be a temporary issue.
						</p>

						<div className="error-boundary__actions">
							<button
								type="button"
								className="error-boundary__button error-boundary__button--primary"
								onClick={this.handleRetry}
								aria-label="Try again to reload the page"
							>
								Try Again
							</button>

							<button
								type="button"
								className="error-boundary__button error-boundary__button--secondary"
								onClick={this.handleReportError}
								aria-label="Report this error to help us improve"
							>
								Report Error
							</button>
						</div>

						{process.env.NODE_ENV === 'development' && errorInfo && (
							<details className="error-boundary__details">
								<summary className="error-boundary__summary">
									Error Details (Development Only)
								</summary>
								<div className="error-boundary__error-content">
									{error && (
										<div className="error-boundary__error-message">
											<strong>Error:</strong> {error.toString()}
										</div>
									)}
									{errorInfo.componentStack && (
										<div className="error-boundary__error-stack">
											<strong>Component Stack:</strong>
											<pre>{errorInfo.componentStack}</pre>
										</div>
									)}
								</div>
							</details>
						)}
					</div>
				</div>
			);
		}

		return children;
	}
}

ErrorBoundary.propTypes = {
	children: PropTypes.node.isRequired,
	fallback: PropTypes.elementType,
};

ErrorBoundary.defaultProps = {
	fallback: null,
};

export default ErrorBoundary;
