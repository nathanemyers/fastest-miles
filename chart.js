/* jshint esnext: true */

var margin = {top: 20, right: 60, bottom: 50, left: 100};
var width = 960 - margin.left - margin.right;
var height = 600 - margin.top - margin.bottom;

var xDomain = [new moment('April 25 1885', 'MMMM DD YYYY'), new moment()];

function min2sec(time) {
  var [min, sec] = time.split(':');
  return (min * 60) + Number(sec);
}

function* generateId() {
  var id = 0;
  while (true) {
    yield id++;
  }
}
var gen = generateId();

var csvParser = function(d) {
  return {
    id: 'point' + gen.next().value,
    seconds: min2sec(d.Time),
    minutes: d.Time,
    name: d.Name,
    country: d.Country,
    year: new moment(d.Year, 'MMMM DD YYYY')
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
    .domain(xDomain)
    .range([margin.left, margin.left + width]);

  var y = d3.scaleLinear()
    //.domain(d3.extent(indoorWorldMen, d => d.time).reverse())
    .domain([320, 220])
    .range([margin.top, margin.top + height]);

  var line = d3.line()
    .curve(d3.curveStepAfter)
    .x(d => x(d.year))
    .y(d => y(d.seconds));

  var allRecords = indoorWorldMen.concat(indoorWorldWomen, outdoorWorldMen, outdoorWorldWomen);
  var voronoi = d3.voronoi()
    .x(d => x(d.year))
    .y(d => y(d.seconds))
    .extent([[margin.left, margin.top], 
      [margin.left + width, margin.top + height]]);

  var svg = d3.select('.chart-container').append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom);

  var xAxis = d3.axisBottom(x);
  var yAxis = d3.axisLeft(y)
    .tickFormat(d => {
      var m = moment.duration(d, 'seconds');
      var seconds = m.seconds();
      if (seconds < 10) {
        seconds = '0' + seconds;
      }
      return `${m.minutes()}:${seconds}`;
    });

  var gX = svg.append('g')
    .attr('transform', `translate(0, ${margin.top + height})`)
    .call(xAxis);

  var gY = svg.append('g')
    .attr('transform', `translate(${margin.left},0)`)
    .call(yAxis);

  function addLine(data, cssClass) {
    var handle = svg.append('g')
      .attr('class', cssClass);
    handle.append('path')
      .datum(data)
      .attr('class', 'line')
      .attr('d', d => line(d));
    handle.append('path')
      .datum(data[data.length - 1])
      .attr('class', 'tail line')
      .attr('d', d => `M${x(d.year)},${y(d.seconds)}L${x(xDomain[1])},${y(d.seconds)}`);
    handle.selectAll('circle')
      .data(data)
      .enter().append('circle')
      .attr("id", d => d.id)
      .attr("cy", d => y(d.seconds))
      .attr("cx", d => x(d.year))
      .attr("r", '5');
    return handle;
  }

  var outdoorMen = addLine(outdoorWorldMen, 'outdoor-men');
  var outdoorWomen = addLine(outdoorWorldWomen, 'outdoor-women');
  var indoorMen = addLine(indoorWorldMen, 'indoor-men');
  var indoorWomen = addLine(indoorWorldWomen, 'indoor-women');

  /*
   * Axis Labels
   */
  svg.append('text')
    .attr('class', 'axis-label')
    .text('Time')
    .attr('transform',`rotate(-90) translate(-${margin.top + (height / 2)}, ${margin.left / 2})`);

  svg.append('text')
    .attr('class', 'axis-label')
    .text('Year')
    .attr('transform',`translate(${margin.left + (width / 2)}, ${margin.top + height + (margin.bottom )})`);
  /*
   * Legend
   */

  function legendEntry(hostElement, title, cssClass) {
    var entry = hostElement.append('g');
    entry.append('path')
      .attr('d', 'M2,6H10V14H18')
      .attr('class', cssClass + ' line');
    entry.append('text')
      .text(title)
      .attr('class', 'legend-title')
      .attr('transform', 'translate(25,15)');
    return entry;
  }
  var legend = svg.append('g')
      .attr('class', 'legend')
      .attr('transform', `translate(${margin.left + 50}, ${margin.top + 50})`);
  legendEntry(legend, "Women's Indoor Mile", 'indoor-women');
  legendEntry(legend, "Women's Outdoor Mile", 'outdoor-women')
    .attr('transform', 'translate(0, 25)');
  legendEntry(legend, "Men's Indoor Mile", 'indoor-men')
    .attr('transform', 'translate(0, 50)');
  legendEntry(legend, "Men's Outdoor Mile", 'outdoor-men')
    .attr('transform', 'translate(0, 75)');
    

  /*
   * Tooltip stuff
   */
  var tip = d3.tip()
    .attr('class', 'tooltip')
    .html(d => `
    <img class='flag' src='assets/${d.data.country}.svg'></img>
    <div class='tooltip-data'>
      <div class='name'>${d.data.name}</div>
      <div class='year'>${d.data.year.format('MMMM D, YYYY')}</div>
      <div class='time'><i class="fa fa-clock-o" aria-hidden="true"></i> ${d.data.minutes}</div>
    </div>
    `);

  svg.call(tip);

  svg.selectAll('.voronoi')
    .data(voronoi.polygons(allRecords))
    .enter().append('g')
      .attr('class', 'voronoi')
    .append('path')
      .attr('d', d => d ? "M" + d.join("L") + "Z" : null)
      .on('mouseover', (d) => {
        var bubble = document.getElementById(d.data.id);
        TweenMax.fromTo(`#${d.data.id}`, 0.2, {
          scale: 0
        }, {
          ease: Back.easeOut.config(4),
          opacity: 1,
          scale: 1
        });
        if (d.data.seconds > 300) {
          tip.offset([15,0]);
          tip.direction('s');
        } else if (d.data.year < new moment('January 30 1906', 'MMMM DD YYYY') ) {
          tip.offset([0,15]);
          tip.direction('e');
        } else if (d.data.year > new moment('January 30 2000', 'MMMM DD YYYY')) {
          tip.offset([0,-15]);
          tip.direction('w');
        } else {
          tip.direction('n');
          tip.offset([-15,0]);
        }
        tip.show(d, bubble);
      })
    .on('mouseout', (d) => {
      TweenMax.to(`#${d.data.id}`, 0.2, {
        scale: 0
      });
      tip.hide();
    });

}
