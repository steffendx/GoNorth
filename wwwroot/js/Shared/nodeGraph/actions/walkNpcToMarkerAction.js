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

            GoNorth.DefaultNodeShapes.Shapes.addAvailableAction(new Actions.WalkNpcToMarkerAction());

        }(DefaultNodeShapes.Actions = DefaultNodeShapes.Actions || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));