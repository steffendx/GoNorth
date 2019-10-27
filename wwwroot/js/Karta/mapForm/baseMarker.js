(function(GoNorth) {
    "use strict";
    (function(Karta) {
        (function(Map) {

            /// Popup max width
            var popupMaxWidth = 600;

            /// Geometry Types
            var geometryTypes = {
                /// Polygon
                polygon: "Polygon",

                /// Circle
                circle: "Circle",

                /// Line String
                lineString: "LineString",

                /// Rectangle
                rectangle: "Rectangle"
            };

            /// Geometry Id Range
            var geometryIdRange = 100;

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
                this.editGeometryCallback = null;
                this.editCallback = null;
                this.deleteCallback = null;

                this.isDisabled = false;

                this.chapterPixelCoords = [];
                this.addedInChapter = -1;
                this.deletedInChapter = -1;

                this.isTrackingImplementationStatus = false;
                this.isImplemented = false;

                this.disableCopyLink = false;
                this.disableGeometryEditing = false;

                this.markerType = "";

                this.serializePropertyName = "";

                this.compareDialog = null;

                this.popupContentObject = null;

                this.markerGeometry = [];

                this.disableExportNameSetting = false;
                this.editExportNameCallback = null;
                this.exportName = "";
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
                 * Returns the additional popup buttons for the marker
                 * @returns {object[]} Additional popup buttons
                 */
                getAdditionalPopupButtons: function() {
                    return [];
                },

                /**
                 * Binds an additional popup button callback
                 * @param {object} jQueryContent jQuery Content
                 * @param {object} additionalButton Additional button
                 */
                bindAdditionalPopupButtonCallback: function(jQueryContent, additionalButton) {
                    var self = this;
                    jQueryContent.find("." + additionalButton.cssClass).click(function() {
                        additionalButton.callback.apply(self);
                    });
                },

                /**
                 * Builds the export name button html
                 */
                buildExportNameButtonHtml: function() {
                    var additionalClasses = "";
                    var additionalTooltip = "";
                    if(this.exportName) {
                        additionalClasses = " gn-kartaMarkerHasExportName";
                        additionalTooltip = Map.Localization.CurrentExportNameTooltip.replace("{0}", this.exportName);
                    }
                    return "<a class='gn-clickable gn-setExportNameButton" + additionalClasses + "' title='" + Map.Localization.SetExportNameTooltip + additionalTooltip + "'><i class='glyphicon glyphicon-log-in'></i></a>";
                },

                /**
                 * Initializes the marker
                 * 
                 * @param {object} latLng Coordinates of the marker
                 */
                initMarker: function(latLng) {
                    var markerIcon = this.buildIcon();
                    this.marker = L.marker(latLng, { draggable: !this.isDisabled, icon: markerIcon });
                    
                    var self = this;
                    this.marker.bindPopup(function() {
                        self.loadContent().done(function(content) {
                            if(!self.isDisabled)
                            {
                                content += "<div class='gn-kartaPopupButtons'>";

                                var additionalButtons = self.getAdditionalPopupButtons();
                                for(var curButton = 0; curButton < additionalButtons.length; ++curButton)
                                {
                                    content += "<a class='gn-clickable " + additionalButtons[curButton].cssClass + "' title='" + additionalButtons[curButton].title + "'><i class='glyphicon " + additionalButtons[curButton].icon + "'></i></a>";
                                }

                                
                                if(!self.disableExportNameSetting)
                                {
                                   content += self.buildExportNameButtonHtml();
                                }

                                if(!self.disableCopyLink) 
                                {
                                    content += "<a class='gn-clickable gn-kartaCopyMarkerLink' title='" + Map.Localization.CopyLinkToMarkerTooltip + "'><i class='glyphicon glyphicon-link'></i></a>";
                                }
                                if(!self.disableGeometryEditing) 
                                {
                                    content += "<a class='gn-clickable gn-kartaEditMarkerGeometryButton' title='" + Map.Localization.EditMarkerGeometryTooltip + "'><i class='glyphicon glyphicon-record'></i></a>";
                                }
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
                            jQueryContent.find(".gn-setExportNameButton").click(function() {
                                self.callSetExportName();
                            });

                            jQueryContent.find(".gn-kartaCopyMarkerLink").click(function() {
                                self.copyMarkerLink(this);
                            });

                            jQueryContent.find(".gn-kartaEditMarkerGeometryButton").click(function() {
                                self.callEditGeometry();
                            });

                            jQueryContent.find(".gn-kartaEditMarkerButton").click(function() {
                                self.callEdit();
                            });

                            jQueryContent.find(".gn-kartaDeleteMarkerButton").click(function() {
                                self.callDelete();
                            });

                            jQueryContent.find(".gn-kartaMarkAsImplementedMarkerButton").click(function() {
                                self.openCompareDialog(jQueryContent);
                            });

                            if(additionalButtons) {
                                for(var curButton = 0; curButton < additionalButtons.length; ++curButton)
                                {
                                    self.bindAdditionalPopupButtonCallback(jQueryContent, additionalButtons[curButton]);
                                }
                            }
                            
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
                 * Builds the marker icon
                 * 
                 * @returns {object} Marker Icon
                 */
                buildIcon: function() {
                    var iconUrl = this.getIconUrl();
                    if((window.devicePixelRatio || (window.screen.deviceXDPI / window.screen.logicalXDPI)) > 1)
                    {
                        iconUrl = this.getIconRetinaUrl();
                    }

                    var iconLabel = this.getIconLabel();
                    if(!iconLabel)
                    {
                        iconLabel = "";
                    }

                    var markerIcon = new L.DivIcon({
                        iconAnchor: [ 12, 41 ],
                        iconSize: [ 25, 41 ],
                        popupAnchor: [ 1, -43 ],
                        shadowSize: [ 41, 41 ],
                        tooltipAnchor: [ 16, -28 ],
                        
                        className: "gn-kartaIcon",
                        html: "<img class='gn-kartaIconShadowImage' src='/img/karta/markerShadow.png'/>"+
                              "<img src='" + iconUrl + "' style='width: 25px; height: 41px;'/>"+
                              "<div class='gn-kartaIconLabel'>" + iconLabel + "</div>"
                    })

                    return markerIcon;
                },

                /**
                 * Returns the icon label
                 * 
                 * @returns {string} Icon Label
                 */
                getIconLabel: function() {
                    return "";
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
                 * Closes the popup
                 */
                closePopup: function() {
                    if(this.marker)
                    {
                        this.marker.closePopup();
                    }
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
                 * Copys a link to the marker
                 * 
                 * @param {object} markerLinkElement Marker Link Element
                 */
                copyMarkerLink: function(markerLinkElement) {
                    var link = window.location.protocol + "//" + window.location.hostname;
                    if(window.location.port)
                    {
                        link += ":" + window.location.port;
                    }
                    link += "/Karta?id=" + encodeURIComponent(this.mapId) + "&zoomOnMarkerId=" + encodeURIComponent(this.id) + "&zoomOnMarkerType=" + this.markerType;

                    jQuery("#gn-kartaMarkerLinkContainer").remove();
                    jQuery("body").append("<div id='gn-kartaMarkerLinkContainer' style='opacity: 0'><input id='gn-kartaMarkerLink'/></div>");
                    jQuery("#gn-kartaMarkerLink").val(link);

                    var exportResultField = jQuery("#gn-kartaMarkerLink")[0];
                    exportResultField.select();
                    document.execCommand("copy");

                    jQuery("#gn-kartaMarkerLinkContainer").remove();

                    jQuery("#gn-copyToClipboardToolTipContainer").remove();
                    var buttonContainer = jQuery(markerLinkElement).parent();
                    buttonContainer.append("<div id='gn-kartaCopyToLinkSuccessTooltip' class='gn-copyToClipboardToolTipContainer' style='width: 400px;position: absolute;right: 0px;bottom: 37px'><span class='gn-copyToClipboardToolTipText' style='bottom: 140%'>" + Map.Localization.SuccessfullyCopiedToClipboard + "</span></div>");
                    var rightPosition = -(jQuery("#gn-kartaCopyToLinkSuccessTooltip").width() - jQuery(".gn-copyToClipboardToolTipText").outerWidth() / 2) + (buttonContainer.width() - jQuery(markerLinkElement).position().left + 34);
                    jQuery("#gn-kartaCopyToLinkSuccessTooltip").css("right", rightPosition + "px");
                    setTimeout(function() {
                        buttonContainer.find("#gn-kartaCopyToLinkSuccessTooltip").remove();
                    }, 1000);
                },

                /**
                 * Calls the edit geometry callback
                 */
                callEditGeometry: function() {
                    if(this.editGeometryCallback)
                    {
                        this.editGeometryCallback();
                    }
                },

                /**
                 * Sets the edit geometry callback
                 */
                setEditGeometryCallback: function(callback) {
                    this.editGeometryCallback = callback;
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
                 * Calls the set export name callback
                 */
                callSetExportName: function() {
                    if(this.editExportNameCallback)
                    {
                        this.editExportNameCallback();
                    }
                },

                /**
                 * Sets the export name callback
                 */
                setEditExportNameCallback: function(callback) {
                    this.editExportNameCallback = callback;
                },

                /**
                 * Sets the export name
                 * @param {string} exportName Export name
                 */
                setExportName: function(exportName) {
                    this.exportName = exportName;
                    if(this.popupContentObject) {
                        var self = this;
                        this.popupContentObject.find(".gn-setExportNameButton").replaceWith(this.buildExportNameButtonHtml());
                        this.popupContentObject.find(".gn-setExportNameButton").click(function() {
                            self.callSetExportName();
                        });
                    }
                },


                /**
                 * Adds the marker to an object
                 * 
                 * @param {object} map Map object
                 */
                addTo: function(map) {
                    this.marker.addTo(map);

                    if(this.markerGeometry)
                    {
                        for(var curGeo = 0; curGeo < this.markerGeometry.length; ++curGeo)
                        {
                            this.markerGeometry[curGeo].addTo(map);
                        }
                    }
                },

                /**
                 * Removes the marker from an object
                 * 
                 * @param {object} map Map object
                 */
                removeFrom: function(map) {
                    this.marker.removeFrom(map);
                    for(var curGeo = 0; curGeo < this.markerGeometry.length; ++curGeo)
                    {
                        this.markerGeometry[curGeo].removeFrom(map);
                    }
                },


                /**
                 * Checks if the marker is equal to a marker on the map
                 * 
                 * @param {object} marker Marker on the map
                 */
                isMarker: function(marker) {
                    return this.marker != null && this.marker == marker;
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
                 * Adds geometry to the marker
                 * 
                 * @param {object} geometry Geometry to add to the marker
                 */
                addGeometry: function(geometry) {
                    this.markerGeometry.push(geometry);
                },

                /**
                 * Moves the geometry marker
                 * 
                 * @param {object} latLngOffset Lat/Lng Offset
                 */
                moveGeometry: function(latLngOffset) {
                    for(var curGeo = 0; curGeo < this.markerGeometry.length; ++curGeo)
                    {
                        if(this.markerGeometry[curGeo] instanceof L.Rectangle)
                        {
                            var latLngs = this.offsetLatLngsCollection(latLngOffset, this.markerGeometry[curGeo].getLatLngs());
                            this.markerGeometry[curGeo].setLatLngs(latLngs);
                        }
                        else if(this.markerGeometry[curGeo] instanceof L.Circle)
                        {
                            var center = this.markerGeometry[curGeo].getLatLng();
                            center.lat += latLngOffset.lat;
                            center.lng += latLngOffset.lng;
                            this.markerGeometry[curGeo].setLatLng(center);
                        }
                        else if(this.markerGeometry[curGeo] instanceof L.Polygon)
                        {
                            var latLngs = this.offsetLatLngsCollection(latLngOffset, this.markerGeometry[curGeo].getLatLngs());
                            this.markerGeometry[curGeo].setLatLngs(latLngs);
                        }
                        else if(this.markerGeometry[curGeo] instanceof L.Polyline)
                        {
                            var latLngs = this.offsetLatLngs(latLngOffset, this.markerGeometry[curGeo].getLatLngs());
                            this.markerGeometry[curGeo].setLatLngs(latLngs);
                        }

                        if(this.markerGeometry[curGeo].editing && this.markerGeometry[curGeo].editing.enabled())
                        {
                            this.markerGeometry[curGeo].editing.updateMarkers();
                        }
                    }
                },

                /**
                 * Offsets an array of arrays of lat/lngs
                 * 
                 * @param {object} latLngOffset Lat/Lng Offset
                 * @param {object} latLngs Array of lat/lngs
                 * @returns {object[][]} Offset lat/lng coordinates
                 */
                offsetLatLngsCollection: function(latLngOffset, latLngs) {
                    for(var curCoord = 0; curCoord < latLngs.length; ++curCoord)
                    {
                        latLngs[curCoord] = this.offsetLatLngs(latLngOffset, latLngs[curCoord]);
                    }

                    return latLngs;
                },

                /**
                 * Offsets an array of lat/lngs
                 * 
                 * @param {object} latLngOffset Lat/Lng Offset
                 * @param {object} latLngs Array of lat/lngs
                 * @returns {object[]} Offset lat/lng coordinates
                 */
                offsetLatLngs: function(latLngOffset, latLngs) {
                    for(var curCoord = 0; curCoord < latLngs.length; ++curCoord)
                    {
                        latLngs[curCoord].lat += latLngOffset.lat;
                        latLngs[curCoord].lng += latLngOffset.lng;
                    }

                    return latLngs;
                },

                /**
                 * Removes a geometry from the marker
                 * 
                 * @param {object} geometry Geometry to remove from the marker
                 * @param {object} map Map object
                 */
                removeGeometry: function(geometry, map) {
                    for(var curGeo = 0; curGeo < this.markerGeometry.length; ++curGeo)
                    {
                        if(this.markerGeometry[curGeo] == geometry)
                        {
                            this.markerGeometry[curGeo].removeFrom(map);
                            this.markerGeometry.splice(curGeo, 1);
                            return;
                        }
                    }
                },

                /**
                 * Enables the geometry edit mode
                 * 
                 * @param {boolean} allowEdit true wenn bearbeiten erlaubt ist, sonst false
                 * @param {function} editCallback Callback Function that gets called on edit
                 * @param {function} clickCallback Callback Function that gets called on click
                 */
                setGeometryEditMode: function(allowEdit, editCallback, clickCallback) {
                    jQuery.each(this.markerGeometry, function(index, marker) {
                        if(marker.editing)
                        {
                            if(!marker.options.editing)
                            {
                                marker.options.editing = {};
                            }
                            
                            if(allowEdit)
                            {
                                marker.editing.enable();
                                marker.on("edit", editCallback);
                                marker.on("click", function() { clickCallback(marker); });
                                jQuery(marker.getElement()).addClass("gn-kartaGeometryEditable");
                            }
                            else
                            {
                                marker.editing.disable();
                                marker.off("edit");
                                marker.off("click");
                                jQuery(marker.getElement()).removeClass("gn-kartaGeometryEditable");
                            }
                        }
                    });
                },


                /**
                 * Serializes the base data
                 * 
                 * @param {object} map Map object
                 * @returns {object} Serialized Base Data
                 */
                serializeBaseData: function(map) {
                    var serializedData = {
                        id: this.id,
                        x: this.x,
                        y: this.y,
                        addedInChapter: this.addedInChapter,
                        chapterPixelCoords: this.chapterPixelCoords,
                        deletedInChapter: this.deletedInChapter,
                        isImplemented: this.isImplemented,                      
                        geometry: this.serializeGeometry(map),
                        exportName: this.exportName
                    };

                    return serializedData;
                },

                /**
                 * Sets the base data from a serialized data
                 * 
                 * @param {object} serializedData Serialized data
                 * @param {object} map Map object
                 */
                setBaseDataFromSerialized: function(serializedData, map) {
                    this.id = serializedData.id;
                    this.x = serializedData.x;
                    this.y = serializedData.y;
                    this.addedInChapter = serializedData.addedInChapter ? serializedData.addedInChapter : -1;
                    this.chapterPixelCoords = serializedData.chapterPixelCoords;
                    this.deletedInChapter = serializedData.deletedInChapter ? serializedData.deletedInChapter : -1;
                    this.isImplemented = serializedData.isImplemented;
                    this.deserializeGeometry(serializedData.geometry, map);
                    this.exportName = serializedData.exportName ? serializedData.exportName : "";
                },

                /**
                 * Serializes the geometry
                 * 
                 * @param {object} map Map object
                 */
                serializeGeometry: function(map) {
                    var serializedMarkers = [];

                    if(!this.markerGeometry)
                    {
                        return serializedMarkers;
                    }

                    for(var curGeo = 0; curGeo < this.markerGeometry.length; ++curGeo)
                    {
                        var geoType = this.markerGeometry[curGeo].toGeoJSON().geometry.type;
                        var latLngs = null;
                        var radius = null;
                        if(this.markerGeometry[curGeo] instanceof L.Rectangle)
                        {
                            var bounds = this.markerGeometry[curGeo].getBounds();
                            latLngs = [ bounds.getNorthEast(), bounds.getSouthWest() ];
                            geoType = "Rectangle";
                        }
                        else if(this.markerGeometry[curGeo] instanceof L.Circle)
                        {
                            var center = this.markerGeometry[curGeo].getLatLng();
                            radius = this.markerGeometry[curGeo].getRadius();
                            latLngs = [ center ];
                            geoType = "Circle";
                        }
                        else if(geoType == "Polygon")
                        {
                            latLngs = this.markerGeometry[curGeo].getLatLngs()[0];
                        }
                        else
                        {
                            latLngs = this.markerGeometry[curGeo].getLatLngs();
                        }
                        var serializedCoordinates = this.projectGeometryPositions(curGeo * geometryIdRange, latLngs, map);

                        if(radius != null)
                        {
                            var radiusPos = {
                                id: serializedCoordinates[0].id + 1,
                                x: serializedCoordinates[0].x + radius,
                                y: serializedCoordinates[0].y
                            };
                            serializedCoordinates.push(radiusPos);
                        }

                        var serializedData = {
                            id: this.markerGeometry[curGeo].id,
                            geoType: geoType,
                            positions: serializedCoordinates,
                            color: this.markerGeometry[curGeo].options.color
                        };
                        serializedMarkers.push(serializedData);
                    }

                    return serializedMarkers;
                },

                /**
                 * Projects the geometry positions
                 * @param {number} startId Start Id
                 * @param {object[]} positions Positions
                 * @param {object} map Map object
                 * @returns {object[]} projectedPositions
                 */
                projectGeometryPositions: function(startId, positions, map)
                {
                    var positionId = startId;
                    var serializedCoordinates = [];
                    for(var curCoord = 0; curCoord < positions.length; ++curCoord)
                    {
                        var pixelPos = map.project(positions[curCoord], map.getMaxZoom());
                        pixelPos.id = positionId;
                        serializedCoordinates.push(pixelPos);
                        ++positionId;
                    }

                    return serializedCoordinates;
                },

                /**
                 * Deserializes the geometry data
                 * 
                 * @param {object[]} geometry Serialized geometry
                 * @param {object} map Map object
                 */
                deserializeGeometry: function(geometry, map) {
                    this.markerGeometry = [];
                    if(!geometry)
                    {
                        return;
                    }

                    for(var curGeo = 0; curGeo < geometry.length; ++curGeo)
                    {
                        var geoLayer = null;
                        if(geometry[curGeo].geoType == geometryTypes.polygon)
                        {
                            geoLayer = new L.Polygon(this.unprojectGeometryPositions(geometry[curGeo].positions, map));
                        }
                        else if(geometry[curGeo].geoType == geometryTypes.circle)
                        {
                            var radius = geometry[curGeo].positions[1].x - geometry[curGeo].positions[0].x;
                            geoLayer = new L.Circle(this.unprojectGeometryPositions([ geometry[curGeo].positions[0] ], map)[0], { radius: radius });
                        }
                        else if(geometry[curGeo].geoType == geometryTypes.lineString)
                        {
                            geoLayer = new L.Polyline(this.unprojectGeometryPositions(geometry[curGeo].positions, map));
                        }
                        else if(geometry[curGeo].geoType == geometryTypes.rectangle)
                        {
                            geoLayer = new L.Rectangle(this.unprojectGeometryPositions(geometry[curGeo].positions, map));
                        }

                        if(geoLayer)
                        {
                            geoLayer.id = geometry[curGeo].id;
                            geoLayer.setStyle({ fillColor: geometry[curGeo].color, color: geometry[curGeo].color, cursor: 'default' });
                            this.markerGeometry.push(geoLayer);
                        }
                    }
                },

                /**
                 * Unprojects the geometry positions
                 * @param {object[]} positions Positions
                 * @param {object} map Map object
                 */
                unprojectGeometryPositions: function(positions, map)
                {
                    var unprojectedPositions = [];
                    for(var curPos = 0; curPos < positions.length; ++curPos)
                    {
                        var pos = map.unproject([ positions[curPos].x, positions[curPos].y ], map.getMaxZoom());
                        unprojectedPositions.push(pos);
                    }
                    return unprojectedPositions;
                }
            };

        }(Karta.Map = Karta.Map || {}));
    }(GoNorth.Karta = GoNorth.Karta || {}));
}(window.GoNorth = window.GoNorth || {}));