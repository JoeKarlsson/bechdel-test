import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import './FilmItem.scss';

class FilmItem extends React.Component {
  render() {
    const { film } = this.props;
		const filmUrl = `/film/${this.props.film._id}`;
    console.log('filmUrl', filmUrl);

    return (
      <div className='filmItem'>
        <li className='filmItem_ListItem'>
          <div>
            <Link to={filmUrl} >
              <img
                src={this.props.film.images.poster}
                alt={this.props.film.title}
              />
              <p className='filmItem_title'>{this.props.film.title}</p>
            </Link>
          </div>
        </li>
      </div>
    );
  }
}

FilmItem.propTypes = {
  film: PropTypes.object
};

FilmItem.defaultProps = {
  film: {
    title: 'Movie Title',
    images: {
      poster: 'Movie Poster URL'
    },
    id: '123456'
  }
};

export default FilmItem;
