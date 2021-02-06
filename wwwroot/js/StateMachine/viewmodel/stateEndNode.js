(function(GoNorth) {
    "use strict";
    (function(StateMachine) {
        (function(Shapes) {

            /// End Type
            Shapes.endType = "state.End";
            
            /// End Target Array
            var endTargetArray = "end";

            /// Radius of the end node
            var endradius = 60;
            
            /// Outer Radius of the end node
            var outerEndRadius = 80;

            joint.shapes.state = joint.shapes.state || {};

            /**
             * Creates the end shape
             * @returns {object} End shape
             * @memberof Shapes
             */
            function createEndShape() {
                var model = joint.shapes.basic.Circle.extend(
                {
                    markup: [
                        '<g class="rotatable">',
                            '<g class="scalable">',
                                '<circle class="innerCircle stateNode"/>',
                                '<circle class="outerCircle stateEndNodeOuter"/>',
                            '</g>',
                        '</g>'
                    ].join(''),
                    defaults: joint.util.deepSupplement
                    (
                        {
                            type: Shapes.endType,
                            size: { width: endradius, height: endradius },
                            attrs: {
                                ".innerCircle": {
                                    r: endradius,
                                    cx: outerEndRadius,
                                    cy: outerEndRadius
                                },
                                ".outerCircle": {
                                    r: outerEndRadius,
                                    cx: outerEndRadius,
                                    cy: outerEndRadius,
                                    magnet: "passive", 
                                    "port-type": "input"
                                }
                            }
                        },
                        joint.shapes.default.Base.prototype.defaults
                    )
                });
                return model;
            }

            /**
             * Creates an end view
             * @returns {object} End view
             * @memberof Shapes
             */
            function createEndView() {
                return joint.shapes.default.BaseView.extend(
                {
                    /**
                     * Template
                     */
                    template:
                    [
                        '<div class="stateNodeView stateNodeEndView">',
                            '<i class="delete glyphicon glyphicon-trash gn-nodeDeleteOnReadonly"></i>',
                        '</div>',
                    ].join(''),

                    /**
                     * Initializes the shape
                     */
                    initialize: function() {
                        joint.shapes.default.BaseView.prototype.initialize.apply(this, arguments);

                        this.$box.find('.delete').on('click', _.bind(function() {
                            if(!this.model.onDelete)
                            {
                                this.model.remove();
                            }
                            else
                            {
                                var self = this;
                                this.model.onDelete(this).done(function() {
                                    self.model.remove();
                                });
                            }
                        }, this));
                    }
                });
            }

            /**
             * End Shape
             */
            joint.shapes.state.End = createEndShape();

            /**
             * End Shape View
             */
            joint.shapes.state.EndView = createEndView();
            
            /** 
             * End Serializer 
             * 
             * @class
             */
            Shapes.EndSerializer = function()
            {
                GoNorth.DefaultNodeShapes.Serialize.BaseNodeSerializer.apply(this, [ joint.shapes.state.End, Shapes.endType, endTargetArray ]);
            };

            Shapes.EndSerializer.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.Serialize.BaseNodeSerializer.prototype)

            /**
             * Serializes a node
             * 
             * @param {object} node Node Object
             * @returns {object} Serialized NOde
             */
            Shapes.EndSerializer.prototype.serialize = function(node) {
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
            Shapes.EndSerializer.prototype.deserialize = function(node) {
                var initOptions = {
                    id: node.id,
                    position: { x: node.x, y: node.y }
                };

                var node = new this.classType(initOptions);
                return node;
            };

            // Register Serializers
            var endSerializer = new Shapes.EndSerializer();
            GoNorth.DefaultNodeShapes.Serialize.getNodeSerializerInstance().addNodeSerializer(endSerializer);

        }(StateMachine.Shapes = StateMachine.Shapes || {}));
    }(GoNorth.StateMachine = GoNorth.StateMachine || {}));
}(window.GoNorth = window.GoNorth || {}));