(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Shapes) {

            /// Quest state not started
            var questStateNotStarted = 0;

            /// Quest state in progress
            var questStateInProgress = 1;

            /// Quest state success
            var questStateSuccess = 2;

            /// Quest state failed
            var questStateFailed = 3;

            /// Quest state label lookup
            var questStateLabelLookup = { };
            questStateLabelLookup[questStateNotStarted] = DefaultNodeShapes.Localization.QuestStates.NotStarted;
            questStateLabelLookup[questStateInProgress] = DefaultNodeShapes.Localization.QuestStates.InProgress;
            questStateLabelLookup[questStateSuccess] = DefaultNodeShapes.Localization.QuestStates.Success;
            questStateLabelLookup[questStateFailed] = DefaultNodeShapes.Localization.QuestStates.Failed;

            /**
             * Creates a quest state object
             * 
             * @param {int} questState QUest State Number
             * @returns {object} Quest State Object
             */
            function createState(questState) {
                return {
                    questState: questState,
                    label: questStateLabelLookup[questState]
                };
            };

            /**
             * Returns the quest state label for a quest state value
             * 
             * @param {int} questState Quest State to return the label for
             * @returns {string} Quest State Label
             */
            Shapes.getQuestStateLabel = function(questState) {
                return questStateLabelLookup[questState];
            };

            /**
             * Returns all available quest states
             * 
             * @returns {object[]} Array of all available quest states
             */
            Shapes.getQuestStates = function() {
                return [
                    createState(questStateNotStarted),
                    createState(questStateInProgress),
                    createState(questStateSuccess),
                    createState(questStateFailed)
                ];
            };

        }(DefaultNodeShapes.Shapes = DefaultNodeShapes.Shapes || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));