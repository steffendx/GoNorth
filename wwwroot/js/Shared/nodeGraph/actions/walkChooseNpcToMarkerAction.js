(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Actions) {

            /// Action Type for walking an npc which is choosen
            var actionTypeWalkChoseNpc = 43;

            /**
             * Walk choose npc to marker Action
             * @class
             */
            Actions.WalkChooseNpcToMarkerAction = function()
            {
                GoNorth.DefaultNodeShapes.Actions.MoveChooseObjectAction.apply(this);
            };

            Actions.WalkChooseNpcToMarkerAction.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.Actions.MoveChooseObjectAction.prototype);

            /**
             * Builds the action
             * 
             * @returns {object} Action
             */
            Actions.WalkChooseNpcToMarkerAction.prototype.buildAction = function() {
                return new Actions.WalkChooseNpcToMarkerAction();
            };

            /**
             * Returns the type of the action
             * 
             * @returns {number} Type of the action
             */
            Actions.WalkChooseNpcToMarkerAction.prototype.getType = function() {
                return actionTypeWalkChoseNpc;
            };

            /**
             * Returns the label of the action
             * 
             * @returns {string} Label of the action
             */
            Actions.WalkChooseNpcToMarkerAction.prototype.getLabel = function() {
                return DefaultNodeShapes.Localization.Actions.WalkChooseNpcLabel;
            };
        

            /**
             * Opens teh choose object dialog
             * 
             * @returns {jQuery.Deferred} Deferred that will be resolved with the choosen object
             */
            Actions.WalkChooseNpcToMarkerAction.prototype.openChooseObjectDialog = function() {
                return GoNorth.DefaultNodeShapes.openNpcSearchDialog();
            };

            /**
             * Returns the choose label
             * 
             * @returns {string} Label for choosing
             */
            Actions.WalkChooseNpcToMarkerAction.prototype.getChooseObjectLabel = function() {
                return DefaultNodeShapes.Localization.Actions.ChooseNpcLabel;
            };

            /**
             * Returns the selections seperator label
             * 
             * @returns {string} Label for seperation
             */
            Actions.WalkChooseNpcToMarkerAction.prototype.getSelectionSeperatorLabel = function() {
                return DefaultNodeShapes.Localization.Actions.WalkTo;
            };

            /**
             * Returns the choose label
             * 
             * @returns {string} Label for choosing
             */
            Actions.WalkChooseNpcToMarkerAction.prototype.getOpenObjectTooltip = function() {
                return DefaultNodeShapes.Localization.Actions.OpenNpcTooltip;
            };

            /**
             * Opens the object
             * 
             * @param {string} id Id of the object
             */
            Actions.WalkChooseNpcToMarkerAction.prototype.openObject = function(id) {
                window.open("/Kortisto/Npc?id=" + id)
            }

            /**
             * Returns the related object type of the choosen object
             * 
             * @returns {string} Related object type of the choosen object
             */
            Actions.WalkChooseNpcToMarkerAction.prototype.getRelatedToObjectType = function() {
                return Actions.RelatedToObjectNpc;
            };

            /**
             * Returns the loading object resource type
             * 
             * @returns {number} Loading objcet resource type
             */
            Actions.WalkChooseNpcToMarkerAction.prototype.getObjectResourceType = function() {
                return GoNorth.DefaultNodeShapes.Shapes.ObjectResourceNpc;
            };

            /**
             * Loads the choosen object
             * 
             * @returns {number} Loading objcet resource type
             * @param {string} npcId Npc Id
             * @returns {jQuery.Deferred} Deferred for the objcet loading
             */
            Actions.WalkChooseNpcToMarkerAction.prototype.loadChoosenObject = function(npcId) {
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

            GoNorth.DefaultNodeShapes.Shapes.addAvailableAction(new Actions.WalkChooseNpcToMarkerAction());

        }(DefaultNodeShapes.Actions = DefaultNodeShapes.Actions || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));