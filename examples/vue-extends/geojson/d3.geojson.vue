<template>
  <div class="chart chart--geometry geometry-chart">
    <div
      ref="chart"
      class="geometry-chart__wrap"
      :style="{height: `${height}px`}"
    />
  </div>
</template>

<script>
import D3Geojson from './d3.geojson';

export default {
  name: 'D3Geojson',
  data() {
    return {
      chart: null,
      mapData: {
        type: 'FeatureCollection',
        features: [],
      },
    };
  },
  props: {
    features: {
      type: Array,
      required: true,
      default: () => ([]),
    },
    height: {
      type: Number,
      required: false,
      default: 300,
    },
  },
  mounted() {
    this.setGeometryData();
    this.initChart();
  },
  methods: {
    setGeometryData() {
      this.mapData.features = this.features;
    },
    initChart() {
      this.chart = new D3Geojson(
        this.$refs.chart,
        this.mapData,
        {
          height: this.height - 20,
          // width: 360,
        },
      );
    },
    updateChart() {
      this.setGeometryData();
      this.chart.updateData(this.mapData);
    },
  },
  watch: {
    features: 'updateChart',
  },
};
</script>
