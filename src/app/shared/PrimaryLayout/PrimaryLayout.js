import React from 'react';
import { Route, Switch } from 'react-router-dom';
import Header from '../Header/Header';
import Footer from '../Footer/Footer';
import About from '../../static/About/About';
import Privacy from '../../static/Privacy/Privacy';
import CaseStudy from '../../static/CaseStudy/CaseStudy';
import ApiDocs from '../../static/ApiDocs/ApiDocs';
import Home from '../../static/Home/Home';
import FilmContainer from '../../films/Film/FilmContainer';
import NewFilm from '../../films/NewFilm/NewFilm';
import NoMatch from '../../static/NoMatch/NoMatch';
import ErrorBoundary from '../ErrorBoundary/ErrorBoundary';
import '../../assets/styles/skeleton.css';
import '../../assets/styles/normalize.css';
import './PrimaryLayout.scss';

export const PrimaryLayout = () => {
	return (
		<div className="PrimaryLayout">
			<Header />
			<div className="content">
				<ErrorBoundary>
					<Switch>
						<Route exact path="/" component={Home} />
						<Route path="/about" component={About} />
						<Route path="/privacy" component={Privacy} />
						<Route path="/api-docs" component={ApiDocs} />
						<Route path="/case-study" component={CaseStudy} />
						<Route path="/film/new" component={NewFilm} />
						<Route path="/film/:id" component={FilmContainer} />
						<Route path="*" component={NoMatch} />
					</Switch>
				</ErrorBoundary>
			</div>
			<Footer />
		</div>
	);
};

export default PrimaryLayout;
