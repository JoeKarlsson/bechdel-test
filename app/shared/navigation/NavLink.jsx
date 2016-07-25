import React from 'react';
import { Link } from 'react-router';
import styles from './NavLink.scss';

class NavLink extends React.Component {
  render() {
    return <Link {...this.props} activeClassName={styles.active}/>;
  }
}

export default NavLink;
