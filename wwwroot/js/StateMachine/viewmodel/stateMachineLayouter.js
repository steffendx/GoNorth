(function(GoNorth) {
    "use strict";
    (function(StateMachine) {

        /// Link Gap
        var linkGap = 40;

        /// Step size of the links
        var selfLinkStepSize = 60;

        /// Angle offset for self links with target links
        var selfLinkAngleOffset = 35;

        /// Distance for self linkes to the node
        var selfLinkOffset = 110;

        /// Angle Width for self links
        var selfLinkAngleSize = 12;

        /**
         * Layouter for state machine
         * @class
         */
        StateMachine.StateMachineLayouter = function(nodeGraphObs, nodePaperObs)
        {
            var self = this;
            var linkSubscription = nodeGraphObs.subscribe(function(nodeGraph) {
                if(nodeGraph) {
                    nodeGraph.on('remove', function(link) {
                        if (link.get('source') && link.get('source').id && link.get('target') && link.get('target').id) {
                            self.adjustLinkVertices(nodeGraph, link);
                        }
                    });
                    linkSubscription.dispose();
                }
            });

            var linkPaperSubscription = nodePaperObs.subscribe(function(nodePaper) {
                if(nodePaper) {
                    nodePaper.on('link:connect link:disconnect', function(link) {
                        link = link.model || link;
                        if (link.get('source') && link.get('source').id && link.get('target') && link.get('target').id) {
                            self.adjustLinkVertices(link.graph, link);
                        }
                    });

                    nodePaper.on('cell:pointerup', function(cell) {
                        cell = cell.model || cell;
                        if(!cell.isLink()) {
                            self.updateLinkPositionsAfterMove(cell.graph, cell);
                        }
                    });
                    linkPaperSubscription.dispose();
                }
            });
        };

        StateMachine.StateMachineLayouter.prototype = {
            /**
             * Adjustes the link vertices to make sure they dont overlapy
             * @param {object} graph Node graph
             * @param {object} cell Link cell
             */
            adjustLinkVertices: function(graph, cell) {
                cell = cell.model || cell;

                var sourceId = cell.get('source').id || cell.previous('source').id;
                var targetId = cell.get('target').id || cell.previous('target').id;

                if (!sourceId || !targetId) 
                {
                    return;
                }

                if(sourceId != targetId) {
                    this.adjustLinkVerticesDifferentTargets(graph, sourceId, targetId);
                } else {
                    this.adjustLinkVerticesSameTargets(graph, sourceId);
                }
            },

            /**
             * Adjustes the link vertices to make sure they dont overlapy between to different cells
             * @param {object} graph Node graph
             * @param {object} cell Link cell
             * @param {string} sourceId Source id of the link
             * @param {string} targetId Target id of the link
             * @param {boolean} dontUpdateSameVerticesTargets true if the links for the same vertices target must not be updated
             */
            adjustLinkVerticesDifferentTargets: function(graph, sourceId, targetId, dontUpdateSameVerticesTargets) {
                if(!dontUpdateSameVerticesTargets) {
                    this.adjustLinkVerticesSameTargets(graph, sourceId);
                    this.adjustLinkVerticesSameTargets(graph, targetId);
                }

                var siblings = _.filter(graph.getLinks(), function(sibling) {
                    var siblingSourceId = sibling.get('source').id;
                    var siblingTargetId = sibling.get('target').id;
            
                    return ((siblingSourceId === sourceId) && (siblingTargetId === targetId)) || ((siblingSourceId === targetId) && (siblingTargetId === sourceId));
                });

                if(siblings.length == 0)
                {
                    return;
                }
                
                if(siblings.length == 1)
                {
                    _.each(siblings, function(sibling) {
                        sibling.set('vertices', []);
                    });
                    return;
                }

                var sourceCenter = graph.getCell(sourceId).getBBox().center();
                var targetCenter = graph.getCell(targetId).getBBox().center();

                var midPoint = g.Line(sourceCenter, targetCenter).midpoint();
                var theta = sourceCenter.theta(targetCenter);

                _.each(siblings, function(sibling, index) {
                    var offset = linkGap * Math.ceil(index / 2);

                    var sign = ((index % 2) ? 1 : -1);

                    if ((siblings.length % 2) === 0) {
                        offset -= ((linkGap / 2) * sign);
                    }

                    var reverse = ((theta < 180) ? 1 : -1);

                    var angle = g.toRad(theta + (sign * reverse * 90));
                    var vertex = g.Point.fromPolar(offset, angle, midPoint);

                    sibling.set("vertices", [vertex]);
                });
            },
        
            /**
             * Returns the angle distance between to angles
             * @param {number} angle1 First angle
             * @param {number} angle2 Second angle
             * @returns {number} Angle Distance
             */
            angleDistance: function(angle1, angle2) {
                var phi = Math.abs(angle2 - angle1) % 360; 
                return phi > 180 ? 360 - phi : phi;
            },

            /**
             * Adjustes the link vertices to make sure they dont overlap if the link has the same target
             * @param {object} graph Node graph
             * @param {string} nodeId Id of the node which is the source and target of the link
             */
            adjustLinkVerticesSameTargets: function(graph, nodeId) {
                var node = graph.getCell(nodeId);
                var sourceCenter = graph.getCell(nodeId).getBBox().center();
                var neighbors = graph.getNeighbors(node);

                var invalidAngles = [];
                _.each(neighbors, function(neighbor) {
                    if(neighbor.id === nodeId) {
                        return;
                    }
                        
                    var sourceCenter = node.getBBox().center();
                    var targetCenter = neighbor.getBBox().center();

                    var theta = sourceCenter.theta(targetCenter);
                    invalidAngles.push(theta);
                });

                invalidAngles = invalidAngles.sort(function(a, b) { return a - b; });

                var validLinks = _.filter(graph.getLinks(), function(sibling) {
                    var linkSourceId = sibling.get('source').id;
                    var linkTargetId = sibling.get('target').id;
            
                    return linkSourceId === nodeId && linkTargetId == nodeId;
                });

                var self = this;
                var additionalAngleOffset = 0;
                _.each(validLinks, function(link, index) {
                    var angleToUse = index * selfLinkStepSize + additionalAngleOffset;
                    for(var curAngle = 0; curAngle < invalidAngles.length; ++curAngle) {
                        var distance = self.angleDistance(angleToUse, invalidAngles[curAngle]);
                        if(distance < selfLinkAngleOffset) {
                            var targetAngle = invalidAngles[curAngle] + selfLinkAngleOffset;
                            additionalAngleOffset += targetAngle - angleToUse;
                            angleToUse = targetAngle;
                        }
                    }
                    var angle1 = g.toRad(angleToUse - selfLinkAngleSize);
                    var vertex1 = g.Point.fromPolar(selfLinkOffset, angle1, sourceCenter);
                    var angle2 = g.toRad(angleToUse + selfLinkAngleSize);
                    var vertex2 = g.Point.fromPolar(selfLinkOffset, angle2, sourceCenter);
                    link.set("vertices", [vertex1, vertex2]);
                });
            },

            /**
             * Adjustes the link vertices after the move of a node
             * @param {object} graph Node graph
             * @param {object} node Node
             */
            updateLinkPositionsAfterMove: function(graph, node) {
                var neighbors = graph.getNeighbors(node);

                var self = this;
                _.each(neighbors, function(neighbor) {
                    if(neighbor.id !== node.id) {
                        self.adjustLinkVerticesDifferentTargets(graph, node.id, neighbor.id, true);
                    }
                });

                this.adjustLinkVerticesSameTargets(graph, node.id);
            }
        }

    }(GoNorth.StateMachine = GoNorth.StateMachine || {}));
}(window.GoNorth = window.GoNorth || {}));