(function(GoNorth) {
    "use strict";
    (function(Aika) {
        (function(Shared) {

            /// Start Type
            Shared.startType = "aika.Start";

            /// Start Target Array
            var startTargetArray = "start";

            joint.shapes.aika = joint.shapes.aika || {};

            /**
             * Creates the start shape
             * @returns {object} Start shape
             */
            function createStartShape()
            {
                var model = joint.shapes.devs.Model.extend(
                {
                    defaults: joint.util.deepSupplement
                    (
                        {
                            type: Shared.startType,
                            icon: "glyphicon-play",
                            size: { width: 100, height: 50 },
                            inPorts: [],
                            outPorts: ['output'],
                            attrs:
                            {
                                '.outPorts circle': { "magnet": "true" }
                            }
                        },
                        joint.shapes.default.Base.prototype.defaults
                    )
                });
                return model;
            }

            /**
             * Creates a start view
             * @returns {object} Start view
             */
            function createStartView()
            {
                return joint.shapes.default.BaseView.extend(
                {
                    /**
                     * Template
                     */
                    template:
                    [
                        '<div class="node">',
                            '<span class="label"><i class="nodeIcon glyphicon"></i><span class="labelText"></span></span>',
                        '</div>',
                    ].join(''),

                    /**
                     * Returns statistics for the node
                     * @returns Node statistics
                     */
                    getStatistics: function() {
                        return {
                            conditionCount: 0,
                            wordCount: 0
                        };
                    }
                });
            }

            /**
             * Start Shape
             */
            joint.shapes.aika.Start = createStartShape();

            /**
             * Start View
             */
            joint.shapes.aika.StartView = createStartView();


            /** 
             * Start Serializer 
             * 
             * @class
             */
            Shared.StartSerializer = function()
            {
                GoNorth.DefaultNodeShapes.Serialize.BaseNodeSerializer.apply(this, [joint.shapes.aika.Start, Shared.startType, startTargetArray ]);
            };

            Shared.StartSerializer.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.Serialize.BaseNodeSerializer.prototype)

            /**
             * Serializes a node
             * 
             * @param {object} node Node Object
             * @returns {object} Serialized NOde
             */
            Shared.StartSerializer.prototype.serialize = function(node) 
            {
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
            Shared.StartSerializer.prototype.deserialize = function(node) 
            {
                var initOptions = {
                    id: node.id,
                    position: { x: node.x, y: node.y }
                };

                var node = new this.classType(initOptions);
                return node;
            };

            // Register Serializers
            var startSerializer = new Shared.StartSerializer();
            GoNorth.DefaultNodeShapes.Serialize.getNodeSerializerInstance().addNodeSerializer(startSerializer);

        }(Aika.Shared = Aika.Shared || {}));
    }(GoNorth.Aika = GoNorth.Aika || {}));
}(window.GoNorth = window.GoNorth || {}));