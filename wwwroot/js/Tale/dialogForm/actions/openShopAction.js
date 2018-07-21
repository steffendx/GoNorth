(function(GoNorth) {
    "use strict";
    (function(Tale) {
        (function(Actions) {

            /// Action Type for opening a shop
            var actionTypeOpenShop = 25;

            /**
             * Open Shop Action
             * @class
             */
            Actions.OpenShopAction = function()
            {
                GoNorth.DefaultNodeShapes.Actions.BaseAction.apply(this);
            };

            Actions.OpenShopAction.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.Actions.BaseAction.prototype);

            /**
             * Returns the HTML Content of the action
             * 
             * @returns {string} HTML Content of the action
             */
            Actions.OpenShopAction.prototype.getContent = function() {
                return  "<div class='gn-nodeActionText'>" + Tale.Localization.Actions.WillOpenAShopForTheCurrentNpc + "</div>";
            };

            /**
             * Gets called once the action was intialized
             * 
             * @param {object} contentElement Content element
             * @param {ActionNode} actionNode Parent Action node
             */
            Actions.OpenShopAction.prototype.onInitialized = function(contentElement, actionNode) {
                this.contentElement = contentElement;
            };
            
            /**
             * Builds the action
             * 
             * @returns {object} Action
             */
            Actions.OpenShopAction.prototype.buildAction = function() {
                return new Actions.OpenShopAction();
            };

            /**
             * Returns the type of the action
             * 
             * @returns {number} Type of the action
             */
            Actions.OpenShopAction.prototype.getType = function() {
                return actionTypeOpenShop;
            };

            /**
             * Returns the label of the action
             * 
             * @returns {string} Label of the action
             */
            Actions.OpenShopAction.prototype.getLabel = function() {
                return Tale.Localization.Actions.OpenShopLabel;
            };

            GoNorth.DefaultNodeShapes.Shapes.addAvailableAction(new Actions.OpenShopAction());

        }(Tale.Actions = Tale.Actions || {}));
    }(GoNorth.Tale = GoNorth.Tale || {}));
}(window.GoNorth = window.GoNorth || {}));