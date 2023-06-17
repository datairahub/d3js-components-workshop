import { select, selectAll } from 'd3-selection';
import { extent } from 'd3-array';
import { geoPath, geoMercator } from 'd3-geo';
import { rewind } from '@turf/turf';

const d3 = { select, selectAll, extent, geoPath, geoMercator };

/**
 * Displays a GeoJSON geometry
 *
 * @param {htmlNode} selection vue ref element: this.$refs.my_selected_node
 * @param {object} data data to represent
 * @param {object} config extra configuration parameters
 *
 * Required data format = {
 *   type: 'FeatureCollection',
 *   features: [
 *     {
 *       type: 'Feature',
 *       properties: {
 *         id: 23,          // REQUIRED IN ORDER TO UPDATE GEOMETRIES
 *         fill: '#000000',
 *         fillOpacity: 0.3,
 *         stroke: '#000000',
 *         strokeWeight: 0.3,
 *         ...,
 *       },
 *       geometry: {
 *         type: 'Polygon',
 *         coordinates: [
 *           // format: Array( Array( [lng, lat], [lng, lat], [lng, lat],... ))
 *         ]
 *       },
 *     },
 *     {
 *       type: 'Feature',
 *       properties: {...},
 *       geometry: {
 *         type: 'MultiPolygon',
 *         coordinates: [
 *           // format: Array( Array( Array( [lng, lat], [lng, lat], [lng, lat],... )))
 *         ]
 *       },
 *     },
 *   ]
 * }
*/

export default class {
  constructor(selection, data, config = {}) {
    this.selection = d3.select(selection);

    // Default configuration
    this.cfg = {
      margin: { top: 10, right: 10, bottom: 10, left: 10 },
      width: null,
      height: null,
    };

    // Set up configuration
    Object.keys(config).forEach((key) => {
      if (config[key] instanceof Object && config[key] instanceof Array === false) {
        Object.keys(config[key]).forEach((sk) => {
          this.cfg[key][sk] = config[key][sk];
        });
      } else this.cfg[key] = config[key];
    });

    // Set up dimensions
    this.cfg.width = this.cfg.width ||
      parseInt(this.selection.node().offsetWidth, 10) -
      this.cfg.margin.left -
      this.cfg.margin.right;
    this.cfg.height = this.cfg.height ||
      parseInt(this.selection.node().offsetHeight, 10) -
      this.cfg.margin.top -
      this.cfg.margin.bottom;

    this.computeData(data);
    this.setScales();
    this.initGraph();
  }

  computeData(data) {
    this.data = JSON.parse(JSON.stringify({
      ...data,
      features: data.features.map((feature) => rewind(feature, { reverse: true })),
    }));
  }

  setScales() {
    if (this.path && !this.data.features.length) return;

    this.path = d3.geoPath()
      .projection(
        d3.geoMercator()
          .fitSize([this.cfg.width, this.cfg.height], this.data),
      );
  }

  initGraph() {
    // Wrapper div
    this.wrap = this.selection.append('div')
      .attr('class', 'chart__wrap chart__wrap--geojsongeometry');

    // SVG element
    this.svg = this.wrap.append('svg')
      .attr('class', 'chart chart--geojsongeometry')
      .attr('width', this.cfg.width + this.cfg.margin.left + this.cfg.margin.right)
      .attr('height', this.cfg.height + this.cfg.margin.top + this.cfg.margin.bottom);

    // General group for margin convention
    this.g = this.svg.append('g')
      .attr('class', 'chart__margin-wrap')
      .attr('transform', `translate(${this.cfg.margin.left},${this.cfg.margin.top})`);

    // PATH elements
    this.features = this.g.selectAll('path')
      .data(this.data.features, (d) => d.properties.id)
      .enter()
      .append('path')
      .attr('fill', (d) => d.properties.fill || '#000000')
      .attr('fill-opacity', (d) => d.properties.fillOpacity || 0.3)
      .attr('stroke', (d) => d.properties.stroke || '#000000')
      .attr('stroke-weight', (d) => d.properties.strokeWeight || 0.5)
      .attr('pointer-events', (d) => d.properties.pointerEvents || 'all')
      .attr('d', this.path);
  }

  updateData(data) {
    this.computeData(data);

    const features = this.g.selectAll('path')
      .data(this.data.features, (d) => d.properties.id);

    // Exit
    features.exit().remove();

    this.setScales();

    // Enter
    features
      .enter()
      .append('path')
      .attr('fill', (d) => d.properties.fill || '#000000')
      .attr('fill-opacity', (d) => d.properties.fillOpacity || 0.3)
      .attr('stroke', (d) => d.properties.stroke || '#000000')
      .attr('stroke-weight', (d) => d.properties.strokeWeight || 0.5)
      .attr('pointer-events', (d) => d.properties.pointerEvents || 'all');

    // Update
    this.features = this.g.selectAll('path')
      .attr('d', this.path);
  }
}
