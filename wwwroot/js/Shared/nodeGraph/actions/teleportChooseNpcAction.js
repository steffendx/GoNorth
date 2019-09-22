(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Actions) {

            /// Action Type for teleporting an npc which is choosen
            var actionTypeTeleportChoseNpc = 41;

            /**
             * Teleport choose npc Action
             * @class
             */
            Actions.TeleportChooseNpcAction = function()
            {
                GoNorth.DefaultNodeShapes.Actions.MoveChooseObjectAction.apply(this);
            };

            Actions.TeleportChooseNpcAction.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.Actions.MoveChooseObjectAction.prototype);

            /**
             * Builds the action
             * 
             * @returns {object} Action
             */
            Actions.TeleportChooseNpcAction.prototype.buildAction = function() {
                return new Actions.TeleportChooseNpcAction();
            };

            /**
             * Returns the type of the action
             * 
             * @returns {number} Type of the action
             */
            Actions.TeleportChooseNpcAction.prototype.getType = function() {
                return actionTypeTeleportChoseNpc;
            };

            /**
             * Returns the label of the action
             * 
             * @returns {string} Label of the action
             */
            Actions.TeleportChooseNpcAction.prototype.getLabel = function() {
                return DefaultNodeShapes.Localization.Actions.TeleportChooseNpcLabel;
            };
        

            /**
             * Opens the choose object dialog
             * 
             * @returns {jQuery.Deferred} Deferred that will be resolved with the choosen object
             */
            Actions.TeleportChooseNpcAction.prototype.openChooseObjectDialog = function() {
                return GoNorth.DefaultNodeShapes.openNpcSearchDialog();
            };

            /**
             * Returns the choose label
             * 
             * @returns {string} Label for choosing
             */
            Actions.TeleportChooseNpcAction.prototype.getChooseObjectLabel = function() {
                return DefaultNodeShapes.Localization.Actions.ChooseNpcLabel;
            };

            /**
             * Returns the selections seperator label
             * 
             * @returns {string} Label for seperation
             */
            Actions.TeleportChooseNpcAction.prototype.getSelectionSeperatorLabel = function() {
                return DefaultNodeShapes.Localization.Actions.TeleportTo;
            };

            /**
             * Returns the choose label
             * 
             * @returns {string} Label for choosing
             */
            Actions.TeleportChooseNpcAction.prototype.getOpenObjectTooltip = function() {
                return DefaultNodeShapes.Localization.Actions.OpenNpcTooltip;
            };

            /**
             * Opens the object
             * 
             * @param {string} id Id of the object
             */
            Actions.TeleportChooseNpcAction.prototype.openObject = function(id) {
                window.open("/Kortisto/Npc?id=" + id)
            }

            /**
             * Returns the related object type of the choosen object
             * 
             * @returns {string} Related object type of the choosen object
             */
            Actions.TeleportChooseNpcAction.prototype.getRelatedToObjectType = function() {
                return Actions.RelatedToObjectNpc;
            };

            /**
             * Returns the loading object resource type
             * 
             * @returns {number} Loading objcet resource type
             */
            Actions.TeleportChooseNpcAction.prototype.getObjectResourceType = function() {
                return GoNorth.DefaultNodeShapes.Shapes.ObjectResourceNpc;
            };

            /**
             * Loads the choosen object
             * 
             * @returns {number} Loading objcet resource type
             * @param {string} npcId Npc Id
             * @returns {jQuery.Deferred} Deferred for the objcet loading
             */
            Actions.TeleportChooseNpcAction.prototype.loadChoosenObject = function(npcId) {
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

            GoNorth.DefaultNodeShapes.Shapes.addAvailableAction(new Actions.TeleportChooseNpcAction());

        }(DefaultNodeShapes.Actions = DefaultNodeShapes.Actions || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));