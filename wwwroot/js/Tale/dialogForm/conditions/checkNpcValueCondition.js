(function(GoNorth) {
    "use strict";
    (function(Tale) {
        (function(Conditions) {

            /// Condition Type for checking the npc value
            var conditionTypeCheckNpcValue = 3;

            /**
             * Check npc value condition
             * @class
             */
            Conditions.CheckNpcValueCondition = function()
            {
                GoNorth.DefaultNodeShapes.Conditions.CheckValueCondition.apply(this);
            };

            Conditions.CheckNpcValueCondition.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.Conditions.CheckValueCondition.prototype);

            /**
             * Returns the type of the condition
             * 
             * @returns {number} Type of the condition
             */
            Conditions.CheckNpcValueCondition.prototype.getType = function() {
                return conditionTypeCheckNpcValue;
            };

            /**
             * Returns the label of the condition
             * 
             * @returns {string} Label of the condition
             */
            Conditions.CheckNpcValueCondition.prototype.getLabel = function() {
                return Tale.Localization.Conditions.CheckNpcValueLabel;
            };

            /**
             * Returns the title of the field object used in the string representation
             * 
             * @param {object} loadedFieldObject Loaded Field object for returning name if necessary
             * @returns {string} Title of the field object
             */
            Conditions.CheckNpcValueCondition.prototype.getObjectTitle = function(loadedFieldObject) {
                return Tale.Localization.Conditions.NpcLabel;
            };

            /**
             * Returns the object type name. Used for dependency objects
             * 
             * @returns {string} Object Type name used for depends on objects 
             */
            Conditions.CheckNpcValueCondition.prototype.getObjectTypeName = function() {
                return "Npc";
            };

            /**
             * Returns the object resource
             * 
             * @returns {int} Object Resource
             */
            Conditions.CheckNpcValueCondition.prototype.getObjectId = function() {
                return Tale.getCurrentRelatedObjectId();
            };

            /**
             * Returns the object resource
             * 
             * @returns {int} Object Resource
             */
            Conditions.CheckNpcValueCondition.prototype.getObjectResource = function() {
                return GoNorth.DefaultNodeShapes.Shapes.ObjectResourceNpc;
            };

            /**
             * Loads the npc
             * 
             * @returns {jQuery.Deferred} Deferred for the async process
             */
            Conditions.CheckNpcValueCondition.prototype.loadObject = function() {
                var def = new jQuery.Deferred();
                
                var self = this;
                jQuery.ajax({ 
                    url: "/api/KortistoApi/FlexFieldObject?id=" + Tale.getCurrentRelatedObjectId(), 
                    type: "GET"
                }).done(function(data) {
                    def.resolve(data);
                }).fail(function(xhr) {
                    def.reject();
                });

                return def.promise();
            };


            GoNorth.DefaultNodeShapes.Conditions.getConditionManager().addConditionType(new Conditions.CheckNpcValueCondition());

        }(Tale.Conditions = Tale.Conditions || {}));
    }(GoNorth.Tale = GoNorth.Tale || {}));
}(window.GoNorth = window.GoNorth || {}));