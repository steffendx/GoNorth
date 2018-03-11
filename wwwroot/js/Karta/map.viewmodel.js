(function(GoNorth) {
    "use strict";
    (function(ImplementationStatus) {
        (function(CompareDialog) {

            /**
             * Compare Dialog View Model
             * @class
             */
            CompareDialog.ViewModel = function()
            {
                this.isOpen = new ko.observable(false);
                this.objectName = new ko.observable("");

                this.isLoading = new ko.observable(false);
                this.errorOccured = new ko.observable(false);

                this.markAsImplementedPromise = null;
                this.flagAsImplementedMethodUrlPostfix = null;

                this.doesSnapshotExists = new ko.observable(false);
                this.difference = new ko.observableArray();
            };

            CompareDialog.ViewModel.prototype = {
                /**
                 * Opens the compare dialog for an npc compare call
                 * 
                 * @param {string} id Id of the npc
                 * @param {string} npcName Name of the npc to display in the title
                 * @returns {jQuery.Deferred} Deferred that will get resolved after the object was marked as implemented
                 */
                openNpcCompare: function(id, npcName) {
                    this.isOpen(true);
                    this.objectName(npcName ? npcName : "");
                    this.flagAsImplementedMethodUrlPostfix = "FlagNpcAsImplemented?npcId=" + id;

                    return this.loadCompareResult("CompareNpc?npcId=" + id);
                },

                /**
                 * Opens the compare dialog for an item compare call
                 * 
                 * @param {string} id Id of the item
                 * @param {string} itemName Name of the item to display in the title
                 * @returns {jQuery.Deferred} Deferred that will get resolved after the object was marked as implemented
                 */
                openItemCompare: function(id, itemName) {
                    this.isOpen(true);
                    this.objectName(itemName ? itemName : "");
                    this.flagAsImplementedMethodUrlPostfix = "FlagItemAsImplemented?itemId=" + id;

                    return this.loadCompareResult("CompareItem?itemId=" + id);
                },

                /**
                 * Opens the compare dialog for a skill compare call
                 * 
                 * @param {string} id Id of the skill
                 * @param {string} skillName Name of the skill to display in the title
                 * @returns {jQuery.Deferred} Deferred that will get resolved after the object was marked as implemented
                 */
                openSkillCompare: function(id, skillName) {
                    this.isOpen(true);
                    this.objectName(skillName ? skillName : "");
                    this.flagAsImplementedMethodUrlPostfix = "FlagSkillAsImplemented?skillId=" + id;

                    return this.loadCompareResult("CompareSkill?skillId=" + id);
                },

                /**
                 * Opens the compare dialog for a dialog compare call
                 * 
                 * @param {string} id Id of the dialog
                 * @param {string} dialogName Name of the dialog to display in the title
                 * @returns {jQuery.Deferred} Deferred that will get resolved after the object was marked as implemented
                 */
                openDialogCompare: function(id, dialogName) {
                    this.isOpen(true);
                    this.objectName(dialogName ? dialogName : "");
                    this.flagAsImplementedMethodUrlPostfix = "FlagDialogAsImplemented?dialogId=" + id;

                    return this.loadCompareResult("CompareDialog?dialogId=" + id);
                },

                /**
                 * Opens the compare dialog for a quest compare call
                 * 
                 * @param {string} id Id of the quest
                 * @param {string} questName Name of the quest to display in the title
                 * @returns {jQuery.Deferred} Deferred that will get resolved after the object was marked as implemented
                 */
                openQuestCompare: function(id, questName) {
                    this.isOpen(true);
                    this.objectName(questName ? questName : "");
                    this.flagAsImplementedMethodUrlPostfix = "FlagQuestAsImplemented?questId=" + id;

                    return this.loadCompareResult("CompareQuest?questId=" + id);
                },
                
                /**
                 * Opens the compare dialog for a marker compare call
                 * 
                 * @param {string} mapId Id of the map
                 * @param {string} markerId Id of the marker
                 * @param {string} markerType Type of the marker
                 * @returns {jQuery.Deferred} Deferred that will get resolved after the object was marked as implemented
                 */
                openMarkerCompare: function(mapId, markerId, markerType) {
                    this.isOpen(true);
                    this.objectName("");
                    this.flagAsImplementedMethodUrlPostfix = "FlagMarkerAsImplemented?mapId=" + mapId + "&markerId=" + markerId + "&markerType=" + markerType;

                    return this.loadCompareResult("CompareMarker?mapId=" + mapId + "&markerId=" + markerId + "&markerType=" + markerType);
                },


                /**
                 * Loads a compare result
                 * 
                 * @param {string} urlPostfix Postfix for the url
                 */
                loadCompareResult: function(urlPostfix) {
                    this.isLoading(true);
                    this.errorOccured(false);
                    this.difference([]);
                    var self = this;
                    jQuery.ajax({ 
                        url: "/api/ImplementationStatusApi/" + urlPostfix, 
                        type: "GET"
                    }).done(function(compareResult) {
                        self.isLoading(false);
                        self.addExpandedObservable(compareResult.compareDifference);
                        self.doesSnapshotExists(compareResult.doesSnapshotExist);
                        if(compareResult.compareDifference)
                        {
                            self.difference(compareResult.compareDifference);
                        }
                    }).fail(function() {
                        self.isLoading(false);
                        self.errorOccured(true);
                    });

                    this.markAsImplementedPromise = new jQuery.Deferred();
                    return this.markAsImplementedPromise.promise();
                },

                /**
                 * Adds the expanded observable to all compare results
                 * 
                 * @param {object[]} compareResults Compare REsults to which the expanded observable must be added
                 */
                addExpandedObservable: function(compareResults) {
                    if(!compareResults)
                    {
                        return;
                    }

                    for(var curResult = 0; curResult < compareResults.length; ++curResult)
                    {
                        compareResults[curResult].isExpanded = new ko.observable(true);
                        this.addExpandedObservable(compareResults[curResult].subDifferences);
                    }
                },

                /**
                 * Toggles a compare result to be epanded or not
                 * 
                 * @param {object} compareResult Compare Result
                 */
                toggleCompareResultExpanded: function(compareResult) {
                    compareResult.isExpanded(!compareResult.isExpanded());
                },


                /**
                 * Marks the object for which the dialog is opened as implemented
                 */
                markAsImplemented: function() {
                    this.isLoading(true);
                    this.errorOccured(false);
                    var self = this;
                    jQuery.ajax({ 
                        url: "/api/ImplementationStatusApi/" + this.flagAsImplementedMethodUrlPostfix, 
                        headers: GoNorth.Util.generateAntiForgeryHeader(),
                        type: "POST"
                    }).done(function() {
                        self.isLoading(false);
                        self.isOpen(false);

                        if(window.refreshImplementationStatusList)
                        {
                            window.refreshImplementationStatusList();
                        }

                        self.markAsImplementedPromise.resolve();
                    }).fail(function() {
                        self.isLoading(false);
                        self.errorOccured(true);
                    });
                },

                /**
                 * Closes the dialog
                 */
                closeDialog: function() {
                    this.isOpen(false);
                }
            };

        }(ImplementationStatus.CompareDialog = ImplementationStatus.CompareDialog || {}));
    }(GoNorth.ImplementationStatus = GoNorth.ImplementationStatus || {}));
}(window.GoNorth = window.GoNorth || {}));
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
                    map.setView(mapCenter, 0);

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
(function(GoNorth) {
    "use strict";
    (function(Karta) {
        (function(Map) {

            /// Popup max width
            var popupMaxWidth = 600;

            /**
             * Base Karta Marker
             * 
             * @class
             */
            Map.BaseMarker = function() 
            {
                this.marker = null;
                this.id = "";
                this.mapId = "";
                this.editCallback = null;
                this.deleteCallback = null;

                this.isDisabled = false;

                this.chapterPixelCoords = [];
                this.addedInChapter = -1;
                this.deletedInChapter = -1;

                this.isTrackingImplementationStatus = false;
                this.isImplemented = false;

                this.markerType = "";

                this.serializePropertyName = "";

                this.compareDialog = null;

                this.popupContentObject = null;
            }

            Map.BaseMarker.prototype = {
                /**
                 * Returns the icon url
                 * 
                 * @return {string} Icon Url
                 */
                getIconUrl: function() {
                    return "";
                },

                /**
                 * Returns the icon retina url
                 * 
                 * @return {string} Icon Retina Url
                 */
                getIconRetinaUrl: function() {
                    return "";
                },

                /**
                 * Initializes the marker
                 * 
                 * @param {object} latLng Coordinates of the marker
                 */
                initMarker: function(latLng) {

                    var markerIcon = new L.Icon({
                        iconUrl: this.getIconUrl(),
                        iconRetinaUrl: this.getIconRetinaUrl(),
                        shadowUrl: "/img/karta/markerShadow.png",

                        iconAnchor: [ 12, 41 ],
                        iconSize: [ 25, 41 ],
                        popupAnchor: [ 1, -43 ],
                        shadowSize: [ 41, 41 ],
                        tooltipAnchor: [ 16, -28 ]
                    });

                    this.marker = L.marker(latLng, { draggable: !this.isDisabled, icon: markerIcon });
                    
                    var self = this;
                    this.marker.bindPopup(function() {
                        self.loadContent().done(function(content) {
                            if(!self.isDisabled)
                            {
                                content += "<div class='gn-kartaPopupButtons'>";
                                if(self.editCallback)
                                {
                                    content += "<a class='gn-clickable gn-kartaEditMarkerButton' title='" + Map.Localization.EditMarkerTooltip + "'><i class='glyphicon glyphicon-pencil'></i></a>";
                                }
                                if(self.isTrackingImplementationStatus && Map.hasImplementationStatusTrackerRights)
                                {
                                    var implementedIcon = "glyphicon-remove";
                                    var implementedIconCss = "gn-clickable text-danger";
                                    var implementedTooltip = Map.Localization.MarkerIsNotImplementedTooltip;
                                    if(self.isImplemented)
                                    {
                                        implementedIcon = "glyphicon-ok";
                                        implementedIconCss = "text-success";
                                        implementedTooltip = Map.Localization.MarkerIsImplementedTooltip;
                                    }
                                    content += "<a class='gn-kartaMarkAsImplementedMarkerButton " + implementedIconCss + "' title='" + implementedTooltip + "'><i class='glyphicon " + implementedIcon + "'></i></a>";    
                                }
                                content += "<a class='gn-clickable gn-kartaDeleteMarkerButton' title='" + Map.Localization.DeleteMarkerTooltip + "'><i class='glyphicon glyphicon-trash'></i></a>";
                                content += "</div>";
                            }
                            content = "<div>" + content + "</div>";

                            var jQueryContent = jQuery(content);
                            jQueryContent.find(".gn-kartaEditMarkerButton").click(function() {
                                self.callEdit();
                            });

                            jQueryContent.find(".gn-kartaDeleteMarkerButton").click(function() {
                                self.callDelete();
                            });

                            jQueryContent.find(".gn-kartaMarkAsImplementedMarkerButton").click(function() {
                                self.openCompareDialog(jQueryContent);
                            });
                            
                            self.popupContentObject = jQueryContent;
                            self.setPopupContent(jQueryContent[0]);
                        }).fail(function() {
                            self.setPopupContent("<i class='glyphicon glyphicon-warning-sign text-danger' title='" + Map.Localization.ErrorOccured + "'></i>");
                        });

                        return "<i class='glyphicon glyphicon-refresh spinning'></i>";
                    }, 
                    {
                        maxWidth: popupMaxWidth
                    });
                },

                /**
                 * Sets the content of the popup
                 * 
                 * @param {string} content Content of the poup
                 */
                setPopupContent: function(content) {
                    var popup = this.marker.getPopup();
                    popup.setContent(content);
                    popup.update();
                },

                /**
                 * Zooms on the marker
                 * 
                 * @param {object} map Map for zooming
                 */
                zoomOn: function(map) {
                    if(!this.marker)
                    {
                        return;
                    }

                    this.marker.openPopup();
                    
                    var latLngs = [ this.marker.getLatLng() ];
                    var markerBounds = L.latLngBounds(latLngs);
                    map.fitBounds(markerBounds);
                },

                /**
                 * Sets the type of the marker
                 * 
                 * @param {string} markerType Marker Type
                 */
                setMarkerType: function(markerType) {
                    this.markerType = markerType;
                },

                /**
                 * Sets the map id to which the marker belongs
                 * 
                 * @param {string} mapId Id of the map to which the marker belongs
                 */
                setMapId: function(mapId) {
                    this.mapId = mapId;
                },

                /**
                 * Sets the compare dialog
                 * 
                 * @param {object} compareDialog Compare Dialog
                 */
                setCompareDialog: function(compareDialog) {
                    this.compareDialog = compareDialog;
                },

                /**
                 * Flags the marker as not implemented
                 */
                flagAsNotImplemented: function() {
                    if(!this.isImplemented)
                    {
                        return;
                    }

                    this.isImplemented = false;

                    if(this.popupContentObject != null)
                    {
                        this.popupContentObject.find(".gn-kartaMarkAsImplementedMarkerButton").removeClass("text-success").addClass("text-danger gn-clickable").prop("title", Map.Localization.MarkerIsNotImplementedTooltip);
                        this.popupContentObject.find(".gn-kartaMarkAsImplementedMarkerButton > i").removeClass("glyphicon-ok").addClass("glyphicon-remove");
                    }
                },

                /**
                 * Opens the compare dialog
                 * 
                 * @param {object} popupContent jQuery Content Object of the marker to switch the button after flagging as implemented
                 */
                openCompareDialog: function(popupContent) {
                    if(this.isImplemented)
                    {
                        return;
                    }

                    var self = this;
                    this.compareDialog.openMarkerCompare(this.mapId, this.id, this.markerType).done(function() {
                        self.isImplemented = true;
                        popupContent.find(".gn-kartaMarkAsImplementedMarkerButton").removeClass("text-danger gn-clickable").addClass("text-success").prop("title", Map.Localization.MarkerIsImplementedTooltip);
                        popupContent.find(".gn-kartaMarkAsImplementedMarkerButton > i").removeClass("glyphicon-remove").addClass("glyphicon-ok");
                    });
                },


                /**
                 * Loads the content
                 * 
                 * @returns {jQuery.Deferred} Deferred
                 */
                loadContent: function() {
                    var def = new jQuery.Deferred();
                    def.resolve("");

                    return def.promise();
                },


                /**
                 * Sets the id id of the marker
                 * 
                 * @param {string} id Id of the marker
                 */
                setId: function(id) {
                    this.id = id;
                },

                /**
                 * Sets the pixel coords of the marker
                 * 
                 * @param {float} x X-Coordinate
                 * @param {float} y Y-Coordinate
                 */
                setPixelCoords: function(x, y) {
                    this.x = x;
                    this.y = y;
                },

                /**
                 * Sets the pixel coords of the marker for a given chapter
                 * 
                 * @param {int} chapterNumber Number of the chapter
                 * @param {float} x X-Coordinate
                 * @param {float} y Y-Coordinate
                 */
                setChapterPixelCoords: function(chapterNumber, x, y) {
                    if(!this.chapterPixelCoords) {
                        this.chapterPixelCoords = [];
                    }
                    
                    for(var curCoords = 0; curCoords < this.chapterPixelCoords.length; ++curCoords)
                    {
                        if(this.chapterPixelCoords[curCoords].chapterNumber == chapterNumber)
                        {
                            this.chapterPixelCoords[curCoords].x = x;
                            this.chapterPixelCoords[curCoords].y = y;
                            return;
                        }
                    }

                    this.chapterPixelCoords.push({
                        chapterNumber: chapterNumber,
                        x: x,
                        y: y
                    });
                    this.chapterPixelCoords.sort(function(p1, p2) {
                        return p1.chapterNumber - p2.chapterNumber
                    });
                },

                /**
                 * Adjusts the position of the marker to a chapter
                 * 
                 * @param {int} chapterNumber Number of the chapter to adjust to
                 * @param {object} map Map object for calculating lat long
                 */
                adjustPositionToChapter: function(chapterNumber, map) {
                    if(!this.marker || !this.chapterPixelCoords || this.chapterPixelCoords.length == 0)
                    {
                        return;
                    }
                    
                    var x = this.x;
                    var y = this.y;
                    
                    for(var curCoords = 0; curCoords < this.chapterPixelCoords.length; ++curCoords)
                    {
                        if(this.chapterPixelCoords[curCoords].chapterNumber <= chapterNumber)
                        {
                            x = this.chapterPixelCoords[curCoords].x;
                            y = this.chapterPixelCoords[curCoords].y;
                        }
                    }

                    // Adjust position
                    var latLng = map.unproject([ x, y ], map.getMaxZoom());
                    this.marker.setLatLng(latLng);
                },

                /**
                 * Sets the chapter in which the marker was added for non default chapter
                 * 
                 * @param {int} chapterNumber Number of the chapter in which the marker was added
                 */
                setAddedInChapter: function(chapterNumber) {
                    this.addedInChapter = chapterNumber;
                },
                
                /**
                 * Sets the chapter in which the marker was added for non default chapter
                 * 
                 * @returns Number of the chapter in which the marker was added
                 */
                getAddedInChapter: function(chapterNumber) {
                    return this.addedInChapter;
                },

                /**
                 * Sets the chapter in which the marker was deleted for non default chapter
                 * 
                 * @param {int} chapterNumber Number of the chapter in which the marker was deleted
                 */
                setDeletedInChapter: function(chapterNumber) {
                    this.deletedInChapter = chapterNumber;
                },
                
                /**
                 * Sets the chapter in which the marker was deleted for non default chapter
                 * 
                 * @returns Number of the chapter in which the marker was deleted
                 */
                getDeletedInChapter: function(chapterNumber) {
                    return this.deletedInChapter;
                },

                /**
                 * Checks if a marker is valid for a chapter (either because deleted or because not yet added)
                 *
                 * @param {int} chapterNumber Number of the chapter to check
                 */
                isValidForChapter: function(chapterNumber) {
                    if(this.addedInChapter >= 0)
                    {
                        if(chapterNumber < this.addedInChapter)
                        {
                            return false;
                        }
                    }

                    if(this.deletedInChapter >= 0)
                    {
                        if(chapterNumber >= this.deletedInChapter)
                        {
                            return false;
                        }
                    }

                    return true;
                },


                /**
                 * Sets a callback function on the drag end of the marker
                 * 
                 * @param {function} callback Callback Function
                 */
                setOnDragEnd: function(callback) {
                    this.marker.on('dragend', function() {
                        callback();
                    });
                },


                /**
                 * Calls the edit callback
                 */
                callEdit: function() {
                    if(this.editCallback)
                    {
                        this.editCallback();
                    }
                },

                /**
                 * Sets the edit callback
                 */
                setEditCallback: function(callback) {
                    this.editCallback = callback;
                },


                /**
                 * Calls the delete callback
                 */
                callDelete: function() {
                    if(this.deleteCallback)
                    {
                        this.deleteCallback();
                    }
                },

                /**
                 * Sets the delete callback
                 */
                setDeleteCallback: function(callback) {
                    this.deleteCallback = callback;
                },


                /**
                 * Adds the marker to an object
                 * 
                 * @param {object} map Map object
                 */
                addTo: function(map) {
                    this.marker.addTo(map);
                },

                /**
                 * Removes the marker from an object
                 * 
                 * @param {object} map Map object
                 */
                removeFrom: function(map) {
                    this.marker.removeFrom(map);
                },


                /**
                 * Returns the lat/long position of the marker
                 * 
                 * @returns {object} Lat/long position
                 */
                getLatLng: function() {
                    return this.marker.getLatLng();
                },


                /**
                 * Disables the marker
                 */
                disable: function() {
                    if(this.marker)
                    {
                        if(this.marker.dragging)
                        {
                            this.marker.dragging.disable();
                        }
                        if(this.marker.getPopup() && this.marker.getPopup().getElement())
                        {
                            jQuery(this.marker.getPopup().getElement()).find(".gn-kartaPopupButtons").remove();
                        }
                    }
                    this.isDisabled = true;
                },


                /**
                 * Serializes the base data
                 */
                serializeBaseData: function() {
                    var serializedData = {
                        id: this.id,
                        x: this.x,
                        y: this.y,
                        addedInChapter: this.addedInChapter,
                        chapterPixelCoords: this.chapterPixelCoords,
                        deletedInChapter: this.deletedInChapter,
                        isImplemented: this.isImplemented
                    };

                    return serializedData;
                },

                /**
                 * Sets the base data from a serialized data
                 * 
                 * @param {object} serializedData Serialized data
                 */
                setBaseDataFromSerialized: function(serializedData) {
                    this.id = serializedData.id;
                    this.x = serializedData.x;
                    this.y = serializedData.y;
                    this.addedInChapter = serializedData.addedInChapter ? serializedData.addedInChapter : -1;
                    this.chapterPixelCoords = serializedData.chapterPixelCoords;
                    this.deletedInChapter = serializedData.deletedInChapter ? serializedData.deletedInChapter : -1;
                    this.isImplemented = serializedData.isImplemented;
                }
            };

        }(Karta.Map = Karta.Map || {}));
    }(GoNorth.Karta = GoNorth.Karta || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(Karta) {
        (function(Map) {

            /**
             * Kirja Marker
             * 
             * @param {object} pageId Id of the kirja page
             * @param {object} latLng Coordinates of the marker
             * @class
             */
            Map.KirjaMarker = function(pageId, latLng) 
            {
                Map.BaseMarker.apply(this);

                this.pageId = pageId;

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
             * Loads the content
             * 
             * @returns {jQuery.Deferred} Deferred
             */
            Map.KirjaMarker.prototype.loadContent = function() {
                var def = new jQuery.Deferred();

                var self = this;
                jQuery.ajax({
                    url: "/api/KirjaApi/Page?id=" + this.pageId
                }).done(function(pageContent) {
                    var pageHtml = "<h4><a href='/Kirja#id=" + self.pageId + "' target='_blank'>" + pageContent.name + "</a></h4>";
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
             * @returns {object} Serialized data
             */
            Map.KirjaMarker.prototype.serialize = function() {
                var serializedObject = this.serializeBaseData();
                serializedObject.pageId = this.pageId;
                return serializedObject;
            }

        }(Karta.Map = Karta.Map || {}));
    }(GoNorth.Karta = GoNorth.Karta || {}));
}(window.GoNorth = window.GoNorth || {}));
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
(function(GoNorth) {
    "use strict";
    (function(Karta) {
        (function(Map) {

            /**
             * Karta Marker
             * 
             * @param {object} mapId Id of the karta map
             * @param {object} latLng Coordinates of the marker
             * @class
             */
            Map.KartaMarker = function(mapId, latLng) 
            {
                Map.BaseMarker.apply(this);

                this.mapId = mapId;

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
             * Loads the content
             * 
             * @returns {jQuery.Deferred} Deferred
             */
            Map.KartaMarker.prototype.loadContent = function() {
                var def = new jQuery.Deferred();

                var self = this;
                jQuery.ajax({
                    url: "/api/KartaApi/Map?id=" + this.mapId
                }).done(function(map) {
                    var mapHtml = "<h4><a href='#id=" + self.mapId + "'>" + map.name + "</a></h4>";

                    def.resolve(mapHtml);
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
            Map.KartaMarker.prototype.serialize = function() {
                var serializedObject = this.serializeBaseData();
                serializedObject.mapId = this.mapId;
                return serializedObject;
            }

        }(Karta.Map = Karta.Map || {}));
    }(GoNorth.Karta = GoNorth.Karta || {}));
}(window.GoNorth = window.GoNorth || {}));
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
             * Loads the content
             * 
             * @returns {jQuery.Deferred} Deferred
             */
            Map.AikaMarker.prototype.loadContent = function() {
                var def = new jQuery.Deferred();

                var self = this;
                jQuery.ajax({
                    url: "/api/AikaApi/GetQuest?id=" + this.questId
                }).done(function(quest) {
                    var questHtml = "<h4><a href='/Aika/Quest#id=" + self.questId + "' target='_blank'>" + quest.name + "</a></h4>";
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
(function(GoNorth) {
    "use strict";
    (function(Karta) {
        (function(Map) {

            /// Selection Mode None
            var selectionModeNone = 0;

            /// Selection Mode Default
            var selectionModeDefault = 1;

            /**
             * Marker Manager
             * 
             * @param {object} viewModel Viewmodel to which the manager belongs
             * @class
             */
            Map.MarkerManager = function(viewModel) 
            {
                this.viewModel = viewModel;

                this.markerSelectionMode = selectionModeNone;

                this.preSelectType = null;
                this.markerType = null;

                this.isExpanded = new ko.observable(false);
                this.isLoading = new ko.observable(false);
                this.errorOccured = new ko.observable(false);

                this.loadedEntries = new ko.observableArray();
                this.searchTerm = new ko.observable("");
                this.currentPage = new ko.observable(0);
                this.hasMore = new ko.observable(false);

                this.additionalButtons = new ko.observableArray();

                this.markerChildShowId = new ko.observable("");

                this.hideSearchBar = false;
                this.hidePaging = false;

                this.markers = [];
                this.unparsedMarkers = [];

                this.markerLayer = null;
                this.markerMap = null;
                this.isLayerVisible = new ko.observable(true);
                var self = this;
                this.isLayerVisible.subscribe(function() {
                    self.syncLayerVisibility();
                });
            }

            Map.MarkerManager.prototype = {
                /**
                 * Creates a layer for a map
                 * 
                 * @param {object} map Map to which the layer should be added
                 */
                createLayerForMap: function(map) {
                    this.markerMap = map;
                    this.markerLayer = L.layerGroup();
                    if(this.isLayerVisible())
                    {
                        this.markerLayer.addTo(map);
                    }
                },

                /**
                 * Sets the layer visibility based on the observable value
                 */
                syncLayerVisibility: function() {
                    if(!this.markerLayer || !this.markerMap)
                    {
                        return;
                    }

                    if(this.isLayerVisible())
                    {
                        this.markerLayer.addTo(this.markerMap);
                    }
                    else
                    {
                        this.markerLayer.removeFrom(this.markerMap);
                        if(!this.isNotSelected())
                        {
                            this.viewModel.resetMarkerObjectData();
                        }
                    }
                },

                /**
                 * Checks the pre selection
                 * 
                 * @param {string} preSelectType Type of the pre select (Quest, ...)
                 * @param {string} preSelectId Id of the pre selection
                 * @returns {jQuery.Deferred} Deferred for the loading process
                 */
                checkPreSelection: function(preSelectType, preSelectId)
                {
                    var def = new jQuery.Deferred();
                    if(!this.preSelectType || this.preSelectType != preSelectType)
                    {
                        def.reject();
                        return def.promise();
                    }

                    this.isExpanded(true);

                    this.isLoading(true);
                    this.errorOccured(false);
                    var self = this;
                    this.loadPreSelectionObject(preSelectType, preSelectId).done(function(entry) {
                        self.searchTerm(entry.name);
                        self.loadedEntries([ entry ]);
                        self.hasMore(false);
                        self.isLoading(false);

                        if(!self.isNotSelected())
                        {
                            self.viewModel.resetMarkerObjectData();
                        }
                        self.selectEntry(entry);
                        def.resolve();
                    }).fail(function() {
                        self.errorOccured(true);
                        self.isLoading(false);
                        def.reject();
                    });
                    
                    return def.promise();
                },

                /**
                 * Loads the pre selection object
                 * 
                 * @param {string} preSelectType Type of the pre select (Quest, ...)
                 * @param {string} preSelectId Id of the pre selection object
                 * @returns {jQuery.Deferred} Deferred for the loading process
                 */
                loadPreSelectionObject: function(preSelectType, preSelectId)
                {
                    var def = new jQuery.Deferred();
                    def.reject("Not implemented");
                    return def.promise();
                },

                /**
                 * Checks if the marker manager must zoom on a marker
                 * 
                 * @param {string} zoomOnMarkerType Type of the marker to zoom on (Npc, Item, Quest, ...)
                 * @param {string} zoomOnMarkerId Id of the marker to zoom on
                 */
                checkZoomOnMarker: function(zoomOnMarkerType, zoomOnMarkerId) {
                    if(!this.markerType || this.markerType != zoomOnMarkerType)
                    {
                        return;
                    }

                    for(var curMarker = 0; curMarker < this.markers.length; ++curMarker)
                    {
                        if(this.markers[curMarker].id == zoomOnMarkerId)
                        {
                            var self = this;
                            this.checkZoomOnMarkerPreSelectionRequirements(this.markers[curMarker]).done(function() {
                                self.viewModel.switchChapterByNumber(self.markers[curMarker].getAddedInChapter());
                                self.markers[curMarker].zoomOn(self.markerMap);
                            });
                            return;
                        }
                    }
                },

                /**
                 * Checks if marker has pre selection requirements for zooming on (like selecting a quest for a marker)
                 * 
                 * @param {object} marker Marker which will be zoomed on
                 * @returns {jQuery.Deferred} Deferred for loading process
                 */
                checkZoomOnMarkerPreSelectionRequirements: function(marker) {
                    var def = new jQuery.Deferred();
                    def.resolve();
                    return def.promise();
                },
                
                /**
                 * Toogles the visibility
                 */
                toogleVisibility: function() {
                    this.isExpanded(!this.isExpanded());

                    if(this.loadedEntries().length === 0)
                    {
                        this.currentPage(0);
                        this.loadEntries();
                    }
                },

                /**
                 * Starts a new search
                 */
                startNewSearch: function() {
                    this.currentPage(0);
                    this.loadEntries();
                },

                /**
                 * Loads the previous search page
                 */
                prevPage: function() {
                    this.currentPage(this.currentPage() - 1);

                    this.loadEntries();
                },

                /**
                 * Loads the next search page
                 */
                nextPage: function() {
                    this.currentPage(this.currentPage() + 1);

                    this.loadEntries();
                },

                /**
                 * Loads the entries
                 */
                loadEntries: function() {
                    this.onEntrySelected(null);

                    this.isLoading(true);
                    this.errorOccured(false);
                    var self = this;
                    this.sendEntriesRequest().done(function(data) {
                        self.loadedEntries(data.entries);
                        self.hasMore(data.hasMore);
                        self.isLoading(false);

                        if(!self.isNotSelected())
                        {
                            self.viewModel.resetMarkerObjectData();
                        }
                    }).fail(function() {
                        self.errorOccured(true);
                        self.isLoading(false);
                    });
                },

                /**
                 * Resets the selection data
                 */
                resetSelectionData: function() {
                    this.markerSelectionMode = selectionModeNone;
                },

                /**
                 * Gets called whenever an entry is selected
                 * 
                 * @param {object} entry Entry that was selected
                 */
                onEntrySelected: function(entry)
                {

                },

                /**
                 * Deselects the current entry
                 */
                deselectCurrentEntry: function() {
                    this.onEntrySelected(null);
                    this.resetSelectionData();
                    this.viewModel.setCurrentObjectId(null, null);
                },

                /**
                 * Selects an entry
                 * 
                 * @param {object} entry Entry to select
                 */
                selectEntry: function(entry) {
                    if(this.viewModel.isReadonly())
                    {
                        return;
                    }

                    if(this.viewModel.selectedMarkerObjectId() == entry.id)
                    {
                        this.deselectCurrentEntry();
                        return;
                    }

                    this.onEntrySelected(entry);

                    this.viewModel.setCurrentObjectId(entry.id, this);
                    this.markerSelectionMode = selectionModeDefault;

                    if(!this.isLayerVisible())
                    {
                        this.isLayerVisible(true);
                    }
                },

                /**
                 * Returns true if the manager is not selected, else false
                 * 
                 * @returns {bool} true if the manager is not selected, else false
                 */
                isNotSelected: function() {
                    return this.markerSelectionMode == selectionModeNone;
                },

                /**
                 * Returns true if the default mode is selected, else false
                 * 
                 * @returns {bool} true if the default mode is selected, else false
                 */
                isDefaultSelected: function() {
                    return this.markerSelectionMode == selectionModeDefault;
                },


                /**
                 * Resets the markers
                 */
                resetMarkers: function() {
                    this.markers = [];
                    this.unparsedMarkers = [];
                },

                /**
                 * Saves unparsed markers to parse later after map was loaded
                 */
                setUnparsedMarkers: function(unparsedMarkers)
                {
                    this.unparsedMarkers = unparsedMarkers;
                },

                /**
                 * Parses unparsed markers
                 * 
                 * @param {object} map Map for parsing
                 */
                parseUnparsedMarkers: function(map) {
                    this.parseMarkers(this.unparsedMarkers, map);
                },

                /**
                 * Returns the lat lng coordinates from a serialized marker
                 * 
                 * @param {object} serializedMarker Serialized Marker
                 * @param {object} map Map for unprojecting
                 */
                getLatLngFromSerializedMarker: function(serializedMarker, map) {
                    return map.unproject([ serializedMarker.x, serializedMarker.y ], map.getMaxZoom());
                },

                /**
                 * Parses markers
                 * 
                 * @param {object[]} markers to parse
                 * @param {object} map Map for parsing
                 */
                parseMarkers: function(markers, map) {
                    if(!markers)
                    {
                        markers = [];
                    }

                    this.markers = [];
                    for(var curMarker = 0; curMarker < markers.length; ++curMarker)
                    {
                        var latLng = this.getLatLngFromSerializedMarker(markers[curMarker], map);

                        var marker = this.parseMarker(markers[curMarker], latLng);
                        this.viewModel.setMarkerDragCallback(marker);
                        marker.setBaseDataFromSerialized(markers[curMarker]);

                        this.pushMarker(marker);
                    }
                },

                /**
                 * Removes a marker
                 * 
                 * @param {object} marker Marker to remove
                 */
                removeMarker: function(marker) {
                    for(var curMarker = 0; curMarker < this.markers.length; ++curMarker)
                    {
                        if(this.markers[curMarker] == marker)
                        {
                            this.markers.splice(curMarker, 1);
                            return;
                        }
                    }
                },

                /**
                 * Adjustes the markers to a chapter
                 * 
                 * @param {int} chapterNumber Number of the chapter
                 * @param {object} map Map object for calculating lat long
                 */
                adjustMarkersToChapter: function(chapterNumber, map) {
                    for(var curMarker = 0; curMarker < this.markers.length; ++curMarker)
                    {
                        this.markers[curMarker].adjustPositionToChapter(chapterNumber, map);

                        if(!this.canPushMarkerToMap(this.markers[curMarker]))
                        {
                            continue;
                        }

                        if(this.markers[curMarker].isValidForChapter(chapterNumber))
                        {
                            this.markers[curMarker].addTo(this.markerLayer);
                        }
                        else
                        {
                            this.markers[curMarker].removeFrom(this.markerLayer);
                        }
                    }
                },


                /**
                 * Sets a markers edit callback function
                 * 
                 * @param {object} marker Marker to set the edit callback for
                 */
                setEditCallback: function(marker) {
                },

                /**
                 * Sets a markers drag callback function
                 * 
                 * @param {object} marker Marker to set the delete callback for
                 */
                setDeleteCallback: function(marker) {
                    var self = this;
                    marker.setDeleteCallback(function() {
                        self.viewModel.openDeleteDialog(marker, self);
                    });
                },

                /**
                 * Checks if a new marker can be pushed to be the map
                 * 
                 * @param {marker} Marker Marker to push
                 * @returns {bool} true if marker can be pushed, else false
                 */
                canPushMarkerToMap: function(marker) {
                    return true;
                },

                /**
                 * Pushes a new marker
                 * 
                 * @param {marker} marker Marker to push
                 */
                pushMarker: function(marker) {
                    this.setEditCallback(marker);
                    this.setDeleteCallback(marker);
                    marker.setMapId(this.viewModel.id());
                    marker.setMarkerType(this.markerType);
                    marker.setCompareDialog(this.viewModel.compareDialog);
                    this.markers.push(marker);

                    var currentChapter = this.viewModel.getSelectedChapterNumber();

                    if((currentChapter == -1 || marker.isValidForChapter(currentChapter)) && this.canPushMarkerToMap(marker))
                    {
                        marker.addTo(this.markerLayer);
                    }
                },


                /**
                 * Disables the markers
                 */
                disable: function() {
                    for(var curMarker = 0; curMarker < this.markers.length; ++curMarker)
                    {
                        this.markers[curMarker].disable();
                    }
                },

                
                /**
                 * Sends the entries request
                 * 
                 * @returns {jQuery.Deferred} Deferred for the async call
                 */
                sendEntriesRequest: function() {
                    var def = new jQuery.Deferred();
                    def.reject();

                    return def.promise();
                },

                /**
                 * Creates a new marker
                 * 
                 * @param {string} objectId Object Id
                 * @param {object} latLng Lat/Long Position
                 */
                createMarker: function(objectId, latLng) {

                },

                /**
                 * Parses a marker
                 * 
                 * @param {object} unparsedMarker Unparsed marker
                 * @param {object} latLng Lat/Long Position
                 */
                parseMarker: function(unparsedMarker, latLng) {
                    return {};
                }
            };

        }(Karta.Map = Karta.Map || {}));
    }(GoNorth.Karta = GoNorth.Karta || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(Karta) {
        (function(Map) {

            /// Kirja Page Size
            var kirjaPageSize = 20;
            
            /// New Kirja Page Button Id
            var newKirjaPageButtonId = "NewKirjaPage";

            /// New Kirja Selection Mode
            var newKirjaPageSelectionMode = 2;

            /**
             * Kirja Marker Manager
             * 
             * @param {object} viewModel Viewmodel to which the manager belongs
             * @class
             */
            Map.KirjaMarkerManager = function(viewModel) 
            {
                Map.MarkerManager.apply(this, [ viewModel ]);

                this.title = GoNorth.Karta.Map.Localization.KirjaMarkerTitle;
                
                this.markerType = "KirjaPage";

                this.additionalButtons.push({
                    buttonId: newKirjaPageButtonId,
                    title: GoNorth.Karta.Map.Localization.KirjaMarkerNewPage,
                    callback: this.createNewKirjaMarker
                });
            }

            Map.KirjaMarkerManager.prototype = jQuery.extend({ }, Map.MarkerManager.prototype)

            /**
             * Sends the entries request
             * 
             * @returns {jQuery.Deferred} Deferred for the async call
             */
            Map.KirjaMarkerManager.prototype.sendEntriesRequest = function() {
                var def = new jQuery.Deferred();
                jQuery.ajax({ 
                    url: "/api/KirjaApi/SearchPages?searchPattern=" + this.searchTerm() + "&start=" + (this.currentPage() * kirjaPageSize) + "&pageSize=" + kirjaPageSize, 
                    type: "GET"
                }).done(function(data) {
                    def.resolve({
                        entries: data.pages,
                        hasMore: data.hasMore
                    });
                }).fail(function() {
                    def.reject();
                })

                return def.promise();
            };

            /**
             * Creates a new marker
             * 
             * @param {string} objectId Object Id
             * @param {object} latLng Lat/Long Position
             */
            Map.KirjaMarkerManager.prototype.createMarker = function(objectId, latLng) {
                var def = new jQuery.Deferred();
                
                if(this.isDefaultSelected())
                {
                    this.createMarkerFromExistingPage(def, objectId, latLng);
                }
                else if(this.markerSelectionMode == newKirjaPageSelectionMode)
                {
                    this.createMarkerFromNewPage(def, latLng);
                }
                else
                {
                    def.reject();
                }

                return def.promise();
            };

            /**
             * Creates a new marker from an existing page
             * 
             * @param {jQuery.Deferred} def Deferred for the creation process
             * @param {string} pageId Page Id
             * @param {object} latLng Lat/Long Position
             */
            Map.KirjaMarkerManager.prototype.createMarkerFromExistingPage = function(def, pageId, latLng) {
                var marker = new Map.KirjaMarker(pageId, latLng);
                this.pushMarker(marker);
                def.resolve(marker);
            };

            /**
             * Creates a new marker from a new page
             * 
             * @param {jQuery.Deferred} def Deferred for the creation process
             * @param {object} latLng Lat/Long Position
             */
            Map.KirjaMarkerManager.prototype.createMarkerFromNewPage = function(def, latLng) {
                this.viewModel.showWaitOnPageDialog(true);

                var self = this;
                var newPage = window.open("/Kirja#newPage=1");
                newPage.onbeforeunload = function() {
                    self.viewModel.showWaitOnPageDialog(false);
                };
                newPage.newKirjaPageSaved = function(id, name) {
                    var marker = new Map.KirjaMarker(id, latLng);
                    self.pushMarker(marker);

                    self.viewModel.showWaitOnPageDialog(false);

                    def.resolve(marker);
                };
            };

            /**
             * Creates a new kirja page for a marker
             */
            Map.KirjaMarkerManager.prototype.createNewKirjaMarker = function() {
                if(this.markerSelectionMode == newKirjaPageSelectionMode)
                {
                    this.deselectCurrentEntry();
                    return;
                }

                this.viewModel.setCurrentObjectId(newKirjaPageButtonId, this);
                this.markerSelectionMode = newKirjaPageSelectionMode;
            };

            /**
             * Parses a marker
             * 
             * @param {object} unparsedMarker Unparsed marker
             * @param {object} latLng Lat/Long Position
             */
            Map.KirjaMarkerManager.prototype.parseMarker = function(unparsedMarker, latLng) {
                return new Map.KirjaMarker(unparsedMarker.pageId, latLng);
            };

        }(Karta.Map = Karta.Map || {}));
    }(GoNorth.Karta = GoNorth.Karta || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(Karta) {
        (function(Map) {

            /// Kortisto Page Size
            var kortistoPageSize = 20;

            /**
             * Kortisto Marker Manager
             * 
             * @param {object} viewModel Viewmodel to which the manager belongs
             * @class
             */
            Map.KortistoMarkerManager = function(viewModel) 
            {
                Map.MarkerManager.apply(this, [ viewModel ]);

                this.title = GoNorth.Karta.Map.Localization.KortistoMarkerTitle;

                this.markerType = "Npc";
            }

            Map.KortistoMarkerManager.prototype = jQuery.extend({ }, Map.MarkerManager.prototype)

            /**
             * Sends the entries request
             * 
             * @returns {jQuery.Deferred} Deferred for the async call
             */
            Map.KortistoMarkerManager.prototype.sendEntriesRequest = function() {
                var def = new jQuery.Deferred();
                jQuery.ajax({ 
                    url: "/api/KortistoApi/SearchFlexFieldObjects?searchPattern=" + this.searchTerm() + "&start=" + (this.currentPage() * kortistoPageSize) + "&pageSize=" + kortistoPageSize, 
                    type: "GET"
                }).done(function(data) {
                    def.resolve({
                        entries: data.flexFieldObjects,
                        hasMore: data.hasMore
                    });
                }).fail(function() {
                    def.reject();
                })

                return def.promise();
            };

            /**
             * Creates a new marker
             * 
             * @param {string} objectId Object Id
             * @param {object} latLng Lat/Long Position
             */
            Map.KortistoMarkerManager.prototype.createMarker = function(objectId, latLng) {
                var def = new jQuery.Deferred();
                
                var marker = new Map.KortistoMarker(objectId, latLng);
                this.pushMarker(marker);
                def.resolve(marker);

                return def.promise();
            };

            /**
             * Parses a marker
             * 
             * @param {object} unparsedMarker Unparsed marker
             * @param {object} latLng Lat/Long Position
             */
            Map.KortistoMarkerManager.prototype.parseMarker = function(unparsedMarker, latLng) {
                return new Map.KortistoMarker(unparsedMarker.npcId, latLng);
            };

        }(Karta.Map = Karta.Map || {}));
    }(GoNorth.Karta = GoNorth.Karta || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(Karta) {
        (function(Map) {

            /// Styr Page Size
            var styrPageSize = 20;

            /**
             * Styr Marker Manager
             * 
             * @param {object} viewModel Viewmodel to which the manager belongs
             * @class
             */
            Map.StyrMarkerManager = function(viewModel) 
            {
                Map.MarkerManager.apply(this, [ viewModel ]);

                this.title = GoNorth.Karta.Map.Localization.StyrMarkerTitle;

                this.markerType = "Item";
            }

            Map.StyrMarkerManager.prototype = jQuery.extend({ }, Map.MarkerManager.prototype)

            /**
             * Sends the entries request
             * 
             * @returns {jQuery.Deferred} Deferred for the async call
             */
            Map.StyrMarkerManager.prototype.sendEntriesRequest = function() {
                var def = new jQuery.Deferred();
                jQuery.ajax({ 
                    url: "/api/StyrApi/SearchFlexFieldObjects?searchPattern=" + this.searchTerm() + "&start=" + (this.currentPage() * styrPageSize) + "&pageSize=" + styrPageSize, 
                    type: "GET"
                }).done(function(data) {
                    def.resolve({
                        entries: data.flexFieldObjects,
                        hasMore: data.hasMore
                    });
                }).fail(function() {
                    def.reject();
                })

                return def.promise();
            };

            /**
             * Creates a new marker
             * 
             * @param {string} objectId Object Id
             * @param {object} latLng Lat/Long Position
             */
            Map.StyrMarkerManager.prototype.createMarker = function(objectId, latLng) {
                var def = new jQuery.Deferred();
                
                var marker = new Map.StyrMarker(objectId, latLng);
                this.pushMarker(marker);
                def.resolve(marker);

                return def.promise();
            };

            /**
             * Parses a marker
             * 
             * @param {object} unparsedMarker Unparsed marker
             * @param {object} latLng Lat/Long Position
             */
            Map.StyrMarkerManager.prototype.parseMarker = function(unparsedMarker, latLng) {
                return new Map.StyrMarker(unparsedMarker.itemId, latLng);
            };

        }(Karta.Map = Karta.Map || {}));
    }(GoNorth.Karta = GoNorth.Karta || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(Karta) {
        (function(Map) {

            /// Aika Page Size
            var aikaPageSize = 20;

            /**
             * Aika Marker Manager
             * 
             * @param {object} viewModel Viewmodel to which the manager belongs
             * @class
             */
            Map.AikaMarkerManager = function(viewModel) 
            {
                Map.MarkerManager.apply(this, [ viewModel ]);

                this.title = GoNorth.Karta.Map.Localization.AikaMarkerTitle;

                this.preSelectType = "Quest";
                this.markerType = "Quest";
            }

            Map.AikaMarkerManager.prototype = jQuery.extend({ }, Map.MarkerManager.prototype)

            /**
             * Sends the entries request
             * 
             * @returns {jQuery.Deferred} Deferred for the async call
             */
            Map.AikaMarkerManager.prototype.sendEntriesRequest = function() {
                var def = new jQuery.Deferred();
                jQuery.ajax({ 
                    url: "/api/AikaApi/GetQuests?searchPattern=" + this.searchTerm() + "&start=" + (this.currentPage() * aikaPageSize) + "&pageSize=" + aikaPageSize, 
                    type: "GET"
                }).done(function(data) {
                    def.resolve({
                        entries: data.quests,
                        hasMore: data.hasMore
                    });
                }).fail(function() {
                    def.reject();
                })

                return def.promise();
            };

            /**
             * Loads the pre selection object
             * 
             * @param {string} preSelectType Type of the pre select (Quest, ...)
             * @param {string} preSelectId Id of the pre selection object
             * @returns {jQuery.Deferred} Deferred for the loading process
             */
            Map.AikaMarkerManager.prototype.loadPreSelectionObject = function(preSelectType, preSelectId) {
                var def = new jQuery.Deferred();
                
                jQuery.ajax({ 
                    url: "/api/AikaApi/GetQuest?id=" + preSelectId, 
                    type: "GET"
                }).done(function(data) {
                    def.resolve(data);
                }).fail(function(xhr) {
                    def.reject();
                });

                return def.promise();
            };

            /**
             * Checks if marker has pre selection requirements for zooming on (like selecting a quest for a marker)
             * 
             * @param {object} marker Marker which will be zoomed on
             * @returns {jQuery.Deferred} Deferred for loading process
             */
            Map.AikaMarkerManager.prototype.checkZoomOnMarkerPreSelectionRequirements = function(marker) {
                return this.checkPreSelection(this.preSelectType, marker.questId);
            };

            /**
             * Gets called whenever an entry is selected
             * 
             * @param {object} entry Entry that was selected
             */
            Map.AikaMarkerManager.prototype.onEntrySelected = function(entry)
            {
                if(entry && (this.viewModel.selectedMarkerObjectId() != entry.id || this.markerChildShowId() != entry.id))
                {
                    this.markerChildShowId(entry.id);
                }
                else
                {
                    this.markerChildShowId("");
                }

                this.syncVisibleMarkers();
            };

            /**
             * Checks if a new marker can be pushed to be the map
             * 
             * @param {marker} Marker Marker to push
             * @returns {bool} true if marker can be pushed, else false
             */
            Map.AikaMarkerManager.prototype.syncVisibleMarkers = function() {
                if(!this.markerLayer)
                {
                    return;
                }

                var currentChapter = this.viewModel.getSelectedChapterNumber();

                for(var curMarker = 0; curMarker < this.markers.length; ++curMarker)
                {
                    if(this.markers[curMarker].questId != this.markerChildShowId())
                    {
                        this.markers[curMarker].removeFrom(this.markerLayer);
                    }
                    else
                    {
                        if(this.markers[curMarker].isValidForChapter(currentChapter))
                        {
                            this.markers[curMarker].addTo(this.markerLayer);
                        }
                    }
                }
            };

            /**
             * Checks if a new marker can be pushed to be the map
             * 
             * @param {marker} Marker Marker to push
             * @returns {bool} true if marker can be pushed, else false
             */
            Map.AikaMarkerManager.prototype.canPushMarkerToMap = function(marker) {
                return marker.questId == this.markerChildShowId();
            };

            /**
             * Creates a new marker
             * 
             * @param {string} objectId Object Id
             * @param {object} latLng Lat/Long Position
             */
            Map.AikaMarkerManager.prototype.createMarker = function(objectId, latLng) {
                var def = new jQuery.Deferred();
                
                var self = this;
                this.viewModel.openMarkerNameDialog().then(function(name) {
                    self.markerChildShowId(objectId);
                    self.syncVisibleMarkers();

                    var marker = new Map.AikaMarker(objectId, name, latLng);
                    self.pushMarker(marker);
                    def.resolve(marker);
                });

                return def.promise();
            };

            /**
             * Sets a markers edit callback function
             * 
             * @param {object} marker Marker to set the edit callback for
             */
            Map.AikaMarkerManager.prototype.setEditCallback = function(marker) {
                var self = this;
                marker.setEditCallback(function() {
                    self.viewModel.openMarkerNameDialog(marker.name).then(function(name) {
                        if(marker.name == name)
                        {
                            return;
                        }

                        marker.name = name;

                        // Update popup
                        if(marker.marker.getPopup())
                        {
                            jQuery(marker.marker.getPopup().getElement()).find(".gn-kartaPopupContent").text(name)
                        }

                        self.viewModel.saveMarker(marker);
                    });
                });
            };

            /**
             * Parses a marker
             * 
             * @param {object} unparsedMarker Unparsed marker
             * @param {object} latLng Lat/Long Position
             */
            Map.AikaMarkerManager.prototype.parseMarker = function(unparsedMarker, latLng) {
                return new Map.AikaMarker(unparsedMarker.questId, unparsedMarker.name, latLng);
            };

        }(Karta.Map = Karta.Map || {}));
    }(GoNorth.Karta = GoNorth.Karta || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(Karta) {
        (function(Map) {

            /**
             * Karta Marker Manager
             * 
             * @param {object} viewModel Viewmodel to which the manager belongs
             * @class
             */
            Map.KartaMarkerManager = function(viewModel) 
            {
                Map.MarkerManager.apply(this, [ viewModel ]);

                this.title = GoNorth.Karta.Map.Localization.KartaMarkerTitle;

                this.markerType = "MapChange";

                this.hideSearchBar = true;
                this.hidePaging = true;

                this.allMaps = [];

                var self = this;
                this.viewModel.id.subscribe(function() {
                    self.loadedEntries(self.getFilteredMaps());
                    if(!self.isNotSelected())
                    {
                        self.viewModel.resetMarkerObjectData();
                    }
                });
            }

            Map.KartaMarkerManager.prototype = jQuery.extend({ }, Map.MarkerManager.prototype)

            /**
             * Sends the entries request
             * 
             * @returns {jQuery.Deferred} Deferred for the async call
             */
            Map.KartaMarkerManager.prototype.sendEntriesRequest = function() {
                var def = new jQuery.Deferred();
                if(this.allMaps.length > 0)
                {
                    def.resolve({
                        entries: this.getFilteredMaps(),
                        hasMore: false
                    });
                    return def.promise();
                }

                var self = this;
                jQuery.ajax({ 
                    url: "/api/KartaApi/Maps", 
                    type: "GET"
                }).done(function(data) {
                    self.allMaps = data;
                    def.resolve({
                        entries: self.getFilteredMaps(),
                        hasMore: false
                    });
                }).fail(function() {
                    def.reject();
                })

                return def.promise();
            };

            /**
             * Returns all the maps except the one which is currently opened
             * 
             * @returns {object[]} Filtered maps
             */
            Map.KartaMarkerManager.prototype.getFilteredMaps = function() {
                var maps = [];
                for(var curMap = 0; curMap < this.allMaps.length; ++curMap)
                {
                    if(this.allMaps[curMap].id != this.viewModel.id())
                    {
                        maps.push(this.allMaps[curMap]);
                    }
                }
                return maps;
            };

            /**
             * Creates a new marker
             * 
             * @param {string} objectId Object Id
             * @param {object} latLng Lat/Long Position
             */
            Map.KartaMarkerManager.prototype.createMarker = function(objectId, latLng) {
                var def = new jQuery.Deferred();
                
                var marker = new Map.KartaMarker(objectId, latLng);
                this.pushMarker(marker);
                def.resolve(marker);

                return def.promise();
            };

            /**
             * Parses a marker
             * 
             * @param {object} unparsedMarker Unparsed marker
             * @param {object} latLng Lat/Long Position
             */
            Map.KartaMarkerManager.prototype.parseMarker = function(unparsedMarker, latLng) {
                return new Map.KartaMarker(unparsedMarker.mapId, latLng);
            };

        }(Karta.Map = Karta.Map || {}));
    }(GoNorth.Karta = GoNorth.Karta || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(Karta) {
        (function(Map) {

            /**
             * Map View Model
             * @class
             */
            Map.ViewModel = function()
            {
                this.id = new ko.observable("");
                this.preSelectType = GoNorth.Util.getParameterFromHash("preSelectType");
                this.preSelectId = GoNorth.Util.getParameterFromHash("preSelectId");
                this.zoomOnMarkerType = GoNorth.Util.getParameterFromHash("zoomOnMarkerType");
                this.zoomOnMarkerId = GoNorth.Util.getParameterFromHash("zoomOnMarkerId");
                var paramId = GoNorth.Util.getParameterFromHash("id");
                if(paramId)
                {
                    this.setId(paramId);
                }
                
                this.isLoading = new ko.observable(false);
                this.isReadonly = new ko.observable(false);
                this.showWaitOnPageDialog = new ko.observable(false);
                this.lockedByUser = new ko.observable("");

                this.map = null;

                this.currentMapName = new ko.observable(Karta.Map.Localization.Karta);
                this.mapUrlTemplate = new ko.computed(function() {
                    return "/api/KartaApi/MapImage?mapId=" + encodeURIComponent(this.id()) + "&z={z}&x={x}&y={y}&maxZoom={maxZoom}&maxTileCountX={maxTileCountX}&maxTileCountY={maxTileCountY}"
                }, this);
                this.mapMaxZoom = new ko.observable();
                this.mapImageWidth = new ko.observable();
                this.mapImageHeight = new ko.observable();
                this.mapLoaded = new ko.observable(false);

                this.allMaps = new ko.observableArray();

                this.kirjaMarkerManager = new Map.KirjaMarkerManager(this);
                this.kortistoMarkerManager = new Map.KortistoMarkerManager(this);
                this.styrMarkerManager = new Map.StyrMarkerManager(this);
                this.kartaMarkerManager = new Map.KartaMarkerManager(this);
                this.aikaMarkerManager = new Map.AikaMarkerManager(this);

                this.selectedMarkerObjectId = new ko.observable("");
                this.currentValidManager = null;

                this.showConfirmDeleteDialog = new ko.observable(false);
                this.markerToDelete = null;
                this.markerToDeleteManager = null;

                this.showMarkerNameDialog = new ko.observable(false);
                this.dialogMarkerName = new ko.observable("");
                this.dialogMarkerNameDef = null;
                
                this.compareDialog = new GoNorth.ImplementationStatus.CompareDialog.ViewModel();


                this.selectedChapter = new ko.observable(null);
                this.chapters = new ko.observableArray();

                this.selectedChapterName = new ko.computed(function() {
                    var selectedChapter = this.selectedChapter();
                    if(selectedChapter) 
                    {
                        return selectedChapter.number + ": " + selectedChapter.name;
                    }

                    return Map.Localization.EditingDefaultChapter;
                }, this);

                this.isNonDefaultChapterSelected = new ko.computed(function() {
                    var selectedChapter = this.selectedChapter();
                    if(selectedChapter) 
                    {
                        return !selectedChapter.isDefault;
                    }

                    return false;
                }, this);

                this.errorOccured = new ko.observable(false);

                this.loadAllMaps();

                var chapterDef = null;
                if(Map.hasAikaRights)
                {
                    chapterDef = this.loadChapters();
                }
                else
                {
                    chapterDef = new jQuery.Deferred();
                    chapterDef.resolve();
                }

                var self = this;
                chapterDef.done(function() {
                    if(self.id())
                    {
                        self.loadMap(self.id());
                    }
                });

                var lastId = this.id();
                window.onhashchange = function() {
                    var id = GoNorth.Util.getParameterFromHash("id");
                    if(id != lastId) {
                        lastId = id;
                        self.switchMap(GoNorth.Util.getParameterFromHash("id"));
                    }
                }
            };

            Map.ViewModel.prototype = {
                /**
                 * Checks the pre selection
                 */
                checkPreSelection: function() {
                    if(!this.preSelectType || !this.preSelectId)
                    {
                        return;
                    }

                    this.kirjaMarkerManager.checkPreSelection(this.preSelectType, this.preSelectId);
                    this.kortistoMarkerManager.checkPreSelection(this.preSelectType, this.preSelectId);
                    this.styrMarkerManager.checkPreSelection(this.preSelectType, this.preSelectId);
                    this.kartaMarkerManager.checkPreSelection(this.preSelectType, this.preSelectId);
                    this.aikaMarkerManager.checkPreSelection(this.preSelectType, this.preSelectId);

                    this.preSelectType = null;
                    this.preSelectId = null;
                },

                /**
                 * Checks the marker which should be zoomed on
                 */
                checkZoomOnMarker: function() {
                    if(!this.zoomOnMarkerType || !this.zoomOnMarkerId)
                    {
                        return;
                    }

                    this.kirjaMarkerManager.checkZoomOnMarker(this.zoomOnMarkerType, this.zoomOnMarkerId);
                    this.kortistoMarkerManager.checkZoomOnMarker(this.zoomOnMarkerType, this.zoomOnMarkerId);
                    this.styrMarkerManager.checkZoomOnMarker(this.zoomOnMarkerType, this.zoomOnMarkerId);
                    this.kartaMarkerManager.checkZoomOnMarker(this.zoomOnMarkerType, this.zoomOnMarkerId);
                    this.aikaMarkerManager.checkZoomOnMarker(this.zoomOnMarkerType, this.zoomOnMarkerId);

                    this.zoomOnMarkerType = null;
                    this.zoomOnMarkerId = null;
                },

                /**
                 * Callback after the map was loaded
                 */
                mapReady: function(map) {
                    this.map = map;

                    this.kirjaMarkerManager.createLayerForMap(map);
                    this.kortistoMarkerManager.createLayerForMap(map);
                    this.styrMarkerManager.createLayerForMap(map);
                    this.kartaMarkerManager.createLayerForMap(map);
                    this.aikaMarkerManager.createLayerForMap(map);

                    this.kirjaMarkerManager.parseUnparsedMarkers(map);
                    this.kortistoMarkerManager.parseUnparsedMarkers(map);
                    this.styrMarkerManager.parseUnparsedMarkers(map);
                    this.kartaMarkerManager.parseUnparsedMarkers(map);
                    this.aikaMarkerManager.parseUnparsedMarkers(map);

                    this.checkPreSelection();
                    this.checkZoomOnMarker();
                },
                

                /**
                 * Loads all available maps
                 */
                loadAllMaps: function() {
                    this.errorOccured(false);
                    var self = this;
                    jQuery.ajax({
                        url: "/api/KartaApi/Maps",
                        method: "GET"
                    }).done(function(maps) {
                        self.allMaps(maps);

                        if(!self.id() && maps.length > 0)
                        {
                            self.loadMap(maps[0].id);
                        }
                    }).fail(function() {
                        self.errorOccured(true);
                    });
                },


                /**
                 * Loads chapters
                 */
                loadChapters: function() {
                    var def = new jQuery.Deferred();

                    this.errorOccured(false);
                    var self = this;
                    jQuery.ajax({
                        url: "/api/AikaApi/GetChapters",
                        method: "GET"
                    }).done(function(chapters) {
                        if(!chapters)
                        {
                            chapters = [];
                        }

                        var aggregatedChapters = [];
                        var aggregatedChapterName = "";
                        var curChapterNumber = -1;
                        for(var curChapter = 0; curChapter < chapters.length; ++curChapter)
                        {
                            if(curChapter == 0)
                            {
                                curChapterNumber = chapters[curChapter].number;
                            }

                            if(chapters[curChapter].number != curChapterNumber)
                            {
                                aggregatedChapters.push({
                                    number: curChapterNumber,
                                    name: aggregatedChapterName,
                                });

                                aggregatedChapterName = "";
                                curChapterNumber = chapters[curChapter].number;
                            }

                            if(aggregatedChapterName)
                            {
                                aggregatedChapterName += " / ";
                            }
                            aggregatedChapterName += chapters[curChapter].name;
                        }
                        
                        if(aggregatedChapterName) 
                        {
                            aggregatedChapters.push({
                                number: curChapterNumber,
                                name: aggregatedChapterName,
                            });
                        }

                        if(aggregatedChapters.length > 0)
                        {
                            aggregatedChapters[0].isDefault = true;
                            self.selectedChapter(aggregatedChapters[0]);
                        }

                        self.chapters(aggregatedChapters);
                        def.resolve();
                    }).fail(function() {
                        self.errorOccured(true);
                        def.reject();
                    });

                    return def.promise();
                },

                /**
                 * Switches the chapter by a chapter number
                 * 
                 * @param {int} chapterNumber Chapter number to which to switch
                 */
                switchChapterByNumber: function(chapterNumber) {
                    var chapters = this.chapters();
                    if(chapters == null || chapters.length == 0 || this.getSelectedChapterNumber() == chapterNumber)
                    {
                        return;
                    }

                    var bestChapter = chapters[0];
                    for(var curChapter = 0; curChapter < chapters.length; ++curChapter)
                    {
                        if(chapters[curChapter].number >= chapterNumber)
                        {
                            bestChapter = chapters[curChapter];
                            break;
                        }
                    }

                    if(bestChapter != this.selectedChapter())
                    {
                        this.switchChapter(bestChapter);
                    }
                },

                /**
                 * Switches the chapter
                 * 
                 * @param {object} chapter Chapter to select
                 */
                switchChapter: function(chapter) {
                    this.selectedChapter(chapter);

                    this.kirjaMarkerManager.adjustMarkersToChapter(chapter.number, this.map);
                    this.kortistoMarkerManager.adjustMarkersToChapter(chapter.number, this.map);
                    this.styrMarkerManager.adjustMarkersToChapter(chapter.number, this.map);
                    this.kartaMarkerManager.adjustMarkersToChapter(chapter.number, this.map);
                    this.aikaMarkerManager.adjustMarkersToChapter(chapter.number, this.map);
                },

                /**
                 * Returns the currently selected chapter number
                 * 
                 * @returns {int} Currently Selected chapter number, -1 if no chapter is selected
                 */
                getSelectedChapterNumber: function() {
                    if(!this.selectedChapter())
                    {
                        return -1;
                    }

                    return this.selectedChapter().number;
                },


                /**
                 * Sets the id
                 * 
                 * @param {string} id Id of the page
                 */
                setId: function(id) {
                    this.id(id);
                    window.location.hash = "id=" + id;
                },

                /**
                 * Switches the map which is currently displayed if ifs different to the current one
                 * 
                 * @param {string} id Id of the map
                 */
                switchMap: function(id) {
                    if(this.id() == id)
                    {
                        return;
                    }

                    this.kirjaMarkerManager.resetMarkers();
                    this.kortistoMarkerManager.resetMarkers();
                    this.styrMarkerManager.resetMarkers();
                    this.kartaMarkerManager.resetMarkers();
                    this.aikaMarkerManager.resetMarkers();
                    this.loadMap(id);
                },

                /**
                 * Loads a map
                 * 
                 * @param {string} id Id of the map
                 */
                loadMap: function(id) {
                    this.errorOccured(false);
                    this.isLoading(true);
                    var self = this;
                    jQuery.ajax({
                        url: "/api/KartaApi/Map?id=" + encodeURIComponent(id),
                        method: "GET"
                    }).done(function(map) {
                        self.currentMapName(map.name);

                        self.mapMaxZoom(map.maxZoom);
                        self.mapImageWidth(map.width);
                        self.mapImageHeight(map.height);
                        self.setId(id);

                        if(self.map)
                        {
                            self.kirjaMarkerManager.parseMarkers(map.kirjaPageMarker, self.map);
                            self.kortistoMarkerManager.parseMarkers(map.npcMarker, self.map);
                            self.styrMarkerManager.parseMarkers(map.itemMarker, self.map);
                            self.kartaMarkerManager.parseMarkers(map.mapChangeMarker, self.map);
                            self.aikaMarkerManager.parseMarkers(map.questMarker, self.map);
                        }
                        else
                        {
                            self.kirjaMarkerManager.setUnparsedMarkers(map.kirjaPageMarker);
                            self.kortistoMarkerManager.setUnparsedMarkers(map.npcMarker);
                            self.styrMarkerManager.setUnparsedMarkers(map.itemMarker);
                            self.kartaMarkerManager.setUnparsedMarkers(map.mapChangeMarker);
                            self.aikaMarkerManager.setUnparsedMarkers(map.questMarker);
                        }

                        if(!self.mapLoaded())
                        {
                            self.mapLoaded(true);
                        }

                        self.acquireLock();

                        if(self.isNonDefaultChapterSelected())
                        {
                            var chapterNumber = self.getSelectedChapterNumber();
                            self.kirjaMarkerManager.adjustMarkersToChapter(chapterNumber, self.map);
                            self.kortistoMarkerManager.adjustMarkersToChapter(chapterNumber, self.map);
                            self.styrMarkerManager.adjustMarkersToChapter(chapterNumber, self.map);
                            self.kartaMarkerManager.adjustMarkersToChapter(chapterNumber, self.map);
                            self.aikaMarkerManager.adjustMarkersToChapter(chapterNumber, self.map);
                        }

                        self.isLoading(false);
                    }).fail(function() {
                        self.errorOccured(true);
                        self.isLoading(false);
                    });
                },

                /**
                 * Adds a marker to the map
                 * 
                 * @param {object} map Map Object
                 * @param {object} latLng Click coordinates
                 */
                addMarkerToMap: function(map, latLng) {
                    if(!this.currentValidManager || this.isLoading()) {
                        return;
                    }

                    this.errorOccured(false);

                    var markerDef = this.currentValidManager.createMarker(this.selectedMarkerObjectId(), latLng);

                    var self = this;
                    markerDef.done(function(marker) {
                        self.setMarkerDragCallback(marker);
                        self.setMarkerPixelPosition(marker, map, true);

                        if(self.isNonDefaultChapterSelected())
                        {
                            marker.setAddedInChapter(self.selectedChapter().number);
                        }

                        self.saveNewMarker(marker, map);
                    });
                },

                /**
                 * Sets a markers drag callback function
                 * 
                 * @param {object} marker Marker to set the drag callback for
                 */
                setMarkerDragCallback: function(marker) {
                    var self = this;
                    marker.setOnDragEnd(function() {
                        self.saveNewMarkerPos(marker, self.map);
                    });
                },

                /**
                 * Sets a markers drag callback function
                 * 
                 * @param {object} marker Marker to set the drag callback for
                 * @param {object} manager Manager to which the marker belongs
                 */
                openDeleteDialog: function(marker, manager) {
                    var self = this;
                    marker.setDeleteCallback(function() {
                        self.showConfirmDeleteDialog(true);
                        self.markerToDelete = marker;
                        self.markerToDeleteManager = manager;
                    });
                },

                /**
                 * Deletes the marker for which the dialog is shown
                 */
                deleteMarker: function() {
                    if(!this.isNonDefaultChapterSelected() || (this.markerToDelete.getAddedInChapter() >= 0 && this.markerToDelete.getAddedInChapter() == this.getSelectedChapterNumber()))
                    {
                        this.markerToDeleteManager.removeMarker(this.markerToDelete, this.selectedChapter());
                        this.sendDeleteMarkerRequest(this.markerToDelete);
                    }
                    else
                    {
                        this.markerToDelete.setDeletedInChapter(this.getSelectedChapterNumber());
                        this.saveMarker(this.markerToDelete);
                    }

                    this.markerToDelete.removeFrom(this.map);
                    this.closeConfirmDeleteDialog();
                },

                /**
                 * Sends a request to delete a marker
                 * 
                 * @param {object} marker Marker to delete
                 */
                sendDeleteMarkerRequest: function(marker) {
                    // Send delete request
                    this.isLoading(true);
                    var self = this;
                    jQuery.ajax({ 
                        url: "/api/KartaApi/DeleteMapMarker?id=" + this.id() + "&markerId=" + marker.id + "&markerType=" + marker.markerType, 
                        headers: GoNorth.Util.generateAntiForgeryHeader(),
                        type: "DELETE"
                    }).done(function(data) {
                        self.isLoading(false);
                    }).fail(function(xhr) {
                        self.errorOccured(true);
                        self.isLoading(false);
                    });
                },

                /**
                 * Closes the confirm delete dialog
                 */
                closeConfirmDeleteDialog: function() {
                    this.showConfirmDeleteDialog(false);
                    this.markerToDelete = null;
                    this.markerToDeleteManager = null;
                },


                /**
                 * Saves a new marker
                 * 
                 * @param {object} marker New Marker
                 * @param {object} map Map Object
                 * @param {function} removeFunction Remove Function to remove the object in case of an error
                 */
                saveNewMarker: function(marker, map, removeFunction) {
                    this.isLoading(true);

                    var self = this;
                    jQuery.ajax({
                        url: "/api/KartaApi/GetNewMapMarkerId",
                        type: "GET"
                    }).done(function(id) {
                        marker.setId(id);
                        self.saveMarker(marker);
                    }).fail(function() {
                        marker.removeFrom(map);
                        self.currentValidManager.removeMarker(marker);
                        self.isLoading(false);
                        self.errorOccured(true);
                    });
                },

                /**
                 * Sets the marker pixel position
                 * 
                 * @param {object} marker Marker
                 * @param {map} map Map
                 * @param {bool} fromAdd true if the position was set during an add, else false
                 */
                setMarkerPixelPosition: function(marker, map, fromAdd) {
                    var pixelPos = map.project(marker.getLatLng(), map.getMaxZoom());
                    if(!this.isNonDefaultChapterSelected() || fromAdd)
                    {
                        marker.setPixelCoords(pixelPos.x, pixelPos.y);
                    }
                    else
                    {
                        marker.setChapterPixelCoords(this.selectedChapter().number, pixelPos.x, pixelPos.y);
                    }
                },

                /**
                 * Saves the new marker position after a marker was dragged
                 * 
                 * @param {object} marker Marker
                 * @param {map} map Map
                 */
                saveNewMarkerPos: function(marker, map) {
                    this.setMarkerPixelPosition(marker, map, false);

                    this.saveMarker(marker);
                },

                /**
                 * Saves a marker
                 * 
                 * @param {object} marker Marker to save
                 */
                saveMarker: function(marker) {
                    if(this.isReadonly())
                    {
                        return;
                    }

                    var request = {};
                    request[marker.serializePropertyName] = marker.serialize();

                    // Saves the markers
                    this.isLoading(true);
                    var self = this;
                    jQuery.ajax({ 
                        url: "/api/KartaApi/SaveMapMarker?id=" + this.id(), 
                        headers: GoNorth.Util.generateAntiForgeryHeader(),
                        data: JSON.stringify(request), 
                        type: "POST",
                        contentType: "application/json"
                    }).done(function(data) {
                        marker.flagAsNotImplemented();
                        self.isLoading(false);
                    }).fail(function(xhr) {
                        self.errorOccured(true);
                        self.isLoading(false);
                    });
                },

                /**
                 * Resets the marker object data
                 */
                resetMarkerObjectData: function() {
                    this.selectedMarkerObjectId("");
                    if(this.currentValidManager)
                    {
                        this.currentValidManager.resetSelectionData();
                    }
                    this.currentValidManager = null;
                },

                /**
                 * Selects an object id which is valid
                 */
                setCurrentObjectId: function(objectId, markerManager) {
                    this.selectedMarkerObjectId(objectId);
                    if(this.currentValidManager && this.currentValidManager != markerManager)
                    {
                        this.currentValidManager.resetSelectionData();
                    }
                    this.currentValidManager = markerManager;
                },


                /**
                 * Opens the marker name dialog
                 * 
                 * @param {string} existingName Existing name in case of edit
                 */
                openMarkerNameDialog: function(existingName) {
                    this.showMarkerNameDialog(true);
                    this.dialogMarkerName(existingName ? existingName : "");
                    this.dialogMarkerNameDef = new jQuery.Deferred();
                    
                    GoNorth.Util.setupValidation("#gn-markerNameForm");

                    return this.dialogMarkerNameDef.promise();
                },

                /**
                 * Saves the marker name
                 */
                saveMarkerName: function() {
                    if(!jQuery("#gn-markerNameForm").valid())
                    {
                        return;
                    }

                    if(this.dialogMarkerNameDef != null)
                    {
                        this.dialogMarkerNameDef.resolve(this.dialogMarkerName());
                        this.dialogMarkerNameDef = null;
                    }

                    this.closeMarkerNameDialog();
                },

                /**
                 * Closes the marker name dialog
                 */
                closeMarkerNameDialog: function() {
                    this.showMarkerNameDialog(false);
                    this.dialogMarkerName("");

                    if(this.dialogMarkerNameDef != null)
                    {
                        this.dialogMarkerNameDef.reject();
                        this.dialogMarkerNameDef = null;
                    }
                },


                /**
                 * Acquires a lock
                 */
                acquireLock: function() {
                    GoNorth.LockService.releaseCurrentLock();
                    this.lockedByUser("");
                    this.isReadonly(false);

                    var self = this;
                    GoNorth.LockService.acquireLock("KartaMap", this.id()).done(function(isLocked, lockedUsername) { 
                        if(isLocked)
                        {
                            self.isReadonly(true);
                            self.lockedByUser(lockedUsername);
                            self.resetMarkerObjectData();

                            self.kirjaMarkerManager.disable();
                            self.kortistoMarkerManager.disable();
                            self.styrMarkerManager.disable();
                            self.kartaMarkerManager.disable();
                            self.aikaMarkerManager.disable();
                        }
                    }).fail(function() {
                        self.errorOccured(true);
                    });
                }
            };

        }(Karta.Map = Karta.Map || {}));
    }(GoNorth.Karta = GoNorth.Karta || {}));
}(window.GoNorth = window.GoNorth || {}));