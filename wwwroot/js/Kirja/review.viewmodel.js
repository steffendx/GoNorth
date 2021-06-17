(function(GoNorth) {
    "use strict";
    (function(SaveUtil) {

        /**
         * Prepares a save hotkey
         * @param {function} callback Callback function for saving
         */
         SaveUtil.setupSaveHotkey = function(callback) {
            jQuery(document).on("keydown", "*", "ctrl+s", function(event) {
                event.stopPropagation();
                event.preventDefault();
                callback();
            });
        };

    }(GoNorth.SaveUtil = GoNorth.SaveUtil || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(SaveUtil) {

            /// Auto save interval in milliseconds
            var autoSaveInterval = 60000;

            /**
             * Class to run dirty checks
             * @param {function} buildObjectSnapshot Function that builds a snapshot of the current data
             * @param {string} dirtyMessage Message that is shown if dirty chagnes exist and the user wants to navigate away from the page
             * @param {boolean} isAutoSaveDisabled true if auto save is disabled, else false
             * @param {function} saveCallback Function that will get called if an auto save is triggered
             * @class
             */
             SaveUtil.DirtyChecker = function(buildObjectSnapshot, dirtyMessage, isAutoSaveDisabled, saveCallback)
            {
                var self = this;
                window.addEventListener("beforeunload", function (e) {
                    return self.runDirtyCheck(e);
                });

                this.dirtyMessage = dirtyMessage;
                this.buildObjectSnapshot = buildObjectSnapshot;
                this.lastSnapshot = null;

                if(!isAutoSaveDisabled) {
                    this.saveCallback = saveCallback;
                    this.autoSaveInterval = setInterval(function() {
                        self.runAutoSave();
                    }, autoSaveInterval);
                }
            };

            SaveUtil.DirtyChecker.prototype = {
                /**
                 * Runs a dirty check
                 * @param {object} e Event object
                 * @returns {string} null if no change was triggered, else true
                 */
                runDirtyCheck: function(e) {
                    if(!this.isDirty()) {
                        return null;
                    }

                    e.preventDefault();
                    (e || window.event).returnValue = this.dirtyMessage;
                    return this.dirtyMessage;
                },

                /**
                 * Saves the current snapshot
                 */
                saveCurrentSnapshot: function() {
                    // Ensure async processing is done
                    var self = this;
                    jQuery(document).ajaxStop(function () {
                        setTimeout(function() {
                            self.lastSnapshot = self.buildObjectSnapshot();
                        }, 1);
                    });
                },

                /**
                 * Returns true if the object is currently dirty, else false
                 * @returns {boolean} True if the object is currently dirty, else
                 */
                isDirty: function() {
                    var currentSnapshot = this.buildObjectSnapshot();
                    var isSame = GoNorth.Util.isEqual(this.lastSnapshot, currentSnapshot);
                    return !isSame;
                },


                /**
                 * Runs an auto save command
                 */
                runAutoSave: function() {
                    if(!this.isDirty()) {
                        return;
                    }

                    this.saveCallback();   
                }
            };

    }(GoNorth.SaveUtil = GoNorth.SaveUtil || {}));
}(window.GoNorth = window.GoNorth || {}));
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
    (function(Kirja) {
        (function(Shared) {

            /**
             * Shared View Model
             * @class
             */
            Shared.BaseViewModel = function()
            {
                this.id = new ko.observable("");
                var paramId = GoNorth.Util.getParameterFromUrl("id");
                if(paramId)
                {
                    this.id(paramId);
                }

                this.isLoading = new ko.observable(false);
                this.isReadonly = new ko.observable(false);

                this.pageName = new ko.observable("");
                this.originalPageContent = null;
                this.pageContent = new ko.observable("");

                this.pageModifiedOn = new ko.observable("");

                this.linkDialog = new GoNorth.ChooseObjectDialog.ViewModel();
                this.linkDialogInsertHtmlCallback = null;

                this.errorOccured = new ko.observable(false);
                this.additionalErrorDetails = new ko.observable("");
                
                this.lockedByUser = new ko.observable("");
            };

            Shared.BaseViewModel.prototype = {
                /**
                 * Returns true if the link rich text buttons must be generated
                 * @returns {boolean} true if the link rich text buttons must be generated, else false
                 */
                allowLinkRichTextButtons: function() {
                    return true;
                },

                /**
                 * Generates additional rich text buttons
                 * @param {object} allKirjaButtons rich text buttons to extend
                 * @param {object} additionalParams Any additional parameters for generating the buttons
                 */
                generateAdditionalRichTextButtons: function(allKirjaButtons, additionalParams) {
                },

                /**
                 * Generates the rich text buttons
                 * 
                 * @param {object} additionalParams Any additional parameters for generating the buttons
                 * @returns {object} Rich text buttons
                 */
                generateRichTextButtons: function(additionalParams) {
                    var allKirjaButtons = {};
                    if(!this.allowLinkRichTextButtons())
                    {
                        this.generateAdditionalRichTextButtons(allKirjaButtons, additionalParams);
                        return allKirjaButtons;
                    }

                    var self = this;

                    var allKirjaButtons = {};
                    allKirjaButtons.insertTableOfContent = {
                        title: Shared.toolbarButtonInsertTableOfContentTitle,
                        icon: "glyphicon-list-alt",
                        callback: function(htmlInsert) {
                            htmlInsert("<br/><span contenteditable='false'><gn-kirjaTableOfContent></gn-kirjaTableOfContent></span><br/>")
                        }
                    };

                    allKirjaButtons.insertWikiLink = {
                        title: Shared.toolbarButtonInsertKirjaLinkTitle,
                        icon: "glyphicon-book",
                        callback: function(htmlInsert) {
                            self.linkDialogInsertHtmlCallback = htmlInsert;
                            if(self.openCreatePage) {
                                self.linkDialog.openKirjaPageSearch(Shared.toolbarButtonInsertKirjaLinkTitle, function() { self.openCreatePage() }, self.id).then(function(selectedObject) {
                                    self.addLinkFromLinkDialog(selectedObject, true);
                                });
                            } else {
                                self.linkDialog.openKirjaPageSearch(Shared.toolbarButtonInsertKirjaLinkTitle).then(function(selectedObject) {
                                    self.addLinkFromLinkDialog(selectedObject, true);
                                });
                            }
                        }
                    };

                    if(Shared.hasAikaRights)
                    {
                        allKirjaButtons.insertQuestLink = {
                            title: Shared.toolbarButtonInsertAikaQuestLinkTitle,
                            icon: "glyphicon-king",
                            callback: function(htmlInsert) {
                                self.linkDialogInsertHtmlCallback = htmlInsert;
                                self.linkDialog.openQuestSearch(Shared.toolbarButtonInsertAikaQuestLinkTitle).then(function(selectedObject) {
                                    self.addLinkFromLinkDialog(selectedObject, false);
                                });
                            }
                        };
                    }

                    if(Shared.hasKortistoRights)
                    {
                        allKirjaButtons.insertNpcLink = {
                            title: Shared.toolbarButtonInsertKortistoNpcLinkTitle,
                            icon: "glyphicon-user",
                            callback: function(htmlInsert) {
                                self.linkDialogInsertHtmlCallback = htmlInsert;
                                self.linkDialog.openNpcSearch(Shared.toolbarButtonInsertKortistoNpcLinkTitle).then(function(selectedObject) {
                                    self.addLinkFromLinkDialog(selectedObject, false);
                                });
                            }
                        };
                    }

                    if(Shared.hasStyrRights)
                    {
                        allKirjaButtons.insertItemLink = {
                            title: Shared.toolbarButtonInsertStyrItemLinkTitle,
                            icon: "glyphicon-apple",
                            callback: function(htmlInsert) {
                                self.linkDialogInsertHtmlCallback = htmlInsert;
                                self.linkDialog.openItemSearch(Shared.toolbarButtonInsertStyrItemLinkTitle).then(function(selectedObject) {
                                    self.addLinkFromLinkDialog(selectedObject, false);
                                });
                            }
                        };
                    }

                    if(Shared.hasEvneRights)
                    {
                        allKirjaButtons.insertSkillLink = {
                            title: Shared.toolbarButtonInsertEvneSkillLinkTitle,
                            icon: "glyphicon-flash",
                            callback: function(htmlInsert) {
                                self.linkDialogInsertHtmlCallback = htmlInsert;
                                self.linkDialog.openSkillSearch(Shared.toolbarButtonInsertEvneSkillLinkTitle).then(function(selectedObject) {
                                    self.addLinkFromLinkDialog(selectedObject, false);
                                });
                            }
                        };
                    }

                    this.generateAdditionalRichTextButtons(allKirjaButtons, additionalParams);

                    return allKirjaButtons;
                },

                /**
                 * Adds a link from the link dialog
                 * 
                 * @param {object} linkObj Link object
                 * @param {bool} samePage true if the link should open on the same page, else false
                 */
                 addLinkFromLinkDialog: function(linkObj, samePage) {
                    if(samePage)
                    {
                        this.linkDialogInsertHtmlCallback("<a href='" + linkObj.openLink  + "'>" + linkObj.name + "</a>");
                    }
                    else
                    {
                        this.linkDialogInsertHtmlCallback("<a href='" + linkObj.openLink + "' target='_blank'>" + linkObj.name + "</a>");
                    }
                },

                /**
                 * Fixes old links
                 * 
                 * @param {string} pageContent Page content
                 * @returns {string} Paged content with fixed links
                 */
                fixOldLinks: function(pageContent) {
                    if(!pageContent)
                    {
                        return "";
                    }

                    pageContent = this.fixOldLinksByControllerUrl(pageContent, "/Kirja");
                    pageContent = this.fixOldLinksByControllerUrl(pageContent, "/Kortisto/Npc");
                    pageContent = this.fixOldLinksByControllerUrl(pageContent, "/Styr/Item");
                    pageContent = this.fixOldLinksByControllerUrl(pageContent, "/Evne/Skill");
                    pageContent = this.fixOldLinksByControllerUrl(pageContent, "/Aika/Quest");
                
                    return pageContent;
                },

                /**
                 * Fixes old links by the controller url
                 * 
                 * @param {string} pageContent Page content
                 * @param {string} controllerUrl Controller Url to search for
                 * @returns {string} Page content with fixed links
                 */
                fixOldLinksByControllerUrl: function(pageContent, controllerUrl) {
                    var replaceRegex = new RegExp(" href=\"" + controllerUrl + "#id=([0-9A-F]{8}-([0-9A-F]{4}-){3}[0-9A-F]{12})\"", "gi");
                    pageContent = pageContent.replace(replaceRegex, function(match) {
                        return match.replace("#", "?");
                    });
                    return pageContent;
                }
            };

        }(Kirja.Shared = Kirja.Shared || {}));
    }(GoNorth.Kirja = GoNorth.Kirja || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(Kirja) {
        (function(Shared) {

            /**
             * Child Link Click Binding Handler
             */
            ko.bindingHandlers.childLinkClick = {
                init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
                    var callbackFunction = valueAccessor();
                    jQuery(element).on("click", "a", function(event) {
                        var href = jQuery(this).attr("href");
                        if(bindingContext.$data)
                        {
                            callbackFunction.apply(bindingContext.$data, [ href, event ]);
                        }
                        else
                        {
                            callbackFunction(href, event);
                        }
                    });
                },
                update: function () {
                }
            };

        }(Kirja.Shared = Kirja.Shared || {}));
    }(GoNorth.Kirja = GoNorth.Kirja || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(Kirja) {
        (function(Review) {

            /**
             * Review View Model
             * @class
             */
            Review.ViewModel = function()
            {
                Kirja.Shared.BaseViewModel.apply(this);

                this.reviewedPageId = new ko.observable("");
                this.additionalComment = new ko.observable("");

                this.pageExternalShareToken = new ko.observable("");
                this.isGeneratingExternalShareLink = new ko.observable(false);
                this.externalLinkShowSuccessfullyCopiedTooltip = new ko.observable(false);
                this.showExternalLink = new ko.observable(false);
                this.pageStatus = new ko.observable("");
                this.reviewStatusIsReadonly = new ko.pureComputed(function() {
                    return this.pageStatus() == "Completed" || this.pageStatus() == "Merged";
                }, this);
                this.visibleComments = new ko.observableArray();

                this.isRunningMerge = new ko.observable(false);
                this.mergePageName = new ko.observable("");
                this.mergeHtml = new ko.observable("");
                this.unmergedChangesExist = new ko.observable(false);
                this.visibleMergeTags = new ko.observableArray();
                this.mergePageLockedBy = new ko.observable("");
                this.mergePageLockedResetTimeout = null;

                this.loadReview();
                this.acquireLock();

                var self = this;
                var scrollContentThrottled = GoNorth.Util.throttle(function() {
                    self.updateCommentPositions();
                    self.updateMergeTagPosition();
                }, 15);
                jQuery(".gn-kirjaPageRichTextEditor").on("scroll", function() {
                    scrollContentThrottled();
                });
                jQuery(window).on("resize", function() {
                    scrollContentThrottled();
                });

                this.dirtyChecker = new GoNorth.SaveUtil.DirtyChecker(function() {
                    return self.buildSaveRequestObject();
                }, GoNorth.Kirja.Review.dirtyMessage, GoNorth.Kirja.Review.disableAutoSaving, function() {
                    self.save();
                });

                GoNorth.SaveUtil.setupSaveHotkey(function() {
                    self.save();
                });
            };

            Review.ViewModel.prototype = jQuery.extend({ }, Kirja.Shared.BaseViewModel.prototype, {
                /**
                 * Returns true if the link rich text buttons must be generated
                 * @returns {boolean} true if the link rich text buttons must be generated, else false
                 */
                allowLinkRichTextButtons: function() {
                    return GoNorth.Kirja.Shared.isUserSignedIn;
                },

                /**
                 * Generates additional rich text buttons
                 * @param {object} allKirjaButtons rich text buttons to extend
                 * @param {object} additionalParams Any additional parameters for generating the buttons
                 */
                generateAdditionalRichTextButtons: function(allKirjaButtons, additionalParams) {
                    self = this;
                    
                    if(!additionalParams) 
                    {
                        allKirjaButtons.comments = {
                            title: Review.toolbarButtonInsertComment,
                            icon: "glyphicon-comment",
                            callback: function(_htmlInsert, wrapElement) {
                                GoNorth.PromptService.openInputPrompt(Review.enterCommentText, "", true, true).done(function(commentText) {
                                    var maxCommentId = self.getMaxCommentId();
                                    var commentElement = jQuery("<gn-kirjacomment></gn-kirjacomment>");
                                    commentElement.prop("title", commentText);
                                    commentElement.attr("commentid", maxCommentId + 1);
                                    var commentText = commentElement[0].outerHTML;
                                    wrapElement(function() {
                                        return jQuery(commentText).attr("commenttagid", GoNorth.Util.uuidv4())[0];
                                    });
                                });
                            }
                        };
                    } 
                    else 
                    {
                        var self = this;
                        allKirjaButtons.commentsAcceptReject = {
                            toolbarButtonGroup: {
                                acceptAll: {
                                    title: Review.toolbarButtonAcceptAllChanges,
                                    icon: "glyphicon-ok",
                                    callback: function() {
                                        self.acceptRejectAllMergeGroups("ins", "del");
                                    }
                                },
                                rejectAll: {
                                    title: Review.toolbarButtonRejectAllChanges,
                                    icon: "glyphicon-remove",
                                    callback: function() {
                                        self.acceptRejectAllMergeGroups("del", "ins");
                                    }
                                }
                            }
                        };
                    }
                },

                /**
                 * Returns the max comment id
                 * @returns {number} Max comment id
                 */
                getMaxCommentId: function() {
                    var commentId = 0;
                    jQuery(this.pageContent()).find("gn-kirjacomment").each(function() {
                        var curCommentId = parseInt(jQuery(this).attr("commentid"));
                        if(!isNaN(curCommentId) && curCommentId > commentId) {
                            commentId = curCommentId;
                        }
                    });
                    return commentId;
                },

                /**
                 * Gets called on click of the page content
                 * @param {object} _d Data
                 * @param {object} event Javascript Click event
                 */
                onPageContentClick: function(_d, event) {
                    this.checkCommentFocus(event.target);
                    return true;
                },

                /**
                 * Returns the callout position for an element
                 * @param {object} element jQuery Object
                 * @returns {object} Callout position for element
                 */
                 getCalloutPositionFromElement: function(element) {
                    var parentElement = jQuery(".gn-kirjaCommentContainer:visible");
                    if(parentElement.length == 0) 
                    {
                        parentElement = jQuery(".gn-kirjaMergeTagContainer:visible");
                    }
                    
                    var parentPosition = parentElement.offset();
                    var elementPosition = element.offset();
                    return {
                        left: elementPosition.left - parentPosition.left,
                        top: elementPosition.top - parentPosition.top
                    };
                },
                
                /**
                 * Checks if a comment is focused
                 * @param {object} focusElement Focused element
                 */
                checkCommentFocus: function(focusElement) {
                    var comment = jQuery(focusElement).closest("gn-kirjacomment");
                    if(comment.length == 0)
                    {
                        this.visibleComments.removeAll();
                        return;
                    }

                    var comments = this.visibleComments();
                    for(let curComment = 0; curComment < comments.length; ++curComment)
                    {
                        if(comments[curComment].elem == comment[0])
                        {
                            return;
                        }
                    }

                    this.visibleComments.removeAll();
                    var position = this.getCalloutPositionFromElement(comment);
                    var commentElement = {
                        elem: comment[0],
                        left: new ko.observable(position.left),
                        top: new ko.observable(position.top),
                        width: new ko.observable(comment.width()), 
                        height: new ko.observable(comment.height()), 
                        text: new ko.observable(comment.prop("title")),
                        visible: new ko.observable(false)
                    };
                    commentElement.expandDownwards = new ko.computed(function() {
                        var top = this.top();   // Ensure Update is triggered
                        var visible = this.visible();
                        if(!visible) {
                            return false;
                        }

                        var commentCallout = jQuery(".gn-kirjaCommentCallout");
                        if(commentCallout.length == 0) {
                            return false;
                        }

                        var editor = jQuery(".gn-kirjaPageRichTextEditor:visible");
                        if(editor.length == 0) 
                        {
                            return false;
                        }

                        var commentContainer = this.elem.getBoundingClientRect();
                        var commentBoundingBox = commentCallout[0].getBoundingClientRect();
                        var containerBoundingBox = editor[0].getBoundingClientRect();
                        return commentBoundingBox.y < containerBoundingBox.y || commentContainer.y - commentBoundingBox.height < containerBoundingBox.y;
                    }, commentElement);

                    this.visibleComments.push(commentElement);
                    setTimeout(function() {
                        commentElement.visible(true);
                    }, 10);
                },

                /**
                 * Gets called if the comment position must be updated
                 */
                updateCommentPositions: function() {
                    var comments = this.visibleComments();
                    for(let curComment = 0; curComment < comments.length; ++curComment)
                    {
                        var commentElement = jQuery(comments[curComment].elem);
                        var position = this.getCalloutPositionFromElement(commentElement);
                        comments[curComment].left(position.left);
                        comments[curComment].top(position.top);
                        comments[curComment].width(commentElement.width());
                        comments[curComment].height(commentElement.height());
                    }
                },

                /**
                 * Edits a comment
                 * @param {object} comment Comment to edit
                 */
                editComment: function(comment) {
                    var self = this;
                    GoNorth.PromptService.openInputPrompt(Review.enterCommentText, comment.text(), true, true).done(function(commentText) {
                        var commentId = jQuery(comment.elem).attr("commentid");
                        var commentTagId = jQuery(comment.elem).attr("commenttagid");
                        var changePageContent = jQuery("<div>" + self.pageContent() + "</div>");
                        changePageContent.find("gn-kirjacomment[commentId=\"" + commentId + "\"]").each(function() {
                            jQuery(this).prop("title", commentText);
                        });
                        var cleanedContent = changePageContent;
                        while(cleanedContent.is("div") && cleanedContent.children().length == 1)
                        {
                            cleanedContent = cleanedContent.children().first();
                        }
                        var newHtml = cleanedContent.html();

                        comment.text(commentText);

                        self.selectAllReviewText();

                        document.execCommand("insertHTML", 0, newHtml);

                        self.clearEditorSelection();

                        comment.elem = jQuery("gn-kirjacomment[commenttagid=\"" + commentTagId + "\"]")[0];
                    });
                },

                /**
                 * Deletes a comment
                 * @param {object} comment Comment to delete
                 */
                deleteComment: function(comment) {
                    var self = this;
                    GoNorth.PromptService.openYesNoPrompt(Review.areYouSure, Review.areYouSureYouWantToDeleteTheComment).done(function() {
                        var commentId = jQuery(comment.elem).attr("commentid");
                        var changePageContent = jQuery("<div>" + self.pageContent() + "</div>");
                        changePageContent.find("gn-kirjacomment[commentId=\"" + commentId + "\"]").each(function() {
                            jQuery(this).replaceWith(jQuery(this).html());
                        });
                        var cleanedContent = changePageContent;
                        while(cleanedContent.is("div") && cleanedContent.children().length == 1)
                        {
                            cleanedContent = cleanedContent.children().first();
                        }
                        var newHtml = cleanedContent.html();

                        self.selectAllReviewText();

                        document.execCommand("insertHTML", 0, newHtml);

                        self.clearEditorSelection();

                        self.visibleComments.remove(comment);
                    });
                },

                /**
                 * Selects the whole review text
                 */
                 selectAllReviewText: function() {
                    this.clearEditorSelection();

                    var range = document.createRange();
                    if(jQuery(".gn-reviewContent:visible").children().length == 1)
                    {
                        range.selectNode(jQuery(".gn-reviewContent:visible").children()[0]);
                    }
                    else
                    {
                        range.selectNodeContents(jQuery(".gn-reviewContent:visible")[0]);
                    }
                    window.getSelection().addRange(range);
                },

                /**
                 * Clears the editor selection
                 */
                clearEditorSelection: function() {
                    try {
                        selection.removeAllRanges();
                    } catch (ex) {
                        if(document.body.createTextRange)
                        {
                            document.body.createTextRange().select();
                            document.selection.empty();
                        }
                        else
                        {
                            var range = document.createRange();
                            window.getSelection().addRange(range);
                            window.getSelection().empty()
                        }
                    }
                },


                /**
                 * Resets the error state
                 */
                resetErrorState: function() {
                    this.errorOccured(false);
                    this.additionalErrorDetails("");
                },

                /**
                 * Loads the review
                 */
                loadReview: function() {
                    var url = "/api/KirjaApi/Review?id=" + encodeURIComponent(this.id());
                    if(!GoNorth.Kirja.Shared.isUserSignedIn)
                    {
                        url = "/api/KirjaApi/ExternalReview?id=" + encodeURIComponent(this.id()) + "&token=" + encodeURIComponent(this.getExternalAccessToken());
                    }

                    this.isLoading(true);
                    this.showExternalLink(false);
                    this.resetErrorState();
                    var self = this;
                    GoNorth.HttpClient.get(url).done(function(data) {
                        self.isLoading(false);
                        if(!data)
                        {
                            self.errorOccured(true);
                            return;
                        }
                        
                        self.showExternalLink(true);
                        self.pageName(data.name);
                        self.pageContent(self.fixOldLinks(data.content));
                        self.pageExternalShareToken(data.externalAccessToken);
                        self.pageStatus(data.status);
                        self.additionalComment(data.additionalComment);
                        self.reviewedPageId(data.reviewedPageId);
                        self.originalPageContent = self.pageContent();
                        if(!self.id())
                        {
                            self.setId(data.id);
                        }
                        self.dirtyChecker.saveCurrentSnapshot();
                    }).fail(function(xhr) {
                        self.errorOccured(true);
                        self.isLoading(false);
                    });
                },

                /**
                 * Returns the cleaned html of the page. This removes uncessary divs
                 * @param {string} html HTML
                 * @returns {string} Cleaned Html
                 */
                getCleanedHtml: function(html) {
                    var cleanedHtml = jQuery("<div>" + html + "</div>");
                    while(cleanedHtml.children().length == 1 && cleanedHtml.children().first().is("div") && (!cleanedHtml.children()[0].attributes || cleanedHtml.children()[0].attributes.length == 0))
                    {
                        cleanedHtml.children().children().unwrap();
                    }
                    return cleanedHtml.html();
                },

                /**
                 * Builds the save request object
                 * @returns {object} Save Request object
                 */
                 buildSaveRequestObject: function() {
                    return {
                        content: this.getCleanedHtml(this.pageContent()),
                        additionalComment: this.additionalComment()
                    };
                },

                /**
                 * Saves the page
                 */
                save: function() {
                    // Send Data
                    var url = "/api/KirjaApi/UpdateReview?id=" + encodeURIComponent(this.id());
                    if(!GoNorth.Kirja.Shared.isUserSignedIn)
                    {
                        url = "/api/KirjaApi/UpdateExternalReview?id=" + encodeURIComponent(this.id()) + "&token=" + encodeURIComponent(this.getExternalAccessToken());
                    }

                    var request = this.buildSaveRequestObject();

                    this.isLoading(true);
                    this.resetErrorState();
                    var self = this;
                    GoNorth.HttpClient.post(url, request).done(function(savedPage) {
                        self.pageModifiedOn(savedPage.modifiedOn);
                        self.isLoading(false);
                        self.originalPageContent = self.pageContent();
                        self.dirtyChecker.saveCurrentSnapshot();
                    }).fail(function(xhr) {
                        self.isLoading(false);
                        self.errorOccured(true);
                    });
                },

                /**
                 * Copys an external sahre link
                 */
                copyExternalShareLink: function() {
                    if(this.pageExternalShareToken())
                    {
                        this.copyExternalLinkToClipboard();
                        return;
                    }

                    this.isGeneratingExternalShareLink(true);

                    var url = "/api/KirjaApi/GenerateExternalAccessToken?id=" + this.id();

                    var self = this;
                    GoNorth.HttpClient.post(url, {}).done(function(externalToken) {
                        self.isGeneratingExternalShareLink(false);
                        self.pageExternalShareToken(externalToken);
                        self.copyExternalLinkToClipboard();
                    }).fail(function(xhr) {
                        self.isGeneratingExternalShareLink(false);
                        self.errorOccured(true);
                    });
                },

                /**
                 * Copys a link to clipboard
                 */
                copyExternalLinkToClipboard: function() {
                    var link = window.location.origin + "/Kirja/ExternalReview?id=" + encodeURIComponent(this.id()) + "&token=" + encodeURIComponent(this.pageExternalShareToken());

                    jQuery("#gn-externalLinkContainer").remove();
                    jQuery("body").append("<div id='gn-externalLinkContainer' style='opacity: 0'><input id='gn-externalLink'/></div>");
                    jQuery("#gn-externalLink").val(link);

                    var exportResultField = jQuery("#gn-externalLink")[0];
                    exportResultField.select();
                    document.execCommand("copy");

                    jQuery("#gn-externalLinkContainer").remove();

                    this.externalLinkShowSuccessfullyCopiedTooltip(true);
                    var self = this;
                    setTimeout(function() {
                        self.externalLinkShowSuccessfullyCopiedTooltip(false);
                    }, 1000);
                },

                /**
                 * Revokes the external share link
                 */
                revokeExternalShareToken: function() {
                    this.isGeneratingExternalShareLink(true);

                    var url = "/api/KirjaApi/RevokeExternalAccessToken?id=" + encodeURIComponent(this.id());

                    this.resetErrorState();
                    var self = this;
                    GoNorth.HttpClient.delete(url, {}).done(function() {
                        self.isGeneratingExternalShareLink(false);
                        self.pageExternalShareToken("");
                    }).fail(function(xhr) {
                        self.isGeneratingExternalShareLink(false);
                        self.errorOccured(true);
                    });
                },

                /**
                 * Redirects back to the reviewed page
                 */
                backToReviewedPage: function() {
                    window.location.href = "/Kirja?id=" + this.reviewedPageId();
                },


                /**
                 * Marks the a review as completed
                 */
                markAsCompleted: function() {
                    this.setStatus("Completed");
                },

                /**
                 * Reopens a completed review
                 */
                 reopen: function() {
                    this.setStatus("Open");
                },
                
                /**
                 * Sets the status of a review
                 * @param {string} status Status to set
                 */
                setStatus: function(status) {
                    this.visibleComments.removeAll();

                    var url = "/api/KirjaApi/SetReviewStatus?id=" + encodeURIComponent(this.id()) + "&status=" + encodeURIComponent(status);
                    if(!GoNorth.Kirja.Shared.isUserSignedIn)
                    {
                        url = "/api/KirjaApi/SetExternalReviewStatus?id=" + encodeURIComponent(this.id()) + "&status=" + encodeURIComponent(status) + "&token=" + encodeURIComponent(this.getExternalAccessToken());
                    }

                    this.isLoading(true);
                    this.resetErrorState();
                    var self = this;
                    return GoNorth.HttpClient.post(url, {}).done(function() {
                        self.isLoading(false);
                        self.pageStatus(status);
                    }).fail(function(xhr) {
                        self.isLoading(false);
                        self.errorOccured(true);
                    });
                },


                /**
                 * Strips the comments from an HTML content
                 */
                stripComments: function(dataContent) {
                    var strippedComment = jQuery("<div>" + dataContent + "</div>"); 
                    strippedComment.find("gn-kirjacomment").prop("title", "");

                    var html = strippedComment.html();
                    html = html.replace(/<gn-kirjacomment.*?>/gi, "");
                    html = html.replace(/<\/gn-kirjacomment>/gi, "");

                    return html;
                },

                /**
                 * Groups merge tags
                 * @param {string} html Merge result html
                 * @returns {string} Grouped merge result
                 */
                groupMergeTags: function(html) {
                    var self = this;
                    var groupedResult = jQuery("<div>" + html + "</div>");
                    var curGroupId = 0;
                    groupedResult.find("del").each(function() {
                        if(jQuery(this).attr("mergeGroupId")) 
                        {
                            return;
                        }

                        ++curGroupId;
                        jQuery(this).attr("mergeGroupId", curGroupId);

                        var nextIns = self.findNextMergeTag(jQuery(this), "ins,del");
                        if(nextIns == null || nextIns.length == 0)
                        {
                            return;
                        }

                        while(nextIns != null && nextIns.length > 0)
                        {
                            nextIns.attr("mergeGroupId", curGroupId);
                            nextIns = self.findNextMergeTag(nextIns, "ins,del");
                        }
                    });

                    groupedResult.find("ins:not([mergeGroupId])").each(function() {
                        if(jQuery(this).attr("mergeGroupId")) 
                        {
                            return;
                        }

                        ++curGroupId;
                        jQuery(this).attr("mergeGroupId", curGroupId);

                        var nextIns = self.findNextMergeTag(jQuery(this), "ins");
                        if(nextIns == null || nextIns.length == 0)
                        {
                            return;
                        }

                        while(nextIns != null && nextIns.length > 0)
                        {
                            nextIns.attr("mergeGroupId", curGroupId);
                            nextIns = self.findNextMergeTag(nextIns, "ins");
                        }
                    });

                    return groupedResult.html();
                },

                /**
                 * Finds the next merge tag
                 * @param {object} startElem Start element
                 * @param {string} tagName Tag Name
                 * @returns {object} Next Merge tag
                 */
                findNextMergeTag: function(startElem, tagName) {
                    var nextMergeTag = startElem.next();
                    if(nextMergeTag.length > 0 && nextMergeTag.is(tagName))
                    {
                        return nextMergeTag;
                    }

                    var nextMergeChild = nextMergeTag.children().first();
                    if(nextMergeChild.length > 0 && nextMergeChild.is(tagName))
                    {
                        return nextMergeChild;
                    }

                    var nextElement = startElem.parent().next();
                    if(nextElement.length > 0 && nextElement.is(tagName))
                    {
                        return nextElement;
                    }

                    if(nextElement.length == 0)
                    {
                        return null;
                    }

                    var nextChild = nextElement.children().first();
                    if(nextChild.length > 0 && nextChild.is(tagName))
                    {
                        return nextChild;
                    }

                    while(nextChild.length > 0)
                    {
                        if(nextChild.is(tagName))
                        {
                            return nextChild;
                        }
                        nextChild = nextChild.children().first();
                    }

                    return null;
                },

                /**
                 * Cleans the comment merge
                 * @param {string} diffResult Diff result of the merge
                 */
                 cleanCommentMerge: function(diffResult) {
                    var cleanedDiffResult = jQuery("<div>" + diffResult + "</div>");
                    cleanedDiffResult.find("del[mergegroupid]").each(function() {
                        var oldContent = GoNorth.Util.unescapeHtmlSpecialCharacters(jQuery(this).html());
                        
                        var inserts = cleanedDiffResult.find("ins[mergegroupid=\"" + jQuery(this).attr("mergegroupid") + "\"]");
                        var newContent = "";
                        inserts.each(function() {
                            newContent += jQuery(this).html();
                        });
                        newContent = GoNorth.Util.unescapeHtmlSpecialCharacters(newContent);

                        if(oldContent == newContent) {
                            jQuery(this).replaceWith(oldContent);
                            inserts.remove();
                        }
                    });

                    return cleanedDiffResult.html();
                },

                /**
                 * Removes empty tags
                 * @param {string} html HTML to clean
                 */
                removeEmptyTags: function(html) {
                    var cleanedHtml = jQuery("<div>" + html + "</div>");

                    cleanedHtml.find("span:empty").remove();
                    cleanedHtml.find("div:empty").remove();
                    cleanedHtml.find("p:empty").remove();
                    cleanedHtml.find("a:empty").remove();

                    return cleanedHtml.html();
                },

                /**
                 * Starts a merge
                 */
                startMerge: function() {
                    var url = "/api/KirjaApi/Page";
                    if(this.id())
                    {
                        url += "?id=" + this.reviewedPageId();
                    }

                    if(this.mergePageLockedResetTimeout) {
                        clearTimeout(this.mergePageLockedResetTimeout);
                        this.mergePageLockedResetTimeout = null;
                    }
                    this.mergePageLockedBy("");

                    this.isRunningMerge(true);
                    this.isLoading(true);
                    this.resetErrorState();
                    var self = this;
                    GoNorth.LockService.releaseCurrentLock();
                    GoNorth.LockService.acquireLock("KirjaPage", this.reviewedPageId()).done(function(isLocked, lockedUsername) { 
                        if(isLocked) 
                        {
                            self.cancelMergeOnLockedPage();
                            return;
                        }

                        GoNorth.HttpClient.get(url).done(function(data) {
                            self.mergePageName(data.name);
                            var diffResult = htmldiff(data.content, self.stripComments(self.pageContent()));
                            diffResult = self.groupMergeTags(diffResult);
                            diffResult = self.cleanCommentMerge(diffResult);
                            diffResult = self.removeEmptyTags(diffResult);
                            self.mergeHtml(diffResult);
                            self.isLoading(false);
                        }).fail(function(xhr) {
                            self.errorOccured(true);
                            self.isLoading(false);
                        });
                    }).fail(function() {
                        self.errorOccured(true);
                        self.acquireLock();
                    });
                },

                /**
                 * Cancels a merge on a locked page
                 */
                cancelMergeOnLockedPage: function() {
                    var self = this;
                    this.isRunningMerge(false);
                    this.mergePageLockedBy(lockedUsername);
                    this.mergePageLockedResetTimeout = setTimeout(function() {
                        self.mergePageLockedBy("");
                    }, 5000);
                    this.isLoading(false);

                    GoNorth.LockService.releaseCurrentLock();
                    this.acquireLock();
                },
                    
                /**
                 * Cancels the merge process
                 */
                cancelMerge: function() {
                    GoNorth.LockService.releaseCurrentLock();
                    this.acquireLock();
                    this.isRunningMerge(false);
                },

                /**
                 * Checks if a merge tag is focused
                 * @param {object} focusElement Focused element
                 */
                checkMergeFocus: function(focusElement) {
                    var mergeTag = jQuery(focusElement).closest("del,ins");
                    if(mergeTag.length == 0)
                    {
                        this.visibleMergeTags.removeAll();
                        return;
                    }

                    var mergeTags = this.visibleMergeTags();
                    for(let curMergeTag = 0; curMergeTag < mergeTags.length; ++curMergeTag)
                    {
                        if(mergeTags[curMergeTag].elem == mergeTag[0])
                        {
                            return;
                        }
                    }

                    this.visibleMergeTags.removeAll();
                    var position = this.getCalloutPositionFromElement(mergeTag);
                    var mergeElement = {
                        elem: mergeTag[0],
                        left: new ko.observable(position.left),
                        top: new ko.observable(position.top),
                        width: new ko.observable(mergeTag.width()), 
                        height: new ko.observable(mergeTag.height()), 
                        visible: new ko.observable(false)
                    };
                    mergeElement.expandDownwards = new ko.computed(function() {
                        var top = this.top();   // Ensure Update is triggered
                        var visible = this.visible();
                        if(!visible) 
                        {
                            return false;
                        }

                        var mergeTagCallout = jQuery(".gn-kirjaMergeTagCallout");
                        if(mergeTagCallout.length == 0) 
                        {
                            return false;
                        }

                        var editor = jQuery(".gn-kirjaPageRichTextEditor:visible");
                        if(editor.length == 0) 
                        {
                            return false;
                        }

                        var mergeTagContainer = this.elem.getBoundingClientRect();
                        var mergeTagBoundingBox = mergeTagCallout[0].getBoundingClientRect();
                        var containerBoundingBox = editor[0].getBoundingClientRect();
                        return mergeTagBoundingBox.y < containerBoundingBox.y || mergeTagContainer.y - mergeTagBoundingBox.height < containerBoundingBox.y;
                    }, mergeElement);

                    this.visibleMergeTags.push(mergeElement);
                    setTimeout(function() {
                        mergeElement.visible(true);
                    }, 10);
                },

                /**
                 * Gets called if the merge tag position must be updated
                 */
                 updateMergeTagPosition: function() {
                    var mergeTags = this.visibleMergeTags();
                    for(let curMergeTag = 0; curMergeTag < mergeTags.length; ++curMergeTag)
                    {
                        var mergeTagElement = jQuery(mergeTags[curMergeTag].elem);
                        var position = this.getCalloutPositionFromElement(mergeTagElement);
                        mergeTags[curMergeTag].left(position.left);
                        mergeTags[curMergeTag].top(position.top);
                        mergeTags[curMergeTag].width(mergeTagElement.width());
                        mergeTags[curMergeTag].height(mergeTag.height());
                    }
                },

                /**
                 * Accepts or rejects all merge groups
                 * @param {string} keepTag Tags to keep
                 * @param {string} removeTag Tags to remove
                 */
                acceptRejectAllMergeGroups: function(keepTag, removeTag) {
                    var newHtml = this.acceptRejectMergeTagGroup(keepTag, removeTag, "*");
                    this.mergeHtml(newHtml);
                },

                /**
                 * Accepts a merge tag
                 * @param {object} mergeTag Merge Tag
                 * @param {boolean} isAccept True if the tag must be accepted, else false
                 */
                acceptRejectMergeTag: function(mergeTag, isAccept) {
                    var mergeGroupId = jQuery(mergeTag.elem).attr("mergeGroupId");

                    var keepTag = "ins";
                    var removeTag = "del";
                    if(!isAccept) 
                    {
                        keepTag = "del";
                        removeTag = "ins";
                    }

                    this.acceptRejectMergeTagGroup(keepTag, removeTag, mergeGroupId);
                },

                /**
                 * Accepts or rejects a merge tag group
                 * @param {string} keepTag Tag to keep
                 * @param {string} removeTag Tags to remove
                 * @param {string} groupId Id of the group, * for all
                 */
                acceptRejectMergeTagGroup: function(keepTag, removeTag, groupId) {
                    var keepSelector = keepTag;
                    var removeSelector = removeTag;
                    if(groupId != "*") {
                        keepSelector += "[mergeGroupId=\"" + groupId + "\"]";
                        removeSelector += "[mergeGroupId=\"" + groupId + "\"]";
                    }

                    var mergeHtml = jQuery("<div>" + this.mergeHtml() + "</div>");
                    mergeHtml.find(keepSelector).each(function() {
                        jQuery(this).replaceWith(jQuery(this).html());
                    });
                    mergeHtml.find(removeSelector).remove();

                    var newHtml = this.removeEmptyTags(mergeHtml.html());
                
                    jQuery(".gn-kirjaPageRichTextEditor:visible").focus();
                    this.selectAllReviewText();
                    document.execCommand("insertHTML", 0, newHtml);

                    this.visibleMergeTags.removeAll();

                    return newHtml;
                },

                /**
                 * Saves a merge
                 */
                saveMerge: function() {
                    if(!this.checkForUnmergedChanges()) {
                        this.unmergedChangesExist(true);
                        return;
                    }
                    
                    this.unmergedChangesExist(false);

                    var url = "/api/KirjaApi/UpdatePage?id=" + this.reviewedPageId();

                    var request = {
                        name: this.mergePageName(),
                        content: this.getCleanedHtml(this.mergeHtml())
                    };

                    this.isLoading(true);
                    this.resetErrorState();
                    var self = this;
                    GoNorth.HttpClient.post(url, request).done(function() {
                        GoNorth.LockService.releaseCurrentLock();
                        self.setStatus("Merged").done(function() {
                            self.isRunningMerge(false);
                            self.revokeExternalShareToken();
                        });
                    }).fail(function(xhr) {
                        self.isLoading(false);
                        self.errorOccured(true);
                    });
                },

                /**
                 * Checks if any unmerged changes exist
                 */
                checkForUnmergedChanges: function() {
                    return jQuery(this.mergeHtml()).find("ins").length == 0 && jQuery(this.mergeHtml()).find("del").length == 0;
                },


                /**
                 * Returns the external access token
                 * @returns {string} External access toekn
                 */
                getExternalAccessToken: function() {
                    return GoNorth.Util.getParameterFromUrl("token");
                },


                /**
                 * Triggers a delete for a review 
                 */
                deleteReview: function() {
                    var self = this;
                    GoNorth.PromptService.openYesNoPrompt(Review.areYouSure, Review.areYouSureYouWantToDeleteTheReview).done(function() {
                        var url = "/api/KirjaApi/DeleteReview?id=" + encodeURIComponent(self.id());
                        GoNorth.HttpClient.delete(url, {}).done(function() {
                            self.isLoading(false);
                            self.backToReviewedPage();
                        }).fail(function(xhr) {
                            self.isLoading(false);
                            self.errorOccured(true);
                        });
                    });
                },


                /**
                 * Acquires a lock
                 */
                 acquireLock: function() {
                    var self = this;
                    GoNorth.LockService.acquireLock("KirjaReview", this.id(), false, this.getExternalAccessToken()).done(function(isLocked, lockedUsername) { 
                        if(isLocked)
                        {
                            self.isReadonly(true);
                            self.lockedByUser(lockedUsername);
                        }
                        else
                        {
                            self.isReadonly(false);
                            self.lockedByUser("");
                        }
                    }).fail(function() {
                        self.errorOccured(true);
                        self.isReadonly(true);
                    });
                }
            });

        }(Kirja.Review = Kirja.Review || {}));
    }(GoNorth.Kirja = GoNorth.Kirja || {}));
}(window.GoNorth = window.GoNorth || {}));