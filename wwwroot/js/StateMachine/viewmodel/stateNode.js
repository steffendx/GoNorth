(function(GoNorth) {
    "use strict";
    (function(StateMachine) {
        (function(Shapes) {

            /**
             * State script types
             */
            Shapes.StateScriptTypes = {
                none: -1,
                nodeGraph: 0,
                codeScript: 1
            };


            /// State Type
            var stateType = "state.State";
            
            /// State Target Array
            var stateTargetArray = "state";

            /// Radius of the state node
            var stateradius = 120;

            joint.shapes.state = joint.shapes.state || {};

            /**
             * Creates the state shape
             * @returns {object} State shape
             * @memberof Shapes
             */
            function createStateShape() {
                var model = joint.shapes.basic.Circle.extend(
                {
                    markup: [
                        '<g class="rotatable">',
                            '<g class="scalable">',
                                '<circle/>',
                                '<g class="stateNodeDragHandle gn-nodeDeleteOnReadonly">',
                                    Shapes.buildMoveCross(),
                                '</g>',
                            '</g>',
                        '</g>'
                    ].join(''),
                    defaults: joint.util.deepSupplement
                    (
                        {
                            type: stateType,
                            size: { width: stateradius, height: stateradius },
                            attrs: {
                                circle: {
                                    class: 'stateNode',
                                    r: stateradius,
                                    cx: stateradius,
                                    cy: stateradius,
                                    magnet: true,
                                    "port-type": "input"
                                }
                            },
                            name: "State",
                            description: "",
                            scriptType: Shapes.StateScriptTypes.none,
                            scriptName: "",
                            scriptCode: "",
                            scriptNodeGraph: null,
                            dontExportToScript: false
                        },
                        joint.shapes.default.Base.prototype.defaults
                    )
                });
                return model;
            }

            /**
             * Creates a state view
             * @returns {object} State view
             * @memberof Shapes
             */
            function createStateView() {
                return joint.shapes.default.BaseView.extend(
                {
                    /**
                     * Template
                     */
                    template:
                    [
                        '<div class="stateNodeView stateNodeStateView">',
                            '<i class="delete glyphicon glyphicon-trash gn-nodeDeleteOnReadonly"></i>',
                            '<input type="text" class="stateNodeText"/>',
                            '<i class="settings glyphicon glyphicon-cog gn-nodeDeleteOnReadonly"></i>',
                        '</div>',
                    ].join(''),

                    /**
                     * Initializes the shape
                     */
                    initialize: function() {
                        joint.shapes.default.BaseView.prototype.initialize.apply(this, arguments);

                        var stateNodeText = this.$box.find('.stateNodeText');
                        stateNodeText.val(this.model.get("name"));
                        
                        stateNodeText.on("change", _.bind(function() {
                            this.model.set("name", stateNodeText.val());
                        }, this));

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
                        
                        this.$box.find('.settings').on('click', _.bind(function() {
                            StateMachine.openStateSettings(this.model);
                        }, this));
                    }
                });
            }

            /**
             * State Shape
             */
            joint.shapes.state.State = createStateShape();

            /**
             * State Shape View
             */
            joint.shapes.state.StateView = createStateView();

            /** 
             * State Serializer 
             * 
             * @class
             */
            Shapes.StateSerializer = function()
            {
                GoNorth.DefaultNodeShapes.Serialize.BaseNodeSerializer.apply(this, [ joint.shapes.state.State, stateType, stateTargetArray ]);
            };

            Shapes.StateSerializer.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.Serialize.BaseNodeSerializer.prototype)

            /**
             * Serializes a node
             * 
             * @param {object} node Node Object
             * @returns {object} Serialized NOde
             */
            Shapes.StateSerializer.prototype.serialize = function(node) {
                var serializedData = {
                    id: node.id,
                    x: node.position.x,
                    y: node.position.y,
                    name: node.name,
                    description: node.description,
                    scriptType: node.scriptType,
                    scriptName: node.scriptName,
                    scriptCode: node.scriptCode,
                    scriptNodeGraph: node.scriptNodeGraph,
                    dontExportToScript: node.dontExportToScript
                };

                return serializedData;
            };

            /**
             * Deserializes a serialized node
             * 
             * @param {object} node Serialized Node Object
             * @returns {object} Deserialized Node
             */
            Shapes.StateSerializer.prototype.deserialize = function(node) {
                var initOptions = {
                    id: node.id,
                    position: { x: node.x, y: node.y },
                    name: node.name,
                    description: node.description,
                    scriptType: node.scriptType,
                    scriptName: node.scriptName,
                    scriptCode: node.scriptCode,
                    scriptNodeGraph: node.scriptNodeGraph,
                    dontExportToScript: node.dontExportToScript
                };

                var node = new this.classType(initOptions);
                return node;
            };

            // Register Serializers
            var stateSerializer = new Shapes.StateSerializer();
            GoNorth.DefaultNodeShapes.Serialize.getNodeSerializerInstance().addNodeSerializer(stateSerializer);

        }(StateMachine.Shapes = StateMachine.Shapes || {}));
    }(GoNorth.StateMachine = GoNorth.StateMachine || {}));
}(window.GoNorth = window.GoNorth || {}));