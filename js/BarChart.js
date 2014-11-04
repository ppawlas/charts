function BarChart(width, height, margin, parentSelector) {
	ColumnChart.call(this, width, height, margin, parentSelector);
}

BarChart.prototype = Object.create( ColumnChart.prototype );

BarChart.prototype.setScales = function() {
	if (this.dataset) {
		var padding = 0.1;

		this.scales = {
			x: d3.scale.linear()
				.domain([0, d3.max(this.dataset, function(d) { return d.value; })])
				.range([0, this.width]),

			y: d3.scale.ordinal()
				.domain(this.dataset.map(function(d) { return d.key; }))
				.rangeRoundBands([this.height, 0], padding)
		}
	} else {
		console.error("No dataset to set scales on.");
	}
}

BarChart.prototype.drawChart = function() {
	if (this.dataset) {
		var that = this;
		
		this.chartGroup.selectAll("rect")
			.data(this.dataset, this.key)
			.enter()
			.append("rect")
				.attr({
					x: 0,
					y: function(d, i) { return that.scales.y(i); },
					width: function(d) { return that.scales.x(d.value); },
					height: this.scales.y.rangeBand(),
					fill: "red"
				});
	} else {
		console.error("No dataset to draw.")
	}
}