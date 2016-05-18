/* jshint esversion: 6 */
'use strict';

import React from 'react';
import { Link } from 'react-router';
import FilmList from './FilmList.jsx';
import styles from './Films.scss';
import * as $ from'jquery';

const Films = React.createClass({
  getInitialState() {
    return {
      films: []
    }
  },

  getAllFilms: function() {
    $.ajax({
      url: "/api/film",
      method: 'GET',
      dataType: 'json',
      cache: false,
      success: function(data) {
        console.log(data, 'data')
        this.setState({ films: data });
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props, status, err.toString());
      }.bind(this)
    });
  },

  componentDidMount: function() {
    this.getAllFilms();
  },

  render: function() {
    return (
      <div className={styles.filmList}>
        <div className='u-full-width'>
          <h1>Films</h1>
          <Link to={'/film/new'}><button>Add Film</button></Link>
        </div>
        <div className='row'>
          <FilmList films={this.state.films} />
        </div>
      </div>
    )
  }
});

export default Films;