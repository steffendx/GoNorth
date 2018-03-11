(function(GoNorth) {
    "use strict";
    (function(BindingHandlers) {

        if(typeof ko !== "undefined")
        {

            /// Scale Step
            var scaleStep = 0.1;

            /// Min Scale
            var minScale = 0.1;

        
            /**
             * Calculates the touch distance
             * @param {object[]} touches Touch objects
             * @returns {float} Touch distance
             */
            function calcTouchDistance(touches) {
                var distanceX = touches[0].screenX - touches[1].screenX;
                var distanceY = touches[0].screenY - touches[1].screenY;
                return Math.sqrt(distanceX * distanceX + distanceY * distanceY);
            }


            /**
             * Rounds a value to one digit
             * @param {float} value Value to round
             * @returns {float} Rounded Value
             */
            function roundToOneDigit(value) {
                return Math.round(value * 10) / 10;
            }

            /**
             * Updates the position and zoom display
             * @param {object} element Html which contains the display element
             * @param {object} paper JointJs paper
             */
            function updatePositionZoomDisplay(element, paper) {
                var scale = paper.scale().sx;
                var displayString = GoNorth.DefaultNodeShapes.Localization.NodeDisplay.Position + " " + roundToOneDigit(-paper.translate().tx) + "," + roundToOneDigit(-paper.translate().ty) + " ";
                displayString += GoNorth.DefaultNodeShapes.Localization.NodeDisplay.Zoom + " " + roundToOneDigit(scale);

                jQuery(element).find(".gn-nodeGraphPositionZoomIndicatorText").text(displayString);
            }

            /**
             * Updates the mini map
             * 
             * @param {object} element Element containing the node graph
             * @param {object} paper Paper object
             * @param {bool} showMiniMap true if the mini map is shown, else false
             */
            function updateMiniMap(element, paper, showMiniMap) {
                if(!showMiniMap)
                {
                    return;
                }

                var miniMapContainer = jQuery(element).children(".gn-nodeGraphMiniMap");
                var sourceSvg = jQuery(element).children("svg");
                if(sourceSvg.length == 0)
                {
                    return;
                }

                // Get Positions and Viewports
                var viewBoundingBox = paper.getContentBBox();
                var scale = paper.scale().sx;
                var position = paper.translate();
                viewBoundingBox.x /= scale;
                viewBoundingBox.y /= scale;
                viewBoundingBox.width /= scale;
                viewBoundingBox.height /= scale;
                viewBoundingBox.x -= position.tx / scale;
                viewBoundingBox.y -= position.ty / scale;
                viewBoundingBox.right = viewBoundingBox.x + viewBoundingBox.width;
                viewBoundingBox.bottom = viewBoundingBox.y + viewBoundingBox.height;

                var parentElement = jQuery(element).parent();
                var viewPortBoundingBox = {
                    x: -position.tx / scale,
                    y: -position.ty / scale,
                    width: parentElement.width() / scale,
                    height: parentElement.height() / scale
                };

                // Adjust view bounding box to always incoperate camera
                if(viewPortBoundingBox.x < viewBoundingBox.x)
                {
                    viewBoundingBox.x = viewPortBoundingBox.x;
                }
                if(viewPortBoundingBox.x + viewPortBoundingBox.width > viewBoundingBox.right)
                {
                    viewBoundingBox.right = viewPortBoundingBox.x + viewPortBoundingBox.width;
                }

                if(viewPortBoundingBox.y < viewBoundingBox.y)
                {
                    viewBoundingBox.y = viewPortBoundingBox.y;
                }
                if(viewPortBoundingBox.y + viewPortBoundingBox.height > viewBoundingBox.bottom)
                {
                    viewBoundingBox.bottom = viewPortBoundingBox.y + viewPortBoundingBox.height;
                }

                // Get Node SVG and adjust it for mini map
                viewBoundingBox.width = viewBoundingBox.right - viewBoundingBox.x;
                viewBoundingBox.height = viewBoundingBox.bottom - viewBoundingBox.y;
                var miniMap = jQuery(sourceSvg[0].outerHTML);
                miniMap.attr("viewBox", viewBoundingBox.x + " " + viewBoundingBox.y + " " + viewBoundingBox.width + " " + viewBoundingBox.height);
                miniMap.children(".joint-viewport").removeAttr("transform");
                miniMap.find("rect").attr("fill-opacity", "1");
                miniMap.find("rect").attr("fill", "#666");
                miniMap.find("path").attr("fill", "none");
                miniMap.find(".tool-options").remove();
                miniMap.find(".tool-remove").remove();

                // Add viewport
                var viewPortStrokeWidth = viewBoundingBox.width / 400;
                miniMap.children(".joint-viewport").append("<rect width='" + viewPortBoundingBox.width + "' height='" + viewPortBoundingBox.height + "' transform='translate(" + viewPortBoundingBox.x + "," + viewPortBoundingBox.y + ")' fill='none' stroke='#fff' style='stroke-width: " + viewPortStrokeWidth + "'></rect>");

                miniMapContainer.html(miniMap[0].outerHTML);
            }

            // Create throttled version of update mini map
            var throttledUpdatedMiniMap = GoNorth.Util.throttle(updateMiniMap, 35);


            /**
             * Node Graph Binding Handler
             */
            ko.bindingHandlers.nodeGraph = {
                init: function (element, valueAccessor, allBindings) {
                    var allowMultipleOutboundForNodes = false;
                    if(allBindings.get("nodeGraphAllowMultpleOutbound"))
                    {
                        allowMultipleOutboundForNodes = allBindings.get("nodeGraphAllowMultpleOutbound");
                    }

                    var graph = new joint.dia.Graph();
                    var paper = new joint.dia.Paper(
                    {
                        el: element,
                        width: 16000,
                        height: 8000,
                        gridSize: 1,
                        model: graph,
                        defaultLink: GoNorth.DefaultNodeShapes.Connections.createDefaultLink(),
                        snapLinks: { radius: 75 }, 
                        markAvailable: true,
                        linkPinning: false,
                        validateConnection: function(cellViewS, magnetS, cellViewT, magnetT, end, linkView) {
                          // Prevent linking from output ports to input ports within one element.
                          if (cellViewS === cellViewT) 
                          {
                              return false;
                          }

                          // Prevent linking to output ports.
                          return magnetT.getAttribute("port-type") === "input";
                        },
                        validateMagnet: function(cellView, magnet) {
                            if(allowMultipleOutboundForNodes)
                            {
                                return magnet.getAttribute("magnet") !== "passive";
                            }

                            var port = magnet.getAttribute("port");

                            // Delete old links on new drag
                            var links = graph.getConnectedLinks(cellView.model, { outbound: true });
                            for(var curLink = links.length - 1; curLink >= 0; --curLink)
                            {
                                if(links[curLink].attributes && links[curLink].attributes.source && links[curLink].attributes.source.port === port)
                                {
                                    links[curLink].remove();
                                }
                            }
                            return magnet.getAttribute("magnet") !== "passive";
                        }
                    });

                    // Add mini Map update events
                    var showMiniMap = false;
                    graph.on("change", function() {
                        throttledUpdatedMiniMap(element, paper, showMiniMap);
                    });
                    graph.on("add", function() {
                        throttledUpdatedMiniMap(element, paper, showMiniMap);
                    });
                    graph.on("remove", function() {
                        throttledUpdatedMiniMap(element, paper, showMiniMap);
                    });
                    jQuery(window).resize(function() {
                        throttledUpdatedMiniMap(element, paper, showMiniMap);
                    });

                    // Set Observables
                    var graphObs = valueAccessor();
                    if(ko.isObservable(graphObs))
                    {
                        graphObs(graph);
                    }

                    var paperObs = allBindings.get("nodePaper");
                    if(paperObs && ko.isObservable(paperObs))
                    {
                        paperObs(paper);
                    }

                    // Zoom
                    jQuery(element).on("mousewheel DOMMouseScroll", function(event) {
                        var wheelDirection = 1;
                        if(event.originalEvent.wheelDelta < 0 || event.originalEvent.detail > 0)
                        {
                            wheelDirection = -1;
                        }

                        var oldScale = paper.scale().sx;
                        var newScale = oldScale + wheelDirection * scaleStep;
                        if(newScale >= minScale)
                        {
                            paper.scale(newScale, newScale);
                            updatePositionZoomDisplay(element, paper);
                            throttledUpdatedMiniMap(element, paper, showMiniMap);
                        }

                        event.preventDefault();
                    });

                    // Pan
                    var dragStartPosition = null;
                    var blockStart = false;
                    paper.on('blank:pointerdown', function(event, x, y) {
                        jQuery(element).addClass("gn-nodeGraph-dragging");
                        if(!blockStart)
                        {
                            dragStartPosition = { x: x * paper.scale().sx, y: y * paper.scale().sy};
                        }
                    });

                    paper.on('cell:pointerup blank:pointerup', function(cellView, x, y) {
                        jQuery(element).removeClass("gn-nodeGraph-dragging");
                        dragStartPosition = null;
                    });

                    jQuery(element).on("mousemove", function(event) {
                        if(dragStartPosition)
                        {
                            paper.translate(event.offsetX - dragStartPosition.x, event.offsetY - dragStartPosition.y);
                            updatePositionZoomDisplay(element, paper);
                            throttledUpdatedMiniMap(element, paper, showMiniMap);
                        }
                    });

                    // Touch
                    var dragStartTransform = null;
                    var dragStartDistance = null;
                    var dragStartScale = null;
                    jQuery(element).find("svg").on("touchstart", function(event) {
                        if(jQuery(event.target).attr("id") != jQuery(element).find("svg").attr("id"))
                        {
                            return;
                        }

                        if(event.originalEvent.touches && event.originalEvent.touches.length == 1)
                        {
                            dragStartPosition = { x: event.originalEvent.touches[0].screenX, y: event.originalEvent.touches[0].screenY };
                            dragStartTransform = { x: paper.translate().tx, y: paper.translate().ty }
                            blockStart = true;
                            setTimeout(function() {
                                blockStart = false;
                            }, 10);
                        }
                        else if(event.originalEvent.touches && event.originalEvent.touches.length == 2)
                        {
                            dragStartDistance = calcTouchDistance(event.originalEvent.touches);
                            dragStartScale = paper.scale().sx;
                        }
                    });

                    jQuery(element).on("touchmove", function(event) {
                        if(dragStartPosition && event.originalEvent.touches && event.originalEvent.touches.length == 1)
                        {
                            paper.translate(event.originalEvent.touches[0].screenX - dragStartPosition.x + dragStartTransform.x, event.originalEvent.touches[0].screenY - dragStartPosition.y + dragStartTransform.y);
                            updatePositionZoomDisplay(element, paper);
                            throttledUpdatedMiniMap(element, paper, showMiniMap);
                        }
                        else if(dragStartDistance && event.originalEvent.touches && event.originalEvent.touches.length == 2)
                        {
                            var newDistance = calcTouchDistance(event.originalEvent.touches);
                            var newScale = dragStartScale * (newDistance / dragStartDistance);
                            if(newScale >= minScale)
                            {
                                paper.scale(newScale, newScale);
                                updatePositionZoomDisplay(element, paper);
                                throttledUpdatedMiniMap(element, paper, showMiniMap);
                            }
                        }
                    });

                    jQuery(element).on("touchend touchcancel", function(event) {
                        dragStartPosition = null;
                        dragStartTransform = null;
                        dragStartDistance = null;
                        dragStartScale = null;
                    });

                    // Styling
                    jQuery(element).addClass("gn-nodeGraph");

                    jQuery(element).append("<div class='gn-nodeGraphPositionZoomIndicator'><span class='gn-nodeGraphPositionZoomIndicatorText'></span><span><a class='gn-clickable gn-nodeGraphToogleMinimap' title='" + GoNorth.DefaultNodeShapes.Localization.NodeDisplay.ToogleMiniMap + "'><i class='glyphicon glyphicon-chevron-down'></i></a></span></div>");
                    jQuery(element).append("<div class='gn-nodeGraphMiniMap' style='display: none'></div>");

                    jQuery(element).find(".gn-nodeGraphToogleMinimap").click(function() {
                        showMiniMap = !showMiniMap;
                        if(showMiniMap)
                        {
                            jQuery(element).find(".gn-nodeGraphMiniMap").slideDown(200);
                            jQuery(this).children("i").removeClass("glyphicon-chevron-down");
                            jQuery(this).children("i").addClass("glyphicon-chevron-up");
                            throttledUpdatedMiniMap(element, paper, showMiniMap);
                        }
                        else
                        {
                            jQuery(element).find(".gn-nodeGraphMiniMap").slideUp(200);
                            jQuery(this).children("i").removeClass("glyphicon-chevron-up");
                            jQuery(this).children("i").addClass("glyphicon-chevron-down");
                        }
                    });

                    updatePositionZoomDisplay(element, paper);
                },
                update: function (element, valueAccessor) {
                }
            }

        }

    }(GoNorth.BindingHandlers = GoNorth.BindingHandlers || {}));
}(window.GoNorth = window.GoNorth || {}));