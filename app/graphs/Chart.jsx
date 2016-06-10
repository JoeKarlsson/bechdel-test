import React from 'react';
import node from './d3Chart';
import rd3 from 'react-d3-library';
const RD3Component = rd3.Component;

module.exports = React.createClass({

  getInitialState: function() {
    return {d3: ''}
  },

  componentDidMount: function() {
    this.setState({d3: node});
  },

  render: function() {
    return (
      <div>
        <RD3Component data={this.state.d3} />
      </div>
    )
  }
});