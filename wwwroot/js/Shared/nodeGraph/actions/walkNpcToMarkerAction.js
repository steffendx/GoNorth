(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Actions) {

            /// Action Type for walking an npc to a target marker
            var actionTypeWalkNpcToMarker = 42;

            /**
             * Walk npc to marker Action
             * @class
             */
            Actions.WalkNpcToMarkerAction = function()
            {
                GoNorth.DefaultNodeShapes.Actions.MoveObjectAction.apply(this);
            };

            Actions.WalkNpcToMarkerAction.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.Actions.MoveObjectAction.prototype);

            /**
             * Returns true if the action has a movement state, else false
             * 
             * @returns {bool} true if the action has a movement state, else false
             */
            Actions.WalkNpcToMarkerAction.prototype.hasMovementState = function() {
                return true;
            };

            /**
             * Builds the action
             * 
             * @returns {object} Action
             */
            Actions.WalkNpcToMarkerAction.prototype.buildAction = function() {
                return new Actions.WalkNpcToMarkerAction();
            };

            /**
             * Returns the type of the action
             * 
             * @returns {number} Type of the action
             */
            Actions.WalkNpcToMarkerAction.prototype.getType = function() {
                return actionTypeWalkNpcToMarker;
            };

            /**
             * Returns the label of the action
             * 
             * @returns {string} Label of the action
             */
            Actions.WalkNpcToMarkerAction.prototype.getLabel = function() {
                return DefaultNodeShapes.Localization.Actions.WalkNpcLabel;
            };
                
            /**
             * Returns the label for the main output
             * 
             * @returns {string} Label for the main output
             */
            Actions.WalkNpcToMarkerAction.prototype.getMainOutputLabel = function() {
                return DefaultNodeShapes.Localization.Actions.WalkOnTargetReachLabel;
            };

            /**
             * Returns the additional outports of the action
             * 
             * @returns {string[]} Additional outports
             */
            Actions.WalkNpcToMarkerAction.prototype.getAdditionalOutports = function() {
                return [ DefaultNodeShapes.Localization.Actions.WalkDirectContinueLabel ];
            };


            GoNorth.DefaultNodeShapes.Shapes.addAvailableAction(new Actions.WalkNpcToMarkerAction());

        }(DefaultNodeShapes.Actions = DefaultNodeShapes.Actions || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));