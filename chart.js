/* jshint esnext: true */

var margin = {top: 20, right: 60, bottom: 50, left: 100};
var width = 960 - margin.left - margin.right;
var height = 600 - margin.top - margin.bottom;

function min2sec(time) {
  var [min, sec] = time.split(':');
  return (min * 60) + Number(sec);
}

function sec2min(time) {
  var min = Math.floor(time / 60);
  var sec = time % 60;
  return `${min}:${sec}`;
}

var csvParser = function(d) {
  return {
    time: min2sec(d.Time),
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

  var allRecords = indoorWorldMen.concat(indoorWorldWomen, outdoorWorldMen, outdoorWorldWomen);
  var voronoi = d3.voronoi()
    .x(d => x(d.year))
    .y(d => y(d.time))
    .extent([[margin.left, margin.top], 
      [margin.left + width, margin.top + height]]);

  var tip = d3.tip()
    .attr('class', 'tooltip')
    .html(d => `
    <div class='name'>${d.data.name} - ${d.data.country}</div>
    <img class='flag' width='100px' src='assets/${d.data.country}.svg'></img>
    <div class='time'>${d.data.time}</div>
    <div class='year'>${d.data.year}</div>
    `);

  var svg = d3.select('.chart-container').append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom);

  var xAxis = d3.axisBottom(x);
  var yAxis = d3.axisLeft(y)
    .tickFormat(sec2min);

  var gX = svg.append('g')
    .attr('transform', `translate(0, ${margin.top + height})`)
    .call(xAxis);

  var gY = svg.append('g')
    .attr('transform', `translate(${margin.left},0)`)
    .call(yAxis);

  var indoorMen = svg.append('g')
      .attr('class', 'indoor-men');
  indoorMen.selectAll('circle')
    .data(indoorWorldMen)
    .enter().append('circle')
      .attr("cy", d => y(d.time))
      .attr("cx", d => x(d.year))
      .attr("r", '3');
  indoorMen.append('path')
      .datum(indoorWorldMen)
      .attr('d', d => line(d));

  var indoorWomen = svg.append('g')
      .attr('class', 'indoor-women');
  indoorWomen.selectAll('circle')
    .data(indoorWorldWomen)
    .enter().append('circle')
      .attr("cy", d => y(d.time))
      .attr("cx", d => x(d.year))
      .attr("r", '3');
  indoorWomen.append('path')
      .datum(indoorWorldWomen)
      .attr('d', d => line(d));

  var outdoorMen = svg.append('g')
      .attr('class', 'outdoor-men');
  outdoorMen.selectAll('circle')
    .data(outdoorWorldMen)
    .enter().append('circle')
      .attr("cy", d => y(d.time))
      .attr("cx", d => x(d.year))
      .attr("r", '3');
  outdoorMen.append('path')
      .datum(outdoorWorldMen)
      .attr('d', d => line(d));

  var outdoorWomen = svg.append('g')
      .attr('class', 'outdoor-women');
  outdoorWomen.selectAll('circle')
    .data(outdoorWorldWomen)
    .enter().append('circle')
      .attr("cy", d => y(d.time))
      .attr("cx", d => x(d.year))
      .attr("r", '3');
  outdoorWomen.append('path')
      .datum(outdoorWorldWomen)
      .attr('d', d => line(d));

  svg.call(tip);

  svg.selectAll('.voronoi')
    .data(voronoi.polygons(allRecords))
    .enter().append('g')
      .attr('class', 'voronoi')
    .append('path')
      .attr('d', d => d ? "M" + d.join("L") + "Z" : null)
      .on('mouseover', (d) => {
        tip.show(d);
      })
      .on('mouseout', tip.hide);

}
