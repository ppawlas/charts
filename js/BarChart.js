function BarChart(width, height, margin, parentSelector, colorClass) {
	ColumnChart.call(this, width, height, margin, parentSelector, colorClass);
}

BarChart.prototype = Object.create( ColumnChart.prototype );

BarChart.prototype.setScales = function() {
	if (this.dataset) {
		var padding = 20;
		var midPadding = 0.1;

		this.scales = {
			x: d3.scale.linear()
				.domain([0, d3.max(this.dataset, function(d) { return d.value; })])
				.range([0, this.width]),

			y: d3.scale.ordinal()
				.domain(this.dataset.map(function(d) { return d.key; }))
				.rangeRoundBands([this.height, padding], midPadding)
		};

		this.setColorScale();
	} else {
		console.error("No dataset to set scales on.");
	}
};

BarChart.prototype.enhanceOrdinalAxis = function() {
	var that = this;
	var anyTickVisible = false;

	this.svg.selectAll(".y.axis text")
		.each(function() {
			var bbox = this.getBBox();
			var tickHeight = bbox.height;
			var tickWidth = bbox.width;
			if ( (this.textContent.length === 0) || (tickHeight > that.scales.y.rangeBand()) || (tickWidth > that.margin.left / 2) ) {
				this.remove();
		 	} else if (!anyTickVisible) {
				anyTickVisible = true;
			}
		});

	if (!anyTickVisible) {
		this.axes.y.tickValues([]);
		this.svg.select(".y.axis")
			.call(this.axes.y);
	}
};

BarChart.prototype.getChartAttributes = function() {
	var that = this;
	return {
		y: function(d, i) { return that.scales.y(d.key); },
		width: function(d) { return that.scales.x(d.value); },
		height: this.scales.y.rangeBand(),
		fill: function(d) { return that.scales.color(d.value); }
	};
};

BarChart.prototype.getLabelsAttributes = function() {
	var padding = 5;
	var that = this;
	return {
		x: function(d) {
			var labelWidth = this.getBBox().width;
			var scaledX = that.scales.x(d.value);
			return (scaledX + padding + labelWidth) > that.width ? scaledX - padding - labelWidth : scaledX + padding;
		},
		y: function(d) { return that.scales.y(d.key) + that.scales.y.rangeBand() / 2 + this.getBBox().height / 4; },
		fill: function(d) {
			var labelWidth = this.getBBox().width;
			var scaledX = that.scales.x(d.value);
			return (scaledX + padding + labelWidth) > that.width ? "white" : "black";		}
	};
};

BarChart.prototype.enhanceLabels = function(that) {
	var labelHeight = that.getBBox().height;
	if ( labelHeight > this.scales.y.rangeBand() ) {
		that.remove();
	}
};

BarChart.prototype.getTooltipPosition = function(obj) {
	var mouse = d3.mouse(obj);
	var rect = d3.select(obj);
	var x = parseFloat(mouse[0]);
	var y = parseFloat(rect.attr("y")) + parseFloat(rect.attr("height")) / 2;
	return {x: x, y: y};
};