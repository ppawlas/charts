function Chart(width, height, margin, parentSelector) {
	this.counter = this.constructor.counter++;

	this.margin = margin;
	this.width = width - margin.left - margin.right;
	this.height = height - margin.top - margin.bottom;
	this.parentSelector = parentSelector;

	this.svg = d3.select(parentSelector)
		.append("svg")
			.attr("width", this.width + margin.left + margin.right)
			.attr("height", this.height + margin.top + margin.bottom)
		.append("g")
			.attr("transform", "translate(" + margin.left + "," + margin.right + ")");

	this.svg.append("clipPath")
		.attr("id", this.getUniqueId("chart-area"))
		.append("rect")
		.attr({ x: 0, y: 0, width: this.width, height: this.height });

	this.chartGroup = this.svg.append("g")
		.attr("id", this.getUniqueId("chart-group"))
		.attr("clip-path", "url(#"+this.getUniqueId("chart-area")+")");
};
Chart.prototype.getUniqueId = function(id) {
	return id + this.counter;
}
Chart.prototype.key = function(d) {
	return d.key;
}
Chart.prototype.setData = function(dataset) {
	this.dataset = dataset;
};