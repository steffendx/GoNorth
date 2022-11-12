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
                var id = (new Date()).getTime();
                return  "<div class='gn-nodeActionText'>" + Tale.Localization.Actions.PersistDialogStateWillContinueOnThisPointNextTalk + "</div>" +
                        "<input class='gn-nodeActionCancelDialog' type='checkbox' id='" + id + "'/>" +
                        "<label for='" + id + "'>" + Tale.Localization.Actions.PersistDialogStateEndDialog + "</label>";
            };

            /**
             * Gets called once the action was intialized
             * 
             * @param {object} contentElement Content element
             * @param {ActionNode} actionNode Parent Action node
             */
            Actions.PersistDialogStateAction.prototype.onInitialized = function(contentElement, actionNode) {
                this.contentElement = contentElement;

                // Deserialize
                this.deserializeData();
                
                // Handlers
                var self = this;
                var cancelDialog = contentElement.find(".gn-nodeActionCancelDialog");
                cancelDialog.on("change", function(e) {
                    self.saveData();
                });
            };
            

            /**
             * Deserializes the data
             */
            Actions.PersistDialogStateAction.prototype.deserializeData = function() {
                var actionData = this.nodeModel.get("actionData");
                if(!actionData)
                {
                    return "";
                }

                var data = JSON.parse(actionData);
                
                this.contentElement.find(".gn-nodeActionCancelDialog").prop("checked", data.endDialog);
            }
            
            /**
             * Saves the data
             */
            Actions.PersistDialogStateAction.prototype.saveData = function() {
                var endDialog = this.contentElement.find(".gn-nodeActionCancelDialog").is(":checked");
                var serializeData = {
                    endDialog: endDialog
                };

                this.nodeModel.set("actionData", JSON.stringify(serializeData));
            }

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