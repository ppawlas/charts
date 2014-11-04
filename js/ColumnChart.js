function ColumnChart(width, height, margin, parentSelector) {
	Chart.call(this, width, height, margin, parentSelector);

	this.scales = null;
	this.axes = null;
}

ColumnChart.prototype = Object.create( Chart.prototype );

ColumnChart.prototype.setScales = function() {
	if (this.dataset) {
		var padding = 0.1;

		this.scales = {
			x: d3.scale.ordinal()
				.domain(this.dataset.map(function(d) { return d.key; }))
				.rangeRoundBands([0, this.width], padding),

			y: d3.scale.linear()
				.domain([0, d3.max(this.dataset, function(d) { return d.value; })])
				.range([this.height, 0])
		}
	} else {
		console.error("No dataset to set scales on.");
	}
}

ColumnChart.prototype.setAxes = function() {
	if (this.dataset && this.scales) {
		this.axes = {
			x: d3.svg.axis()
				.scale(this.scales.x)
				.orient("bottom"),

			y: d3.svg.axis()
				.scale(this.scales.y)
				.orient("left")
		}
	} else {
		console.error("No dataset or scales.");
	}
}

ColumnChart.prototype.appendAxes = function() {
	if (this.axes) {
		this.svg.append("g")
			.attr("class", "x axis")
			.attr("transform", "translate(0," + this.height + ")")
			.call(this.axes.x);

		this.svg.append("g")
			.attr("class", "y axis")
			.call(this.axes.y);
	} else {
		console.error("No axes to append.");
	}
}

ColumnChart.prototype.drawChart = function() {
	if (this.dataset) {
		var that = this;
		
		this.chartGroup.selectAll("rect")
			.data(this.dataset, this.key)
			.enter()
			.append("rect")
				.attr({
					x: function(d, i) { return that.scales.x(i); },
					y: function(d) { return that.scales.y(d.value); },
					width: this.scales.x.rangeBand(),
					height: function(d) { return that.height - that.scales.y(d.value); },
					fill: "red"
				});
	} else {
		console.error("No dataset to draw.")
	}
}

ColumnChart.prototype.draw = function() {
	this.setScales();
	this.setAxes();
	this.appendAxes();
	this.drawChart();
}