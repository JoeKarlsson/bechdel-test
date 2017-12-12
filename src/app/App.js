import React from 'react';
import { Route, Switch, NavLink } from 'react-router-dom';
import skeleton from './shared/css/skeleton.css';
import normalize from './shared/css/normalize.css';
import Home from './home/Home.jsx';
import About from './static/about/About.jsx';
import CaseStudy from './static/caseStudy/CaseStudy.jsx';
import Films from './films/films/Films.jsx';
import Film from './films/film/Film.jsx';
import NewFilm from './films/new/NewFilm.jsx';
import NoMatch from './shared/NoMatch.jsx';
import ErrorBoundary from './shared/ErrorBoundary/ErrorBoundary';
import styles from './App.scss';

class App extends React.Component {
  render() {
    return (
      <div className={styles.site}>
        <header className={styles.header_bar}>
          <NavLink to="/" className={styles.header_logo}>
            bechdel.io
          </NavLink>
          <ul className={styles.header_nav}>
            <li>
              <NavLink to="/about">about</NavLink>
            </li>
            <li>
              <NavLink to="/case-study">case study</NavLink>
            </li>
          </ul>
        </header>

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

        <footer className={styles.footer}>
          <div className={styles.footer_content}>
            <a
              target="_blank"
              href="https://github.com/JoeKarlsson/bechdel-test"
            >
              <p>a karlsson production.</p>
            </a>
          </div>
        </footer>
      </div>
    );
  }
}

export default App;
