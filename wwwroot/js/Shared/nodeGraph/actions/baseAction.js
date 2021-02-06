(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Actions) {

            /// Actions that are related to npcs
            Actions.RelatedToObjectNpc = "Npc";

            /// Actions that are related to quests
            Actions.RelatedToObjectQuest = "Quest";

            /// Actions that are related to skills
            Actions.RelatedToObjectSkill = "Skill";

            /// Actions that are related to items
            Actions.RelatedToObjectItem = "Item";

            /// Actions that are related to map markers
            Actions.RelatedToObjectMapMarker = "MapMarker";

            /// Actions that are related to a map
            Actions.RelatedToObjectMap = "Map";

            /// Actions that are related to a daily routine
            Actions.RelatedToObjectDailyRoutine = "NpcDailyRoutineEvent";

            /// Actions that are related to a daily routine
            Actions.RelatedToWikiPage = "WikiPage";

            /**
             * Base Action
             * @class
             */
            Actions.BaseAction = function()
            {
                this.nodeModel = null;
            };

            Actions.BaseAction.prototype = {
                /**
                 * Builds the action
                 * 
                 * @returns {object} Action
                 */
                buildAction: function() {

                },

                /**
                 * Sets the node model
                 * 
                 * @param {object} model Node model
                 */
                setNodeModel: function(model) {
                    this.nodeModel = model;
                },

                /**
                 * Returns the type of the action
                 * 
                 * @returns {number} Type of the action
                 */
                getType: function() {
                    return -1;
                },

                /**
                 * Returns the label of the action
                 * 
                 * @returns {string} Label of the action
                 */
                getLabel: function() {

                },

                /**
                 * Returns the HTML Content of the action
                 * 
                 * @returns {string} HTML Content of the action
                 */
                getContent: function() {

                },

                /**
                 * Returns the config key for the action
                 * 
                 * @returns {string} Config key
                 */
                getConfigKey: function() {
                    return null;
                },

                /**
                 * Returns the names of the custom action attributes
                 * 
                 * @returns {string[]} Name of the custom action attributes
                 */
                getCustomActionAttributes: function() {
                    return [];
                },

                /**
                 * Returns the label for the main output
                 * 
                 * @returns {string} Label for the main output
                 */
                getMainOutputLabel: function() {
                    return "";
                },

                /**
                 * Returns the additional outports of the action
                 * 
                 * @returns {string[]} Additional outports
                 */
                getAdditionalOutports: function() {
                    return [];
                },

                /**
                 * Gets called once the action was intialized
                 * 
                 * @param {object} contentElement Content element
                 * @param {ActionNode} actionNode Parent Action node
                 */
                onInitialized: function(contentElement, actionNode) {

                },

                /**
                 * Serializes the data
                 * 
                 * @returns {object} Serialized Data 
                 */
                serialize: function() {

                },

                /**
                 * Deserializes the data
                 * 
                 * @param {object} serializedData Serialized data
                 */
                deserialize: function(serializedData) {

                },

                /**
                 * Returns statistics for the action
                 * @param {object} parsedActionData Parsed action data
                 * @returns Node statistics
                 */
                getStatistics: function(parsedActionData) {
                    return {};
                }
            };

        }(DefaultNodeShapes.Actions = DefaultNodeShapes.Actions || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));