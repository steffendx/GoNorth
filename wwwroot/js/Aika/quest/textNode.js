(function(GoNorth) {
    "use strict";
    (function(Aika) {
        (function(Quest) {

            /// Text Type
            var textType = "aika.Text";

            /// Text Target Array
            var textTargetArray = "text";

            joint.shapes.aika = joint.shapes.aika || {};

            /**
             * Creates the text shape
             * @returns {object} Text shape
             * @memberof Quest
             */
            function createTextShape() {
                var model = joint.shapes.devs.Model.extend(
                {
                    defaults: joint.util.deepSupplement
                    (
                        {
                            type: textType,
                            icon: "glyphicon-text-background",
                            size: { width: 250, height: 150 },
                            inPorts: [ 'input' ],
                            outPorts: [ 'output' ],
                            attrs:
                            {
                                '.inPorts circle': { "magnet": "passive", "port-type": "input" },
                                '.outPorts circle': { "magnet": "true" } 
                            },
                            text: ""
                        },
                        joint.shapes.default.Base.prototype.defaults
                    )
                });
                return model;
            }

            /**
             * Creates a text view
             * @returns {object} Text view
             * @memberof Quest
             */
            function createTextView() {
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
                            '<textarea class="nodeText" placeholder="' + Aika.Localization.TextNode.Text + '"></textarea>',
                        '</div>',
                    ].join('')
                });
            }

            /**
             * Text Shape
             */
            joint.shapes.aika.Text = createTextShape();

            /**
             * Text View
             */
            joint.shapes.aika.TextView = createTextView();


            /** 
             * Text Serializer 
             * 
             * @class
             */
            Quest.TextSerializer = function()
            {
                GoNorth.DefaultNodeShapes.Serialize.BaseNodeSerializer.apply(this, [joint.shapes.aika.Text, textType, textTargetArray ]);
            };

            Quest.TextSerializer.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.Serialize.BaseNodeSerializer.prototype)

            /**
             * Serializes a node
             * 
             * @param {object} node Node Object
             * @returns {object} Serialized NOde
             */
            Quest.TextSerializer.prototype.serialize = function(node) {
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
            Quest.TextSerializer.prototype.deserialize = function(node) {
                var initOptions = {
                    id: node.id,
                    position: { x: node.x, y: node.y },
                    nodeText: node.text
                };

                var node = new this.classType(initOptions);
                return node;
            };

            // Register Serializers
            var textSerializer = new Quest.TextSerializer();
            GoNorth.DefaultNodeShapes.Serialize.getNodeSerializerInstance().addNodeSerializer(textSerializer);

        }(Aika.Quest = Aika.Quest || {}));
    }(GoNorth.Aika = GoNorth.Aika || {}));
}(window.GoNorth = window.GoNorth || {}));