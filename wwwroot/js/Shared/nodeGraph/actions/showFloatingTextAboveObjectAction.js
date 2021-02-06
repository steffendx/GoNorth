(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Actions) {

            /**
             * Show floating text above an object action
             * @class
             */
            Actions.ShowFloatingTextAboveObjectAction = function()
            {
                GoNorth.DefaultNodeShapes.Actions.BaseAction.apply(this);
            };

            Actions.ShowFloatingTextAboveObjectAction.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.Actions.BaseAction.prototype);

            /**
             * Returns the HTML Content of the action
             * 
             * @returns {string} HTML Content of the action
             */
            Actions.ShowFloatingTextAboveObjectAction.prototype.getContent = function() {
                return "<div class='gn-nodeActionText'>" + DefaultNodeShapes.Localization.Actions.FloatingText + "</div>" +
                       "<textarea class='gn-nodeActionFloatingText'></textarea>";
            };

            /**
             * Gets called once the action was intialized
             * 
             * @param {object} contentElement Content element
             * @param {ActionNode} actionNode Parent Action node
             */
            Actions.ShowFloatingTextAboveObjectAction.prototype.onInitialized = function(contentElement, actionNode) {
                this.contentElement = contentElement;

                // Deserialize
                this.deserializeData();

                // Handlers
                var self = this;
                var floatingText = contentElement.find(".gn-nodeActionFloatingText");
                floatingText.change(function(e) {
                    self.saveData();
                });
            };

            /**
             * Deserializes the data
             */
            Actions.ShowFloatingTextAboveObjectAction.prototype.deserializeData = function() {
                var actionData = this.nodeModel.get("actionData");
                if(!actionData)
                {
                    return "";
                }

                var data = JSON.parse(actionData);
                
                this.contentElement.find(".gn-nodeActionFloatingText").val(data.floatingText);
            }

            /**
             * Saves the data
             */
            Actions.ShowFloatingTextAboveObjectAction.prototype.saveData = function() {
                var floatingText = this.contentElement.find(".gn-nodeActionFloatingText").val();
                var serializeData = {
                    floatingText: floatingText
                };

                this.nodeModel.set("actionData", JSON.stringify(serializeData));
            }
            
            /**
             * Returns statistics for the action
             * @param {object} parsedActionData Parsed action data
             * @returns Node statistics
             */
            Actions.ShowFloatingTextAboveObjectAction.prototype.getStatistics = function(parsedActionData) {
                return {
                    wordCount: GoNorth.Util.getWordCount(parsedActionData.floatingText)
                };
            };

        }(DefaultNodeShapes.Actions = DefaultNodeShapes.Actions || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));