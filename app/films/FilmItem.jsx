/* jshint esversion: 6 */
'use strict';

import React from 'react';
import { Link } from 'react-router';

const FilmItem = React.createClass({
  render: function() {
    return (
      <div className='FilmItem'>
        <li>
          <div>
            <img
              src={this.props.film.images.poster}
              alt={this.props.film.title}
            />
            <p>
            <Link
              className='gist-description'
              to={"/film/" + this.props.film._id}
            >
              {this.props.film.title}
            </Link></p>
          </div>
        </li>
      </div>
    )
  }
});

export default FilmItem;
