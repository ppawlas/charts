function ColumnChart(width, height, margin, parentSelector, colorClass) {
	Chart.call(this, width, height, margin, parentSelector);

	this.colorClass = colorClass;
	this.scales = null;
	this.axes = null;
};

ColumnChart.prototype = Object.create( Chart.prototype );

ColumnChart.prototype.setColorScale = function() {
	if (this.colorClass) {
		this.scales.color = d3.scale.quantize()
			.domain([0, d3.max(this.dataset, function(d) {
				return d.value;
			})])
			.range(this.colorClass);
	} else {
		console.error("Color class is not set.");
	}
}

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

		this.setColorScale();
	} else {
		console.error("No dataset to set scales on.");
	}
};

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
};

ColumnChart.prototype.enhanceOrdinalAxis = function() {
	var that = this;
	var anyTickVisible = false;

	this.svg.selectAll(".x.axis text")
		.each(function() {
			var tickWidth = this.getBBox().width;
			if (tickWidth > that.scales.x.rangeBand()) {
				this.remove();
			} else if (!anyTickVisible) {
				anyTickVisible = true;
			}
		});

	if (!anyTickVisible) {
		this.axes.x.tickValues([]);
		this.svg.select(".x.axis")
			.call(this.axes.x);
	}
};

ColumnChart.prototype.appendAxes = function() {
	if (this.axes) {
		this.svg.append("g")
			.attr("class", "x axis")
			.attr("transform", "translate(0," + this.height + ")")
			.call(this.axes.x);

		this.svg.append("g")
			.attr("class", "y axis")
			.call(this.axes.y);

		this.enhanceOrdinalAxis();
	} else {
		console.error("No axes to append.");
	}
};

ColumnChart.prototype.getChartAttributes = function() {
	var that = this;
	return {
		x: function(d) { return that.scales.x(d.key); },
		y: function(d) { return that.scales.y(d.value); },
		width: this.scales.x.rangeBand(),
		height: function(d) { return that.height - that.scales.y(d.value); },
		fill: function(d) { return that.scales.color(d.value); }
	};
};

ColumnChart.prototype.getTooltipPosition = function(rect) {
	var x = parseFloat(rect.attr("x")) + parseFloat(rect.attr("width")) / 2;
	var y = parseFloat(rect.attr("y"));
	return {x: x, y: y};
};

ColumnChart.prototype.drawChart = function() {
	if (this.dataset) {
		var that = this;
		
		this.chartGroup.selectAll("rect")
			.data(this.dataset, this.key)
			.enter()
			.append("rect")
				.attr(this.getChartAttributes())
				.on("mouseover", function(d) {
					d3.select(this).transition().duration(250)
						.attr("fill", function(d) { return d3.rgb(that.scales.color(d.value)).brighter(); })

					var tooltipPosition = that.getTooltipPosition(d3.select(this));
					that.tooltipGroup
						.attr({
							visibility: "visible",
							transform: "translate(" + tooltipPosition.x + "," + tooltipPosition.y + ")"
						});
					that.tooltipText.text(d.key + ": " + d.value);

					var tooltipPadding = 5;
					that.tooltip
						.attr("x", -tooltipPadding)
						.attr("y", -that.tooltipText.node().getBBox().height -tooltipPadding)
						.attr("width", that.tooltipText.node().getBBox().width + tooltipPadding * 2)
						.attr("height", that.tooltipText.node().getBBox().height + tooltipPadding * 2);
				})
				.on("mouseout", function(d) {
					d3.select(this).transition().duration(250)
						.attr("fill", function(d) { return that.scales.color(d.value); })

					that.tooltipGroup.attr("visibility", "hidden");
				});

	} else {
		console.error("No dataset to draw.")
	}
};

ColumnChart.prototype.draw = function() {
	this.setScales();
	this.setAxes();
	this.appendAxes();
	this.drawChart();
};