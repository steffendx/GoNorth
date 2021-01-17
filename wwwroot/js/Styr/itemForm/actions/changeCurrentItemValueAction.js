(function(GoNorth) {
    "use strict";
    (function(Styr) {
        (function(Actions) {

            /// Action Type for changing the current item value
            var actionTypeChangeCurrentItemValue = 50;

            /**
             * Change current item value Action
             * @class
             */
            Actions.ChangeCurrentItemValueAction = function()
            {
                GoNorth.DefaultNodeShapes.Actions.ChangeValueAction.apply(this);
            };

            Actions.ChangeCurrentItemValueAction.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.Actions.ChangeValueAction.prototype);

            /**
             * Builds the action
             * 
             * @returns {object} Action
             */
            Actions.ChangeCurrentItemValueAction.prototype.buildAction = function() {
                return new Actions.ChangeCurrentItemValueAction();
            };

            /**
             * Returns the type of the action
             * 
             * @returns {number} Type of the action
             */
            Actions.ChangeCurrentItemValueAction.prototype.getType = function() {
                return actionTypeChangeCurrentItemValue;
            };

            /**
             * Returns the label of the action
             * 
             * @returns {string} Label of the action
             */
            Actions.ChangeCurrentItemValueAction.prototype.getLabel = function() {
                return Styr.Localization.Actions.ChangeCurrentItemValueLabel;
            };

            /**
             * Returns the object type name. Used for dependency objects
             * 
             * @returns {string} Object Type name used for depends on objects 
             */
            Actions.ChangeCurrentItemValueAction.prototype.getObjectTypeName = function() {
                return Actions.RelatedToObjectItem;
            };
            
            /**
             * Returns the object resource
             * 
             * @returns {int} Object Resource
             */
            Actions.ChangeCurrentItemValueAction.prototype.getObjectId = function() {
                return Styr.getCurrentItemId();
            };

            /**
             * Returns the object resource
             * 
             * @returns {int} Object Resource
             */
            Actions.ChangeCurrentItemValueAction.prototype.getObjectResource = function() {
                return GoNorth.DefaultNodeShapes.Shapes.ObjectResourceItem;
            };

            /**
             * Loads the item
             * 
             * @returns {jQuery.Deferred} Deferred for the item loading
             */
            Actions.ChangeCurrentItemValueAction.prototype.loadObject = function() {
                var def = new jQuery.Deferred();

                GoNorth.HttpClient.get("/api/StyrApi/FlexFieldObject?id=" + Styr.getCurrentItemId()).done(function(data) {
                    def.resolve(data);
                }).fail(function(xhr) {
                    def.reject();
                });

                return def.promise();
            };

            GoNorth.DefaultNodeShapes.Shapes.addAvailableAction(new Actions.ChangeCurrentItemValueAction());

        }(Styr.Actions = Styr.Actions || {}));
    }(GoNorth.Styr = GoNorth.Styr || {}));
}(window.GoNorth = window.GoNorth || {}));