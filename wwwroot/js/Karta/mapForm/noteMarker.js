(function(GoNorth) {
    "use strict";
    (function(Karta) {
        (function(Map) {

            /**
             * Note Marker
             * 
             * @param {string} name Name of the marker
             * @param {string} description Description of the marker
             * @param {object} latLng Coordinates of the marker
             * @class
             */
            Map.NoteMarker = function(name, description, latLng) 
            {
                Map.BaseMarker.apply(this);
                
                this.name = name;
                this.description = description;

                this.isTrackingImplementationStatus = true;

                this.serializePropertyName = "NoteMarker";

                this.initMarker(latLng);
            }

            Map.NoteMarker.prototype = jQuery.extend({ }, Map.BaseMarker.prototype)

            /**
             * Returns the icon url
             * 
             * @return {string} Icon Url
             */
            Map.NoteMarker.prototype.getIconUrl = function() {
                return "/img/karta/noteMarker.png";
            }

            /**
             * Returns the icon retina url
             * 
             * @return {string} Icon Retina Url
             */
            Map.NoteMarker.prototype.getIconRetinaUrl = function() {
                return "/img/karta/noteMarker_2x.png";
            }

            /**
             * Returns the icon label
             * 
             * @returns {string} Icon Label
             */
            Map.NoteMarker.prototype.getIconLabel = function() {
                return this.name;
            }

            /**
             * Loads the content
             * 
             * @returns {jQuery.Deferred} Deferred
             */
            Map.NoteMarker.prototype.loadContent = function() {
                var def = new jQuery.Deferred();
        
                // setTimeout is required to prevent the content to be overwritten with loading circle again
                var self = this;
                setTimeout(function() {
                    var noteHtml = "<h4 class='gn-kartaNoteMarkerTitle'>" + jQuery("<div></div>").text(self.name).html() + "</h4>";
                    noteHtml +=  "<div class='gn-kartaPopupContent'>" + jQuery("<div></div>").text(self.description).html() + "</div>";
                    def.resolve(noteHtml);
                }, 1);
                
                return def.promise();
            }

            /**
             * Serializes the marker
             * 
             * @param {object} map Map
             * @returns {object} Serialized data
             */
            Map.NoteMarker.prototype.serialize = function(map) {
                var serializedObject = this.serializeBaseData(map);
                serializedObject.name = this.name;
                serializedObject.description = this.description;
                return serializedObject;
            }

        }(Karta.Map = Karta.Map || {}));
    }(GoNorth.Karta = GoNorth.Karta || {}));
}(window.GoNorth = window.GoNorth || {}));