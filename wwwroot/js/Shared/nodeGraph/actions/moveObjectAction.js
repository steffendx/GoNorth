(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Actions) {

            /**
             * Move object action
             * @class
             */
            Actions.MoveObjectAction = function()
            {
                GoNorth.DefaultNodeShapes.Actions.BaseAction.apply(this);
                GoNorth.DefaultNodeShapes.Shapes.SharedObjectLoading.apply(this);
            };

            Actions.MoveObjectAction.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.Actions.BaseAction.prototype);
            Actions.MoveObjectAction.prototype = jQuery.extend(Actions.MoveObjectAction.prototype, GoNorth.DefaultNodeShapes.Shapes.SharedObjectLoading.prototype);

            /**
             * Returns true if the action has a movement state, else false
             * 
             * @returns {bool} true if the action has a movement state, else false
             */
            Actions.MoveObjectAction.prototype.hasMovementState = function() {
                return false;
            };

            /**
             * Returns the HTML Content of the action
             * 
             * @returns {string} HTML Content of the action
             */
            Actions.MoveObjectAction.prototype.getContent = function() {
                var templateHtml = "<div class='gn-actionNodeObjectSelectContainer'>" +
                            "<a class='gn-actionNodeMarkerSelect gn-clickable'>" + DefaultNodeShapes.Localization.Actions.ChooseMarkerLabel + "</a>" +
                            "<a class='gn-clickable gn-nodeActionOpenObject' title='" + DefaultNodeShapes.Localization.Actions.OpenMarkerTooltip + "' style='display: none'><i class='glyphicon glyphicon-eye-open'></i></a>" +
                        "</div>";
                
                if(this.hasMovementState())
                {
                    templateHtml += "<input type='text' class='gn-nodeActionMovementState' placeholder='" + DefaultNodeShapes.Localization.Actions.MovementStatePlaceholder + "' list='gn-" + GoNorth.ProjectConfig.ConfigKeys.SetNpcStateAction + "'/>";
                }

                return templateHtml;
            };

            /**
             * Gets called once the action was intialized
             * 
             * @param {object} contentElement Content element
             * @param {ActionNode} actionNode Parent Action node
             */
            Actions.MoveObjectAction.prototype.onInitialized = function(contentElement, actionNode) {
                this.contentElement = contentElement;

                var markerOpenLink = contentElement.find(".gn-nodeActionOpenObject");

                // Deserialize
                var deserializedData = this.deserializeData();
                if(deserializedData) {
                    this.nodeModel.set("actionRelatedToObjectType", Actions.RelatedToObjectMapMarker);
                    this.nodeModel.set("actionRelatedToObjectId", deserializedData.markerId);
                    this.nodeModel.set("actionRelatedToAdditionalObjects", [{
                        objectType: Actions.RelatedToObjectMap,
                        objectId: deserializedData.mapId
                    }]);

                    this.loadMarkerFromMap(deserializedData.mapId, deserializedData.markerId);
                }

                // Handlers
                var self = this;
                var selectMarkerAction = contentElement.find(".gn-actionNodeMarkerSelect");
                selectMarkerAction.on("click", function() {
                    GoNorth.DefaultNodeShapes.openMarkerSearchDialog().then(function(marker) {
                        selectMarkerAction.data("mapid", marker.mapId);
                        selectMarkerAction.data("markerid", marker.id);
                        selectMarkerAction.data("markertype", marker.markerType);
                        selectMarkerAction.text(marker.name);
                        
                        // Set related object data
                        self.nodeModel.set("actionRelatedToObjectType", Actions.RelatedToObjectMapMarker);
                        self.nodeModel.set("actionRelatedToObjectId", marker.id);
                        self.nodeModel.set("actionRelatedToAdditionalObjects", [{
                            objectType: Actions.RelatedToObjectMap,
                            objectId: marker.mapId
                        }]);

                        self.saveData(marker.mapId, marker.id, marker.markerType)

                        markerOpenLink.show();
                    });
                });
                 
                markerOpenLink.on("click", function() {
                    if(selectMarkerAction.data("markerid"))
                    {
                        window.open("/Karta?id=" + selectMarkerAction.data("mapid") + "&zoomOnMarkerId=" + selectMarkerAction.data("markerid") + "&zoomOnMarkerType=" + selectMarkerAction.data("markertype"))
                    }
                });

                var movementState = contentElement.find(".gn-nodeActionMovementState");
                movementState.change(function(e) {
                    self.saveData();
                });
            };

            /**
             * Deserializes the data
             */
            Actions.MoveObjectAction.prototype.deserializeData = function() {
                var actionData = this.nodeModel.get("actionData");
                if(!actionData)
                {
                    return null;
                }

                var data = JSON.parse(actionData);
                
                var selectMarkerAction = this.contentElement.find(".gn-actionNodeMarkerSelect");
                selectMarkerAction.data("mapid", data.mapId);
                selectMarkerAction.data("markerid", data.markerId);
                selectMarkerAction.data("markertype", data.markerType);
                
                this.contentElement.find(".gn-nodeActionMovementState").val(data.movementState);

                return data;
            };

            /**
             * Loads the marker from a map
             * @param {string} mapId Id of the map
             * @param {string} markerId Id of the marker
             */
            Actions.MoveObjectAction.prototype.loadMarkerFromMap = function(mapId, markerId) {
                var self = this;
                this.loadObjectShared({ mapId: mapId, markerId: markerId }).then(function(marker) {
                    if(!marker) 
                    {
                        return;
                    }

                    self.contentElement.find(".gn-actionNodeMarkerSelect").text(marker.markerName + " (" + marker.mapName + ")");
                    self.contentElement.find(".gn-nodeActionOpenObject").show();
                });
            };

            /**
             * Saves the data
             */
            Actions.MoveObjectAction.prototype.saveData = function() {
                var movementState = this.contentElement.find(".gn-nodeActionMovementState").val();
                if(!movementState)
                {
                    movementState = "";
                }

                var selectMarkerAction = this.contentElement.find(".gn-actionNodeMarkerSelect");

                var serializeData = {
                    mapId: selectMarkerAction.data("mapid"),
                    markerId: selectMarkerAction.data("markerid"),
                    markerType: selectMarkerAction.data("markertype"),
                    movementState: movementState
                };

                this.nodeModel.set("actionData", JSON.stringify(serializeData));
            };

            
            /**
             * Returns the object id
             * 
             * @returns {string} Object Id
             */
            Actions.MoveObjectAction.prototype.getObjectId = function(existingData) {
                return existingData.mapId + "|" + existingData.markerId;
            };
            
            /**
             * Returns the object resource
             * 
             * @returns {int} Object Resource
             */
            Actions.MoveObjectAction.prototype.getObjectResource = function() {
                return GoNorth.DefaultNodeShapes.Shapes.ObjectResourceMapMarker;
            };

            /**
             * Loads the marker
             * 
             * @returns {jQuery.Deferred} Deferred for the marker loading
             */
            Actions.MoveObjectAction.prototype.loadObject = function() {
                var def = new jQuery.Deferred();

                var selectMarkerAction = this.contentElement.find(".gn-actionNodeMarkerSelect");

                GoNorth.HttpClient.get("/api/KartaApi/GetMarker?mapId=" + selectMarkerAction.data("mapid") + "&markerId=" + selectMarkerAction.data("markerid")).done(function(data) {
                    def.resolve(data);
                }).fail(function(xhr) {
                    def.reject();
                });

                return def.promise();
            };

            /**
             * Returns the config key for the action
             * 
             * @returns {string} Config key
             */
            Actions.MoveObjectAction.prototype.getConfigKey = function() {
                if(this.hasMovementState())
                {
                    return GoNorth.ProjectConfig.ConfigKeys.SetNpcStateAction;
                }

                return null;
            };

        }(DefaultNodeShapes.Actions = DefaultNodeShapes.Actions || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));