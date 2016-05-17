/* jshint esversion: 6 */
'use strict';

import React from 'react';
import FilmItem from './FilmItem.jsx';

const FilmList = React.createClass({
  render: function() {
    var filmListNode = this.props.films.map(function(filmData){
      console.log(filmData, 'FilmData')
      return (
        <FilmItem
          film={filmData}
          key={filmData._id} >
        </FilmItem>
      )
    });

    return (
      <div className='filmList'>
        { filmListNode }
      </div>
    )
  }
});

export default FilmList;