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
                
                /// Url Latitude
                var urlLat = null;

                /// Url Longitude
                var urlLong = null;

                /// Url Zoom
                var urlZoom = null;

                /**
                 * Reads the url map locations
                 */
                GoNorth.Karta.Map.readUrlMapLocations = function() {
                    urlLat = parseFloat(GoNorth.Util.getParameterFromUrl("mapLat"));
                    urlLong = parseFloat(GoNorth.Util.getParameterFromUrl("mapLong"));
                    urlZoom = parseInt(GoNorth.Util.getParameterFromUrl("mapZoom"));
                }
                GoNorth.Karta.Map.readUrlMapLocations();

                /**
                 * Unwraps an observable
                 * @param {object} obs Observable or value
                 * @returns {object} Value of the observable
                 */
                function unwrapIfObservable(obs) {
                    if(ko.isObservable(obs))
                    {
                        return obs();
                    }

                    return obs;
                }

                /**
                 * Removes dangling events from leaflet that get not correctly removed
                 * @param {object} domElement Dom Element
                 * @param {object} inputObj Input object
                 * @param {boolean} checkPrefix true to check the prefix, else false
                 */
                function removeDanglingEvents(domElement, inputObj, checkPrefix)
                {
                    if(inputObj !== null)
                    {
                        var msPointer = L.Browser.msPointer;
                        var POINTER_DOWN   = msPointer ? 'MSPointerDown'   : 'pointerdown';
                        var POINTER_MOVE   = msPointer ? 'MSPointerMove'   : 'pointermove';
                        var POINTER_UP     = msPointer ? 'MSPointerUp'     : 'pointerup';
                        var POINTER_CANCEL = msPointer ? 'MSPointerCancel' : 'pointercancel';

                        for(var prop in inputObj)
                        {
                            var prefixOk = checkPrefix ? prop.indexOf('_leaflet_') !== -1 : true, propVal; 
                            if(inputObj.hasOwnProperty(prop) && prefixOk)
                            {
                                var evt = []; 
                                if(prop.indexOf('touchstart') !== -1) 
                                {
                                    evt = [ POINTER_DOWN ];
                                }
                                else if(prop.indexOf('touchmove') !== -1)
                                {
                                    evt = [ POINTER_MOVE ];
                                }
                                else if(prop.indexOf('touchend') !== -1)
                                {
                                    evt = [ POINTER_UP, POINTER_CANCEL ];
                                }

                                propVal = inputObj[prop];
                                if(evt.length > 0 && typeof propVal === 'function')
                                {
                                    for(var curEvent = 0; curEvent < evt.length; ++curEvent)
                                    {
                                        domElement.removeEventListener(evt[curEvent], propVal, false);
                                    }                 
                                }

                                inputObj[prop] = null;
                                delete inputObj[prop];
                            }
                        }
                    }        
                };

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
                    var mapZoom = defaultZoom;

                    if(urlLat != null && urlLong != null && !isNaN(urlLat) && !isNaN(urlLong))
                    {
                        mapCenter = new L.LatLng(urlLat, urlLong);
                        urlLat = null;
                        urlLong = null;
                    }
                    if(urlZoom != null && !isNaN(urlZoom))
                    {
                        mapZoom = urlZoom;
                        urlZoom = null;
                    }

                    map.setView(mapCenter, Math.min(mapZoom, maxZoom));

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

                    GoNorth.Karta.Map.refreshUrlMapLocations = function() {
                        var urlParams = "mapLat=" + map.getCenter().lat;
                        urlParams += "&mapLong=" + map.getCenter().lng;
                        urlParams += "&mapZoom=" + map.getZoom();

                        var finalParams = window.location.search;
                        if(finalParams) 
                        {
                            finalParams = finalParams.replace(/mapLat=.*?&mapLong=.*?&mapZoom=.*?(&|$)/i, "");
                            if(finalParams[finalParams.length - 1] != "&")
                            {
                                finalParams += "&";
                            }
                            finalParams += urlParams;
                        }
                        else
                        {
                            finalParams = "?" + urlParams;
                        }

                        window.history.replaceState(finalParams, null, finalParams)
                    };

                    map.on("zoomend moveend", function() {
                        GoNorth.Karta.Map.refreshUrlMapLocations();
                    });

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
                            // Some events are not removed by leaflet itself, must be done here to prevent errors
                            removeDanglingEvents(element, element._leaflet_events, false);
                            removeDanglingEvents(element, element, true);
                            obs._map = null;
                        }

                        initMap(element, valueAccessor, allBindings, bindingContext);
                    }
                }
            }

        }(Karta.Map = Karta.Map || {}));
    }(GoNorth.Karta = GoNorth.Karta || {}));
}(window.GoNorth = window.GoNorth || {}));