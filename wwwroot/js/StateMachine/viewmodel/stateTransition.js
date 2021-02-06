(function(GoNorth) {
    "use strict";
    (function(StateMachine) {
        (function(Shapes) {

            /**
             * Creates a state link
             * @param {object} initData Data for initalizing
             * @returns {object} State link
             */
            Shapes.createStateTransition = function(initData) {
                var linkData = {
                    attrs: {
                        ".marker-target": { d: "M 10 0 L 0 5 L 10 10 z" },
                        ".link-tools .tool-remove circle, .marker-vertex": { r: 8 }
                    }
                };
                if(initData)
                {
                    linkData = jQuery.extend(initData, linkData);
                }
                var link = new joint.dia.Link(linkData);
                if(!link.label(0)) {
                    link.label(0, { attrs: { text: { text: '' } } });
                }
                link.set("smooth", true);
                return link;
            };

        }(StateMachine.Shapes = StateMachine.Shapes || {}));
    }(GoNorth.StateMachine = GoNorth.StateMachine || {}));
}(window.GoNorth = window.GoNorth || {}));