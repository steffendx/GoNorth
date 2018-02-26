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