import * as d3 from 'd3';

const baseColor = '#42B79C';
const maxGradientColor = '#43C6A8';
const textColor = '#979797';
const textHighlightColor = '#00CBA6';
const textFontSize = '11px';
const yStrokeColor = '#282828';
const yStrokeDash = "6, 3";
const xAxisOffset = 20;

const SPREAD_VALUES_COUNT = 11;
const CHART_OFFSET = 50;

function prepareData(data) {
  const keys = Object.keys(data);
  const allIndex = keys.indexOf('all');
  keys.splice(allIndex, 1);

  const items = keys
    .map(x => ({
      label: x,
      value: data[x],
    })).sort((firstValue, secondValue) => {
      const firstDigit = parseInt(firstValue.label.split('-')[0], 10);
      const secondDigit = parseInt(secondValue.label.split('-')[0], 10);
      return firstDigit - secondDigit;
    });


  return {
    items,
    keys
  };
}

function calculateBigPartSpreadValues(count) {
  return [
    0,
    count / 5 - count / 5.1,
    count / 4 - count / 5,
    count / 2 - count / 6,
    count - count / 12,
    count,
    count - count / 12,
    count / 2 - count / 6,
    count / 4 - count / 5,
    count / 5 - count / 5.1,
    0
  ];
}

function calculateSmallPartSpreadValues(count) {
  return [
    0,
    count / 5 - count / 5.1,
    count / 4 - count / 5,
    count / 2 - count / 6,
    count - count / 8,
    count,
    count - count / 8,
    count / 2 - count / 6,
    count / 4 - count / 5,
    count / 5 - count / 5.1,
    0
  ];
}

function calculateSpreadRange(partWidth) {
  return partWidth + partWidth * 2 / 3;
}

function buildTooltip(group, count, yScale, percent, additionalClass) {
  const fo = group
    .append('foreignObject');

  const {width} = group.node().getBBox();

  const wrapperWidth = 56;
  const wrapperHeight = 40;
  const tooltip = fo
    .attr('width', wrapperWidth)
    .attr('height', wrapperHeight)
    .attr('x', (width - wrapperWidth) / 2)
    .attr('y', yScale(count) - wrapperHeight)
    .append("xhtml:div");

  tooltip
    .classed('spreading-chart__tooltip', true)
    .classed(additionalClass, true);


  tooltip.append('div')
    .attr('class', 'spreading-chart__container')
    .append('div')
    .attr('class', 'spreading-chart__content')
    .html((percent * 100).toFixed(2) + '%');

  tooltip
    .append('div')
    .attr('class', 'spreading-chart__arrow')


}

function buildAxis({
                     yScale,
                     xScale,
                     items,
                   }) {
  const yAxis = d3.axisRight(yScale);
  const xAxis = d3.axisBottom(xScale)
    .tickFormat((x) => {
      return items[x] ? items[x].label : '';
    })
    .tickSize(0, 6, 0);
  return {
    yAxis,
    xAxis
  }
}

function renderAxis({svg, marginLeft, xAxis, height, maxValue, yAxis, partWidth, width}) {
  const xAxisElement = svg.append("g")
    .attr("class", "spreading-chart___x-axis")
    .attr('transform', `translate(${marginLeft}, ${height - xAxisOffset})`)
    .call(xAxis);

  xAxisElement.select('path').attr('stroke', baseColor);
  xAxisElement
    .selectAll('text')
    .attr('color', textColor)
    .style('fontSize', textFontSize);

  const yAxisElement = svg.append("g")
    .attr("class", "spreading-chart___y-axis")
    .style("stroke-dasharray", yStrokeDash)
    .call(
      yAxis
        .tickValues([0, maxValue * (1 / 3), maxValue * (2 / 3), maxValue])
        .tickSize(width)
    );

  yAxisElement.selectAll('line').attr('stroke', yStrokeColor);


  yAxisElement.selectAll('text').remove();
  yAxisElement.selectAll('path').remove();
  yAxisElement.selectAll('g:first-of-type').remove();

  xAxisElement.selectAll('line').remove();

  xAxisElement
    .selectAll('g')
    .attr('transform', 'translate(0, 0)')
    .selectAll('text')
    .attr('class', 'spreading-chart___x-axis-text')
    .attr('x', (value) => {
      return (value + 1) * calculateSpreadRange(partWidth) / 2 - marginLeft / 2;
    })
    .attr('y', (value) => {
      let yOffset = 15;
      if (width <= 400 && value % 2 === 0) {
        yOffset = 24;
      }
      return yOffset;
    });

  return {
    xAxisElement,
    yAxisElement,
  }
}

