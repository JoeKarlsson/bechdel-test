import React from 'react';
import { Link } from 'react-router';
import styles from './FilmItem.scss';

class FilmItem extends React.Component {
  render() {
    return (
      <div className={styles.filmItem}>
        <li className={styles.filmItem_ListItem}>
          <div>
            <Link
              className={styles.gist_description}
              to={`/film/${this.props.film._id}`}
            >
              <img
                src={this.props.film.images.poster}
                alt={this.props.film.title}
              />
              <p className={styles.filmItem_title}>
                {this.props.film.title}
              </p>
            </Link>
          </div>
        </li>
      </div>
    );
  }
}

FilmItem.propTypes = {
  film: React.PropTypes.object,
};

FilmItem.defaultProps = {
  film: {
    title: 'Movie Title',
    images: {
      poster: 'Movie Poster URL',
    },
    id: '123456',
  },
};

export default FilmItem;
