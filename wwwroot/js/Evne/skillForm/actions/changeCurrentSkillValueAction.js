(function(GoNorth) {
    "use strict";
    (function(Evne) {
        (function(Actions) {

            /// Action Type for changing the current skill value
            var actionTypeChangeCurrentSkillValue = 13;

            /**
             * Change current skill value Action
             * @class
             */
            Actions.ChangeCurrentSkillValueAction = function()
            {
                GoNorth.DefaultNodeShapes.Actions.ChangeValueAction.apply(this);
            };

            Actions.ChangeCurrentSkillValueAction.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.Actions.ChangeValueAction.prototype);

            /**
             * Builds the action
             * 
             * @returns {object} Action
             */
            Actions.ChangeCurrentSkillValueAction.prototype.buildAction = function() {
                return new Actions.ChangeCurrentSkillValueAction();
            };

            /**
             * Returns the type of the action
             * 
             * @returns {number} Type of the action
             */
            Actions.ChangeCurrentSkillValueAction.prototype.getType = function() {
                return actionTypeChangeCurrentSkillValue;
            };

            /**
             * Returns the label of the action
             * 
             * @returns {string} Label of the action
             */
            Actions.ChangeCurrentSkillValueAction.prototype.getLabel = function() {
                return Evne.Localization.Actions.ChangeCurrentSkillValueLabel;
            };

            /**
             * Returns the object type name. Used for dependency objects
             * 
             * @returns {string} Object Type name used for depends on objects 
             */
            Actions.ChangeCurrentSkillValueAction.prototype.getObjectTypeName = function() {
                return Actions.RelatedToObjectSkill;
            };
            
            /**
             * Returns the object resource
             * 
             * @returns {int} Object Resource
             */
            Actions.ChangeCurrentSkillValueAction.prototype.getObjectId = function() {
                return Evne.getCurrentSkillId();
            };

            /**
             * Returns the object resource
             * 
             * @returns {int} Object Resource
             */
            Actions.ChangeCurrentSkillValueAction.prototype.getObjectResource = function() {
                return GoNorth.DefaultNodeShapes.Shapes.ObjectResourceSkill;
            };

            /**
             * Loads the skill
             * 
             * @returns {jQuery.Deferred} Deferred for the skill loading
             */
            Actions.ChangeCurrentSkillValueAction.prototype.loadObject = function() {
                var def = new jQuery.Deferred();

                GoNorth.HttpClient.get("/api/EvneApi/FlexFieldObject?id=" + Evne.getCurrentSkillId()).done(function(data) {
                    def.resolve(data);
                }).fail(function(xhr) {
                    def.reject();
                });

                return def.promise();
            };

            GoNorth.DefaultNodeShapes.Shapes.addAvailableAction(new Actions.ChangeCurrentSkillValueAction());

        }(Evne.Actions = Evne.Actions || {}));
    }(GoNorth.Evne = GoNorth.Evne || {}));
}(window.GoNorth = window.GoNorth || {}));