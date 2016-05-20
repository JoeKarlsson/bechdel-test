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
      url: "/api/film",
      method: 'GET',
      dataType: 'json',
      cache: false,
      success: function(data) {
        console.log(data, 'data')
        console.log(this.state.films , 'state')
        this.setState({ films: data });
        console.log(this.state.films , 'state')
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
      <div className='films'>
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

FilmList.propTypes = {
  films: React.PropTypes.array,
};

FilmList.defaultProps = {
  films: [],
};

export default Films;
