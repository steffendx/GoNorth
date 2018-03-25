(function(GoNorth) {
    "use strict";
    (function(Tale) {
        (function(Shapes) {

            /// Choice Type
            var choiceType = "tale.Choice";
            
            /// Choice Target Array
            var choiceTargetArray = "choice";


            /// Choice node width
            var choiceWidth = 390;

            /// Min Choice Height
            var choiceMinHeight = 50;

            /// Height of choice item in pixel
            var choiceItemHeight = 66;

            /// Initial Offset of the port
            var choicePortInitialOffset = 76;


            joint.shapes.tale = joint.shapes.tale || {};

            /**
             * Creates the choice shape
             * @returns {object} Choice shape
             */
            function createChoiceShape() {
                var model = joint.shapes.devs.Model.extend(
                {
                    defaults: joint.util.deepSupplement
                    (
                        {
                            type: choiceType,
                            icon: "glyphicon-th-list",
                            size: { width: choiceWidth, height: choiceMinHeight },
                            inPorts: ['input'],
                            outPorts: [],
                            attrs:
                            {
                                '.inPorts circle': { "magnet": "passive", "port-type": "input" },
                                '.outPorts circle': { "magnet": "true" }
                            },
                            choices: [],
                            currentChoiceId: 0
                        },
                        joint.shapes.default.Base.prototype.defaults
                    )
                });
                return model;
            }

            /**
             * Creates a choice view
             * @returns {object} Choice view
             */
            function createChoiceView() {
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
                            '<button class="gn-taleAddChoice gn-nodeDeleteOnReadonly cornerButton" title="' + Tale.Localization.Choices.AddNewChoice + '">+</button>',
                        '</div>',
                    ].join(''),

                    /** 
                     * Additiona Callback Buttons 
                     */
                    additionalCallbackButtons: {
                        "gn-taleAddChoice": function() {
                            this.addChoice();
                        }
                    },

                    /**
                     * Initializes the shape
                     */
                    initialize: function() {
                        _.bindAll(this, 'addChoice');
                        joint.shapes.default.BaseView.prototype.initialize.apply(this, arguments);

                        this.model.on('change:choices', this.syncChoices, this);

                        if(this.model.get("choices").length == 0)
                        {
                            this.addChoice();
                        }
                        else
                        {
                            this.syncChoices();
                        }
                    },

                    /**
                     * Adds a new choice
                     * 
                     * @param {object} existingChoice Existing choice to add, null to create new one
                     */
                    addChoice: function(existingChoice) {
                        var choice = existingChoice;
                        if(!choice)
                        {
                            choice = {
                                id: this.model.get("currentChoiceId"),
                                text: "",
                                isRepeatable: true,
                                condition: null
                            };
                            this.model.set("currentChoiceId", this.model.get("currentChoiceId") + 1);
                        }

                        // Copy choices and update using set
                        var newChoices = (this.model.get("choices") || {}).slice();
                        newChoices.push(choice);
                        this.model.set("choices", newChoices);
                    },

                    /**
                     * Sets the choice text
                     * 
                     * @param {number} choiceId Choice Id
                     * @param {string} newText New Text
                     */
                    setChoiceText: function(choiceId, newText) {
                        var choices = this.model.get("choices");
                        for(var curChoice = 0; curChoice < choices.length; ++curChoice)
                        {
                            if(choices[curChoice].id == choiceId)
                            {
                                choices[curChoice].text = newText;

                                var inputBox = this.$box.find(".gn-taleChoiceInput[data-choiceid='" + choiceId + "']");
                                if(!inputBox.is(':focus'))
                                {
                                    inputBox.val(newText);
                                }
                                return;
                            }
                        }
                    },

                    /**
                     * Moves a choice
                     * 
                     * @param {number} choiceId Choice Id
                     * @param {number} direction Direction to move
                     */
                    moveChoice: function(choiceId, direction) {
                        var newChoices = (this.model.get("choices") || {}).slice();
                        for(var curChoice = 0; curChoice < newChoices.length; ++curChoice)
                        {
                            if(newChoices[curChoice].id == choiceId)
                            {
                                var newIndex = curChoice + direction;
                                if(newIndex >= 0 && newIndex < newChoices.length)
                                {
                                    var tmpChoice = newChoices[curChoice];
                                    newChoices[curChoice] = newChoices[newIndex];
                                    newChoices[newIndex] = tmpChoice;
                                    this.model.set("choices", newChoices);
                                }
                                return;
                            }
                        }
                    },

                    /**
                     * Delets a choice
                     * 
                     * @param {number} choiceId Choice Id
                     */
                    deleteChoice: function(choiceId) {
                        var newChoices = (this.model.get("choices") || {}).slice();
                        for(var curChoice = 0; curChoice < newChoices.length; ++curChoice)
                        {
                            if(newChoices[curChoice].id == choiceId)
                            {
                                newChoices.splice(curChoice, 1);
                                this.model.set("choices", newChoices);
                                return;
                            }
                        }
                    },

                    /**
                     * Opens the condition dialog for a choice
                     * 
                     * @param {number} choiceId Choice Id
                     */
                    openConditionDialog: function(choiceId) {
                        var choices = this.model.get("choices");
                        for(var curChoice = 0; curChoice < choices.length; ++curChoice)
                        {
                            if(choices[curChoice].id == choiceId)
                            {
                                var condition = choices[curChoice].condition;
                                if(!condition) 
                                {
                                    condition = {
                                        id: choices[curChoice].id,
                                        conditionElements: []
                                    };
                                }

                                var self = this;
                                GoNorth.DefaultNodeShapes.openConditionDialog(condition).then(function() {
                                    if(condition.conditionElements.length > 0)
                                    {
                                        choices[curChoice].condition = condition;
                                    }
                                    else
                                    {
                                        choices[curChoice].condition = null;
                                    }
                                    self.syncChoices();
                                });
                                return;
                            }
                        }
                    },

                    /**
                     * Toogles a condition as repeatable
                     * 
                     * @param {number} choiceId Choice Id
                     */
                    toogleConditionIsRepeatable: function(choiceId) {
                        var choices = this.model.get("choices");
                        for(var curChoice = 0; curChoice < choices.length; ++curChoice)
                        {
                            if(choices[curChoice].id == choiceId)
                            {
                                choices[curChoice].isRepeatable = !choices[curChoice].isRepeatable;
                                this.$box.find(".gn-taleChoiceToogleIsRepeatable[data-choiceid='" + choiceId + "']").toggleClass("gn-taleChoiceIsRepeatable");
                                return;
                            }
                        }
                    },

                    /**
                     * Syncs the chocies (ports, size, ...)
                     */
                    syncChoices: function() {
                        var outPorts = [];
                        var choices = this.model.get("choices");
                        for(var curChoice = 0; curChoice < choices.length; ++curChoice)
                        {
                            outPorts.push("choice" + choices[curChoice].id);
                        }
                        this.model.set("outPorts", outPorts);

                        // Update Html
                        this.model.set("size", { width: choiceWidth, height: choiceMinHeight + choices.length * choiceItemHeight});
                        var choiceTable = "<table class='gn-taleChoiceTable'>";
                        var self = this;
                        jQuery.each(choices, function(index, choice) {
                            var conditionClasses = "glyphicon glyphicon-question-sign gn-taleEditChoiceCondition gn-taleChoiceIcon";

                            choiceTable += "<tr>";
                            choiceTable += "<td class='gn-taleChoiceTextCell'>";
                            if(choice.condition)
                            {
                                conditionClasses += " gn-taleChoiceHasCondition";

                                var conditionText = GoNorth.DefaultNodeShapes.Localization.Conditions.LoadingConditionText;

                                var selectorString = ".gn-taleChoiceConditionText[data-choiceid='" + choice.id + "']";
                                var textDef = GoNorth.DefaultNodeShapes.Conditions.getConditionManager().getConditionString(choice.condition.conditionElements, GoNorth.DefaultNodeShapes.Localization.Conditions.AndOperatorShort, false);
                                textDef.then(function(generatedText) {
                                    if(generatedText) {
                                        generatedText += " :";
                                    }

                                    self.$box.find(selectorString).attr("title", generatedText);
                                    self.$box.find(selectorString).text(generatedText);
                                    conditionText = generatedText;  // Update condition text in case no async operation was necessary
                                }, function() {
                                    self.$box.find(selectorString).text(GoNorth.DefaultNodeShapes.Localization.Conditions.ErrorLoadingConditionText);
                                    conditionText = GoNorth.DefaultNodeShapes.Localization.Conditions.ErrorLoadingConditionText;
                                });

                                choiceTable += "<div class='gn-taleChoiceConditionText' data-choiceid='" + choice.id + "' title='" + conditionText + "'>" + conditionText + "</div>";
                            }

                            var isRepeatableClasses = "glyphicon glyphicon-repeat gn-taleChoiceToogleIsRepeatable gn-taleChoiceIcon";
                            if(choice.isRepeatable)
                            {
                                isRepeatableClasses += " gn-taleChoiceIsRepeatable";
                            }                            

                            choiceTable += "<input type='text' class='gn-taleChoiceInput' value='" + choice.text + "' data-choiceid='" + choice.id + "' placeholder='" + GoNorth.Tale.Localization.Choices.ChoiceText + "'/></td>";
                            choiceTable += "<td class='gn-nodeDeleteOnReadonly'><i class='glyphicon glyphicon-arrow-up gn-taleMoveChoiceUp gn-taleChoiceIcon' data-choiceid='" + choice.id + "' title='" + Tale.Localization.Choices.MoveUpToolTip + "'></i></td>";
                            choiceTable += "<td class='gn-nodeDeleteOnReadonly'><i class='glyphicon glyphicon-arrow-down gn-taleMoveChoiceDown gn-taleChoiceIcon' data-choiceid='" + choice.id + "' title='" + Tale.Localization.Choices.MoveDownToolTip + "'></i></td>";
                            choiceTable += "<td class='gn-nodeDeleteOnReadonly'><i class='" + conditionClasses + "' data-choiceid='" + choice.id + "' title='" + Tale.Localization.Choices.EditConditionToolTip + "'></i></td>";
                            choiceTable += "<td class='gn-nodeDeleteOnReadonly'><i class='" + isRepeatableClasses + "' data-choiceid='" + choice.id + "' title='" + Tale.Localization.Choices.AllowMultipleSelectionToolTip + "'></i></td>";
                            choiceTable += "<td class='gn-nodeDeleteOnReadonly'><i class='glyphicon glyphicon-trash gn-taleDeleteChoice gn-taleChoiceIcon' data-choiceid='" + choice.id + "' title='" + Tale.Localization.Choices.DeleteToolTip + "'></i></td>";
                            choiceTable += "</tr>";
                        });

                        choiceTable += "</table>";
                        if(this.$box.find(".gn-taleChoiceTable").length > 0)
                        {
                            this.$box.find(".gn-taleChoiceTable").replaceWith(choiceTable);
                        }
                        else
                        {
                            this.$box.append(choiceTable);
                        }

                        // Update Port Positions
                        for(var curChoice = 0; curChoice < choices.length; ++curChoice)
                        {
                            this.model.attr(".outPorts>.port" + curChoice, { "ref-y": (choicePortInitialOffset + choiceItemHeight * curChoice) + "px", "ref": ".body" });
                        }

                        // Bind events
                        var self = this;
                        this.$box.find(".gn-taleChoiceInput").change(function() {
                            self.setChoiceText(jQuery(this).data("choiceid"), jQuery(this).val());
                        });

                        this.$box.find(".gn-taleMoveChoiceUp").click(function() {
                            self.moveChoice(jQuery(this).data("choiceid"), -1);
                        });

                        this.$box.find(".gn-taleMoveChoiceDown").click(function() {
                            self.moveChoice(jQuery(this).data("choiceid"), +1);
                        });

                        this.$box.find(".gn-taleEditChoiceCondition").click(function() {
                            self.openConditionDialog(jQuery(this).data("choiceid"));
                        });

                        this.$box.find(".gn-taleChoiceToogleIsRepeatable").click(function() {
                            self.toogleConditionIsRepeatable(jQuery(this).data("choiceid"));
                        });

                        this.$box.find(".gn-taleDeleteChoice").click(function() {
                            self.deleteChoice(jQuery(this).data("choiceid"));
                        });

                    }
                });
            }

            /**
             * Choice Shape
             */
            joint.shapes.tale.Choice = createChoiceShape();

            /**
             * Choice View
             */
            joint.shapes.tale.ChoiceView = createChoiceView();


            /** 
             * Choice Serializer 
             * 
             * @class
             */
            Shapes.ChoiceSerializer = function()
            {
                GoNorth.DefaultNodeShapes.Serialize.BaseNodeSerializer.apply(this, [joint.shapes.tale.Choice, choiceType, choiceTargetArray ]);
            };

            Shapes.ChoiceSerializer.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.Serialize.BaseNodeSerializer.prototype)

            /**
             * Serializes a node
             * 
             * @param {object} node Node Object
             * @returns {object} Serialized NOde
             */
            Shapes.ChoiceSerializer.prototype.serialize = function(node) {
                var serializedChoices = [];
                for(var curChoice = 0; curChoice < node.choices.length; ++curChoice)
                {
                    var serializedChoice = {
                        id: node.choices[curChoice].id,
                        text: node.choices[curChoice].text,
                        isRepeatable: node.choices[curChoice].isRepeatable,
                        condition: null
                    };
                    if(node.choices[curChoice].condition)
                    {
                        serializedChoice.condition = GoNorth.DefaultNodeShapes.Conditions.getConditionManager().serializeCondition(node.choices[curChoice].condition);
                    }
                    serializedChoices.push(serializedChoice);
                }

                var serializedData = {
                    id: node.id,
                    x: node.position.x,
                    y: node.position.y,
                    choices: serializedChoices,
                    currentChoiceId: node.currentChoiceId
                };

                return serializedData;
            };

            /**
             * Deserializes a serialized node
             * 
             * @param {object} node Serialized Node Object
             * @returns {object} Deserialized Node
             */
            Shapes.ChoiceSerializer.prototype.deserialize = function(node) {
                var deserializedChoices = [];
                if(node.choices)
                {
                    for(var curChoice = 0; curChoice < node.choices.length; ++curChoice)
                    {
                        var deserializedChoice = {
                            id: node.choices[curChoice].id,
                            text: node.choices[curChoice].text,
                            isRepeatable: node.choices[curChoice].isRepeatable,
                            condition: null
                        };
                        if(node.choices[curChoice].condition)
                        {
                            deserializedChoice.condition = GoNorth.DefaultNodeShapes.Conditions.getConditionManager().deserializeCondition(node.choices[curChoice].condition);
                        }
                        deserializedChoices.push(deserializedChoice);
                    }
                }

                var initOptions = {
                    id: node.id,
                    position: { x: node.x, y: node.y },
                    choices: deserializedChoices,
                    currentChoiceId: node.currentChoiceId
                };

                var node = new this.classType(initOptions);
                return node;
            };

            // Register Serializers
            var choiceSerializer = new Shapes.ChoiceSerializer();
            GoNorth.DefaultNodeShapes.Serialize.getNodeSerializerInstance().addNodeSerializer(choiceSerializer);

        }(Tale.Shapes = Tale.Shapes || {}));
    }(GoNorth.Tale = GoNorth.Tale || {}));
}(window.GoNorth = window.GoNorth || {}));