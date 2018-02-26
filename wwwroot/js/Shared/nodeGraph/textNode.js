(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Shapes) {

            /**
             * Text Shape
             */
            joint.shapes.default.Text = joint.shapes.devs.Model.extend(
            {
                defaults: joint.util.deepSupplement
                (
                    {
                        type: 'default.Text',
                        inPorts: ['input'],
                        outPorts: ['output'],
                        attrs:
                        {
                            '.outPorts circle': { unlimitedConnections: ['default.Choice'], }
                        },
                    },
                    joint.shapes.default.Base.prototype.defaults
                )
            });

            /**
             * Text View
             */
            joint.shapes.default.TextView = joint.shapes.default.BaseView.extend(
            {
                /**
                 * Template
                 */
                template:
                [
                    '<div class="node">',
                        '<span class="label"></span>',
                        '<button class="delete" title="' + GoNorth.DefaultNodeShapes.Localization.DeleteNode + '">x</button>',
                        '<input type="text" class="name" placeholder="' + DefaultNodeShapes.Localization.TextPlaceHolder + '" />',
                    '</div>',
                ].join('')
            });

        }(DefaultNodeShapes.Shapes = DefaultNodeShapes.Shapes || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));