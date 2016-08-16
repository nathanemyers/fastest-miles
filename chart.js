/* jshint esnext: true */

var margin = {top: 0, right: 60, bottom: 50, left: 100};
var width = 960 - margin.left - margin.right;
var height = 600 - margin.top - margin.bottom;

//var x = d3.scaleLinear()
  //.domain([current_x_min, current_x_min + 10])
  //.range([dataMargin.left, dataWidth]);

//var y = d3.scaleLinear()
  //.domain([1, 30])
  //.range([dataMargin.top, dataHeight]);

//var line = d3.line()
  //.curve(d3.curveMonotoneX)
  //.x(d => x(d.week))
  //.y(d => y(d.rank));

var csvParser = function(d) {
  return {
    time: d.Time,
    name: d.Name,
    country: d.Country,
    year: new Date(d.Year)
  };
};

var indoorWorldMen;

window.onload = function() {
  d3.csv('data/indoor-world-men.csv', csvParser, function(data) {
    indoorWorldMen = data;
  });
};
