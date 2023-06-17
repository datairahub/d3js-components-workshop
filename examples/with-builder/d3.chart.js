/* eslint-disable class-methods-use-this, no-console */
import { select } from 'd3-selection';
import { scaleOrdinal } from 'd3-scale';

const d3 = { select, scaleOrdinal };

/**
* D3 Chart Base
*/
export default class {
  constructor(selection, data, config, cfg) {
    this.selection = d3.select(selection);
    this.data = data;
    this.cfg = cfg;
    this.events = {};
    this.setConfig(config);

    // Resize listener
    this.onResize = () => {
      this.resizeChart();
    };
    window.addEventListener('resize', this.onResize);

    this.getDimensions();
    this.setColorScheme();
    this.initChart();
  }

  setConfig(config) {
    // Set up configuration
    Object.keys(config).forEach((key) => {
      if (config[key] instanceof Object && config[key] instanceof Array === false && typeof config[key] !== 'function') {
        if (this.cfg[key] instanceof Object === false) this.cfg[key] = {};
        Object.keys(config[key]).forEach((sk) => {
          this.cfg[key][sk] = config[key][sk];
        });
      } else {
        this.cfg[key] = config[key];
      }
    });
  }

  /**
  * Init chart
  */
  initChart() {
    console.error('d3chart.initChart not implemented');
  }

  /**
  * Resize chart pipe
  */
  setScales() {
    console.error('d3chart.setScales not implemented');
  }

  /**
   * Set up chart dimensions (non depending on data)
   */
  setChartDimension() {
    const width = this.cfg.width + this.cfg.margin.left + this.cfg.margin.right;
    const height = this.cfg.height + this.cfg.margin.top + this.cfg.margin.bottom;

    this.svg.attr('viewBox', `0 0 ${width} ${height}`).attr('width', width).attr('height', height);
  }

  /**
  * Bind data to main elements groups
  */
  bindData() {
    console.error('d3.chart.bindData not implemented');
  }

  /**
  * Add new chart's elements
  */
  enterElements() {
    console.error('d3.chart.enterElements not implemented');
  }

  /**
  * Update chart's elements based on data change
  */
  updateElements() {
    console.error('d3.chart.updateElements not implemented');
  }

  /**
  * Remove chart's elements without data
  */
  exitElements() {
    console.error('d3.chart.exitElements not implemented');
  }

  /**
  * Set up chart dimensions
  */
  getDimensions() {
    if (this.cfg.addSize) {
      this.cfg.width = parseInt(this.selection.node().offsetWidth, 10);
      this.cfg.height = parseInt(this.selection.node().offsetHeight, 10);
    } else {
      this.cfg.width = parseInt(this.selection.node().offsetWidth, 10)
        - this.cfg.margin.left
        - this.cfg.margin.right;

      this.cfg.height = parseInt(this.selection.node().offsetHeight, 10)
        - this.cfg.margin.top
        - this.cfg.margin.bottom;
    }
  }

  /**
  * Returns chart's data
  */
  getData() {
    return this.data;
  }

  /**
  * Add new data elements
  */
  enterData(data) {
    this.data = this.data.concat(data);
    this.computeData();
    this.setScales();
    this.updateChart();
  }

  /**
  * Update existing data elements
  */
  updateData(data) {
    this.data = [...data];
    this.computeData();
    this.updateChart();
  }

  /**
  * Compute data before operate
  */
  computeData() {
    return null;
  }

  /**
  * Remove data elements
  */
  exitData(filter) {
    this.data.forEach((d, i) => {
      let c = 0;
      Object.keys(filter).forEach((key) => {
        if (filter[key] === d[key]) c += 1;
      });
      if (c === Object.keys(filter).length) {
        this.data.splice(i, 1);
      }
    });
    this.computeData();
    this.setScales();
    this.updateChart();
  }

  /**
  * Init chart commons elements (div > svg > g; tooltip)
  */
  initChartFrame(classname = '') {
    // Wrapper div
    this.wrap = this.selection.append('div')
      .attr('class', `chart__wrap chart__wrap--${classname}`);

    // SVG element
    this.svg = this.wrap.append('svg')
      .attr('class', `chart chart--${classname}`);

    // General group for margin convention
    this.g = this.svg.append('g')
      .attr('class', `chart__margin-wrap chart__margin-wrap--${classname}`)
      .attr('transform', `translate(${this.cfg.margin.left},${this.cfg.margin.top})`);

    // Tooltip
    this.selection.selectAll('.chart__tooltip').remove();
    this.tooltip = this.wrap
      .append('div')
      .attr('class', `chart__tooltip chart__tooltip--${classname}`);
  }

  setColorScheme() {
    if (typeof this.cfg.color === 'string' || this.cfg.color instanceof String) {
      // color = 'purple'
      this.colorScale = null;
      return;
    }
    if (this.cfg.color instanceof Array) {
      // color = ['red', 'blue'] or schemeCategory10
      this.colorScale = d3.scaleOrdinal().range(this.cfg.color);
      return;
    }
    if (this.cfg.color instanceof Object) {
      if (this.cfg.color.scale instanceof Array) {
        // color = { key: 'party', scale: ['red', 'blue']}
        this.colorScale = d3.scaleOrdinal().range(this.cfg.color.scale);
      } else {
        // color = { key: 'party'} (and element.party is a color)
        this.colorScale = null;
      }
    }
  }

  /**
   * Compute element color
   */
  colorElement(d, key = 'id') {
    if (typeof this.cfg.color === 'string' || this.cfg.color instanceof String) {
      // color = 'purple'
      return this.cfg.color;
    }
    if (this.cfg.color instanceof Array) {
      // color = ['red', 'blue'] or schemeCategory10
      return this.colorScale(d[key]);
    }
    if (this.cfg.color instanceof Object) {
      if (this.cfg.color.scale instanceof Array) {
        // color = { key: 'party', scale: ['red', 'blue']}
        return this.colorScale(d[this.cfg.color.key]);
      }
      // color = { key: 'party'} (and element.party is a color)
      return d[this.cfg.color.key];
    }
    return 'black';
  }

  /**
  * Update chart methods
  */
  updateChart() {
    this.bindData();
    this.setScales();
    this.enterElements();
    this.updateElements();
    this.exitElements();
  }

  /**
  * Resize chart methods
  */
  resizeChart() {
    this.getDimensions();
    // this.setScales();
    this.setChartDimension();
    this.updateChart();
  }

  /**
  * Update chart configuration
  */
  updateConfig(config) {
    this.setConfig(config);
    this.setColorScheme();
    this.resizeChart();
  }

  /**
  * Destroy chart methods
  */
  destroyChart() {
    window.removeEventListener('resize', this.onResize);
  }

  // /** THIS SHIT IS NOT WORKING PROPERLY
  //  *  TODO: FIX
  //  * Create custom scale ticks values for a range and division
  //  * @param {integer} ticks number of ticks
  //  * @param {float} min minimal value
  //  * @param {float} max maximal value
  //  * @returns {array<integer>} scale ticks
  //  */
  // calcTicksValues(ticks, min, max) {
  //   const step = Math.round((max - min) / ticks);
  //   return Array.from(Array(ticks + 1).keys()).map((v) => v * step);
  // }

  /**
   * Event listeners registration
   * @param {string} listener
   * @param {function} fn
   */
  on(listener, fn) {
    this.events[listener] = fn;
  }
}
