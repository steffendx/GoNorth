(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Conditions) {

            /// Condition Type for checking the state of a quest to choose
            var conditionTypeCheckChooseQuestState = 8;
            
            /**
             * Check quest state condition
             * @class
             */
            Conditions.CheckQuestStateCondition = function()
            {
                GoNorth.DefaultNodeShapes.Conditions.BaseCondition.apply(this);
                GoNorth.DefaultNodeShapes.Shapes.SharedObjectLoading.apply(this);
            };

            Conditions.CheckQuestStateCondition.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.Conditions.BaseCondition.prototype);
            Conditions.CheckQuestStateCondition.prototype = jQuery.extend(Conditions.CheckQuestStateCondition.prototype, GoNorth.DefaultNodeShapes.Shapes.SharedObjectLoading.prototype);

            /**
             * Returns the template name for the condition
             * 
             * @returns {string} Template name
             */
            Conditions.CheckQuestStateCondition.prototype.getTemplateName = function() {
                return "gn-nodeQuestStateCheck";
            };
            
            /**
             * Returns true if the condition can be selected in the dropdown list, else false
             * 
             * @returns {bool} true if the condition can be selected, else false
             */
            Conditions.CheckQuestStateCondition.prototype.canBeSelected = function() {
                return true;
            };

            /**
             * Returns the type of the condition
             * 
             * @returns {number} Type of the condition
             */
            Conditions.CheckQuestStateCondition.prototype.getType = function() {
                return conditionTypeCheckChooseQuestState;
            };

            /**
             * Returns the label of the condition
             * 
             * @returns {string} Label of the condition
             */
            Conditions.CheckQuestStateCondition.prototype.getLabel = function() {
                return DefaultNodeShapes.Localization.Conditions.CheckQuestStateLabel;
            };

            /**
             * Returns the objects on which an object depends
             * 
             * @param {object} existingData Existing condition data
             * @returns {object[]} Objects on which the condition depends
             */
            Conditions.CheckQuestStateCondition.prototype.getConditionDependsOnObject = function(existingData) {
                if(!existingData.questId)
                {
                    return [];
                }

                return [{
                    objectType: Conditions.RelatedToObjectQuest,
                    objectId: existingData.questId
                }];
            };

            /**
             * Returns the object resource
             * 
             * @returns {int} Object Resource
             */
            Conditions.CheckQuestStateCondition.prototype.getObjectResource = function() {
                return GoNorth.DefaultNodeShapes.Shapes.ObjectResourceQuest;
            };

            /**
             * Returns the object id from existing condition data for request caching
             * 
             * @param {object} existingData Existing condition data
             * @returns {string} Object Id for caching
             */
            Conditions.CheckQuestStateCondition.prototype.getObjectId = function(existingData) {
                return existingData.questId;
            };

            /**
             * Loads a quest
             * 
             * @param {string} questId Quest Id
             * @returns {jQuery.Deferred} Deferred for the loading process
             */
            Conditions.CheckQuestStateCondition.prototype.loadObject = function(questId) {
                var loadingDef = new jQuery.Deferred();

                GoNorth.HttpClient.get("/api/AikaApi/GetQuest?id=" + questId).done(function(quest) {
                    loadingDef.resolve(quest);
                }).fail(function(xhr) {
                    loadingDef.reject();
                });

                return loadingDef;
            };
            
            /**
             * Returns the data for the condition
             * 
             * @param {object} existingData Existing condition data
             * @param {object} element Element to which the data belongs
             * @returns {object} Condition data
             */
            Conditions.CheckQuestStateCondition.prototype.buildConditionData = function(existingData, element) {
                var conditionData = {
                    selectedQuestId: new ko.observable(),
                    selectedQuestName: new ko.observable(DefaultNodeShapes.Localization.Conditions.ChooseQuestLabel),
                    selectedQuestState: new ko.observable(),
                    questStates: DefaultNodeShapes.Shapes.getQuestStates()
                };

                conditionData.chooseQuest = function() {
                    GoNorth.DefaultNodeShapes.openQuestSearchDialog().then(function(quest) {
                        conditionData.selectedQuestId(quest.id);
                        conditionData.selectedQuestName(quest.name);
                    });
                };

                // Load existing data
                if(existingData)
                {
                    conditionData.selectedQuestId(existingData.questId);
                    conditionData.selectedQuestState(existingData.state)

                    if(existingData.questId) 
                    {
                        this.loadObjectShared(existingData).then(function(quest) {
                            conditionData.selectedQuestName(quest.name);
                        }, function() {
                            element.errorOccured(true);
                        });
                    }
                }

                return conditionData;
            };

            /**
             * Serializes condition data
             * 
             * @param {object} conditionData Condition data
             * @returns {object} Serialized data
             */
            Conditions.CheckQuestStateCondition.prototype.serializeConditionData = function(conditionData) {
                return {
                    questId: conditionData.selectedQuestId(),
                    state: conditionData.selectedQuestState()
                };
            };

            /**
             * Returns the condition data as a display string
             * 
             * @param {object} existingData Serialzied condition data
             * @returns {jQuery.Deferred} Deferred for the loading process
             */
            Conditions.CheckQuestStateCondition.prototype.getConditionString = function(existingData) {
                var def = new jQuery.Deferred();
                
                // Check if data is valid
                if(!existingData.questId)
                {
                    def.resolve(DefaultNodeShapes.Localization.Conditions.MissingInformations);
                    return def.promise();
                }

                // Load data and build string
                var self = this;
                this.loadObjectShared(existingData).then(function(quest) {
                    var conditionText = DefaultNodeShapes.Localization.Conditions.StateLabel + "(" + quest.name + ") = " + DefaultNodeShapes.Shapes.getQuestStateLabel(existingData.state);

                    def.resolve(conditionText);
                }, function() {
                    def.reject();
                });

                return def.promise();
            };

            GoNorth.DefaultNodeShapes.Conditions.getConditionManager().addConditionType(new Conditions.CheckQuestStateCondition());

        }(DefaultNodeShapes.Conditions = DefaultNodeShapes.Conditions || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));