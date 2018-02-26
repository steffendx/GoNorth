(function(GoNorth) {
    "use strict";
    (function(Aika) {
        (function(Conditions) {

            /// Condition Type for checking distance of the player to a quest marker
            var conditionTypeCheckQuestMarkerDistance = 10;

            /**
             * Check Quest Marker condition
             * @class
             */
            Conditions.CheckQuestMarkerCondition = function()
            {
                GoNorth.DefaultNodeShapes.Conditions.BaseCondition.apply(this);
                GoNorth.DefaultNodeShapes.Shapes.SharedObjectLoading.apply(this);
            };

            Conditions.CheckQuestMarkerCondition.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.Conditions.BaseCondition.prototype);
            Conditions.CheckQuestMarkerCondition.prototype = jQuery.extend(Conditions.CheckQuestMarkerCondition.prototype, GoNorth.DefaultNodeShapes.Shapes.SharedObjectLoading.prototype);

            /**
             * Returns the type of the condition
             * 
             * @returns {number} Type of the condition
             */
            Conditions.CheckQuestMarkerCondition.prototype.getType = function() {
                return conditionTypeCheckQuestMarkerDistance;
            };

            /**
             * Returns the label of the condition
             * 
             * @returns {string} Label of the condition
             */
            Conditions.CheckQuestMarkerCondition.prototype.getLabel = function() {
                return Aika.Localization.Conditions.CheckQuestMarkerDistanceLabel;
            };

            /**
             * Returns the template name for the condition
             * 
             * @returns {string} Template name
             */
            Conditions.CheckQuestMarkerCondition.prototype.getTemplateName = function() {
                return "gn-nodeConditionQuestMarkerCheck";
            };
            
            /**
             * Returns true if the condition can be selected in the dropdown list, else false
             * 
             * @returns {bool} true if the condition can be selected, else false
             */
            Conditions.CheckQuestMarkerCondition.prototype.canBeSelected = function() {
                return true;
            };


            /**
             * Builds an operator object
             * 
             * @param {string} value Operator value
             * @param {string} label Operato Label
             */
            Conditions.CheckQuestMarkerCondition.prototype.buildOperatorObject = function(value, label) {
                return {
                    value: value,
                    label: label
                };
            }

            /**
             * Returns the data for the condition
             * 
             * @param {object} existingData Existing condition data
             * @param {object} element Element to which the data belongs
             * @returns {object} Condition data
             */
            Conditions.CheckQuestMarkerCondition.prototype.buildConditionData = function(existingData, element) {
                var conditionData = {
                    availableMarkers: new ko.observableArray(),
                    selectedMarker: new ko.observable(),
                    availableOperators: [
                        this.buildOperatorObject("<", Aika.Localization.Conditions.MarkerDistanceCloserThan),
                        this.buildOperatorObject(">", Aika.Localization.Conditions.MarkerDistanceMoreFarThan)
                    ],
                    operator: new ko.observable(),
                    distanceCompare: new ko.observable(0),
                };

                if(existingData)
                {
                    conditionData.distanceCompare(existingData.distanceCompare ? existingData.distanceCompare : 0);
                    conditionData.operator(existingData.operator);
                }

                // Load Quest Markers
                this.loadObjectShared().then(function(markers) {
                    conditionData.availableMarkers(markers);

                    if(existingData)
                    {
                        for(var curMarker = 0; curMarker < markers.length; ++curMarker)
                        {
                            if(markers[curMarker].id == existingData.selectedMarkerId)
                            {
                                conditionData.selectedMarker(markers[curMarker]);
                            }
                        }
                    }
                });

                return conditionData;
            };
            
            /**
             * Serializes condition data
             * 
             * @param {object} conditionData Condition data
             * @returns {object} Serialized data
             */
            Conditions.CheckQuestMarkerCondition.prototype.serializeConditionData = function(conditionData) {
                var distanceCompare = parseFloat(conditionData.distanceCompare());
                if(isNaN(distanceCompare))
                {
                    distanceCompare = 0;
                }
                
                return {
                    selectedMarkerId: conditionData.selectedMarker() ? conditionData.selectedMarker().id : null,
                    operator: conditionData.operator(),
                    distanceCompare: distanceCompare
                };
            };

            /**
             * Returns the objects on which an object depends
             * 
             * @param {object} existingData Existing condition data
             * @returns {object[]} Objects on which the condition depends
             */
            Conditions.CheckQuestMarkerCondition.prototype.getConditionDependsOnObject = function(existingData) {
                return [{
                    objectType: GoNorth.DefaultNodeShapes.Shapes.RelatedToObjectQuest,
                    objectId: Aika.getCurrentQuestId()
                }];
            }

            /**
             * Returns the condition data as a display string
             * 
             * @param {object} existingData Serialzied condition data
             * @returns {jQuery.Deferred} Deferred for the loading process
             */
            Conditions.CheckQuestMarkerCondition.prototype.getConditionString = function(existingData) {
                var def = new jQuery.Deferred();
                
                // Load data and build string
                var self = this;
                this.loadObjectShared().then(function(markers) {
                    if(!existingData.selectedMarkerId)
                    {
                        def.resolve(GoNorth.DefaultNodeShapes.Localization.Conditions.MissingInformations);
                        return;
                    }

                    var markerName = null;
                    for(var curMarker = 0; curMarker < markers.length; ++curMarker)
                    {
                        if(markers[curMarker].id == existingData.selectedMarkerId)
                        {
                            markerName = markers[curMarker].name + "(" + markers[curMarker].mapName + ")";
                        }
                    }

                    if(markerName == null)
                    {
                        def.reject(Aika.Localization.Conditions.MarkerWasDeleted);
                        return;
                    }

                    var conditionText = Aika.Localization.Conditions.MarkerDistance;
                    conditionText += " (\"" + markerName + "\") " + existingData.operator + " ";
                    conditionText += existingData.distanceCompare;
                    def.resolve(conditionText);
                }, function() {
                    def.reject();
                });

                return def.promise();
            };

            /**
             * Returns the object id
             * 
             * @returns {string} Object id
             */
            Conditions.CheckQuestMarkerCondition.prototype.getObjectId = function() {
                return Aika.getCurrentQuestId();
            };

            /**
             * Returns the object resource
             * 
             * @returns {int} Object Resource
             */
            Conditions.CheckQuestMarkerCondition.prototype.getObjectResource = function() {
                return GoNorth.DefaultNodeShapes.Shapes.ObjectResourceMapMarker;
            };

            /**
             * Loads the quest markers
             * 
             * @returns {jQuery.Deferred} Deferred for the async process
             */
            Conditions.CheckQuestMarkerCondition.prototype.loadObject = function() {
                var def = new jQuery.Deferred();
                
                var self = this;
                jQuery.ajax({ 
                    url: "/api/KartaApi/GetAllQuestMarkers?questId=" + Aika.getCurrentQuestId(), 
                    type: "GET"
                }).done(function(data) {
                    def.resolve(data);
                }).fail(function(xhr) {
                    def.reject();
                });

                return def.promise();
            };

            GoNorth.DefaultNodeShapes.Conditions.getConditionManager().addConditionType(new Conditions.CheckQuestMarkerCondition());

        }(Aika.Conditions = Aika.Conditions || {}));
    }(GoNorth.Aika = GoNorth.Aika || {}));
}(window.GoNorth = window.GoNorth || {}));