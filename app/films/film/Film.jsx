import React from 'react';
import { Link } from 'react-router';
import styles from './Film.scss';
import * as $ from'jquery';

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

        }
      },
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
        <h3>Bechdel Pass: {this.state.film.bechdelResults.pass.toString()}</h3>
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
        <p>{this.state.film.plot}</p>
        <Link to={'/'}><button>All Films</button></Link>
      </div>
    )
  }
}

Film.propTypes = {
  film: React.PropTypes.object,
};

export default Film;
