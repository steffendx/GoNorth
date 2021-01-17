(function(GoNorth) {
    "use strict";
    (function(Styr) {
        (function(Conditions) {

            /// Condition Type for checking the item value
            var conditionTypeCheckItemValue = 23;

            /**
             * Check item value condition
             * @class
             */
            Conditions.CheckItemValueCondition = function()
            {
                GoNorth.DefaultNodeShapes.Conditions.CheckValueCondition.apply(this);
            };

            Conditions.CheckItemValueCondition.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.Conditions.CheckValueCondition.prototype);

            /**
             * Returns the type of the condition
             * 
             * @returns {number} Type of the condition
             */
            Conditions.CheckItemValueCondition.prototype.getType = function() {
                return conditionTypeCheckItemValue;
            };

            /**
             * Returns the label of the condition
             * 
             * @returns {string} Label of the condition
             */
            Conditions.CheckItemValueCondition.prototype.getLabel = function() {
                return Styr.Localization.Conditions.CheckItemValueLabel;
            };

            /**
             * Returns the title of the field object used in the string representation
             * 
             * @param {object} loadedFieldObject Loaded Field object for returning name if necessary
             * @returns {string} Title of the field object
             */
            Conditions.CheckItemValueCondition.prototype.getObjectTitle = function(loadedFieldObject) {
                return Styr.Localization.Conditions.ItemLabel;
            };

            /**
             * Returns the object type name. Used for dependency objects
             * 
             * @returns {string} Object Type name used for depends on objects 
             */
            Conditions.CheckItemValueCondition.prototype.getObjectTypeName = function() {
                return Conditions.RelatedToObjectItem;
            };

            /**
             * Returns the object resource
             * 
             * @returns {int} Object Resource
             */
            Conditions.CheckItemValueCondition.prototype.getObjectId = function() {
                return Styr.getCurrentItemId();
            };

            /**
             * Returns the object resource
             * 
             * @returns {int} Object Resource
             */
            Conditions.CheckItemValueCondition.prototype.getObjectResource = function() {
                return GoNorth.DefaultNodeShapes.Shapes.ObjectResourceItem;
            };

            /**
             * Loads the item
             * 
             * @returns {jQuery.Deferred} Deferred for the async process
             */
            Conditions.CheckItemValueCondition.prototype.loadObject = function() {
                var def = new jQuery.Deferred();
                
                GoNorth.HttpClient.get("/api/StyrApi/FlexFieldObject?id=" + Styr.getCurrentItemId()).done(function(data) {
                    def.resolve(data);
                }).fail(function(xhr) {
                    def.reject();
                });

                return def.promise();
            };


            GoNorth.DefaultNodeShapes.Conditions.getConditionManager().addConditionType(new Conditions.CheckItemValueCondition());

        }(Styr.Conditions = Styr.Conditions || {}));
    }(GoNorth.Styr = GoNorth.Styr || {}));
}(window.GoNorth = window.GoNorth || {}));