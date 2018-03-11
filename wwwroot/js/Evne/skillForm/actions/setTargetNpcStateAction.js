(function(GoNorth) {
    "use strict";
    (function(Evne) {
        (function(Actions) {

            /// Action Type for changing the target npc state
            var actionTypeChangeTargetNpcState = 16;

            /**
             * Change target npc state Action
             * @class
             */
            Actions.SetTargetNpcStateAction = function()
            {
                GoNorth.DefaultNodeShapes.Actions.SetObjectStateAction.apply(this);
            };

            Actions.SetTargetNpcStateAction.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.Actions.SetObjectStateAction.prototype);

            /**
             * Builds the action
             * 
             * @returns {object} Action
             */
            Actions.SetTargetNpcStateAction.prototype.buildAction = function() {
                return new Actions.SetTargetNpcStateAction();
            };

            /**
             * Returns the type of the action
             * 
             * @returns {number} Type of the action
             */
            Actions.SetTargetNpcStateAction.prototype.getType = function() {
                return actionTypeChangeTargetNpcState;
            };

            /**
             * Returns the label of the action
             * 
             * @returns {string} Label of the action
             */
            Actions.SetTargetNpcStateAction.prototype.getLabel = function() {
                return Evne.Localization.Actions.SetTargetNpcStateLabel;
            };

            GoNorth.DefaultNodeShapes.Shapes.addAvailableAction(new Actions.SetTargetNpcStateAction());

        }(Evne.Actions = Evne.Actions || {}));
    }(GoNorth.Evne = GoNorth.Evne || {}));
}(window.GoNorth = window.GoNorth || {}));