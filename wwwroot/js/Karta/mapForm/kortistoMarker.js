(function(GoNorth) {
    "use strict";
    (function(Karta) {
        (function(Map) {

            /**
             * Kortisto Marker
             * 
             * @param {object} npcId Id of the Npc
             * @param {object} latLng Coordinates of the marker
             * @class
             */
            Map.KortistoMarker = function(npcId, latLng) 
            {
                Map.BaseMarker.apply(this);
                
                this.npcId = npcId;

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
             * @returns {object} Serialized data
             */
            Map.KortistoMarker.prototype.serialize = function() {
                var serializedObject = this.serializeBaseData();
                serializedObject.npcId = this.npcId;
                return serializedObject;
            }

        }(Karta.Map = Karta.Map || {}));
    }(GoNorth.Karta = GoNorth.Karta || {}));
}(window.GoNorth = window.GoNorth || {}));