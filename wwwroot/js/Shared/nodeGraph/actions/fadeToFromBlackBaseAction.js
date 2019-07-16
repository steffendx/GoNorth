(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Actions) {

            /**
             * Fade to/from black base action
             * @class
             */
            Actions.FadeToFromBlackBaseAction = function()
            {
                GoNorth.DefaultNodeShapes.Actions.BaseAction.apply(this);
            };

            Actions.FadeToFromBlackBaseAction.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.Actions.BaseAction.prototype);

            /**
             * Returns the HTML Content of the action
             * 
             * @returns {string} HTML Content of the action
             */
            Actions.FadeToFromBlackBaseAction.prototype.getContent = function() {
                return  "<input type='text' class='gn-nodeActionFadeTime' placeholder='" + DefaultNodeShapes.Localization.Actions.FadeTimePlaceholder + "' />";
            };

            /**
             * Gets called once the action was intialized
             * 
             * @param {object} contentElement Content element
             * @param {ActionNode} actionNode Parent Action node
             */
            Actions.FadeToFromBlackBaseAction.prototype.onInitialized = function(contentElement, actionNode) {
                this.contentElement = contentElement;

                // Deserialize
                this.deserializeData();

                // Handlers
                var self = this;
                var fadeTime = contentElement.find(".gn-nodeActionFadeTime");
                fadeTime.keydown(function(e) {
                    GoNorth.Util.validateNumberKeyPress(fadeTime, e);
                });

                fadeTime.change(function(e) {
                    self.ensureNumberValue();
                    self.saveData();
                });
            };

            /**
             * Ensures a number value was entered for the fade time
             */
            Actions.FadeToFromBlackBaseAction.prototype.ensureNumberValue = function() {
                var parsedValue = parseInt(this.contentElement.find(".gn-nodeActionFadeTime").val());
                if(isNaN(parsedValue))
                {
                    this.contentElement.find(".gn-nodeActionFadeTime").val("");
                }
            };

            /**
             * Deserializes the data
             */
            Actions.FadeToFromBlackBaseAction.prototype.deserializeData = function() {
                var actionData = this.nodeModel.get("actionData");
                if(!actionData)
                {
                    return "";
                }

                var data = JSON.parse(actionData);
                
                this.contentElement.find(".gn-nodeActionFadeTime").val(data.fadeTime);
            }

            /**
             * Saves the data
             */
            Actions.FadeToFromBlackBaseAction.prototype.saveData = function() {
                var fadeTime = parseInt(this.contentElement.find(".gn-nodeActionFadeTime").val());
                if(isNaN(fadeTime))
                {
                    fadeTime = 0;
                }

                var serializeData = {
                    fadeTime: fadeTime
                };

                this.nodeModel.set("actionData", JSON.stringify(serializeData));
            }

        }(DefaultNodeShapes.Actions = DefaultNodeShapes.Actions || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));