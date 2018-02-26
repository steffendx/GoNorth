(function(GoNorth) {
    "use strict";
    (function(Aika) {
        (function(Actions) {

            /// Action Type for changing the current quest value
            var actionTypeChangeCurrentQuestValue = 7;

            /**
             * Change current quest value Action
             * @class
             */
            Actions.ChangeCurrentQuestValueAction = function()
            {
                GoNorth.DefaultNodeShapes.Actions.ChangeValueAction.apply(this);
            };

            Actions.ChangeCurrentQuestValueAction.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.Actions.ChangeValueAction.prototype);

            /**
             * Builds the action
             * 
             * @returns {object} Action
             */
            Actions.ChangeCurrentQuestValueAction.prototype.buildAction = function() {
                return new Actions.ChangeCurrentQuestValueAction();
            };

            /**
             * Returns the type of the action
             * 
             * @returns {number} Type of the action
             */
            Actions.ChangeCurrentQuestValueAction.prototype.getType = function() {
                return actionTypeChangeCurrentQuestValue;
            };

            /**
             * Returns the label of the action
             * 
             * @returns {string} Label of the action
             */
            Actions.ChangeCurrentQuestValueAction.prototype.getLabel = function() {
                return Aika.Localization.Actions.ChangeCurrentQuestValueLabel;
            };

            /**
             * Returns the object type name. Used for dependency objects
             * 
             * @returns {string} Object Type name used for depends on objects 
             */
            Actions.ChangeCurrentQuestValueAction.prototype.getObjectTypeName = function() {
                return Actions.RelatedToObjectQuest;
            };
            
            /**
             * Returns the object resource
             * 
             * @returns {int} Object Resource
             */
            Actions.ChangeCurrentQuestValueAction.prototype.getObjectId = function() {
                return Aika.getCurrentQuestId();
            };

            /**
             * Returns the object resource
             * 
             * @returns {int} Object Resource
             */
            Actions.ChangeCurrentQuestValueAction.prototype.getObjectResource = function() {
                return GoNorth.DefaultNodeShapes.Shapes.ObjectResourceQuest;
            };

            /**
             * Loads the quest
             * 
             * @returns {jQuery.Deferred} Deferred for the quest loading
             */
            Actions.ChangeCurrentQuestValueAction.prototype.loadObject = function() {
                var def = new jQuery.Deferred();

                var self = this;
                jQuery.ajax({ 
                    url: "/api/AikaApi/GetQuest?id=" + Aika.getCurrentQuestId(), 
                    type: "GET"
                }).done(function(data) {
                    def.resolve(data);
                }).fail(function(xhr) {
                    def.reject();
                });

                return def.promise();
            };

            GoNorth.DefaultNodeShapes.Shapes.addAvailableAction(new Actions.ChangeCurrentQuestValueAction());

        }(Aika.Actions = Aika.Actions || {}));
    }(GoNorth.Aika = GoNorth.Aika || {}));
}(window.GoNorth = window.GoNorth || {}));