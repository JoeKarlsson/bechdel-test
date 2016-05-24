import React from 'react';
import { Link } from 'react-router';
import FilmList from './FilmList.jsx';
import styles from './Films.scss';
import * as $ from'jquery';

class Films extends React.Component {
  constructor() {
    super();
    this.state = {
      films: [],
    };
 }

  getAllFilms() {
    $.ajax({
      url: '/api/film',
      method: 'GET',
      dataType: 'json',
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
        <div className='u-full-width'>
          <h1>Films</h1>
          <Link to={'/film/new'}>
            <button>Add Films</button>
          </Link>
        </div>
        <div className='row'>
          <FilmList films={this.state.films} />
        </div>
      </div>
    )
  }
}

Films.propTypes = {
  films: React.PropTypes.array,
};

Films.defaultProps = {
  films: [],
};

export default Films;
