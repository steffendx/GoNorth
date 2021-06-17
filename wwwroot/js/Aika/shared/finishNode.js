(function(GoNorth) {
    "use strict";
    (function(Aika) {
        (function(Shared) {

            /// Finish Type
            var finishType = "aika.Finish";

            /// Finish Target Array
            var finishTargetArray = "finish";

            /// Finish Colors
            var finishColors = [
                {
                    name: "White",
                    color: "#FFFFFF"
                },
                {
                    name: "Red",
                    color: "#CC0000"
                },
                {
                    name: "Green",
                    color: "#008800"
                },
                {
                    name: "Blue",
                    color: "#0000CC"
                },
                {
                    name: "Yellow",
                    color: "#FDFF00"
                },
                {
                    name: "Purple",
                    color: "#66008e"
                }
            ]

            joint.shapes.aika = joint.shapes.aika || {};

            /**
             * Creates the finish shape
             * @returns {object} Finish shape
             */
            function createFinishShape()
            {
                var model = joint.shapes.devs.Model.extend(
                {
                    defaults: joint.util.deepSupplement
                    (
                        {
                            type: finishType,
                            icon: "glyphicon-flag",
                            size: { width: 250, height: 150 },
                            inPorts: ['input'],
                            outPorts: [],
                            attrs:
                            {
                                '.inPorts circle': { "magnet": "passive", "port-type": "input" }
                            },
                            detailViewId: "",
                            finishName: "",
                            finishColor: finishColors[0].color
                        },
                        joint.shapes.default.Base.prototype.defaults
                    )
                });
                return model;
            }

            /**
             * Creates a finish view
             * @returns {object} Finish view
             */
            function createFinishView()
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
                            '<input type="text" class="gn-aikaFinishName" placeholder="' + Aika.Localization.Finish.FinishName + '"/>',
                            '<select class="gn-aikaFinishColor"/>',
                        '</div>',
                    ].join(''),

                    /**
                     * Initializes the shape
                     */
                    initialize: function()
                    {
                        joint.shapes.default.BaseView.prototype.initialize.apply(this, arguments);

                        var self = this;

                        var finishName = this.$box.find(".gn-aikaFinishName");
                        finishName.on("input", function() {
                            self.model.set("finishName", finishName.val());
                        });
                        finishName.val(this.model.get("finishName"));

                        var finishColor = this.$box.find(".gn-aikaFinishColor");
                        for(var curColor = 0; curColor < finishColors.length; ++curColor)
                        {
                            finishColor.append(jQuery("<option>", {
                                value: finishColors[curColor].color,
                                text: Aika.Localization.Finish.Colors[finishColors[curColor].name]
                            }));
                        }

                        finishColor.on("change", function() {
                            self.model.set("finishColor", finishColor.val());
                        });
                        finishColor.find("option[value='" + this.model.get("finishColor") + "']").prop("selected", true);
                    },

                    /**
                     * Returns statistics for the node
                     * @returns Node statistics
                     */
                    getStatistics: function() {
                        return {
                            conditionCount: 0,
                            wordCount: GoNorth.Util.getWordCount(this.model.get("finishName"))
                        };
                    }
                });
            }

            /**
             * Finish Shape
             */
            joint.shapes.aika.Finish = createFinishShape();

            /**
             * Finish View
             */
            joint.shapes.aika.FinishView = createFinishView();


            /** 
             * Finish Serializer 
             * 
             * @class
             */
            Shared.FinishSerializer = function()
            {
                GoNorth.DefaultNodeShapes.Serialize.BaseNodeSerializer.apply(this, [joint.shapes.aika.Finish, finishType, finishTargetArray ]);
            };

            Shared.FinishSerializer.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.Serialize.BaseNodeSerializer.prototype)

            /**
             * Serializes a node
             * 
             * @param {object} node Node Object
             * @returns {object} Serialized NOde
             */
            Shared.FinishSerializer.prototype.serialize = function(node) 
            {
                var serializedData = {
                    id: node.id,
                    x: node.position.x,
                    y: node.position.y,
                    detailViewId: node.detailViewId,
                    name: node.finishName,
                    color: node.finishColor
                };

                return serializedData;
            };

            /**
             * Deserializes a serialized node
             * 
             * @param {object} node Serialized Node Object
             * @returns {object} Deserialized Node
             */
            Shared.FinishSerializer.prototype.deserialize = function(node) 
            {
                var initOptions = {
                    id: node.id,
                    position: { x: node.x, y: node.y },
                    detailViewId: node.detailViewId,
                    finishName: node.name,
                    finishColor: node.color
                };

                var node = new this.classType(initOptions);
                return node;
            };

            // Register Serializers
            var finishSerializer = new Shared.FinishSerializer();
            GoNorth.DefaultNodeShapes.Serialize.getNodeSerializerInstance().addNodeSerializer(finishSerializer);

        }(Aika.Shared = Aika.Shared || {}));
    }(GoNorth.Aika = GoNorth.Aika || {}));
}(window.GoNorth = window.GoNorth || {}));