(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Actions) {

            /// Action Type for spawning an item at a marker
            var actionTypeSpawnItemAtMarker = 49;

            /**
             * Spawn item at marker Action
             * @class
             */
            Actions.SpawnItemAtMarkerAction = function()
            {
                GoNorth.DefaultNodeShapes.Actions.SpawnChooseObjectAction.apply(this);
            };

            Actions.SpawnItemAtMarkerAction.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.Actions.SpawnChooseObjectAction.prototype);

            /**
             * Builds the action
             * 
             * @returns {object} Action
             */
            Actions.SpawnItemAtMarkerAction.prototype.buildAction = function() {
                return new Actions.SpawnItemAtMarkerAction();
            };

            /**
             * Returns the type of the action
             * 
             * @returns {number} Type of the action
             */
            Actions.SpawnItemAtMarkerAction.prototype.getType = function() {
                return actionTypeSpawnItemAtMarker;
            };

            /**
             * Returns the label of the action
             * 
             * @returns {string} Label of the action
             */
            Actions.SpawnItemAtMarkerAction.prototype.getLabel = function() {
                return DefaultNodeShapes.Localization.Actions.SpawnItemAtMarkerLabel;
            };
        

            /**
             * Opens the choose object dialog
             * 
             * @returns {jQuery.Deferred} Deferred that will be resolved with the choosen object
             */
            Actions.SpawnItemAtMarkerAction.prototype.openChooseObjectDialog = function() {
                return GoNorth.DefaultNodeShapes.openItemSearchDialog();
            };

            /**
             * Returns the choose label
             * 
             * @returns {string} Label for choosing
             */
            Actions.SpawnItemAtMarkerAction.prototype.getChooseObjectLabel = function() {
                return DefaultNodeShapes.Localization.Actions.ChooseItemLabel;
            };

            /**
             * Returns the selections seperator label
             * 
             * @returns {string} Label for seperation
             */
            Actions.SpawnItemAtMarkerAction.prototype.getSelectionSeperatorLabel = function() {
                return DefaultNodeShapes.Localization.Actions.SpawnAt;
            };

            /**
             * Returns the choose label
             * 
             * @returns {string} Label for choosing
             */
            Actions.SpawnItemAtMarkerAction.prototype.getOpenObjectTooltip = function() {
                return DefaultNodeShapes.Localization.Actions.OpenItemTooltip;
            };

            /**
             * Opens the object
             * 
             * @param {string} id Id of the object
             */
            Actions.SpawnItemAtMarkerAction.prototype.openObject = function(id) {
                window.open("/Styr/Item?id=" + id)
            }

            /**
             * Returns the related object type of the choosen object
             * 
             * @returns {string} Related object type of the choosen object
             */
            Actions.SpawnItemAtMarkerAction.prototype.getRelatedToObjectType = function() {
                return Actions.RelatedToObjectItem;
            };

            /**
             * Returns the loading object resource type
             * 
             * @returns {number} Loading objcet resource type
             */
            Actions.SpawnItemAtMarkerAction.prototype.getObjectResourceType = function() {
                return GoNorth.DefaultNodeShapes.Shapes.ObjectResourceItem;
            };

            /**
             * Loads the choosen object
             * 
             * @returns {number} Loading objcet resource type
             * @param {string} itemId Item Id
             * @returns {jQuery.Deferred} Deferred for the objcet loading
             */
            Actions.SpawnItemAtMarkerAction.prototype.loadChoosenObject = function(itemId) {
                var def = new jQuery.Deferred();

                GoNorth.HttpClient.get("/api/StyrApi/FlexFieldObject?id=" + itemId).done(function(data) {
                    def.resolve(data);
                }).fail(function(xhr) {
                    def.reject();
                });

                return def.promise();
            };

            GoNorth.DefaultNodeShapes.Shapes.addAvailableAction(new Actions.SpawnItemAtMarkerAction());

        }(DefaultNodeShapes.Actions = DefaultNodeShapes.Actions || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));