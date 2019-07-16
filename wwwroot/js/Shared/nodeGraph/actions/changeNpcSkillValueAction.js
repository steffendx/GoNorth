(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Actions) {

            /// Action Type for changing a npc skill value
            var actionTypeChangeNpcSkillValue = 23;

            /**
             * Change skill value Action
             * @class
             */
            Actions.ChangeNpcSkillValueAction = function()
            {
                GoNorth.DefaultNodeShapes.Actions.ChangeSkillValueAction.apply(this);
            };

            Actions.ChangeNpcSkillValueAction.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.Actions.ChangeSkillValueAction.prototype);

            /**
             * Builds the action
             * 
             * @returns {object} Action
             */
            Actions.ChangeNpcSkillValueAction.prototype.buildAction = function() {
                return new Actions.ChangeNpcSkillValueAction();
            };

            /**
             * Returns the type of the action
             * 
             * @returns {number} Type of the action
             */
            Actions.ChangeNpcSkillValueAction.prototype.getType = function() {
                return actionTypeChangeNpcSkillValue;
            };

            /**
             * Returns the label of the action
             * 
             * @returns {string} Label of the action
             */
            Actions.ChangeNpcSkillValueAction.prototype.getLabel = function() {
                return DefaultNodeShapes.Localization.Actions.ChangeNpcSkillValueLabel;
            };


            GoNorth.DefaultNodeShapes.Shapes.addAvailableAction(new Actions.ChangeNpcSkillValueAction());

        }(DefaultNodeShapes.Actions = DefaultNodeShapes.Actions || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));