function selectAxisLabel(position) {
  return d3.select('.spreading-chart___x-axis')
    .selectAll('text')
    .filter(function (x, i) {
      return i === position;
    });
}

function renderSpread({
                        svg,
                        lineScale,
                        items,
                        partWidth,
                        yScale,
                        maxValue,
                      }) {
  items.forEach(({value: {count, percent}}, i) => {
    const values = count >= maxValue / 2 ? calculateBigPartSpreadValues(count) : calculateSmallPartSpreadValues(count);
    const partOffset = i > 0 ? partWidth / 6 : 0;

    const group = svg
      .append('g')
      .attr('transform', `translate(${(partWidth - partOffset) * i}, 0)`);

    group.append("path")
      .datum(values)
      .attr("class", "spreading-chart___spread")
      .attr('fill', baseColor)
      .attr("fill-opacity", 1 - i / (items.length - 1))
      .attr("stroke", "url(#spreading-chart___linear-gradient)")
      .attr('stroke-width', '1px')
      .attr("d", lineScale)
      .on('mouseover', () => {
        selectAxisLabel(i)
          .style("font-weight", "bold")
          .style("color", textHighlightColor);
        if (maxValue !== count) {
          buildTooltip(group, count, yScale, percent, 'spreading-chart__tooltip--active');
        }
        if (maxValue === count) {
          group.select('.spreading-chart__tooltip').classed('spreading-chart__tooltip--active', true);
        }
      })
      .on('mouseout', function () {
        selectAxisLabel(i)
          .style("font-weight", "normal")
          .style("color", textColor);
        if (maxValue !== count) {
          group.select('.spreading-chart__tooltip').remove();
        }
        if (maxValue === count) {
          group.select('.spreading-chart__tooltip').classed('spreading-chart__tooltip--active', false);
        }
      });

    if (maxValue === count) {
      buildTooltip(group, count, yScale, percent);
    }
  })
}

function addGradient(svg) {
  const colorScale = d3.scaleLinear().range([baseColor, maxGradientColor]).domain([1, 2]);
  const linearGradient = svg.append("defs")
    .append("linearGradient")
    .attr("id", "spreading-chart___linear-gradient")
    .attr("gradientTransform", "rotate(90)");

  linearGradient.append("stop")
    .attr("offset", "0%")
    .attr("stop-color", colorScale(1));

  linearGradient.append("stop")
    .attr("offset", "100%")
    .attr("stop-color", colorScale(2));
}

export function spreadingChart({
                                 data, width = 510, height = 255, selector
                               }) {
  // remove prev chart
  d3.select(selector).selectAll('*').remove();

  /*calculate data*/
  const {items, keys} = prepareData(data);
  const maxValue = Math.max(...items.map(x => x.value.count));
  const actualWidth = width - CHART_OFFSET;
  const actualHeight = height - 30;
  const marginLeft = CHART_OFFSET / 2;

  const partWidth = actualWidth / (items.length - 1);

  /*calculate metrics*/
  const xScale = d3.scaleLinear()
    .domain([0, keys.length])
    .range([0, actualWidth]);

  const xPartScale = d3.scaleLinear()
    .domain([0, SPREAD_VALUES_COUNT - 1])
    .range([0, calculateSpreadRange(partWidth)]);

  const yScale = d3.scaleLinear()
    .range([actualHeight - 20, 0])
    .domain([0, maxValue]);

  const lineScale = d3.line()
    .x((d, i) => xPartScale(i))
    .y((d) => yScale(d))
    .curve(d3.curveCatmullRom);

  /*calculate axis*/
  const {yAxis, xAxis} = buildAxis({yScale, xScale, items});

  const chartContainer = d3.select(selector)
    .append('svg')
    .attr("class", "spreading-chart");

  const svg = chartContainer.data(items)
    .attr('width', width)
    .attr('height', height)
    .append('g');

  addGradient(chartContainer);

  renderAxis({svg, marginLeft, xAxis, height: actualHeight, maxValue, yAxis, partWidth, width});

  const spreadingGroup = svg.append('g')
    .attr('transform', `translate(${marginLeft / 2}, 0)`)
    .attr("class", "spreading-chart___spreadGroup")
    .attr('width', actualWidth);

  renderSpread({
    svg: spreadingGroup, lineScale, items, partWidth, yScale, maxValue
  });
}
