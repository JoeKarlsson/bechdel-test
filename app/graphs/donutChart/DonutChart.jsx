import React from 'react';
import node from './d3DonutChart';
import rd3 from 'react-d3-library';
const RD3Component = rd3.Component;

class DonutChart extends React.Component {
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
        <RD3Component 'data={this.state.d3} />
      </div>
    );
  };
};

DonutChart.propTypes = {
  d3: React.PropTypes.string,
};

DonutChart.defaultProps = {
  d3: '',
};

export default DonutChart;