(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Actions) {

            /// Action Type for showing a floating text above an npc
            var actionTypeShowFloatingTextAboveNpc = 29;

            /**
             * Show floating text above npc Action
             * @class
             */
            Actions.ShowFloatingTextAboveNpcAction = function()
            {
                GoNorth.DefaultNodeShapes.Actions.ShowFloatingTextAboveObjectAction.apply(this);
            };

            Actions.ShowFloatingTextAboveNpcAction.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.Actions.ShowFloatingTextAboveObjectAction.prototype);

            /**
             * Builds the action
             * 
             * @returns {object} Action
             */
            Actions.ShowFloatingTextAboveNpcAction.prototype.buildAction = function() {
                return new Actions.ShowFloatingTextAboveNpcAction();
            };

            /**
             * Returns the type of the action
             * 
             * @returns {number} Type of the action
             */
            Actions.ShowFloatingTextAboveNpcAction.prototype.getType = function() {
                return actionTypeShowFloatingTextAboveNpc;
            };

            /**
             * Returns the label of the action
             * 
             * @returns {string} Label of the action
             */
            Actions.ShowFloatingTextAboveNpcAction.prototype.getLabel = function() {
                return DefaultNodeShapes.Localization.Actions.ShowFloatingTextAboveNpcLabel;
            };

            GoNorth.DefaultNodeShapes.Shapes.addAvailableAction(new Actions.ShowFloatingTextAboveNpcAction());

        }(DefaultNodeShapes.Actions = DefaultNodeShapes.Actions || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));