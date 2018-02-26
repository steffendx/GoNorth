(function(GoNorth) {
    "use strict";
    (function(Aika) {
        (function(Shared) {

            /**
             * Set the detail view id for new nodes
             * 
             * @param {object} nodeGraph Node Graph
             * @param {string} detailNodes Nodes with detail view ids
             */
            Shared.setDetailViewIds = function (nodeGraph, detailNodes) {
                if(!detailNodes)
                {
                    return;
                }

                var graphElements = nodeGraph.getElements();
                for(var curElement = 0; curElement < graphElements.length; ++curElement)
                {
                    var element = graphElements[curElement];
                    if(element.get("detailViewId"))
                    {
                        continue;
                    }

                    for(var curNode = 0; curNode < detailNodes.length; ++curNode)
                    {
                        if(element.id != detailNodes[curNode].id)
                        {
                            continue;
                        }

                        element.set("detailViewId", detailNodes[curNode].detailViewId);
                        break;
                    }
                }
            };

        }(Aika.Shared = Aika.Shared || {}));
    }(GoNorth.Aika = GoNorth.Aika || {}));
}(window.GoNorth = window.GoNorth || {}));