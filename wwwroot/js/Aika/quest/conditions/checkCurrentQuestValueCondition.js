(function(GoNorth) {
    "use strict";
    (function(Aika) {
        (function(Conditions) {

            /// Condition Type for checking the current quest
            var conditionTypeCheckCurrentQuestValue = 6;

            /**
             * Check current quest value condition
             * @class
             */
            Conditions.CheckCurrentQuestValueCondition = function()
            {
                GoNorth.DefaultNodeShapes.Conditions.CheckValueCondition.apply(this);
            };

            Conditions.CheckCurrentQuestValueCondition.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.Conditions.CheckValueCondition.prototype);

            /**
             * Returns the type of the condition
             * 
             * @returns {number} Type of the condition
             */
            Conditions.CheckCurrentQuestValueCondition.prototype.getType = function() {
                return conditionTypeCheckCurrentQuestValue;
            };

            /**
             * Returns the label of the condition
             * 
             * @returns {string} Label of the condition
             */
            Conditions.CheckCurrentQuestValueCondition.prototype.getLabel = function() {
                return Aika.Localization.Conditions.CheckCurrentQuestValueLabel;
            };

            /**
             * Returns the title of the field object used in the string representation
             * 
             * @param {object} loadedFieldObject Loaded Field object for returning name if necessary
             * @returns {string} Title of the field object
             */
            Conditions.CheckCurrentQuestValueCondition.prototype.getObjectTitle = function(loadedFieldObject) {
                return Aika.Localization.Conditions.CurrentQuestLabel;
            };

            /**
             * Returns the object type name. Used for dependency objects
             * 
             * @returns {string} Object Type name used for depends on objects 
             */
            Conditions.CheckCurrentQuestValueCondition.prototype.getObjectTypeName = function() {
                return "Quest";
            };

            /**
             * Returns the object id
             * 
             * @returns {string} Object id
             */
            Conditions.CheckCurrentQuestValueCondition.prototype.getObjectId = function() {
                return Aika.getCurrentQuestId();
            };

            /**
             * Returns the object resource
             * 
             * @returns {int} Object Resource
             */
            Conditions.CheckCurrentQuestValueCondition.prototype.getObjectResource = function() {
                return GoNorth.DefaultNodeShapes.Shapes.ObjectResourceQuest;
            };

            /**
             * Loads the quest
             * 
             * @returns {jQuery.Deferred} Deferred for the async process
             */
            Conditions.CheckCurrentQuestValueCondition.prototype.loadObject = function() {
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


            GoNorth.DefaultNodeShapes.Conditions.getConditionManager().addConditionType(new Conditions.CheckCurrentQuestValueCondition());

        }(Aika.Conditions = Aika.Conditions || {}));
    }(GoNorth.Aika = GoNorth.Aika || {}));
}(window.GoNorth = window.GoNorth || {}));