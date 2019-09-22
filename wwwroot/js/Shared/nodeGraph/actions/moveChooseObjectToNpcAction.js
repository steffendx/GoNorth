(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Actions) {

            /// Indicating am object must be loaded
            var loadTypeObject = 0;

            /// Indicating a npc must be loaded
            var loadTypeNpc = 1;

            /**
             * Move choose object to npcaction
             * @class
             */
            Actions.MoveChooseObjectToNpcAction = function()
            {
                GoNorth.DefaultNodeShapes.Actions.BaseAction.apply(this);
                GoNorth.DefaultNodeShapes.Shapes.SharedObjectLoading.apply(this);
            };

            Actions.MoveChooseObjectToNpcAction.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.Actions.BaseAction.prototype);
            Actions.MoveChooseObjectToNpcAction.prototype = jQuery.extend(Actions.MoveChooseObjectToNpcAction.prototype, GoNorth.DefaultNodeShapes.Shapes.SharedObjectLoading.prototype);

            /**
             * Returns true if the action has a movement state, else false
             * 
             * @returns {bool} true if the action has a movement state, else false
             */
            Actions.MoveChooseObjectToNpcAction.prototype.hasMovementState = function() {
                return false;
            };

            /**
             * Returns the HTML Content of the action
             * 
             * @returns {string} HTML Content of the action
             */
            Actions.MoveChooseObjectToNpcAction.prototype.getContent = function() {
                var templateHtml = "<div class='gn-actionNodeObjectSelectContainer'>" +
                            "<a class='gn-actionNodeObjectSelect gn-clickable'>" + this.getChooseObjectLabel() + "</a>" +
                            "<a class='gn-clickable gn-nodeActionOpenChooseObject' title='" + this.getOpenObjectTooltip() + "' style='display: none'><i class='glyphicon glyphicon-eye-open'></i></a>" +
                        "</div>" + 
                        "<div class='gn-actionNodeObjectSelectionSeperator'>" + this.getSelectionSeperatorLabel() + "</div>" +
                        "<div class='gn-actionNodeObjectSelectContainer'>" +
                            "<a class='gn-actionNodeNpcSelect gn-clickable'>" + DefaultNodeShapes.Localization.Actions.ChooseNpcLabel + "</a>" +
                            "<a class='gn-clickable gn-nodeActionOpenObject' title='" + DefaultNodeShapes.Localization.Actions.OpenNpcTooltip + "' style='display: none'><i class='glyphicon glyphicon-eye-open'></i></a>" +
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
            Actions.MoveChooseObjectToNpcAction.prototype.onInitialized = function(contentElement, actionNode) {
                this.contentElement = contentElement;

                var objectOpenLink = contentElement.find(".gn-nodeActionOpenChooseObject");
                var npcOpenLink = contentElement.find(".gn-nodeActionOpenObject");

                // Deserialize
                var deserializedData = this.deserializeData();
                if(deserializedData) {
                    this.loadObjectFromDeserialize(deserializedData.objectId);
                    this.loadNpc(deserializedData.npcId);
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


                var selectNpcAction = contentElement.find(".gn-actionNodeNpcSelect");
                selectNpcAction.on("click", function() {
                    GoNorth.DefaultNodeShapes.openNpcSearchDialog().then(function(npc) {
                        selectNpcAction.data("npcid", npc.id);
                        selectNpcAction.text(npc.name);
                        
                        self.saveData();

                        npcOpenLink.show();
                    });
                });
                 
                npcOpenLink.on("click", function() {
                    if(selectNpcAction.data("npcid"))
                    {
                        window.open("/Kortisto/Npc?id=" + selectNpcAction.data("npcid"))
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
            Actions.MoveChooseObjectToNpcAction.prototype.deserializeData = function() {
                var actionData = this.nodeModel.get("actionData");
                if(!actionData)
                {
                    return null;
                }

                var data = JSON.parse(actionData);

                var selectObjectAction = this.contentElement.find(".gn-actionNodeObjectSelect");
                selectObjectAction.data("selectedobjectid", data.objectId);

                var selectNpcAction = this.contentElement.find(".gn-actionNodeNpcSelect");
                selectNpcAction.data("npcid", data.npcId);
                
                this.contentElement.find(".gn-nodeActionMovementState").val(data.movementState);

                this.setRelatedToData();

                return data;
            };

            /**
             * Loads the npc
             * @param {string} objectId Id of the npc
             */
            Actions.MoveChooseObjectToNpcAction.prototype.loadObjectFromDeserialize = function(objectId) {
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
             * Loads the npc
             * @param {string} npcId Id of the npc
             */
            Actions.MoveChooseObjectToNpcAction.prototype.loadNpc = function(npcId) {
                if(!npcId) {
                    return;
                }

                var self = this;
                this.loadObjectShared({ loadType: loadTypeNpc, npcId: npcId }).then(function(npc) {
                    if(!npc) 
                    {
                        return;
                    }

                    self.contentElement.find(".gn-actionNodeNpcSelect").text(npc.name);
                    self.contentElement.find(".gn-nodeActionOpenObject").show();
                });
            };

            /**
             * Sets the related to data
             */
            Actions.MoveChooseObjectToNpcAction.prototype.setRelatedToData = function() {
                var additionalRelatedObjects = [];
                var selectObjectAction = this.contentElement.find(".gn-actionNodeObjectSelect");
                if(selectObjectAction.data("selectedobjectid"))
                {
                    this.nodeModel.set("actionRelatedToObjectType", this.getRelatedToObjectType());
                    this.nodeModel.set("actionRelatedToObjectId", selectObjectAction.data("selectedobjectid"));
                    
                }

                var selectNpcAction = this.contentElement.find(".gn-actionNodeNpcSelect");
                if(selectNpcAction.data("npcid"))
                {
                    additionalRelatedObjects.push({
                        objectType: Actions.RelatedToObjectNpc,
                        objectId: selectNpcAction.data("npcid")
                    });
                }

                this.nodeModel.set("actionRelatedToAdditionalObjects", additionalRelatedObjects);
            }

            /**
             * Saves the data
             */
            Actions.MoveChooseObjectToNpcAction.prototype.saveData = function() {
                this.setRelatedToData();
                
                var selectObjectAction = this.contentElement.find(".gn-actionNodeObjectSelect");
                var selectNpcAction = this.contentElement.find(".gn-actionNodeNpcSelect");

                var movementState = this.contentElement.find(".gn-nodeActionMovementState").val();
                if(!movementState)
                {
                    movementState = "";
                }

                var serializeData = {
                    objectId: selectObjectAction.data("selectedobjectid"),
                    npcId: selectNpcAction.data("npcid"),
                    movementState: movementState
                };

                this.nodeModel.set("actionData", JSON.stringify(serializeData));
            };

            
            /**
             * Returns the object id
             * 
             * @returns {string} Object Id
             */
            Actions.MoveChooseObjectToNpcAction.prototype.getObjectId = function(existingData) {
                if(existingData.loadType == loadTypeNpc)
                {
                    return existingData.npcId;
                }

                return existingData.objectId;
            };
            
            /**
             * Returns the object resource
             * 
             * @returns {int} Object Resource
             */
            Actions.MoveChooseObjectToNpcAction.prototype.getObjectResource = function(existingData) {
                if(existingData.loadType == loadTypeNpc)
                {
                    return GoNorth.DefaultNodeShapes.Shapes.ObjectResourceNpc;
                }

                return this.getObjectResourceType();
            };

            /**
             * Loads the npc
             * 
             * @param {string} objectId Extracted object id
             * @param {string} existingData Existing data
             * @returns {jQuery.Deferred} Deferred for the objcet loading
             */
            Actions.MoveChooseObjectToNpcAction.prototype.loadObject = function(objectId, existingData) {
                if(existingData.loadType == loadTypeNpc)
                {
                    var def = new jQuery.Deferred();

                    var selectNpcAction = this.contentElement.find(".gn-actionNodeNpcSelect");
                    jQuery.ajax({ 
                        url: "/api/KortistoApi/FlexFieldObject?id=" + selectNpcAction.data("npcid"), 
                        type: "GET"
                    }).done(function(data) {
                        def.resolve(data);
                    }).fail(function(xhr) {
                        def.reject();
                    });

                    return def.promise();
                }

                return this.loadChoosenObject(existingData.objectId);
            };
            
            /**
             * Returns the config key for the action
             * 
             * @returns {string} Config key
             */
            Actions.MoveChooseObjectToNpcAction.prototype.getConfigKey = function() {
                if(this.hasMovementState())
                {
                    return GoNorth.ProjectConfig.ConfigKeys.SetNpcStateAction;
                }

                return null;
            };

        }(DefaultNodeShapes.Actions = DefaultNodeShapes.Actions || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));