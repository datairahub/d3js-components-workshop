class ArcChartPrevious extends ArcChart {

    computeData() {
        super.computeData();
        const totalPrev = d3.sum(this.data, (d) => d.prev);
        this.chartData = this.chartData.map((party, i) => ({
            ...party,
            percentRadPrev: (party.prev / totalPrev) * Math.PI,
        }));
    }

    bindData() {
        super.bindData();
        this.arcsPrev = this.g.selectAll('.chart__arcs-prev').data(this.chartData, (d) => d.id);
    }

    enterElements() {
        super.enterElements();
        this.arcsPrev
            .enter()
            .append("path")
            .attr("class", 'chart__arcs-prev');
    }

    updateElements() {
        super.updateElements();
        this.g.selectAll('.chart__arcs-prev')
            .attr("d", this.arcGeneratorGeneratorPrev())
            .attr("fill", (d) => d.color)
            .attr('transform', `translate(${this.cfg.width / 2},${this.cfg.height})`)
            .attr("stroke", "#1a1a1c")
            .attr("stroke-width", this.cfg.strokeWidth);
    }

    arcGeneratorGeneratorPrev() {
        const minWH = d3.min([this.cfg.width / 2, this.cfg.height]) * 0.7;

        return d3.arc()
            .innerRadius(minWH * this.cfg.thickness)
            .outerRadius(minWH)
            .cornerRadius(this.cfg.cornerRadius)
            .startAngle((party, index) => this.calcStartAngle(index, 'percentRadPrev'))
            .endAngle((party, index) => this.calcEndAngle(index, 'percentRadPrev'));
    }

    updateElements() {
        super.updateElements();
        this.g.selectAll('.chart__arcs-prev')
            .attr("d", this.arcGeneratorGeneratorPrev())
            .attr("fill", (d) => d.color)
            .attr('transform', `translate(${this.cfg.width / 2},${this.cfg.height})`)
            .attr("stroke", "#1a1a1c")
            .attr("stroke-width", this.cfg.strokeWidth);
    }

}