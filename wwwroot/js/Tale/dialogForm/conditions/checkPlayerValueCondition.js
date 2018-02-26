(function(GoNorth) {
    "use strict";
    (function(Tale) {
        (function(Conditions) {

            /// Condition Type for checking the player value
            var conditionTypeCheckPlayerValue = 2;

            /**
             * Check player value condition
             * @class
             */
            Conditions.CheckPlayerValueCondition = function()
            {
                GoNorth.DefaultNodeShapes.Conditions.CheckValueCondition.apply(this);
            };

            Conditions.CheckPlayerValueCondition.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.Conditions.CheckValueCondition.prototype);

            /**
             * Returns the type of the condition
             * 
             * @returns {number} Type of the condition
             */
            Conditions.CheckPlayerValueCondition.prototype.getType = function() {
                return conditionTypeCheckPlayerValue;
            };

            /**
             * Returns the label of the condition
             * 
             * @returns {string} Label of the condition
             */
            Conditions.CheckPlayerValueCondition.prototype.getLabel = function() {
                return Tale.Localization.Conditions.CheckPlayerValueLabel;
            };

            /**
             * Returns the title of the field object used in the string representation
             * 
             * @param {object} loadedFieldObject Loaded Field object for returning name if necessary
             * @returns {string} Title of the field object
             */
            Conditions.CheckPlayerValueCondition.prototype.getObjectTitle = function(loadedFieldObject) {
                return Tale.Localization.Conditions.PlayerLabel;
            };

            /**
             * Returns the object type name. Used for dependency objects
             * 
             * @returns {string} Object Type name used for depends on objects 
             */
            Conditions.CheckPlayerValueCondition.prototype.getObjectTypeName = function() {
                return "Npc";
            };

            /**
             * Returns the object resource
             * 
             * @returns {int} Object Resource
             */
            Conditions.CheckPlayerValueCondition.prototype.getObjectId = function() {
                return "PlayerNpc";
            };

            /**
             * Returns the object resource
             * 
             * @returns {int} Object Resource
             */
            Conditions.CheckPlayerValueCondition.prototype.getObjectResource = function() {
                return GoNorth.DefaultNodeShapes.Shapes.ObjectResourceNpc;
            };

            /**
             * Loads the npc
             * 
             * @returns {jQuery.Deferred} Deferred for the async process
             */
            Conditions.CheckPlayerValueCondition.prototype.loadObject = function() {
                var def = new jQuery.Deferred();
                
                var self = this;
                jQuery.ajax({ 
                    url: "/api/KortistoApi/PlayerNpc", 
                    type: "GET"
                }).done(function(data) {
                    def.resolve(data);
                }).fail(function(xhr) {
                    def.reject();
                });

                return def.promise();
            };


            GoNorth.DefaultNodeShapes.Conditions.getConditionManager().addConditionType(new Conditions.CheckPlayerValueCondition());

        }(Tale.Conditions = Tale.Conditions || {}));
    }(GoNorth.Tale = GoNorth.Tale || {}));
}(window.GoNorth = window.GoNorth || {}));