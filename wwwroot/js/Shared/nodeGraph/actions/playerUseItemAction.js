(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Actions) {

            /// Action Type for the player using an item
            var actionTypePlayerUseItem = 54;

            /**
             * Player uses an item action
             * @class
             */
            Actions.PlayerUseItemAction = function()
            {
                Actions.ObjectUseItemAction.apply(this);
            };

            Actions.PlayerUseItemAction.prototype = jQuery.extend({ }, Actions.ObjectUseItemAction.prototype);

            /**
             * Builds the action
             * 
             * @returns {object} Action
             */
            Actions.PlayerUseItemAction.prototype.buildAction = function() {
                return new Actions.PlayerUseItemAction();
            };

            /**
             * Returns the type of the action
             * 
             * @returns {number} Type of the action
             */
            Actions.PlayerUseItemAction.prototype.getType = function() {
                return actionTypePlayerUseItem;
            };

            /**
             * Returns the label of the action
             * 
             * @returns {string} Label of the action
             */
            Actions.PlayerUseItemAction.prototype.getLabel = function() {
                return DefaultNodeShapes.Localization.Actions.PlayerUseItemLabel;
            };

            GoNorth.DefaultNodeShapes.Shapes.addAvailableAction(new Actions.PlayerUseItemAction());

        }(DefaultNodeShapes.Actions = DefaultNodeShapes.Actions || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));