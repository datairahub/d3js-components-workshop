<template>
  <!-- eslint-disable vue/no-unused-refs -->
  <div class="chart__wrapper">
    <div v-if="title" class="chart__title">{{title}}</div>
    <div ref="chart" :style="{ height: `${height}px` }"/>
    <div v-if="source" class="chart__source">{{source}}</div>
  </div>
</template>

<script>
export default {
  name: 'D3Chart',
  data() {
    return {
      chart: null,
    };
  },
  props: {
    config: {
      type: Object,
      required: true,
      default: () => ({}),
    },
    datum: {
      type: Array,
      required: true,
      default: () => ([]),
    },
    title: {
      type: String,
      default: '',
    },
    source: {
      type: String,
      default: '',
    },
    height: {
      type: [Number, String],
      default: 300,
    },
  },
  watch: {
    config: {
      handler(val) {
        this.chart.updateConfig(val);
      },
      deep: true,
    },
    datum(vals) {
      this.chart.updateData([...vals]);
    },
  },
  beforeDestroy() {
    this.chart.destroyChart();
  },
};
</script>

<style lang="scss">
@import './d3.chart';
</style>
