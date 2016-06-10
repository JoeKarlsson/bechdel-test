import React from 'react';
import { Link } from 'react-router';
import styles from './Film.scss';
import * as $ from 'jquery';
import Chart from '../../graphs/Chart.jsx';

class Film extends React.Component {
  constructor() {
    super();
    this.state = {
      film: {
        title: '',
        images: {
          poster: '',
          backdrop: '',
        },
        plot: '',
        directors: [],
        writers: [],
        genres: [],
        rated: '',
        bechdelResults: {
          pass: 'false',
          bechdelScore: 0,
          numScenesPass: 0,
          scenesThatPass: [],
          numScenesDontPass: 0,
          numOfFemalesChars: 0,
          numOfMaleChars: 0,
          numOfFemalesCharsWithDialogue: 0,
          numOfMaleCharsWithDialogue: 0,
          totalLinesFemaleDialogue: 0,
          totalLinesMaleDialogue: 0,
        },
      },
    };
    this.getFilm = this.getFilm.bind(this)
  }

  getFilm() {
    $.ajax({
      url: "/api/film/" + this.props.params.id,
      method: 'GET',
      dataType: 'json',
      cache: false,
      success: function(data) {
        this.setState({ film: data });
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
    const directorNode = this.state.film.directors.map((director) => {
      const directors = this.state.film.directors;
      if ( director.name === directors[directors.length-1].name) {
        return (
          <span key={director.id}>{director.name}</span>
        );
      }
      return (
        <span key={director.id}>{director.name} & </span>
      );
    });
    const writerNode = this.state.film.writers.map((writer) => {
      const writers = this.state.film.writers;
      if ( writer.name !== writers[writers.length-1].name) {
        return (
          <span key={writer.id}>{writer.name} & </span>
        );
      } else {
        return (
          <span key={writer.id}>{writer.name}</span>
        );
      }
    });
    const genreNode = this.state.film.genres.map((genre) => {
      const genres = this.state.film.genres;
      if ( genre !== genres[genres.length-1]) {
        return (
          <span key={Math.floor(Math.random()*100)}>{genre} | </span>
        );
      } else {
        return (
          <span key={Math.floor(Math.random()*100)}>{genre}</span>
        );
      }
    });
    return (
      <div>
        <h1>{this.state.film.title}</h1>
        <h3>Bechdel Pass: {this.state.film.bechdelResults.pass.toString().toUpperCase()}</h3>
        <p>Bechdel Score: {this.state.film.bechdelResults.bechdelScore} of 3</p>
        <img
          src={this.state.film.images.backdrop}
          alt={this.state.film.title}
        />
        <p>Directors: {directorNode}</p>
        <p>Writers: {writerNode}</p>
        <p>Genre: {genreNode}</p>
        <p>Rated: {this.state.film.rated}</p>
        <p>IMDB: <a href={`http://www.imdb.com/title/${this.state.film.idIMDB}`} target='_blank'>{this.state.film.title}</a></p>
        <p>Bechdel Score: {this.state.film.bechdelResults.bechdelScore} of 3</p>
        <p>Number of Scenes that pass: {this.state.film.bechdelResults.numScenesPass}</p>
        <p>Number of Scenes that dont pass: {this.state.film.bechdelResults.numScenesDontPass}</p>
        <p>Number Of Females Characters: {this.state.film.bechdelResults.numOfFemalesChars}</p>
        <p>Number Of Male Characters: {this.state.film.bechdelResults.numOfMaleChars}</p>
        <p>Number of Females Characters With Dialogue: {this.state.film.bechdelResults.numOfFemalesCharsWithDialogue}</p>
        <p>Number of Male Characters With Dialogue: {this.state.film.bechdelResults.numOfMaleCharsWithDialogue}</p>
        <p>Total Lines of Female Dialogue: {this.state.film.bechdelResults.totalLinesFemaleDialogue}</p>
        <p>Total Lines of Male Dialogue: {this.state.film.bechdelResults.totalLinesMaleDialogue}</p>
        <p>{this.state.film.plot}</p>

        <Chart />
        <Link to={'/'}><button>All Films</button></Link>
      </div>
    )
  }
}

Film.propTypes = {
  film: React.PropTypes.object,
};

export default Film;
