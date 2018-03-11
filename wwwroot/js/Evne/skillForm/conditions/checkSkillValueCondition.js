(function(GoNorth) {
    "use strict";
    (function(Evne) {
        (function(Conditions) {

            /// Condition Type for checking the skill value
            var conditionTypeCheckSkillValue = 11;

            /**
             * Check skill value condition
             * @class
             */
            Conditions.CheckSkillValueCondition = function()
            {
                GoNorth.DefaultNodeShapes.Conditions.CheckValueCondition.apply(this);
            };

            Conditions.CheckSkillValueCondition.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.Conditions.CheckValueCondition.prototype);

            /**
             * Returns the type of the condition
             * 
             * @returns {number} Type of the condition
             */
            Conditions.CheckSkillValueCondition.prototype.getType = function() {
                return conditionTypeCheckSkillValue;
            };

            /**
             * Returns the label of the condition
             * 
             * @returns {string} Label of the condition
             */
            Conditions.CheckSkillValueCondition.prototype.getLabel = function() {
                return Evne.Localization.Conditions.CheckSkillValueLabel;
            };

            /**
             * Returns the title of the field object used in the string representation
             * 
             * @param {object} loadedFieldObject Loaded Field object for returning name if necessary
             * @returns {string} Title of the field object
             */
            Conditions.CheckSkillValueCondition.prototype.getObjectTitle = function(loadedFieldObject) {
                return Evne.Localization.Conditions.SkillLabel;
            };

            /**
             * Returns the object type name. Used for dependency objects
             * 
             * @returns {string} Object Type name used for depends on objects 
             */
            Conditions.CheckSkillValueCondition.prototype.getObjectTypeName = function() {
                return "Skill";
            };

            /**
             * Returns the object resource
             * 
             * @returns {int} Object Resource
             */
            Conditions.CheckSkillValueCondition.prototype.getObjectId = function() {
                return Evne.getCurrentSkillId();
            };

            /**
             * Returns the object resource
             * 
             * @returns {int} Object Resource
             */
            Conditions.CheckSkillValueCondition.prototype.getObjectResource = function() {
                return GoNorth.DefaultNodeShapes.Shapes.ObjectResourceSkill;
            };

            /**
             * Loads the skill
             * 
             * @returns {jQuery.Deferred} Deferred for the async process
             */
            Conditions.CheckSkillValueCondition.prototype.loadObject = function() {
                var def = new jQuery.Deferred();
                
                var self = this;
                jQuery.ajax({ 
                    url: "/api/EvneApi/FlexFieldObject?id=" + Evne.getCurrentSkillId(), 
                    type: "GET"
                }).done(function(data) {
                    def.resolve(data);
                }).fail(function(xhr) {
                    def.reject();
                });

                return def.promise();
            };


            GoNorth.DefaultNodeShapes.Conditions.getConditionManager().addConditionType(new Conditions.CheckSkillValueCondition());

        }(Evne.Conditions = Evne.Conditions || {}));
    }(GoNorth.Evne = GoNorth.Evne || {}));
}(window.GoNorth = window.GoNorth || {}));