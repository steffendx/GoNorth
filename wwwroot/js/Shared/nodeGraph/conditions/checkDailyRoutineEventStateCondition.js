(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Conditions) {

            /**
             * Check value condition
             * @class
             */
            Conditions.CheckDailyRoutineEventStateCondition = function()
            {
                GoNorth.DefaultNodeShapes.Conditions.BaseCondition.apply(this);
                GoNorth.DefaultNodeShapes.Shapes.SharedObjectLoading.apply(this);
            };

            Conditions.CheckDailyRoutineEventStateCondition.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.Conditions.BaseCondition.prototype);
            Conditions.CheckDailyRoutineEventStateCondition.prototype = jQuery.extend(Conditions.CheckDailyRoutineEventStateCondition.prototype, GoNorth.DefaultNodeShapes.Shapes.SharedObjectLoading.prototype);

            /**
             * Returns the template name for the condition
             * 
             * @returns {string} Template name
             */
            Conditions.CheckDailyRoutineEventStateCondition.prototype.getTemplateName = function() {
                return "gn-nodeConditionCheckDailyRoutineEventState";
            };
            
            /**
             * Returns true if the condition can be selected in the dropdown list, else false
             * 
             * @returns {bool} true if the condition can be selected, else false
             */
            Conditions.CheckDailyRoutineEventStateCondition.prototype.canBeSelected = function() {
                return true;
            };

            /**
             * Returns the data for the condition
             * 
             * @param {object} existingData Existing condition data
             * @param {object} element Element to which the data belongs
             * @returns {object} Condition data
             */
            Conditions.CheckDailyRoutineEventStateCondition.prototype.buildConditionData = function(existingData, element) {
                var conditionData = {
                    selectedDailyRoutineNpcId: new ko.observable(null),
                    selectedDailyRoutineEventId: new ko.observable(null),
                    selectedDailyRoutineNpcName: new ko.observable(null),
                    selectedDailyRoutineEvent: new ko.observable(null),
                };

                conditionData.selectedDailyRoutineEventDisplay = new ko.pureComputed(function() {
                    var npcName = this.selectedDailyRoutineNpcName();
                    var event = this.selectedDailyRoutineEvent();
                    if(!event) {
                        return DefaultNodeShapes.Localization.Conditions.ChooseDailyRoutineEvent;
                    }

                    var eventName = GoNorth.DailyRoutines.Util.formatTimeSpan(DefaultNodeShapes.Localization.Conditions.TimeFormat, event.earliestTime, event.latestTime);
                    return npcName + ": " + eventName;
                }, conditionData);

                // Handler
                conditionData.chooseDailyRoutineEvent = function() {
                    GoNorth.DefaultNodeShapes.openDailyRoutineEventSearchDialog().then(function(dailyRoutine) {
                        conditionData.selectedDailyRoutineNpcId(dailyRoutine.parentObject.id);
                        conditionData.selectedDailyRoutineEventId(dailyRoutine.eventId);
                        conditionData.selectedDailyRoutineNpcName(dailyRoutine.parentObject.name);
                        conditionData.selectedDailyRoutineEvent(dailyRoutine);
                    });
                };

                // Deserialize
                if(existingData)
                {
                    this.deserializeConditionData(conditionData, existingData);
                }

                return conditionData;
            };
            
            /**
             * Serializes condition data
             * 
             * @param {object} conditionData Condition data
             * @returns {object} Serialized data
             */
            Conditions.CheckDailyRoutineEventStateCondition.prototype.serializeConditionData = function(conditionData) {
                return {
                    npcId: conditionData.selectedDailyRoutineNpcId(),
                    eventId: conditionData.selectedDailyRoutineEventId()
                };
            };

            /**
             * Deserializes condition data
             * 
             * @param {object} conditionData Condition data
             * @param {object} existingData Existing condition data
             */
            Conditions.CheckDailyRoutineEventStateCondition.prototype.deserializeConditionData = function(conditionData, existingData) {
                if(!existingData || !existingData.npcId || !existingData.eventId)
                {
                    return;
                }

                
                this.loadObjectShared(existingData).then(function(npc) {
                    if(!npc.dailyRoutine) 
                    {
                        return;
                    }

                    for(var curEvent = 0; curEvent < npc.dailyRoutine.length; ++curEvent)
                    {
                        if(npc.dailyRoutine[curEvent].eventId == existingData.eventId)
                        {
                            conditionData.selectedDailyRoutineNpcId(npc.id);
                            conditionData.selectedDailyRoutineNpcName(npc.name);
                            conditionData.selectedDailyRoutineEventId(npc.dailyRoutine[curEvent].eventId);
                            conditionData.selectedDailyRoutineEvent(npc.dailyRoutine[curEvent]);
                            return;
                        }
                    }
                });
            };

            /**
             * Returns the object id for dependency checks
             * 
             * @param {object} existingData Existing condition data
             * @returns {string} Object Id on which the condition depends
             */
            Conditions.CheckDailyRoutineEventStateCondition.prototype.getDependsOnObjectId = function(existingData) {
                return existingData && existingData.npcId ? existingData.npcId : null;
            };

            /**
             * Returns the objects on which an object depends
             * 
             * @param {object} existingData Existing condition data
             * @returns {object[]} Objects on which the condition depends
             */
            Conditions.CheckDailyRoutineEventStateCondition.prototype.getConditionDependsOnObject = function(existingData) {
                var objectId = this.getDependsOnObjectId(existingData);

                return [{
                    objectType: "Npc",
                    objectId: objectId
                },{
                    objectType: "NpcDailyRoutineEvent",
                    objectId: existingData && existingData.eventId
                }];
            }


            /**
             * Returns the object resource
             * 
             * @returns {int} Object Resource
             */
            Conditions.CheckDailyRoutineEventStateCondition.prototype.getObjectResource = function() {
                return GoNorth.DefaultNodeShapes.Shapes.ObjectResourceNpc;
            };

            /**
             * Returns the object id from existing condition data for request caching
             * 
             * @param {object} existingData Existing condition data
             * @returns {string} Object Id for caching
             */
            Conditions.CheckDailyRoutineEventStateCondition.prototype.getObjectId = function(existingData) {
                return existingData.npcId;
            };

            /**
             * Loads an npc
             * 
             * @param {string} npcId Npc Id
             * @returns {jQuery.Deferred} Deferred for the loading process
             */
            Conditions.CheckDailyRoutineEventStateCondition.prototype.loadObject = function(npcId) {
                var loadingDef = new jQuery.Deferred();

                jQuery.ajax({ 
                    url: "/api/KortistoApi/FlexFieldObject?id=" + npcId, 
                    type: "GET"
                }).done(function(npc) {
                    loadingDef.resolve(npc);
                }).fail(function(xhr) {
                    loadingDef.reject();
                });

                return loadingDef;
            };

            /**
             * Returns the condition string text template
             * 
             * @returns {string} Condition string text template
             */
            Conditions.CheckDailyRoutineEventStateCondition.prototype.getConditionStringText = function() {
                return "";
            };

            /**
             * Returns the condition data as a display string
             * 
             * @param {object} existingData Serialized condition data
             * @returns {jQuery.Deferred} Deferred for the loading process
             */
            Conditions.CheckDailyRoutineEventStateCondition.prototype.getConditionString = function(existingData) {
                var def = new jQuery.Deferred();
                
                // Check if data is valid
                if(!existingData || !existingData.npcId || !existingData.eventId)
                {
                    def.resolve(DefaultNodeShapes.Localization.Conditions.MissingInformations);
                    return def.promise();
                }

                // Load data and build string
                var self = this;
                this.loadObjectShared(existingData).then(function(npc) {
                    if(!npc.dailyRoutine) 
                    {
                        def.resolve(DefaultNodeShapes.Localization.Conditions.MissingInformations);
                        return;
                    }

                    for(var curEvent = 0; curEvent < npc.dailyRoutine.length; ++curEvent)
                    {
                        if(npc.dailyRoutine[curEvent].eventId == existingData.eventId)
                        {
                            var eventName = GoNorth.DailyRoutines.Util.formatTimeSpan(DefaultNodeShapes.Localization.Conditions.TimeFormat, npc.dailyRoutine[curEvent].earliestTime, npc.dailyRoutine[curEvent].latestTime);
                            var displayString = self.getConditionStringText().replace("{0}", npc.name + ": " + eventName)
                            def.resolve(displayString);
                            return;
                        }
                    }

                    def.resolve(DefaultNodeShapes.Localization.Conditions.MissingInformations);
                }, function() {
                    def.reject();
                });

                return def.promise();
            };

        }(DefaultNodeShapes.Conditions = DefaultNodeShapes.Conditions || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));