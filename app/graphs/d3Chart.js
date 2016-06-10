import d3 from 'd3';

const node = document.createElement('div');

const width = 960;
const height = 250;
const barHeight = 35;
const barOffset = 5;

const data = [400, 800, 1050, 200, 270, 420];

const x = d3.scale.linear()
    .domain([0, d3.max(data)])
    .range([0, 420]);

const circle1 = d3.select(node)
  .append('svg')
    .attr('width', width)
    .attr('height', height)
    .style('background', '#f4f4f4')
  .selectAll('rect')
    .data(data)
  .enter().append('rect')
    .style('width', (d) => { return x(d) + 'px' })
    .style('height', barHeight)
    .style('fill', 'green')
    .attr('y', (d, i) => { return i * (barHeight + barOffset) })
    // .attr('x', function(d, i) { return width })
    .text((d) => d);


export default node;
