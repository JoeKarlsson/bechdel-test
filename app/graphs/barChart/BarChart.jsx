import React from 'react';
import node from './d3BarChart';
import rd3 from 'react-d3-library';
const RD3Component = rd3.Component;

class BarChart extends React.Component {
  constructor() {
    super();
    this.state = {
        d3: '',
    };
  };

  componentDidMount() {
    this.setState({d3: node});
  };

  render() {
    return (
      <div>
        <RD3Component data={this.state.d3} />
      </div>
    );
  };
};

BarChart.propTypes = {
  d3: React.PropTypes.string,
};

BarChart.defaultProps = {
  d3: '',
};

export default BarChart;