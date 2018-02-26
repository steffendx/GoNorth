(function(GoNorth) {
    "use strict";
    (function(Tale) {
        (function(Actions) {

            /// Action Type for changing the npc value
            var actionTypeChangeNpcValue = 2;

            /**
             * Change npc value Action
             * @class
             */
            Actions.ChangeNpcValueAction = function()
            {
                GoNorth.DefaultNodeShapes.Actions.ChangeValueAction.apply(this);
            };

            Actions.ChangeNpcValueAction.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.Actions.ChangeValueAction.prototype);

            /**
             * Builds the action
             * 
             * @returns {object} Action
             */
            Actions.ChangeNpcValueAction.prototype.buildAction = function() {
                return new Actions.ChangeNpcValueAction();
            };

            /**
             * Returns the type of the action
             * 
             * @returns {number} Type of the action
             */
            Actions.ChangeNpcValueAction.prototype.getType = function() {
                return actionTypeChangeNpcValue;
            };

            /**
             * Returns the label of the action
             * 
             * @returns {string} Label of the action
             */
            Actions.ChangeNpcValueAction.prototype.getLabel = function() {
                return Tale.Localization.Actions.ChangeNpcValueLabel;
            };

            /**
             * Returns the object type name. Used for dependency objects
             * 
             * @returns {string} Object Type name used for depends on objects 
             */
            Actions.ChangeNpcValueAction.prototype.getObjectTypeName = function() {
                return Actions.RelatedToObjectNpc;
            };

            /**
             * Returns the object resource
             * 
             * @returns {int} Object Resource
             */
            Actions.ChangeNpcValueAction.prototype.getObjectId = function() {
                return Tale.getCurrentRelatedObjectId();
            };

            /**
             * Returns the object resource
             * 
             * @returns {int} Object Resource
             */
            Actions.ChangeNpcValueAction.prototype.getObjectResource = function() {
                return GoNorth.DefaultNodeShapes.Shapes.ObjectResourceNpc;
            };

            /**
             * Loads the npc
             * 
             * @returns {jQuery.Deferred} Deferred for the npc loading
             */
            Actions.ChangeNpcValueAction.prototype.loadObject = function() {
                var def = new jQuery.Deferred();

                var self = this;
                jQuery.ajax({ 
                    url: "/api/KortistoApi/FlexFieldObject?id=" + Tale.getCurrentRelatedObjectId(), 
                    type: "GET"
                }).done(function(data) {
                    def.resolve(data);
                }).fail(function(xhr) {
                    def.reject();
                });

                return def.promise();
            };

            GoNorth.DefaultNodeShapes.Shapes.addAvailableAction(new Actions.ChangeNpcValueAction());

        }(Tale.Actions = Tale.Actions || {}));
    }(GoNorth.Tale = GoNorth.Tale || {}));
}(window.GoNorth = window.GoNorth || {}));