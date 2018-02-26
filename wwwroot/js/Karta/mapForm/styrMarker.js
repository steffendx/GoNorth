(function(GoNorth) {
    "use strict";
    (function(Karta) {
        (function(Map) {

            /**
             * Styr Marker
             * 
             * @param {object} itemId Id of the Item
             * @param {object} latLng Coordinates of the marker
             * @class
             */
            Map.StyrMarker = function(itemId, latLng) 
            {
                Map.BaseMarker.apply(this);
                
                this.itemId = itemId;

                this.isTrackingImplementationStatus = true;

                this.serializePropertyName = "ItemMarker";

                this.initMarker(latLng);
            }

            Map.StyrMarker.prototype = jQuery.extend({ }, Map.BaseMarker.prototype)

            /**
             * Returns the icon url
             * 
             * @return {string} Icon Url
             */
            Map.StyrMarker.prototype.getIconUrl = function() {
                return "/img/karta/styrMarker.png";
            }

            /**
             * Returns the icon retina url
             * 
             * @return {string} Icon Retina Url
             */
            Map.StyrMarker.prototype.getIconRetinaUrl = function() {
                return "/img/karta/styrMarker_2x.png";
            }

            /**
             * Loads the content
             * 
             * @returns {jQuery.Deferred} Deferred
             */
            Map.StyrMarker.prototype.loadContent = function() {
                var def = new jQuery.Deferred();

                var self = this;
                jQuery.ajax({
                    url: "/api/StyrApi/FlexFieldObject?id=" + this.itemId
                }).done(function(item) {
                    var itemHtml = "<h4><a href='/Styr/Item#id=" + self.itemId + "' target='_blank'>" + item.name + "</a></h4>";
                    if(item.imageFile)
                    {
                        itemHtml += "<div class='gn-kartaPopupImageContainer'><img class='gn-kartaPopupImage' src='/api/StyrApi/FlexFieldObjectImage?imageFile=" + encodeURIComponent(item.imageFile) + "'/></div>";
                    }

                    def.resolve(itemHtml);
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
            Map.StyrMarker.prototype.serialize = function() {
                var serializedObject = this.serializeBaseData();
                serializedObject.itemId = this.itemId;
                return serializedObject;
            }

        }(Karta.Map = Karta.Map || {}));
    }(GoNorth.Karta = GoNorth.Karta || {}));
}(window.GoNorth = window.GoNorth || {}));