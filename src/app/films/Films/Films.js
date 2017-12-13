import React from 'react';
import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';
import FilmList from './FilmList/FilmList';
import skeleton from '../../shared/css/skeleton.css';
import styles from './Films.scss';
import * as $ from 'jquery';

class Films extends React.Component {
  constructor() {
    super();
    this.state = {
      films: []
    };
  }

  getAllFilms() {
    $.ajax({
      url: "/api/film",
      method: "GET",
      dataType: "json",
      cache: false,
      success: function(data) {
        this.setState({ films: data });
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props, status, err.toString());
      }.bind(this)
    });
  }

  componentDidMount() {
    this.getAllFilms();
  }

  render() {
    return (
      <div className={styles.films}>
        <div className={skeleton.u_full_width}>
          <div className="row">
            <h1>Bechdel.io</h1>
            <p>
              The Bechdel.io was a collaborative project between a English
              Scholar and a Software Engineer. With the tool we’ve created, the
              process of determing whether a film passes the Beschdel Test is
              automated, which allows massive amounts of data to be generated
              with ease. Thus, data can be produced for large bodies of film,
              i.e. a certain director’s filmography, a certain actress’ body of
              work, or for the films released in a specific year.
            </p>
          </div>
        </div>
        <div className={styles.films_Header}>
          <h3>films</h3>
          <NavLink to={"/film/new"}>
            <button>Add a Film</button>
          </NavLink>
        </div>
        <div className="row">
          <FilmList films={this.state.films} />
        </div>
        <p>
          If you have any suggestions for how to grow the application, we would
          love to hear from{" "}
          <a target="blank" href="https://www.callmejoe.net/contact/">
            you
          </a>.
        </p>
      </div>
    );
  }
}

Films.propTypes = {
  films: PropTypes.array
};

Films.defaultProps = {
  films: []
};

export default Films;
