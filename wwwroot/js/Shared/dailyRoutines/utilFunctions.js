(function(GoNorth) {
    "use strict";
    (function(DailyRoutines) {
        (function(Util) {
        
            /**
             * Formats a timespan
             * @param {string} timeFormat Time format
             * @param {object} earliest Earliest time
             * @param {object} latest Latest time
             * @returns {string} Formatted timespan
             */
            Util.formatTimeSpan = function(timeFormat, earliest, latest) {
                var timeSpanText = "";
                if(earliest) {
                    timeSpanText = GoNorth.Util.formatTime(earliest.hours, earliest.minutes, timeFormat);
                }

                if(latest && (!earliest || earliest.hours != latest.hours || earliest.minutes != latest.minutes))
                {
                    if(timeSpanText) {
                        timeSpanText += " - ";
                    }
                    timeSpanText += GoNorth.Util.formatTime(latest.hours, latest.minutes, timeFormat);
                }

                return timeSpanText;
            };

            /**
             * Keeps two observable for an earliest or latest time in order so that the latest time is never before the earliest and the other way around
             * @param {ko.observable} earliestTime Earliest time observable
             * @param {ko.observable} latestTime Latest time observable
             */
            Util.keepTimeObservablesInOrder = function(earliestTime, latestTime) {
                earliestTime.subscribe(function(newValue) {
                    var latestTimeValue = latestTime();
                    if(!newValue || !latestTimeValue) {
                        return;
                    }

                    if(newValue.hours > latestTimeValue.hours || (newValue.hours == latestTimeValue.hours && newValue.minutes > latestTimeValue.minutes))
                    {
                        latestTime(newValue);
                    }
                });
                latestTime.subscribe(function(newValue) {
                    var earliestTimeValue = earliestTime();
                    if(!newValue || !earliestTimeValue) {
                        return;
                    }

                    if(newValue.hours < earliestTimeValue.hours || (newValue.hours == earliestTimeValue.hours && newValue.minutes < earliestTimeValue.minutes))
                    {
                        earliestTime(newValue);
                    }
                });  
            };

            /**
             * Returns true if any time events overlap
             * @param {object[]} timeEvents Array with time events
             * @returns {boolean} true if any events overlap, else false
             */
            Util.doEventsOverlap = function(timeEvents) {
                for(var curEvent1 = 0; curEvent1 < timeEvents.length; ++curEvent1)
                {
                    if(!timeEvents[curEvent1].enabledByDefault())
                    {
                        continue;
                    }

                    for(var curEvent2 = curEvent1 + 1; curEvent2 < timeEvents.length; ++curEvent2)
                    {
                        if(!timeEvents[curEvent2].enabledByDefault())
                        {
                            continue;
                        }

                        var earliestTimeComp = GoNorth.BindingHandlers.compareTimes(timeEvents[curEvent1].earliestTime(), timeEvents[curEvent2].earliestTime());
                        var latestTimeComp = GoNorth.BindingHandlers.compareTimes(timeEvents[curEvent1].latestTime(), timeEvents[curEvent2].latestTime());
                        var earliestTimeInBetweenComp = GoNorth.BindingHandlers.compareTimes(timeEvents[curEvent1].earliestTime(), timeEvents[curEvent2].latestTime());
                        var latestTimeInBetweenComp = GoNorth.BindingHandlers.compareTimes(timeEvents[curEvent1].latestTime(), timeEvents[curEvent2].earliestTime());
                        if(earliestTimeComp != latestTimeComp || earliestTimeInBetweenComp != latestTimeComp || latestTimeInBetweenComp != earliestTimeComp)
                        {
                            return true;
                        }
                    }
                }

                return false;
            };

        }(DailyRoutines.Util = DailyRoutines.Util || {}));
    }(GoNorth.DailyRoutines = GoNorth.DailyRoutines || {}));
}(window.GoNorth = window.GoNorth || {}));