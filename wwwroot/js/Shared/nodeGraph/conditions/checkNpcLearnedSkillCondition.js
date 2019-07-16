(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Conditions) {

            /// Condition Type for checking if the npc has learned a skill
            var conditionTypeCheckSkillNpcLearned = 17;

            /**
             * Check if npc has learned a skill
             * @class
             */
            Conditions.CheckNpcLearnedSkillCondition = function()
            {
                GoNorth.DefaultNodeShapes.Conditions.CheckLearnedSkillCondition.apply(this);
            };

            Conditions.CheckNpcLearnedSkillCondition.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.Conditions.CheckLearnedSkillCondition.prototype);

            /**
             * Returns the type of the condition
             * 
             * @returns {number} Type of the condition
             */
            Conditions.CheckNpcLearnedSkillCondition.prototype.getType = function() {
                return conditionTypeCheckSkillNpcLearned;
            };

            /**
             * Returns the label of the condition
             * 
             * @returns {string} Label of the condition
             */
            Conditions.CheckNpcLearnedSkillCondition.prototype.getLabel = function() {
                return DefaultNodeShapes.Localization.Conditions.CheckNpcLearnedSkillLabel;
            };

            /**
             * Returns the condition string prefix infront of the skill name
             * 
             * @returns {string} Condition String prefix
             */
            Conditions.CheckNpcLearnedSkillCondition.prototype.getConditionStringPrefix = function() {
                return DefaultNodeShapes.Localization.Conditions.CheckNpcLearnedSkillPrefixLabel;
            };

            GoNorth.DefaultNodeShapes.Conditions.getConditionManager().addConditionType(new Conditions.CheckNpcLearnedSkillCondition());

        }(DefaultNodeShapes.Conditions = DefaultNodeShapes.Conditions || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));