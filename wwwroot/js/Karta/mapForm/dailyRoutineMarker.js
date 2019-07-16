(function(GoNorth) {
    "use strict";
    (function(Karta) {
        (function(Map) {

            /**
             * Daily Routine Marker
             * 
             * @param {object} latLng Coordinates of the marker
             * @param {object} routineEvent Daily routine event
             * @class
             */
            Map.DailyRoutineMarker = function(latLng, routineEvent) 
            {
                Map.BaseMarker.apply(this);

                this.routineEvent = routineEvent

                this.isTrackingImplementationStatus = false;
                this.serializePropertyName = "DailyRoutineMarker";

                this.disableCopyLink = true;
                this.disableGeometryEditing = true;

                this.initMarker(latLng);
            }

            Map.DailyRoutineMarker.prototype = jQuery.extend({ }, Map.BaseMarker.prototype)

            /**
             * Returns the icon url
             * 
             * @return {string} Icon Url
             */
            Map.DailyRoutineMarker.prototype.getIconUrl = function() {
                return this.routineEvent.enabledByDefault() ? "/img/karta/dailyRoutineMarker.png" : "/img/karta/dailyRoutineMarkerDisabled.png";
            }

            /**
             * Returns the icon retina url
             * 
             * @return {string} Icon Retina Url
             */
            Map.DailyRoutineMarker.prototype.getIconRetinaUrl = function() {
                return this.routineEvent.enabledByDefault() ? "/img/karta/dailyRoutineMarker_2x.png" : "/img/karta/dailyRoutineMarkerDisabled_2x.png" ;
            }

            /**
             * Returns the icon label
             * 
             * @returns {string} Icon Label
             */
            Map.DailyRoutineMarker.prototype.getIconLabel = function() {
                var label = this.routineEvent.movementTarget.name;
                if(!this.routineEvent.enabledByDefault()) {
                    label += " (" + GoNorth.DailyRoutines.Util.formatTimeSpan(Map.Localization.TimeFormat, this.routineEvent.earliestTime(), this.routineEvent.latestTime()) + ")";
                }
                return label;
            }

            /**
             * Loads the content
             * 
             * @returns {jQuery.Deferred} Deferred
             */
            Map.DailyRoutineMarker.prototype.loadContent = function() {
                var def = new jQuery.Deferred();

                // setTimeout is required to prevent the content to be overwritten with loading circle again
                var self = this;
                setTimeout(function() {
                    var dailyRoutineHtml = "<h4>" + jQuery("<div></div>").text(self.routineEvent.movementTarget.name).html() + "</h4>";
                    var contentHtml = "<span class='gn-kartaDailyRoutinePopupLabel'>" + Map.Localization.RandomTimeFrame + ":</span> " + GoNorth.DailyRoutines.Util.formatTimeSpan(Map.Localization.TimeFormat, self.routineEvent.earliestTime(), self.routineEvent.latestTime()) + "<br/>";
                    contentHtml += "<span class='gn-kartaDailyRoutinePopupLabel'>" + Map.Localization.TargetState + ":</span> " + self.routineEvent.targetState() + "<br/>";
                    contentHtml += "<span class='gn-kartaDailyRoutinePopupLabel'>" + Map.Localization.ScriptOnTargetReached + ":</span> " + self.routineEvent.scriptName() + "<br/>";
                    contentHtml += "<span class='gn-kartaDailyRoutinePopupLabel'>" + Map.Localization.EnabledByDefault + ":</span> " + (self.routineEvent.enabledByDefault() ? Map.Localization.Yes : Map.Localization.No) + "<br/>";
                    dailyRoutineHtml +=  "<div class='gn-kartaPopupContent'>" + contentHtml + "</div>";
                    def.resolve(dailyRoutineHtml);
                }, 1);

                return def.promise();
            }

            /**
             * Serializes the marker
             * 
             * @param {object} map Map
             * @returns {object} Serialized data
             */
            Map.DailyRoutineMarker.prototype.serialize = function(map) {
                var serializedObject = this.serializeBaseData(map);
                return serializedObject;
            }

        }(Karta.Map = Karta.Map || {}));
    }(GoNorth.Karta = GoNorth.Karta || {}));
}(window.GoNorth = window.GoNorth || {}));