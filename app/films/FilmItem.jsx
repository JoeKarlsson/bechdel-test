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
            <p>{this.props.film.title}</p>
          </div>
        </li>
      </div>
    )
  }
});

export default FilmItem;
