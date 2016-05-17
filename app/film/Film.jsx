/* jshint esversion: 6 */
'use strict';

import React from 'react';
import { Link } from 'react-router';
import styles from './Film.scss';

export default React.createClass({
  render() {
    return (
      <div>Film {this.props.params.id}</div>
    )
  }
});