/**
* D3 Chart Base
*/
class BaseChart {
  constructor(selection, data, config, defaultConfig) {
    this.selection = d3.select(selection);
    this.data = data;
    this.cfg = defaultConfig;
    this.setConfig(config);

    // Resize listener
    this.onResize = () => {
      this.resizeChart();
    };
    window.addEventListener('resize', this.onResize);

    this.getDimensions();
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
   * Set up chart dimensions (non depending on data)
   */
  setChartDimension() {
    const width = this.cfg.width + this.cfg.margin + this.cfg.margin;
    const height = this.cfg.height + this.cfg.margin + this.cfg.margin;

    this.svg.attr('viewBox', `0 0 ${width} ${height}`)
        .attr('width', width)
        .attr('height', height);
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
    this.cfg.width = parseInt(this.selection.node().offsetWidth, 10)
        - this.cfg.margin
        - this.cfg.margin;

    this.cfg.height = parseInt(this.selection.node().offsetHeight, 10)
        - this.cfg.margin
        - this.cfg.margin;
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
    this.setChartDimension();

    // General group for margin convention
    this.g = this.svg.append('g')
        .attr('class', `chart__margin-wrap chart__margin-wrap--${classname}`)
        .attr('transform', `translate(${this.cfg.margin},${this.cfg.margin})`);

    // Tooltip
    this.selection.selectAll('.chart__tooltip').remove();
    this.tooltip = this.wrap
        .append('div')
        .attr('class', `chart__tooltip chart__tooltip--${classname}`);
  }

  /**
  * Update chart methods
  */
  updateChart() {
    this.bindData();
    this.enterElements();
    this.updateElements();
    this.exitElements();
  }

  /**
  * Resize chart methods
  */
  resizeChart() {
    this.getDimensions();
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
}