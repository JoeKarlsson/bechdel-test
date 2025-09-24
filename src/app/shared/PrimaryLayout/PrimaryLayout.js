import React, { Suspense, lazy } from 'react';
import PropTypes from 'prop-types';
import { Routes, Route } from 'react-router-dom';
import Header from '../Header/Header';
import Footer from '../Footer/Footer';
import ErrorBoundary from '../ErrorBoundary/ErrorBoundary';
import Loading from '../Loading/Loading';
import { SearchProvider } from '../SearchContext/SearchContext';
import { DarkModeProvider } from '../DarkModeContext/DarkModeContext';
import '../../assets/styles/skeleton.css';
import '../../assets/styles/normalize.css';
import '../../assets/styles/dark-mode.css';
import '../../assets/styles/accessibility.css';
import './PrimaryLayout.scss';

// Lazy load components for better performance
const About = lazy(() => import('../../static/About/About'));
const Privacy = lazy(() => import('../../static/Privacy/Privacy'));
const CaseStudy = lazy(() => import('../../static/CaseStudy/CaseStudy'));
const ApiDocs = lazy(() => import('../../static/ApiDocs/ApiDocs'));
const Home = lazy(() => import('../../static/Home/Home'));
const FilmContainer = lazy(() => import('../../films/Film/FilmContainer'));
const NewFilm = lazy(() => import('../../films/NewFilm/NewFilm'));
const FilmsContainer = lazy(() => import('../../films/Films/FilmsContainer'));
const NoMatch = lazy(() => import('../../static/NoMatch/NoMatch'));

// Loading fallback component
const PageLoading = () => (
	<div className="page-loading" role="status" aria-live="polite">
		<Loading />
		<p className="page-loading__text">Loading page...</p>
	</div>
);

// Error fallback component for route errors
const RouteErrorFallback = ({ error, errorInfo, retryCount, onRetry, onReportError }) => (
	<div className="route-error">
		<div className="route-error__container">
			<h1>Page Error</h1>
			<p>There was an error loading this page.</p>
			<button onClick={onRetry}>Try Again</button>
		</div>
	</div>
);

export const PrimaryLayout = () => {
	return (
		<DarkModeProvider>
			<SearchProvider>
				<div className="PrimaryLayout">
					<Header />
					<main id="main-content" className="content" role="main">
						<ErrorBoundary fallback={RouteErrorFallback}>
							<Suspense fallback={<PageLoading />}>
								<Routes>
									<Route path="/" element={<Home />} />
									<Route path="/about" element={<About />} />
									<Route path="/privacy" element={<Privacy />} />
									<Route path="/api-docs" element={<ApiDocs />} />
									<Route path="/case-study" element={<CaseStudy />} />
									<Route path="/film/new" element={<NewFilm />} />
									<Route path="/film/:id" element={<FilmContainer />} />
									<Route path="/films" element={<FilmsContainer />} />
									<Route path="*" element={<NoMatch />} />
								</Routes>
							</Suspense>
						</ErrorBoundary>
					</main>
					<Footer />
				</div>
			</SearchProvider>
		</DarkModeProvider>
	);
};

PrimaryLayout.propTypes = {
	// No props needed for this component
};

PrimaryLayout.defaultProps = {
	// No default props
};

export default PrimaryLayout;
