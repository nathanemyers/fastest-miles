/* jshint esnext: true */

var margin = {top: 20, right: 60, bottom: 50, left: 100};
var width = 960 - margin.left - margin.right;
var height = 600 - margin.top - margin.bottom;

function parseTime(time) {
  var [min, sec] = time.split(':');
  return (min * 60) + Number(sec);
}

var csvParser = function(d) {
  return {
    time: parseTime(d.Time),
    name: d.Name,
    country: d.Country,
    year: new Date(d.Year)
  };
};

var indoorWorldMen;
var indoorWorldWomen;
var outdoorWorldMen;
var outdoorWorldWomen;

window.ondload = d3.queue()
  .defer(callback => d3.csv('data/indoor-world-men.csv', csvParser, function(data) {
    indoorWorldMen = data;
    callback(null);
  }))
  .defer(callback => d3.csv('data/indoor-world-women.csv', csvParser, function(data) {
    indoorWorldWomen = data;
    callback(null);
  }))
  .defer(callback => d3.csv('data/outdoor-world-men.csv', csvParser, function(data) {
    outdoorWorldMen = data;
    callback(null);
  }))
  .defer(callback => d3.csv('data/outdoor-world-women.csv', csvParser, function(data) {
    outdoorWorldWomen = data;
    callback(null);
  }))
  .await(buildChart);

function buildChart() {
  console.log(indoorWorldMen);
  console.log(indoorWorldWomen);
  var allRecords = indoorWorldMen.concat(indoorWorldWomen, outdoorWorldMen, outdoorWorldWomen);

  var x = d3.scaleTime()
    //.domain(d3.extent(indoorWorldMen, d => d.year))
    .domain([new Date('April 25 1885'), new Date()])
    .range([margin.left, margin.left + width]);

  var y = d3.scaleLinear()
    //.domain(d3.extent(indoorWorldMen, d => d.time).reverse())
    .domain([320, 220])
    .range([margin.top, margin.top + height]);


  var line = d3.line()
    .x(d => x(d.year))
    .y(d => y(d.time));

  var voronoi = d3.voronoi()
    .x(d => x(d.year))
    .y(d => y(d.time))
    .size([width, height]);

  var svg = d3.select('.chart-container').append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom);

  var xAxis = d3.axisBottom(x);
  var yAxis = d3.axisLeft(y);

  var gX = svg.append('g')
    .attr('transform', `translate(0, ${margin.top + height})`)
    .call(xAxis);

  var gY = svg.append('g')
    .attr('transform', `translate(${margin.left},0)`)
    .call(yAxis);

  svg.append('path')
      .datum(indoorWorldMen)
      .attr('d', d => line(d))
      .style('fill', 'none')
      .style('stroke', 'steelblue');

  svg.append('path')
      .datum(indoorWorldWomen)
      .attr('d', d => line(d))
      .style('fill', 'none')
      .style('stroke', 'red');

  svg.append('path')
      .datum(outdoorWorldMen)
      .attr('d', d => line(d))
      .style('fill', 'none')
      .style('stroke', 'purple');

  svg.append('path')
      .datum(outdoorWorldWomen)
      .attr('d', d => line(d))
      .style('fill', 'none')
      .style('stroke', 'orange');

  svg.selectAll('.record-break')
    .data(allRecords)
    .enter().append('circle')
      .attr("cy", d => y(d.time))
      .attr("cx", d => x(d.year))
      .attr("r", '3')
      .style('fill', 'black');

  svg.selectAll('.voronoi')
    .data(voronoi.polygons(allRecords))
    .enter().append('g')
      .attr('class', 'voronoi')
    .append('path')
      .attr('d', d => d ? "M" + d.join("L") + "Z" : null);

}
