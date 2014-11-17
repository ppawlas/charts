function LineChart(width, height, margin, parentSelector, colorClass) {
	ColumnChart.call(this, width, height, margin, parentSelector, colorClass);

	var that = this;
	this.line = d3.svg.line()
		.x(function(d) { return that.scales.x(d.key); })
		.y(function(d) { return that.scales.y(d.value); })
		.interpolate("linear");
}

LineChart.prototype = Object.create( ColumnChart.prototype );

LineChart.prototype.setColorScale = function() {
	if (this.colorClass) {
		this.primaryColor = this.colorClass[this.colorClass.length - 1];
		this.secondaryColor = this.colorClass[this.colorClass.length - 2];
	} else {
		console.error("Color class is not set.");
	}
};


LineChart.prototype.setScales = function() {
	if (this.dataset) {
		var padding = 20;
		var midPadding = 1;

		this.scales = {
			x: d3.scale.ordinal()
				.domain(this.dataset.map(function(d) { return d.key; }))
				.rangePoints([0, this.width], midPadding),

			y: d3.scale.linear()
				.domain([0, d3.max(this.dataset, function(d) { return d.value; })])
				.range([this.height, padding])
		};

		this.setColorScale();
	} else {
		console.error("No dataset to set scales on.");
	}
};

LineChart.prototype.enhanceOrdinalAxis = function() {
	var that = this;
	var anyTickVisible = false;
	var rangeWidth = this.scales.x.rangeExtent()[1];
	var rangeSize = this.scales.x.range().length;

	this.svg.selectAll(".x.axis text")
		.each(function() {
			var tickWidth = this.getBBox().width;
			if (tickWidth > (rangeWidth / rangeSize)) {
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

LineChart.prototype.getLabelsAttributes = function() {
	var padding = 10;
	var that = this;
	return {
		x: function(d) { return that.scales.x(d.key) + that.scales.x.rangeBand() / 2; },
		y: function(d) { return that.scales.y(d.value) - padding; },
		"text-anchor": "middle"
	};
};

ColumnChart.prototype.enhanceLabels = function(that) {
	var rangeWidth = this.scales.x.rangeExtent()[1];
	var rangeSize = this.scales.x.range().length;

	var labelWidth = that.getBBox().width;
	if (labelWidth > (rangeWidth / rangeSize)) {
		that.remove();
	}
};

LineChart.prototype.drawChart = function() {
	if (this.dataset) {
		var that = this;
		
		this.chartGroup.append("path")
			.datum(this.dataset)
			.attr("class", "line")
			.attr("d", this.line)
			.attr("stroke", this.primaryColor);

		this.chartGroup.selectAll("circle")
			.data(this.dataset)
			.enter()
			.append("circle")
			.attr("cx", function(d) { return that.scales.x(d.key); })
			.attr("cy", function(d) { return that.scales.y(d.value); })
			.attr("r", 4)
			.attr("fill", this.primaryColor)
			.attr("stroke", this.primaryColor)
			.attr("stroke-width", 1)
			.on("mouseover", function(d) {
				d3.select(this).transition().duration(250)
					.attr("r", 6)
					.attr("stroke-width", 2)
					.attr("fill", that.secondaryColor);

				var tooltipPosition = that.getTooltipPosition(this);
				that.tooltip.show(tooltipPosition.x, tooltipPosition.y, that.getTooltipText(d));
			})
			.on("mousemove", function(d) {
				var tooltipPosition = that.getTooltipPosition(this);
				that.tooltip.move(tooltipPosition.x, tooltipPosition.y);
			})
			.on("mouseout", function(d) {
				d3.select(this).transition().duration(250)
					.attr("r", 4)
					.attr("stroke-width", 1)
					.attr("fill", that.primaryColor);

				that.tooltip.hide();
			});

		this.chartGroup.selectAll("text")
			.data(this.dataset, this.key)
			.enter()
			.append("text")
				.text(function(d) { return d.value; })
				.attr(this.getLabelsAttributes())
				.style("pointer-events", "none");

		this.chartGroup.selectAll("text")
			.each(function() {
				that.enhanceLabels(this);
			});

	} else {
		console.error("No dataset to draw.");
	}
};

LineChart.prototype.getTooltipPosition = function(obj) {
	var mouse = d3.mouse(obj);
	var circle = d3.select(obj);
	var x = mouse[0];
	var y = mouse[1];
	return {x: x, y: y};
};