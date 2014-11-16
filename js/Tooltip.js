function Tooltip(parent, margin) {
	this.parent = parent;
	this.padding = 10;

	this.group = parent.append("g")
		.style("pointer-events", "none")
		.attr("class", "tooltip")
		.attr("visibility", "hidden");

	this.background = this.group
		.append("rect")
		.attr({rx: this.padding/2, ry: this.padding/2});

	this.label = this.group.append("text");
}

Tooltip.prototype.adjustPosition = function(x, y) {
	var parentBbox = this.parent.select(".chart").node().getBBox();
	var labelBbox = this.label.node().getBBox();
	
	var adjustedX = ((x + labelBbox.width + 3 * this.padding) > parentBbox.width) ? (x - labelBbox.width - 3 * this.padding) : x + this.padding;
	var adjustedY = ((y + labelBbox.height + 3 * this.padding) > parentBbox.height) ? (y - labelBbox.height - 3 * this.padding) : y + this.padding;

	return { x: adjustedX, y: adjustedY };
};

Tooltip.prototype.show = function(x, y, newText) {
	this.label.text(newText).attr("x", this.padding);
	this.label.attr("y", this.padding + this.label.node().getBBox().height);

	var adjusted = this.adjustPosition(x, y);

	this.background
		.attr("width", this.label.node().getBBox().width + 2 * this.padding)
		.attr("height", this.label.node().getBBox().height + 2 * this.padding);

	this.group
		.attr({
			visibility: "visible",
			transform: "translate(" + adjusted.x + "," + adjusted.y + ")"
		});
};

Tooltip.prototype.move = function(x, y) {
	var adjusted = this.adjustPosition(x, y);

	this.group.attr("transform", "translate(" + adjusted.x + "," + adjusted.y + ")");
};

Tooltip.prototype.hide = function() {
	this.group.attr("visibility", "hidden");
};