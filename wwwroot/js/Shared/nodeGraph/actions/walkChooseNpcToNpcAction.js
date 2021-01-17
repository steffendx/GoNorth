(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Actions) {

            /// Action Type for walking an npc to an npc which is choosen
            var actionTypeWalkChoseNpcToNpc = 47;

            /**
             * Walk choose npc Action
             * @class
             */
            Actions.WalkChooseNpcToNpcAction = function()
            {
                GoNorth.DefaultNodeShapes.Actions.MoveChooseObjectToNpcAction.apply(this);
            };

            Actions.WalkChooseNpcToNpcAction.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.Actions.MoveChooseObjectToNpcAction.prototype);

            /**
             * Returns true if the action has a movement state, else false
             * 
             * @returns {bool} true if the action has a movement state, else false
             */
            Actions.WalkChooseNpcToNpcAction.prototype.hasMovementState = function() {
                return true;
            };

            /**
             * Builds the action
             * 
             * @returns {object} Action
             */
            Actions.WalkChooseNpcToNpcAction.prototype.buildAction = function() {
                return new Actions.WalkChooseNpcToNpcAction();
            };

            /**
             * Returns the type of the action
             * 
             * @returns {number} Type of the action
             */
            Actions.WalkChooseNpcToNpcAction.prototype.getType = function() {
                return actionTypeWalkChoseNpcToNpc;
            };

            /**
             * Returns the label of the action
             * 
             * @returns {string} Label of the action
             */
            Actions.WalkChooseNpcToNpcAction.prototype.getLabel = function() {
                return DefaultNodeShapes.Localization.Actions.WalkChooseNpcToNpcLabel;
            };
                
            /**
             * Returns the label for the main output
             * 
             * @returns {string} Label for the main output
             */
            Actions.WalkChooseNpcToNpcAction.prototype.getMainOutputLabel = function() {
                return DefaultNodeShapes.Localization.Actions.WalkOnTargetReachLabel;
            };

            /**
             * Returns the additional outports of the action
             * 
             * @returns {string[]} Additional outports
             */
            Actions.WalkChooseNpcToNpcAction.prototype.getAdditionalOutports = function() {
                return [ DefaultNodeShapes.Localization.Actions.WalkDirectContinueLabel ];
            };


            /**
             * Opens the choose object dialog
             * 
             * @returns {jQuery.Deferred} Deferred that will be resolved with the choosen object
             */
            Actions.WalkChooseNpcToNpcAction.prototype.openChooseObjectDialog = function() {
                return GoNorth.DefaultNodeShapes.openNpcSearchDialog();
            };

            /**
             * Returns the choose label
             * 
             * @returns {string} Label for choosing
             */
            Actions.WalkChooseNpcToNpcAction.prototype.getChooseObjectLabel = function() {
                return DefaultNodeShapes.Localization.Actions.ChooseNpcLabel;
            };

            /**
             * Returns the selections seperator label
             * 
             * @returns {string} Label for seperation
             */
            Actions.WalkChooseNpcToNpcAction.prototype.getSelectionSeperatorLabel = function() {
                return DefaultNodeShapes.Localization.Actions.WalkToNpc;
            };

            /**
             * Returns the choose label
             * 
             * @returns {string} Label for choosing
             */
            Actions.WalkChooseNpcToNpcAction.prototype.getOpenObjectTooltip = function() {
                return DefaultNodeShapes.Localization.Actions.OpenNpcTooltip;
            };

            /**
             * Opens the object
             * 
             * @param {string} id Id of the object
             */
            Actions.WalkChooseNpcToNpcAction.prototype.openObject = function(id) {
                window.open("/Kortisto/Npc?id=" + id)
            }

            /**
             * Returns the related object type of the choosen object
             * 
             * @returns {string} Related object type of the choosen object
             */
            Actions.WalkChooseNpcToNpcAction.prototype.getRelatedToObjectType = function() {
                return Actions.RelatedToObjectNpc;
            };

            /**
             * Returns the loading object resource type
             * 
             * @returns {number} Loading objcet resource type
             */
            Actions.WalkChooseNpcToNpcAction.prototype.getObjectResourceType = function() {
                return GoNorth.DefaultNodeShapes.Shapes.ObjectResourceNpc;
            };

            /**
             * Loads the choosen object
             * 
             * @returns {number} Loading objcet resource type
             * @param {string} npcId Npc Id
             * @returns {jQuery.Deferred} Deferred for the objcet loading
             */
            Actions.WalkChooseNpcToNpcAction.prototype.loadChoosenObject = function(npcId) {
                var def = new jQuery.Deferred();

                GoNorth.HttpClient.get("/api/KortistoApi/FlexFieldObject?id=" + npcId).done(function(data) {
                    def.resolve(data);
                }).fail(function(xhr) {
                    def.reject();
                });

                return def.promise();
            };

            GoNorth.DefaultNodeShapes.Shapes.addAvailableAction(new Actions.WalkChooseNpcToNpcAction());

        }(DefaultNodeShapes.Actions = DefaultNodeShapes.Actions || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));