(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Connections) {

            /**
             * Creates a default link
             * @param {object} initData Data for initalizing
             */
            Connections.createDefaultLink = function(initData) {
                var linkData = {
                    attrs: {
                        ".marker-target": { d: "M 10 0 L 0 5 L 10 10 z" },
                        ".link-tools .tool-remove circle, .marker-vertex": { r: 8 },
                        ".link-tools .tool-remove title": { text: DefaultNodeShapes.Localization.Links.Delete },
                        ".link-tools .tool-options title": { text: DefaultNodeShapes.Localization.Links.Rename },
                        ".link-tools .tool-options": { class: "tool-options gn-showLinkOptions" }
                    }
                };
                if(initData)
                {
                    linkData = jQuery.extend(initData, linkData);
                }
                var link = new joint.dia.Link(linkData);
                link.set("smooth", true);
                return link;
            };

        }(DefaultNodeShapes.Connections = DefaultNodeShapes.Connections || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));