(function(GoNorth) {
    "use strict";
    (function(Aika) {
        (function(Actions) {

            /// Action Type for checking if a quest state is changed in an npc dialog
            var actionTypeChangeQuestStateInNpcDialogAction = 11;

            /**
             * Change quest state in npc dialog action
             * @class
             */
            Actions.ChangeQuestStateInNpcDialogAction = function()
            {
                Actions.ChangeQuestInNpcDialogBaseAction.apply(this);
            };

            Actions.ChangeQuestStateInNpcDialogAction.prototype = jQuery.extend({ }, Actions.ChangeQuestInNpcDialogBaseAction.prototype);

            /**
             * Returns additional HTML Content of the action
             * 
             * @returns {string} Additional HTML Content of the action
             */
            Actions.ChangeQuestStateInNpcDialogAction.prototype.getAdditionalContent = function() {
                return "<div class='gn-nodeActionText'>" + GoNorth.DefaultNodeShapes.Localization.Actions.QuestState + "</div>" +
                       "<select class='gn-nodeActionQuestState'></select>";;
            };

            /**
             * Intializes additional values
             * 
             * @param {object} contentElement Content element
             * @param {ActionNode} actionNode Parent Action node
             */
            Actions.ChangeQuestStateInNpcDialogAction.prototype.initializeAdditional = function(contentElement, actionNode) {
                var questStateSelect = contentElement.find(".gn-nodeActionQuestState");
                GoNorth.Util.fillSelectFromArray(questStateSelect, GoNorth.DefaultNodeShapes.Shapes.getQuestStates(), function(questState) { return questState.questState; }, function(questState) { return questState.label; });
            
                var self = this;
                questStateSelect.change(function() {
                    self.saveData();
                    
                    self.validateDialogNodeExistsWithLoadingIndicator(actionNode);
                });
            };

            /**
             * Deserializes additional data
             * 
             * @param {object} data Deserialized data
             */
            Actions.ChangeQuestStateInNpcDialogAction.prototype.deserializeAdditionalData = function(data) {
                this.contentElement.find(".gn-nodeActionQuestState").find("option[value='" + data.questState + "']").prop("selected", true);
            };

            /**
             * Saves additional data
             * 
             * @param {object} serializeData Already serialized data
             */
            Actions.ChangeQuestStateInNpcDialogAction.prototype.saveAdditionalData = function(serializeData) {
                serializeData.questState = this.contentElement.find(".gn-nodeActionQuestState").val();
            };

            /**
             * Validates if a node is valid and fullfiles the search criterias
             * 
             * @param {object} actionNode Action node to validate
             * @returns {bool} true if the node is valid, else false
             */
            Actions.ChangeQuestStateInNpcDialogAction.prototype.isActionNodeValid = function(actionNode) {
                if(actionNode.actionType != GoNorth.DefaultNodeShapes.Actions.actionTypeChangeQuestState || !actionNode.actionData) {
                    return false;
                }

                var questStateToSearch = this.contentElement.find(".gn-nodeActionQuestState").val()

                var data = JSON.parse(actionNode.actionData);
                if(data.questState == questStateToSearch && data.questId == Aika.getCurrentQuestId())
                {
                    return true;
                }

                return false;
            };

            /**
             * Builds the action
             * 
             * @returns {object} Action
             */
            Actions.ChangeQuestStateInNpcDialogAction.prototype.buildAction = function() {
                return new Actions.ChangeQuestStateInNpcDialogAction();
            };

            /**
             * Returns the type of the action
             * 
             * @returns {number} Type of the action
             */
            Actions.ChangeQuestStateInNpcDialogAction.prototype.getType = function() {
                return actionTypeChangeQuestStateInNpcDialogAction;
            };

            /**
             * Returns the label of the action
             * 
             * @returns {string} Label of the action
             */
            Actions.ChangeQuestStateInNpcDialogAction.prototype.getLabel = function() {
                return Aika.Localization.Actions.ChangeQuestStateInNpcDialogActionLabel;
            };

            /**
             * Returns the text which is displayed if the validation failed
             * 
             * @returns {string} Text which is displayed if the validation fails
             */
            Actions.ChangeQuestStateInNpcDialogAction.prototype.getValidationFailedText = function() {
                return Aika.Localization.Actions.ChangeQuestStateDialogValidationFailed;
            };
            

            GoNorth.DefaultNodeShapes.Shapes.addAvailableAction(new Actions.ChangeQuestStateInNpcDialogAction());

        }(Aika.Actions = Aika.Actions || {}));
    }(GoNorth.Aika = GoNorth.Aika || {}));
}(window.GoNorth = window.GoNorth || {}));