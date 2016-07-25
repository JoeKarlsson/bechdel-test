import React from 'react';
import { Link } from 'react-router';
import FilmList from './FilmList.jsx';
import skeleton from '../../shared/css/skeleton.css';
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
        <div className={skeleton.u_full_width}>
          <div className='row'>
            <h1>Bechdel Test Visualizer</h1>
            <p>
              The Bechdel Test Visualizer was a collaborative project between a English Scholar and a Software Engineer. With the tool we’ve created, the process of determing whether a film passes the Beschdel Test is automated, which allows massive amounts of data to be generated with ease. Thus, data can be produced for large bodies of film, i.e. a certain director’s filmography, a certain actress’ body of work, or for the films released in a specific year.
            </p>
          </div>
        </div>
        <h3>Films</h3>
        <Link to={'/film/new'}>
          <button>Add a Film</button>
        </Link>
        <div className='row'>
          <FilmList films={this.state.films} />
        </div>
        <p>
          If you have any suggestions for how to grow the application, we would love to hear from <a target="blank" href="https://www.callmejoe.net/contact/">you</a>.
        </p>
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
