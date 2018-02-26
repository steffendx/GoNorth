(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Conditions) {

            /**
             * Condition Dialog Model
             * @class
             */
            Conditions.ConditionDialog = function()
            {
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