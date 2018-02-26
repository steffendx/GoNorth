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