/**
 * Reusable script for custom ButtonBar widgets.
 */
var svg, doc;
var container, bar, backgroundLeft, backgroundSingle, backgroundMiddle, backgroundRight, separator;
var selectionColor = "#CCC";

if(typeof $justified === 'undefined') {
	var $justified = false;
}

function onLoad(evt) {
    svg = evt.target;
    doc = svg.ownerDocument;
    container = doc.getElementById("container");
    bar = doc.getElementById("bar");
    backgroundLeft = doc.getElementById("background-left");
    backgroundSingle = doc.getElementById("background-single");
    backgroundMiddle = doc.getElementById("background-middle");
    backgroundRight = doc.getElementById("background-right");
    separator = doc.getElementById("separator");

    prepareTemplate(backgroundLeft);
    prepareTemplate(backgroundSingle);
    prepareTemplate(backgroundMiddle);
    prepareTemplate(backgroundRight);
    prepareTemplate(separator);
    
	container.removeAttribute('fill');
    
    clearNode(container);
}

function prepareTemplate(template) {
	template.removeAttribute('transform');
	template.removeAttribute('fill');
	template.parentNode.removeChild(template);
}

function onResize(evt) {
    var width = parseInt(svg.getAttribute("width"));
    var height = parseInt(svg.getAttribute("height"));
    if($justified) {
    	var itemWidth = Math.round(width / $items.length);
	    var lastItemWidth = width - itemWidth * ($items.length - 1);
    } else {
    	var prefWidth = getPreferredSize().width;
    }
    var selectionIndex = ($model.selection === null || $model.selection === "") ? -1 : Number($model.selection);
	if(!(selectionIndex >= -1 && selectionIndex < $items.length))
		selectionIndex = -1;

    clearNode(container);

	resizeBar(bar, width, height);

    var maxHeight = 0;

    for (var i = 0, n = $items.length; i < n; i++) {
        var item = $items[i];
        maxHeight = Math.max(maxHeight, item.height);
    }

	var hPadding = Math.round(maxHeight * 0.65), vPadding = Math.round(maxHeight * 0.5);

    for (var i = 0, n = $items.length, x = 1, y = 1; i < n; i++) {
        var item = $items[i];
        if($justified) {
	        var iItemWidth = i == n - 1 ? lastItemWidth : itemWidth;
        } else {
	    	var itemWidth = Math.round(width * (item.width + hPadding * 2) / prefWidth);
        	var iItemWidth = i == n - 1 ? width - x + 1 : itemWidth;
        }
        var iFill = i == selectionIndex ? selectionColor : "white";
        var bgTemplate;

        if (n == 1) {
        	bgTemplate = backgroundSingle;
        } else if (i == 0) {
        	bgTemplate = backgroundLeft;
        } else if (i == n - 1) {
        	bgTemplate = backgroundRight;
        } else {
        	bgTemplate = backgroundMiddle;
        }

        var bg = bgTemplate.cloneNode(false);
		resizeBackground(bgTemplate, bg, x, y, iItemWidth, height);
        bg.setAttribute("fill", iFill);
        container.appendChild(bg);

        var text = doc.createElement("foreignObject");
        text.setAttribute("id", "item" + i);
        text.setAttribute("x", x - 1);
        text.setAttribute("y", y - 1)
        text.setAttribute("width", iItemWidth);
        text.setAttribute("height", height);
        text.setAttribute("fill", iFill);
        container.appendChild(text);
        
        x += itemWidth;
    }

	if(!$justified) {
    	var itemWidth = Math.round(width * ($items[0].width + hPadding * 2) / prefWidth);
    }
    
    for (var i = 1, n = $items.length - 1, x = itemWidth; i <= n; i++) {
        var item = $items[i];
        var sep = separator.cloneNode(false);
        sep.setAttribute("d", "M" + x + ",2," + x + "," + (height - 2));
        container.appendChild(sep);
        if(!$justified) {
	    	var itemWidth = i == n ? width - x + 1 : Math.round(width * (item.width + hPadding * 2) / prefWidth);
	    }
        x += itemWidth;
    }
}

function resizeBar(element, width, height) {
    element.setAttribute("width", width - 2);
    element.setAttribute("height", height - 2);
}
	

function clearNode(node) {
    while (node.firstChild) {
        node.removeChild(node.firstChild);
    }
}

function getPreferredSize() {
    var width = 0,
        maxHeight = 0,
        maxWidth = 0;

    for (var i = 0, n = $items.length; i < n; i++) {
        var item = $items[i];
        maxWidth = Math.max(maxWidth, item.width);
        maxHeight = Math.max(maxHeight, item.height);
    }

	var hPadding = Math.round(maxHeight * 0.65), vPadding = Math.round(maxHeight * 0.5);
	
	if($justified) {
		width = $items.length * (maxWidth + hPadding * 2);
	} else {
	    for (var i = 0, n = $items.length; i < n; i++) {
	        var item = $items[i];
	        width += item.width + hPadding * 2;
	    }   
	}

    maxHeight += vPadding * 2;

    return {
        width: width,
        height: maxHeight
    };
}
