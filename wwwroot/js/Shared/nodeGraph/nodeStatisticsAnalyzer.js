(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        
        /**
         * Returns the node statistics for 
         * @param {object} nodeGraph Node graph
         * @param {object} nodePaper Node paper
         * @returns {object} Statistics
         */
        DefaultNodeShapes.getNodeStatistics = function(nodeGraph, nodePaper) {
            var statisticsByNode = {};
            var knownNodeTypes = GoNorth.DefaultNodeShapes.Serialize.getNodeSerializerInstance().getKnownNodeTypes();
            for(var curNodeType = 0; curNodeType < knownNodeTypes.length; ++curNodeType)
            {
                statisticsByNode[knownNodeTypes[curNodeType]] = {
                    nodeCount: 0,
                    wordCount: 0,
                    conditionCount: 0
                };
            }

            var elements = nodeGraph.getElements();
            for(var curElement = 0; curElement < elements.length; ++curElement)
            {
                var model = nodePaper.findViewByModel(elements[curElement].id);
                if(!model || !model.getStatistics) {
                    continue;
                }

                var nodeType = elements[curElement].attributes["type"];
                if(!statisticsByNode[nodeType]) {
                    statisticsByNode[nodeType] = {
                        nodeCount: 0,
                        wordCount: 0,
                        conditionCount: 0
                    };
                }

                ++statisticsByNode[nodeType].nodeCount;
                
                var statistics = model.getStatistics();
                for(var curProp in statistics) {
                    if(!statistics.hasOwnProperty(curProp)) {
                        continue;
                    }

                    if(!statisticsByNode[nodeType][curProp]) {
                        statisticsByNode[nodeType][curProp] = 0;
                    }

                    statisticsByNode[nodeType][curProp] += statistics[curProp];
                }
            }

            var totalNodeCount = 0;
            var totalWordCount = 0;
            var totalConditionCount = 0;
            for(var curElement in statisticsByNode) {
                if(!statisticsByNode.hasOwnProperty(curElement)) {
                    continue;
                }

                if(statisticsByNode[curElement].nodeCount) {
                    totalNodeCount += statisticsByNode[curElement].nodeCount;
                }

                if(statisticsByNode[curElement].wordCount) {
                    totalWordCount += statisticsByNode[curElement].wordCount;
                }

                if(statisticsByNode[curElement].conditionCount) {
                    totalConditionCount += statisticsByNode[curElement].conditionCount;
                }
            }

            statisticsByNode["totalNodeCount"] = totalNodeCount;
            statisticsByNode["totalWordCount"] = totalWordCount;
            statisticsByNode["totalConditionCount"] = totalConditionCount;

            return statisticsByNode;
        }

    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));