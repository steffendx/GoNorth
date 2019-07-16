(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Conditions) {

            /// Condition Type for checking value of a skill to choose
            var conditionTypeCheckChooseNpcSkillValue = 14;

            /**
             * Check npc skill value condition where skill is chosen
             * @class
             */
            Conditions.CheckChooseNpcSkillValueCondition = function()
            {
                GoNorth.DefaultNodeShapes.Conditions.CheckChooseSkillValueCondition.apply(this);
            };

            Conditions.CheckChooseNpcSkillValueCondition.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.Conditions.CheckChooseSkillValueCondition.prototype);

            /**
             * Returns the skill prefix
             * 
             * @returns {string} Skill Prefix
             */
            Conditions.CheckChooseNpcSkillValueCondition.prototype.getSkillPrefix = function() {
                return DefaultNodeShapes.Localization.Conditions.NpcSkillPrefix;
            };

            /**
             * Returns the type of the condition
             * 
             * @returns {number} Type of the condition
             */
            Conditions.CheckChooseNpcSkillValueCondition.prototype.getType = function() {
                return conditionTypeCheckChooseNpcSkillValue;
            };

            /**
             * Returns the label of the condition
             * 
             * @returns {string} Label of the condition
             */
            Conditions.CheckChooseNpcSkillValueCondition.prototype.getLabel = function() {
                return DefaultNodeShapes.Localization.Conditions.CheckChooseNpcSkillValueLabel;
            };

            GoNorth.DefaultNodeShapes.Conditions.getConditionManager().addConditionType(new Conditions.CheckChooseNpcSkillValueCondition());

        }(DefaultNodeShapes.Conditions = DefaultNodeShapes.Conditions || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));