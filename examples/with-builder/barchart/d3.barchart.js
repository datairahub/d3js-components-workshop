import { select, selectAll, pointer } from 'd3-selection';
import { scaleLinear, scaleBand } from 'd3-scale';
import { min, max, extent } from 'd3-array';
import { line } from 'd3-shape';
import { axisLeft, axisBottom } from 'd3-axis';
import d3chart from '../d3.chart';

const d3 = {
  select,
  selectAll,
  pointer,
  scaleLinear,
  scaleBand,
  min,
  max,
  extent,
  line,
  axisLeft,
  axisBottom,
};

/**
 * Displays a grouped bar chart
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
      class: 'stackedchart',
      margin: {
        top: 20,
        right: 20,
        bottom: 20,
        left: 20,
      },
      color: 'steelblue', // Accepts strings, array or object
      attrs: {},
      styles: {},
      scales: {
        xPaddingInner: 0.1,
        xPaddingOuter: 0.1,
        xSubPaddingInner: 0.1,
        xSubPaddingOuter: 0.2,
        yMinOverride: null,
        yMaxOverride: null,
      },
      axis: {
        yFormat: (d) => d,
        xFormat: (d) => d,
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
    this.xScale = d3.scaleBand();
    this.xSubScale = d3.scaleBand();

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
    this.barsgroup = this.g.selectAll('.chart__bars-group').data(this.data, (d) => d.id);
  }

  /**
   * Set up scales
   */
  setScales() {
    const flatData = this.data.flatMap((d) => d.values);

    const yMin = this.cfg.scales.yMinOverride === null
      ? d3.min(flatData, (d) => d.value)
      : this.cfg.scales.yMinOverride;
    const yMax = this.cfg.scales.yMaxOverride === null
      ? d3.max(flatData, (d) => d.value)
      : this.cfg.scales.yMaxOverride;

    const xValues = this.data
      .reduce((acc, curr) => (acc.includes(curr.id) ? acc : acc.concat(curr.id)), []);

    const xSubValues = flatData
      .reduce((acc, curr) => (acc.includes(curr.key) ? acc : acc.concat(curr.key)), []);

    // Calcule vertical scale
    this.yScale.domain([yMin, yMax]).rangeRound([this.cfg.height, 0]);

    // Calcule horizontal scale (for groups)
    this.xScale
      .domain(xValues)
      .range([0, this.cfg.width])
      .paddingInner(this.cfg.scales.xPaddingInner)
      .paddingOuter(this.cfg.scales.xPaddingOuter);

    // Calcule horizontal scale (inside groups)
    this.xSubScale
      .domain(xSubValues)
      .range([0, this.xScale.bandwidth()])
      .paddingInner(this.cfg.scales.xSubPaddingInner)
      .paddingOuter(this.cfg.scales.xSubPaddingOuter);

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
    const bargroups = this.barsgroup
      .enter()
      .append('g')
      .attr('class', `chart__bars-group chart__bars-group--${this.cfg.class}`)
      .attr('transform', (d) => `translate(${this.xScale(d.id)},0)`);

    const bars = bargroups
      .selectAll('.chart__bar')
      .data((d) => d.values)
      .enter()
      .append('rect');

    bars
      .attr('class', `chart__bar chart__bar--${this.cfg.class}`)
      .attr('x', (d) => this.xSubScale(d.key))
      .attr('width', this.xSubScale.bandwidth())
      .attr('y', (d) => this.yScale(d.value))
      .attr('height', (d) => this.cfg.height - this.yScale(d.value));

    Object.keys(this.cfg.attrs).forEach((key) => {
      bars.attr(key, this.cfg.attrs[key]);
    });

    Object.keys(this.cfg.styles).forEach((key) => {
      bars.style(key, this.cfg.styles[key]);
    });

    bars
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
    // Redraw bars
    this.g
      .selectAll('.chart__bars-group')
      .attr('transform', (d) => `translate(${this.xScale(d.id)},0)`);

    this.g
      .selectAll('.chart__bar')
      .attr('fill', (d) => this.colorElement(d))
      .attr('x', (d) => this.xSubScale(d.key))
      .attr('width', this.xSubScale.bandwidth())
      .attr('y', (d) => this.yScale(d.value))
      .attr('height', (d) => this.cfg.height - this.yScale(d.value));
  }

  /**
   * Remove chart's elements without data
   */
  exitElements() {
    this.g
      .selectAll('.chart__bars-group')
      .exit()
      .style('opacity', 0)
      .remove();

    this.g
      .selectAll('.chart__bar')
      .exit()
      .style('opacity', 0)
      .remove();
  }
}
