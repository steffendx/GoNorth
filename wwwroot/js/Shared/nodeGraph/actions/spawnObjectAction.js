(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Actions) {

            /// Indicating am object must be loaded
            var loadTypeObject = 0;

            /// Indicating a marker must be loaded
            var loadTypeMarker = 1;

            /**
             * Spawn object action
             * @class
             */
            Actions.SpawnChooseObjectAction = function()
            {
                GoNorth.DefaultNodeShapes.Actions.BaseAction.apply(this);
                GoNorth.DefaultNodeShapes.Shapes.SharedObjectLoading.apply(this);
            };

            Actions.SpawnChooseObjectAction.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.Actions.BaseAction.prototype);
            Actions.SpawnChooseObjectAction.prototype = jQuery.extend(Actions.SpawnChooseObjectAction.prototype, GoNorth.DefaultNodeShapes.Shapes.SharedObjectLoading.prototype);

            /**
             * Returns the HTML Content of the action
             * 
             * @returns {string} HTML Content of the action
             */
            Actions.SpawnChooseObjectAction.prototype.getContent = function() {
                return "<div class='gn-actionNodeObjectSelectContainer'>" +
                            "<a class='gn-actionNodeObjectSelect gn-clickable'>" + this.getChooseObjectLabel() + "</a>" +
                            "<a class='gn-clickable gn-nodeActionOpenChooseObject' title='" + this.getOpenObjectTooltip() + "' style='display: none'><i class='glyphicon glyphicon-eye-open'></i></a>" +
                        "</div>" + 
                        "<div class='gn-actionNodeObjectSelectionSeperator'>" + this.getSelectionSeperatorLabel() + "</div>" +
                        "<div class='gn-actionNodeObjectSelectContainer gn-spawnObjectMarkerActionContainer'>" +
                            "<a class='gn-actionNodeMarkerSelect gn-spawnObjectMarkerAction gn-clickable'>" + DefaultNodeShapes.Localization.Actions.ChooseMarkerLabel + "</a>" +
                            "<a class='gn-clickable gn-nodeActionOpenObject' title='" + DefaultNodeShapes.Localization.Actions.OpenMarkerTooltip + "' style='display: none'><i class='glyphicon glyphicon-eye-open gn-spawnObjectMarkerActionOpenIcon'></i></a>" +
                        "</div>" +
                        "<div class='gn-actionNodeObjectSelectionSeperator'>" + DefaultNodeShapes.Localization.Actions.RotationLabel + "</div>" +
                        "<div class='gn-actionNodeObjectSelectContainer'>" +
                            "<input type='text' class='gn-actionNodeObjectSpawnRotation gn-actionNodeObjectSpawnRotationPitch' placeholder='" + DefaultNodeShapes.Localization.Actions.PitchLabel + "' value='0'/>" +
                            "<input type='text' class='gn-actionNodeObjectSpawnRotation gn-actionNodeObjectSpawnRotationYaw' placeholder='" + DefaultNodeShapes.Localization.Actions.YawLabel + "' value='0'/>" +
                            "<input type='text' class='gn-actionNodeObjectSpawnRotation gn-actionNodeObjectSpawnRotationRoll' placeholder='" + DefaultNodeShapes.Localization.Actions.RollLabel + "' value='0'/>" +
                        "</div>";
            };

            /**
             * Gets called once the action was intialized
             * 
             * @param {object} contentElement Content element
             * @param {ActionNode} actionNode Parent Action node
             */
            Actions.SpawnChooseObjectAction.prototype.onInitialized = function(contentElement, actionNode) {
                this.contentElement = contentElement;

                var objectOpenLink = contentElement.find(".gn-nodeActionOpenChooseObject");
                var markerOpenLink = contentElement.find(".gn-nodeActionOpenObject");

                // Deserialize
                var deserializedData = this.deserializeData();
                if(deserializedData) {
                    this.loadObjectFromDeserialize(deserializedData.objectId);
                    this.loadMarkerFromMap(deserializedData.mapId, deserializedData.markerId);

                    contentElement.find(".gn-actionNodeObjectSpawnRotationPitch").val(deserializedData.pitch ? deserializedData.pitch : 0);
                    contentElement.find(".gn-actionNodeObjectSpawnRotationYaw").val(deserializedData.yaw ? deserializedData.yaw : 0);
                    contentElement.find(".gn-actionNodeObjectSpawnRotationRoll").val(deserializedData.roll ? deserializedData.roll : 0);
                }

                // Handlers
                var self = this;
                var selectObjectAction = contentElement.find(".gn-actionNodeObjectSelect");
                selectObjectAction.on("click", function() {
                    self.openChooseObjectDialog().then(function(object) {
                        selectObjectAction.data("selectedobjectid", object.id);
                        selectObjectAction.text(object.name);
                        
                        self.saveData();

                        objectOpenLink.show();
                    });
                });

                objectOpenLink.on("click", function() {
                    if(selectObjectAction.data("selectedobjectid"))
                    {
                        self.openObject(selectObjectAction.data("selectedobjectid"))
                    }
                });


                var selectMarkerAction = contentElement.find(".gn-actionNodeMarkerSelect");
                selectMarkerAction.on("click", function() {
                    GoNorth.DefaultNodeShapes.openMarkerSearchDialog().then(function(marker) {
                        selectMarkerAction.data("mapid", marker.mapId);
                        selectMarkerAction.data("markerid", marker.id);
                        selectMarkerAction.data("markertype", marker.markerType);
                        selectMarkerAction.text(marker.name);
                        selectMarkerAction.prop("title", marker.name);
                        
                        self.saveData();

                        markerOpenLink.show();
                    });
                });
                 
                markerOpenLink.on("click", function() {
                    if(selectMarkerAction.data("markerid"))
                    {
                        window.open("/Karta?id=" + selectMarkerAction.data("mapid") + "&zoomOnMarkerId=" + selectMarkerAction.data("markerid") + "&zoomOnMarkerType=" + selectMarkerAction.data("markertype"))
                    }
                });


                var nodeObjectSpawnRotation = contentElement.find(".gn-actionNodeObjectSpawnRotation");
                nodeObjectSpawnRotation.keydown(function(e) {
                    GoNorth.Util.validateNumberKeyPress(jQuery(this), e);
                });

                nodeObjectSpawnRotation.change(function(e) {
                    self.ensureNumberValue(jQuery(this));
                    self.saveData();
                });
            };

            /**
             * Ensures a number value for an input element
             * 
             * @param {object} rotationElement Element with the rotation
             */
            Actions.SpawnChooseObjectAction.prototype.ensureNumberValue = function(rotationElement) {
                var parsedValue = parseInt(rotationElement.val());
                if(isNaN(parsedValue))
                {
                    rotationElement.val("");
                }
            };

            /**
             * Deserializes the data
             */
            Actions.SpawnChooseObjectAction.prototype.deserializeData = function() {
                var actionData = this.nodeModel.get("actionData");
                if(!actionData)
                {
                    return null;
                }

                var data = JSON.parse(actionData);

                var selectObjectAction = this.contentElement.find(".gn-actionNodeObjectSelect");
                selectObjectAction.data("selectedobjectid", data.objectId);

                var selectMarkerAction = this.contentElement.find(".gn-actionNodeMarkerSelect");
                selectMarkerAction.data("mapid", data.mapId);
                selectMarkerAction.data("markerid", data.markerId);
                selectMarkerAction.data("markertype", data.markerType);

                this.setRelatedToData();

                return data;
            };

            /**
             * Loads the marker from a map
             * @param {string} mapId Id of the map
             * @param {string} markerId Id of the marker
             */
            Actions.SpawnChooseObjectAction.prototype.loadObjectFromDeserialize = function(objectId) {
                if(!objectId) {
                    return;
                }

                var self = this;
                this.loadObjectShared({ loadType: loadTypeObject, objectId: objectId }).then(function(loadedObject) {
                    if(!loadedObject) 
                    {
                        return;
                    }

                    self.contentElement.find(".gn-actionNodeObjectSelect").text(loadedObject.name);
                    self.contentElement.find(".gn-nodeActionOpenChooseObject").show();
                });
            };

            /**
             * Loads the marker from a map
             * @param {string} mapId Id of the map
             * @param {string} markerId Id of the marker
             */
            Actions.SpawnChooseObjectAction.prototype.loadMarkerFromMap = function(mapId, markerId) {
                if(!mapId || !markerId) {
                    return;
                }

                var self = this;
                this.loadObjectShared({ loadType: loadTypeMarker, mapId: mapId, markerId: markerId }).then(function(marker) {
                    if(!marker) 
                    {
                        return;
                    }

                    var markerName = marker.markerName + " (" + marker.mapName + ")";
                    self.contentElement.find(".gn-actionNodeMarkerSelect").text(markerName);
                    self.contentElement.find(".gn-actionNodeMarkerSelect").prop("title", markerName);
                    self.contentElement.find(".gn-nodeActionOpenObject").show();
                });
            };

            /**
             * Sets the related to data
             */
            Actions.SpawnChooseObjectAction.prototype.setRelatedToData = function() {
                var additionalRelatedObjects = [];
                var selectObjectAction = this.contentElement.find(".gn-actionNodeObjectSelect");
                if(selectObjectAction.data("selectedobjectid"))
                {
                    this.nodeModel.set("actionRelatedToObjectType", this.getRelatedToObjectType());
                    this.nodeModel.set("actionRelatedToObjectId", selectObjectAction.data("selectedobjectid"));
                    
                }

                var selectMarkerAction = this.contentElement.find(".gn-actionNodeMarkerSelect");
                if(selectMarkerAction.data("markerid"))
                {
                    additionalRelatedObjects.push({
                        objectType: Actions.RelatedToObjectMapMarker,
                        objectId: selectMarkerAction.data("markerid")
                    });
                }

                if(selectMarkerAction.data("mapid"))
                {
                    additionalRelatedObjects.push({
                        objectType: Actions.RelatedToObjectMap,
                        objectId: selectMarkerAction.data("mapid")
                    });
                }
                this.nodeModel.set("actionRelatedToAdditionalObjects", additionalRelatedObjects);
            }

            /**
             * Saves the data
             */
            Actions.SpawnChooseObjectAction.prototype.saveData = function() {
                this.setRelatedToData();
                
                var selectObjectAction = this.contentElement.find(".gn-actionNodeObjectSelect");
                var selectMarkerAction = this.contentElement.find(".gn-actionNodeMarkerSelect");

                var serializeData = {
                    objectId: selectObjectAction.data("selectedobjectid"),
                    mapId: selectMarkerAction.data("mapid"),
                    markerId: selectMarkerAction.data("markerid"),
                    markerType: selectMarkerAction.data("markertype"),
                    pitch: this.extractRotationValue(this.contentElement.find(".gn-actionNodeObjectSpawnRotationPitch")),
                    yaw: this.extractRotationValue(this.contentElement.find(".gn-actionNodeObjectSpawnRotationYaw")),
                    roll: this.extractRotationValue(this.contentElement.find(".gn-actionNodeObjectSpawnRotationRoll"))
                };

                this.nodeModel.set("actionData", JSON.stringify(serializeData));
            };

            /**
             * Extracts a rotation value
             * 
             * @param {object} rotationElement Element with the rotation
             * @returns {float} Rotation
             */
            Actions.SpawnChooseObjectAction.prototype.extractRotationValue = function(rotationElement) {
                var parsedValue = parseInt(rotationElement.val());
                if(isNaN(parsedValue))
                {
                    return 0;
                }

                return parsedValue;
            };

            
            /**
             * Returns the object id
             * 
             * @returns {string} Object Id
             */
            Actions.SpawnChooseObjectAction.prototype.getObjectId = function(existingData) {
                if(existingData.loadType == loadTypeMarker)
                {
                    return existingData.mapId + "|" + existingData.markerId;
                }

                return existingData.objectId;
            };
            
            /**
             * Returns the object resource
             * 
             * @returns {int} Object Resource
             */
            Actions.SpawnChooseObjectAction.prototype.getObjectResource = function(existingData) {
                if(existingData.loadType == loadTypeMarker)
                {
                    return GoNorth.DefaultNodeShapes.Shapes.ObjectResourceMapMarker;
                }

                return this.getObjectResourceType();
            };

            /**
             * Loads the marker or object
             * 
             * @param {string} objectId Extracted object id
             * @param {string} existingData Existing data
             * @returns {jQuery.Deferred} Deferred for the objcet loading
             */
            Actions.SpawnChooseObjectAction.prototype.loadObject = function(objectId, existingData) {
                if(existingData.loadType == loadTypeMarker)
                {
                    var def = new jQuery.Deferred();

                    var selectMarkerAction = this.contentElement.find(".gn-actionNodeMarkerSelect");
                    GoNorth.HttpClient.get("/api/KartaApi/GetMarker?mapId=" + selectMarkerAction.data("mapid") + "&markerId=" + selectMarkerAction.data("markerid")).done(function(data) {
                        def.resolve(data);
                    }).fail(function(xhr) {
                        def.reject();
                    });

                    return def.promise();
                }

                return this.loadChoosenObject(existingData.objectId);
            };

        }(DefaultNodeShapes.Actions = DefaultNodeShapes.Actions || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));