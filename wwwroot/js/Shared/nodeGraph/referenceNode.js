(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Shapes) {

            /// Reference Type
            var referenceType = "default.Reference";
            
            /// Reference Target Array
            var referenceTargetArray = "reference";

            joint.shapes.default = joint.shapes.default || {};

            /**
             * Creates the reference shape
             * @returns {object} reference shape
             * @memberof Shapes
             */
            function createReferenceShape() {
                var model = joint.shapes.devs.Model.extend(
                {
                    defaults: joint.util.deepSupplement
                    (
                        {
                            type: referenceType,
                            icon: "glyphicon-link",
                            size: { width: 250, height: 200 },
                            inPorts: ['input'],
                            outPorts: ['output'],
                            attrs:
                            {
                                '.inPorts circle': { "magnet": "passive", "port-type": "input" },
                                '.outPorts circle': { "magnet": "true" }
                            },
                            referencedObjects: [],
                            referencedMarkerType: "",
                            referenceText: ""
                        },
                        joint.shapes.default.Base.prototype.defaults
                    )
                });
                return model;
            }

            /**
             * Creates a reference view
             * @returns {object} Reference view
             * @memberof Shapes
             */
            function createReferenceView() {
                let baseView = joint.shapes.default.BaseView.extend(
                {
                    /**
                     * Template
                     */
                    template:
                    [
                        '<div class="node">',
                            '<span class="label"><i class="nodeIcon glyphicon"></i><span class="labelText"></span></span>',
                            '<span class="gn-nodeLoading" style="display: none"><i class="glyphicon glyphicon-refresh spinning"></i></span>',
                            '<span class="gn-nodeError text-danger" style="display: none" title="' + GoNorth.DefaultNodeShapes.Localization.ErrorOccured + '"><i class="glyphicon glyphicon-warning-sign"></i></span>',
                            '<button class="delete gn-nodeDeleteOnReadonly cornerButton" title="' + GoNorth.DefaultNodeShapes.Localization.DeleteNode + '" type="button">x</button>',
                            '<div class="gn-referenceNodeLink">',
                                '<a class="gn-clickable gn-nodeNonClickableOnReadonly objectChooseLink"></a>',
                                '<a class="gn-clickable gn-nodeActionOpenObject" title="' + DefaultNodeShapes.Localization.Reference.OpenObjectTooltip + '" style="display: none"><i class="glyphicon glyphicon-eye-open"></i></a>',
                            '</div>',
                            '<textarea class="gn-referenceText" placeholder="' + GoNorth.DefaultNodeShapes.Localization.Reference.ReferenceText + '"></textarea>',
                        '</div>',
                    ].join(''),

                    /**
                     * Initializes the shape
                     */
                    initialize: function() {
                        joint.shapes.default.BaseView.prototype.initialize.apply(this, arguments);
                        GoNorth.DefaultNodeShapes.Shapes.SharedObjectLoading.apply(this);

                        var self = this;
                        this.$box.find('.gn-referenceText').on('change', function(evt)
                        {
                            self.model.set('referenceText', jQuery(evt.target).val());
                        });

                        this.$box.find('.objectChooseLink').on("click", function() {
                            GoNorth.DefaultNodeShapes.openGeneralObjectSearchDialog().then(function(selectedObject) {
                                var referencedMarkerType = "";
                                var dependencyObjects = [{
                                    objectType: selectedObject.objectType,
                                    objectId: selectedObject.eventId ? selectedObject.eventId : selectedObject.id
                                }];
                                if(selectedObject.parentObject) {
                                    dependencyObjects.push({
                                        objectType: GoNorth.DefaultNodeShapes.Actions.RelatedToObjectNpc,
                                        objectId: selectedObject.parentObject.id
                                    });
                                }
                                if(selectedObject.mapId) {
                                    dependencyObjects.push({
                                        objectType: GoNorth.DefaultNodeShapes.Actions.RelatedToObjectMap,
                                        objectId: selectedObject.mapId
                                    });
                                    referencedMarkerType = selectedObject.markerType;
                                }

                                self.model.set('referencedObjects', dependencyObjects);
                                self.model.set('referencedMarkerType', referencedMarkerType);
                                var objectName = selectedObject.name;
                                if(selectedObject.additionalName) {
                                    objectName += " (" + selectedObject.additionalName + ")";
                                }
                                self.setLinkLabel(objectName, selectedObject.objectType);
                            });
                        });
                        
                        this.$box.find('.gn-nodeActionOpenObject').on("click", function() {
                            self.openObject();
                        });

                        this.syncModelData();
                    },

                    /**
                     * Syncs the model data
                     */
                    syncModelData: function() {
                        this.$box.find('.gn-referenceText').val(this.model.get('referenceText'));

                        var selectionText = GoNorth.DefaultNodeShapes.Localization.Reference.ChooseObject;
                        this.$box.find('.objectChooseLink').text(selectionText);

                        var referencedObjects = this.model.get('referencedObjects');
                        if(referencedObjects && referencedObjects.length > 0)
                        {
                            var self = this;
                            self.hideError();
                            self.showLoading();
                            this.loadReferencedObjectName(referencedObjects).then(function(name) {
                                self.hideLoading();
                                self.setLinkLabel(name, referencedObjects[0].objectType);
                            }, function() {
                                self.showError();
                                self.hideLoading();
                            });
                        }
                    },

                    /**
                     * Sets the link label
                     * @param {string} objectName Object name
                     * @param {string} objectType Object type
                     */
                    setLinkLabel: function(objectName, objectType) {
                        var iconName = "";
                        if(objectType == GoNorth.DefaultNodeShapes.Actions.RelatedToObjectNpc) 
                        {
                            iconName = "glyphicon-user";
                        }
                        else if(objectType == GoNorth.DefaultNodeShapes.Actions.RelatedToObjectItem) 
                        {
                            iconName = "glyphicon-apple";
                        }
                        else if(objectType == GoNorth.DefaultNodeShapes.Actions.RelatedToObjectSkill) 
                        {
                            iconName = "glyphicon-flash";
                        }
                        else if(objectType == GoNorth.DefaultNodeShapes.Actions.RelatedToObjectQuest) 
                        {
                            iconName = "glyphicon-king";
                        }
                        else if(objectType == GoNorth.DefaultNodeShapes.Actions.RelatedToWikiPage) 
                        {
                            iconName = "glyphicon-book";
                        }
                        else if(objectType == GoNorth.DefaultNodeShapes.Actions.RelatedToObjectDailyRoutine) 
                        {
                            iconName = "glyphicon-hourglass";
                        }
                        else if(objectType == GoNorth.DefaultNodeShapes.Actions.RelatedToObjectMapMarker) 
                        {
                            iconName = "glyphicon-map-marker";
                        }

                        var htmlContent = "<i class='glyphicon " + iconName + "'></i>&nbsp;" + objectName;
                        this.$box.find('.objectChooseLink').html(htmlContent);
                        this.$box.find('.gn-nodeActionOpenObject').show();
                    },

                    /**
                     * Opens an object 
                     */
                    openObject: function() {
                        let referencedObjects = this.model.get("referencedObjects");
                        if(!referencedObjects || referencedObjects.length == 0) {
                            return;
                        }

                        var referencedObject = referencedObjects[0];
                        var url = "";
                        if(referencedObject.objectType == GoNorth.DefaultNodeShapes.Actions.RelatedToObjectNpc) 
                        {
                            url = "/Kortisto/Npc?id=" + referencedObject.objectId;
                        }
                        else if(referencedObject.objectType == GoNorth.DefaultNodeShapes.Actions.RelatedToObjectItem) 
                        {
                            url = "/Styr/Item?id=" + referencedObject.objectId;
                        }
                        else if(referencedObject.objectType == GoNorth.DefaultNodeShapes.Actions.RelatedToObjectSkill) 
                        {
                            url = "/Evne/Skill?id=" + referencedObject.objectId;
                        }
                        else if(referencedObject.objectType == GoNorth.DefaultNodeShapes.Actions.RelatedToObjectQuest) 
                        {
                            url = "/Aika/Quest?id=" + referencedObject.objectId;
                        }
                        else if(referencedObject.objectType == GoNorth.DefaultNodeShapes.Actions.RelatedToWikiPage) 
                        {
                            url = "/Kirja?id=" + referencedObject.objectId;
                        }
                        else if(referencedObject.objectType == GoNorth.DefaultNodeShapes.Actions.RelatedToObjectDailyRoutine && referencedObjects.length > 1) 
                        {
                            url = "/Kortisto/Npc?id=" + referencedObjects[1].objectId;
                        }
                        else if(referencedObject.objectType == GoNorth.DefaultNodeShapes.Actions.RelatedToObjectMapMarker && referencedObjects.length > 1) 
                        {
                            url = "/Karta?id=" + referencedObjects[1].objectId + "&zoomOnMarkerId=" + referencedObjects[0].objectId + "&zoomOnMarkerType=" + this.model.get("referencedMarkerType");
                        }

                        if(url) 
                        {
                            window.open(url);
                        }
                    },

                    /**
                     * Returns the display name of a daily routine
                     * @param {object} dailyRoutineEvent Daily routine event to format
                     * @returns {string} Formatted Dialy routine event
                     */
                    getDailyRoutineDisplayName: function(dailyRoutineEvent) {
                        var displayName = GoNorth.DailyRoutines.Util.formatTimeSpan(GoNorth.DefaultNodeShapes.Localization.Reference.TimeFormat, dailyRoutineEvent.earliestTime, dailyRoutineEvent.latestTime);
                        var additionalName = "";
                        if (dailyRoutineEvent.scriptName) 
                        {
                            additionalName = dailyRoutineEvent.scriptName;
                        }
                        else if (dailyRoutineEvent.movementTarget && dailyRoutineEvent.movementTarget.name) 
                        {
                            additionalName = dailyRoutineEvent.movementTarget.name;
                        }
    
                        if (additionalName) {
                            displayName += " (" + additionalName + ")";
                        }
                        return displayName;
                    },

                    /**
                     * Loads the referenced object name
                     * @param referencedObjects Referenced objects
                     * @returns {jQuery.Deferred} Deferred for the loading proccess 
                     */
                    loadReferencedObjectName: function(referencedObjects) {
                        var def = new jQuery.Deferred();

                        var self = this;
                        this.loadObjectShared(referencedObjects).then(function(object) {
                            if(referencedObjects[0].objectType == GoNorth.DefaultNodeShapes.Actions.RelatedToObjectDailyRoutine) 
                            {                                
                                for(var curEvent = 0; curEvent < object.dailyRoutine.length; ++curEvent)
                                {
                                    if(object.dailyRoutine[curEvent].eventId == referencedObjects[0].objectId)
                                    {
                                        var displayName = self.getDailyRoutineDisplayName(object.dailyRoutine[curEvent]);
                                        def.resolve(displayName);
                                        return;
                                    }
                                }
                                def.resolve("<MISSING>");
                            }
                            else if(referencedObjects[0].objectType == GoNorth.DefaultNodeShapes.Actions.RelatedToObjectMapMarker) 
                            {
                                def.resolve(object.markerName + " (" + object.mapName + ")");
                            }
                            else
                            {
                                def.resolve(object.name);
                            }
                        }, function(e) {
                            def.reject(e);
                        })

                        return def.promise();
                    },

                    /**
                     * Shows the loading indicator
                     */
                    showLoading: function() {
                        this.$box.find(".gn-nodeLoading").show();
                    },

                    /**
                     * Hides the loading indicator
                     */
                    hideLoading: function() {
                        this.$box.find(".gn-nodeLoading").hide();
                    },


                    /**
                     * Shows the error indicator
                     */
                    showError: function() {
                        this.$box.find(".gn-nodeError").show();
                    },

                    /**
                     * Hides the error indicator
                     */
                    hideError: function() {
                        this.$box.find(".gn-nodeError").hide();
                    },


                    /**
                     * Returns statistics for the node
                     * @returns Node statistics
                     */
                    getStatistics: function() {
                        return {
                            wordCount: GoNorth.Util.getWordCount(this.model.get('referenceText'))
                        };
                    }
                });
                baseView.prototype = jQuery.extend(baseView.prototype, GoNorth.DefaultNodeShapes.Shapes.SharedObjectLoading.prototype);
                
                /**
                 * Returns the object id
                 * 
                 * @param {object[]} referencedObjects Referenced objects
                 * @returns {string} Object Id
                 */
                baseView.prototype.getObjectId = function(referencedObjects) {
                    var referencedObject = referencedObjects[0];
                    if(referencedObject.objectType == GoNorth.DefaultNodeShapes.Actions.RelatedToObjectDailyRoutine) 
                    {
                        return referencedObjects[1].objectId;
                    }
                    else if(referencedObject.objectType == GoNorth.DefaultNodeShapes.Actions.RelatedToObjectMapMarker) 
                    {
                        return referencedObjects[1].objectId + "|" + referencedObjects[0].objectId;
                    }

                    return referencedObject.objectId;
                };

                /**
                 * Returns the object resource
                 * 
                 * @param {object[]} referencedObjects Referenced objects
                 * @returns {int} Object Resource
                 */
                baseView.prototype.getObjectResource = function(referencedObjects) {
                    var referencedObject = referencedObjects[0];
                    if(referencedObject.objectType == GoNorth.DefaultNodeShapes.Actions.RelatedToObjectNpc || referencedObject.objectType == GoNorth.DefaultNodeShapes.Actions.RelatedToObjectDailyRoutine) 
                    {
                        return GoNorth.DefaultNodeShapes.Shapes.ObjectResourceNpc;
                    }
                    else if(referencedObject.objectType == GoNorth.DefaultNodeShapes.Actions.RelatedToObjectItem) 
                    {
                        return GoNorth.DefaultNodeShapes.Shapes.ObjectResourceItem;
                    }
                    else if(referencedObject.objectType == GoNorth.DefaultNodeShapes.Actions.RelatedToObjectSkill) 
                    {
                        return GoNorth.DefaultNodeShapes.Shapes.ObjectResourceSkill;
                    }
                    else if(referencedObject.objectType == GoNorth.DefaultNodeShapes.Actions.RelatedToObjectQuest) 
                    {
                        return GoNorth.DefaultNodeShapes.Shapes.ObjectResourceQuest;
                    }
                    else if(referencedObject.objectType == GoNorth.DefaultNodeShapes.Actions.RelatedToWikiPage) 
                    {
                        return GoNorth.DefaultNodeShapes.Shapes.ObjectResourceWikiPage;
                    }
                    else if(referencedObject.objectType == GoNorth.DefaultNodeShapes.Actions.RelatedToObjectMapMarker) 
                    {
                        return GoNorth.DefaultNodeShapes.Shapes.ObjectResourceMapMarker;
                    }
                };

                /**
                 * Loads a referenced object
                 * @param {string} objectId Id of the object to load
                 * @param {object[]} referencedObjects Referenced objects
                 */
                baseView.prototype.loadObject = function(objectId, referencedObjects) {
                    var url = "";
                    var referencedObject = referencedObjects[0];
                    if(referencedObject.objectType == GoNorth.DefaultNodeShapes.Actions.RelatedToObjectNpc || referencedObject.objectType == GoNorth.DefaultNodeShapes.Actions.RelatedToObjectDailyRoutine) 
                    {
                        url = "/api/KortistoApi/FlexFieldObject?id=" + objectId;
                    }
                    else if(referencedObject.objectType == GoNorth.DefaultNodeShapes.Actions.RelatedToObjectItem) 
                    {
                        url = "/api/StyrApi/FlexFieldObject?id=" + objectId;
                    }
                    else if(referencedObject.objectType == GoNorth.DefaultNodeShapes.Actions.RelatedToObjectSkill) 
                    {
                        url = "/api/EvneApi/FlexFieldObject?id=" + objectId;
                    }
                    else if(referencedObject.objectType == GoNorth.DefaultNodeShapes.Actions.RelatedToObjectQuest) 
                    {
                        url = "/api/AikaApi/GetQuest?id=" + objectId;
                    }
                    else if(referencedObject.objectType == GoNorth.DefaultNodeShapes.Actions.RelatedToWikiPage) 
                    {
                        url = "/api/KirjaApi/Page?id=" + objectId;
                    }
                    else if(referencedObject.objectType == GoNorth.DefaultNodeShapes.Actions.RelatedToObjectMapMarker) 
                    {
                        url = "/api/KartaApi/GetMarker?mapId=" + referencedObjects[1].objectId + "&markerId=" + referencedObjects[0].objectId;
                    }
                    
                    return GoNorth.HttpClient.get(url);
                };

                return baseView;
            }

            /**
             * Reference Shape
             */
            joint.shapes.default.Reference = createReferenceShape();

            /**
             * Reference View
             */
            joint.shapes.default.ReferenceView = createReferenceView();


            /** 
             * Reference Serializer 
             * 
             * @class
             */
            Shapes.ReferenceSerializer = function()
            {
                GoNorth.DefaultNodeShapes.Serialize.BaseNodeSerializer.apply(this, [ joint.shapes.default.Reference, referenceType, referenceTargetArray ]);
            };

            Shapes.ReferenceSerializer.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.Serialize.BaseNodeSerializer.prototype)

            /**
             * Serializes a node
             * 
             * @param {object} node Node Object
             * @returns {object} Serialized NOde
             */
            Shapes.ReferenceSerializer.prototype.serialize = function(node) {
                var serializedData = {
                    id: node.id,
                    x: node.position.x,
                    y: node.position.y,
                    referencedObjects: node.referencedObjects,
                    referenceText: node.referenceText
                };

                return serializedData;
            };

            /**
             * Deserializes a serialized node
             * 
             * @param {object} node Serialized Node Object
             * @returns {object} Deserialized Node
             */
            Shapes.ReferenceSerializer.prototype.deserialize = function(node) {
                var initOptions = {
                    id: node.id,
                    position: { x: node.x, y: node.y },
                    referencedObjects: node.referencedObjects,
                    referenceText: node.referenceText
                };

                var node = new this.classType(initOptions);
                return node;
            };

            // Register Serializers
            var referenceSerializer = new Shapes.ReferenceSerializer();
            GoNorth.DefaultNodeShapes.Serialize.getNodeSerializerInstance().addNodeSerializer(referenceSerializer);

        }(DefaultNodeShapes.Shapes = DefaultNodeShapes.Shapes || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));