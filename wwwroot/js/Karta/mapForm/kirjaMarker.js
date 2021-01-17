(function(GoNorth) {
    "use strict";
    (function(Karta) {
        (function(Map) {

            /**
             * Kirja Marker
             * 
             * @param {object} pageId Id of the kirja page
             * @param {string} pageName Name of the page
             * @param {object} latLng Coordinates of the marker
             * @class
             */
            Map.KirjaMarker = function(pageId, pageName, latLng) 
            {
                Map.BaseMarker.apply(this);

                this.pageId = pageId;
                this.pageName = pageName;

                this.isTrackingImplementationStatus = false;

                this.serializePropertyName = "KirjaMarker";

                this.initMarker(latLng);
            }

            Map.KirjaMarker.prototype = jQuery.extend({ }, Map.BaseMarker.prototype)

            /**
             * Returns the icon url
             * 
             * @return {string} Icon Url
             */
            Map.KirjaMarker.prototype.getIconUrl = function() {
                return "/img/karta/kirjaMarker.png";
            }

            /**
             * Returns the icon retina url
             * 
             * @return {string} Icon Retina Url
             */
            Map.KirjaMarker.prototype.getIconRetinaUrl = function() {
                return "/img/karta/kirjaMarker_2x.png";
            }

            /**
             * Returns the icon label
             * 
             * @returns {string} Icon Label
             */
            Map.KirjaMarker.prototype.getIconLabel = function() {
                return this.pageName;
            }

            /**
             * Loads the content
             * 
             * @returns {jQuery.Deferred} Deferred
             */
            Map.KirjaMarker.prototype.loadContent = function() {
                var def = new jQuery.Deferred();

                var self = this;
                GoNorth.HttpClient.get("/api/KirjaApi/Page?id=" + this.pageId).done(function(pageContent) {
                    var pageHtml = "<h4><a href='/Kirja?id=" + self.pageId + "' target='_blank'>" + pageContent.name + "</a></h4>";
                    pageHtml += "<div class='gn-kartaPopupContent'>" + pageContent.content + "</div>";

                    def.resolve(pageHtml);
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
            Map.KirjaMarker.prototype.serialize = function(map) {
                var serializedObject = this.serializeBaseData(map);
                serializedObject.pageId = this.pageId;
                serializedObject.pageName = this.pageName;
                return serializedObject;
            }

        }(Karta.Map = Karta.Map || {}));
    }(GoNorth.Karta = GoNorth.Karta || {}));
}(window.GoNorth = window.GoNorth || {}));