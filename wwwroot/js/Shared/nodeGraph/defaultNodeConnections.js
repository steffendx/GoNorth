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
                        ".link-tools .tool-hide title": { text: DefaultNodeShapes.Localization.Links.Hide },
                        ".link-tools .tool-options": { class: "tool-options gn-showLinkOptions" }
                    },
                    toolMarkup: '<g class="link-tool">' +
                                    '<g class="tool-remove" event="remove">' +
                                        '<circle r="11" />' +
                                        '<path transform="scale(.8) translate(-16, -16)" d="M24.778,21.419 19.276,15.917 24.777,10.415 21.949,7.585 16.447,13.087 10.945,7.585 8.117,10.415 13.618,15.917 8.116,21.419 10.946,24.248 16.447,18.746 21.948,24.248z" />' +
                                        '<title>Remove link.</title>' +
                                    '</g>' +
                                    '<g class="tool-options" event="link:options">' +
                                        '<circle r="11" transform="translate(25)" />' +
                                        '<path fill="white" transform="scale(.55) translate(29, -16)" d="M31.229,17.736c0.064-0.571,0.104-1.148,0.104-1.736s-0.04-1.166-0.104-1.737l-4.377-1.557c-0.218-0.716-0.504-1.401-0.851-2.05l1.993-4.192c-0.725-0.91-1.549-1.734-2.458-2.459l-4.193,1.994c-0.647-0.347-1.334-0.632-2.049-0.849l-1.558-4.378C17.165,0.708,16.588,0.667,16,0.667s-1.166,0.041-1.737,0.105L12.707,5.15c-0.716,0.217-1.401,0.502-2.05,0.849L6.464,4.005C5.554,4.73,4.73,5.554,4.005,6.464l1.994,4.192c-0.347,0.648-0.632,1.334-0.849,2.05l-4.378,1.557C0.708,14.834,0.667,15.412,0.667,16s0.041,1.165,0.105,1.736l4.378,1.558c0.217,0.715,0.502,1.401,0.849,2.049l-1.994,4.193c0.725,0.909,1.549,1.733,2.459,2.458l4.192-1.993c0.648,0.347,1.334,0.633,2.05,0.851l1.557,4.377c0.571,0.064,1.148,0.104,1.737,0.104c0.588,0,1.165-0.04,1.736-0.104l1.558-4.377c0.715-0.218,1.399-0.504,2.049-0.851l4.193,1.993c0.909-0.725,1.733-1.549,2.458-2.458l-1.993-4.193c0.347-0.647,0.633-1.334,0.851-2.049L31.229,17.736zM16,20.871c-2.69,0-4.872-2.182-4.872-4.871c0-2.69,2.182-4.872,4.872-4.872c2.689,0,4.871,2.182,4.871,4.872C20.871,18.689,18.689,20.871,16,20.871z" />' +
                                        '<title>Link options.</title>' +
                                    '</g>' +
                                    '<g class="tool-hide" event="link:hide" transform="translate(55)">' +
                                        '<circle r="11"/>' +
                                        '<path fill="white" transform="scale(.55) translate(-16, -16)" d="M16,7.55762c-5.7793,0-11.09814,2.63477-14.59229,7.22754c-0.54492,0.71533-0.54492,1.71436-0.00049,2.42871   C4.90186,21.80762,10.2207,24.44238,16,24.44238s11.09814-2.63477,14.59229-7.22754   c0.54492-0.71533,0.54492-1.71338,0.00049-2.42871C27.09814,10.19238,21.7793,7.55762,16,7.55762z M29.00098,16.00293   C25.8877,20.09521,21.14893,22.44238,16,22.44238s-9.8877-2.34717-13.00098-6.44531C6.1123,11.90479,10.85107,9.55762,16,9.55762   s9.8877,2.34717,13.00098,6.43945C29.00098,15.99756,29.00098,16.00244,29.00098,16.00293z" />'+
                                        '<path fill="white" transform="scale(.55) translate(-16, -16)" d="M16,10.146c-3.22803,0-5.854,2.62598-5.854,5.854s2.62598,5.854,5.854,5.854s5.854-2.62598,5.854-5.854   S19.22803,10.146,16,10.146z M16,19.854c-2.125,0-3.854-1.729-3.854-3.854s1.729-3.854,3.854-3.854s3.854,1.729,3.854,3.854   S18.125,19.854,16,19.854z" />' +
                                        '<title>Remove link.</title>' +
                                    '</g>' +
                                '</g>'
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