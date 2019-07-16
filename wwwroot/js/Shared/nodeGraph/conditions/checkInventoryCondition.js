(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Conditions) {

            /// Operator for the has at least operation
            var inventoryOperatorHasAtLeast = 0;

            /// Operator for the has at maximum operation
            var inventoryOperatorHasAtMaximum = 1;

            /**
             * Check inventory condition
             * @class
             */
            Conditions.CheckInventoryCondition = function()
            {
                GoNorth.DefaultNodeShapes.Conditions.BaseCondition.apply(this);
            };

            Conditions.CheckInventoryCondition.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.Conditions.BaseCondition.prototype);

            /**
             * Returns the template name for the condition
             * 
             * @returns {string} Template name
             */
            Conditions.CheckInventoryCondition.prototype.getTemplateName = function() {
                return "gn-nodeConditionInventoryCheck";
            };
            
            /**
             * Returns true if the condition can be selected in the dropdown list, else false
             * 
             * @returns {bool} true if the condition can be selected, else false
             */
            Conditions.CheckInventoryCondition.prototype.canBeSelected = function() {
                return true;
            };

            /**
             * Returns the name of an item
             * 
             * @param {string} itemId Id of the item
             * @returns {jQuery.Deferred} Deferred for the loading proccess
             */
            Conditions.CheckInventoryCondition.prototype.getItemName = function(itemId) {
                var def = new jQuery.Deferred();

                jQuery.ajax({ 
                    url: "/api/StyrApi/ResolveFlexFieldObjectNames", 
                    headers: GoNorth.Util.generateAntiForgeryHeader(),
                    data: JSON.stringify([ itemId ]), 
                    type: "POST",
                    contentType: "application/json"
                }).done(function(itemNames) {
                    if(itemNames.length == 0)
                    {
                        def.reject();
                        return;
                    }

                    def.resolve(itemNames[0].name);
                }).fail(function(xhr) {
                    def.reject();
                });

                return def.promise();
            };

            /**
             * Returns the data for the condition
             * 
             * @param {object} existingData Existing condition data
             * @param {object} element Element to which the data belongs
             * @returns {object} Condition data
             */
            Conditions.CheckInventoryCondition.prototype.buildConditionData = function(existingData, element) {
                var conditionData = {
                    selectedItemId: new ko.observable(),
                    selectedItemName: new ko.observable(DefaultNodeShapes.Localization.Conditions.ChooseItem),
                    operator: new ko.observable(),
                    availableOperators: [ { value: inventoryOperatorHasAtLeast, title: DefaultNodeShapes.Localization.Conditions.ItemOperatorHasAtLeast }, { value: inventoryOperatorHasAtMaximum, title: DefaultNodeShapes.Localization.Conditions.ItemOperatorHasMaximum }],
                    quantity: new ko.observable(0)
                };

                if(existingData)
                {
                    conditionData.selectedItemId(existingData.itemId);
                    conditionData.operator(existingData.operator);
                    conditionData.quantity(existingData.quantity);

                    this.getItemName(existingData.itemId).then(function(name) {
                        conditionData.selectedItemName(name);
                    }, function() {
                        element.errorOccured(true);
                    });
                }

                conditionData.chooseItem = function() {
                    GoNorth.DefaultNodeShapes.openItemSearchDialog().then(function(item) {
                        conditionData.selectedItemId(item.id);
                        conditionData.selectedItemName(item.name);
                    });
                };
                
                return conditionData;
            };
            
            /**
             * Serializes condition data
             * 
             * @param {object} conditionData Condition data
             * @returns {object} Serialized data
             */
            Conditions.CheckInventoryCondition.prototype.serializeConditionData = function(conditionData) {
                var quantity = parseInt(conditionData.quantity());
                if(isNaN(quantity))
                {
                    quantity = 0;
                }

                return {
                    itemId: conditionData.selectedItemId(),
                    operator: conditionData.operator(),
                    quantity: quantity
                };
            };

            /**
             * Returns the objects on which an object depends
             * 
             * @param {object} existingData Existing condition data
             * @returns {object[]} Objects on which the condition depends
             */
            Conditions.CheckInventoryCondition.prototype.getConditionDependsOnObject = function(existingData) {
                return [{
                    objectType: Conditions.RelatedToObjectItem,
                    objectId: existingData.itemId
                }];
            }

            /**
             * Returns the title of the inventory
             * 
             * @returns {string} Title of the inventory
             */
            Conditions.CheckInventoryCondition.prototype.getInventoryTitle = function() {
                
            };

            /**
             * Returns the condition data as a display string
             * 
             * @param {object} existingData Serialzied condition data
             * @returns {jQuery.Deferred} Deferred for the loading process
             */
            Conditions.CheckInventoryCondition.prototype.getConditionString = function(existingData) {
                var def = new jQuery.Deferred();
                if(!existingData.itemId)
                {
                    def.resolve(DefaultNodeShapes.Localization.Conditions.ChooseItem);
                    return def.promise();
                }

                var self = this;
                this.getItemName(existingData.itemId).then(function(name) {
                    var conditionString = self.getInventoryTitle() + " " + DefaultNodeShapes.Localization.Conditions.ItemCount + "(\"" + name + "\") ";
                    if(existingData.operator == inventoryOperatorHasAtLeast)
                    {
                        conditionString += ">=";
                    }
                    else if(existingData.operator == inventoryOperatorHasAtMaximum)
                    {
                        conditionString += "<=";
                    }
                    conditionString += " " + existingData.quantity;

                    def.resolve(conditionString);
                }, function() {
                    def.reject();
                });

                return def.promise();
            }

        }(DefaultNodeShapes.Conditions = DefaultNodeShapes.Conditions || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));