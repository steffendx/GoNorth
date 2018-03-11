(function(GoNorth) {
    "use strict";
    (function(Evne) {
        (function(Skill) {

            /// Text Type
            var textType = "evne.Text";

            /// Text Target Array
            var textTargetArray = "text";

            joint.shapes.evne = joint.shapes.evne || {};

            /**
             * Creates the text shape
             * @returns {object} Text shape
             * @memberof Skill
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
             * @memberof Skill
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
                            '<textarea class="nodeText" placeholder="' + Evne.Localization.TextNode.Text + '" />',
                        '</div>',
                    ].join('')
                });
            }

            /**
             * Text Shape
             */
            joint.shapes.evne.Text = createTextShape();

            /**
             * Text View
             */
            joint.shapes.evne.TextView = createTextView();


            /** 
             * Text Serializer 
             * 
             * @class
             */
            Skill.TextSerializer = function()
            {
                GoNorth.DefaultNodeShapes.Serialize.BaseNodeSerializer.apply(this, [joint.shapes.evne.Text, textType, textTargetArray ]);
            };

            Skill.TextSerializer.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.Serialize.BaseNodeSerializer.prototype)

            /**
             * Serializes a node
             * 
             * @param {object} node Node Object
             * @returns {object} Serialized NOde
             */
            Skill.TextSerializer.prototype.serialize = function(node) {
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
            Skill.TextSerializer.prototype.deserialize = function(node) {
                var initOptions = {
                    id: node.id,
                    position: { x: node.x, y: node.y },
                    nodeText: node.text
                };

                var node = new this.classType(initOptions);
                return node;
            };

            // Register Serializers
            var textSerializer = new Skill.TextSerializer();
            GoNorth.DefaultNodeShapes.Serialize.getNodeSerializerInstance().addNodeSerializer(textSerializer);

        }(Evne.Skill = Evne.Skill || {}));
    }(GoNorth.Evne = GoNorth.Evne || {}));
}(window.GoNorth = window.GoNorth || {}));