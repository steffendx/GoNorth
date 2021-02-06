(function(GoNorth) {
    "use strict";
    (function(StateMachine) {
        (function(Shapes) {

            /// Start Type
            Shapes.startType = "state.Start";
            
            /// Start Target Array
            var startTargetArray = "start";

            /// Radius of the start node
            var startradius = 60;

            joint.shapes.state = joint.shapes.state || {};

            /**
             * Creates the start shape
             * @returns {object} Start shape
             * @memberof Shapes
             */
            function createStartShape() {
                var model = joint.shapes.basic.Circle.extend(
                {
                    markup: [
                        '<g class="rotatable">',
                            '<g class="scalable">',
                                '<circle/>',
                                '<g class="stateStartNodeDragHandle gn-nodeDeleteOnReadonly">',
                                    Shapes.buildMoveCross(),
                                '</g>',
                            '</g>',
                        '</g>'
                    ].join(''),
                    defaults: joint.util.deepSupplement
                    (
                        {
                            type: Shapes.startType,
                            size: { width: startradius, height: startradius },
                            attrs: {
                                circle: {
                                    class: 'stateNode',
                                    r: startradius,
                                    cx: startradius,
                                    cy: startradius,
                                    magnet: true
                                }
                            },
                            allowSingleConnectionOnly: true
                        },
                        joint.shapes.default.Base.prototype.defaults
                    )
                });
                return model;
            }

            /**
             * Start Shape
             */
            joint.shapes.state.Start = createStartShape();

            /** 
             * Start Serializer 
             * 
             * @class
             */
            Shapes.StartSerializer = function()
            {
                GoNorth.DefaultNodeShapes.Serialize.BaseNodeSerializer.apply(this, [ joint.shapes.state.Start, Shapes.startType, startTargetArray ]);
            };

            Shapes.StartSerializer.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.Serialize.BaseNodeSerializer.prototype)

            /**
             * Serializes a node
             * 
             * @param {object} node Node Object
             * @returns {object} Serialized NOde
             */
            Shapes.StartSerializer.prototype.serialize = function(node) {
                var serializedData = {
                    id: node.id,
                    x: node.position.x,
                    y: node.position.y
                };

                return serializedData;
            };

            /**
             * Deserializes a serialized node
             * 
             * @param {object} node Serialized Node Object
             * @returns {object} Deserialized Node
             */
            Shapes.StartSerializer.prototype.deserialize = function(node) {
                var initOptions = {
                    id: node.id,
                    position: { x: node.x, y: node.y }
                };

                var node = new this.classType(initOptions);
                return node;
            };

            // Register Serializers
            var startSerializer = new Shapes.StartSerializer();
            GoNorth.DefaultNodeShapes.Serialize.getNodeSerializerInstance().addNodeSerializer(startSerializer);

        }(StateMachine.Shapes = StateMachine.Shapes || {}));
    }(GoNorth.StateMachine = GoNorth.StateMachine || {}));
}(window.GoNorth = window.GoNorth || {}));