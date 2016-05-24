import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, browserHistory, IndexRoute } from 'react-router';
import normalize from './shared/css/normalize.css';
import App from './App.jsx';
import Home from './home/Home.jsx';
import About from './static/about/About.jsx';
import Films from './films/films/Films.jsx';
import Film from './films/film/Film.jsx';
import NewFilm from './films/new/NewFilm.jsx';
import NoMatch from './shared/NoMatch.jsx';

ReactDOM.render(
  <Router history={browserHistory}>
    <Route path='/' component={App}>
      <IndexRoute component={Films} />
      <Route path='/about' component={About} />
      <Route path='/film/new' component={NewFilm} />
      <Route path='/film/:id' component={Film} />
      <Route path='*' component={NoMatch} />
    </Route>
  </Router>,
  document.getElementById('root')
);
