(function(GoNorth) {
    "use strict";
    (function(Tale) {
        (function(Shapes) {

            /// Player Text Type
            var playerTextType = "tale.PlayerText";

            /// Player Text Target Array
            var playerTextTargetArray = "playerText";


            /// Npc Text Type
            var npcTextType = "tale.NpcText";

            /// Npc Text Target Array
            var npcTextTargetArray = "npcText";


            joint.shapes.tale = joint.shapes.tale || {};

            /**
             * Creates the text shape
             * @param {string} type Type name of the shape
             * @returns {object} Text Shape
             * @memberof Shapes
             */
            function createTextShape(type) {
                var model = joint.shapes.devs.Model.extend(
                {
                    defaults: joint.util.deepSupplement
                    (
                        {
                            type: type,
                            icon: "glyphicon-comment",
                            size: { width: 250, height: 150 },
                            inPorts: ['input'],
                            outPorts: ['output'],
                            attrs:
                            {
                                '.inPorts circle': { "magnet": "passive", "port-type": "input" },
                                '.outPorts circle': { "magnet": "true" } 
                            },
                        },
                        joint.shapes.default.Base.prototype.defaults
                    )
                });
                return model;
            }

            /**
             * Creates a text view
             * @param {string} placeHolder Placeholder for the textarea
             * @returns {object} Text view 
             * @memberof Shapes
             */
            function createTextView(placeHolder) {
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
                            '<button class="toggleFullscreen toggleFullscreenOffset cornerButton" data-target=".nodeText" title="' + GoNorth.DefaultNodeShapes.Localization.SwitchToFullscreen + '"><i class="glyphicon glyphicon-resize-full"></i></button>',
                            '<textarea class="nodeText" placeholder="' + placeHolder + '"></textarea>',
                        '</div>',
                    ].join('')
                });
            }

            /**
             * PlayerText Shape
             */
            joint.shapes.tale.PlayerText = createTextShape(playerTextType);

            /**
             * PlayerText View
             */
            joint.shapes.tale.PlayerTextView = createTextView(Tale.Localization.PlayerTextPlaceHolder);


            /**
             * NpcText Shape
             */
            joint.shapes.tale.NpcText = createTextShape(npcTextType);
            
            /**
             * NpcText View
             */
            joint.shapes.tale.NpcTextView = createTextView(Tale.Localization.NpcTextPlaceHolder);


            /** 
             * Text Line Serializer 
             * 
             * @param {object} classType Class Type
             * @param {string} type Type for the serialization
             * @param {string} serializeArrayName Name of the target array for the serialization
             * @class
             */
            Shapes.TextLineSerializer = function(classType, type, serializeArrayName)
            {
                GoNorth.DefaultNodeShapes.Serialize.BaseNodeSerializer.apply(this, [classType, type, serializeArrayName ]);
            };

            Shapes.TextLineSerializer.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.Serialize.BaseNodeSerializer.prototype)

            /**
             * Serializes a node
             * 
             * @param {object} node Node Object
             * @returns {object} Serialized NOde
             */
            Shapes.TextLineSerializer.prototype.serialize = function(node) {
                var serializedData = {
                    id: node.id,
                    x: node.position.x,
                    y: node.position.y,
                    text: node.nodeText
                };

                return serializedData;
            };

            /**
             * Deserializes a serialized node
             * 
             * @param {object} node Serialized Node Object
             * @returns {object} Deserialized Node
             */
            Shapes.TextLineSerializer.prototype.deserialize = function(node) {
                var initOptions = {
                    id: node.id,
                    nodeText: node.text,
                    position: { x: node.x, y: node.y }
                };

                var node = new this.classType(initOptions);
                return node;
            };

            // Register Serializers
            var playerSerializer = new Shapes.TextLineSerializer(joint.shapes.tale.PlayerText, playerTextType, playerTextTargetArray);
            GoNorth.DefaultNodeShapes.Serialize.getNodeSerializerInstance().addNodeSerializer(playerSerializer);

            var npcSerializer = new Shapes.TextLineSerializer(joint.shapes.tale.NpcText, npcTextType, npcTextTargetArray);
            GoNorth.DefaultNodeShapes.Serialize.getNodeSerializerInstance().addNodeSerializer(npcSerializer);

        }(Tale.Shapes = Tale.Shapes || {}));
    }(GoNorth.Tale = GoNorth.Tale || {}));
}(window.GoNorth = window.GoNorth || {}));