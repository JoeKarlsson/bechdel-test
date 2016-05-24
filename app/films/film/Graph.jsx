import React from 'react';
import styles from './graph.jsx.scss';
import * as $ from'jquery';

class Graph extends React.Component {
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

  render() {
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

Graph.propTypes = {
  film: React.PropTypes.object,
};

export default Graph;
