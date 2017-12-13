import React from 'react';
import { Route, Switch } from 'react-router-dom';
import Header from '../Header/Header';
import Footer from '../Footer/Footer';
import About from '../../static/About/About';
import CaseStudy from '../../static/CaseStudy/CaseStudy';
import Films from '../../films/Films/Films';
import Film from '../../films/Film/Film';
import NewFilm from '../../films/NewFilm/NewFilm';
import NoMatch from '../../static/NoMatch/NoMatch';
import ErrorBoundary from '../ErrorBoundary/ErrorBoundary';
import skeleton from '../../assets/styles/skeleton.css';
import '../../assets/styles/normalize.css';
import styles from './PrimaryLayout.scss';

export const PrimaryLayout = () => {
	return (
		<div className={styles.PrimaryLayout}>
			<Header />
			<div className={styles.content}>
				<div className={skeleton.container}>
					<ErrorBoundary>
						<Switch>
							<Route exact path="/" component={Films} />
							<Route path="/about" component={About} />
							<Route path="/case-study" component={CaseStudy} />
							<Route path="/film/new" component={NewFilm} />
							<Route path="/film/:id" component={Film} />
							<Route path="*" component={NoMatch} />
						</Switch>
					</ErrorBoundary>
				</div>
			</div>
			<Footer />
		</div>
	);
};

export default PrimaryLayout;
