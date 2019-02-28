(function(GoNorth) {
    "use strict";
    (function(Tale) {
        (function(Actions) {

            /**
             * Play animation Action
             * @class
             */
            Actions.PlayAnimationAction = function()
            {
                GoNorth.DefaultNodeShapes.Actions.BaseAction.apply(this);
            };

            Actions.PlayAnimationAction.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.Actions.BaseAction.prototype);

            /**
             * Returns the HTML Content of the action
             * 
             * @returns {string} HTML Content of the action
             */
            Actions.PlayAnimationAction.prototype.getContent = function() {
                return  "<input type='text' class='gn-nodeActionPlayAnimation' placeholder='" + Tale.Localization.Actions.AnimationPlaceholder + "' list='gn-" + Tale.ConfigKeys.PlayAnimationAction + "'/>";
            };

            /**
             * Gets called once the action was intialized
             * 
             * @param {object} contentElement Content element
             * @param {ActionNode} actionNode Parent Action node
             */
            Actions.PlayAnimationAction.prototype.onInitialized = function(contentElement, actionNode) {
                this.contentElement = contentElement;

                // Deserialize
                this.deserializeData();

                // Handlers
                var self = this;
                var animationName = contentElement.find(".gn-nodeActionPlayAnimation");
                animationName.change(function(e) {
                    self.saveData();
                });
            };

            /**
             * Deserializes the data
             */
            Actions.PlayAnimationAction.prototype.deserializeData = function() {
                var actionData = this.nodeModel.get("actionData");
                if(!actionData)
                {
                    return "";
                }

                var data = JSON.parse(actionData);
                
                this.contentElement.find(".gn-nodeActionPlayAnimation").val(data.animationName);
            }

            /**
             * Saves the data
             */
            Actions.PlayAnimationAction.prototype.saveData = function() {
                var animationName = this.contentElement.find(".gn-nodeActionPlayAnimation").val();
                var serializeData = {
                    animationName: animationName
                };

                this.nodeModel.set("actionData", JSON.stringify(serializeData));
            }

            /**
             * Builds the action
             * 
             * @returns {object} Action
             */
            Actions.PlayAnimationAction.prototype.buildAction = function() {
                return new Actions.PlayAnimationAction();
            };

            /**
             * Returns the type of the action
             * 
             * @returns {number} Type of the action
             */
            Actions.PlayAnimationAction.prototype.getType = function() {
                return -1;
            };

            /**
             * Returns the label of the action
             * 
             * @returns {string} Label of the action
             */
            Actions.PlayAnimationAction.prototype.getLabel = function() {
                return "";
            };

            /**
             * Returns the config key for the action
             * 
             * @returns {string} Config key
             */
            Actions.PlayAnimationAction.prototype.getConfigKey = function() {
                return Tale.ConfigKeys.PlayAnimationAction;
            }

        }(Tale.Actions = Tale.Actions || {}));
    }(GoNorth.Tale = GoNorth.Tale || {}));
}(window.GoNorth = window.GoNorth || {}));