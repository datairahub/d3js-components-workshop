import { select, selectAll, pointer } from 'd3-selection';
import { scaleLinear, scaleTime } from 'd3-scale';
import { min, max, extent } from 'd3-array';
import { line } from 'd3-shape';
import { axisLeft, axisBottom } from 'd3-axis';
import d3chart from '../d3.chart';

const d3 = {
  select,
  selectAll,
  pointer,
  scaleLinear,
  scaleTime,
  min,
  max,
  extent,
  line,
  axisLeft,
  axisBottom,
};

/**
 * Displays a line chart
 *
 * @param {htmlNode} selection vue ref element: this.$refs.my_selected_node
 * @param {object} data data to represent
 * @param {object} config extra configuration parameters
 *
 * Required data format = [
 *   { id: Any, values: [{x: Date, y: Number}, {x: Date, y: Number}] },
 * ]
 */
export default class extends d3chart {
  constructor(selection, data, config) {
    super(selection, data, config, {
      class: 'linechart',
      margin: {
        top: 20,
        right: 20,
        bottom: 20,
        left: 20,
      },
      color: 'steelblue', // Accepts strings, array or object
      attrs: {},
      styles: {},
      curve: null, // Accepts d3-line curve functions like curveLinear https://github.com/d3/d3-shape#curveLinear
      scales: {
        xMinOverride: null,
        xMaxOverride: null,
        yMinOverride: null,
        yMaxOverride: null,
      },
      axis: {
        yFormat: (d) => d,
        xFormat: (d) => d.getUTCFullYear(),
        yTicks: 10,
        xTicks: 5,
      },
      tooltip: null, // Accepts function
      click: null, // Accepts function
    });
  }

  /**
   * Init chart
   */
  initChart() {
    // Set up dimensions
    this.initChartFrame(this.cfg.class);

    // Init scales
    this.yScale = d3.scaleLinear();
    this.xScale = d3.scaleTime();
    this.line = d3.line();

    // Axis group
    this.axisg = this.g.append('g').attr('class', `chart__axis chart__axis--${this.cfg.class}`);

    // Horizontal grid
    this.yGrid = this.axisg
      .append('g')
      .attr('class', `chart__grid chart__grid--y chart__grid--${this.cfg.class}`);

    // Bottom axis
    this.xAxis = this.axisg
      .append('g')
      .attr('class', `chart__axis-x chart__axis-x--${this.cfg.class}`);

    // Vertical axis
    this.yAxis = this.axisg
      .append('g')
      .attr('class', `chart__axis-y chart__axis-y--${this.cfg.class} chart__grid`);

    this.setChartDimension();
    this.updateChart();
  }

  /**
   * Bind data to main elements groups
   */
  bindData() {
    // Lines group
    this.linesgroup = this.g.selectAll('.chart__lines-group').data(this.data, (d) => d.id);
  }

  /**
   * Set up scales
   */
  setScales() {
    const flatData = this.data.flatMap((d) => d.values);
    const yMin = this.cfg.scales.yMinOverride === null
      ? d3.min(flatData, (d) => d.y)
      : this.cfg.scales.yMinOverride;
    const yMax = this.cfg.scales.yMaxOverride === null
      ? d3.max(flatData, (d) => d.y)
      : this.cfg.scales.yMaxOverride;
    const xMin = this.cfg.scales.xMinOverride === null
      ? d3.min(flatData, (d) => d.x)
      : this.cfg.scales.xMinOverride;
    const xMax = this.cfg.scales.xMaxOverride === null
      ? d3.max(flatData, (d) => d.x)
      : this.cfg.scales.xMaxOverride;

    // Calcule vertical scale
    this.yScale.domain([yMin, yMax]).rangeRound([this.cfg.height, 0]);

    // Calcule horizontal scale
    this.xScale.domain([xMin, xMax]).rangeRound([0, this.cfg.width]);

    // Set up line function
    this.line.x((d) => this.xScale(d.x)).y((d) => this.yScale(d.y));

    if (this.cfg.curve) this.line.curve(this.cfg.curve);

    // Redraw grid
    this.yGrid.call(
      d3
        .axisLeft(this.yScale)
        .tickSize(-this.cfg.width)
        // .tickValues(this.calcTicksValues(
        //   this.cfg.axis.yTicks,
        //   this.yScale.domain()[0],
        //   this.yScale.domain()[1],
        // ))
        .tickFormat(this.cfg.axis.yFormat),
    );

    // Redraw horizontal axis
    this.xAxis
      .attr('transform', `translate(0,${this.cfg.height})`)
      .call(d3.axisBottom(this.xScale).tickFormat(this.cfg.axis.xFormat));
  }

  /**
   * Add new chart's elements
   */
  enterElements() {
    // Elements to add
    const linegroups = this.linesgroup
      .enter()
      .append('g')
      .attr('class', `chart__lines-group chart__lines-group--${this.cfg.class}`);

    linegroups
      .append('path')
      .attr('class', `chart__line chart__line--${this.cfg.class}`)
      .attr('d', (d) => this.line(d.values));

    Object.keys(this.cfg.attrs).forEach((key) => {
      linegroups.attr(key, this.cfg.attrs[key]);
    });

    Object.keys(this.cfg.styles).forEach((key) => {
      linegroups.style(key, this.cfg.styles[key]);
    });

    linegroups
      .on('click', (event, d) => {
        if (!this.cfg.click) return;
        this.cfg.click(event, d);
      })
      .on('mouseover', (event, d) => {
        if (!this.cfg.tooltip) return;
        this.tooltip.html(`<div>${this.cfg.tooltip(event, d)}</div>`).classed('active', true);
      })
      .on('mouseout', () => {
        if (!this.cfg.tooltip) return;
        this.tooltip.classed('active', false);
      })
      .on('mousemove', (event) => {
        if (!this.cfg.tooltip) return;
        const pos = d3.pointer(event, this.selection.node());
        const selectionwidth = this.selection.node().getBoundingClientRect().width;
        const tooltipSizes = this.tooltip.node().getBoundingClientRect();
        const left = pos[0] > selectionwidth / 2 ? pos[0] - tooltipSizes.width - 10 : pos[0] + 10;
        this.tooltip
          .style('left', `${left}px`)
          .style('top', `${pos[1] - tooltipSizes.height / 2}px`);
      });
  }

  /**
   * Update chart's elements based on data change
   */
  updateElements() {
    // Redraw lines
    this.g
      .selectAll('.chart__line')
      .attr('stroke', (d) => this.colorElement(d))
      .attr('d', (d) => this.line(d.values));
  }

  /**
   * Remove chart's elements without data
   */
  exitElements() {
    this.linesgroup.exit().style('opacity', 0).remove();
  }
}
