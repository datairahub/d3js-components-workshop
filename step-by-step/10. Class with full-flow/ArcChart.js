class ArcChart extends BaseChart {
    constructor(selection, data, config) {
        super(selection, data, config, {
            class: 'arcchart',
            margin: 20,
            strokeWidth: 1,
        });
    }

    initChart() {       
        this.initChartFrame(this.cfg.class);
        this.computeData();
        this.updateChart();
    }

    computeData() {
        const totalDep = d3.sum(this.data, (d) => d.dep);
        this.chartData = this.data.map((party, i) => ({
            ...party,
            id: i,
            percentRad: (party.dep / totalDep) * Math.PI,
        }));
    }
    
    bindData() {
        this.arcs = this.g.selectAll('.chart__arcs').data(this.chartData, (d) => d.id);
    }
    
    enterElements() {
        this.arcs
            .enter()
            .append("path")
            .attr("class", 'chart__arcs');
    }

    updateElements() {
        this.g.selectAll('.chart__arcs')
            .attr("d", this.arcGeneratorGenerator())
            .attr("fill", (d) => d.color)
            .attr('transform', `translate(${this.cfg.width / 2},${this.cfg.height})`)
            .attr("stroke", "#1a1a1c")
            .attr("stroke-width", this.cfg.strokeWidth);
    }

    exitElements() {
        this.arcs
            .exit()
            .style('opacity', 0)
            .remove();
    }

    calcStartAngle(index, key) {
        const previousParties = this.chartData.filter((d) => d.id < index);
        const start = d3.sum(previousParties, (d) => d[key]);
        return (- Math.PI / 2) + start;
    }

    calcEndAngle(index, key) {
        const previousParties = this.chartData.filter((d) => d.id <= index);
        const end = d3.sum(previousParties, (d) => d[key]);
        return (- Math.PI / 2) + end;
    }

    arcGeneratorGenerator() {
        const minWH = d3.min([this.cfg.width / 2, this.cfg.height]);
        return d3.arc()
            .innerRadius(minWH * this.cfg.thickness)
            .outerRadius(minWH)
            .cornerRadius(this.cfg.cornerRadius)
            .startAngle((party, index) => this.calcStartAngle(index, 'percentRad'))
            .endAngle((party, index) => this.calcEndAngle(index, 'percentRad'));
    }
}