(function(GoNorth) {
    "use strict";
    (function(Aika) {
        (function(Shared) {

            /// All Done Type
            var allDoneType = "aika.AllDone";

            /// All Done Target Array
            var allDoneTargetArray = "allDone";

            joint.shapes.aika = joint.shapes.aika || {};

            /**
             * Creates the All Done shape
             * @returns {object} All Done shape
             */
            function createAllDoneShape()
            {
                var model = joint.shapes.devs.Model.extend(
                {
                    defaults: joint.util.deepSupplement
                    (
                        {
                            type: allDoneType,
                            icon: "glyphicon-resize-small",
                            size: { width: 175, height: 50 },
                            inPorts: ['input'],
                            outPorts: ['output'],
                            attrs:
                            {
                                '.inPorts circle': { "magnet": "passive", "port-type": "input" },
                                '.outPorts circle': { "magnet": "true" }
                            }
                        },
                        joint.shapes.default.Base.prototype.defaults
                    )
                });
                return model;
            }

            /**
             * Creates a All Done view
             * @returns {object} All Done view
             */
            function createAllDoneView()
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
                            '<button class="delete gn-nodeDeleteOnReadonly cornerButton" title="' + GoNorth.DefaultNodeShapes.Localization.DeleteNode + '">x</button>',
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
             * All Done Shape
             */
            joint.shapes.aika.AllDone = createAllDoneShape();

            /**
             * All Done View
             */
            joint.shapes.aika.AllDoneView = createAllDoneView();


            /** 
             * All Done Serializer 
             * 
             * @class
             */
            Shared.AllDoneSerializer = function()
            {
                GoNorth.DefaultNodeShapes.Serialize.BaseNodeSerializer.apply(this, [joint.shapes.aika.AllDone, allDoneType, allDoneTargetArray ]);
            };

            Shared.AllDoneSerializer.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.Serialize.BaseNodeSerializer.prototype)

            /**
             * Serializes a node
             * 
             * @param {object} node Node Object
             * @returns {object} Serialized NOde
             */
            Shared.AllDoneSerializer.prototype.serialize = function(node) 
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
            Shared.AllDoneSerializer.prototype.deserialize = function(node) 
            {
                var initOptions = {
                    id: node.id,
                    position: { x: node.x, y: node.y }
                };

                var node = new this.classType(initOptions);
                return node;
            };

            // Register Serializers
            var allDoneSerializer = new Shared.AllDoneSerializer();
            GoNorth.DefaultNodeShapes.Serialize.getNodeSerializerInstance().addNodeSerializer(allDoneSerializer);

        }(Aika.Shared = Aika.Shared || {}));
    }(GoNorth.Aika = GoNorth.Aika || {}));
}(window.GoNorth = window.GoNorth || {}));