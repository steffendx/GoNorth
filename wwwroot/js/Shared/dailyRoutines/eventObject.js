(function(GoNorth) {
    "use strict";
    (function(DailyRoutines) {
        
        /**
         * Daily Routine event types
         */
        DailyRoutines.ScriptTypes = {
            none: -1,
            nodeGraph: 0,
            codeScript: 1
        };

        /**
         * Daily Routine event types. If these are changed, please make sure that the script types in the choose script type dialog are matching.
         */
        DailyRoutines.EventTypes = {
            movement: 0,
            script: 1
        };

        /**
         * Creates a movement target
         * @param {string} mapId If of the map for which the movement target is valid
         * @param {string} name Name of the target
         * @param {string} exportName Export name of the target
         * @param {number} lat Latitude
         * @param {number} lng Longitude
         * @returns {object} Movement target
         */
        DailyRoutines.createMovementTarget = function(mapId, name, exportName, lat, lng) {
            return {
                mapId: mapId,
                name: name,
                exportName: exportName,
                lat: lat,
                lng: lng
            }
        };
        
        /**
         * Creates a new event
         * @param {number} eventType Event Type
         * @param {object} earliestTime Earliest Time at which the event should occure
         * @param {object} latestTime Latest Time at which the event should occure
         * @param {object} movementTarget Movement target
         * @param {string} targetState Target state of the npc upon arriving at the destination
         * @param {number} scriptType Type of the script to run on arrival of the target or upon triggering the event
         * @param {string} scriptName Name of the script
         * @param {object} scriptNodeGraph Script Nodegraph
         * @param {string} scriptCode Script code
         * @param {boolean} enabledByDefault true if the event should be enabled by default
         */
        DailyRoutines.createRoutineEvent = function (eventType, earliestTime, latestTime, movementTarget, targetState, scriptType, scriptName, scriptNodeGraph, scriptCode, enabledByDefault) {
            return {
                eventId: null,
                eventType: eventType,
                earliestTime: new ko.observable(GoNorth.BindingHandlers.buildTimeObject(earliestTime.hours, earliestTime.minutes)),
                latestTime: new ko.observable(GoNorth.BindingHandlers.buildTimeObject(latestTime.hours, latestTime.minutes)),
                movementTarget: movementTarget,
                targetState: new ko.observable(targetState),
                scriptType: scriptType,
                scriptName: new ko.observable(scriptName),
                scriptNodeGraph: scriptNodeGraph,
                scriptCode: scriptCode,
                enabledByDefault: new ko.observable(enabledByDefault)
            };
        };

        /**
         * Serializes a routine event
         * @param {object} eventObj Object to serialize
         * @returns {object} Serialized routine event
         */
        DailyRoutines.serializeRoutineEvent = function(eventObj) {
            return {
                eventId: eventObj.eventId,
                eventType: eventObj.eventType,
                earliestTime: eventObj.earliestTime(),
                latestTime: eventObj.latestTime(),
                movementTarget: eventObj.movementTarget,
                targetState: eventObj.targetState(),
                scriptType: eventObj.scriptType,
                scriptName: eventObj.scriptName(),
                scriptNodeGraph: eventObj.scriptNodeGraph,
                scriptCode: eventObj.scriptCode,
                enabledByDefault: eventObj.enabledByDefault()
            };
        };

        /**
         * Deserializes a daily routine event array
         * @param {object[]} dailyRoutine Daily routine event array
         * @returns {object[]} Deserialized daily routine events
         */
        DailyRoutines.deserializeRoutineEventArray = function(dailyRoutine) {
            if(!dailyRoutine) {
                return [];
            }

            var deserializedEvents = [];
            for(var curEvent = 0; curEvent < dailyRoutine.length; ++curEvent)
            {
                deserializedEvents.push(GoNorth.DailyRoutines.deserializeRoutineEvent(dailyRoutine[curEvent]));
            }

            return deserializedEvents;
        }

        /**
         * Deserializes a routine event
         * @param {object} eventObj Object to serialize
         * @returns {object} Serialized routine event
         */
        DailyRoutines.deserializeRoutineEvent = function(eventObj) {
            var routineObj = DailyRoutines.createRoutineEvent(eventObj.eventType, eventObj.earliestTime, eventObj.latestTime, eventObj.movementTarget, eventObj.targetState, eventObj.scriptType, eventObj.scriptName, 
                                                              eventObj.scriptNodeGraph, eventObj.scriptCode, eventObj.enabledByDefault);
            routineObj.eventId = eventObj.eventId;
            return routineObj;
        };

    }(GoNorth.DailyRoutines = GoNorth.DailyRoutines || {}));
}(window.GoNorth = window.GoNorth || {}));