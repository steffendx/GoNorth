(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Actions) {

            /**
             * Set Daily Routine event state action
             * @class
             */
            Actions.SetDailyRoutineEventStateAction = function()
            {
                GoNorth.DefaultNodeShapes.Actions.BaseAction.apply(this);
                GoNorth.DefaultNodeShapes.Shapes.SharedObjectLoading.apply(this);
            };

            Actions.SetDailyRoutineEventStateAction.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.Actions.BaseAction.prototype);
            Actions.SetDailyRoutineEventStateAction.prototype = jQuery.extend(Actions.SetDailyRoutineEventStateAction.prototype, GoNorth.DefaultNodeShapes.Shapes.SharedObjectLoading.prototype);

            /**
             * Returns the HTML Content of the action
             * 
             * @returns {string} HTML Content of the action
             */
            Actions.SetDailyRoutineEventStateAction.prototype.getContent = function() {
                return  "<div class='gn-actionNodeObjectSelectContainer'>" +
                            "<a class='gn-actionNodeObjectSelect gn-clickable'>" + DefaultNodeShapes.Localization.Actions.ChooseDailyRoutineEvent + "</a>" +
                            "<a class='gn-clickable gn-nodeActionOpenObject' title='" + DefaultNodeShapes.Localization.Actions.OpenDailyRoutineEventNpcTooltip + "' style='display: none'><i class='glyphicon glyphicon-eye-open'></i></a>" +
                        "</div>";
            };

            /**
             * Gets called once the action was intialized
             * 
             * @param {object} contentElement Content element
             * @param {ActionNode} actionNode Parent Action node
             */
            Actions.SetDailyRoutineEventStateAction.prototype.onInitialized = function(contentElement, actionNode) {
                this.contentElement = contentElement;
                
                var openObjectLink = contentElement.find(".gn-nodeActionOpenObject");

                // Deserialize
                var deserializedData = this.deserializeData();
                if(deserializedData)
                {
                    this.nodeModel.set("actionRelatedToObjectType", Actions.RelatedToObjectNpc);
                    this.nodeModel.set("actionRelatedToObjectId", deserializedData.npcId);
                    this.nodeModel.set("actionRelatedToAdditionalObjects", [{
                        objectType: Actions.RelatedToObjectDailyRoutine,
                        objectId: deserializedData.eventId
                    }]);

                    this.loadEventFromNpc(deserializedData.npcId, deserializedData.eventId);
                }

                // Handlers
                var self = this;
                contentElement.find(".gn-actionNodeObjectSelect").on("click", function() {
                    GoNorth.DefaultNodeShapes.openDailyRoutineEventSearchDialog().then(function(dailyRoutine) {
                        self.nodeModel.set("objectId", dailyRoutine.parentObject.id);
                        self.nodeModel.set("actionRelatedToObjectType", Actions.RelatedToObjectNpc);
                        self.nodeModel.set("actionRelatedToObjectId", dailyRoutine.parentObject.id);
                        self.nodeModel.set("actionRelatedToAdditionalObjects", [{
                            objectType: Actions.RelatedToObjectDailyRoutine,
                            objectId: dailyRoutine.eventId
                        }]);

                        self.saveData(dailyRoutine.parentObject.id, dailyRoutine.eventId);

                        contentElement.find(".gn-actionNodeObjectSelect").text(dailyRoutine.parentObject.name + ": " + dailyRoutine.name);

                        openObjectLink.show();
                    });
                });
                
                openObjectLink.on("click", function() {
                    var npcId = self.nodeModel.get("objectId");
                    if(npcId) 
                    {
                        window.open("/Kortisto/Npc?id=" + npcId);
                    }
                });
            };

            /**
             * Deserializes the data
             * @returns {object} Deserialized data
             */
            Actions.SetDailyRoutineEventStateAction.prototype.deserializeData = function() {
                var actionData = this.nodeModel.get("actionData");
                if(!actionData)
                {
                    return null;
                }

                var data = JSON.parse(actionData);
                this.nodeModel.set("objectId", data.npcId);

                return data;
            };

            /**
             * Loads the event from an npc
             * @param {string} npcId Id of the npc
             * @param {string} eventId Id of the event
             */
            Actions.SetDailyRoutineEventStateAction.prototype.loadEventFromNpc = function(npcId, eventId) {
                var self = this;
                this.loadObjectShared(npcId).then(function(npc) {
                    if(!npc.dailyRoutine) 
                    {
                        return;
                    }

                    for(var curEvent = 0; curEvent < npc.dailyRoutine.length; ++curEvent)
                    {
                        if(npc.dailyRoutine[curEvent].eventId == eventId)
                        {
                            var eventName = GoNorth.DailyRoutines.Util.formatTimeSpan(DefaultNodeShapes.Localization.Actions.TimeFormat, npc.dailyRoutine[curEvent].earliestTime, npc.dailyRoutine[curEvent].latestTime);
                            self.contentElement.find(".gn-actionNodeObjectSelect").text(npc.name + ": " + eventName);
                            self.contentElement.find(".gn-nodeActionOpenObject").show();
                            break;
                        }
                    }
                });
            };

            /**
             * Saves the data
             * @param {string} npcId Id of the npc
             * @param {string} eventId Id of the event
             */
            Actions.SetDailyRoutineEventStateAction.prototype.saveData = function(npcId, eventId) {
                var serializeData = {
                    npcId: npcId,
                    eventId: eventId
                };
                
                this.nodeModel.set("actionData", JSON.stringify(serializeData));
            };

            /**
             * Returns the names of the custom action attributes
             * 
             * @returns {string[]} Name of the custom action attributes
             */
            Actions.SetDailyRoutineEventStateAction.prototype.getCustomActionAttributes = function() {
                return [ "objectId" ];
            };


            /**
             * Returns the object id
             * 
             * @returns {string} Object Id
             */
            Actions.SetDailyRoutineEventStateAction.prototype.getObjectId = function() {
                return this.nodeModel.get("objectId");
            };

            /**
             * Returns the object resource
             * 
             * @returns {int} Object Resource
             */
            Actions.SetDailyRoutineEventStateAction.prototype.getObjectResource = function() {
                return GoNorth.DefaultNodeShapes.Shapes.ObjectResourceNpc;
            };

            /**
             * Loads the npc
             * 
             * @returns {jQuery.Deferred} Deferred for the npc loading
             */
            Actions.SetDailyRoutineEventStateAction.prototype.loadObject = function() {
                var def = new jQuery.Deferred();

                jQuery.ajax({ 
                    url: "/api/KortistoApi/FlexFieldObject?id=" + this.nodeModel.get("objectId"), 
                    type: "GET"
                }).done(function(data) {
                    def.resolve(data);
                }).fail(function(xhr) {
                    def.reject();
                });

                return def.promise();
            };

            /**
             * Builds the action
             * 
             * @returns {object} Action
             */
            Actions.SetDailyRoutineEventStateAction.prototype.buildAction = function() {
                return new Actions.SetDailyRoutineEventStateAction();
            };

            /**
             * Returns the type of the action
             * 
             * @returns {number} Type of the action
             */
            Actions.SetDailyRoutineEventStateAction.prototype.getType = function() {
                return -1;
            };

            /**
             * Returns the label of the action
             * 
             * @returns {string} Label of the action
             */
            Actions.SetDailyRoutineEventStateAction.prototype.getLabel = function() {
                return "";
            };

        }(DefaultNodeShapes.Actions = DefaultNodeShapes.Actions || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));