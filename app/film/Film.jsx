import React from 'react';
import { Link } from 'react-router';
import styles from './Film.scss';
import * as $ from'jquery';

class Film extends React.Component {
  constructor() {
    super();
    this.state = {
      film: {},
    };
 }

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
  }

  componentDidMount() {
    this.getFilm();
  }

  render() {
    return (
      <div>
        <h2>{this.state.film.title}</h2>
        <p>{this.state.film.plot}</p>
        <Link to={'/'}><button>All Films</button></Link>
      </div>
    )
  }
}

Film.propTypes = {
  films: React.PropTypes.object,
};

Film.defaultProps = {
  film: {},
};

export default Film;
