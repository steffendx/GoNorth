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