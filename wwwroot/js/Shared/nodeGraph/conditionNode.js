(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Shapes) {

            // Function needs to be set in view model to open condition dialog
            if(!DefaultNodeShapes.openConditionDialog)
            {
                DefaultNodeShapes.openConditionDialog = function() {
                    var def = new jQuery.Deferred();
                    def.reject("Not implemented");
                    return def.promise();
                }
            }

            /// Condition Type
            var conditionType = "default.Condition";
            
            /// Condition Target Array
            var conditionTargetArray = "condition";


            /// Condition node width
            var conditionWidth = 350;
            
            /// Min Condition Height
            var conditionMinHeight = 50;

            /// Height of condition item in pixel
            var conditionItemHeight = 66;

            /// Initial Offset of the port
            var conditionPortInitialOffset = 76;
            

            joint.shapes.default = joint.shapes.default || {};

            /**
             * Creates the condition shape
             * @returns {object} Condition shape
             */
            function createConditionShape() {
                var model = joint.shapes.devs.Model.extend(
                {
                    defaults: joint.util.deepSupplement
                    (
                        {
                            type: conditionType,
                            icon: "glyphicon-question-sign",
                            size: { width: conditionWidth, height: conditionMinHeight },
                            inPorts: ['input'],
                            outPorts: [],
                            attrs:
                            {
                                '.inPorts circle': { "magnet": "passive", "port-type": "input" },
                                '.outPorts circle': { "magnet": "true" }
                            },
                            conditions: [],
                            currentConditionId: 0
                        },
                        joint.shapes.default.Base.prototype.defaults
                    )
                });
                return model;
            }

            /**
             * Creates a condition view
             * @returns {object} Condition view
             */
            function createConditionView() {
                return joint.shapes.default.BaseView.extend(
                {
                    /**
                     * Template
                     */
                    template:
                    [
                        '<div class="node">',
                            '<span class="label"><i class="nodeIcon glyphicon"></i><span class="labelText"></span></span>',
                            '<span class="gn-nodeLoading" style="display: none"><i class="glyphicon glyphicon-refresh spinning"></i></span>',
                            '<span class="gn-nodeError text-danger" style="display: none" title="' + GoNorth.DefaultNodeShapes.Localization.ErrorOccured + '"><i class="glyphicon glyphicon-warning-sign"></i></span>',
                            '<button class="delete gn-nodeDeleteOnReadonly cornerButton" title="' + GoNorth.DefaultNodeShapes.Localization.DeleteNode + '" type="button">x</button>',
                            '<button class="gn-nodeAddCondition gn-nodeDeleteOnReadonly cornerButton" title="' + GoNorth.DefaultNodeShapes.Localization.Conditions.AddCondition + '" type="button">+</button>',
                        '</div>',
                    ].join(''),

                    /** 
                     * Additiona Callback Buttons 
                     */
                    additionalCallbackButtons: {
                        "gn-nodeAddCondition": function() {
                            this.addCondition();
                        }
                    },

                    /**
                     * Initializes the shape
                     */
                    initialize: function() {
                        _.bindAll(this, 'addCondition');
                        joint.shapes.default.BaseView.prototype.initialize.apply(this, arguments);

                        this.model.on('change:conditions', this.syncConditions, this);

                        if(this.model.get("conditions").length == 0)
                        {
                            this.addCondition();
                        }
                        else
                        {
                            this.syncConditions();
                        }
                    },

                    /**
                     * Adds a new condition
                     * 
                     * @param {object} existingCondition Existing condition to add, null to create new one
                     */
                    addCondition: function(existingCondition) {
                        var condition = existingCondition;
                        if(!condition)
                        {
                            condition = {
                                id: this.model.get("currentConditionId"),
                                conditionElements: []
                            };
                            this.model.set("currentConditionId", this.model.get("currentConditionId") + 1);
                        }

                        // Copy conditions and update using set
                        var newConditions = (this.model.get("conditions") || {}).slice();
                        newConditions.push(condition);
                        this.model.set("conditions", newConditions);
                    },

                    /**
                     * Moves a condition
                     * 
                     * @param {number} conditionId Condition Id
                     * @param {number} direction Direction to move
                     */
                    moveCondition: function(conditionId, direction) {
                        var newConditions = (this.model.get("conditions") || {}).slice();
                        for(var curCondition = 0; curCondition < newConditions.length; ++curCondition)
                        {
                            if(newConditions[curCondition].id == conditionId)
                            {
                                var newIndex = curCondition + direction;
                                if(newIndex >= 0 && newIndex < newConditions.length)
                                {
                                    var tmpCondition = newConditions[curCondition];
                                    newConditions[curCondition] = newConditions[newIndex];
                                    newConditions[newIndex] = tmpCondition;
                                    this.model.set("conditions", newConditions);
                                }
                                return;
                            }
                        }
                    },

                    /**
                     * Delets a condition
                     * 
                     * @param {number} conditionId Condition Id
                     */
                    deleteCondition: function(conditionId) {
                        var newCondition = (this.model.get("conditions") || {}).slice();
                        for(var curCondition = 0; curCondition < newCondition.length; ++curCondition)
                        {
                            if(newCondition[curCondition].id == conditionId)
                            {
                                newCondition.splice(curCondition, 1);
                                this.model.set("conditions", newCondition);
                                return;
                            }
                        }
                    },


                    /** 
                     * Opens a condition
                     * 
                     * @param {number} conditionId Condition Id
                     */
                    openConditionDialog: function(conditionId) {
                        var conditions = (this.model.get("conditions") || {}).slice();
                        for(var curCondition = 0; curCondition < conditions.length; ++curCondition)
                        {
                            if(conditions[curCondition].id == conditionId)
                            {
                                var self = this;
                                DefaultNodeShapes.openConditionDialog(conditions[curCondition]).then(function() {
                                    self.syncConditions();
                                });
                                return;
                            }
                        }
                    },
                    
                    
                    /**
                     * Syncs the conditions (ports, size, ...)
                     */
                    syncConditions: function() {
                        var outPorts = [];
                        var conditions = this.model.get("conditions");
                        for(var curCondition = 0; curCondition < conditions.length; ++curCondition)
                        {
                            outPorts.push("condition" + conditions[curCondition].id);
                        }
                        outPorts.push("else");
                        this.model.set("outPorts", outPorts);

                        // Update Html
                        var allTextDeferreds = [];
                        var self = this;
                        
                        this.model.set("size", { width: conditionWidth, height: conditionMinHeight + outPorts.length * conditionItemHeight});
                        var conditionTable = "<table class='gn-nodeConditionTable'>";
                        jQuery.each(conditions, function(key, condition) {
                            var conditionText = self.buildConditionString(condition, allTextDeferreds);
                            conditionText = jQuery("<div></div>").text(conditionText).html();

                            conditionTable += "<tr>";
                            conditionTable += "<td class='gn-nodeConditionTableConditionCell'><a class='gn-clickable gn-nodeNonClickableOnReadonly' data-conditionid='" + condition.id + "'>" + conditionText + "</a></td>";
                            conditionTable += "<td class='gn-nodeDeleteOnReadonly'><i class='glyphicon glyphicon-arrow-up gn-nodeMoveConditionUp gn-nodeConditionIcon' data-conditionid='" + condition.id + "' title='" + DefaultNodeShapes.Localization.Conditions.MoveConditionUp + "'></i></td>";
                            conditionTable += "<td class='gn-nodeDeleteOnReadonly'><i class='glyphicon glyphicon-arrow-down gn-nodeMoveConditionDown gn-nodeConditionIcon' data-conditionid='" + condition.id + "' title='" + DefaultNodeShapes.Localization.Conditions.MoveConditionDown + "'></i></td>";
                            conditionTable += "<td class='gn-nodeDeleteOnReadonly'><i class='glyphicon glyphicon-trash gn-nodeDeleteCondition gn-nodeConditionIcon' data-conditionid='" + condition.id + "' title='" + DefaultNodeShapes.Localization.Conditions.DeleteCondition + "'></i></td>";
                            conditionTable += "</tr>";
                        });

                        conditionTable += "<tr>";
                        conditionTable += "<td class='gn-nodeConditionTableConditionCell'>" + DefaultNodeShapes.Localization.Conditions.Else + "</td>";
                        conditionTable += "</tr>";

                        conditionTable += "</table>";
                        if(this.$box.find(".gn-nodeConditionTable").length > 0)
                        {
                            this.$box.find(".gn-nodeConditionTable").replaceWith(conditionTable);
                        }
                        else
                        {
                            this.$box.append(conditionTable);
                        }

                        this.hideError();
                        if(allTextDeferreds.length > 0)
                        {
                            this.showLoading();
                            jQuery.when.apply(jQuery, allTextDeferreds).then(function() {
                                self.hideLoading();
                            }, function() {
                                self.hideLoading();
                                self.showError();
                            });
                        }

                        // Update Port Positions
                        for(var curCondition = 0; curCondition < outPorts.length; ++curCondition)
                        {
                            this.model.attr(".outPorts>.port" + curCondition, { "ref-y": (conditionPortInitialOffset + conditionItemHeight * curCondition) + "px", "ref": ".body" });
                        }

                        // Bind events
                        this.$box.find(".gn-nodeMoveConditionUp").on("click", function() {
                            self.moveCondition(jQuery(this).data("conditionid"), -1);
                        });

                        this.$box.find(".gn-nodeMoveConditionDown").on("click", function() {
                            self.moveCondition(jQuery(this).data("conditionid"), +1);
                        });

                        this.$box.find(".gn-nodeDeleteCondition").on("click", function() {
                            self.deleteCondition(jQuery(this).data("conditionid"));
                        });

                        this.$box.find(".gn-nodeConditionTableConditionCell a").on("click", function() {
                            self.openConditionDialog(jQuery(this).data("conditionid"));
                        });
                    },

                    /**
                     * Builds a condition string and sets it
                     * 
                     * @param {object} condition Condition
                     * @param {jQuery.Deferred[]} allTextDeferreds All Text Deferreds
                     * @returns {string} Condition text
                     */
                    buildConditionString: function(condition, allTextDeferreds) {
                        var conditionText = "";
                        var self = this;
                        if(condition.conditionElements && condition.conditionElements.length > 0)
                        {
                            conditionText = DefaultNodeShapes.Localization.Conditions.LoadingConditionText;

                            var selectorString = ".gn-nodeConditionTableConditionCell>a[data-conditionid='" + condition.id + "']";
                            var textDef = GoNorth.DefaultNodeShapes.Conditions.getConditionManager().getConditionString(condition.conditionElements, GoNorth.DefaultNodeShapes.Localization.Conditions.AndOperatorShort, false);
                            textDef.then(function(generatedText) {
                                if(!generatedText) 
                                {
                                    generatedText = DefaultNodeShapes.Localization.Conditions.EditCondition;
                                }
                                else 
                                { 
                                    self.$box.find(selectorString).attr("title", generatedText);
                                }
                                self.$box.find(selectorString).text(generatedText);
                                conditionText = generatedText;  // Update condition text in case no async operation was necessary
                            }, function(err) {
                                var errorText = DefaultNodeShapes.Localization.Conditions.ErrorLoadingConditionText;
                                if(err) 
                                {
                                    errorText += ": " + err;
                                }
                                self.$box.find(selectorString).text(errorText);
                                self.$box.find(selectorString).attr("title", errorText);
                                conditionText = errorText;
                            });
                            allTextDeferreds.push(textDef);
                        }
                        else
                        {
                            conditionText = DefaultNodeShapes.Localization.Conditions.EditCondition;
                        }

                        return conditionText;
                    },

                    /**
                     * Reloads the shared data
                     * 
                     * @param {number} objectType Object Type
                     * @param {string} objectId Object Id
                     */
                    reloadSharedLoadedData: function(objectType, objectId) {
                        var conditions = this.model.get("conditions");
                        var allTextDeferreds = [];
                        for(var curCondition = 0; curCondition < conditions.length; ++curCondition)
                        {
                            var dependsOnObject = GoNorth.DefaultNodeShapes.Conditions.getConditionManager().getConditionElementsDependsOnObject(conditions[curCondition].conditionElements);
                            for(var curDependency = 0; curDependency < dependsOnObject.length; ++curDependency)
                            {
                                if(dependsOnObject[curDependency].objectId == objectId)
                                {
                                    this.buildConditionString(conditions[curCondition], allTextDeferreds);
                                }
                            }
                        }

                        this.hideError();
                        if(allTextDeferreds.length > 0)
                        {
                            this.showLoading();
                            var self = this;
                            jQuery.when.apply(jQuery, allTextDeferreds).then(function() {
                                self.hideLoading();
                            }, function() {
                                self.hideLoading();
                                self.showError();
                            });
                        }
                    },


                    /**
                     * Shows the loading indicator
                     */
                    showLoading: function() {
                        this.$box.find(".gn-nodeLoading").show();
                    },

                    /**
                     * Hides the loading indicator
                     */
                    hideLoading: function() {
                        this.$box.find(".gn-nodeLoading").hide();
                    },


                    /**
                     * Shows the error indicator
                     */
                    showError: function() {
                        this.$box.find(".gn-nodeError").show();
                    },

                    /**
                     * Hides the error indicator
                     */
                    hideError: function() {
                        this.$box.find(".gn-nodeError").hide();
                    }
                });
            }

            /**
             * Condition Shape
             */
            joint.shapes.default.Condition = createConditionShape();

            /**
             * Condition View
             */
            joint.shapes.default.ConditionView = createConditionView();


            /** 
             * Condition Serializer 
             * 
             * @class
             */
            Shapes.ConditionSerializer = function()
            {
                GoNorth.DefaultNodeShapes.Serialize.BaseNodeSerializer.apply(this, [ joint.shapes.default.Condition, conditionType, conditionTargetArray ]);
            };

            Shapes.ConditionSerializer.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.Serialize.BaseNodeSerializer.prototype)

            /**
             * Serializes a node
             * 
             * @param {object} node Node Object
             * @returns {object} Serialized NOde
             */
            Shapes.ConditionSerializer.prototype.serialize = function(node) {
                var serializedConditions = [];
                for(var curCondition = 0; curCondition < node.conditions.length; ++curCondition)
                {
                    var serializedCondition = GoNorth.DefaultNodeShapes.Conditions.getConditionManager().serializeCondition(node.conditions[curCondition]);
                    serializedConditions.push(serializedCondition);
                }

                var serializedData = {
                    id: node.id,
                    x: node.position.x,
                    y: node.position.y,
                    conditions: serializedConditions,
                    currentConditionId: node.currentConditionId
                };

                return serializedData;
            };

            /**
             * Deserializes a serialized node
             * 
             * @param {object} node Serialized Node Object
             * @returns {object} Deserialized Node
             */
            Shapes.ConditionSerializer.prototype.deserialize = function(node) {
                var deserializedConditions = [];
                for(var curCondition = 0; curCondition < node.conditions.length; ++curCondition)
                {
                    var deserializedCondition = GoNorth.DefaultNodeShapes.Conditions.getConditionManager().deserializeCondition(node.conditions[curCondition]);
                    deserializedConditions.push(deserializedCondition);
                }

                var initOptions = {
                    id: node.id,
                    position: { x: node.x, y: node.y },
                    conditions: deserializedConditions,
                    currentConditionId: node.currentConditionId
                };

                var node = new this.classType(initOptions);
                return node;
            };

            // Register Serializers
            var conditionSerializer = new Shapes.ConditionSerializer();
            GoNorth.DefaultNodeShapes.Serialize.getNodeSerializerInstance().addNodeSerializer(conditionSerializer);

        }(DefaultNodeShapes.Shapes = DefaultNodeShapes.Shapes || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));