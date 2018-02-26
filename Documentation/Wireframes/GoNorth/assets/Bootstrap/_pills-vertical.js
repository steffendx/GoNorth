var svg, doc;
var vPadding = 12, hPadding = 15;
var itemsLayer;
var pills;

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

	for ( var i = 0, n = $items.length, y = 0; i < n; i++) {
		var item = $items[i];
		var iItemHeight = item.height + vPadding * 2;
		
		var text = doc.createElement("foreignObject");
		text.setAttribute("id", "item" + i);
		text.setAttribute("x", hPadding);
		text.setAttribute("y", y);
		text.setAttribute("width", item.width);
		text.setAttribute("height", iItemHeight);
		if (i === selectionIndex)
			text.setAttribute("fill", "red");
		else
			text.setAttribute("stroke", "black");
		itemsLayer.appendChild(text);

		var link = doc.createElement("foreignObject");
		link.setAttribute("id", "link" + i);
		link.setAttribute("x", 0);
		link.setAttribute("y", y);
		link.setAttribute("width", width);
		link.setAttribute("height", iItemHeight);
		itemsLayer.appendChild(link);

		y += iItemHeight;
	}

	if (selectionIndex !== -1) {
		pills.setAttribute("display", "inline");

		y = 0;

		for ( var i = 0, n = Math.min(selectionIndex, $items.length); i < n; i++) {
			y += $items[i].height + vPadding * 2;
		}

		pills.setAttribute("x", 0);
		pills.setAttribute("y", y);
		pills.setAttribute("width", width);
		pills.setAttribute("height", $items[selectionIndex].height + vPadding * 2);
	} else {
		pills.setAttribute("display", "none");
	}
}

function getPreferredSize() {
	var width = 0, height = 0;

	for ( var i = 0, n = $items.length; i < n; i++) {
		width = Math.max(width, $items[i].width);
		height += $items[i].height;
	}
	
	width += hPadding * 2;
	height += (vPadding * 2) * $items.length;

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
