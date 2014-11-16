function ColumnChart(width, height, margin, parentSelector, colorClass) {
	Chart.call(this, width, height, margin, parentSelector);

	this.colorClass = colorClass;
	this.scales = null;
	this.axes = null;
}

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
};

ColumnChart.prototype.setScales = function() {
	if (this.dataset) {
		var padding = 20;
		var midPadding = 0.1;

		this.scales = {
			x: d3.scale.ordinal()
				.domain(this.dataset.map(function(d) { return d.key; }))
				.rangeRoundBands([0, this.width - padding], midPadding),

			y: d3.scale.linear()
				.domain([0, d3.max(this.dataset, function(d) { return d.value; })])
				.range([this.height, padding])
		};

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
		};
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

ColumnChart.prototype.getLabelsAttributes = function() {
	var padding = 5;
	var that = this;
	return {
		x: function(d) { return that.scales.x(d.key) + that.scales.x.rangeBand() / 2; },
		y: function(d) { return that.scales.y(d.value) - padding; },
		"text-anchor": "middle"
	};
};

ColumnChart.prototype.enhanceLabels = function(that) {
	var labelWidth = that.getBBox().width;
	if (labelWidth > this.scales.x.rangeBand()) {
		that.remove();
	}
};

ColumnChart.prototype.getTooltipPosition = function(obj) {
	var mouse = d3.mouse(obj);
	var rect = d3.select(obj);
	var x = parseFloat(rect.attr("x")) + parseFloat(rect.attr("width")) / 2;
	var y = parseFloat(mouse[1]);
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
						.attr("fill", function(d) { return d3.rgb(that.scales.color(d.value)).brighter(); });

					var tooltipPosition = that.getTooltipPosition(this);
					that.tooltip.show(tooltipPosition.x, tooltipPosition.y, that.getTooltipText(d));
				})
				.on("mousemove", function(d) {
					var tooltipPosition = that.getTooltipPosition(this);
					that.tooltip.move(tooltipPosition.x, tooltipPosition.y);
				})
				.on("mouseout", function(d) {
					d3.select(this).transition().duration(250)
						.attr("fill", function(d) { return that.scales.color(d.value); });

					that.tooltip.hide();
				});

		this.chartGroup.selectAll("text")
			.data(this.dataset, this.key)
			.enter()
			.append("text")
				.text(function(d) { return d.value; })
				.attr(this.getLabelsAttributes());

		this.chartGroup.selectAll("text")
			.each(function() {
				that.enhanceLabels(this);
			});

	} else {
		console.error("No dataset to draw.");
	}
};

ColumnChart.prototype.draw = function() {
	this.setScales();
	this.setAxes();
	this.appendAxes();
	this.drawChart();
};