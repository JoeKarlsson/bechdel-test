import React from 'react';
import * as $ from'jquery';
import { Link } from 'react-router';

export default React.createClass({
  getInitialState() {
    return {
      film: {}
    }
  },

  getFilm() {
    $.ajax({
      url: "/api/film/" + this.props.params.id,
      method: 'GET',
      dataType: 'json',
      cache: false,
      success: function(data) {
        this.setState({ film: data });
        console.log(this.state.film, 'data')
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props, status, err.toString());
      }.bind(this)
    });
  },

  componentDidMount() {
    this.getFilm();
  },

  render() {
    return (
      <div>
        <h2>{this.state.film.title}</h2>
        <p>{this.state.film.plot}</p>
        <Link to={'/films'}><button>All Films</button></Link>
      </div>
    )
  }
});
