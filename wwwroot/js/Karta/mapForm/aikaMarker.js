(function(GoNorth) {
    "use strict";
    (function(Karta) {
        (function(Map) {

            /**
             * Aika Marker
             * 
             * @param {object} questId Id of the Quest
             * @param {string} name Name of the marker
             * @param {object} latLng Coordinates of the marker
             * @class
             */
            Map.AikaMarker = function(questId, name, latLng) 
            {
                Map.BaseMarker.apply(this);
                
                this.questId = questId;
                this.name = name;

                this.isTrackingImplementationStatus = true;

                this.serializePropertyName = "QuestMarker";

                this.initMarker(latLng);
            }

            Map.AikaMarker.prototype = jQuery.extend({ }, Map.BaseMarker.prototype)

            /**
             * Returns the icon url
             * 
             * @return {string} Icon Url
             */
            Map.AikaMarker.prototype.getIconUrl = function() {
                return "/img/karta/aikaMarker.png";
            }

            /**
             * Returns the icon retina url
             * 
             * @return {string} Icon Retina Url
             */
            Map.AikaMarker.prototype.getIconRetinaUrl = function() {
                return "/img/karta/aikaMarker_2x.png";
            }

            /**
             * Returns the icon label
             * 
             * @returns {string} Icon Label
             */
            Map.AikaMarker.prototype.getIconLabel = function() {
                return this.name;
            }

            /**
             * Loads the content
             * 
             * @returns {jQuery.Deferred} Deferred
             */
            Map.AikaMarker.prototype.loadContent = function() {
                var def = new jQuery.Deferred();

                var self = this;
                GoNorth.HttpClient.get("/api/AikaApi/GetQuest?id=" + this.questId).done(function(quest) {
                    var questHtml = "<h4><a href='/Aika/Quest?id=" + self.questId + "' target='_blank'>" + quest.name + "</a></h4>";
                    questHtml += "<div class='gn-kartaPopupContent'>" + jQuery("<div></div>").text(self.name).html() + "</div>";

                    def.resolve(questHtml);
                }).fail(function() {
                    def.reject();
                })

                return def.promise();
            }

            /**
             * Serializes the marker
             * 
             * @returns {object} Serialized data
             */
            Map.AikaMarker.prototype.serialize = function() {
                var serializedObject = this.serializeBaseData();
                serializedObject.questId = this.questId;
                serializedObject.name = this.name;
                return serializedObject;
            }

        }(Karta.Map = Karta.Map || {}));
    }(GoNorth.Karta = GoNorth.Karta || {}));
}(window.GoNorth = window.GoNorth || {}));