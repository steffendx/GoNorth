(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Actions) {

            /// Action Type for spawning an npc at a marker
            var actionTypeSpawnNpcAtMarker = 48;

            /**
             * Spawn npc at marker Action
             * @class
             */
            Actions.SpawnNpcAtMarkerAction = function()
            {
                GoNorth.DefaultNodeShapes.Actions.SpawnChooseObjectAction.apply(this);
            };

            Actions.SpawnNpcAtMarkerAction.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.Actions.SpawnChooseObjectAction.prototype);

            /**
             * Builds the action
             * 
             * @returns {object} Action
             */
            Actions.SpawnNpcAtMarkerAction.prototype.buildAction = function() {
                return new Actions.SpawnNpcAtMarkerAction();
            };

            /**
             * Returns the type of the action
             * 
             * @returns {number} Type of the action
             */
            Actions.SpawnNpcAtMarkerAction.prototype.getType = function() {
                return actionTypeSpawnNpcAtMarker;
            };

            /**
             * Returns the label of the action
             * 
             * @returns {string} Label of the action
             */
            Actions.SpawnNpcAtMarkerAction.prototype.getLabel = function() {
                return DefaultNodeShapes.Localization.Actions.SpawnNpcAtMarkerLabel;
            };
        

            /**
             * Opens the choose object dialog
             * 
             * @returns {jQuery.Deferred} Deferred that will be resolved with the choosen object
             */
            Actions.SpawnNpcAtMarkerAction.prototype.openChooseObjectDialog = function() {
                return GoNorth.DefaultNodeShapes.openNpcSearchDialog();
            };

            /**
             * Returns the choose label
             * 
             * @returns {string} Label for choosing
             */
            Actions.SpawnNpcAtMarkerAction.prototype.getChooseObjectLabel = function() {
                return DefaultNodeShapes.Localization.Actions.ChooseNpcLabel;
            };

            /**
             * Returns the selections seperator label
             * 
             * @returns {string} Label for seperation
             */
            Actions.SpawnNpcAtMarkerAction.prototype.getSelectionSeperatorLabel = function() {
                return DefaultNodeShapes.Localization.Actions.SpawnAt;
            };

            /**
             * Returns the choose label
             * 
             * @returns {string} Label for choosing
             */
            Actions.SpawnNpcAtMarkerAction.prototype.getOpenObjectTooltip = function() {
                return DefaultNodeShapes.Localization.Actions.OpenNpcTooltip;
            };

            /**
             * Opens the object
             * 
             * @param {string} id Id of the object
             */
            Actions.SpawnNpcAtMarkerAction.prototype.openObject = function(id) {
                window.open("/Kortisto/Npc?id=" + id)
            }

            /**
             * Returns the related object type of the choosen object
             * 
             * @returns {string} Related object type of the choosen object
             */
            Actions.SpawnNpcAtMarkerAction.prototype.getRelatedToObjectType = function() {
                return Actions.RelatedToObjectNpc;
            };

            /**
             * Returns the loading object resource type
             * 
             * @returns {number} Loading objcet resource type
             */
            Actions.SpawnNpcAtMarkerAction.prototype.getObjectResourceType = function() {
                return GoNorth.DefaultNodeShapes.Shapes.ObjectResourceNpc;
            };

            /**
             * Loads the choosen object
             * 
             * @returns {number} Loading objcet resource type
             * @param {string} npcId Npc Id
             * @returns {jQuery.Deferred} Deferred for the objcet loading
             */
            Actions.SpawnNpcAtMarkerAction.prototype.loadChoosenObject = function(npcId) {
                var def = new jQuery.Deferred();

                GoNorth.HttpClient.get("/api/KortistoApi/FlexFieldObject?id=" + npcId).done(function(data) {
                    def.resolve(data);
                }).fail(function(xhr) {
                    def.reject();
                });

                return def.promise();
            };

            GoNorth.DefaultNodeShapes.Shapes.addAvailableAction(new Actions.SpawnNpcAtMarkerAction());

        }(DefaultNodeShapes.Actions = DefaultNodeShapes.Actions || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));