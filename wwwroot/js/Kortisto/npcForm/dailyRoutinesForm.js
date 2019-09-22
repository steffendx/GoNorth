(function(GoNorth) {
    "use strict";
    (function(Kortisto) {
        (function(Npc) {

            /**
             * Daily Routines Form
             * @param {ko.observable} id Id observable
             * @param {GoNorth.ChooseObjectDialog.ViewModel} objectDialog Object choose dialog
             * @param {ko.observableArray} markedInKartaMaps Array with karta maps in which the npc is marked
             * @param {ko.observable} errorOccured Error occured observable
             * @class
             */
            Npc.DailyRoutinesForm = function(id, objectDialog, markedInKartaMaps, errorOccured)
            {
                this.id = id;
                this.errorOccured = errorOccured;

                this.markedInKartaMaps = markedInKartaMaps;

                this.isDailyRoutineExpanded = new ko.observable(false);

                this.dailyRoutineEvents = new ko.observableArray();

                this.hoursPerDay = new ko.observable(24);
                this.minutesPerHour = new ko.observable(60);

                this.showAddEditEventDialog = new ko.observable(false);
                this.addEditEventEnabledByDefault = new ko.observable(true);
                this.addEditEventEarliestTime = new ko.observable(GoNorth.BindingHandlers.buildTimeObject(0, 0));
                this.addEditEventLatestTime = new ko.observable(GoNorth.BindingHandlers.buildTimeObject(0, 0));
                this.addEditEventTargetState = new ko.observable("");
                this.eventToEdit = new ko.observable(null);
                GoNorth.DailyRoutines.Util.keepTimeObservablesInOrder(this.addEditEventEarliestTime, this.addEditEventLatestTime);

                this.chooseScriptTypeDialog = new GoNorth.Shared.ChooseScriptTypeDialog.ViewModel();
                this.codeScriptDialog = new GoNorth.ScriptDialog.CodeScriptDialog(this.errorOccured);
                this.nodeScriptDialog = new GoNorth.ScriptDialog.NodeScriptDialog(this.id, objectDialog, this.codeScriptDialog, this.errorOccured);

                this.showConfirmRemoveEventDialog = new ko.observable(false);
                this.eventToRemove = null;

                this.showDisabledEvents = new ko.observable(true);

                this.showMovementTargetMissingMapMarkerWarning = new ko.observable(false);

                this.suggestedNpcStates = new ko.observableArray();

                this.timeEventsOverlap = new ko.pureComputed(function() {
                    return GoNorth.DailyRoutines.Util.doEventsOverlap(this.dailyRoutineEvents());
                }, this);

                this.loadConfig();
            };

            Npc.DailyRoutinesForm.prototype = {
                /**
                 * Loads the config
                 */
                loadConfig: function() {
                    var self = this;
                    jQuery.ajax("/api/ProjectConfigApi/GetMiscConfig").done(function(data) {
                        self.hoursPerDay(data.hoursPerDay);
                        self.minutesPerHour(data.minutesPerHour);
                    }).fail(function() {
                        self.errorOccured(true);
                    });

                    jQuery.ajax("/api/ProjectConfigApi/GetJsonConfigByKey?configKey=" + GoNorth.ProjectConfig.ConfigKeys.SetNpcStateAction).done(function(loadedConfigData) {
                        if(!loadedConfigData)
                        {
                            return;
                        }
                        
                        try
                        {
                            var configLines = JSON.parse(loadedConfigData)
                            self.suggestedNpcStates(configLines);
                        }
                        catch(e)
                        {
                            self.errorOccured(true);
                        }
                    }).fail(function() {
                        self.errorOccured(true);
                    });
                },

                /**
                 * Loads the events
                 * @param {object[]} dailyRoutine Daily routine
                 */
                loadEvents: function(dailyRoutine) {
                    this.dailyRoutineEvents.removeAll();
                    if(!dailyRoutine) {
                        return;
                    }

                    var newEvents = GoNorth.DailyRoutines.deserializeRoutineEventArray(dailyRoutine);
                    this.dailyRoutineEvents(newEvents);
                },

                /**
                 * Sets the event ids for new events
                 * @param {object[]} returnedDailyRoutine Daily routine data returned from the server
                 */
                setNewEventIds: function(returnedDailyRoutine) {
                    if(!returnedDailyRoutine) {
                        return;
                    }

                    var existingEvents = this.dailyRoutineEvents();
                    for(var curEvent = 0; curEvent < existingEvents.length; ++curEvent)
                    {
                        if(existingEvents[curEvent].eventId) {
                            continue;
                        }

                        for(var curReturnedEvent = 0; curReturnedEvent < returnedDailyRoutine.length; ++curReturnedEvent)
                        {
                            if(returnedDailyRoutine[curReturnedEvent].earliestTime && returnedDailyRoutine[curReturnedEvent].earliestTime.hours == existingEvents[curEvent].earliestTime().hours &&
                               returnedDailyRoutine[curReturnedEvent].latestTime && returnedDailyRoutine[curReturnedEvent].latestTime.hours == existingEvents[curEvent].latestTime().hours &&
                               returnedDailyRoutine[curReturnedEvent].eventType == existingEvents[curEvent].eventType && returnedDailyRoutine[curReturnedEvent].enabledByDefault == existingEvents[curEvent].enabledByDefault() &&
                               returnedDailyRoutine[curReturnedEvent].scriptName == existingEvents[curEvent].scriptName())
                            {
                                existingEvents[curEvent].eventId = returnedDailyRoutine[curReturnedEvent].eventId;
                                break;
                            }
                        }
                    }
                },

                
                /**
                 * Serializes the events
                 * @returns {object[]} Serialized events
                 */
                serializeEvents: function() {
                    var serializedEvents = [];

                    var events = this.dailyRoutineEvents();
                    for(var curEvent = 0; curEvent < events.length; ++curEvent)
                    {
                        serializedEvents.push(GoNorth.DailyRoutines.serializeRoutineEvent(events[curEvent]));
                    }

                    return serializedEvents;
                },


                /**
                 * Toggles the visibility of the daily routines section
                 */
                toogleDailyRoutinesVisibility: function() {
                    this.isDailyRoutineExpanded(!this.isDailyRoutineExpanded());
                },


                /**
                 * Opens Karta to add a new movement event
                 */
                addNewMovementEvent: function() {
                    var movementTargetMapId = "";
                    var hasMovementTargets = false;
                    var existingEvents = this.dailyRoutineEvents();
                    for(var curEvent = 0; curEvent < existingEvents.length; ++curEvent)
                    {
                        if(existingEvents[curEvent].movementTarget && existingEvents[curEvent].movementTarget.mapId) {
                            movementTargetMapId = existingEvents[curEvent].movementTarget.mapId;
                            hasMovementTargets = true;
                            break;
                        }
                    }

                    var kartaMaps = this.markedInKartaMaps();
                    var markerId = "";
                    var markerType = "";
                    if(!movementTargetMapId && kartaMaps.length > 0) {
                        movementTargetMapId = kartaMaps[0].mapId;
                        if(kartaMaps[0].markerIds.length == 1)
                        {
                            markerId = kartaMaps[0].markerIds[0];
                            markerType = kartaMaps[0].mapMarkerType;
                        }
                    }

                    if(movementTargetMapId) {
                        var url = "/Karta?id=" + encodeURIComponent(movementTargetMapId) + "&dailyRoutineNpcId=" + encodeURIComponent(this.id());
                        if(!hasMovementTargets && markerId && markerType) {
                            url += "&zoomOnMarkerId=" + encodeURIComponent(markerId) + "&zoomOnMarkerType=" + markerType;
                        }
                        window.location = url;
                    } else {
                        this.openMovementTargetMissingMapMarkerWarning();
                    }
                },

                /**
                 * Opens the dialog to warn the user that the npc is currently not marked in any map
                 */
                openMovementTargetMissingMapMarkerWarning: function() {
                    this.showMovementTargetMissingMapMarkerWarning(true);
                },

                /**
                 * Redirects the user to the map to add a daily routine even though no marker exists
                 */
                redirectToMapWithMissingMapMarker: function() {
                    window.location = "/Karta?dailyRoutineNpcId=" + encodeURIComponent(this.id()); 
                },

                /**
                 * Closes the dialog to warn the user that the npc is currently not marked in any map
                 */
                closeMovementTargetMissingMapMarkerWarning: function() {
                    this.showMovementTargetMissingMapMarkerWarning(false);
                },

                /**
                 * Opens the dialog to add a new script event
                 */
                addNewScriptEvent: function() {
                    this.openAddEventDialog();
                },

                /**
                 * Confirms the add/edit script event dialog
                 */
                confirmAddScriptEventDialog: function() {
                    var self = this;
                    this.showAddEditEventDialog(false);
                    this.chooseScriptTypeDialog.openDialog().done(function(selectedType) {
                        if(selectedType == GoNorth.Shared.ChooseScriptTypeDialog.nodeGraph)
                        {
                            self.nodeScriptDialog.openCreateDialog().done(function(result) {
                                self.createScriptEvent(GoNorth.DailyRoutines.ScriptTypes.nodeGraph, result.name, null, result.graph);
                            });
                        }
                        else if(selectedType == GoNorth.Shared.ChooseScriptTypeDialog.codeScript)
                        {
                            self.codeScriptDialog.openCreateDialog().done(function(result) {
                                self.createScriptEvent(GoNorth.DailyRoutines.ScriptTypes.codeScript, result.name, result.code, null);
                            });
                        }
                    });
                },

                /**
                 * Creates a new script event 
                 * @param {number} scriptType Script type
                 * @param {string} code Code of the event
                 * @param {object} nodeGraph Node Graph of the event
                 */
                createScriptEvent: function(scriptType, name, code, nodeGraph) {
                    var scriptEvent = GoNorth.DailyRoutines.createRoutineEvent(GoNorth.DailyRoutines.EventTypes.script, this.addEditEventEarliestTime(), this.addEditEventLatestTime(), null, "", 
                                                                               scriptType, name, nodeGraph, code, this.addEditEventEnabledByDefault());

                    this.dailyRoutineEvents.push(scriptEvent);
                    this.ensureDisabledEventsAreShownAfterEdit();
                },

                /**
                 * Confirms the edit of a script event
                 */
                confirmEditScriptEvent: function() {
                    if(!this.eventToEdit())
                    {
                        return;
                    }

                    this.eventToEdit().earliestTime(GoNorth.BindingHandlers.buildTimeObject(this.addEditEventEarliestTime().hours, this.addEditEventEarliestTime().minutes));
                    this.eventToEdit().latestTime(GoNorth.BindingHandlers.buildTimeObject(this.addEditEventLatestTime().hours, this.addEditEventLatestTime().minutes));
                    if(this.eventToEdit().eventType == GoNorth.DailyRoutines.EventTypes.movement)
                    {
                        this.eventToEdit().targetState(this.addEditEventTargetState());
                    }
                    this.eventToEdit().enabledByDefault(this.addEditEventEnabledByDefault());

                    this.ensureDisabledEventsAreShownAfterEdit();
                    this.closeAddEditEventDialog();
                },

                /**
                 * Ensures that disabled events are shown after an edit / create
                 */
                ensureDisabledEventsAreShownAfterEdit: function() {
                    if(!this.addEditEventEnabledByDefault() && !this.showDisabledEvents())
                    {
                        this.showDisabledEvents(true);
                    }
                },

                /**
                 * Opens the add event dialog
                 */
                openAddEventDialog: function() {
                    this.addEditEventEnabledByDefault(true);
                    this.addEditEventEarliestTime(GoNorth.BindingHandlers.buildTimeObject(0, 0));
                    this.addEditEventLatestTime(GoNorth.BindingHandlers.buildTimeObject(0, 0));
                    this.addEditEventTargetState("");
                    this.eventToEdit(null);
                    this.showAddEditEventDialog(true);
                },

                /**
                 * Opens the edit event dialog
                 * @param {object} eventObj Event object to edit
                 */
                openEditEventDialog: function(eventObj) {
                    this.addEditEventEnabledByDefault(eventObj.enabledByDefault());
                    this.addEditEventEarliestTime(GoNorth.BindingHandlers.buildTimeObject(eventObj.earliestTime().hours, eventObj.earliestTime().minutes));
                    this.addEditEventLatestTime(GoNorth.BindingHandlers.buildTimeObject(eventObj.latestTime().hours, eventObj.latestTime().minutes));
                    this.addEditEventTargetState(eventObj.targetState());
                    this.eventToEdit(eventObj);
                    this.showAddEditEventDialog(true);
                },

                /**
                 * Opens the edit event script dialog
                 * @param {object} eventObj Event object
                 */
                openEditEventScriptDialog: function(eventObj) {
                    if(eventObj.scriptType == GoNorth.DailyRoutines.ScriptTypes.nodeGraph)
                    {
                        this.nodeScriptDialog.openEditDialog(eventObj.scriptName(), eventObj.scriptNodeGraph).done(function(result) {
                            eventObj.scriptName(result.name);
                            eventObj.scriptNodeGraph = result.graph;
                        });
                    }
                    else if(eventObj.scriptType == GoNorth.DailyRoutines.ScriptTypes.codeScript)
                    {
                        this.codeScriptDialog.openEditDialog(eventObj.scriptName(), eventObj.scriptCode).done(function(result) {
                            eventObj.scriptName(result.name);
                            eventObj.scriptCode = result.code;
                        });
                    }
                },

                /**
                 * Closes the add/edit event dialog
                 */
                closeAddEditEventDialog: function() {
                    this.showAddEditEventDialog(false);
                },


                /**
                 * Opens the remove event dialog
                 * @param {object} eventObj Event object to remove
                 */
                openRemoveEventDialog: function(eventObj) {
                    this.showConfirmRemoveEventDialog(true);
                    this.eventToRemove = eventObj;
                },

                /**
                 * Removes the event to delete
                 */
                removeEvent: function() {
                    if(this.eventToRemove) {
                        this.dailyRoutineEvents.remove(this.eventToRemove);
                    }

                    this.closeConfirmRemoveEventDialog();
                },

                /**
                 * Closes the confirm remove event dialog
                 */
                closeConfirmRemoveEventDialog: function() {
                    this.showConfirmRemoveEventDialog(false);
                    this.eventToRemove = null;
                },


                /**
                 * Compare function for the daily routines array
                 * @param {object} event1 Daily routines event 1
                 * @param {object} event2 Daily routines event 2
                 * @returns {number} Compare value
                 */
                compareTimeEvents: function(event1, event2) {
                    var d1 = event1.earliestTime();
                    var d2 = event2.earliestTime();

                    return GoNorth.BindingHandlers.compareTimes(d1, d2);                    
                },


                /**
                 * Toggles the display of disabled events
                 */
                toogleShowDisabledEvents: function() {
                    this.showDisabledEvents(!this.showDisabledEvents());
                }
            };

        }(Kortisto.Npc = Kortisto.Npc || {}));
    }(GoNorth.Kortisto = GoNorth.Kortisto || {}));
}(window.GoNorth = window.GoNorth || {}));