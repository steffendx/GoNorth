(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Actions) {

            /// Action Type for teleporting an npc to an npc which is choosen
            var actionTypeTeleportChoseNpcToNpc = 45;

            /**
             * Teleport choose npc Action
             * @class
             */
            Actions.TeleportChooseNpcToNpcAction = function()
            {
                GoNorth.DefaultNodeShapes.Actions.MoveChooseObjectToNpcAction.apply(this);
            };

            Actions.TeleportChooseNpcToNpcAction.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.Actions.MoveChooseObjectToNpcAction.prototype);

            /**
             * Builds the action
             * 
             * @returns {object} Action
             */
            Actions.TeleportChooseNpcToNpcAction.prototype.buildAction = function() {
                return new Actions.TeleportChooseNpcToNpcAction();
            };

            /**
             * Returns the type of the action
             * 
             * @returns {number} Type of the action
             */
            Actions.TeleportChooseNpcToNpcAction.prototype.getType = function() {
                return actionTypeTeleportChoseNpcToNpc;
            };

            /**
             * Returns the label of the action
             * 
             * @returns {string} Label of the action
             */
            Actions.TeleportChooseNpcToNpcAction.prototype.getLabel = function() {
                return DefaultNodeShapes.Localization.Actions.TeleportChooseNpcToNpcLabel;
            };
        

            /**
             * Opens teh choose object dialog
             * 
             * @returns {jQuery.Deferred} Deferred that will be resolved with the choosen object
             */
            Actions.TeleportChooseNpcToNpcAction.prototype.openChooseObjectDialog = function() {
                return GoNorth.DefaultNodeShapes.openNpcSearchDialog();
            };

            /**
             * Returns the choose label
             * 
             * @returns {string} Label for choosing
             */
            Actions.TeleportChooseNpcToNpcAction.prototype.getChooseObjectLabel = function() {
                return DefaultNodeShapes.Localization.Actions.ChooseNpcLabel;
            };

            /**
             * Returns the selections seperator label
             * 
             * @returns {string} Label for seperation
             */
            Actions.TeleportChooseNpcToNpcAction.prototype.getSelectionSeperatorLabel = function() {
                return DefaultNodeShapes.Localization.Actions.TeleportToNpc;
            };

            /**
             * Returns the choose label
             * 
             * @returns {string} Label for choosing
             */
            Actions.TeleportChooseNpcToNpcAction.prototype.getOpenObjectTooltip = function() {
                return DefaultNodeShapes.Localization.Actions.OpenNpcTooltip;
            };

            /**
             * Opens the object
             * 
             * @param {string} id Id of the object
             */
            Actions.TeleportChooseNpcToNpcAction.prototype.openObject = function(id) {
                window.open("/Kortisto/Npc?id=" + id)
            }

            /**
             * Returns the related object type of the choosen object
             * 
             * @returns {string} Related object type of the choosen object
             */
            Actions.TeleportChooseNpcToNpcAction.prototype.getRelatedToObjectType = function() {
                return Actions.RelatedToObjectNpc;
            };

            /**
             * Returns the loading object resource type
             * 
             * @returns {number} Loading objcet resource type
             */
            Actions.TeleportChooseNpcToNpcAction.prototype.getObjectResourceType = function() {
                return GoNorth.DefaultNodeShapes.Shapes.ObjectResourceNpc;
            };

            /**
             * Loads the choosen object
             * 
             * @returns {number} Loading objcet resource type
             * @param {string} npcId Npc Id
             * @returns {jQuery.Deferred} Deferred for the objcet loading
             */
            Actions.TeleportChooseNpcToNpcAction.prototype.loadChoosenObject = function(npcId) {
                var def = new jQuery.Deferred();

                jQuery.ajax({ 
                    url: "/api/KortistoApi/FlexFieldObject?id=" + npcId, 
                    type: "GET"
                }).done(function(data) {
                    def.resolve(data);
                }).fail(function(xhr) {
                    def.reject();
                });

                return def.promise();
            };

            GoNorth.DefaultNodeShapes.Shapes.addAvailableAction(new Actions.TeleportChooseNpcToNpcAction());

        }(DefaultNodeShapes.Actions = DefaultNodeShapes.Actions || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));