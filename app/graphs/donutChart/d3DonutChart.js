import d3 from 'd3';

const node = document.createElement('div');

const width = 960;
const height = 500;
const radius = Math.min(width, height) / 2;

const data = [
  { age: '<5', population: 2704659 },
  { age: '5-13', population: 4499890 },
  { age: '14-17', population: 2159981 },
  { age: '18-24', population: 3853788 },
  { age: '25-44', population: 14106543 },
  { age: '45-64', population: 8819342 },
  { age: '≥65', population: 612463 },
];

const color = d3.scale.ordinal()
    .range(['#98abc5', '#8a89a6', '#7b6888', '#6b486b', '#a05d56', '#d0743c', '#ff8c00']);

const arc = d3.svg.arc()
    .outerRadius(radius - 10)
    .innerRadius(radius - 70);

const pie = d3.layout.pie()
    .sort(null)
    .value((d) => { return d.population; });

const svg = d3.select(node)
  .append('svg')
    .attr('width', width)
    .attr('height', height)
    .style('background', '#f4f4f4')
  .append('g')
    .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')');

const g = svg.selectAll('.arc')
    .data(pie(data))
  .enter().append('g')
    .attr('class', 'arc')
    .style('stroke', 'black');

g.append('path')
    .attr('d', arc)
    .style('fill', (d) => { return color(d.data.age); });

g.append('text')
    .attr('transform', (d) => { return 'translate(' + arc.centroid(d) + ')'; })
    .attr('dy', '.35em')
    .text((d) => { return d.data.age; })
    .style('text-anchor', 'middle');

export default node;

