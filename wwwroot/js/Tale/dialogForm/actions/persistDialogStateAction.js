(function(GoNorth) {
    "use strict";
    (function(Tale) {
        (function(Actions) {

            /// Action Type for persisting the dialog state
            var actionTypePersistDialogState = 24;

            /**
             * Persist Dialog State Action
             * @class
             */
            Actions.PersistDialogStateAction = function()
            {
                GoNorth.DefaultNodeShapes.Actions.BaseAction.apply(this);
            };

            Actions.PersistDialogStateAction.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.Actions.BaseAction.prototype);

            /**
             * Returns the HTML Content of the action
             * 
             * @returns {string} HTML Content of the action
             */
            Actions.PersistDialogStateAction.prototype.getContent = function() {
                return  "<div class='gn-nodeActionText'>" + Tale.Localization.Actions.PersistDialogStateWillContinueOnThisPointNextTalk + "</div>";
            };

            /**
             * Gets called once the action was intialized
             * 
             * @param {object} contentElement Content element
             * @param {ActionNode} actionNode Parent Action node
             */
            Actions.PersistDialogStateAction.prototype.onInitialized = function(contentElement, actionNode) {
                this.contentElement = contentElement;
            };
            
            /**
             * Builds the action
             * 
             * @returns {object} Action
             */
            Actions.PersistDialogStateAction.prototype.buildAction = function() {
                return new Actions.PersistDialogStateAction();
            };

            /**
             * Returns the type of the action
             * 
             * @returns {number} Type of the action
             */
            Actions.PersistDialogStateAction.prototype.getType = function() {
                return actionTypePersistDialogState;
            };

            /**
             * Returns the label of the action
             * 
             * @returns {string} Label of the action
             */
            Actions.PersistDialogStateAction.prototype.getLabel = function() {
                return Tale.Localization.Actions.PersistDialogStateLabel;
            };

            GoNorth.DefaultNodeShapes.Shapes.addAvailableAction(new Actions.PersistDialogStateAction());

        }(Tale.Actions = Tale.Actions || {}));
    }(GoNorth.Tale = GoNorth.Tale || {}));
}(window.GoNorth = window.GoNorth || {}));