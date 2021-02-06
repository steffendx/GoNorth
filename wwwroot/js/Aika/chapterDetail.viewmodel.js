(function(GoNorth) {
    "use strict";
    (function(ChooseObjectDialog) {

        /// Dialog Page Size
        var dialogPageSize = 15;

        /// Object Type for npcs
        var objectTypeNpc = 0;

        /// Object Type for items
        var objectTypeItem = 1;

        /// Object Type for skills
        var objectTypeSkill = 2;

        /// Object Type for quest
        var objectTypeQuest = 3;

        /// Object Type for wiki page
        var objectTypeWikiPage = 4;

        /// Object Type for daily routines
        var objectTypeDailyRoutine = 5;

        /// Object Type for marker
        var objectTypeMarker = 6;

        /**
         * Page View Model
         * @class
         */
        ChooseObjectDialog.ViewModel = function()
        {
            this.showDialog = new ko.observable(false);
            this.showObjectTypeSelection = new ko.observable(false);
            this.dialogTitle = new ko.observable("");
            this.showNewButtonInDialog = new ko.observable(false);
            this.dialogSearchCallback = null;
            this.dialogCreateNewCallback = null;
            this.dialogSearchPattern = new ko.observable("");
            this.dialogIsLoading = new ko.observable(false);
            this.dialogEntries = new ko.observableArray();
            this.dialogHasMore = new ko.observable(false);
            this.dialogCurrentPage = new ko.observable(0);
            this.errorOccured = new ko.observable(false);
            this.idObservable = null;

            var self = this;
            this.selectedObjectType = new ko.observable(null);
            this.selectedObjectType.subscribe(function() {
                self.onObjectTypeChanged();
            });
            this.availableObjectTypes = [
                { objectType: objectTypeNpc, objectLabel: GoNorth.ChooseObjectDialog.Localization.ObjectTypeNpc },
                { objectType: objectTypeItem, objectLabel: GoNorth.ChooseObjectDialog.Localization.ObjectTypeItem },
                { objectType: objectTypeSkill, objectLabel: GoNorth.ChooseObjectDialog.Localization.ObjectTypeSkill },
                { objectType: objectTypeQuest, objectLabel: GoNorth.ChooseObjectDialog.Localization.ObjectTypeQuest },
                { objectType: objectTypeWikiPage, objectLabel: GoNorth.ChooseObjectDialog.Localization.ObjectTypeWikiPage },
                { objectType: objectTypeDailyRoutine, objectLabel: GoNorth.ChooseObjectDialog.Localization.ObjectTypeDailyRoutine },
                { objectType: objectTypeMarker, objectLabel: GoNorth.ChooseObjectDialog.Localization.ObjectTypeMarker }
            ];

            this.choosingDeferred = null;
        };

        ChooseObjectDialog.ViewModel.prototype = {
            /**
             * Opens the dialog to search for general objects
             * 
             * @param {string} dialogTitle Title of the dialog
             * @returns {jQuery.Deferred} Deferred for the selecting process
             */
            openGeneralObjectSearch: function(dialogTitle) {
                this.showObjectTypeSelection(true);
                this.selectedObjectType(this.availableObjectTypes[0]);
                return this.openDialog(dialogTitle, this.searchNpcs, null, null);
            },
            
            /**
             * Opens the dialog to search for npcs
             * 
             * @param {string} dialogTitle Title of the dialog
             * @param {function} createCallback Optional callback that will get triggered on hitting the new button, if none is provided the button will be hidden
             * @returns {jQuery.Deferred} Deferred for the selecting process
             */
            openNpcSearch: function(dialogTitle, createCallback) {
                this.showObjectTypeSelection(false);
                return this.openDialog(dialogTitle, this.searchNpcs, createCallback, null);
            },

            /**
             * Opens the dialog to search for items
             * 
             * @param {string} dialogTitle Title of the dialog
             * @param {function} createCallback Optional callback that will get triggered on hitting the new button, if none is provided the button will be hidden
             * @returns {jQuery.Deferred} Deferred for the selecting process
             */
            openItemSearch: function(dialogTitle, createCallback) {
                this.showObjectTypeSelection(false);
                return this.openDialog(dialogTitle, this.searchItems, createCallback, null);
            },

            /**
             * Opens the dialog to search for skills
             * 
             * @param {string} dialogTitle Title of the dialog
             * @param {function} createCallback Optional callback that will get triggered on hitting the new button, if none is provided the button will be hidden
             * @returns {jQuery.Deferred} Deferred for the selecting process
             */
            openSkillSearch: function(dialogTitle, createCallback) {
                this.showObjectTypeSelection(false);
                return this.openDialog(dialogTitle, this.searchSkills, createCallback, null);
            },

            /**
             * Opens the dialog to search for kirja pages
             * 
             * @param {string} dialogTitle Title of the dialog
             * @param {function} createCallback Optional callback that will get triggered on hitting the new button, if none is provided the button will be hidden
             * @param {ko.observable} idObservable Optional id observable which will be used to exclude the current object from the search
             * @returns {jQuery.Deferred} Deferred for the selecting process
             */
            openKirjaPageSearch: function(dialogTitle, createCallback, idObservable) {
                this.showObjectTypeSelection(false);
                return this.openDialog(dialogTitle, this.searchPages, createCallback, idObservable);
            },

            /**
             * Opens the dialog to search for quests
             * 
             * @param {string} dialogTitle Title of the dialog
             * @param {function} createCallback Optional callback that will get triggered on hitting the new button, if none is provided the button will be hidden
             * @returns {jQuery.Deferred} Deferred for the selecting process
             */
            openQuestSearch: function(dialogTitle, createCallback) {
                this.showObjectTypeSelection(false);
                return this.openDialog(dialogTitle, this.searchQuest, createCallback, null);
            },

            /**
             * Opens the dialog to search for chapter details
             * 
             * @param {string} dialogTitle Title of the dialog
             * @param {function} createCallback Optional callback that will get triggered on hitting the new button, if none is provided the button will be hidden
             * @param {ko.observable} idObservable Optional id observable which will be used to exclude the current object from the search
             * @returns {jQuery.Deferred} Deferred for the selecting process
             */
            openChapterDetailSearch: function(dialogTitle, createCallback, idObservable) {
                this.showObjectTypeSelection(false);
                return this.openDialog(dialogTitle, this.searchChapterDetails, createCallback, idObservable);
            },

            /**
             * Opens the dialog to search for daily routines
             * 
             * @param {string} dialogTitle Title of the dialog
             * @returns {jQuery.Deferred} Deferred for the selecting process
             */
            openDailyRoutineSearch: function(dialogTitle) {
                this.showObjectTypeSelection(false);
                return this.openDialog(dialogTitle, this.searchDailyRoutines, null, null);
            },

            /**
             * Opens the dialog to search for markers
             * 
             * @param {string} dialogTitle Title of the dialog
             * @returns {jQuery.Deferred} Deferred for the selecting process
             */
            openMarkerSearch: function(dialogTitle) {
                this.showObjectTypeSelection(false);
                return this.openDialog(dialogTitle, this.searchMarkers, null, null);
            },

            /**
             * Opens the dialog
             * 
             * @param {string} dialogTitle Title of the dialog
             * @param {function} searchCallback Function that gets called on starting a search
             * @param {function} createCallback Function that gets called on hitting t he new button
             * @param {ko.observable} idObservable Optional id observable which will be used to exclude the current object from the search
             * @returns {jQuery.Deferred} Deferred for the selecting process
             */
            openDialog: function(dialogTitle, searchCallback, createCallback, idObservable) {
                if(this.choosingDeferred)
                {
                    this.choosingDeferred.reject();
                    this.choosingDeferred = null;
                }

                this.showDialog(true);
                this.dialogTitle(dialogTitle);
                this.dialogCreateNewCallback = typeof createCallback == "function" ? createCallback : null;
                this.showNewButtonInDialog(this.dialogCreateNewCallback ? true : false);
                this.dialogSearchCallback = searchCallback;
                this.resetDialogValues();
                this.idObservable = idObservable;

                this.choosingDeferred = new jQuery.Deferred();
                return this.choosingDeferred.promise();
            },

            /**
             * Resets the dialog values
             */
            resetDialogValues: function() {
                this.dialogSearchPattern("");
                this.dialogIsLoading(false);
                this.dialogEntries([]);
                this.dialogHasMore(false);
                this.dialogCurrentPage(0);
            },

            /**
             * Gets called if the selected object type is changed
             */
            onObjectTypeChanged: function() {
                this.resetDialogValues();

                var objectType = this.selectedObjectType().objectType;
                if(objectType == objectTypeNpc) 
                {
                    this.dialogSearchCallback = this.searchNpcs;
                }
                else if(objectType == objectTypeItem) 
                {
                    this.dialogSearchCallback = this.searchItems;
                }
                else if(objectType == objectTypeSkill) 
                {
                    this.dialogSearchCallback = this.searchSkills;
                }
                else if(objectType == objectTypeQuest) 
                {
                    this.dialogSearchCallback = this.searchQuest;
                }
                else if(objectType == objectTypeWikiPage) 
                {
                    this.dialogSearchCallback = this.searchPages;
                }
                else if(objectType == objectTypeDailyRoutine) 
                {
                    this.dialogSearchCallback = this.searchDailyRoutines;
                }
                else if(objectType == objectTypeMarker) 
                {
                    this.dialogSearchCallback = this.searchMarkers;
                }
            },

            /**
             * Expands an object if it has an expand callback, or selects an object
             * @param {object} selectedObject Selected object
             */
            handleObjectClick: function(selectedObject) {
                if(selectedObject.expandCallback) 
                {
                    selectedObject.expandCallback(selectedObject);
                }
                else
                {
                    this.selectObject(selectedObject);
                }
            },

            /**
             * Selects an object
             * 
             * @param {object} selectedObject Selected object
             */
            selectObject: function(selectedObject) {
                if(this.choosingDeferred)
                {
                    if(this.showObjectTypeSelection())
                    {
                        selectedObject.objectType = this.getDependencyObjectType();
                    }
                    this.choosingDeferred.resolve(selectedObject);
                    this.choosingDeferred = null;
                }

                this.closeDialog();
            },

            /**
             * Returns the dependency object type
             * @returns {string} Dependency object type
             */
            getDependencyObjectType: function() {
                var objectType = this.selectedObjectType().objectType;
                if(objectType == objectTypeNpc) 
                {
                    return GoNorth.DefaultNodeShapes.Actions.RelatedToObjectNpc;
                }
                else if(objectType == objectTypeItem) 
                {
                    return GoNorth.DefaultNodeShapes.Actions.RelatedToObjectItem;
                }
                else if(objectType == objectTypeSkill) 
                {
                    return GoNorth.DefaultNodeShapes.Actions.RelatedToObjectSkill;
                }
                else if(objectType == objectTypeQuest) 
                {
                    return GoNorth.DefaultNodeShapes.Actions.RelatedToObjectQuest;
                }
                else if(objectType == objectTypeWikiPage) 
                {
                    return GoNorth.DefaultNodeShapes.Actions.RelatedToWikiPage;
                }
                else if(objectType == objectTypeDailyRoutine) 
                {
                    return GoNorth.DefaultNodeShapes.Actions.RelatedToObjectDailyRoutine;
                }
                else if(objectType == objectTypeMarker) 
                {
                    return GoNorth.DefaultNodeShapes.Actions.RelatedToObjectMapMarker;
                }

                return "";
            },

            /**
             * Cancels the dialog
             */
            cancelDialog: function() {
                if(this.choosingDeferred)
                {
                    this.choosingDeferred.reject();
                    this.choosingDeferred = null;
                }

                this.closeDialog();
            },

            /**
             * Closes the dialog
             */
            closeDialog: function() {
                this.showDialog(false);
            },

            /**
             * Starts a new dialog search
             */
            startNewDialogSearch: function() {
                this.dialogCurrentPage(0);
                this.dialogHasMore(false);
                this.runDialogSearch();
            },

            /**
             * Loads the previous dialog page
             */
            prevDialogPage: function() {
                this.dialogCurrentPage(this.dialogCurrentPage() - 1);
                this.runDialogSearch();
            },

            /**
             * Loads the previous dialog page
             */
            nextDialogPage: function() {
                this.dialogCurrentPage(this.dialogCurrentPage() + 1);
                this.runDialogSearch();
            },

            /**
             * Runs the dialog search
             */
            runDialogSearch: function() {
                this.dialogIsLoading(true);
                this.errorOccured(false);
                var self = this;
                this.dialogSearchCallback(this.dialogSearchPattern()).done(function(result) {
                    self.dialogHasMore(result.hasMore);
                    self.dialogEntries(result.entries);
                    self.dialogIsLoading(false);
                }).fail(function() {
                    self.errorOccured(true);
                    self.dialogIsLoading(false);
                });
            },

            /**
             * Creates a dialog object
             * 
             * @param {string} id Id of the object
             * @param {string} name Name of the object
             * @param {string} openLink Link to open the object
             */
            createDialogObject: function(id, name, openLink) {
                return {
                    id: id,
                    name: name,
                    openLink: openLink,
                    expandCallback: null,
                    isExpanded: new ko.observable(false),
                    isLoadingExpandedObject: new ko.observable(false),
                    errorLoadingExpandedObject: new ko.observable(false),
                    expandedObjects: new ko.observableArray(),
                    hasExpandedObjectsLoaded: false
                };
            },
            
            /**
             * Creates a dialog object
             * 
             * @param {string} id Id of the object
             * @param {string} name Name of the object
             * @param {string} openLink Link to open the object
             * @param {function} expandCallback Callback function to expand
             */
            createExpandableDialogObject: function(id, name, openLink, expandCallback) {
                var dialogObject = this.createDialogObject(id, name, openLink);
                dialogObject.expandCallback = expandCallback;
                
                return dialogObject;
            },

            /**
             * Searches kirja pages
             * 
             * @param {string} searchPattern Search Pattern
             * @returns {jQuery.Deferred} Deferred for the result
             */
            searchPages: function(searchPattern) {
                var def = new jQuery.Deferred();

                var searchUrl = "/api/KirjaApi/SearchPages?searchPattern=" + encodeURIComponent(searchPattern) + "&start=" + (this.dialogCurrentPage() * dialogPageSize) + "&pageSize=" + dialogPageSize;
                if(this.idObservable)
                {
                    searchUrl += "&excludeId=" + this.idObservable();
                }

                var self = this;
                GoNorth.HttpClient.get(searchUrl).done(function(data) {
                    var result = {
                        hasMore: data.hasMore,
                        entries: []
                    };

                    for(var curEntry = 0; curEntry < data.pages.length; ++curEntry)
                    {
                        result.entries.push(self.createDialogObject(data.pages[curEntry].id, data.pages[curEntry].name, "/Kirja?id=" + data.pages[curEntry].id));
                    }

                    def.resolve(result);
                }).fail(function() {
                    def.reject();
                });

                return def.promise();
            },

            /**
             * Opens a page to create a new kirja page
             */
            openCreatePage: function() {
                this.dialogCreateNewCallback();
            },


            /**
             * Searches kortisto npcs
             * 
             * @param {string} searchPattern Search Pattern
             * @returns {jQuery.Deferred} Deferred for the result
             */
            searchNpcs: function(searchPattern) {
                var def = new jQuery.Deferred();
                
                var self = this;
                GoNorth.HttpClient.get("/api/KortistoApi/SearchFlexFieldObjects?searchPattern=" + encodeURIComponent(searchPattern) + "&start=" + (this.dialogCurrentPage() * dialogPageSize) + "&pageSize=" + dialogPageSize).done(function(data) {
                    var result = {
                        hasMore: data.hasMore,
                        entries: []
                    };

                    for(var curEntry = 0; curEntry < data.flexFieldObjects.length; ++curEntry)
                    {
                        result.entries.push(self.createDialogObject(data.flexFieldObjects[curEntry].id, data.flexFieldObjects[curEntry].name, "/Kortisto/Npc?id=" + data.flexFieldObjects[curEntry].id));
                    }

                    def.resolve(result);
                }).fail(function(xhr) {
                    def.reject();
                });

                return def.promise();
            },


            /**
             * Searches styr items
             * 
             * @param {string} searchPattern Search Pattern
             * @returns {jQuery.Deferred} Deferred for the result
             */
            searchItems: function(searchPattern) {
                var def = new jQuery.Deferred();
                
                var self = this;
                GoNorth.HttpClient.get("/api/StyrApi/SearchFlexFieldObjects?searchPattern=" + encodeURIComponent(searchPattern) + "&start=" + (this.dialogCurrentPage() * dialogPageSize) + "&pageSize=" + dialogPageSize).done(function(data) {
                    var result = {
                        hasMore: data.hasMore,
                        entries: []
                    };

                    for(var curEntry = 0; curEntry < data.flexFieldObjects.length; ++curEntry)
                    {
                        result.entries.push(self.createDialogObject(data.flexFieldObjects[curEntry].id, data.flexFieldObjects[curEntry].name, "/Styr/Item?id=" + data.flexFieldObjects[curEntry].id));
                    }

                    def.resolve(result);
                }).fail(function(xhr) {
                    def.reject();
                });

                return def.promise();
            },


            /**
             * Searches Evne skills
             * 
             * @param {string} searchPattern Search Pattern
             * @returns {jQuery.Deferred} Deferred for the result
             */
            searchSkills: function(searchPattern) {
                var def = new jQuery.Deferred();
                
                var self = this;
                GoNorth.HttpClient.get("/api/EvneApi/SearchFlexFieldObjects?searchPattern=" + encodeURIComponent(searchPattern) + "&start=" + (this.dialogCurrentPage() * dialogPageSize) + "&pageSize=" + dialogPageSize).done(function(data) {
                    var result = {
                        hasMore: data.hasMore,
                        entries: []
                    };

                    for(var curEntry = 0; curEntry < data.flexFieldObjects.length; ++curEntry)
                    {
                        result.entries.push(self.createDialogObject(data.flexFieldObjects[curEntry].id, data.flexFieldObjects[curEntry].name, "/Evne/Skill?id=" + data.flexFieldObjects[curEntry].id));
                    }

                    def.resolve(result);
                }).fail(function(xhr) {
                    def.reject();
                });

                return def.promise();
            },


            /**
             * Searches aika quests
             * 
             * @param {string} searchPattern Search Pattern
             * @returns {jQuery.Deferred} Deferred for the result
             */
            searchQuest: function(searchPattern) {
                var def = new jQuery.Deferred();
                
                var self = this;
                GoNorth.HttpClient.get("/api/AikaApi/GetQuests?searchPattern=" + encodeURIComponent(searchPattern) + "&start=" + (this.dialogCurrentPage() * dialogPageSize) + "&pageSize=" + dialogPageSize).done(function(data) {
                    var result = {
                        hasMore: data.hasMore,
                        entries: []
                    };

                    for(var curEntry = 0; curEntry < data.quests.length; ++curEntry)
                    {
                        result.entries.push(self.createDialogObject(data.quests[curEntry].id, data.quests[curEntry].name, "/Aika/Quest?id=" + data.quests[curEntry].id));
                    }

                    def.resolve(result);
                }).fail(function(xhr) {
                    def.reject();
                });

                return def.promise();
            },

            /**
             * Searches aika chapter details
             * 
             * @param {string} searchPattern Search Pattern
             * @returns {jQuery.Deferred} Deferred for the result
             */
            searchChapterDetails: function(searchPattern) {
                var def = new jQuery.Deferred();
                
                var self = this;
                GoNorth.HttpClient.get("/api/AikaApi/GetChapterDetails?searchPattern=" + encodeURIComponent(searchPattern) + "&start=" + (this.dialogCurrentPage() * dialogPageSize) + "&pageSize=" + dialogPageSize).done(function(data) {
                    var result = {
                        hasMore: data.hasMore,
                        entries: []
                    };

                    for(var curEntry = 0; curEntry < data.details.length; ++curEntry)
                    {
                        if(self.idObservable && self.idObservable() == data.details[curEntry].id)
                        {
                            continue;
                        }

                        result.entries.push(self.createDialogObject(data.details[curEntry].id, data.details[curEntry].name, "/Aika/Detail?id=" + data.details[curEntry].id));
                    }

                    def.resolve(result);
                }).fail(function(xhr) {
                    def.reject();
                });

                return def.promise();
            },
            
            /**
             * Searches daily routines
             * 
             * @param {string} searchPattern Search Pattern
             * @returns {jQuery.Deferred} Deferred for the result
             */
            searchDailyRoutines: function(searchPattern) {
                var def = new jQuery.Deferred();
                
                var self = this;
                GoNorth.HttpClient.get("/api/KortistoApi/SearchFlexFieldObjects?searchPattern=" + encodeURIComponent(searchPattern) + "&start=" + (this.dialogCurrentPage() * dialogPageSize) + "&pageSize=" + dialogPageSize).done(function(data) {
                    var result = {
                        hasMore: data.hasMore,
                        entries: []
                    };

                    for(var curEntry = 0; curEntry < data.flexFieldObjects.length; ++curEntry)
                    {
                        result.entries.push(self.createExpandableDialogObject(data.flexFieldObjects[curEntry].id, data.flexFieldObjects[curEntry].name, "/Kortisto/Npc?id=" + data.flexFieldObjects[curEntry].id, function(dailyRoutineEventNpc) { self.expandDailyRoutineNpc(dailyRoutineEventNpc); }));
                    }

                    def.resolve(result);
                }).fail(function(xhr) {
                    def.reject();
                });

                return def.promise();
            },

            /**
             * Expands a daily routine npc
             * @param {object} dailyRoutineEventNpc Daily routine npc
             */
            expandDailyRoutineNpc: function(dailyRoutineEventNpc) {
                dailyRoutineEventNpc.isExpanded(!dailyRoutineEventNpc.isExpanded());
                if(dailyRoutineEventNpc.hasExpandedObjectsLoaded)
                {
                    return;
                }

                dailyRoutineEventNpc.isLoadingExpandedObject(true);
                dailyRoutineEventNpc.errorLoadingExpandedObject(false);
                GoNorth.HttpClient.get("/api/KortistoApi/FlexFieldObject?id=" + dailyRoutineEventNpc.id).done(function(data) {
                    var dailyRoutineObjects = [];
                    if(data.dailyRoutine)
                    {
                        for(var curEvent = 0; curEvent < data.dailyRoutine.length; ++curEvent)
                        {
                            data.dailyRoutine[curEvent].parentObject = dailyRoutineEventNpc;
                            data.dailyRoutine[curEvent].name = GoNorth.DailyRoutines.Util.formatTimeSpan(GoNorth.ChooseObjectDialog.Localization.TimeFormat, data.dailyRoutine[curEvent].earliestTime, data.dailyRoutine[curEvent].latestTime);
                            var additionalName = "";
                            if(data.dailyRoutine[curEvent].scriptName)
                            {
                                additionalName = data.dailyRoutine[curEvent].scriptName;
                            }
                            else if(data.dailyRoutine[curEvent].movementTarget && data.dailyRoutine[curEvent].movementTarget.name)
                            {
                                additionalName = data.dailyRoutine[curEvent].movementTarget.name;
                            }
                            data.dailyRoutine[curEvent].additionalName = additionalName;
                            dailyRoutineObjects.push(data.dailyRoutine[curEvent]);
                        }
                    }
                    dailyRoutineEventNpc.isLoadingExpandedObject(false);
                    dailyRoutineEventNpc.expandedObjects(dailyRoutineObjects);
                    dailyRoutineEventNpc.hasExpandedObjectsLoaded = true;
                }).fail(function(xhr) {
                    dailyRoutineEventNpc.isLoadingExpandedObject(false);
                    dailyRoutineEventNpc.errorLoadingExpandedObject(true);
                });
            },

            
            /**
             * Searches markers
             * 
             * @param {string} searchPattern Search Pattern
             * @returns {jQuery.Deferred} Deferred for the result
             */
            searchMarkers: function(searchPattern) {
                var def = new jQuery.Deferred();
                
                var self = this;
                GoNorth.HttpClient.get("/api/KartaApi/SearchMarkersByExportName?searchPattern=" + encodeURIComponent(searchPattern) + "&start=" + (this.dialogCurrentPage() * dialogPageSize) + "&pageSize=" + dialogPageSize).done(function(data) {
                    var result = {
                        hasMore: data.hasMore,
                        entries: []
                    };

                    for(var curEntry = 0; curEntry < data.markers.length; ++curEntry)
                    {
                        var dialogObject = self.createDialogObject(data.markers[curEntry].markerId, data.markers[curEntry].markerName + " (" + data.markers[curEntry].mapName + ")", "/Karta?id=" + data.markers[curEntry].mapId + "&zoomOnMarkerId=" + data.markers[curEntry].markerId + "&zoomOnMarkerType=" + data.markers[curEntry].markerType);
                        dialogObject.markerName = data.markers[curEntry].markerName;
                        dialogObject.markerType = data.markers[curEntry].markerType;
                        dialogObject.mapId = data.markers[curEntry].mapId;
                        dialogObject.mapName = data.markers[curEntry].mapName;
                        result.entries.push(dialogObject);
                    }

                    def.resolve(result);
                }).fail(function(xhr) {
                    def.reject();
                });

                return def.promise();
            },
            
        };

    }(GoNorth.ChooseObjectDialog = GoNorth.ChooseObjectDialog || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {

        /**
         * Node Shapes Base View Model
         * @class
         */
        DefaultNodeShapes.BaseViewModel = function()
        {
            this.nodeGraph = new ko.observable();
            this.nodePaper = new ko.observable();
        
            this.showConfirmNodeDeleteDialog = new ko.observable(false);
            this.deleteLoading = new ko.observable(false);
            this.deleteErrorOccured = new ko.observable(false);
            this.deleteErrorAdditionalInformation =  new ko.observable("");
            this.deleteNodeTarget = null;
            this.deleteDeferred = null;

            this.nodeDropOffsetX = 0;
            this.nodeDropOffsetY = 0;

            this.errorOccured = new ko.observable(false);
        };

        DefaultNodeShapes.BaseViewModel.prototype = {

            /**
             * Adds a new node
             * 
             * @param {object} dropElement Element that was dropped
             * @param {float} x X-Drop Coordinate
             * @param {float} z X-Drop Coordinate
             */
            addNewNode: function(dropElement, x, y) {
                if(!this.nodeGraph() || !this.nodePaper())
                {
                    return;
                }

                var initOptions = this.calcNodeInitOptionsPosition(x, y);
                this.addNodeByType(dropElement.data("nodetype"), initOptions);
            },

            /**
             * Creates the node init options with the node position
             * 
             * @param {float} x X-Drop Coordinate
             * @param {float} z X-Drop Coordinate
             */
            calcNodeInitOptionsPosition: function(x, y) {
                var scale = this.nodePaper().scale();
                var translate = this.nodePaper().translate();
                var initOptions = {
                    position: { x: (x - translate.tx) / scale.sx + this.nodeDropOffsetX, y: (y - translate.ty) / scale.sy + this.nodeDropOffsetY }
                };
                return initOptions;
            },

            /**
             * Adds a new node by the type
             * 
             * @param {string} nodeType Type of the new node
             * @param {object} initOptions Init Options for the node
             */
            addNodeByType: function(nodeType, initOptions) {
                var newNode = GoNorth.DefaultNodeShapes.Serialize.getNodeSerializerInstance().createNewNode(nodeType, initOptions);
                if(newNode == null)
                {
                    this.errorOccured(true);
                    return;
                }

                this.nodeGraph().addCells(newNode);
                this.setupNewNode(newNode);
            },

            /**
             * Prepares a new node
             * 
             * @param {object} newNode New Node to setup
             */
            setupNewNode: function(newNode) {
                newNode.attr(".inPorts circle/magnet", "passive");
                
                var self = this;
                newNode.onDelete = function(node) {
                    return self.onDelete(node);
                };
            },

            /**
             * Reloads the fields for nodes
             * 
             * @param {string} id Id of the object for which to reload the nodes
             */
            reloadFieldsForNodes: function(objectType, id) {
                GoNorth.DefaultNodeShapes.Shapes.resetSharedObjectLoading(objectType, id);

                if(!this.nodeGraph())
                {
                    return;
                }

                var paper = this.nodePaper();
                var elements = this.nodeGraph().getElements();
                for(var curElement = 0; curElement < elements.length; ++curElement)
                {
                    var view = paper.findViewByModel(elements[curElement]);
                    if(view && view.reloadSharedLoadedData)
                    {
                        view.reloadSharedLoadedData(objectType, id);
                    }
                }
            },


            /**
             * Focuses a node if a node is specified in the url
             */
            focusNodeFromUrl: function() {
                var nodeId = GoNorth.Util.getParameterFromUrl("nodeFocusId");
                if(!nodeId)
                {
                    return;
                }

                GoNorth.Util.removeUrlParameter("nodeFocusId");
                var targetNode = this.nodeGraph().getCell(nodeId);
                if(!targetNode) 
                {
                    return;
                }

                var targetPosition = targetNode.position();
                var targetSize = targetNode.size();
                var paper = this.nodePaper();
                var viewBoundingBox;
                if(paper.el && paper.el.parentElement)
                {
                    viewBoundingBox = paper.el.parentElement.getBoundingClientRect()
                }
                else
                {
                    viewBoundingBox = paper.getContentBBox();
                }
                paper.translate(-targetPosition.x - targetSize.width * 0.5 + viewBoundingBox.width * 0.5, -targetPosition.y - targetSize.width * 0.5 + viewBoundingBox.height * 0.5);
            },


            /**
             * Delete Callback if a user wants to delete a node
             * 
             * @param {object} node Node to delete
             * @returns {jQuery.Deferred} Deferred that will be resolved if the user deletes the node
             */
            onDelete: function(node) {
                this.deleteLoading(false);
                this.deleteErrorOccured(false);
                this.deleteErrorAdditionalInformation("");
                this.showConfirmNodeDeleteDialog(true);

                this.deleteNodeTarget = node;
                this.deleteDeferred = new jQuery.Deferred();
                return this.deleteDeferred.promise();
            },

            /**
             * Deletes the node for which the dialog is opened
             */
            deleteNode: function() {
                if(!this.deleteNodeTarget || !this.deleteNodeTarget.validateDelete)
                {
                    this.resolveDeleteDeferred();
                }
                else
                {
                    var deleteDef = this.deleteNodeTarget.validateDelete();
                    if(!deleteDef)
                    {
                        this.resolveDeleteDeferred();
                    }
                    else
                    {
                        var self = this;
                        this.deleteLoading(true);
                        this.deleteErrorOccured(false);
                        this.deleteErrorAdditionalInformation(""); 
                        deleteDef.done(function() {
                            self.deleteLoading(false);
                            self.resolveDeleteDeferred();
                        }).fail(function(err) {
                            self.deleteLoading(false);
                            self.deleteErrorOccured(true);
                            self.deleteErrorAdditionalInformation(err); 
                        });
                    }
                }
            },

            /**
             * Resolves the delete deferred
             */
            resolveDeleteDeferred: function() {
                if(this.deleteDeferred)
                {
                    this.deleteDeferred.resolve();
                    this.deleteDeferred = null;
                }
                this.closeConfirmNodeDeleteDialog();
            },

            /**
             * Closes the confirm delete node dialog
             */
            closeConfirmNodeDeleteDialog: function() {
                if(this.deleteDeferred)
                {
                    this.deleteDeferred.reject();
                    this.deleteDeferred = null;
                }
                this.showConfirmNodeDeleteDialog(false);
                this.deleteLoading(false);
                this.deleteErrorOccured(false);
                this.deleteErrorAdditionalInformation("");
                this.deleteNodeTarget = null;
            },

            /**
             * Sets the graph to readonly mode
             */
            setGraphToReadonly: function() {
                jQuery(".gn-nodeGraphContainer").find("input,textarea,select").prop("disabled", true);
                jQuery(".gn-nodeGraphContainer").find(".joint-cell").css("pointer-events", "none");
                jQuery(".gn-nodeGraphContainer").find(".gn-nodeDeleteOnReadonly").remove();
                jQuery(".gn-nodeGraphContainer").find(".gn-nodeNonClickableOnReadonly").css("pointer-events", "none");
            }
        };

    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(Aika) {
        (function(Shared) {

            /**
             * Set the detail view id for new nodes
             * 
             * @param {object} nodeGraph Node Graph
             * @param {string} detailNodes Nodes with detail view ids
             */
            Shared.setDetailViewIds = function (nodeGraph, detailNodes) {
                if(!detailNodes)
                {
                    return;
                }

                var graphElements = nodeGraph.getElements();
                for(var curElement = 0; curElement < graphElements.length; ++curElement)
                {
                    var element = graphElements[curElement];
                    if(element.get("detailViewId"))
                    {
                        continue;
                    }

                    for(var curNode = 0; curNode < detailNodes.length; ++curNode)
                    {
                        if(element.id != detailNodes[curNode].id)
                        {
                            continue;
                        }

                        element.set("detailViewId", detailNodes[curNode].detailViewId);
                        break;
                    }
                }
            };

        }(Aika.Shared = Aika.Shared || {}));
    }(GoNorth.Aika = GoNorth.Aika || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(Aika) {
        (function(Shared) {

            
            /// Width for nodes which have finish nodes as outports
            Shared.finishNodeOutportNodeWidth = 250;

            /// Minimum Height for nodes which have finish nodes as outports
            Shared.finishNodeOutportNodeMinHeight = 150;

            /// Count of outports after which the node begins to grow
            var finishNodeOutportGrowStartCount = 3;

            /// Amount of pixel by which a node grows for each outports bigger than the grow start count
            var finishNodeOutportGrowHeight = 30;


            /**
             * Loads the detail view data
             * 
             * @param {object} chapterNode Chapter Node to fill
             * @param {string} detailViewId Id of the detail view
             * @returns {jQuery.Deferred} Deferred for the loading process
             */
            function loadDetailViewData(chapterNode, detailViewId) {
                var def = new jQuery.Deferred();

                // Load finish nodes
                chapterNode.showLoading();
                chapterNode.hideError();
                GoNorth.HttpClient.get("/api/AikaApi/GetChapterDetail?id=" + detailViewId).done(function(data) {
                    chapterNode.hideLoading();
                    
                    Shared.addFinishNodesAsOutports(chapterNode, data.finish);

                    def.resolve(data);
                }).fail(function(xhr) {
                    chapterNode.hideLoading();
                    chapterNode.showError();
                    def.reject();
                });

                return def.promise();
            }

            /**
             * Adds a finish nodes as outports for a node
             * @param {object} node Target node to which the outports should be added
             * @param {object[]} finishNodes Finish Nodes
             */
            Shared.addFinishNodesAsOutports = function(node, finishNodes)
            {
                if(!finishNodes)
                {
                    finishNodes = [];
                }

                var links = {};
                var allLinks = node.model.graph.getLinks();
                for(var curLink = 0; curLink < allLinks.length; ++curLink)
                {
                    var link = allLinks[curLink];
                    if(link.get("source") && link.get("source").id == node.model.id)
                    {
                        links[link.get("source").port] = link;
                    }
                }

                var outPorts = [];
                var portColors = {};
                for(var curFinish = 0; curFinish < finishNodes.length; ++curFinish)
                {
                    var portName = "finish" + finishNodes[curFinish].id; 
                    outPorts.push(portName);
                    portColors[portName] = finishNodes[curFinish].color;
                    var colorStyle = "fill: " + finishNodes[curFinish].color;
                    node.model.attr(".outPorts>.port" + curFinish + " circle", { "title": finishNodes[curFinish].name, "style": colorStyle });
                    node.model.attr(".outPorts>.port" + curFinish + " .port-label", { "title": finishNodes[curFinish].name, "class": "gn-aikaChapterFinishPort", "style": colorStyle, "dx": 13 });

                    if(links[portName])
                    {
                        links[portName].attr(".connection", { style: "stroke: " + finishNodes[curFinish].color });
                        links[portName].attr(".marker-target", { style: colorStyle });
                        delete links[portName];
                    }
                }
                node.model.set("outPorts", outPorts);

                var targetHeight = Shared.finishNodeOutportNodeMinHeight;
                if(outPorts.length > finishNodeOutportGrowStartCount)
                {
                    targetHeight = Shared.finishNodeOutportNodeMinHeight + (outPorts.length - finishNodeOutportGrowStartCount) * finishNodeOutportGrowHeight;
                }
                node.model.set("size", { width: Shared.finishNodeOutportNodeWidth, height: targetHeight });

                jQuery(".gn-aikaChapterFinishPort").each(function() {
                    jQuery(this).find("tspan").text(jQuery(this).attr("title"));
                });

                // Remove deleted port links
                for(var curPort in links)
                {
                    node.model.graph.removeCells([ links[curPort] ]);
                }

                // Handel add of new links
                node.model.graph.on('add', function(cell) {
                    if(!cell.isLink() || !cell.get("source"))
                    {
                        return;
                    }
                    
                    var source = cell.get("source");
                    if(source.id != node.model.id)
                    {
                        return;
                    }

                    if(portColors[source.port])
                    {
                        cell.attr(".connection", { style: "stroke: " + portColors[source.port] });
                        cell.attr(".marker-target", { style: "fill: " + portColors[source.port] });
                    }
                });
            }

            /**
             * Initializes the detail view connection
             * 
             * @param {object} chapterNode Chapter Node to fill
             * @param {string} detailViewId Id of the detail view
             * @returns {jQuery.Deferred} Deferred for the loading process
             */
            Shared.initDetailView = function (chapterNode, detailViewId) {
                if(chapterNode.$box.find(".gn-aikaChapterDetailButton").length > 0)
                {
                    return;
                }

                chapterNode.$box.append("<button class='gn-aikaChapterDetailButton'>" + Aika.Localization.Chapter.OpenDetailView + "</button>");

                chapterNode.$box.find(".gn-aikaChapterDetailButton").click(function() {
                    var detailWindow = window.open("/Aika/Detail?id=" + detailViewId);
                    detailWindow.refreshChapterNode = function() {
                        loadDetailViewData(chapterNode, detailViewId);
                    };
                });

                return loadDetailViewData(chapterNode, detailViewId);
            };

            /**
            * Checks if a chapter or chapter detail node can be deleted
            * 
            * @param {string} detailNodeId Detail Node id
            * @returns {jQuery.Deferred} Deferred for the validation process
            */
            Shared.validateChapterDetailDelete = function(detailNodeId) {
               if(!detailNodeId)
               {
                   return null;
               }

               var def = new jQuery.Deferred();
               GoNorth.HttpClient.get("/api/AikaApi/ValidateChapterDetailDelete?id=" + detailNodeId).done(function(data) {
                   if(data.canBeDeleted)
                   {
                       def.resolve();
                   }
                   else
                   {
                       def.reject(data.errorMessage);
                   }
               }).fail(function(xhr) {
                   def.reject("");
               });

               return def.promise();
           };

        }(Aika.Shared = Aika.Shared || {}));
    }(GoNorth.Aika = GoNorth.Aika || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(Aika) {
        (function(Shared) {

            /// Finish Type
            var finishType = "aika.Finish";

            /// Finish Target Array
            var finishTargetArray = "finish";

            /// Finish Colors
            var finishColors = [
                {
                    name: "White",
                    color: "#FFFFFF"
                },
                {
                    name: "Red",
                    color: "#CC0000"
                },
                {
                    name: "Green",
                    color: "#008800"
                },
                {
                    name: "Blue",
                    color: "#0000CC"
                },
                {
                    name: "Yellow",
                    color: "#FDFF00"
                },
                {
                    name: "Purple",
                    color: "#66008e"
                }
            ]

            joint.shapes.aika = joint.shapes.aika || {};

            /**
             * Creates the finish shape
             * @returns {object} Finish shape
             */
            function createFinishShape()
            {
                var model = joint.shapes.devs.Model.extend(
                {
                    defaults: joint.util.deepSupplement
                    (
                        {
                            type: finishType,
                            icon: "glyphicon-flag",
                            size: { width: 250, height: 150 },
                            inPorts: ['input'],
                            outPorts: [],
                            attrs:
                            {
                                '.inPorts circle': { "magnet": "passive", "port-type": "input" }
                            },
                            detailViewId: "",
                            finishName: "",
                            finishColor: finishColors[0].color
                        },
                        joint.shapes.default.Base.prototype.defaults
                    )
                });
                return model;
            }

            /**
             * Creates a finish view
             * @returns {object} Finish view
             */
            function createFinishView()
            {
                return joint.shapes.default.BaseView.extend(
                {
                    /**
                     * Template
                     */
                    template:
                    [
                        '<div class="node">',
                            '<span class="label"><i class="nodeIcon glyphicon"></i><span class="labelText"></span></span>',
                            '<button class="delete gn-nodeDeleteOnReadonly cornerButton" title="' + GoNorth.DefaultNodeShapes.Localization.DeleteNode + '">x</button>',
                            '<input type="text" class="gn-aikaFinishName" placeholder="' + Aika.Localization.Finish.FinishName + '"/>',
                            '<select class="gn-aikaFinishColor"/>',
                        '</div>',
                    ].join(''),

                    /**
                     * Initializes the shape
                     */
                    initialize: function()
                    {
                        joint.shapes.default.BaseView.prototype.initialize.apply(this, arguments);

                        var self = this;

                        var finishName = this.$box.find(".gn-aikaFinishName");
                        finishName.on("change", function() {
                            self.model.set("finishName", finishName.val());
                        });
                        finishName.val(this.model.get("finishName"));

                        var finishColor = this.$box.find(".gn-aikaFinishColor");
                        for(var curColor = 0; curColor < finishColors.length; ++curColor)
                        {
                            finishColor.append(jQuery("<option>", {
                                value: finishColors[curColor].color,
                                text: Aika.Localization.Finish.Colors[finishColors[curColor].name]
                            }));
                        }

                        finishColor.on("change", function() {
                            self.model.set("finishColor", finishColor.val());
                        });
                        finishColor.find("option[value='" + this.model.get("finishColor") + "']").prop("selected", true);
                    },

                    /**
                     * Returns statistics for the node
                     * @returns Node statistics
                     */
                    getStatistics: function() {
                        return {
                            conditionCount: 0,
                            wordCount: GoNorth.Util.getWordCount(this.model.get("finishName"))
                        };
                    }
                });
            }

            /**
             * Finish Shape
             */
            joint.shapes.aika.Finish = createFinishShape();

            /**
             * Finish View
             */
            joint.shapes.aika.FinishView = createFinishView();


            /** 
             * Finish Serializer 
             * 
             * @class
             */
            Shared.FinishSerializer = function()
            {
                GoNorth.DefaultNodeShapes.Serialize.BaseNodeSerializer.apply(this, [joint.shapes.aika.Finish, finishType, finishTargetArray ]);
            };

            Shared.FinishSerializer.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.Serialize.BaseNodeSerializer.prototype)

            /**
             * Serializes a node
             * 
             * @param {object} node Node Object
             * @returns {object} Serialized NOde
             */
            Shared.FinishSerializer.prototype.serialize = function(node) 
            {
                var serializedData = {
                    id: node.id,
                    x: node.position.x,
                    y: node.position.y,
                    detailViewId: node.detailViewId,
                    name: node.finishName,
                    color: node.finishColor
                };

                return serializedData;
            };

            /**
             * Deserializes a serialized node
             * 
             * @param {object} node Serialized Node Object
             * @returns {object} Deserialized Node
             */
            Shared.FinishSerializer.prototype.deserialize = function(node) 
            {
                var initOptions = {
                    id: node.id,
                    position: { x: node.x, y: node.y },
                    detailViewId: node.detailViewId,
                    finishName: node.name,
                    finishColor: node.color
                };

                var node = new this.classType(initOptions);
                return node;
            };

            // Register Serializers
            var finishSerializer = new Shared.FinishSerializer();
            GoNorth.DefaultNodeShapes.Serialize.getNodeSerializerInstance().addNodeSerializer(finishSerializer);

        }(Aika.Shared = Aika.Shared || {}));
    }(GoNorth.Aika = GoNorth.Aika || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(Aika) {
        (function(Shared) {

            /// Start Type
            Shared.startType = "aika.Start";

            /// Start Target Array
            var startTargetArray = "start";

            joint.shapes.aika = joint.shapes.aika || {};

            /**
             * Creates the start shape
             * @returns {object} Start shape
             */
            function createStartShape()
            {
                var model = joint.shapes.devs.Model.extend(
                {
                    defaults: joint.util.deepSupplement
                    (
                        {
                            type: Shared.startType,
                            icon: "glyphicon-play",
                            size: { width: 100, height: 50 },
                            inPorts: [],
                            outPorts: ['output'],
                            attrs:
                            {
                                '.outPorts circle': { "magnet": "true" }
                            }
                        },
                        joint.shapes.default.Base.prototype.defaults
                    )
                });
                return model;
            }

            /**
             * Creates a start view
             * @returns {object} Start view
             */
            function createStartView()
            {
                return joint.shapes.default.BaseView.extend(
                {
                    /**
                     * Template
                     */
                    template:
                    [
                        '<div class="node">',
                            '<span class="label"><i class="nodeIcon glyphicon"></i><span class="labelText"></span></span>',
                        '</div>',
                    ].join(''),

                    /**
                     * Returns statistics for the node
                     * @returns Node statistics
                     */
                    getStatistics: function() {
                        return {
                            conditionCount: 0,
                            wordCount: 0
                        };
                    }
                });
            }

            /**
             * Start Shape
             */
            joint.shapes.aika.Start = createStartShape();

            /**
             * Start View
             */
            joint.shapes.aika.StartView = createStartView();


            /** 
             * Start Serializer 
             * 
             * @class
             */
            Shared.StartSerializer = function()
            {
                GoNorth.DefaultNodeShapes.Serialize.BaseNodeSerializer.apply(this, [joint.shapes.aika.Start, Shared.startType, startTargetArray ]);
            };

            Shared.StartSerializer.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.Serialize.BaseNodeSerializer.prototype)

            /**
             * Serializes a node
             * 
             * @param {object} node Node Object
             * @returns {object} Serialized NOde
             */
            Shared.StartSerializer.prototype.serialize = function(node) 
            {
                var serializedData = {
                    id: node.id,
                    x: node.position.x,
                    y: node.position.y
                };

                return serializedData;
            };

            /**
             * Deserializes a serialized node
             * 
             * @param {object} node Serialized Node Object
             * @returns {object} Deserialized Node
             */
            Shared.StartSerializer.prototype.deserialize = function(node) 
            {
                var initOptions = {
                    id: node.id,
                    position: { x: node.x, y: node.y }
                };

                var node = new this.classType(initOptions);
                return node;
            };

            // Register Serializers
            var startSerializer = new Shared.StartSerializer();
            GoNorth.DefaultNodeShapes.Serialize.getNodeSerializerInstance().addNodeSerializer(startSerializer);

        }(Aika.Shared = Aika.Shared || {}));
    }(GoNorth.Aika = GoNorth.Aika || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(Aika) {
        (function(Shared) {

            /// All Done Type
            var allDoneType = "aika.AllDone";

            /// All Done Target Array
            var allDoneTargetArray = "allDone";

            joint.shapes.aika = joint.shapes.aika || {};

            /**
             * Creates the All Done shape
             * @returns {object} All Done shape
             */
            function createAllDoneShape()
            {
                var model = joint.shapes.devs.Model.extend(
                {
                    defaults: joint.util.deepSupplement
                    (
                        {
                            type: allDoneType,
                            icon: "glyphicon-resize-small",
                            size: { width: 175, height: 50 },
                            inPorts: ['input'],
                            outPorts: ['output'],
                            attrs:
                            {
                                '.inPorts circle': { "magnet": "passive", "port-type": "input" },
                                '.outPorts circle': { "magnet": "true" }
                            }
                        },
                        joint.shapes.default.Base.prototype.defaults
                    )
                });
                return model;
            }

            /**
             * Creates a All Done view
             * @returns {object} All Done view
             */
            function createAllDoneView()
            {
                return joint.shapes.default.BaseView.extend(
                {
                    /**
                     * Template
                     */
                    template:
                    [
                        '<div class="node">',
                            '<span class="label"><i class="nodeIcon glyphicon"></i><span class="labelText"></span></span>',
                            '<button class="delete gn-nodeDeleteOnReadonly cornerButton" title="' + GoNorth.DefaultNodeShapes.Localization.DeleteNode + '">x</button>',
                        '</div>',
                    ].join(''),

                    /**
                     * Returns statistics for the node
                     * @returns Node statistics
                     */
                    getStatistics: function() {
                        return {
                            conditionCount: 0,
                            wordCount: 0
                        };
                    }
                });
            }

            /**
             * All Done Shape
             */
            joint.shapes.aika.AllDone = createAllDoneShape();

            /**
             * All Done View
             */
            joint.shapes.aika.AllDoneView = createAllDoneView();


            /** 
             * All Done Serializer 
             * 
             * @class
             */
            Shared.AllDoneSerializer = function()
            {
                GoNorth.DefaultNodeShapes.Serialize.BaseNodeSerializer.apply(this, [joint.shapes.aika.AllDone, allDoneType, allDoneTargetArray ]);
            };

            Shared.AllDoneSerializer.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.Serialize.BaseNodeSerializer.prototype)

            /**
             * Serializes a node
             * 
             * @param {object} node Node Object
             * @returns {object} Serialized NOde
             */
            Shared.AllDoneSerializer.prototype.serialize = function(node) 
            {
                var serializedData = {
                    id: node.id,
                    x: node.position.x,
                    y: node.position.y
                };

                return serializedData;
            };

            /**
             * Deserializes a serialized node
             * 
             * @param {object} node Serialized Node Object
             * @returns {object} Deserialized Node
             */
            Shared.AllDoneSerializer.prototype.deserialize = function(node) 
            {
                var initOptions = {
                    id: node.id,
                    position: { x: node.x, y: node.y }
                };

                var node = new this.classType(initOptions);
                return node;
            };

            // Register Serializers
            var allDoneSerializer = new Shared.AllDoneSerializer();
            GoNorth.DefaultNodeShapes.Serialize.getNodeSerializerInstance().addNodeSerializer(allDoneSerializer);

        }(Aika.Shared = Aika.Shared || {}));
    }(GoNorth.Aika = GoNorth.Aika || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(Aika) {
        (function(ChapterDetail) {

            /// Quest Type
            var questType = "aika.Quest";

            /// Quest Target Array
            var questTargetArray = "quest";

            joint.shapes.aika = joint.shapes.aika || {};

            /**
             * Creates the quest shape
             * @returns {object} Quest shape
             * @memberof ChapterDetail
             */
            function createQuestShape() {
                var model = joint.shapes.devs.Model.extend(
                {
                    defaults: joint.util.deepSupplement
                    (
                        {
                            type: questType,
                            icon: "glyphicon-king",
                            size: { width: Aika.Shared.finishNodeOutportNodeWidth, height: Aika.Shared.finishNodeOutportNodeMinHeight },
                            inPorts: ['input'],
                            outPorts: [],
                            attrs:
                            {
                                '.inPorts circle': { "magnet": "passive", "port-type": "input" },
                                '.outPorts circle': { "magnet": "true" } 
                            },
                            questId: ""
                        },
                        joint.shapes.default.Base.prototype.defaults
                    )
                });
                return model;
            }

            /**
             * Creates a quest view
             * @returns {object} Quest view
             * @memberof ChapterDetail
             */
            function createQuestView() {
                return joint.shapes.default.BaseView.extend(
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
                            '<button class="delete gn-nodeDeleteOnReadonly cornerButton" title="' + GoNorth.DefaultNodeShapes.Localization.DeleteNode + '">x</button>',
                            '<a class="gn-clickable gn-aikaNodeQuestName"></div>',
                        '</div>',
                    ].join(''),

                    /**
                     * Initializes the shape
                     */
                    initialize: function() {
                        joint.shapes.default.BaseView.prototype.initialize.apply(this, arguments);

                        if(this.model.get("questId"))
                        {
                            this.loadQuestData();
                            var self = this;
                            this.$box.find(".gn-aikaNodeQuestName").click(function() {
                                var questWindow = window.open("/Aika/Quest?id=" + self.model.get("questId"));
                                questWindow.onQuestSaved = function() {
                                    self.loadQuestData();
                                };
                            });
                        }
                        else
                        {
                            this.showError();
                        }
                    },

                    /**
                     * Loads the quest data
                     */
                    loadQuestData: function() {
                        // Load finish nodes
                        var self = this;
                        this.showLoading();
                        this.hideError();
                        GoNorth.HttpClient.get("/api/AikaApi/GetQuest?id=" + self.model.get("questId")).done(function(data) {
                            self.hideLoading();
                            if(!data)
                            {
                                self.showError();
                                return;
                            }

                            self.$box.find(".gn-aikaNodeQuestName").text(data.name);
                            if(data.isMainQuest)
                            {
                                self.$box.find(".gn-aikaNodeQuestName").prepend("<i class='glyphicon glyphicon-star gn-aikaNodeQuestMain' title='" + Aika.Localization.QuestNode.IsMainQuestTooltip + "'></i>")
                            }
                            Aika.Shared.addFinishNodesAsOutports(self, data.finish);
                        }).fail(function(xhr) {
                            self.hideLoading();
                            self.showError();
                        });
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
                    }
                });
            }

            /**
             * Quest Shape
             */
            joint.shapes.aika.Quest = createQuestShape();

            /**
             * Quest View
             */
            joint.shapes.aika.QuestView = createQuestView();


            /** 
             * Quest Serializer 
             * 
             * @class
             */
            ChapterDetail.QuestSerializer = function()
            {
                GoNorth.DefaultNodeShapes.Serialize.BaseNodeSerializer.apply(this, [joint.shapes.aika.Quest, questType, questTargetArray ]);
            };

            ChapterDetail.QuestSerializer.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.Serialize.BaseNodeSerializer.prototype)

            /**
             * Serializes a node
             * 
             * @param {object} node Node Object
             * @returns {object} Serialized NOde
             */
            ChapterDetail.QuestSerializer.prototype.serialize = function(node) {
                var serializedData = {
                    id: node.id,
                    x: node.position.x,
                    y: node.position.y,
                    questId: node.questId,
                };

                return serializedData;
            };

            /**
             * Deserializes a serialized node
             * 
             * @param {object} node Serialized Node Object
             * @returns {object} Deserialized Node
             */
            ChapterDetail.QuestSerializer.prototype.deserialize = function(node) {
                var initOptions = {
                    id: node.id,
                    position: { x: node.x, y: node.y },
                    questId: node.questId,
                };

                var node = new this.classType(initOptions);
                return node;
            };

            // Register Serializers
            var questSerializer = new ChapterDetail.QuestSerializer();
            GoNorth.DefaultNodeShapes.Serialize.getNodeSerializerInstance().addNodeSerializer(questSerializer);

        }(Aika.ChapterDetail = Aika.ChapterDetail || {}));
    }(GoNorth.Aika = GoNorth.Aika || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(Aika) {
        (function(ChapterDetail) {

            /// Chapter Detail Type
            var chapterDetailType = "aika.ChapterDetail";

            /// Chapter Detail Target Array
            var chapterDetailTargetArray = "detail";

            joint.shapes.aika = joint.shapes.aika || {};

            /**
             * Creates the chapter detail shape
             * @returns {object} Chapter Detail shape
             * @memberof ChapterDetail
             */
            function createChapterDetailShape() {
                var model = joint.shapes.devs.Model.extend(
                {
                    defaults: joint.util.deepSupplement
                    (
                        {
                            type: chapterDetailType,
                            icon: "glyphicon-king",
                            size: { width: Aika.Shared.finishNodeOutportNodeWidth, height: Aika.Shared.finishNodeOutportNodeMinHeight },
                            inPorts: ['input'],
                            outPorts: [],
                            attrs:
                            {
                                '.inPorts circle': { "magnet": "passive", "port-type": "input" },
                                '.outPorts circle': { "magnet": "true" } 
                            },
                            detailViewId: "",
                            detailName: ""
                        },
                        joint.shapes.default.Base.prototype.defaults
                    )
                });
                return model;
            }

            /**
             * Creates a chapter detail view
             * @returns {object} Chapter Detail view
             * @memberof ChapterDetail
             */
            function createChapterDetailView() {
                return joint.shapes.default.BaseView.extend(
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
                            '<button class="delete gn-nodeDeleteOnReadonly cornerButton" title="' + GoNorth.DefaultNodeShapes.Localization.DeleteNode + '">x</button>',
                            '<input type="text" class="gn-aikaChapterDetailName" placeholder="' + Aika.Localization.ChapterDetail.DetailName + '"/>',
                        '</div>',
                    ].join(''),

                    /**
                     * Initializes the shape
                     */
                    initialize: function() {
                        joint.shapes.default.BaseView.prototype.initialize.apply(this, arguments);

                        var self = this;

                        var chapterDetailName = this.$box.find(".gn-aikaChapterDetailName");
                        chapterDetailName.on("change", function() {
                            self.model.set("detailName", chapterDetailName.val());
                        });
                        chapterDetailName.val(this.model.get("detailName"));

                        this.model.on('change:detailViewId', this.initChapterDetail, this);
                        if(this.model.get("detailViewId"))
                        {
                            this.initChapterDetail();
                        }
                    },

                    /**
                     * Initializes the chapter detail
                     */
                    initChapterDetail: function() {
                        var self = this;
                        Aika.Shared.initDetailView(this, this.model.get("detailViewId")).then(function(detail) {
                            self.model.set("detailName", detail.name);
                            self.$box.find(".gn-aikaChapterDetailName").val(detail.name);
                        });
                    },

                    /**
                     * Checks if a node can be deleted
                     * 
                     * @returns {jQuery.Deferred} Deferred for the validation process
                     */
                    validateDelete: function() {
                        return Aika.Shared.validateChapterDetailDelete(this.model.get("detailViewId"));
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
                    }
                });
            }

            /**
             * Chapter Detail Shape
             */
            joint.shapes.aika.ChapterDetail = createChapterDetailShape();

            /**
             * Chapter Detail View
             */
            joint.shapes.aika.ChapterDetailView = createChapterDetailView();


            /** 
             * Chapter Detail Serializer 
             * 
             * @class
             */
            ChapterDetail.ChapterDetailSerializer = function()
            {
                GoNorth.DefaultNodeShapes.Serialize.BaseNodeSerializer.apply(this, [ joint.shapes.aika.ChapterDetail, chapterDetailType, chapterDetailTargetArray ]);
            };

            ChapterDetail.ChapterDetailSerializer.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.Serialize.BaseNodeSerializer.prototype)

            /**
             * Serializes a node
             * 
             * @param {object} node Node Object
             * @returns {object} Serialized NOde
             */
            ChapterDetail.ChapterDetailSerializer.prototype.serialize = function(node) 
            {
                var serializedData = {
                    id: node.id,
                    x: node.position.x,
                    y: node.position.y,
                    detailViewId: node.detailViewId,
                    name: node.detailName
                };

                return serializedData;
            };

            /**
             * Deserializes a serialized node
             * 
             * @param {object} node Serialized Node Object
             * @returns {object} Deserialized Node
             */
            ChapterDetail.ChapterDetailSerializer.prototype.deserialize = function(node) 
            {
                var initOptions = {
                    id: node.id,
                    position: { x: node.x, y: node.y },
                    detailViewId: node.detailViewId,
                    detailName: node.name
                };

                var node = new this.classType(initOptions);
                return node;
            };

            // Register Serializers
            var chapterDetailSerializer = new ChapterDetail.ChapterDetailSerializer();
            GoNorth.DefaultNodeShapes.Serialize.getNodeSerializerInstance().addNodeSerializer(chapterDetailSerializer);

        }(Aika.ChapterDetail = Aika.ChapterDetail || {}));
    }(GoNorth.Aika = GoNorth.Aika || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(Aika) {
        (function(ChapterDetail) {

            /**
             * Chapter Detail View Model
             * @class
             */
            ChapterDetail.ViewModel = function()
            {
                GoNorth.DefaultNodeShapes.BaseViewModel.apply(this);

                this.id = new ko.observable("");
                var paramId = GoNorth.Util.getParameterFromUrl("id");
                if(paramId)
                {
                    this.id(paramId);
                }

                this.objectDialog = new GoNorth.ChooseObjectDialog.ViewModel();

                this.name = new ko.observable("");

                this.isLoading = new ko.observable(false);
                this.isReadonly = new ko.observable(false);
                this.lockedByUser = new ko.observable("");

                this.showWaitNewObjectDialog = new ko.observable(false);
            
                this.additionalErrorDetails = new ko.observable("");

                this.load();
                this.acquireLock();
            };

            ChapterDetail.ViewModel.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.BaseViewModel.prototype);

            /**
             * Adds a new node
             * 
             * @param {object} dropElement Element that was dropped
             * @param {float} x X-Drop Coordinate
             * @param {float} z X-Drop Coordinate
             */
            ChapterDetail.ViewModel.prototype.addNewNode = function(dropElement, x, y) {
                if(jQuery(dropElement).hasClass("gn-nodeNewQuest"))
                {
                    this.createNewQuestNode(x, y);
                    return;
                }
                else if(jQuery(dropElement).hasClass("gn-nodeExistingQuest"))
                {
                    this.createExistingQuestNode(x, y);
                    return;
                }
                else if(jQuery(dropElement).hasClass("gn-nodeExistingDetailView"))
                {
                    this.createExistingChapterDetailNode(x, y);
                    return;
                }

                GoNorth.DefaultNodeShapes.BaseViewModel.prototype.addNewNode.apply(this, arguments);
            };

            /**
             * Creates a quest node from a new quest
             * 
             * @param {float} x X-Drop Coordinate
             * @param {float} z X-Drop Coordinate
             */
            ChapterDetail.ViewModel.prototype.createNewQuestNode = function(x, y) {
                var self = this;
                this.showWaitNewObjectDialog(true);

                var questWindow = window.open("/Aika/Quest");
                questWindow.onbeforeunload = function() {
                    self.showWaitNewObjectDialog(false);
                };
                questWindow.onQuestSaved = function(questId) {
                    questWindow.onQuestSaved = null;
                    self.showWaitNewObjectDialog(false);
                    self.addNewQuestNode(questId, x, y);
                };
            };

            /**
             * Creates a quest node from an existing quest
             * 
             * @param {float} x X-Drop Coordinate
             * @param {float} z X-Drop Coordinate
             */
            ChapterDetail.ViewModel.prototype.createExistingQuestNode = function(x, y) {
                var self = this;
                this.objectDialog.openQuestSearch(Aika.Localization.ViewModel.ChooseQuest).then(function(quest) {
                    self.addNewQuestNode(quest.id, x, y);
                });
            };

            /**
             * Creates a quest node from a quest id
             * 
             * @param {string} questId Id of the quest
             * @param {float} x X-Drop Coordinate
             * @param {float} z X-Drop Coordinate
             */
            ChapterDetail.ViewModel.prototype.addNewQuestNode = function(questId, x, y) {
                var initOptions = this.calcNodeInitOptionsPosition(x, y);
                initOptions.questId = questId;
                this.addNodeByType("aika.Quest", initOptions);
            };

            /**
             * Creates a chapter detail node from an existing chapter detail
             * 
             * @param {float} x X-Drop Coordinate
             * @param {float} z X-Drop Coordinate
             */
            ChapterDetail.ViewModel.prototype.createExistingChapterDetailNode = function(x, y) {
                var self = this;
                this.objectDialog.openChapterDetailSearch(Aika.Localization.ViewModel.ChooseChapterDetail, null, this.id).then(function(detail) {
                    var initOptions = self.calcNodeInitOptionsPosition(x, y);
                    initOptions.detailViewId = detail.id;
                    self.addNodeByType("aika.ChapterDetail", initOptions);
                });
            };


            /**
             * Saves the chapter detail
             */
            ChapterDetail.ViewModel.prototype.save = function() {
                if(!this.nodeGraph())
                {
                    return;
                }

                var serializedGraph = GoNorth.DefaultNodeShapes.Serialize.getNodeSerializerInstance().serializeGraph(this.nodeGraph());

                this.isLoading(true);
                this.errorOccured(false);
                var self = this;
                GoNorth.HttpClient.post("/api/AikaApi/UpdateChapterDetail?id=" + this.id(), serializedGraph).done(function(data) {
                    Aika.Shared.setDetailViewIds(self.nodeGraph(), data.detail);

                    if(!self.id())
                    {
                        self.id(data.id);
                        self.acquireLock();
                    }

                    if(window.refreshChapterNode)
                    {
                        window.refreshChapterNode();
                    }

                    self.isLoading(false);
                }).fail(function(xhr) {
                    self.isLoading(false);
                    self.errorOccured(true);

                    // If object is related to anything that prevents deleting a bad request (400) will be returned
                    if(xhr.status == 400 && xhr.responseText)
                    {
                        self.additionalErrorDetails(xhr.responseText);
                    }
                });
            };

            /**
             * Loads the data
             */
            ChapterDetail.ViewModel.prototype.load = function() {
                this.isLoading(true);
                this.errorOccured(false);
                var self = this;
                GoNorth.HttpClient.get("/api/AikaApi/GetChapterDetail?id=" + this.id()).done(function(data) {
                    self.isLoading(false);
                    self.name(data.name);

                    GoNorth.DefaultNodeShapes.Serialize.getNodeSerializerInstance().deserializeGraph(self.nodeGraph(), data, function(newNode) { self.setupNewNode(newNode); });

                    if(self.isReadonly())
                    {
                        self.setGraphToReadonly();
                    }
                }).fail(function(xhr) {
                    self.isLoading(false);
                    self.errorOccured(true);
                });
            };


            /**
             * Acquires a lock
             */
            ChapterDetail.ViewModel.prototype.acquireLock = function() {
                if(!this.id())
                {
                    return;
                }

                this.lockedByUser("");
                this.isReadonly(false);

                var self = this;
                GoNorth.LockService.acquireLock("ChapterDetail", this.id()).done(function(isLocked, lockedUsername) { 
                    if(isLocked)
                    {
                        self.isReadonly(true);
                        self.lockedByUser(lockedUsername);
                        self.setGraphToReadonly();
                    }
                }).fail(function() {
                    self.errorOccured(true);
                });
            };


            /**
             * Opens the quest list
             */
            ChapterDetail.ViewModel.prototype.openQuestList = function() {
                window.location = "/Aika/QuestList";
            };

        }(Aika.ChapterDetail = Aika.ChapterDetail || {}));
    }(GoNorth.Aika = GoNorth.Aika || {}));
}(window.GoNorth = window.GoNorth || {}));