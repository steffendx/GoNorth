(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Conditions) {

            /// Condition Type for checking if the npc has not learned a skill
            var conditionTypeCheckSkillNpcNotLearned = 18;

            /**
             * Check if npc has not learned a skill
             * @class
             */
            Conditions.CheckNpcNotLearnedSkillCondition = function()
            {
                GoNorth.DefaultNodeShapes.Conditions.CheckLearnedSkillCondition.apply(this);
            };

            Conditions.CheckNpcNotLearnedSkillCondition.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.Conditions.CheckLearnedSkillCondition.prototype);

            /**
             * Returns the type of the condition
             * 
             * @returns {number} Type of the condition
             */
            Conditions.CheckNpcNotLearnedSkillCondition.prototype.getType = function() {
                return conditionTypeCheckSkillNpcNotLearned;
            };

            /**
             * Returns the label of the condition
             * 
             * @returns {string} Label of the condition
             */
            Conditions.CheckNpcNotLearnedSkillCondition.prototype.getLabel = function() {
                return DefaultNodeShapes.Localization.Conditions.CheckNpcNotLearnedSkillLabel;
            };

            /**
             * Returns the condition string prefix infront of the skill name
             * 
             * @returns {string} Condition String prefix
             */
            Conditions.CheckNpcNotLearnedSkillCondition.prototype.getConditionStringPrefix = function() {
                return DefaultNodeShapes.Localization.Conditions.CheckNpcNotLearnedSkillPrefixLabel;
            };

            GoNorth.DefaultNodeShapes.Conditions.getConditionManager().addConditionType(new Conditions.CheckNpcNotLearnedSkillCondition());

        }(DefaultNodeShapes.Conditions = DefaultNodeShapes.Conditions || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));