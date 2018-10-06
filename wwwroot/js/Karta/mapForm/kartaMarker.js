(function(GoNorth) {
    "use strict";
    (function(Karta) {
        (function(Map) {

            /**
             * Karta Marker
             * 
             * @param {object} mapId Id of the karta map
             * @param {string} mapName Name of the karta map
             * @param {object} latLng Coordinates of the marker
             * @class
             */
            Map.KartaMarker = function(mapId, mapName, latLng) 
            {
                Map.BaseMarker.apply(this);

                this.mapChangeId = mapId;
                this.mapName = mapName;

                this.isTrackingImplementationStatus = true;

                this.serializePropertyName = "MapChangeMarker";

                this.initMarker(latLng);
            }

            Map.KartaMarker.prototype = jQuery.extend({ }, Map.BaseMarker.prototype);

            /**
             * Returns the icon url
             * 
             * @return {string} Icon Url
             */
            Map.KartaMarker.prototype.getIconUrl = function() {
                return "/img/karta/kartaMarker.png";
            }

            /**
             * Returns the icon retina url
             * 
             * @return {string} Icon Retina Url
             */
            Map.KartaMarker.prototype.getIconRetinaUrl = function() {
                return "/img/karta/kartaMarker_2x.png";
            }

            /**
             * Returns the icon label
             * 
             * @returns {string} Icon Label
             */
            Map.KartaMarker.prototype.getIconLabel = function() {
                return this.mapName;
            }

            /**
             * Loads the content
             * 
             * @returns {jQuery.Deferred} Deferred
             */
            Map.KartaMarker.prototype.loadContent = function() {
                var def = new jQuery.Deferred();

                var self = this;
                jQuery.ajax({
                    url: "/api/KartaApi/Map?id=" + this.mapChangeId
                }).done(function(map) {
                    var mapHtml = "<h4><a class='gn-clickable' onclick='GoNorth.Karta.Map.switchToMap(\"" + self.mapChangeId + "\")'>" + map.name + "</a></h4>";

                    def.resolve(mapHtml);
                }).fail(function() {
                    def.reject();
                })

                return def.promise();
            }

            /**
             * Serializes the marker
             * 
             * @param {object} map Map
             * @returns {object} Serialized data
             */
            Map.KartaMarker.prototype.serialize = function(map) {
                var serializedObject = this.serializeBaseData(map);
                serializedObject.mapId = this.mapChangeId;
                serializedObject.mapName = this.mapName;
                return serializedObject;
            }

        }(Karta.Map = Karta.Map || {}));
    }(GoNorth.Karta = GoNorth.Karta || {}));
}(window.GoNorth = window.GoNorth || {}));