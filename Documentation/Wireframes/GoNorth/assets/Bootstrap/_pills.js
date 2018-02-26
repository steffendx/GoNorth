var svg, doc;
var vPadding = 12, hPadding = 15;
var itemsLayer;
var pills;
var justified = false;

function onload(evt) {
	svg = evt.target;
	doc = svg.ownerDocument
	itemsLayer = doc.createElement("g");
	svg.appendChild(itemsLayer);
	pills = doc.getElementById("pills");
}

function onresize(evt) {
	var width = parseInt(svg.getAttribute("width"));
	var height = parseInt(svg.getAttribute("height"));

	clearNode(itemsLayer);

    var selectionIndex = ($model.selection === null || $model.selection === "") ? -1 : Number($model.selection);
	if(!(selectionIndex >= -1 && selectionIndex < $items.length))
		selectionIndex = -1;

	if(justified) {
		var itemWidth = Math.round(width / $items.length);
		var lastItemWidth = width - itemWidth * ($items.length - 1);
	}
	
	function computeItemWidth(i) {
		if(justified) {
			return i === $items.length - 1 ? lastItemWidth : itemWidth;
		} else {
			return $items[i].width + hPadding * 2;
		}
	}
	
	for ( var i = 0, n = $items.length, x = 0; i < n; i++) {
		var fo = doc.createElement("foreignObject");
		var item = $items[i];
		var iItemWidth = computeItemWidth(i);
		
		fo.setAttribute("id", "item" + i);
		fo.setAttribute("x", x);
		fo.setAttribute("y", 0);
		fo.setAttribute("width", iItemWidth);
		fo.setAttribute("height", height);
		if(i === selectionIndex)
			fo.setAttribute("fill", "red");
		else
			fo.setAttribute("stroke", "black");
		itemsLayer.appendChild(fo);

		x += iItemWidth;
	}

	if (selectionIndex !== -1) {
		pills.setAttribute("display", "inline");
		
		x = 0;

		for ( var i = 0, n = Math.min(selectionIndex, $items.length); i < n; i++) {
			x += computeItemWidth(i);
		}

		var selectionItemWidth = computeItemWidth(selectionIndex);

		pills.setAttribute("x", x);
		pills.setAttribute("y", 0);
		pills.setAttribute("width", selectionItemWidth);
		pills.setAttribute("height", height);
	} else {
		pills.setAttribute("display", "none");
	}
}

function getPreferredSize() {
	var width = 0, height = 0;

	if(justified) {
		var maxWidth = 0;
		for ( var i = 0, n = $items.length; i < n; i++) {
			maxWidth = Math.max(maxWidth, $items[i].width);
		}
		width = (maxWidth + hPadding * 2) * $items.length;
	} else {
		for ( var i = 0, n = $items.length; i < n; i++) {
			width += $items[i].width;
		}
	
		width += (hPadding * 2) * $items.length;
	}

	for ( var i = 0, n = $items.length; i < n; i++) {
		height = Math.max(height, $items[i].height);
	}
	height += (vPadding * 2);

	return {
		width : width,
		height : height
	};
}

function clearNode(node) {
	while (node.firstChild) {
		node.removeChild(node.firstChild);
	}
}
