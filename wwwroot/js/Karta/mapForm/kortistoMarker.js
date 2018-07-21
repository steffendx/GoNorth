(function(GoNorth) {
    "use strict";
    (function(Karta) {
        (function(Map) {

            /**
             * Kortisto Marker
             * 
             * @param {object} npcId Id of the Npc
             * @param {string} npcName Name of the npc
             * @param {object} latLng Coordinates of the marker
             * @class
             */
            Map.KortistoMarker = function(npcId, npcName, latLng) 
            {
                Map.BaseMarker.apply(this);
                
                this.npcId = npcId;
                this.npcName = npcName;

                this.isTrackingImplementationStatus = true;

                this.serializePropertyName = "NpcMarker";

                this.initMarker(latLng);
            }

            Map.KortistoMarker.prototype = jQuery.extend({ }, Map.BaseMarker.prototype)

            /**
             * Returns the icon url
             * 
             * @return {string} Icon Url
             */
            Map.KortistoMarker.prototype.getIconUrl = function() {
                return "/img/karta/kortistoMarker.png";
            }

            /**
             * Returns the icon retina url
             * 
             * @return {string} Icon Retina Url
             */
            Map.KortistoMarker.prototype.getIconRetinaUrl = function() {
                return "/img/karta/kortistoMarker_2x.png";
            }

            /**
             * Returns the icon label
             * 
             * @returns {string} Icon Label
             */
            Map.KortistoMarker.prototype.getIconLabel = function() {
                return this.npcName;
            }

            /**
             * Loads the content
             * 
             * @returns {jQuery.Deferred} Deferred
             */
            Map.KortistoMarker.prototype.loadContent = function() {
                var def = new jQuery.Deferred();

                var self = this;
                jQuery.ajax({
                    url: "/api/KortistoApi/FlexFieldObject?id=" + this.npcId
                }).done(function(npc) {
                    var npcHtml = "<h4><a href='/Kortisto/Npc#id=" + self.npcId + "' target='_blank'>" + npc.name + "</a></h4>";
                    if(npc.imageFile)
                    {
                        npcHtml += "<div class='gn-kartaPopupImageContainer'><img class='gn-kartaPopupImage' src='/api/KortistoApi/FlexFieldObjectImage?imageFile=" + encodeURIComponent(npc.imageFile) + "'/></div>";
                    }

                    def.resolve(npcHtml);
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
            Map.KortistoMarker.prototype.serialize = function(map) {
                var serializedObject = this.serializeBaseData(map);
                serializedObject.npcId = this.npcId;
                serializedObject.npcName = this.npcName;
                return serializedObject;
            }

        }(Karta.Map = Karta.Map || {}));
    }(GoNorth.Karta = GoNorth.Karta || {}));
}(window.GoNorth = window.GoNorth || {}));