/* jshint esversion: 6 */
'use strict';

import React from 'react';
import { IndexLink, Link } from 'react-router';
import NavLink from './navigation/NavLink.jsx';
import Home from './home/Home.jsx';
import About from './about/About.jsx';
import Films from './films/Films.jsx';
import styles from './App.scss';

export default React.createClass({

  render() {
    return (
      <div className="site">
        <header>
          <a href='/films' className="header--logo">Bechdel Test</a>
          <ul className="header--nav">
            <li><NavLink to="/" onlyActiveOnIndex={true}>Home</NavLink></li>
            <li><NavLink to="/about">About</NavLink></li>
            <li><NavLink to="/films">Films</NavLink></li>
          </ul>
        </header>

        <div className="container content">
          {
              this.props.children || <Home/>
          }
        </div>

        <footer className="footer">
          <div className="footer-content">
            <a href='http://www.callmejoe.net/'><p>Site by Joe.</p></a>
          </div>
        </footer>
      </div>
    )
  }
});