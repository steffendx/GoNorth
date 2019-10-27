(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Conditions) {

            /**
             * Condition Manager
             * @class
             */
            var conditionManager = function()
            {
                this.availableConditionTypes = [];
            };

            conditionManager.prototype = {
                /**
                 * Adds a new condition type to the manager
                 * 
                 * @param {object} condition Condition type to add
                 */
                addConditionType: function(condition) {
                    this.availableConditionTypes.push(condition);
                },

                /**
                 * Returns the available condition types
                 * 
                 * @returns {object} Condition Types
                 */
                getConditionTypes: function() {
                    return this.availableConditionTypes;
                },

                /**
                 * Returns the available condition types which can be selected
                 * 
                 * @returns {object} Condition Types which can be selected
                 */
                getSelectableConditionTypes: function() {
                    var selectableConditionTypes = [];
                    for(var curConditionType = 0; curConditionType < this.availableConditionTypes.length; ++curConditionType)
                    {
                        if(this.availableConditionTypes[curConditionType].canBeSelected())
                        {
                            selectableConditionTypes.push(this.availableConditionTypes[curConditionType]);
                        }
                    }
                    return selectableConditionTypes;
                },

                /**
                 * Returns the available condition types
                 * 
                 * @param {number} type Type of the condition
                 * @returns {string} Condition template
                 */
                getConditionTemplate: function(type) {
                    var conditionType = this.getConditionType(type);
                    if(conditionType)
                    {
                        return conditionType.getTemplateName();
                    }

                    return "gn-nodeConditionEmpty";
                },

                /**
                 * Returns true if a condition type is selectable, else false
                 * 
                 * @param {number} type Type of the condition
                 * @returns {bool} true if the condition type is selectable, else false
                 */
                isConditionTypeSelectable: function(type) {
                    var conditionType = this.getConditionType(type);
                    if(conditionType)
                    {
                        return conditionType.canBeSelected();
                    }

                    return true;
                },

                /**
                 * Builds the condition data
                 * 
                 * @param {number} type Type of the condition
                 * @param {object} existingData Existing data
                 * @param {object} element Element to which the data belongs
                 * @returns {object} Condition data
                 */
                buildConditionData: function(type, existingData, element) {
                    element.errorOccured(false);
                    var conditionType = this.getConditionType(type);
                    if(conditionType)
                    {
                        return conditionType.buildConditionData(existingData, element);
                    }

                    return null;
                },

                /**
                 * Serializes a condition
                 * 
                 * @param {object} existingData Existing Condition Data
                 * @returns {object} Serialized condition data
                 */
                serializeCondition: function(existingData) {
                    var serializedCondition = {
                        id: existingData.id,
                        dependsOnObjects: Conditions.getConditionManager().getConditionElementsDependsOnObject(existingData.conditionElements),
                        conditionElements: JSON.stringify(existingData.conditionElements)
                    };
                    return serializedCondition;
                },

                /**
                 * Deserializes a condition
                 * 
                 * @param {object} serializedCondition Serialized condition
                 * @returns {object} Deserialized condition data
                 */
                deserializeCondition: function(serializedCondition) {
                    var existingData = {
                        id: serializedCondition.id,
                        conditionElements: JSON.parse(serializedCondition.conditionElements)
                    };
                    return existingData;
                },

                /**
                 * Serializes a condition element
                 * 
                 * @param {object} conditionElement Condition Element
                 * @returns {object} Serialized Condition Element
                 */
                serializeConditionElement: function(conditionElement) {
                    var conditionType = this.getConditionType(conditionElement.conditionType());
                    if(conditionType)
                    {
                        return {
                            conditionType: conditionElement.conditionType(),
                            conditionData: conditionType.serializeConditionData(conditionElement.conditionData())
                        }
                    }

                    return null;
                },

                /**
                 * Returns the objects on which a group of condition element depends
                 * 
                 * @param {number} type Type of the condition
                 * @param {object} existingData Existing condition data
                 * @returns {object[]} Data of objects on which the condition element depends
                 */
                getConditionElementsDependsOnObject: function(conditionElements) {
                    var pushedObjects = {};
                    var allDependencies = [];
                    for(var curElement = 0; curElement < conditionElements.length; ++curElement)
                    {
                        var elementDependencies = Conditions.getConditionManager().getConditionElementDependsOnObject(conditionElements[curElement].conditionType, conditionElements[curElement].conditionData);
                        for(var curDependency = 0; curDependency < elementDependencies.length; ++curDependency)
                        {
                            var key = elementDependencies[curDependency].objectType + "|" + elementDependencies[curDependency].objectId;
                            if(!pushedObjects[key])
                            {
                                allDependencies.push(elementDependencies[curDependency]);
                                pushedObjects[key] = true;
                            }
                        }
                    }
                    return allDependencies;
                },

                /**
                 * Returns the objects on which a condition element depends
                 * 
                 * @param {number} type Type of the condition
                 * @param {object} existingData Existing condition data
                 * @returns {object[]} Data of objects on which the condition element depends
                 */
                getConditionElementDependsOnObject: function(type, existingData) {
                    var conditionType = this.getConditionType(type);
                    if(conditionType)
                    {
                        return conditionType.getConditionDependsOnObject(existingData);
                    }
                    return [];
                },
                
                /**
                 * Returns the condition type
                 * 
                 * @param {number} type Type of the condition
                 * @returns {object} Condition Type
                 */
                getConditionType: function(type) {
                    for(var curConditionType = 0; curConditionType < this.availableConditionTypes.length; ++curConditionType)
                    {
                        if(this.availableConditionTypes[curConditionType].getType() == type)
                        {
                            return this.availableConditionTypes[curConditionType];
                        }
                    }

                    return null;
                },

                /**
                 * Converts the condition elements
                 * 
                 * @param {object[]} elements Elements to convert
                 */
                convertElements: function(elements) {
                    var convertedElements = [];
                    for(var curElement = 0; curElement < elements.length; ++curElement)
                    {
                        var element = this.convertElement(elements[curElement]);
                        convertedElements.push(element);
                    }

                    return convertedElements;
                },

                /**
                 * Convertes an element
                 * 
                 * @param {object} element Element to convert
                 * @returns {object} Condition Element
                 */
                convertElement: function(element) {
                    var convertedElement = {
                        isSelected: new ko.observable(false),
                        conditionType: new ko.observable(element.conditionType),
                        conditionData: new ko.observable(null),
                        conditionTemplate: new ko.observable("gn-nodeConditionEmpty"),
                        parent: null,
                        errorOccured: new ko.observable(false)
                    };
                    convertedElement.conditionData(this.buildConditionData(element.conditionType, element.conditionData, convertedElement));
                    convertedElement.conditionTemplate(this.getConditionTemplate(element.conditionType));
                    this.addSharedFunctions(convertedElement);

                    return convertedElement;
                },

                /**
                 * Creates an empty element
                 * 
                 * @returns {object} Condition Element
                 */
                createEmptyElement: function() {
                    var element = {
                        isSelected: new ko.observable(false),
                        conditionType: new ko.observable(""),
                        conditionData: new ko.observable(null),
                        conditionTemplate: new ko.observable("gn-nodeConditionEmpty"),
                        parent: null,
                        errorOccured: new ko.observable(false)
                    };
                    this.addSharedFunctions(element);
                    return element;
                },

                /**
                 * Adds the shared functions to a condition
                 * 
                 * @param {object} element Condition Element
                 */
                addSharedFunctions: function(element) {
                    var self = this;
                    element.conditionType.subscribe(function() {
                        element.conditionTemplate("gn-nodeConditionEmpty");
                        element.conditionData(self.buildConditionData(element.conditionType(), null, element));
                        element.conditionTemplate(self.getConditionTemplate(element.conditionType()));
                    });
                },


                /**
                 * Returns the condition string for a condition
                 * @param {object[]} conditionElements Condition Elements
                 * @param {string} joinOperator Operator used for the join
                 * @param {bool} addBrackets true if brackets should be added around the result, else false
                 * @returns {jQuery.Deferred} Deferred for loading the text
                 */
                getConditionString: function(conditionElements, joinOperator, addBrackets) {
                    var conditionDef = new jQuery.Deferred();

                    var allElementsDef = [];
                    for(var curElement = 0; curElement < conditionElements.length; ++curElement)
                    {
                        var conditionType = this.getConditionType(conditionElements[curElement].conditionType);
                        allElementsDef.push(conditionType.getConditionString(conditionElements[curElement].conditionData));
                    }

                    jQuery.when.apply(jQuery, allElementsDef).then(function() {
                        if(arguments.length == 0)
                        {
                            conditionDef.resolve("");
                            return;
                        }

                        var allTextLines = [];
                        for(var curArgument = 0; curArgument < arguments.length; ++curArgument)
                        {
                            allTextLines.push(arguments[curArgument]);
                        }
                        var joinedValue = allTextLines.join(" " + joinOperator + " ");
                        if(addBrackets)
                        {
                            joinedValue = "(" + joinedValue + ")";
                        }
                        conditionDef.resolve(joinedValue);
                    }, function(err) {
                        conditionDef.reject(err);
                    });

                    return conditionDef.promise();
                }
            };


            var instance = new conditionManager();

            /**
             * Returns the condition manager instance
             * 
             * @returns {conditionManager} Condition Manager
             */
            Conditions.getConditionManager = function() {
                return instance;
            }

        }(DefaultNodeShapes.Conditions = DefaultNodeShapes.Conditions || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Conditions) {

            /// Conditions that are related to npcs
            Conditions.RelatedToObjectNpc = "Npc";

            /// Conditions that are related to items
            Conditions.RelatedToObjectItem = "Item";

            /// Conditions that are related to quests
            Conditions.RelatedToObjectQuest = "Quest";

            /// Conditions that are related to skills
            Conditions.RelatedToObjectSkill = "Skill";

            /**
             * Base Condition
             * @class
             */
            Conditions.BaseCondition = function()
            {
                this.nodeModel = null;
            };

            Conditions.BaseCondition.prototype = {
                /**
                 * Returns the type of the condition
                 * 
                 * @returns {number} Type of the condition
                 */
                getType: function() {
                    return -1;
                },

                /**
                 * Returns the label of the condition
                 * 
                 * @returns {string} Label of the condition
                 */
                getLabel: function() {

                },

                /**
                 * Returns true if the condition can be selected in the dropdown list, else false
                 * 
                 * @returns {bool} true if the condition can be selected, else false
                 */
                canBeSelected: function() {

                },

                /**
                 * Returns the template name for the condition
                 * 
                 * @returns {string} Template name
                 */
                getTemplateName: function() {

                },
                
                /**
                 * Returns the data for the condition
                 * 
                 * @param {object} existingData Existing condition data
                 * @param {object} element Element to which the data belongs
                 * @returns {object} Template data
                 */
                buildConditionData: function(existingData, element) {

                },

                /**
                 * Serializes condition data
                 * 
                 * @param {object} conditionData Condition data
                 * @returns {object} Serialized data
                 */
                serializeConditionData: function(conditionData) {

                },
                
                /**
                 * Returns the objects on which an object depends
                 * 
                 * @param {object} existingData Existing condition data
                 * @returns {object[]} Objects on which the condition depends
                 */
                getConditionDependsOnObject: function(existingData) {

                },


                /**
                 * Returns the condition data as a display string
                 * 
                 * @param {object} existingData Serialzied condition data
                 * @returns {jQuery.Deferred} Deferred for the loading process
                 */
                getConditionString: function(existingData) {

                }
            };

        }(DefaultNodeShapes.Conditions = DefaultNodeShapes.Conditions || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Conditions) {
            
            /// Group Condition type
            Conditions.GroupConditionType = 1;


            /// And Operator for group conditions
            Conditions.GroupConditionOperatorAnd = 0;

            /// Or Operator for group conditions
            Conditions.GroupConditionOperatorOr = 1;

            /**
             * Group condition (and/or)
             * @class
             */
            Conditions.GroupCondition = function()
            {
                Conditions.BaseCondition.apply(this);
            };

            Conditions.GroupCondition.prototype = jQuery.extend({ }, Conditions.BaseCondition.prototype);

            /**
             * Returns the type of the condition
             * 
             * @returns {number} Type of the condition
             */
            Conditions.GroupCondition.prototype.getType = function() {
                return Conditions.GroupConditionType;
            };

            /**
             * Returns the label of the condition
             * 
             * @returns {string} Label of the condition
             */
            Conditions.GroupCondition.prototype.getLabel = function() {
                return "";
            };

            /**
             * Returns true if the condition can be selected in the dropdown list, else false
             * 
             * @returns {bool} true if the condition can be selected, else false
             */
            Conditions.GroupCondition.prototype.canBeSelected = function() {
                return false;
            };

            /**
             * Returns the template name for the condition
             * 
             * @returns {string} Template name
             */
            Conditions.GroupCondition.prototype.getTemplateName = function() {
                return "gn-nodeConditionGroup";
            }

            /**
             * Returns the data for the condition
             * 
             * @param {object} existingData Existing condition data
             * @param {object} element Element to which the data belongs
             * @returns {object} Condition data
             */
            Conditions.GroupCondition.prototype.buildConditionData = function(existingData, element) {
                var conditionData = {
                    operator: new ko.observable(existingData.operator),
                    conditionElements: new ko.observableArray()
                };
                
                if(existingData.fromDialog)
                {
                    conditionData.conditionElements(existingData.conditionElements);
                }
                else
                {
                    var convertedElements = Conditions.getConditionManager().convertElements(existingData.conditionElements);
                    for(var curElement = 0; curElement < convertedElements.length; ++curElement)
                    {
                        convertedElements[curElement].parent = element;
                    }
                    conditionData.conditionElements(convertedElements);
                }

                conditionData.operatorText = new ko.computed(function() {
                    return conditionData.operator() == Conditions.GroupConditionOperatorAnd ? DefaultNodeShapes.Localization.Conditions.AndOperator : DefaultNodeShapes.Localization.Conditions.OrOperator;
                });

                conditionData.toggleOperator = function() {
                    if(conditionData.operator() == Conditions.GroupConditionOperatorAnd)
                    {
                        conditionData.operator(Conditions.GroupConditionOperatorOr);
                    }
                    else
                    {
                        conditionData.operator(Conditions.GroupConditionOperatorAnd);
                    }
                };

                return conditionData;
            }

            /**
             * Serializes condition data
             * 
             * @param {object} conditionData Condition data
             * @returns {object} Serialized data
             */
            Conditions.GroupCondition.prototype.serializeConditionData = function(conditionData) {
                var serializedData = {
                    operator: conditionData.operator(),
                    conditionElements: []
                };

                var conditionElements = conditionData.conditionElements();
                for(var curElement = 0; curElement < conditionElements.length; ++curElement)
                {
                    var element = Conditions.getConditionManager().serializeConditionElement(conditionElements[curElement]);
                    serializedData.conditionElements.push(element);
                }
                return serializedData;
            }

            /**
             * Returns the objects on which an object depends
             * 
             * @param {object} existingData Existing condition data
             * @returns {object[]} Objects on which the condition depends
             */
            Conditions.GroupCondition.prototype.getConditionDependsOnObject = function(existingData) {
                return Conditions.getConditionManager().getConditionElementsDependsOnObject(existingData.conditionElements);
            }


            /**
             * Returns the condition data as a display string
             * 
             * @param {object} existingData Serialzied condition data
             * @returns {jQuery.Deferred} Deferred for the loading process
             */
            Conditions.GroupCondition.prototype.getConditionString = function(existingData) {
                return Conditions.getConditionManager().getConditionString(existingData.conditionElements, existingData.operator == Conditions.GroupConditionOperatorAnd ? DefaultNodeShapes.Localization.Conditions.AndOperatorShort : DefaultNodeShapes.Localization.Conditions.OrOperatorShort, true);
            }

            Conditions.getConditionManager().addConditionType(new Conditions.GroupCondition());

        }(DefaultNodeShapes.Conditions = DefaultNodeShapes.Conditions || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(Export) {
        (function(FunctionGenerationCondition) {

            /**
             * Converts a list of condition elements from the condition dialog to a version compatible with the api
             * 
             * @param {object} conditionElements Dialog Condition elements
             * @returns {object} Converted condition elements compatible with the api
             */
            FunctionGenerationCondition.convertConditionElementsFromDialog = function(conditionElements) {
                var finalConditionElements = [];
                for(var curElement = 0; curElement < conditionElements.length; ++curElement)
                {
                    var targetType = GoNorth.DefaultNodeShapes.Conditions.getConditionManager().getConditionType(conditionElements[curElement].conditionType);
                    var convertedElement = targetType.convertDataForExportApi(conditionElements[curElement].conditionData);
                    if(convertedElement == null)
                    {
                        return null;
                    }

                    convertedElement.conditionType = targetType.getExportApiType();
                    finalConditionElements.push(convertedElement);
                }

                return finalConditionElements;
            }

            /**
             * Converts a list of condition elements from the api to a version compatible with the condition dialog
             * 
             * @param {object} conditionElements Api condition elements
             * @returns {object} Converted condition elements compatible with the dialog
             */
            FunctionGenerationCondition.convertConditionElementsToDialog = function(conditionElements) {
                var conditionTypeMapping = {};
                var conditionTypes = GoNorth.DefaultNodeShapes.Conditions.getConditionManager().getConditionTypes();
                for(var curConditionType = 0; curConditionType < conditionTypes.length; ++curConditionType)
                {
                    if(!conditionTypes[curConditionType].getExportApiType)
                    {
                        continue;
                    }

                    conditionTypeMapping[conditionTypes[curConditionType].getExportApiType()] = conditionTypes[curConditionType];
                }

                var finalConditionElements = [];
                for(var curElement = 0; curElement < conditionElements.length; ++curElement)
                {
                    var targetType = conditionTypeMapping[conditionElements[curElement].conditionType];
                    if(!targetType)
                    {
                        return null;
                    }

                    var convertedConditionData = targetType.convertDataForDialog(conditionElements[curElement]);
                    if(!convertedConditionData)
                    {
                        return null;
                    }

                    var convertedElement = {
                        conditionType: targetType.getType(),
                        conditionData: convertedConditionData
                    }
                    finalConditionElements.push(convertedElement);
                }

                return finalConditionElements;
            };

        }(Export.FunctionGenerationCondition = Export.FunctionGenerationCondition || {}));
    }(GoNorth.Export = GoNorth.Export || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(Export) {
        (function(FunctionGenerationCondition) {

            /**
             * Returns the api condition type name
             * 
             * @returns {string} Api condition type name
             */
            GoNorth.DefaultNodeShapes.Conditions.GroupCondition.prototype.getExportApiType = function() {
                return "Group";
            }

            /**
             * Converts the condition data for the api without the type
             * 
             * @param {object} conditionData Serialized Condition Data
             * @returns {object} Condition Data ready for the api
             */
            GoNorth.DefaultNodeShapes.Conditions.GroupCondition.prototype.convertDataForExportApi = function(conditionData) {
                var conditionElements = FunctionGenerationCondition.convertConditionElementsFromDialog(conditionData.conditionElements);
                if(!conditionElements) {
                    return null;
                }

                return { 
                    groupOperator: conditionData.operator,
                    conditionElements: conditionElements
                };
            };

            /**
             * Converts the condition data for the dialog
             * 
             * @param {object} conditionData Serialized Condition Data
             * @returns {object} Condition Data ready for the dialog
             */
            GoNorth.DefaultNodeShapes.Conditions.GroupCondition.prototype.convertDataForDialog = function(conditionData) {
                var conditionElements = FunctionGenerationCondition.convertConditionElementsToDialog(conditionData.conditionElements);
                if(!conditionElements) {
                    return null;
                }

                return { 
                    operator: conditionData.groupOperator,
                    conditionElements: conditionElements
                };
            };

        }(Export.FunctionGenerationCondition = Export.FunctionGenerationCondition || {}));
    }(GoNorth.Export = GoNorth.Export || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(Export) {
        (function(FunctionGenerationCondition) {

            /// Condition Type for a node having multiple parents
            var functionGenerationTypeMultipleParents = 2;

            /**
             * Node has multiple parents condition
             * @class
             */
            FunctionGenerationCondition.MultipleParentsCondition = function()
            {
                GoNorth.DefaultNodeShapes.Conditions.BaseCondition.apply(this);
            };

            FunctionGenerationCondition.MultipleParentsCondition.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.Conditions.BaseCondition.prototype);

            /**
             * Returns the template name for the condition
             * 
             * @returns {string} Template name
             */
            FunctionGenerationCondition.MultipleParentsCondition.prototype.getTemplateName = function() {
                return "gn-functionGenerationCondition-multipleParents";
            };
            
            /**
             * Returns true if the condition can be selected in the dropdown list, else false
             * 
             * @returns {bool} true if the condition can be selected, else false
             */
            FunctionGenerationCondition.MultipleParentsCondition.prototype.canBeSelected = function() {
                return true;
            };

            /**
             * Returns the type of the condition
             * 
             * @returns {number} Type of the condition
             */
            FunctionGenerationCondition.MultipleParentsCondition.prototype.getType = function() {
                return functionGenerationTypeMultipleParents;
            };

            /**
             * Returns the label of the condition
             * 
             * @returns {string} Label of the condition
             */
            FunctionGenerationCondition.MultipleParentsCondition.prototype.getLabel = function() {
                return GoNorth.Export.FunctionGenerationCondition.Localization.ConditionMultipleParents;
            };

            /**
             * Returns the objects on which an object depends
             * 
             * @param {object} existingData Existing condition data
             * @returns {object[]} Objects on which the condition depends
             */
            FunctionGenerationCondition.MultipleParentsCondition.prototype.getConditionDependsOnObject = function(existingData) {
                return [];
            };

            /**
             * Returns the data for the condition
             * 
             * @param {object} existingData Existing condition data
             * @param {object} element Element to which the data belongs
             * @returns {object} Condition data
             */
            FunctionGenerationCondition.MultipleParentsCondition.prototype.buildConditionData = function(existingData, element) {
                var conditionData = { };

                return conditionData;
            };

            /**
             * Serializes condition data
             * 
             * @param {object} conditionData Condition data
             * @returns {object} Serialized data
             */
            FunctionGenerationCondition.MultipleParentsCondition.prototype.serializeConditionData = function(conditionData) {
                return { };
            };

            /**
             * Returns the condition data as a display string
             * 
             * @param {object} existingData Serialzied condition data
             * @returns {jQuery.Deferred} Deferred for the loading process
             */
            FunctionGenerationCondition.MultipleParentsCondition.prototype.getConditionString = function(existingData) {
                var def = new jQuery.Deferred();
                
                def.resolve(GoNorth.Export.FunctionGenerationCondition.Localization.ConditionMultipleParents);

                return def.promise();
            };


            /**
             * Returns the api condition type name
             * 
             * @returns {string} Api condition type name
             */
            FunctionGenerationCondition.MultipleParentsCondition.prototype.getExportApiType = function() {
                return "MultipleParents";
            }

            /**
             * Converts the condition data for the api without the type
             * 
             * @param {object} conditionData Serialized Condition Data
             * @returns {object} Condition Data ready for the api
             */
            FunctionGenerationCondition.MultipleParentsCondition.prototype.convertDataForExportApi = function(conditionData) {
                return { };
            };

            /**
             * Converts the condition data for the dialog
             * 
             * @param {object} conditionData Serialized Condition Data
             * @returns {object} Condition Data ready for the dialog
             */
            FunctionGenerationCondition.MultipleParentsCondition.prototype.convertDataForDialog = function(conditionData) {
                return { };
            };

            GoNorth.DefaultNodeShapes.Conditions.getConditionManager().addConditionType(new FunctionGenerationCondition.MultipleParentsCondition());

        }(Export.FunctionGenerationCondition = Export.FunctionGenerationCondition || {}));
    }(GoNorth.Export = GoNorth.Export || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(Export) {
        (function(FunctionGenerationCondition) {

            /**
             * Node type condition
             * @class
             */
            FunctionGenerationCondition.CheckNodeTypeCondition = function()
            {
                GoNorth.DefaultNodeShapes.Conditions.BaseCondition.apply(this);
            };

            FunctionGenerationCondition.CheckNodeTypeCondition.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.Conditions.BaseCondition.prototype);

            /**
             * Returns the template name for the condition
             * 
             * @returns {string} Template name
             */
            FunctionGenerationCondition.CheckNodeTypeCondition.prototype.getTemplateName = function() {
                return "gn-functionGenerationCondition-nodeType";
            };
            
            /**
             * Returns true if the condition can be selected in the dropdown list, else false
             * 
             * @returns {bool} true if the condition can be selected, else false
             */
            FunctionGenerationCondition.CheckNodeTypeCondition.prototype.canBeSelected = function() {
                return true;
            };

            /**
             * Returns the objects on which an object depends
             * 
             * @param {object} existingData Existing condition data
             * @returns {object[]} Objects on which the condition depends
             */
            FunctionGenerationCondition.CheckNodeTypeCondition.prototype.getConditionDependsOnObject = function(existingData) {
                return [];
            };

            /**
             * Returns the data for the condition
             * 
             * @param {object} existingData Existing condition data
             * @param {object} element Element to which the data belongs
             * @returns {object} Condition data
             */
            FunctionGenerationCondition.CheckNodeTypeCondition.prototype.buildConditionData = function(existingData, element) {
                var conditionData = {
                    selectedNodeType: new ko.observable(),
                    nodeTypes: GoNorth.Export.FunctionGenerationCondition.nodeTypes
                };

                if(existingData)
                {
                    var selectedNodeType = null;
                    for(var curNodeType = 0; curNodeType < conditionData.nodeTypes.length; ++curNodeType)
                    {
                        if(conditionData.nodeTypes[curNodeType].nodeType == existingData.nodeType)
                        {
                            selectedNodeType = conditionData.nodeTypes[curNodeType];
                        }
                    }
                    conditionData.selectedNodeType(selectedNodeType);
                }

                return conditionData;
            };

            /**
             * Serializes condition data
             * 
             * @param {object} conditionData Condition data
             * @returns {object} Serialized data
             */
            FunctionGenerationCondition.CheckNodeTypeCondition.prototype.serializeConditionData = function(conditionData) {
                return { 
                    nodeType: conditionData.selectedNodeType().nodeType
                };
            };

            /**
             * Returns the condition data as a display string
             * 
             * @param {object} existingData Serialzied condition data
             * @returns {jQuery.Deferred} Deferred for the loading process
             */
            FunctionGenerationCondition.CheckNodeTypeCondition.prototype.getConditionString = function(existingData) {
                var def = new jQuery.Deferred();
                
                def.resolve(this.getLabel() + "(" + GoNorth.Export.FunctionGenerationCondition.localizedNodeTypes[existingData.nodeType] + ")");

                return def.promise();
            };


            /**
             * Returns the api condition type name
             * 
             * @returns {string} Api condition type name
             */
            FunctionGenerationCondition.CheckNodeTypeCondition.prototype.getExportApiType = function() {
                return "";
            }

            /**
             * Converts the condition data for the api without the type
             * 
             * @param {object} conditionData Serialized Condition Data
             * @returns {object} Condition Data ready for the api
             */
            FunctionGenerationCondition.CheckNodeTypeCondition.prototype.convertDataForExportApi = function(conditionData) {
                return {
                    nodeType: conditionData.nodeType
                };
            };

            /**
             * Converts the condition data for the dialog
             * 
             * @param {object} conditionData Serialized Condition Data
             * @returns {object} Condition Data ready for the dialog
             */
            FunctionGenerationCondition.CheckNodeTypeCondition.prototype.convertDataForDialog = function(conditionData) {
                return { 
                    nodeType: conditionData.nodeType
                };
            };

        }(Export.FunctionGenerationCondition = Export.FunctionGenerationCondition || {}));
    }(GoNorth.Export = GoNorth.Export || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(Export) {
        (function(FunctionGenerationCondition) {

            /// Condition Type for the parent node having a certain type
            var functionGenerationParentNodeType = 3;

            /**
             * Parent node type condition
             * @class
             */
            FunctionGenerationCondition.ParentNodeTypeCondition = function()
            {
                FunctionGenerationCondition.CheckNodeTypeCondition.apply(this);
            };

            FunctionGenerationCondition.ParentNodeTypeCondition.prototype = jQuery.extend({ }, FunctionGenerationCondition.CheckNodeTypeCondition.prototype);

            /**
             * Returns the type of the condition
             * 
             * @returns {number} Type of the condition
             */
            FunctionGenerationCondition.ParentNodeTypeCondition.prototype.getType = function() {
                return functionGenerationParentNodeType;
            };

            /**
             * Returns the label of the condition
             * 
             * @returns {string} Label of the condition
             */
            FunctionGenerationCondition.ParentNodeTypeCondition.prototype.getLabel = function() {
                return GoNorth.Export.FunctionGenerationCondition.Localization.ConditionParentNodeType;
            };
            
            /**
             * Returns the api condition type name
             * 
             * @returns {string} Api condition type name
             */
            FunctionGenerationCondition.ParentNodeTypeCondition.prototype.getExportApiType = function() {
                return "ParentNodeType";
            };

            GoNorth.DefaultNodeShapes.Conditions.getConditionManager().addConditionType(new FunctionGenerationCondition.ParentNodeTypeCondition());

        }(Export.FunctionGenerationCondition = Export.FunctionGenerationCondition || {}));
    }(GoNorth.Export = GoNorth.Export || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(Export) {
        (function(FunctionGenerationCondition) {

            /// Condition Type for the current node having a certain type
            var functionGenerationCurrentNodeType = 4;

            /**
             * Current node type condition
             * @class
             */
            FunctionGenerationCondition.CurrentNodeTypeCondition = function()
            {
                FunctionGenerationCondition.CheckNodeTypeCondition.apply(this);
            };

            FunctionGenerationCondition.CurrentNodeTypeCondition.prototype = jQuery.extend({ }, FunctionGenerationCondition.CheckNodeTypeCondition.prototype);

            /**
             * Returns the type of the condition
             * 
             * @returns {number} Type of the condition
             */
            FunctionGenerationCondition.CurrentNodeTypeCondition.prototype.getType = function() {
                return functionGenerationCurrentNodeType;
            };

            /**
             * Returns the label of the condition
             * 
             * @returns {string} Label of the condition
             */
            FunctionGenerationCondition.CurrentNodeTypeCondition.prototype.getLabel = function() {
                return GoNorth.Export.FunctionGenerationCondition.Localization.ConditionCurrentNodeType;
            };

            /**
             * Returns the api condition type name
             * 
             * @returns {string} Api condition type name
             */
            FunctionGenerationCondition.CurrentNodeTypeCondition.prototype.getExportApiType = function() {
                return "CurrentNodeType";
            };

            GoNorth.DefaultNodeShapes.Conditions.getConditionManager().addConditionType(new FunctionGenerationCondition.CurrentNodeTypeCondition());

        }(Export.FunctionGenerationCondition = Export.FunctionGenerationCondition || {}));
    }(GoNorth.Export = GoNorth.Export || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(Export) {
        (function(FunctionGenerationCondition) {

            /// Condition Type for the child node having a certain type
            var functionGenerationChildNodeType = 5;

            /**
             * Child node type condition
             * @class
             */
            FunctionGenerationCondition.ChildNodeTypeCondition = function()
            {
                FunctionGenerationCondition.CheckNodeTypeCondition.apply(this);
            };

            FunctionGenerationCondition.ChildNodeTypeCondition.prototype = jQuery.extend({ }, FunctionGenerationCondition.CheckNodeTypeCondition.prototype);

            /**
             * Returns the type of the condition
             * 
             * @returns {number} Type of the condition
             */
            FunctionGenerationCondition.ChildNodeTypeCondition.prototype.getType = function() {
                return functionGenerationChildNodeType;
            };

            /**
             * Returns the label of the condition
             * 
             * @returns {string} Label of the condition
             */
            FunctionGenerationCondition.ChildNodeTypeCondition.prototype.getLabel = function() {
                return GoNorth.Export.FunctionGenerationCondition.Localization.ConditionChildNodeType;
            };

            /**
             * Returns the api condition type name
             * 
             * @returns {string} Api condition type name
             */
            FunctionGenerationCondition.ChildNodeTypeCondition.prototype.getExportApiType = function() {
                return "ChildNodeType";
            };

            GoNorth.DefaultNodeShapes.Conditions.getConditionManager().addConditionType(new FunctionGenerationCondition.ChildNodeTypeCondition());

        }(Export.FunctionGenerationCondition = Export.FunctionGenerationCondition || {}));
    }(GoNorth.Export = GoNorth.Export || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(Export) {
        (function(FunctionGenerationCondition) {

            /**
             * Action type condition
             * @class
             */
            FunctionGenerationCondition.CheckActionTypeCondition = function()
            {
                GoNorth.DefaultNodeShapes.Conditions.BaseCondition.apply(this);
            };

            FunctionGenerationCondition.CheckActionTypeCondition.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.Conditions.BaseCondition.prototype);

            /**
             * Returns the template name for the condition
             * 
             * @returns {string} Template name
             */
            FunctionGenerationCondition.CheckActionTypeCondition.prototype.getTemplateName = function() {
                return "gn-functionGenerationCondition-actionType";
            };
            
            /**
             * Returns true if the condition can be selected in the dropdown list, else false
             * 
             * @returns {bool} true if the condition can be selected, else false
             */
            FunctionGenerationCondition.CheckActionTypeCondition.prototype.canBeSelected = function() {
                return true;
            };

            /**
             * Returns the objects on which an object depends
             * 
             * @param {object} existingData Existing condition data
             * @returns {object[]} Objects on which the condition depends
             */
            FunctionGenerationCondition.CheckActionTypeCondition.prototype.getConditionDependsOnObject = function(existingData) {
                return [];
            };

            /**
             * Returns the data for the condition
             * 
             * @param {object} existingData Existing condition data
             * @param {object} element Element to which the data belongs
             * @returns {object} Condition data
             */
            FunctionGenerationCondition.CheckActionTypeCondition.prototype.buildConditionData = function(existingData, element) {
                var conditionData = {
                    selectedActionType: new ko.observable(),
                    actionTypes: GoNorth.Export.FunctionGenerationCondition.actionTypes
                };

                if(existingData)
                {
                    var selectedActionType = null;
                    for(var curActionType = 0; curActionType < conditionData.actionTypes.length; ++curActionType)
                    {
                        if(conditionData.actionTypes[curActionType].actionType == existingData.actionType)
                        {
                            selectedActionType = conditionData.actionTypes[curActionType];
                        }
                    }
                    conditionData.selectedActionType(selectedActionType);
                }

                return conditionData;
            };

            /**
             * Serializes condition data
             * 
             * @param {object} conditionData Condition data
             * @returns {object} Serialized data
             */
            FunctionGenerationCondition.CheckActionTypeCondition.prototype.serializeConditionData = function(conditionData) {
                return { 
                    actionType: conditionData.selectedActionType().actionType
                };
            };

            /**
             * Returns the condition data as a display string
             * 
             * @param {object} existingData Serialzied condition data
             * @returns {jQuery.Deferred} Deferred for the loading process
             */
            FunctionGenerationCondition.CheckActionTypeCondition.prototype.getConditionString = function(existingData) {
                var def = new jQuery.Deferred();
                
                def.resolve(this.getLabel() + "(" + GoNorth.Export.FunctionGenerationCondition.localizedActionTypes[existingData.actionType] + ")");

                return def.promise();
            };


            /**
             * Returns the api condition type name
             * 
             * @returns {string} Api condition type name
             */
            FunctionGenerationCondition.CheckActionTypeCondition.prototype.getExportApiType = function() {
                return "";
            }

            /**
             * Converts the condition data for the api without the type
             * 
             * @param {object} conditionData Serialized Condition Data
             * @returns {object} Condition Data ready for the api
             */
            FunctionGenerationCondition.CheckActionTypeCondition.prototype.convertDataForExportApi = function(conditionData) {
                return {
                    actionType: conditionData.actionType
                };
            };

            /**
             * Converts the condition data for the dialog
             * 
             * @param {object} conditionData Serialized Condition Data
             * @returns {object} Condition Data ready for the dialog
             */
            FunctionGenerationCondition.CheckActionTypeCondition.prototype.convertDataForDialog = function(conditionData) {
                return { 
                    actionType: conditionData.actionType
                };
            };

        }(Export.FunctionGenerationCondition = Export.FunctionGenerationCondition || {}));
    }(GoNorth.Export = GoNorth.Export || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(Export) {
        (function(FunctionGenerationCondition) {

            /// Condition Type for the parent action type having a certain type
            var functionGenerationParentActionType = 6;

            /**
             * Parent action type condition
             * @class
             */
            FunctionGenerationCondition.ParentActionTypeCondition = function()
            {
                FunctionGenerationCondition.CheckActionTypeCondition.apply(this);
            };

            FunctionGenerationCondition.ParentActionTypeCondition.prototype = jQuery.extend({ }, FunctionGenerationCondition.CheckActionTypeCondition.prototype);

            /**
             * Returns the type of the condition
             * 
             * @returns {number} Type of the condition
             */
            FunctionGenerationCondition.ParentActionTypeCondition.prototype.getType = function() {
                return functionGenerationParentActionType;
            };

            /**
             * Returns the label of the condition
             * 
             * @returns {string} Label of the condition
             */
            FunctionGenerationCondition.ParentActionTypeCondition.prototype.getLabel = function() {
                return GoNorth.Export.FunctionGenerationCondition.Localization.ConditionParentActionType;
            };
            
            /**
             * Returns the api condition type name
             * 
             * @returns {string} Api condition type name
             */
            FunctionGenerationCondition.ParentActionTypeCondition.prototype.getExportApiType = function() {
                return "ParentActionType";
            };

            GoNorth.DefaultNodeShapes.Conditions.getConditionManager().addConditionType(new FunctionGenerationCondition.ParentActionTypeCondition());

        }(Export.FunctionGenerationCondition = Export.FunctionGenerationCondition || {}));
    }(GoNorth.Export = GoNorth.Export || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(Export) {
        (function(FunctionGenerationCondition) {

            /// Condition Type for the current action type having a certain type
            var functionGenerationCurrentActionType = 7;

            /**
             * Current action type condition
             * @class
             */
            FunctionGenerationCondition.CurrentActionTypeCondition = function()
            {
                FunctionGenerationCondition.CheckActionTypeCondition.apply(this);
            };

            FunctionGenerationCondition.CurrentActionTypeCondition.prototype = jQuery.extend({ }, FunctionGenerationCondition.CheckActionTypeCondition.prototype);

            /**
             * Returns the type of the condition
             * 
             * @returns {number} Type of the condition
             */
            FunctionGenerationCondition.CurrentActionTypeCondition.prototype.getType = function() {
                return functionGenerationCurrentActionType;
            };

            /**
             * Returns the label of the condition
             * 
             * @returns {string} Label of the condition
             */
            FunctionGenerationCondition.CurrentActionTypeCondition.prototype.getLabel = function() {
                return GoNorth.Export.FunctionGenerationCondition.Localization.ConditionCurrentActionType;
            };
            
            /**
             * Returns the api condition type name
             * 
             * @returns {string} Api condition type name
             */
            FunctionGenerationCondition.CurrentActionTypeCondition.prototype.getExportApiType = function() {
                return "CurrentActionType";
            };

            GoNorth.DefaultNodeShapes.Conditions.getConditionManager().addConditionType(new FunctionGenerationCondition.CurrentActionTypeCondition());

        }(Export.FunctionGenerationCondition = Export.FunctionGenerationCondition || {}));
    }(GoNorth.Export = GoNorth.Export || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(Export) {
        (function(FunctionGenerationCondition) {

            /// Condition Type for the child action type having a certain type
            var functionGenerationChildActionType = 8;

            /**
             * Child action type condition
             * @class
             */
            FunctionGenerationCondition.ChildActionTypeCondition = function()
            {
                FunctionGenerationCondition.CheckActionTypeCondition.apply(this);
            };

            FunctionGenerationCondition.ChildActionTypeCondition.prototype = jQuery.extend({ }, FunctionGenerationCondition.CheckActionTypeCondition.prototype);

            /**
             * Returns the type of the condition
             * 
             * @returns {number} Type of the condition
             */
            FunctionGenerationCondition.ChildActionTypeCondition.prototype.getType = function() {
                return functionGenerationChildActionType;
            };

            /**
             * Returns the label of the condition
             * 
             * @returns {string} Label of the condition
             */
            FunctionGenerationCondition.ChildActionTypeCondition.prototype.getLabel = function() {
                return GoNorth.Export.FunctionGenerationCondition.Localization.ConditionChildActionType;
            };
            
            /**
             * Returns the api condition type name
             * 
             * @returns {string} Api condition type name
             */
            FunctionGenerationCondition.ChildActionTypeCondition.prototype.getExportApiType = function() {
                return "ChildActionType";
            };

            GoNorth.DefaultNodeShapes.Conditions.getConditionManager().addConditionType(new FunctionGenerationCondition.ChildActionTypeCondition());

        }(Export.FunctionGenerationCondition = Export.FunctionGenerationCondition || {}));
    }(GoNorth.Export = GoNorth.Export || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Conditions) {

            /**
             * Finds the condition dialog in a parents list
             * @param {object[]} parents Knockout parents elements
             * @returns {object} Condition Dialog context
             */
            Conditions.findConditionDialog = function(parents) {
                for(var curParent = 0; curParent < parents.length; ++curParent)
                {
                    if(parents[curParent].isConditionDialogViewModel) {
                        return parents[curParent];
                    }
                }

                return parents[0];
            }

            /**
             * Condition Dialog Model
             * @class
             */
            Conditions.ConditionDialog = function()
            {
                this.isConditionDialogViewModel = true;

                this.isOpen = new ko.observable(false);
                this.condition = null;
                this.closingDeferred = null;

                this.conditionElements = new ko.observableArray();

                this.showGroupWarning = new ko.observable(false);
                this.showDragParentToChildWarning = new ko.observable(false);
                this.warningHideTimeout = null;
                
                this.selectableConditionTypes = Conditions.getConditionManager().getSelectableConditionTypes();
            };

            Conditions.ConditionDialog.prototype = {
                /**
                 * Shows the dialog
                 * 
                 * @param {object} condition Condition to edit
                 * @param {jQuery.Deferred} closingDeferred optional deferred that will be resolved on save
                 */
                openDialog: function(condition, closingDeferred) {
                    this.condition = condition;
                    this.closingDeferred = closingDeferred;
                    this.conditionElements(Conditions.getConditionManager().convertElements(condition.conditionElements));
                    if(this.conditionElements().length == 0)
                    {
                        this.addNewConditionElement();
                    }

                    this.isOpen(true);
                },

                /**
                 * Adds a new condition element
                 */
                addNewConditionElement: function() {
                    var element = Conditions.getConditionManager().createEmptyElement();

                    this.conditionElements.push(element);
                },

                /**
                 * Groups the selected elements as and
                 */
                andGroupElements: function() {
                    this.groupElements(Conditions.GroupConditionOperatorAnd);
                },
                
                /**
                 * Groups the selected elements as or
                 */
                orGroupElements: function() {
                    this.groupElements(Conditions.GroupConditionOperatorOr);
                },

                /**
                 * Groups the selected elements
                 * 
                 * @param {number} operator Operator for the element
                 */
                groupElements: function(operator) {
                    this.showGroupWarning(false);
                    
                    var selectedElements = [];
                    this.collectSelectedElements(selectedElements, this.conditionElements());
                    if(selectedElements.length < 2)
                    {
                        return;
                    }

                    for(var curElement = 1; curElement < selectedElements.length; ++curElement)
                    {
                        if(selectedElements[0].parent != selectedElements[curElement].parent)
                        {
                            this.displayWarning(this.showGroupWarning);
                            return;
                        }
                    }

                    // Group Elements
                    var groupData = {
                        conditionType: Conditions.GroupConditionType,
                        conditionData: {
                            fromDialog: true,
                            operator: operator,
                            conditionElements: selectedElements
                        }
                    };
                    var groupElement = Conditions.getConditionManager().convertElement(groupData);
                    groupElement.parent = selectedElements[0].parent;

                    // Push array
                    var targetArray = this.conditionElements;
                    if(selectedElements[0].parent)
                    {
                        targetArray = selectedElements[0].parent.conditionData().conditionElements;
                    }

                    var firstIndex = targetArray.indexOf(selectedElements[0]);
                    targetArray.removeAll(selectedElements);
                    if(firstIndex < targetArray().length)
                    {
                        targetArray.splice(firstIndex, 0, groupElement);
                    }
                    else
                    {
                        targetArray.push(groupElement);
                    }

                    // Set parent
                    for(var curElement = 0; curElement < selectedElements.length; ++curElement)
                    {
                        selectedElements[curElement].parent = groupElement;
                        selectedElements[curElement].isSelected(false);
                    }
                },

                /**
                 * Collects all selected elements
                 * 
                 * @param {object[]} targetArray Target array to fill
                 * @param {object[]} conditionElements Source array to search
                 */
                collectSelectedElements: function(targetArray, conditionElements) {
                    for(var curElement = 0; curElement < conditionElements.length; ++curElement)
                    {
                        if(conditionElements[curElement].isSelected())
                        {
                            targetArray.push(conditionElements[curElement]);
                        }

                        if(conditionElements[curElement].conditionData().conditionElements)
                        {
                            this.collectSelectedElements(targetArray, conditionElements[curElement].conditionData().conditionElements());
                        }
                    }
                },

                /**
                 * Moves a condition element up
                 * 
                 * @param {object} element Condition Element to move
                 */
                moveConditionElementUp: function(element) {
                    this.moveSingleConditionElement(element, -1);
                },

                /**
                 * Moves a condition element down
                 * 
                 * @param {object} element Condition Element to move
                 */
                moveConditionElementDown: function(element) {
                    this.moveSingleConditionElement(element, 1);
                },

                /**
                 * Moves a single condition element
                 * 
                 * @param {object} element Condition Element to move
                 * @param {number} direction Direction to move the element in
                 */
                moveSingleConditionElement: function(element, direction) {
                    var conditionElements = null;
                    if(element.parent)
                    {
                        conditionElements = element.parent.conditionData().conditionElements;
                    }
                    else
                    {
                        conditionElements = this.conditionElements;
                    }

                    var elementIndex = conditionElements.indexOf(element);
                    var newIndex = elementIndex + direction;
                    var unwrappedElements = conditionElements();
                    if(newIndex >= 0 && newIndex < unwrappedElements.length)
                    {
                        var tmp = unwrappedElements[elementIndex];
                        unwrappedElements[elementIndex] = unwrappedElements[newIndex];
                        unwrappedElements[newIndex] = tmp;
                        conditionElements.valueHasMutated();
                    }
                },

                /**
                 * Moves a condition to a group using drag and drop
                 */
                dropConditionToGroup: function(group, conditionElement) {
                    // Check data
                    if(conditionElement.parent == group)
                    {
                        return;
                    }

                    var parent = group ? group.parent : null;
                    while(parent != null)
                    {
                        if(parent == conditionElement)
                        {
                            this.displayWarning(this.showDragParentToChildWarning);
                            return;
                        }
                        parent = parent.parent;
                    }

                    // Remove from old array
                    if(!conditionElement.parent)
                    {
                        this.conditionElements.remove(conditionElement);
                    }
                    else
                    {
                        conditionElement.parent.conditionData().conditionElements.remove(conditionElement);
                        if(conditionElement.parent.conditionData().conditionElements().length < 2)
                        {
                            this.deleteConditionElement(conditionElement.parent);
                        }
                    }

                    if(!group)
                    {
                        this.conditionElements.push(conditionElement);
                    }
                    else
                    {
                        group.conditionData().conditionElements.push(conditionElement);
                    }

                    conditionElement.parent = group;
                },

                /**
                 * Displays a warning
                 * 
                 * @param {ko.observable} obs Observable to set to true to display the warning
                 */
                displayWarning: function(obs) {
                    if(this.warningHideTimeout)
                    {
                        clearTimeout(this.warningHideTimeout);
                        this.showGroupWarning(false);
                        this.showDragParentToChildWarning(false);
                    }

                    obs(true);
                    this.warningHideTimeout = setTimeout(function() {
                        obs(false);
                    }, 5000);
                },

                /**
                 * Deletes a condition element
                 * 
                 * @param {object} element Condition Element
                 */
                deleteConditionElement: function(element) {
                    if(element.conditionData().conditionElements)
                    {
                        var conditionElements = element.conditionData().conditionElements();
                        if(element.parent && element.parent.conditionData().conditionElements)
                        {
                            this.moveConditionElements(conditionElements, element.parent.conditionData().conditionElements, element.parent, element);
                        }
                        else
                        {
                            this.moveConditionElements(conditionElements, this.conditionElements, null, element);
                        }
                    }

                    if(!element.parent || !element.parent.conditionData().conditionElements)
                    {
                        this.conditionElements.remove(element);
                    }
                    else
                    {
                        element.parent.conditionData().conditionElements.remove(element);
                        if(element.parent.conditionData().conditionElements().length < 2)
                        {
                            this.deleteConditionElement(element.parent);
                        }
                    }
                },

                /**
                 * Moves the condition elements 
                 * 
                 * @param {object[]} conditionElements Condition elements to move
                 * @param {ko.observableArray} targetArray Target array to move the elements too
                 * @param {object} parent New parent
                 */
                moveConditionElements: function(conditionElements, targetArray, parent, element) {
                    // Move elements
                    var targetIndex = targetArray.indexOf(element);
                    for(var curElement = 0; curElement < conditionElements.length; ++curElement)
                    {
                        conditionElements[curElement].parent = parent;
                        if(targetIndex < targetArray().length)
                        {
                            targetArray.splice(targetIndex + curElement, 0, conditionElements[curElement]);
                        }
                        else
                        {
                            targetArray.push(conditionElements[curElement]);
                        }
                    }
                },

                /**
                 * Returns the condition template
                 * 
                 * @param {object} element Condition Element
                 * @returns {string} Condition Element template
                 */
                getConditionTemplate: function(element) {
                    if(element)
                    {
                        return Conditions.getConditionManager().getConditionTemplate(element.conditionType());
                    }

                    return "gn-nodeConditionEmpty";
                },

                /**
                 * Returns the condition template
                 * 
                 * @param {object} element Condition Element
                 * @returns {string} Condition Element template
                 */
                isConditionTypeSelectable: function(element) {
                    if(element)
                    {
                        return Conditions.getConditionManager().isConditionTypeSelectable(element.conditionType());
                    }

                    return true;
                },


                /**
                 * Saves the condition
                 */
                saveCondition: function() {
                    var serializedData = [];
                    var conditionElements = this.conditionElements();
                    for(var curElement = 0; curElement < conditionElements.length; ++curElement)
                    {
                        serializedData.push(Conditions.getConditionManager().serializeConditionElement(conditionElements[curElement]));
                    }
                    
                    this.condition.conditionElements = serializedData;
                    if(this.closingDeferred)
                    {
                        this.closingDeferred.resolve();
                    }
                    this.closeDialog();
                },

                /**
                 * Closes the dialog
                 */
                closeDialog: function() {
                    this.condition = null;
                    this.closingDeferred = null;
                    this.isOpen(false);
                }
            };

        }(DefaultNodeShapes.Conditions = DefaultNodeShapes.Conditions || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(Export) {
        (function(FunctionGenerationCondition) {

            /**
             * Template Overview View Model
             * @class
             */
            FunctionGenerationCondition.ViewModel = function()
            {
                this.conditionDialog = new GoNorth.DefaultNodeShapes.Conditions.ConditionDialog();

                this.generateRules = new ko.observableArray();
                this.preventGenerationRules = new ko.observableArray();
                
                this.showConfirmDeleteDialog = new ko.observable(false);
                this.targetDeleteArray = null;
                this.targetDeleteRule = null;

                this.isLoading = new ko.observable(false);
                this.errorOccured = new ko.observable(false);
                this.hasUnknownConditionType = new ko.observable(false);
                this.isReadonly = new ko.observable(false);
                this.lockedByUser = new ko.observable("");

                this.acquireLock();
                this.loadFunctionGenerationConditions();
            };

            FunctionGenerationCondition.ViewModel.prototype = {
                /**
                 * Loads the function generation conditions
                 */
                loadFunctionGenerationConditions: function() {
                    this.isLoading(true);
                    this.errorOccured(false);
                    this.hasUnknownConditionType(false);
                    var self = this;
                    jQuery.ajax({
                        url: "/api/ExportApi/GetDialogFunctionGenerationConditions",
                        type: "GET"
                    }).done(function(data) {
                        var generateRulesNameDef = self.generateDisplayNameForRules(data.generateRules);
                        var preventGenerationRulesNameDef = self.generateDisplayNameForRules(data.preventGenerationRules);
                        jQuery.when(generateRulesNameDef, preventGenerationRulesNameDef).then(function(generateRules, preventGenerationRules) {
                            self.generateRules(generateRules);
                            self.preventGenerationRules(preventGenerationRules);

                            self.isLoading(false);
                        }, function() {
                            self.isLoading(false);
                            self.errorOccured(true);
                        });
                    }).fail(function() {
                        self.isLoading(false);
                        self.errorOccured(true);
                    });
                },

                /**
                 * Generates the display name for the rules
                 * 
                 * @param {object[]} rules Rules returned from the api
                 * @returns {jQuery.Deferred} Deferred for the name generation
                 */
                generateDisplayNameForRules: function(rules) {
                    var allNameDeferreds = [];
                    var self = this;
                    jQuery.each(rules, function(index, rule) {
                        var ruleNameDef = self.generateDisplayNameForRule(rule);
                        allNameDeferreds.push(ruleNameDef);
                    });
                    
                    var nameDef = new jQuery.Deferred();
                    jQuery.when.apply(jQuery, allNameDeferreds).then(function() {
                        nameDef.resolve(rules);
                    }, function() {
                        nameDef.reject();
                    });

                    return nameDef.promise();
                },

                /**
                 * Generates the display name for a single rule
                 * 
                 * @param {object[]} rules Rule to generate name for
                 * @returns {jQuery.Deferred} Deferred for the name generation
                 */
                generateDisplayNameForRule: function(rule) {
                    var ruleNameDef = new jQuery.Deferred();
                    var convertedRule = this.convertConditionToDialog(rule);
                    if(!convertedRule)
                    {
                        ruleNameDef.reject();
                        return ruleNameDef.promise();
                    }

                    GoNorth.DefaultNodeShapes.Conditions.getConditionManager().getConditionString(convertedRule.conditionElements, GoNorth.DefaultNodeShapes.Localization.Conditions.AndOperatorShort, false).then(function(conditionName) {
                        rule.name = conditionName;
                        ruleNameDef.resolve(rule);
                    }, function() {
                        ruleNameDef.reject();
                    });

                    return ruleNameDef.promise();
                },

                /**
                 * Creates a new rule
                 * 
                 * @param {ko.observableArray} targetArray Array to push the new rule into
                 */
                createNewRule: function(targetArray) {
                    var self = this;
                    this.showConditionDialog([]).done(function(condition) {
                        targetArray.push(condition);
                        self.saveConditions();
                    });
                },

                /**
                 * Opens the edit dialog for a rule
                 * 
                 * @param {object} targetArray Array which contains the rule
                 * @param {number} index Index of the rule
                 */
                openEditRuleDialog: function(targetArray, index) {
                    if(this.isReadonly())
                    {
                        return;
                    }

                    var ruleIndex = index();
                    var targetArrayValue = targetArray();
                    var self = this;
                    var convertedRule = this.convertConditionToDialog(targetArrayValue[ruleIndex]);
                    this.showConditionDialog(convertedRule.conditionElements).done(function(condition) {
                        targetArrayValue[ruleIndex] = condition;
                        targetArray(targetArrayValue);
                        self.saveConditions();
                    });
                },

                /**
                 * Opens the condition dialog
                 * 
                 * @param {object[]} existingElements Existing condition elements ready for the dialog
                 * @returns {jQuery.Deferred} Deferred which will be resolved with the updated condition
                 */
                showConditionDialog: function(existingElements) {
                    var condition = {
                        conditionElements: existingElements
                    };

                    var finalizedConditionsDeferred = new jQuery.Deferred();
                    var conditionDialogDeferred = new jQuery.Deferred();
                    this.conditionDialog.openDialog(condition, conditionDialogDeferred);
                    var self = this;
                    conditionDialogDeferred.done(function() {
                        var convertedCondition = self.convertConditionFromDialog(condition);
                        if(convertedCondition)
                        {
                            self.generateDisplayNameForRule(convertedCondition).then(function() {
                                finalizedConditionsDeferred.resolve(convertedCondition);
                            }, function() {
                                self.errorOccured(true);
                                finalizedConditionsDeferred.reject();
                            });
                        }
                    });

                    return finalizedConditionsDeferred.promise();
                },

                /**
                 * Converts a condition from the condition dialog to a version compatible with the api
                 * 
                 * @param {object} condition Dialog Condition
                 * @returns {object} Converted condition compatible with the api
                 */
                convertConditionFromDialog: function(condition) {
                    var convertedElements = FunctionGenerationCondition.convertConditionElementsFromDialog(condition.conditionElements);
                    return this.checkAndFinalizeConvertedElements(convertedElements);
                },

                /**
                 * Converts a condition from the api to a version compatible with the condition dialog
                 * 
                 * @param {object} condition Api condition
                 * @returns {object} Converted condition compatible with the dialog
                 */
                convertConditionToDialog: function(condition) {
                    var convertedElements = FunctionGenerationCondition.convertConditionElementsToDialog(condition.conditionElements);
                    return this.checkAndFinalizeConvertedElements(convertedElements);
                },

                /**
                 * Checks if a list of converted elements is valid and returns the final condition
                 * 
                 * @param {object[]} convertedElements Converted Elements
                 * @returns {object} Final condition
                 */
                checkAndFinalizeConvertedElements: function(convertedElements) {
                    if(!convertedElements) {
                        this.hasUnknownConditionType(true);
                        this.errorOccured(true);
                        return null;
                    }
                    
                    return {
                        conditionElements: convertedElements
                    };
                },

                /**
                 * Opens the delete rule dialog
                 * 
                 * @param {ko.observableArray} ruleArray Array for the rule
                 * @param {object} rule Rule
                 */
                openDeleteRuleDialog: function(ruleArray, rule) {
                    if(this.isLoading())
                    {
                        return;
                    }

                    this.showConfirmDeleteDialog(true);
                    this.targetDeleteArray = ruleArray;
                    this.targetDeleteRule = rule;     
                },

                /**
                 * Deletes the rule for which the rule dialog is open
                 */
                deleteRule: function() {
                    if(!this.targetDeleteArray) {
                        return;
                    }

                    this.targetDeleteArray.remove(this.targetDeleteRule);
                    this.saveConditions();
                    this.closeConfirmDeleteDialog();
                },

                /**
                 * Closes the confirm delete dialog
                 */
                closeConfirmDeleteDialog: function() {
                    this.showConfirmDeleteDialog(false);
                    this.targetDeleteArray = null;
                    this.targetDeleteRule = null;  
                },


                /**
                 * Saves the conditions
                 */
                saveConditions: function() {
                    var saveData = {
                        generateRules: this.generateRules(),
                        preventGenerationRules: this.preventGenerationRules()
                    }

                    this.isLoading(true);
                    this.errorOccured(false);
                    this.hasUnknownConditionType(false);
                    var self = this;
                    jQuery.ajax({
                        headers: GoNorth.Util.generateAntiForgeryHeader(),
                        url: "/api/ExportApi/SaveDialogFunctionGenerationConditions",
                        type: "POST",
                        data: JSON.stringify(saveData),
                        contentType: "application/json"
                    }).done(function() {
                        self.loadFunctionGenerationConditions();
                    }).fail(function() {
                        self.isLoading(false);
                        self.errorOccured(true);
                    });
                },


                /**
                 * Acquires a lock
                 */
                acquireLock: function() {
                    var self = this;
                    GoNorth.LockService.acquireLock("ExportDialogFunctionGenerationCondition", GoNorth.Export.FunctionGenerationCondition.lockId).done(function(isLocked, lockedUsername) { 
                        if(isLocked)
                        {
                            self.isReadonly(true);
                            self.lockedByUser(lockedUsername);
                        }
                    }).fail(function() {
                        self.errorOccured(true);
                        self.isReadonly(true);
                    });
                }
            };

        }(Export.FunctionGenerationCondition = Export.FunctionGenerationCondition || {}));
    }(GoNorth.Export = GoNorth.Export || {}));
}(window.GoNorth = window.GoNorth || {}));