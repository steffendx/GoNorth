(function(GoNorth) {
    "use strict";
    (function(Aika) {
        (function(Actions) {

            /// Action Type for checking if a quest text is changed in an npc dialog
            var actionTypeChangeQuestTextInNpcDialogAction = 12;

            /**
             * Change quest text in npc dialog action
             * @class
             */
            Actions.ChangeQuestTextInNpcDialogAction = function()
            {
                Actions.ChangeQuestInNpcDialogBaseAction.apply(this);
            };

            Actions.ChangeQuestTextInNpcDialogAction.prototype = jQuery.extend({ }, Actions.ChangeQuestInNpcDialogBaseAction.prototype);

            /**
             * Validates if a node is valid and fullfiles the search criterias
             * 
             * @param {object} actionNode Action node to validate
             * @returns {bool} true if the node is valid, else false
             */
            Actions.ChangeQuestTextInNpcDialogAction.prototype.isActionNodeValid = function(actionNode) {
                if(actionNode.actionType != GoNorth.DefaultNodeShapes.Actions.actionTypeAddQuestToText || !actionNode.actionData) {
                    return false;
                }

                var data = JSON.parse(actionNode.actionData);
                if(data.questId == Aika.getCurrentQuestId())
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
            Actions.ChangeQuestTextInNpcDialogAction.prototype.buildAction = function() {
                return new Actions.ChangeQuestTextInNpcDialogAction();
            };

            /**
             * Returns the type of the action
             * 
             * @returns {number} Type of the action
             */
            Actions.ChangeQuestTextInNpcDialogAction.prototype.getType = function() {
                return actionTypeChangeQuestTextInNpcDialogAction;
            };

            /**
             * Returns the label of the action
             * 
             * @returns {string} Label of the action
             */
            Actions.ChangeQuestTextInNpcDialogAction.prototype.getLabel = function() {
                return Aika.Localization.Actions.ChangeQuestTextInNpcDialogActionLabel;
            };

            /**
             * Returns the text which is displayed if the validation failed
             * 
             * @returns {string} Text which is displayed if the validation fails
             */
            Actions.ChangeQuestTextInNpcDialogAction.prototype.getValidationFailedText = function() {
                return Aika.Localization.Actions.ChangeQuestTextDialogValidationFailed;
            };
            

            GoNorth.DefaultNodeShapes.Shapes.addAvailableAction(new Actions.ChangeQuestTextInNpcDialogAction());

        }(Aika.Actions = Aika.Actions || {}));
    }(GoNorth.Aika = GoNorth.Aika || {}));
}(window.GoNorth = window.GoNorth || {}));