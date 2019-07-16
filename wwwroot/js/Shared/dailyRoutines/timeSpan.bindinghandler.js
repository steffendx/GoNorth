(function(GoNorth) {
    "use strict";
    (function(BindingHandlers) {

        if(typeof ko !== "undefined")
        {

            /**
             * Writes the timespan to an observbale
             * @param {object} element HTML Element
             * @param {string} timeFormat Time format
             * @param {ko.observable} earliestTime Earliest time
             * @param {ko.observable} latestTime Latest time
             */
            function outputTimespan(element, timeFormat, earliestTime, latestTime) {
                var earliest = ko.unwrap(earliestTime);
                var latest = ko.unwrap(latestTime);

                var timeSpanText = GoNorth.DailyRoutines.Util.formatTimeSpan(timeFormat, earliest, latest);
                
                jQuery(element).text(timeSpanText);
            }

            /**
             * Timespan binding handler
             */
            ko.bindingHandlers.timeSpan = {
                init: function (element, valueAccessor, allBindings) {
                    var timeFormat = "hh:mm";
                    if(allBindings.get("timeSpanTimeFormat")) {
                        timeFormat = allBindings.get("timeSpanTimeFormat");
                    }

                    var timeValues = ko.utils.unwrapObservable(valueAccessor());
                    var earliestTime = timeValues.earliestTime;
                    var latestTime = timeValues.latestTime;

                    if(ko.isObservable(earliestTime)) {
                        var earliestSubscription = earliestTime.subscribe(function() {
                            outputTimespan(element, timeFormat, earliestTime, latestTime);
                        });
                        earliestSubscription.disposeWhenNodeIsRemoved(element);
                    }
                    
                    if(ko.isObservable(latestTime)) {
                        var latestSubscription = latestTime.subscribe(function() {
                            outputTimespan(element, timeFormat, earliestTime, latestTime);
                        });
                        latestSubscription.disposeWhenNodeIsRemoved(element);
                    }

                    outputTimespan(element, timeFormat, earliestTime, latestTime);
                },
                update: function (element, valueAccessor, allBindings) {
                }
            }

        }

    }(GoNorth.BindingHandlers = GoNorth.BindingHandlers || {}));
}(window.GoNorth = window.GoNorth || {}));