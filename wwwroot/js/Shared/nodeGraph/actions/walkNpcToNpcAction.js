(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Actions) {

            /// Action Type for walking an npc to an npc
            var actionTypeWalkNpcToNpc = 46;

            /**
             * Walk npc to npc Action
             * @class
             */
            Actions.WalkNpcToNpcAction = function()
            {
                GoNorth.DefaultNodeShapes.Actions.MoveObjectToNpcAction.apply(this);
            };

            Actions.WalkNpcToNpcAction.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.Actions.MoveObjectToNpcAction.prototype);

            /**
             * Returns true if the action has a movement state, else false
             * 
             * @returns {bool} true if the action has a movement state, else false
             */
            Actions.WalkNpcToNpcAction.prototype.hasMovementState = function() {
                return true;
            };

            /**
             * Builds the action
             * 
             * @returns {object} Action
             */
            Actions.WalkNpcToNpcAction.prototype.buildAction = function() {
                return new Actions.WalkNpcToNpcAction();
            };

            /**
             * Returns the type of the action
             * 
             * @returns {number} Type of the action
             */
            Actions.WalkNpcToNpcAction.prototype.getType = function() {
                return actionTypeWalkNpcToNpc;
            };

            /**
             * Returns the label of the action
             * 
             * @returns {string} Label of the action
             */
            Actions.WalkNpcToNpcAction.prototype.getLabel = function() {
                return DefaultNodeShapes.Localization.Actions.WalkNpcToNpcLabel;
            };
            /**
             * Returns the label for the main output
             * 
             * @returns {string} Label for the main output
             */
            Actions.WalkNpcToNpcAction.prototype.getMainOutputLabel = function() {
                return DefaultNodeShapes.Localization.Actions.WalkOnTargetReachLabel;
            };

            /**
             * Returns the additional outports of the action
             * 
             * @returns {string[]} Additional outports
             */
            Actions.WalkNpcToNpcAction.prototype.getAdditionalOutports = function() {
                return [ DefaultNodeShapes.Localization.Actions.WalkDirectContinueLabel ];
            };

            GoNorth.DefaultNodeShapes.Shapes.addAvailableAction(new Actions.WalkNpcToNpcAction());

        }(DefaultNodeShapes.Actions = DefaultNodeShapes.Actions || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));