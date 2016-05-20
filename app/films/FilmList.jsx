import React from 'react';
import FilmItem from './FilmItem.jsx';
import styles from './FilmList.scss';

class FilmList extends React.Component {
  render() {
    let filmListNode = this.props.films.map((filmData) => {
      return (
        <FilmItem
          film={filmData}
          key={filmData._id}
          className={styles.filmListNode}
        />
      );
    });

    return (
      <div className={styles.FilmList}>
        {filmListNode}
      </div>
    );
  }
}

FilmList.propTypes = {
  films: React.PropTypes.array,
};

FilmList.defaultProps = {
  films: [],
};

export default FilmList;
