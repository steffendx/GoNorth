(function(GoNorth) {
    "use strict";
    (function(Karta) {
        (function(Map) {

            if(typeof ko !== "undefined")
            {
                /// Tile Size
                var TileSize = 256;

                /// Pow of two to reach tile size (2^8 = 256)
                var TileSizePowOfTwo = 8;

                /// Default Zoom Level
                var defaultZoom = 2;

                function unwrapIfObservable(obs) {
                    if(ko.isObservable(obs))
                    {
                        return obs();
                    }

                    return obs;
                }

                /**
                 * Initializes the map
                 * @param {object} element Element
                 * @param {object} valueAccessor Value Accessor
                 * @param {object} allBindings All Bindings
                 * @param {object} bindingContext Binding context
                 */
                function initMap(element, valueAccessor, allBindings, bindingContext) {
                    // Get Values
                    var obs = valueAccessor();
                    var urlTemplate = obs;
                    var maxZoom = allBindings.get("mapMaxZoom");
                    var imageWidth = allBindings.get("mapImageWidth");
                    var imageHeight = allBindings.get("mapImageHeight");
                    if(!urlTemplate || !maxZoom || !imageWidth || !imageHeight)
                    {
                        throw "Missing binding values for map";
                    }

                    urlTemplate = unwrapIfObservable(urlTemplate);
                    maxZoom = unwrapIfObservable(maxZoom);
                    imageWidth = unwrapIfObservable(imageWidth);
                    imageHeight = unwrapIfObservable(imageHeight);

                    // Get Map Size
                    var powOfTwoSize = Math.pow(2, maxZoom + TileSizePowOfTwo);
                    var width = 0;
                    var height = 0;
                    if(imageWidth > imageHeight)
                    {
                        width = powOfTwoSize;
                        height = (imageHeight / imageWidth) * powOfTwoSize;
                    }
                    else
                    {
                        height = powOfTwoSize;
                        width = (imageWidth / imageHeight) * powOfTwoSize;
                    }

                    var maxTileCountX = Math.floor(imageWidth / TileSize);
                    var maxTileCountY = Math.floor(imageHeight / TileSize);

                    // Create map
                    if(!ko.bindingHandlers.map.nextMapId)
                    {
                        ko.bindingHandlers.map.nextMapId = 0;
                    }

                    if(!jQuery(element).attr("id"))
                    {
                        jQuery(element).attr("id", "Map_" + ko.bindingHandlers.map.nextMapId)
                        ++ko.bindingHandlers.map.nextMapId;
                    }

                    // Create Tile Layer
                    var map = L.map(jQuery(element).attr("id"));
                    var northEast = map.unproject([width, 0], maxZoom);
                    var southWest = map.unproject([0, height], maxZoom);
                    var tileBounds = new L.LatLngBounds(southWest, northEast);

                    var originalUrlTemplate = urlTemplate;
                    urlTemplate = urlTemplate.replace("{maxZoom}", maxZoom);
                    urlTemplate = urlTemplate.replace("{maxTileCountX}", maxTileCountX);
                    urlTemplate = urlTemplate.replace("{maxTileCountY}", maxTileCountY);

                    L.tileLayer(urlTemplate, {
                        maxZoom: maxZoom,
                        crs: L.CRS.Simple,
                        noWrap: true,
                        bounds: tileBounds
                    }).addTo(map);

                    // Set Map Bounds to ensure that user only scrolls in image
                    var mapNorthEast = map.unproject([imageWidth, 0], maxZoom);
                    var mapSouthWest = map.unproject([0, imageHeight], maxZoom);
                    var mapTileBounds = new L.LatLngBounds(mapSouthWest, mapNorthEast);
                    map.setMaxBounds(mapTileBounds);

                    var mapCenter = map.unproject([imageWidth * 0.5, imageHeight * 0.5], 0);
                    map.setView(mapCenter, Math.min(defaultZoom, maxZoom));

                    if(ko.isObservable(obs)) 
                    {
                        obs._map = map;
                        obs._mapTemplateUrl = originalUrlTemplate;
                    }

                    // Event Binding
                    var clickHandler = allBindings.get("mapClick");
                    if(clickHandler)
                    {
                        map.on("click", function(e) {
                            clickHandler.apply(bindingContext.$data, [ map, e.latlng ])
                        });
                    }

                    var readyHandler = allBindings.get("mapReady");
                    if(readyHandler)
                    {
                        readyHandler.apply(bindingContext.$data, [ map ]);
                    }
                }

                /**
                 * Map Binding Handler
                 */
                ko.bindingHandlers.map = {
                    init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
                    },
                    update: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
                        var obs = valueAccessor();
                        var urlTemplate = unwrapIfObservable(obs);
                        if(obs._mapTemplateUrl && obs._mapTemplateUrl == urlTemplate)
                        {
                            return;
                        }

                        if(obs._map)
                        {
                            obs._map.remove();
                            obs._map = null;
                        }

                        initMap(element, valueAccessor, allBindings, bindingContext);
                    }
                }
            }

        }(Karta.Map = Karta.Map || {}));
    }(GoNorth.Karta = GoNorth.Karta || {}));
}(window.GoNorth = window.GoNorth || {}));