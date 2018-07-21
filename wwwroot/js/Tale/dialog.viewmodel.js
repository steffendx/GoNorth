(function(GoNorth) {
    "use strict";
    (function(ChooseObjectDialog) {

        /// Dialog Page Size
        var dialogPageSize = 15;

        /**
         * Page View Model
         * @class
         */
        ChooseObjectDialog.ViewModel = function()
        {
            this.showDialog = new ko.observable(false);
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

            this.choosingDeferred = null;
        };

        ChooseObjectDialog.ViewModel.prototype = {
            /**
             * Opens the dialog to search for npcs
             * 
             * @param {string} dialogTitle Title of the dialog
             * @param {function} createCallback Optional callback that will get triggered on hitting the new button, if none is provided the button will be hidden
             * @returns {jQuery.Deferred} Deferred for the selecting process
             */
            openNpcSearch: function(dialogTitle, createCallback) {
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
                return this.openDialog(dialogTitle, this.searchChapterDetails, createCallback, idObservable);
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
                this.dialogSearchPattern("");
                this.dialogIsLoading(false);
                this.dialogEntries([]);
                this.dialogHasMore(false);
                this.dialogCurrentPage(0);
                this.idObservable = idObservable;

                this.choosingDeferred = new jQuery.Deferred();
                return this.choosingDeferred.promise();
            },

            /**
             * Selects an object
             * 
             * @param {object} selectedObject Selected object
             */
            selectObject: function(selectedObject) {
                if(this.choosingDeferred)
                {
                    this.choosingDeferred.resolve(selectedObject);
                    this.choosingDeferred = null;
                }

                this.closeDialog();
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
             * @param {string} name Name of the object
             * @param {string} openLink Link to open the object
             */
            createDialogObject: function(id, name, openLink) {
                return {
                    id: id,
                    name: name,
                    openLink: openLink
                };
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
                jQuery.ajax({ 
                    url: searchUrl, 
                    type: "GET"
                }).done(function(data) {
                    var result = {
                        hasMore: data.hasMore,
                        entries: []
                    };

                    for(var curEntry = 0; curEntry < data.pages.length; ++curEntry)
                    {
                        result.entries.push(self.createDialogObject(data.pages[curEntry].id, data.pages[curEntry].name, "/Kirja#id=" + data.pages[curEntry].id));
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
                jQuery.ajax({ 
                    url: "/api/KortistoApi/SearchFlexFieldObjects?searchPattern=" + encodeURIComponent(searchPattern) + "&start=" + (this.dialogCurrentPage() * dialogPageSize) + "&pageSize=" + dialogPageSize, 
                    type: "GET"
                }).done(function(data) {
                    var result = {
                        hasMore: data.hasMore,
                        entries: []
                    };

                    for(var curEntry = 0; curEntry < data.flexFieldObjects.length; ++curEntry)
                    {
                        result.entries.push(self.createDialogObject(data.flexFieldObjects[curEntry].id, data.flexFieldObjects[curEntry].name, "/Kortisto/Npc#id=" + data.flexFieldObjects[curEntry].id));
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
                jQuery.ajax({ 
                    url: "/api/StyrApi/SearchFlexFieldObjects?searchPattern=" + encodeURIComponent(searchPattern) + "&start=" + (this.dialogCurrentPage() * dialogPageSize) + "&pageSize=" + dialogPageSize, 
                    type: "GET"
                }).done(function(data) {
                    var result = {
                        hasMore: data.hasMore,
                        entries: []
                    };

                    for(var curEntry = 0; curEntry < data.flexFieldObjects.length; ++curEntry)
                    {
                        result.entries.push(self.createDialogObject(data.flexFieldObjects[curEntry].id, data.flexFieldObjects[curEntry].name, "/Styr/Item#id=" + data.flexFieldObjects[curEntry].id));
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
                jQuery.ajax({ 
                    url: "/api/EvneApi/SearchFlexFieldObjects?searchPattern=" + encodeURIComponent(searchPattern) + "&start=" + (this.dialogCurrentPage() * dialogPageSize) + "&pageSize=" + dialogPageSize, 
                    type: "GET"
                }).done(function(data) {
                    var result = {
                        hasMore: data.hasMore,
                        entries: []
                    };

                    for(var curEntry = 0; curEntry < data.flexFieldObjects.length; ++curEntry)
                    {
                        result.entries.push(self.createDialogObject(data.flexFieldObjects[curEntry].id, data.flexFieldObjects[curEntry].name, "/Evne/Skill#id=" + data.flexFieldObjects[curEntry].id));
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
                jQuery.ajax({ 
                    url: "/api/AikaApi/GetQuests?searchPattern=" + encodeURIComponent(searchPattern) + "&start=" + (this.dialogCurrentPage() * dialogPageSize) + "&pageSize=" + dialogPageSize, 
                    type: "GET"
                }).done(function(data) {
                    var result = {
                        hasMore: data.hasMore,
                        entries: []
                    };

                    for(var curEntry = 0; curEntry < data.quests.length; ++curEntry)
                    {
                        result.entries.push(self.createDialogObject(data.quests[curEntry].id, data.quests[curEntry].name, "/Aika/Quest#id=" + data.quests[curEntry].id));
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
                jQuery.ajax({ 
                    url: "/api/AikaApi/GetChapterDetails?searchPattern=" + encodeURIComponent(searchPattern) + "&start=" + (this.dialogCurrentPage() * dialogPageSize) + "&pageSize=" + dialogPageSize, 
                    type: "GET"
                }).done(function(data) {
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

                        result.entries.push(self.createDialogObject(data.details[curEntry].id, data.details[curEntry].name, "/Aika/Detail#id=" + data.details[curEntry].id));
                    }

                    def.resolve(result);
                }).fail(function(xhr) {
                    def.reject();
                });

                return def.promise();
            }
            
        };

    }(GoNorth.ChooseObjectDialog = GoNorth.ChooseObjectDialog || {}));
}(window.GoNorth = window.GoNorth || {}));
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
    (function(DefaultNodeShapes) {
        (function(Shapes) {

            /// Object Resource for npcs
            Shapes.ObjectResourceNpc = 0;

            /// Object Resource for items
            Shapes.ObjectResourceItem = 1;

            /// Object Resource for quests
            Shapes.ObjectResourceQuest = 2;
            
            /// Object Resource for dialogs
            Shapes.ObjectResourceDialogs = 3;

            /// Object Resource for Map Marker
            Shapes.ObjectResourceMapMarker = 4;

            /// Object Resource for Skills
            Shapes.ObjectResourceSkill = 5;


            /// Cached loaded objects
            var loadedObjects = {};

            /// Deferreds for loading objects
            var objectsLoadingDeferreds = {};


            /**
             * Resets the loaded value for an object
             * 
             * @param {number} objectType Object Type
             * @param {string} objectId Object Id
             */
            Shapes.resetSharedObjectLoading = function(objectType, objectId)
            {
                if(loadedObjects[objectType] && loadedObjects[objectType][objectId])
                {
                    loadedObjects[objectType][objectId] = null;
                }

                if(objectsLoadingDeferreds[objectType] && objectsLoadingDeferreds[objectType][objectId])
                {
                    objectsLoadingDeferreds[objectType][objectId] = null;
                }
            };


            /**
             * Shared object loading
             * @class
             */
            Shapes.SharedObjectLoading = function()
            {
            };

            Shapes.SharedObjectLoading.prototype = {
                /**
                 * Returns the id for an object
                 * 
                 * @param {object} existingData Optional Existing data
                 * @returns {string} Object Id
                 */
                getObjectId: function(existingData) {

                },

                /**
                 * Returns the object resource
                 * 
                 * @returns {int} Object Resource
                 */
                getObjectResource: function() {

                },

                /**
                 * Clears a loaded shared object
                 * 
                 * @param {object} existingData Optional Existing data
                 */
                clearLoadedSharedObject: function(existingData) {
                    var objectId = this.getObjectId(existingData);
                    if(loadedObjects[this.getObjectResource()]) {
                        loadedObjects[this.getObjectResource()][objectId] = null;
                    }

                    if(objectsLoadingDeferreds[this.getObjectResource()]) {
                        objectsLoadingDeferreds[this.getObjectResource()][objectId] = null;
                    }
                },

                /**
                 * Loads a shared object
                 * 
                 * @param {object} existingData Optional Existing data
                 */
                loadObjectShared: function(existingData) {
                    var objectId = this.getObjectId(existingData);
    
                    if(loadedObjects[this.getObjectResource()]) {
                        var existingObject = loadedObjects[this.getObjectResource()][objectId];
                        if(existingObject)
                        {
                            var def = new jQuery.Deferred();
                            def.resolve(existingObject);
                            return def.promise();
                        }
                    }
    
                    if(objectsLoadingDeferreds[this.getObjectResource()])
                    {
                        var existingDef = objectsLoadingDeferreds[this.getObjectResource()][objectId];
                        if(existingDef)
                        {
                            return existingDef;
                        }
                    }
    
                    var loadingDef = this.loadObject(objectId);
                    if(!objectsLoadingDeferreds[this.getObjectResource()])
                    {
                        objectsLoadingDeferreds[this.getObjectResource()] = {};
                    }

                    objectsLoadingDeferreds[this.getObjectResource()][objectId] = loadingDef;
    
                    var self = this;
                    loadingDef.then(function(object) {
                        if(!loadedObjects[self.getObjectResource()])
                        {
                            loadedObjects[self.getObjectResource()] = {};
                        }

                        loadedObjects[self.getObjectResource()][objectId] = object;
                    });
    
                    return loadingDef;
                },

                /**
                 * Loads and object
                 * 
                 * @param {string} objectId Optional Object Id extracted using getObjectId before
                 * @returns {jQuery.Deferred} Deferred for the loading process
                 */
                loadObject: function(objectId) {

                }
            };


        }(DefaultNodeShapes.Shapes = DefaultNodeShapes.Shapes || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Shapes) {

            /// Quest state not started
            var questStateNotStarted = 0;

            /// Quest state in progress
            var questStateInProgress = 1;

            /// Quest state success
            var questStateSuccess = 2;

            /// Quest state failed
            var questStateFailed = 3;

            /// Quest state label lookup
            var questStateLabelLookup = { };
            questStateLabelLookup[questStateNotStarted] = DefaultNodeShapes.Localization.QuestStates.NotStarted;
            questStateLabelLookup[questStateInProgress] = DefaultNodeShapes.Localization.QuestStates.InProgress;
            questStateLabelLookup[questStateSuccess] = DefaultNodeShapes.Localization.QuestStates.Success;
            questStateLabelLookup[questStateFailed] = DefaultNodeShapes.Localization.QuestStates.Failed;

            /**
             * Creates a quest state object
             * 
             * @param {int} questState QUest State Number
             * @returns {object} Quest State Object
             */
            function createState(questState) {
                return {
                    questState: questState,
                    label: questStateLabelLookup[questState]
                };
            };

            /**
             * Returns the quest state label for a quest state value
             * 
             * @param {int} questState Quest State to return the label for
             * @returns {string} Quest State Label
             */
            Shapes.getQuestStateLabel = function(questState) {
                return questStateLabelLookup[questState];
            };

            /**
             * Returns all available quest states
             * 
             * @returns {object[]} Array of all available quest states
             */
            Shapes.getQuestStates = function() {
                return [
                    createState(questStateNotStarted),
                    createState(questStateInProgress),
                    createState(questStateSuccess),
                    createState(questStateFailed)
                ];
            };

        }(DefaultNodeShapes.Shapes = DefaultNodeShapes.Shapes || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
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
                    position: { x: (x - translate.tx) / scale.sx, y: (y - translate.ty) / scale.sy }
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
    (function(Util) {
        
        /**
         * Filters a list of fields for fields which can be used in a script
         * @param {object[]} fields Unfiltered fields
         * @returns {object[]} Filtered fields
         */
        Util.getFilteredFieldsForScript = function(fields) {
            if(!fields)
            {
                return [];
            }

            var filteredFields = [];
            for(var curField = 0; curField < fields.length; ++curField)
            {
                if(fields[curField].fieldType == GoNorth.FlexFieldDatabase.ObjectForm.FlexFieldTypeMultiLine ||
                   (fields[curField].scriptSettings && fields[curField].scriptSettings.dontExportToScript))
                {
                    continue;
                }
                filteredFields.push(fields[curField]);

                if(!fields[curField].scriptSettings || !fields[curField].scriptSettings.additionalScriptNames)
                {
                    continue;
                }

                // Add additional names
                var additionalNames = fields[curField].scriptSettings.additionalScriptNames.split(GoNorth.FlexFieldDatabase.ObjectForm.FlexFieldScriptSettingsAdditionalScriptNameSeperator); 
                for(var curAdditionalName = 0; curAdditionalName < additionalNames.length; ++curAdditionalName)
                {
                    var additionalField = jQuery.extend({ }, fields[curField]);
                    additionalField.name = additionalNames[curAdditionalName];
                    filteredFields.push(additionalField);
                }
            }

            return filteredFields;
        }

    }(GoNorth.Util = GoNorth.Util || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(Tale) {
        (function(Shapes) {

            /// Player Text Type
            var playerTextType = "tale.PlayerText";

            /// Player Text Target Array
            var playerTextTargetArray = "playerText";


            /// Npc Text Type
            var npcTextType = "tale.NpcText";

            /// Npc Text Target Array
            var npcTextTargetArray = "npcText";


            joint.shapes.tale = joint.shapes.tale || {};

            /**
             * Creates the text shape
             * @param {string} type Type name of the shape
             * @returns {object} Text Shape
             * @memberof Shapes
             */
            function createTextShape(type) {
                var model = joint.shapes.devs.Model.extend(
                {
                    defaults: joint.util.deepSupplement
                    (
                        {
                            type: type,
                            icon: "glyphicon-comment",
                            size: { width: 250, height: 150 },
                            inPorts: ['input'],
                            outPorts: ['output'],
                            attrs:
                            {
                                '.inPorts circle': { "magnet": "passive", "port-type": "input" },
                                '.outPorts circle': { "magnet": "true" } 
                            },
                        },
                        joint.shapes.default.Base.prototype.defaults
                    )
                });
                return model;
            }

            /**
             * Creates a text view
             * @param {string} placeHolder Placeholder for the textarea
             * @returns {object} Text view 
             * @memberof Shapes
             */
            function createTextView(placeHolder) {
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
                            '<textarea class="nodeText" placeholder="' + placeHolder + '" />',
                        '</div>',
                    ].join('')
                });
            }

            /**
             * PlayerText Shape
             */
            joint.shapes.tale.PlayerText = createTextShape(playerTextType);

            /**
             * PlayerText View
             */
            joint.shapes.tale.PlayerTextView = createTextView(Tale.Localization.PlayerTextPlaceHolder);


            /**
             * NpcText Shape
             */
            joint.shapes.tale.NpcText = createTextShape(npcTextType);
            
            /**
             * NpcText View
             */
            joint.shapes.tale.NpcTextView = createTextView(Tale.Localization.NpcTextPlaceHolder);


            /** 
             * Text Line Serializer 
             * 
             * @param {object} classType Class Type
             * @param {string} type Type for the serialization
             * @param {string} serializeArrayName Name of the target array for the serialization
             * @class
             */
            Shapes.TextLineSerializer = function(classType, type, serializeArrayName)
            {
                GoNorth.DefaultNodeShapes.Serialize.BaseNodeSerializer.apply(this, [classType, type, serializeArrayName ]);
            };

            Shapes.TextLineSerializer.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.Serialize.BaseNodeSerializer.prototype)

            /**
             * Serializes a node
             * 
             * @param {object} node Node Object
             * @returns {object} Serialized NOde
             */
            Shapes.TextLineSerializer.prototype.serialize = function(node) {
                var serializedData = {
                    id: node.id,
                    x: node.position.x,
                    y: node.position.y,
                    text: node.nodeText
                };

                return serializedData;
            };

            /**
             * Deserializes a serialized node
             * 
             * @param {object} node Serialized Node Object
             * @returns {object} Deserialized Node
             */
            Shapes.TextLineSerializer.prototype.deserialize = function(node) {
                var initOptions = {
                    id: node.id,
                    nodeText: node.text,
                    position: { x: node.x, y: node.y }
                };

                var node = new this.classType(initOptions);
                return node;
            };

            // Register Serializers
            var playerSerializer = new Shapes.TextLineSerializer(joint.shapes.tale.PlayerText, playerTextType, playerTextTargetArray);
            GoNorth.DefaultNodeShapes.Serialize.getNodeSerializerInstance().addNodeSerializer(playerSerializer);

            var npcSerializer = new Shapes.TextLineSerializer(joint.shapes.tale.NpcText, npcTextType, npcTextTargetArray);
            GoNorth.DefaultNodeShapes.Serialize.getNodeSerializerInstance().addNodeSerializer(npcSerializer);

        }(Tale.Shapes = Tale.Shapes || {}));
    }(GoNorth.Tale = GoNorth.Tale || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(Tale) {
        (function(Shapes) {

            /// Choice Type
            var choiceType = "tale.Choice";
            
            /// Choice Target Array
            var choiceTargetArray = "choice";


            /// Choice node width
            var choiceWidth = 390;

            /// Min Choice Height
            var choiceMinHeight = 50;

            /// Height of choice item in pixel
            var choiceItemHeight = 66;

            /// Initial Offset of the port
            var choicePortInitialOffset = 76;


            joint.shapes.tale = joint.shapes.tale || {};

            /**
             * Creates the choice shape
             * @returns {object} Choice shape
             */
            function createChoiceShape() {
                var model = joint.shapes.devs.Model.extend(
                {
                    defaults: joint.util.deepSupplement
                    (
                        {
                            type: choiceType,
                            icon: "glyphicon-th-list",
                            size: { width: choiceWidth, height: choiceMinHeight },
                            inPorts: ['input'],
                            outPorts: [],
                            attrs:
                            {
                                '.inPorts circle': { "magnet": "passive", "port-type": "input" },
                                '.outPorts circle': { "magnet": "true" }
                            },
                            choices: [],
                            currentChoiceId: 0
                        },
                        joint.shapes.default.Base.prototype.defaults
                    )
                });
                return model;
            }

            /**
             * Creates a choice view
             * @returns {object} Choice view
             */
            function createChoiceView() {
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
                            '<button class="gn-taleAddChoice gn-nodeDeleteOnReadonly cornerButton" title="' + Tale.Localization.Choices.AddNewChoice + '">+</button>',
                        '</div>',
                    ].join(''),

                    /** 
                     * Additiona Callback Buttons 
                     */
                    additionalCallbackButtons: {
                        "gn-taleAddChoice": function() {
                            this.addChoice();
                        }
                    },

                    /**
                     * Initializes the shape
                     */
                    initialize: function() {
                        _.bindAll(this, 'addChoice');
                        joint.shapes.default.BaseView.prototype.initialize.apply(this, arguments);

                        this.model.on('change:choices', this.syncChoices, this);

                        if(this.model.get("choices").length == 0)
                        {
                            this.addChoice();
                        }
                        else
                        {
                            this.syncChoices();
                        }
                    },

                    /**
                     * Adds a new choice
                     * 
                     * @param {object} existingChoice Existing choice to add, null to create new one
                     */
                    addChoice: function(existingChoice) {
                        var choice = existingChoice;
                        if(!choice)
                        {
                            choice = {
                                id: this.model.get("currentChoiceId"),
                                text: "",
                                isRepeatable: true,
                                condition: null
                            };
                            this.model.set("currentChoiceId", this.model.get("currentChoiceId") + 1);
                        }

                        // Copy choices and update using set
                        var newChoices = (this.model.get("choices") || {}).slice();
                        newChoices.push(choice);
                        this.model.set("choices", newChoices);
                    },

                    /**
                     * Sets the choice text
                     * 
                     * @param {number} choiceId Choice Id
                     * @param {string} newText New Text
                     */
                    setChoiceText: function(choiceId, newText) {
                        var choices = this.model.get("choices");
                        for(var curChoice = 0; curChoice < choices.length; ++curChoice)
                        {
                            if(choices[curChoice].id == choiceId)
                            {
                                choices[curChoice].text = newText;

                                var inputBox = this.$box.find(".gn-taleChoiceInput[data-choiceid='" + choiceId + "']");
                                if(!inputBox.is(':focus'))
                                {
                                    inputBox.val(newText);
                                }
                                return;
                            }
                        }
                    },

                    /**
                     * Moves a choice
                     * 
                     * @param {number} choiceId Choice Id
                     * @param {number} direction Direction to move
                     */
                    moveChoice: function(choiceId, direction) {
                        var newChoices = (this.model.get("choices") || {}).slice();
                        for(var curChoice = 0; curChoice < newChoices.length; ++curChoice)
                        {
                            if(newChoices[curChoice].id == choiceId)
                            {
                                var newIndex = curChoice + direction;
                                if(newIndex >= 0 && newIndex < newChoices.length)
                                {
                                    var tmpChoice = newChoices[curChoice];
                                    newChoices[curChoice] = newChoices[newIndex];
                                    newChoices[newIndex] = tmpChoice;
                                    this.model.set("choices", newChoices);
                                }
                                return;
                            }
                        }
                    },

                    /**
                     * Delets a choice
                     * 
                     * @param {number} choiceId Choice Id
                     */
                    deleteChoice: function(choiceId) {
                        var newChoices = (this.model.get("choices") || {}).slice();
                        for(var curChoice = 0; curChoice < newChoices.length; ++curChoice)
                        {
                            if(newChoices[curChoice].id == choiceId)
                            {
                                newChoices.splice(curChoice, 1);
                                this.model.set("choices", newChoices);
                                return;
                            }
                        }
                    },

                    /**
                     * Opens the condition dialog for a choice
                     * 
                     * @param {number} choiceId Choice Id
                     */
                    openConditionDialog: function(choiceId) {
                        var choices = this.model.get("choices");
                        for(var curChoice = 0; curChoice < choices.length; ++curChoice)
                        {
                            if(choices[curChoice].id == choiceId)
                            {
                                var condition = choices[curChoice].condition;
                                if(!condition) 
                                {
                                    condition = {
                                        id: choices[curChoice].id,
                                        conditionElements: []
                                    };
                                }

                                var self = this;
                                GoNorth.DefaultNodeShapes.openConditionDialog(condition).then(function() {
                                    if(condition.conditionElements.length > 0)
                                    {
                                        choices[curChoice].condition = condition;
                                    }
                                    else
                                    {
                                        choices[curChoice].condition = null;
                                    }
                                    self.syncChoices();
                                });
                                return;
                            }
                        }
                    },

                    /**
                     * Toogles a condition as repeatable
                     * 
                     * @param {number} choiceId Choice Id
                     */
                    toogleConditionIsRepeatable: function(choiceId) {
                        var choices = this.model.get("choices");
                        for(var curChoice = 0; curChoice < choices.length; ++curChoice)
                        {
                            if(choices[curChoice].id == choiceId)
                            {
                                choices[curChoice].isRepeatable = !choices[curChoice].isRepeatable;
                                this.$box.find(".gn-taleChoiceToogleIsRepeatable[data-choiceid='" + choiceId + "']").toggleClass("gn-taleChoiceIsRepeatable");
                                return;
                            }
                        }
                    },

                    /**
                     * Syncs the chocies (ports, size, ...)
                     */
                    syncChoices: function() {
                        var outPorts = [];
                        var choices = this.model.get("choices");
                        for(var curChoice = 0; curChoice < choices.length; ++curChoice)
                        {
                            outPorts.push("choice" + choices[curChoice].id);
                        }
                        this.model.set("outPorts", outPorts);

                        // Update Html
                        this.model.set("size", { width: choiceWidth, height: choiceMinHeight + choices.length * choiceItemHeight});
                        var choiceTable = "<table class='gn-taleChoiceTable'>";
                        var self = this;
                        jQuery.each(choices, function(index, choice) {
                            var conditionClasses = "glyphicon glyphicon-question-sign gn-taleEditChoiceCondition gn-taleChoiceIcon";

                            choiceTable += "<tr>";
                            choiceTable += "<td class='gn-taleChoiceTextCell'>";
                            if(choice.condition)
                            {
                                conditionClasses += " gn-taleChoiceHasCondition";

                                var conditionText = GoNorth.DefaultNodeShapes.Localization.Conditions.LoadingConditionText;

                                var selectorString = ".gn-taleChoiceConditionText[data-choiceid='" + choice.id + "']";
                                var textDef = GoNorth.DefaultNodeShapes.Conditions.getConditionManager().getConditionString(choice.condition.conditionElements, GoNorth.DefaultNodeShapes.Localization.Conditions.AndOperatorShort, false);
                                textDef.then(function(generatedText) {
                                    if(generatedText) {
                                        generatedText += " :";
                                    }

                                    self.$box.find(selectorString).attr("title", generatedText);
                                    self.$box.find(selectorString).text(generatedText);
                                    conditionText = generatedText;  // Update condition text in case no async operation was necessary
                                }, function() {
                                    self.$box.find(selectorString).text(GoNorth.DefaultNodeShapes.Localization.Conditions.ErrorLoadingConditionText);
                                    conditionText = GoNorth.DefaultNodeShapes.Localization.Conditions.ErrorLoadingConditionText;
                                });

                                choiceTable += "<div class='gn-taleChoiceConditionText' data-choiceid='" + choice.id + "' title='" + conditionText + "'>" + conditionText + "</div>";
                            }

                            var isRepeatableClasses = "glyphicon glyphicon-repeat gn-taleChoiceToogleIsRepeatable gn-taleChoiceIcon";
                            if(choice.isRepeatable)
                            {
                                isRepeatableClasses += " gn-taleChoiceIsRepeatable";
                            }                            

                            choiceTable += "<input type='text' class='gn-taleChoiceInput' value='" + choice.text + "' data-choiceid='" + choice.id + "' placeholder='" + GoNorth.Tale.Localization.Choices.ChoiceText + "'/></td>";
                            choiceTable += "<td class='gn-nodeDeleteOnReadonly'><i class='glyphicon glyphicon-arrow-up gn-taleMoveChoiceUp gn-taleChoiceIcon' data-choiceid='" + choice.id + "' title='" + Tale.Localization.Choices.MoveUpToolTip + "'></i></td>";
                            choiceTable += "<td class='gn-nodeDeleteOnReadonly'><i class='glyphicon glyphicon-arrow-down gn-taleMoveChoiceDown gn-taleChoiceIcon' data-choiceid='" + choice.id + "' title='" + Tale.Localization.Choices.MoveDownToolTip + "'></i></td>";
                            choiceTable += "<td class='gn-nodeDeleteOnReadonly'><i class='" + conditionClasses + "' data-choiceid='" + choice.id + "' title='" + Tale.Localization.Choices.EditConditionToolTip + "'></i></td>";
                            choiceTable += "<td class='gn-nodeDeleteOnReadonly'><i class='" + isRepeatableClasses + "' data-choiceid='" + choice.id + "' title='" + Tale.Localization.Choices.AllowMultipleSelectionToolTip + "'></i></td>";
                            choiceTable += "<td class='gn-nodeDeleteOnReadonly'><i class='glyphicon glyphicon-trash gn-taleDeleteChoice gn-taleChoiceIcon' data-choiceid='" + choice.id + "' title='" + Tale.Localization.Choices.DeleteToolTip + "'></i></td>";
                            choiceTable += "</tr>";
                        });

                        choiceTable += "</table>";
                        if(this.$box.find(".gn-taleChoiceTable").length > 0)
                        {
                            this.$box.find(".gn-taleChoiceTable").replaceWith(choiceTable);
                        }
                        else
                        {
                            this.$box.append(choiceTable);
                        }

                        // Update Port Positions
                        for(var curChoice = 0; curChoice < choices.length; ++curChoice)
                        {
                            this.model.attr(".outPorts>.port" + curChoice, { "ref-y": (choicePortInitialOffset + choiceItemHeight * curChoice) + "px", "ref": ".body" });
                        }

                        // Bind events
                        var self = this;
                        this.$box.find(".gn-taleChoiceInput").change(function() {
                            self.setChoiceText(jQuery(this).data("choiceid"), jQuery(this).val());
                        });

                        this.$box.find(".gn-taleMoveChoiceUp").click(function() {
                            self.moveChoice(jQuery(this).data("choiceid"), -1);
                        });

                        this.$box.find(".gn-taleMoveChoiceDown").click(function() {
                            self.moveChoice(jQuery(this).data("choiceid"), +1);
                        });

                        this.$box.find(".gn-taleEditChoiceCondition").click(function() {
                            self.openConditionDialog(jQuery(this).data("choiceid"));
                        });

                        this.$box.find(".gn-taleChoiceToogleIsRepeatable").click(function() {
                            self.toogleConditionIsRepeatable(jQuery(this).data("choiceid"));
                        });

                        this.$box.find(".gn-taleDeleteChoice").click(function() {
                            self.deleteChoice(jQuery(this).data("choiceid"));
                        });

                    }
                });
            }

            /**
             * Choice Shape
             */
            joint.shapes.tale.Choice = createChoiceShape();

            /**
             * Choice View
             */
            joint.shapes.tale.ChoiceView = createChoiceView();


            /** 
             * Choice Serializer 
             * 
             * @class
             */
            Shapes.ChoiceSerializer = function()
            {
                GoNorth.DefaultNodeShapes.Serialize.BaseNodeSerializer.apply(this, [joint.shapes.tale.Choice, choiceType, choiceTargetArray ]);
            };

            Shapes.ChoiceSerializer.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.Serialize.BaseNodeSerializer.prototype)

            /**
             * Serializes a node
             * 
             * @param {object} node Node Object
             * @returns {object} Serialized NOde
             */
            Shapes.ChoiceSerializer.prototype.serialize = function(node) {
                var serializedChoices = [];
                for(var curChoice = 0; curChoice < node.choices.length; ++curChoice)
                {
                    var serializedChoice = {
                        id: node.choices[curChoice].id,
                        text: node.choices[curChoice].text,
                        isRepeatable: node.choices[curChoice].isRepeatable,
                        condition: null
                    };
                    if(node.choices[curChoice].condition)
                    {
                        serializedChoice.condition = GoNorth.DefaultNodeShapes.Conditions.getConditionManager().serializeCondition(node.choices[curChoice].condition);
                    }
                    serializedChoices.push(serializedChoice);
                }

                var serializedData = {
                    id: node.id,
                    x: node.position.x,
                    y: node.position.y,
                    choices: serializedChoices,
                    currentChoiceId: node.currentChoiceId
                };

                return serializedData;
            };

            /**
             * Deserializes a serialized node
             * 
             * @param {object} node Serialized Node Object
             * @returns {object} Deserialized Node
             */
            Shapes.ChoiceSerializer.prototype.deserialize = function(node) {
                var deserializedChoices = [];
                if(node.choices)
                {
                    for(var curChoice = 0; curChoice < node.choices.length; ++curChoice)
                    {
                        var deserializedChoice = {
                            id: node.choices[curChoice].id,
                            text: node.choices[curChoice].text,
                            isRepeatable: node.choices[curChoice].isRepeatable,
                            condition: null
                        };
                        if(node.choices[curChoice].condition)
                        {
                            deserializedChoice.condition = GoNorth.DefaultNodeShapes.Conditions.getConditionManager().deserializeCondition(node.choices[curChoice].condition);
                        }
                        deserializedChoices.push(deserializedChoice);
                    }
                }

                var initOptions = {
                    id: node.id,
                    position: { x: node.x, y: node.y },
                    choices: deserializedChoices,
                    currentChoiceId: node.currentChoiceId
                };

                var node = new this.classType(initOptions);
                return node;
            };

            // Register Serializers
            var choiceSerializer = new Shapes.ChoiceSerializer();
            GoNorth.DefaultNodeShapes.Serialize.getNodeSerializerInstance().addNodeSerializer(choiceSerializer);

        }(Tale.Shapes = Tale.Shapes || {}));
    }(GoNorth.Tale = GoNorth.Tale || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Shapes) {

            /// Action Type
            var actionType = "default.Action";
            
            /// Action Target Array
            var actionTargetArray = "action";


            /// All available actions
            var availableActions = [];

            /**
             * Adds a new available action
             * 
             * @param {object} action Action
             */
            Shapes.addAvailableAction = function(action) {
                availableActions.push(action);
            }


            joint.shapes.default = joint.shapes.default || {};

            /**
             * Creates the action shape
             * @returns {object} Action shape
             * @memberof Shapes
             */
            function createActionShape() {
                var model = joint.shapes.devs.Model.extend(
                {
                    defaults: joint.util.deepSupplement
                    (
                        {
                            type: actionType,
                            icon: "glyphicon-cog",
                            size: { width: 250, height: 200 },
                            inPorts: ['input'],
                            outPorts: ['output'],
                            attrs:
                            {
                                '.inPorts circle': { "magnet": "passive", "port-type": "input" },
                                '.outPorts circle': { "magnet": "true" }
                            },
                            actionType: null,
                            actionRelatedToObjectType: null,
                            actionRelatedToObjectId: null,
                            actionData: null
                        },
                        joint.shapes.default.Base.prototype.defaults
                    )
                });
                return model;
            }

            /**
             * Creates a action view
             * @returns {object} Action view
             * @memberof Shapes
             */
            function createActionView() {
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
                            '<select class="gn-actionNodeSelectActionType"></select>',
                            '<div class="gn-actionNodeActionContent"></div>',
                        '</div>',
                    ].join(''),

                    /**
                     * Initializes the shape
                     */
                    initialize: function() {
                        joint.shapes.default.BaseView.prototype.initialize.apply(this, arguments);

                        var actionTypeBox = this.$box.find(".gn-actionNodeSelectActionType");
                        GoNorth.Util.fillSelectFromArray(actionTypeBox, availableActions, function(action) { return action.getType(); }, function(action) { return action.getLabel(); });

                        var self = this;
                        actionTypeBox.on("change", function() {
                            self.resetActionData();
                            self.syncActionData();
                        });

                        actionTypeBox.find("option[value='" + this.model.get("actionType") + "']").prop("selected", true);

                        this.syncActionData();
                    },

                    /**
                     * Returns the current action
                     */
                    getCurrentAction: function() {
                        var actionType = this.$box.find(".gn-actionNodeSelectActionType").val();
                        for(var curAction = 0; curAction < availableActions.length; ++curAction)
                        {
                            if(availableActions[curAction].getType() == actionType)
                            {
                                return availableActions[curAction];
                            }
                        }
                        return null;
                    },

                    /**
                     * Resets the action data
                     */
                    resetActionData: function() {
                        this.model.set("actionRelatedToObjectType", null);
                        this.model.set("actionRelatedToObjectId", null);
                        this.model.set("actionData", null);
                    },

                    /**
                     * Syncs the action data
                     */
                    syncActionData: function() {
                        var action = this.getCurrentAction();
                        if(!action)
                        {
                            return;
                        }

                        var currentAction = action.buildAction();
                        currentAction.setNodeModel(this.model);
                        this.model.set("actionType", currentAction.getType());

                        var actionContent = this.$box.find(".gn-actionNodeActionContent");
                        actionContent.html(currentAction.getContent());
                        currentAction.onInitialized(actionContent, this);
                    },

                    /**
                     * Reloads the shared data
                     * 
                     * @param {number} objectType Object Type
                     * @param {string} objectId Object Id
                     */
                    reloadSharedLoadedData: function(objectType, objectId) {
                        if(this.model.get("actionRelatedToObjectId") == objectId)
                        {
                            this.syncActionData();
                        }
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
             * Action Shape
             */
            joint.shapes.default.Action = createActionShape();

            /**
             * Action View
             */
            joint.shapes.default.ActionView = createActionView();


            /** 
             * Action Serializer 
             * 
             * @class
             */
            Shapes.ActionSerializer = function()
            {
                GoNorth.DefaultNodeShapes.Serialize.BaseNodeSerializer.apply(this, [ joint.shapes.default.Action, actionType, actionTargetArray ]);
            };

            Shapes.ActionSerializer.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.Serialize.BaseNodeSerializer.prototype)

            /**
             * Serializes a node
             * 
             * @param {object} node Node Object
             * @returns {object} Serialized NOde
             */
            Shapes.ActionSerializer.prototype.serialize = function(node) {
                var serializedData = {
                    id: node.id,
                    x: node.position.x,
                    y: node.position.y,
                    actionType: node.actionType,
                    actionRelatedToObjectType: node.actionRelatedToObjectType,
                    actionRelatedToObjectId: node.actionRelatedToObjectId,
                    actionData: node.actionData
                };

                return serializedData;
            };

            /**
             * Deserializes a serialized node
             * 
             * @param {object} node Serialized Node Object
             * @returns {object} Deserialized Node
             */
            Shapes.ActionSerializer.prototype.deserialize = function(node) {
                var initOptions = {
                    id: node.id,
                    position: { x: node.x, y: node.y },
                    actionType: node.actionType,
                    actionRelatedToObjectType: node.actionRelatedToObjectType,
                    actionRelatedToObjectId: node.actionRelatedToObjectId,
                    actionData: node.actionData
                };

                var node = new this.classType(initOptions);
                return node;
            };

            // Register Serializers
            var actionSerializer = new Shapes.ActionSerializer();
            GoNorth.DefaultNodeShapes.Serialize.getNodeSerializerInstance().addNodeSerializer(actionSerializer);

        }(DefaultNodeShapes.Shapes = DefaultNodeShapes.Shapes || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(FlexFieldDatabase) {
        (function(ObjectForm) {

            /// Seperator for the additional name field values
            ObjectForm.FlexFieldScriptSettingsAdditionalScriptNameSeperator = ",";

            /**
             * Class for a flex field script settings
             * 
             * @class
             */
            ObjectForm.FlexFieldScriptSettings = function() {
                this.dontExportToScript = false;
                this.additionalScriptNames = "";
            }

            ObjectForm.FlexFieldScriptSettings.prototype = {
                /**
                 * Serializes the values to an object
                 * 
                 * @returns {object} Object to deserialize
                 */
                serialize: function() {
                    return {
                        dontExportToScript: this.dontExportToScript,
                        additionalScriptNames: this.additionalScriptNames
                    };
                },

                /**
                 * Deserialize the values from a serialized entry
                 * @param {object} serializedValue Serialized entry
                 */
                deserialize: function(serializedValue) {
                    this.dontExportToScript = serializedValue.dontExportToScript;
                    this.additionalScriptNames = serializedValue.additionalScriptNames;
                }
            }

        }(FlexFieldDatabase.ObjectForm = FlexFieldDatabase.ObjectForm || {}));
    }(GoNorth.FlexFieldDatabase = GoNorth.FlexFieldDatabase || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(FlexFieldDatabase) {
        (function(ObjectForm) {

            /**
             * Interface for flex field fields
             * 
             * @class
             */
            ObjectForm.FlexFieldBase = function() {
                this.id = new ko.observable("");
                this.createdFromTemplate = new ko.observable(false);
                this.name = new ko.observable();
                this.scriptSettings = new ObjectForm.FlexFieldScriptSettings();
            }

            ObjectForm.FlexFieldBase.prototype = {
                /**
                 * Returns the type of the field
                 * 
                 * @returns {int} Type of the field
                 */
                getType: function() { },

                /**
                 * Returns the template name
                 * 
                 * @returns {string} Template Name
                 */
                getTemplateName: function() { },

                /**
                 * Returns if the field can be exported to a script
                 * 
                 * @returns {bool} true if the value can be exported to a script, else false
                 */
                canExportToScript: function() { },

                /**
                 * Serializes the value to a string
                 * 
                 * @returns {string} Value of the field as a string
                 */
                serializeValue: function() { },

                /**
                 * Deserializes a value from a string
                 * 
                 * @param {string} value Value to Deserialize
                 */
                deserializeValue: function(value) { },

                /**
                 * Returns true if the field has additional configuration, else false
                 * 
                 * @returns {bool} true if the field has additional configuration, else false
                 */
                hasAdditionalConfiguration: function() { return false; },

                /**
                 * Returns the label for additional configuration
                 * 
                 * @returns {string} Additional Configuration
                 */
                getAdditionalConfigurationLabel: function() { return ""; },

                /**
                 * Returns true if the additional configuration can be edited for fields that were created based on template fields, else false
                 * 
                 * @returns {bool} true if the additional configuration can be edited for fields that were created based on template fields, else false
                 */
                allowEditingAdditionalConfigForTemplateFields: function() { return false; },

                /**
                 * Sets additional configuration
                 * 
                 * @param {string} configuration Additional Configuration
                 */
                setAdditionalConfiguration: function(configuration) { },

                /**
                 * Returns additional configuration
                 * 
                 * @returns {string} Additional Configuration
                 */
                getAdditionalConfiguration: function() { return ""; },

                /**
                 * Serializes the additional configuration
                 * 
                 * @returns {string} Serialized additional configuration
                 */
                serializeAdditionalConfiguration: function() { return ""; },

                /**
                 * Deserializes the additional configuration
                 * 
                 * @param {string} additionalConfiguration Serialized additional configuration
                 */
                deserializeAdditionalConfiguration: function(additionalConfiguration) { }
            }

        }(FlexFieldDatabase.ObjectForm = FlexFieldDatabase.ObjectForm || {}));
    }(GoNorth.FlexFieldDatabase = GoNorth.FlexFieldDatabase || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(FlexFieldDatabase) {
        (function(ObjectForm) {

            /**
             * Type of the multi text line field
             */
            ObjectForm.FlexFieldTypeMultiLine = 1;

            /**
             * Class for a multi text line field
             * 
             * @class
             */
            ObjectForm.MultiLineFlexField = function() {
                ObjectForm.FlexFieldBase.apply(this);

                this.value = new ko.observable("");
            }

            ObjectForm.MultiLineFlexField.prototype = jQuery.extend(true, {}, ObjectForm.FlexFieldBase.prototype);

            /**
             * Returns the type of the field
             * 
             * @returns {int} Type of the field
             */
            ObjectForm.MultiLineFlexField.prototype.getType = function() { return ObjectForm.FlexFieldTypeMultiLine; }

            /**
             * Returns the template name
             * 
             * @returns {string} Template Name
             */
            ObjectForm.MultiLineFlexField.prototype.getTemplateName = function() { return "gn-multiLineField"; }

            /**
             * Returns if the field can be exported to a script
             * 
             * @returns {bool} true if the value can be exported to a script, else false
             */
            ObjectForm.MultiLineFlexField.prototype.canExportToScript = function() { return false; }

            /**
             * Serializes the value to a string
             * 
             * @returns {string} Value of the field as a string
             */
            ObjectForm.MultiLineFlexField.prototype.serializeValue = function() { return this.value(); }

            /**
             * Deserializes a value from a string
             * 
             * @param {string} value Value to Deserialize
             */
            ObjectForm.MultiLineFlexField.prototype.deserializeValue = function(value) { this.value(value); }

        }(FlexFieldDatabase.ObjectForm = FlexFieldDatabase.ObjectForm || {}));
    }(GoNorth.FlexFieldDatabase = GoNorth.FlexFieldDatabase || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(FlexFieldDatabase) {
        (function(ObjectForm) {

            /**
             * Type of the number field
             */
            ObjectForm.FlexFieldTypeNumber = 2;

            /**
             * Class for a number field
             * 
             * @class
             */
            ObjectForm.NumberFlexField = function() {
                ObjectForm.FlexFieldBase.apply(this);

                this.value = new ko.observable(0.0);
            }

            ObjectForm.NumberFlexField.prototype = jQuery.extend(true, {}, ObjectForm.FlexFieldBase.prototype);

            /**
             * Returns the type of the field
             * 
             * @returns {int} Type of the field
             */
            ObjectForm.NumberFlexField.prototype.getType = function() { return ObjectForm.FlexFieldTypeNumber; }

            /**
             * Returns the template name
             * 
             * @returns {string} Template Name
             */
            ObjectForm.NumberFlexField.prototype.getTemplateName = function() { return "gn-numberField"; }

            /**
             * Returns if the field can be exported to a script
             * 
             * @returns {bool} true if the value can be exported to a script, else false
             */
            ObjectForm.NumberFlexField.prototype.canExportToScript = function() { return true; }

            /**
             * Serializes the value to a string
             * 
             * @returns {string} Value of the field as a string
             */
            ObjectForm.NumberFlexField.prototype.serializeValue = function() { return this.value() ? this.value().toString() : "0.0"; }

            /**
             * Deserializes a value from a string
             * 
             * @param {string} value Value to Deserialize
             */
            ObjectForm.NumberFlexField.prototype.deserializeValue = function(value) { 
                var parsedValue = parseFloat(value);
                if(!isNaN(parsedValue))
                {
                    this.value(parsedValue); 
                }
                else
                {
                    this.value(0.0);
                }
            }

        }(FlexFieldDatabase.ObjectForm = FlexFieldDatabase.ObjectForm || {}));
    }(GoNorth.FlexFieldDatabase = GoNorth.FlexFieldDatabase || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(FlexFieldDatabase) {
        (function(ObjectForm) {

            /**
             * Type of the object field
             */
            ObjectForm.FlexFieldTypeOption = 3;

            /**
             * Class for an option field
             * 
             * @class
             */
            ObjectForm.OptionFlexField = function() {
                ObjectForm.FlexFieldBase.apply(this);

                this.value = new ko.observable(null);
                this.options = new ko.observableArray();
            }

            ObjectForm.OptionFlexField.prototype = jQuery.extend(true, {}, ObjectForm.FlexFieldBase.prototype);

            /**
             * Returns the type of the field
             * 
             * @returns {int} Type of the field
             */
            ObjectForm.OptionFlexField.prototype.getType = function() { return ObjectForm.FlexFieldTypeOption; }

            /**
             * Returns the template name
             * 
             * @returns {string} Template Name
             */
            ObjectForm.OptionFlexField.prototype.getTemplateName = function() { return "gn-optionField"; }

            /**
             * Returns if the field can be exported to a script
             * 
             * @returns {bool} true if the value can be exported to a script, else false
             */
            ObjectForm.OptionFlexField.prototype.canExportToScript = function() { return true; }

            /**
             * Serializes the value to a string
             * 
             * @returns {string} Value of the field as a string
             */
            ObjectForm.OptionFlexField.prototype.serializeValue = function() { return this.value(); }

            /**
             * Deserializes a value from a string
             * 
             * @param {string} value Value to Deserialize
             */
            ObjectForm.OptionFlexField.prototype.deserializeValue = function(value) { this.value(value); }


            /**
             * Returns true if the field has additional configuration, else false
             * 
             * @returns {bool} true if the field has additional configuration, else false
             */
            ObjectForm.OptionFlexField.prototype.hasAdditionalConfiguration = function() { return true; }

            /**
             * Returns the label for additional configuration
             * 
             * @returns {string} Additional Configuration
             */
            ObjectForm.OptionFlexField.prototype.getAdditionalConfigurationLabel = function() { return GoNorth.FlexFieldDatabase.Localization.OptionFieldAdditionalConfigurationLabel; }

            /**
             * Returns true if the additional configuration can be edited for fields that were created based on template fields, else false
             * 
             * @returns {bool} true if the additional configuration can be edited for fields that were created based on template fields, else false
             */
            ObjectForm.OptionFlexField.prototype.allowEditingAdditionalConfigForTemplateFields = function() { return false; }

            /**
             * Sets additional configuration
             * 
             * @param {string} configuration Additional Configuration
             */
            ObjectForm.OptionFlexField.prototype.setAdditionalConfiguration = function(configuration) { 
                var availableOptions = [];
                if(configuration)
                {
                    availableOptions = configuration.split("\n");
                }
                
                this.options(availableOptions)
            }

            /**
             * Returns additional configuration
             * 
             * @returns {string} Additional Configuration
             */
            ObjectForm.OptionFlexField.prototype.getAdditionalConfiguration = function() { return this.options().join("\n"); }
        
            /**
             * Serializes the additional configuration
             * 
             * @returns {string} Serialized additional configuration
             */
            ObjectForm.OptionFlexField.prototype.serializeAdditionalConfiguration = function() { return JSON.stringify(this.options()); },

            /**
             * Deserializes the additional configuration
             * 
             * @param {string} additionalConfiguration Serialized additional configuration
             */
            ObjectForm.OptionFlexField.prototype.deserializeAdditionalConfiguration = function(additionalConfiguration) { 
                var options = [];
                if(additionalConfiguration)
                {
                    options = JSON.parse(additionalConfiguration);
                }

                this.options(options);
            }

        }(FlexFieldDatabase.ObjectForm = FlexFieldDatabase.ObjectForm || {}));
    }(GoNorth.FlexFieldDatabase = GoNorth.FlexFieldDatabase || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Actions) {

            /// Actions that are related to npcs
            Actions.RelatedToObjectNpc = "Npc";

            /// Actions that are related to quests
            Actions.RelatedToObjectQuest = "Quest";

            /// Actions that are related to skills
            Actions.RelatedToObjectSkill = "Skill";

            /// Actions that are related to items
            Actions.RelatedToObjectItem = "Item";

            /**
             * Base Action
             * @class
             */
            Actions.BaseAction = function()
            {
                this.nodeModel = null;
            };

            Actions.BaseAction.prototype = {
                /**
                 * Builds the action
                 * 
                 * @returns {object} Action
                 */
                buildAction: function() {

                },

                /**
                 * Sets the node model
                 * 
                 * @param {object} model Node model
                 */
                setNodeModel: function(model) {
                    this.nodeModel = model;
                },

                /**
                 * Returns the type of the action
                 * 
                 * @returns {number} Type of the action
                 */
                getType: function() {
                    return -1;
                },

                /**
                 * Returns the label of the action
                 * 
                 * @returns {string} Label of the action
                 */
                getLabel: function() {

                },

                /**
                 * Returns the HTML Content of the action
                 * 
                 * @returns {string} HTML Content of the action
                 */
                getContent: function() {

                },

                /**
                 * Gets called once the action was intialized
                 * 
                 * @param {object} contentElement Content element
                 * @param {ActionNode} actionNode Parent Action node
                 */
                onInitialized: function(contentElement, actionNode) {

                },

                /**
                 * Serializes the data
                 * 
                 * @returns {object} Serialized Data 
                 */
                serialize: function() {

                },

                /**
                 * Deserializes the data
                 * 
                 * @param {object} serializedData Serialized data
                 */
                deserialize: function(serializedData) {

                }
            };

        }(DefaultNodeShapes.Actions = DefaultNodeShapes.Actions || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Actions) {

            /**
             * Change Value Action
             * @class
             */
            Actions.ChangeValueAction = function()
            {
                GoNorth.DefaultNodeShapes.Actions.BaseAction.apply(this);
                GoNorth.DefaultNodeShapes.Shapes.SharedObjectLoading.apply(this);

                this.contentElement = null;
                this.filteredFields = [];

                this.isNumberValueSelected = false;
            };

            Actions.ChangeValueAction.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.Actions.BaseAction.prototype);
            Actions.ChangeValueAction.prototype = jQuery.extend(Actions.ChangeValueAction.prototype, GoNorth.DefaultNodeShapes.Shapes.SharedObjectLoading.prototype);

            /**
             * Returns the object type name. Used for dependency objects
             * 
             * @returns {string} Object Type name used for depends on objects 
             */
            Actions.ChangeValueAction.prototype.getObjectTypeName = function() {
            };

            /**
             * Returns the HTML Content of the action
             * 
             * @returns {string} HTML Content of the action
             */
            Actions.ChangeValueAction.prototype.getContent = function() {
                return  "<select class='gn-actionNodeAttributeSelect'></select>" +
                        "<select class='gn-actionNodeAttributeOperator'></select>" +
                        "<input type='text' class='gn-actionNodeAttributeChange'/>";
            };

            /**
             * Returns true if the action is using an individual object id for each object since the user can choose an object instead of having a fixed one, else false
             * 
             * @returns {bool} true if the action is using an individual object id for each object since the user can choose an object instead of having a fixed one, else false
             */
            Actions.ChangeValueAction.prototype.isUsingIndividualObjectId = function() {
                return false;
            };

            /**
             * Returns the object id
             * 
             * @returns {string} Object Id
             */
            Actions.ChangeValueAction.prototype.getObjectId = function(existingData) {
                return null;
            };

            /**
             * Returns true if the object can be loaded, else false
             * 
             * @returns {bool} true if the object can be loaded, else false
             */
            Actions.ChangeValueAction.prototype.canLoadObject = function(existingData) {
                return true;
            };

            /**
             * Runs additional initialize actions
             * 
             * @param {object} contentElement Content element
             * @param {ActionNode} actionNode Parent Action node
             */
            Actions.ChangeValueAction.prototype.onInitializeAdditional = function(contentElement, actionNode) {

            };

            /**
             * Gets called once the action was intialized
             * 
             * @param {object} contentElement Content element
             * @param {ActionNode} actionNode Parent Action node
             */
            Actions.ChangeValueAction.prototype.onInitialized = function(contentElement, actionNode) {
                this.contentElement = contentElement;

                this.deserializePreLoadData();

                if(this.canLoadObject())
                {
                    this.loadFields(contentElement, actionNode);
                }

                var self = this;
                contentElement.find(".gn-actionNodeAttributeSelect").on("change", function() {
                    self.syncOperators();
                    self.saveData();
                });

                contentElement.find(".gn-actionNodeAttributeOperator").on("change", function() {
                    self.saveData();
                });

                var attributeCompare = contentElement.find(".gn-actionNodeAttributeChange");
                attributeCompare.keydown(function(e) {
                    if(self.isNumberValueSelected)
                    {
                        GoNorth.Util.validateNumberKeyPress(attributeCompare, e);
                    }
                });

                attributeCompare.change(function(e) {
                    if(self.isNumberValueSelected)
                    {
                        self.ensureNumberValue();
                    }

                    self.saveData();
                });

                this.onInitializeAdditional(contentElement, actionNode);
            };

            /**
             * Parses additional data
             * 
             * @param {object} contentElement Content element
             * @param {ActionNode} actionNode Parent Action node
             * @param {object} fieldObject Loaded Field object
             */
            Actions.ChangeValueAction.prototype.parseAdditionalData = function(contentElement, actionNode, fieldObject) {
            };

            /**
             * Loads the fields
             * 
             * @param {object} contentElement Content element
             * @param {ActionNode} actionNode Parent Action node
             */
            Actions.ChangeValueAction.prototype.loadFields = function(contentElement, actionNode) {
                actionNode.showLoading();
                actionNode.hideError();

                var self = this;
                this.loadObjectShared().then(function(fieldObject) {
                    if(!fieldObject)
                    {
                        actionNode.hideLoading();
                        return;
                    }

                    // Set related object data
                    self.nodeModel.set("actionRelatedToObjectType", self.getObjectTypeName());
                    self.nodeModel.set("actionRelatedToObjectId", fieldObject.id);

                    // Fill field array
                    var attributeSelect = contentElement.find(".gn-actionNodeAttributeSelect");
                    self.filteredFields = GoNorth.Util.getFilteredFieldsForScript(fieldObject.fields);
                    
                    GoNorth.Util.fillSelectFromArray(attributeSelect, self.filteredFields, function(field, index) { return index; }, function(field) { 
                        var label = field.name + " ("; 
                        if(field.fieldType == GoNorth.FlexFieldDatabase.ObjectForm.FlexFieldTypeNumber)
                        {
                            label += DefaultNodeShapes.Localization.Actions.NumberField;
                        }
                        else
                        {
                            label += DefaultNodeShapes.Localization.Actions.TextField;
                        }
                        label += ")";

                        return label;
                    });

                    // Parse additional data
                    self.parseAdditionalData(contentElement, actionNode, fieldObject);
                    
                    var dataExists = self.deserializeData();
                    if(!dataExists)
                    {
                        self.syncOperators();
                        self.saveData();
                    }
                    
                    actionNode.hideLoading();
                }, function() {
                    actionNode.hideLoading();
                    actionNode.showError();
                });
            };

            /**
             * Syncs the operators
             */
            Actions.ChangeValueAction.prototype.syncOperators = function() {
                var selectedField = this.contentElement.find(".gn-actionNodeAttributeSelect").val();
                var operatorSelect = this.contentElement.find(".gn-actionNodeAttributeOperator");
                var curField = this.filteredFields[selectedField];
                if(!curField)
                {
                    GoNorth.Util.fillSelectFromArray(operatorSelect, [], function(operator) { return operator; }, function(operator) { return operator; });
                    return;
                }

                var operators = [];
                if(curField.fieldType == GoNorth.FlexFieldDatabase.ObjectForm.FlexFieldTypeNumber)
                {
                    operators = [ "=", "+=", "-=", "*=", "/=" ];
                    this.isNumberValueSelected = true;

                    this.ensureNumberValue();
                }
                else
                {
                    operators = [ "=" ];
                    this.isNumberValueSelected = false;
                }

                GoNorth.Util.fillSelectFromArray(operatorSelect, operators, function(operator) { return operator; }, function(operator) { return operator; });
            }

            /**
             * Ensures the user entered a number if a number field was selected
             */
            Actions.ChangeValueAction.prototype.ensureNumberValue = function() {
                var parsedValue = parseFloat(this.contentElement.find(".gn-actionNodeAttributeChange").val());
                if(isNaN(parsedValue))
                {
                    this.contentElement.find(".gn-actionNodeAttributeChange").val("0");
                }
            }

            /**
             * Deserializes data before loading data
             */
            Actions.ChangeValueAction.prototype.deserializePreLoadData = function() {
                
            };

            /**
             * Deserializes the data
             */
            Actions.ChangeValueAction.prototype.deserializeData = function() {
                var actionData = this.nodeModel.get("actionData");
                if(!actionData)
                {
                    return false;
                }

                var data = JSON.parse(actionData);
                var selectedFieldIndex = 0;
                for(var curField = 0; curField < this.filteredFields.length; ++curField)
                {
                    if(this.filteredFields[curField].id == data.fieldId)
                    {
                        selectedFieldIndex = curField;
                        
                        if(this.filteredFields[curField].name == data.fieldName)
                        {
                            break;
                        }
                    }
                }

                this.contentElement.find(".gn-actionNodeAttributeSelect").find("option[value='" + selectedFieldIndex + "']").prop("selected", true);
                this.syncOperators();
                this.contentElement.find(".gn-actionNodeAttributeOperator").find("option[value='" + data.operator + "']").prop("selected", true);
                this.contentElement.find(".gn-actionNodeAttributeChange").val(data.valueChange);

                return true;
            };

            /**
             * Serializes additional data
             * 
             * @param {object} serializeData Existing Serialize Data
             */
            Actions.ChangeValueAction.prototype.serializeAdditionalData = function(serializeData) {

            };

            /**
             * Saves the data
             */
            Actions.ChangeValueAction.prototype.saveData = function() {
                var selectedField = this.contentElement.find(".gn-actionNodeAttributeSelect").val();
                var curField = this.filteredFields[selectedField];
                var operator = this.contentElement.find(".gn-actionNodeAttributeOperator").val();
                var valueChange = this.contentElement.find(".gn-actionNodeAttributeChange").val();

                var serializeData = {
                    fieldId: curField ? curField.id : null,
                    fieldName: curField ? curField.name : null,
                    operator: operator,
                    valueChange: valueChange
                };

                this.serializeAdditionalData(serializeData);

                this.nodeModel.set("actionData", JSON.stringify(serializeData));
            }

        }(DefaultNodeShapes.Actions = DefaultNodeShapes.Actions || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Actions) {

            /**
             * Base class for changing the value of object to pick
             * @class
             */
            Actions.ChangeValueChooseObjectAction = function()
            {
                GoNorth.DefaultNodeShapes.Actions.ChangeValueAction.apply(this);
            };

            Actions.ChangeValueChooseObjectAction.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.Actions.ChangeValueAction.prototype);

            /**
             * Returns the HTML Content of the action
             * 
             * @returns {string} HTML Content of the action
             */
            Actions.ChangeValueChooseObjectAction.prototype.getContent = function() {
                return  "<div class='gn-actionNodeObjectSelectContainer'><a class='gn-actionNodeObjectSelect gn-clickable'>" + this.getChooseLabel() + "</a></div>" +
                        "<select class='gn-actionNodeAttributeSelect'></select>" +
                        "<select class='gn-actionNodeAttributeOperator'></select>" +
                        "<input type='text' class='gn-actionNodeAttributeChange'/>";
            };

            /**
             * Returns the choose object label
             * 
             * @returns {string} Choose object label
             */
            Actions.ChangeValueChooseObjectAction.prototype.getChooseLabel = function() {
                return "NOT IMPLEMENTED";
            };

            /**
             * Returns true if the action is using an individual object id for each object since the user can choose an object instead of having a fixed one, else false
             * 
             * @returns {bool} true if the action is using an individual object id for each object since the user can choose an object instead of having a fixed one, else false
             */
            Actions.ChangeValueChooseObjectAction.prototype.isUsingIndividualObjectId = function() {
                return true;
            };

            /**
             * Returns the object id
             * 
             * @returns {string} Object Id
             */
            Actions.ChangeValueChooseObjectAction.prototype.getObjectId = function(existingData) {
                return this.nodeModel.get("objectId");
            };

            /**
             * Returns true if the object can be loaded, else false
             * 
             * @returns {bool} true if the object can be loaded, else false
             */
            Actions.ChangeValueChooseObjectAction.prototype.canLoadObject = function() {
                return !!this.nodeModel.get("objectId");
            };

            /**
             * Opens the search dialog
             * 
             * @returns {jQuery.Deferred} Deferred for the picking
             */
            Actions.ChangeValueChooseObjectAction.prototype.openSearchDialog = function() {
            };

            /**
             * Parses additional data
             * 
             * @param {object} contentElement Content element
             * @param {ActionNode} actionNode Parent Action node
             * @param {object} fieldObject Loaded Field object
             */
            Actions.ChangeValueChooseObjectAction.prototype.parseAdditionalData = function(contentElement, actionNode, fieldObject) {
                contentElement.find(".gn-actionNodeObjectSelect").text(fieldObject.name);
            };

            /**
             * Runs additional initialize actions
             * 
             * @param {object} contentElement Content element
             * @param {ActionNode} actionNode Parent Action node
             */
            Actions.ChangeValueChooseObjectAction.prototype.onInitializeAdditional = function(contentElement, actionNode) {
                var self = this;
                contentElement.find(".gn-actionNodeObjectSelect").on("click", function() {
                    self.openSearchDialog().then(function(fieldObject) {
                        self.nodeModel.set("objectId", fieldObject.id);
                        self.loadFields(contentElement, actionNode);

                        contentElement.find(".gn-actionNodeObjectSelect").text(fieldObject.name);
                    });
                });
            };

            /**
             * Serializes additional data
             * 
             * @param {object} serializeData Existing Serialize Data
             */
            Actions.ChangeValueChooseObjectAction.prototype.serializeAdditionalData = function(serializeData) {
                serializeData.objectId = this.nodeModel.get("objectId") ? this.nodeModel.get("objectId") : null;
            };

            /**
             * Deserializes data before loading data
             */
            Actions.ChangeValueChooseObjectAction.prototype.deserializePreLoadData = function() {
                var actionData = this.nodeModel.get("actionData");
                if(!actionData)
                {
                    return;
                }

                var data = JSON.parse(actionData);
                this.nodeModel.set("objectId", data.objectId);
            };

        }(DefaultNodeShapes.Actions = DefaultNodeShapes.Actions || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Actions) {

            /// Action Type for changing the player value
            var actionTypeChangePlayerValue = 1;

            /**
             * Change player value Action
             * @class
             */
            Actions.ChangePlayerValueAction = function()
            {
                GoNorth.DefaultNodeShapes.Actions.ChangeValueAction.apply(this);
            };

            Actions.ChangePlayerValueAction.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.Actions.ChangeValueAction.prototype);

            /**
             * Builds the action
             * 
             * @returns {object} Action
             */
            Actions.ChangePlayerValueAction.prototype.buildAction = function() {
                return new Actions.ChangePlayerValueAction();
            };

            /**
             * Returns the type of the action
             * 
             * @returns {number} Type of the action
             */
            Actions.ChangePlayerValueAction.prototype.getType = function() {
                return actionTypeChangePlayerValue;
            };

            /**
             * Returns the label of the action
             * 
             * @returns {string} Label of the action
             */
            Actions.ChangePlayerValueAction.prototype.getLabel = function() {
                return DefaultNodeShapes.Localization.Actions.ChangePlayerValueLabel;
            };

            /**
             * Returns the object type name. Used for dependency objects
             * 
             * @returns {string} Object Type name used for depends on objects 
             */
            Actions.ChangePlayerValueAction.prototype.getObjectTypeName = function() {
                return Actions.RelatedToObjectNpc;
            };

            /**
             * Returns the object resource
             * 
             * @returns {int} Object Resource
             */
            Actions.ChangePlayerValueAction.prototype.getObjectId = function() {
                return "PlayerNpc";
            };

            /**
             * Returns the object resource
             * 
             * @returns {int} Object Resource
             */
            Actions.ChangePlayerValueAction.prototype.getObjectResource = function() {
                return GoNorth.DefaultNodeShapes.Shapes.ObjectResourceNpc;
            };

            /**
             * Loads the npc
             * 
             * @returns {jQuery.Deferred} Deferred for the npc loading
             */
            Actions.ChangePlayerValueAction.prototype.loadObject = function() {
                var def = new jQuery.Deferred();

                var self = this;
                jQuery.ajax({ 
                    url: "/api/KortistoApi/PlayerNpc", 
                    type: "GET"
                }).done(function(data) {
                    def.resolve(data);
                }).fail(function(xhr) {
                    def.reject();
                });

                return def.promise();
            };

            GoNorth.DefaultNodeShapes.Shapes.addAvailableAction(new Actions.ChangePlayerValueAction());

        }(DefaultNodeShapes.Actions = DefaultNodeShapes.Actions || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(Tale) {
        (function(Actions) {

            /// Action Type for changing the npc value
            var actionTypeChangeNpcValue = 2;

            /**
             * Change npc value Action
             * @class
             */
            Actions.ChangeNpcValueAction = function()
            {
                GoNorth.DefaultNodeShapes.Actions.ChangeValueAction.apply(this);
            };

            Actions.ChangeNpcValueAction.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.Actions.ChangeValueAction.prototype);

            /**
             * Builds the action
             * 
             * @returns {object} Action
             */
            Actions.ChangeNpcValueAction.prototype.buildAction = function() {
                return new Actions.ChangeNpcValueAction();
            };

            /**
             * Returns the type of the action
             * 
             * @returns {number} Type of the action
             */
            Actions.ChangeNpcValueAction.prototype.getType = function() {
                return actionTypeChangeNpcValue;
            };

            /**
             * Returns the label of the action
             * 
             * @returns {string} Label of the action
             */
            Actions.ChangeNpcValueAction.prototype.getLabel = function() {
                return Tale.Localization.Actions.ChangeNpcValueLabel;
            };

            /**
             * Returns the object type name. Used for dependency objects
             * 
             * @returns {string} Object Type name used for depends on objects 
             */
            Actions.ChangeNpcValueAction.prototype.getObjectTypeName = function() {
                return Actions.RelatedToObjectNpc;
            };

            /**
             * Returns the object resource
             * 
             * @returns {int} Object Resource
             */
            Actions.ChangeNpcValueAction.prototype.getObjectId = function() {
                return Tale.getCurrentRelatedObjectId();
            };

            /**
             * Returns the object resource
             * 
             * @returns {int} Object Resource
             */
            Actions.ChangeNpcValueAction.prototype.getObjectResource = function() {
                return GoNorth.DefaultNodeShapes.Shapes.ObjectResourceNpc;
            };

            /**
             * Loads the npc
             * 
             * @returns {jQuery.Deferred} Deferred for the npc loading
             */
            Actions.ChangeNpcValueAction.prototype.loadObject = function() {
                var def = new jQuery.Deferred();

                var self = this;
                jQuery.ajax({ 
                    url: "/api/KortistoApi/FlexFieldObject?id=" + Tale.getCurrentRelatedObjectId(), 
                    type: "GET"
                }).done(function(data) {
                    def.resolve(data);
                }).fail(function(xhr) {
                    def.reject();
                });

                return def.promise();
            };

            GoNorth.DefaultNodeShapes.Shapes.addAvailableAction(new Actions.ChangeNpcValueAction());

        }(Tale.Actions = Tale.Actions || {}));
    }(GoNorth.Tale = GoNorth.Tale || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(Tale) {
        (function(Actions) {

            /**
             * Change Inventory Action
             * @class
             */
            Actions.ChangeInventoryAction = function()
            {
                GoNorth.DefaultNodeShapes.Actions.BaseAction.apply(this);
            };

            Actions.ChangeInventoryAction.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.Actions.BaseAction.prototype);

            /**
             * Returns the HTML Content of the action
             * 
             * @returns {string} HTML Content of the action
             */
            Actions.ChangeInventoryAction.prototype.getContent = function() {
                return  "<div class='gn-actionNodeObjectSelectContainer'>" + 
                            "<a class='gn-clickable gn-taleSelectItemAction gn-nodeNonClickableOnReadonly'></a>&nbsp;" +
                            "<a class='gn-clickable gn-nodeActionOpenItem' title='" + Tale.Localization.Actions.OpenItemTooltip + "' style='display: none'><i class='glyphicon glyphicon-eye-open'></i></a>" +
                        "</div>" +
                        "<div class='gn-nodeActionText'>" + Tale.Localization.Actions.ItemQuantity + "</div>" +
                        "<input type='text' class='gn-taleItemQuantity'/>";
            };

            /**
             * Gets called once the action was intialized
             * 
             * @param {object} contentElement Content element
             * @param {ActionNode} actionNode Parent Action node
             */
            Actions.ChangeInventoryAction.prototype.onInitialized = function(contentElement, actionNode) {
                this.contentElement = contentElement;
                this.contentElement.find(".gn-taleSelectItemAction").text(Tale.Localization.Actions.ChooseItem);

                var itemOpenLink = contentElement.find(".gn-nodeActionOpenItem");

                // Deserialize
                var existingItemId = this.deserializeData();
                if(existingItemId)
                {
                    itemOpenLink.show();

                    actionNode.showLoading();
                    actionNode.hideError();
                    jQuery.ajax({ 
                        url: "/api/StyrApi/ResolveFlexFieldObjectNames", 
                        headers: GoNorth.Util.generateAntiForgeryHeader(),
                        data: JSON.stringify([ existingItemId ]), 
                        type: "POST",
                        contentType: "application/json"
                    }).done(function(itemNames) {
                        if(itemNames.length == 0)
                        {
                            actionNode.hideLoading();
                            actionNode.showError();
                            return;
                        }

                        contentElement.find(".gn-taleSelectItemAction").text(itemNames[0].name);
                        actionNode.hideLoading();
                    }).fail(function(xhr) {
                        actionNode.hideLoading();
                        actionNode.showError();
                    });
                }

                // Handlers
                var self = this;
                var selectItemAction = contentElement.find(".gn-taleSelectItemAction");
                contentElement.find(".gn-taleSelectItemAction").on("click", function() {
                    Tale.openItemSearchDialog().then(function(item) {
                        selectItemAction.data("itemid", item.id);
                        selectItemAction.text(item.name);
                        self.saveData();

                        itemOpenLink.show();
                    });
                });

                var itemQuantity = contentElement.find(".gn-taleItemQuantity");
                itemQuantity.keydown(function(e) {
                    GoNorth.Util.validateNumberKeyPress(itemQuantity, e);
                });

                itemQuantity.change(function(e) {
                    self.ensureNumberValue();
                    self.saveData();
                });

                itemOpenLink.on("click", function() {
                    if(selectItemAction.data("itemid"))
                    {
                        window.open("/Styr/Item#id=" + selectItemAction.data("itemid"));
                    }
                });
            };

            /**
             * Syncs the operators
             */
            Actions.ChangeInventoryAction.prototype.ensureNumberValue = function() {
                var parsedValue = parseFloat(this.contentElement.find(".gn-taleItemQuantity").val());
                if(isNaN(parsedValue))
                {
                    this.contentElement.find(".gn-taleItemQuantity").val("");
                }
            }

            /**
             * Deserializes the data
             */
            Actions.ChangeInventoryAction.prototype.deserializeData = function() {
                var actionData = this.nodeModel.get("actionData");
                if(!actionData)
                {
                    return "";
                }

                var data = JSON.parse(actionData);
                
                var itemId = "";
                if(data.itemId)
                {
                    this.contentElement.find(".gn-taleSelectItemAction").data("itemid", data.itemId);
                    itemId = data.itemId;
                }
                else
                {
                    this.contentElement.find(".gn-taleSelectItemAction").data("itemid", "");
                }

                var quantity = data.quantity;
                if(isNaN(parseInt(data.quantity)))
                {
                    quantity = "";
                }
                this.contentElement.find(".gn-taleItemQuantity").val(quantity);

                return itemId;
            }

            /**
             * Saves the data
             */
            Actions.ChangeInventoryAction.prototype.saveData = function() {
                var itemId = this.contentElement.find(".gn-taleSelectItemAction").data("itemid");
                var quantity = parseInt(this.contentElement.find(".gn-taleItemQuantity").val());
                if(isNaN(quantity))
                {
                    quantity = null;
                }

                var serializeData = {
                    itemId: itemId,
                    quantity: quantity
                };

                this.nodeModel.set("actionData", JSON.stringify(serializeData));

                // Set related object data
                this.nodeModel.set("actionRelatedToObjectType", GoNorth.DefaultNodeShapes.Actions.RelatedToObjectItem);
                this.nodeModel.set("actionRelatedToObjectId", itemId);
            }

        }(Tale.Actions = Tale.Actions || {}));
    }(GoNorth.Tale = GoNorth.Tale || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(Tale) {
        (function(Actions) {

            /// Action Type for spawning an item in the player inventory
            var actionTypeSpawnItemInPlayerInventory = 3;

            /**
             * Spawn item in player inventory Action
             * @class
             */
            Actions.SpawnItemInPlayerInventoryAction = function()
            {
                Actions.ChangeInventoryAction.apply(this);
            };

            Actions.SpawnItemInPlayerInventoryAction.prototype = jQuery.extend({ }, Actions.ChangeInventoryAction.prototype);

            /**
             * Builds the action
             * 
             * @returns {object} Action
             */
            Actions.SpawnItemInPlayerInventoryAction.prototype.buildAction = function() {
                return new Actions.SpawnItemInPlayerInventoryAction();
            };

            /**
             * Returns the type of the action
             * 
             * @returns {number} Type of the action
             */
            Actions.SpawnItemInPlayerInventoryAction.prototype.getType = function() {
                return actionTypeSpawnItemInPlayerInventory;
            };

            /**
             * Returns the label of the action
             * 
             * @returns {string} Label of the action
             */
            Actions.SpawnItemInPlayerInventoryAction.prototype.getLabel = function() {
                return Tale.Localization.Actions.SpawnItemInPlayerInventoryLabel;
            };

            GoNorth.DefaultNodeShapes.Shapes.addAvailableAction(new Actions.SpawnItemInPlayerInventoryAction());

        }(Tale.Actions = Tale.Actions || {}));
    }(GoNorth.Tale = GoNorth.Tale || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(Tale) {
        (function(Actions) {

            /// Action Type for spawning an item in the npc inventory
            var actionTypeSpawnItemInNpcInventory = 4;

            /**
             * Spawn item in npc inventory Action
             * @class
             */
            Actions.SpawnItemInNpcInventoryAction = function()
            {
                Actions.ChangeInventoryAction.apply(this);
            };

            Actions.SpawnItemInNpcInventoryAction.prototype = jQuery.extend({ }, Actions.ChangeInventoryAction.prototype);

            /**
             * Builds the action
             * 
             * @returns {object} Action
             */
            Actions.SpawnItemInNpcInventoryAction.prototype.buildAction = function() {
                return new Actions.SpawnItemInNpcInventoryAction();
            };

            /**
             * Returns the type of the action
             * 
             * @returns {number} Type of the action
             */
            Actions.SpawnItemInNpcInventoryAction.prototype.getType = function() {
                return actionTypeSpawnItemInNpcInventory;
            };

            /**
             * Returns the label of the action
             * 
             * @returns {string} Label of the action
             */
            Actions.SpawnItemInNpcInventoryAction.prototype.getLabel = function() {
                return Tale.Localization.Actions.SpawnItemInNpcInventoryLabel;
            };

            GoNorth.DefaultNodeShapes.Shapes.addAvailableAction(new Actions.SpawnItemInNpcInventoryAction());

        }(Tale.Actions = Tale.Actions || {}));
    }(GoNorth.Tale = GoNorth.Tale || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(Tale) {
        (function(Actions) {

            /// Action Type for transfering an item from the npc inventory to the player inventory
            var actionTypeTransferItemToPlayerInventory = 5;

            /**
             * Transfer item from the npc inventory to the player inventory Action
             * @class
             */
            Actions.TransferItemToPlayerInventoryAction = function()
            {
                Actions.ChangeInventoryAction.apply(this);
            };

            Actions.TransferItemToPlayerInventoryAction.prototype = jQuery.extend({ }, Actions.ChangeInventoryAction.prototype);

            /**
             * Builds the action
             * 
             * @returns {object} Action
             */
            Actions.TransferItemToPlayerInventoryAction.prototype.buildAction = function() {
                return new Actions.TransferItemToPlayerInventoryAction();
            };

            /**
             * Returns the type of the action
             * 
             * @returns {number} Type of the action
             */
            Actions.TransferItemToPlayerInventoryAction.prototype.getType = function() {
                return actionTypeTransferItemToPlayerInventory;
            };

            /**
             * Returns the label of the action
             * 
             * @returns {string} Label of the action
             */
            Actions.TransferItemToPlayerInventoryAction.prototype.getLabel = function() {
                return Tale.Localization.Actions.TransferItemToPlayerInventoryLabel;
            };

            GoNorth.DefaultNodeShapes.Shapes.addAvailableAction(new Actions.TransferItemToPlayerInventoryAction());

        }(Tale.Actions = Tale.Actions || {}));
    }(GoNorth.Tale = GoNorth.Tale || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(Tale) {
        (function(Actions) {

            /// Action Type for transfering an item from the player inventory to the npc inventory
            var actionTypeTransferItemToNpcInventory = 6;

            /**
             * Transfer item from the player inventory to the npc inventory Action
             * @class
             */
            Actions.TransferItemNpcInventoryAction = function()
            {
                Actions.ChangeInventoryAction.apply(this);
            };

            Actions.TransferItemNpcInventoryAction.prototype = jQuery.extend({ }, Actions.ChangeInventoryAction.prototype);

            /**
             * Builds the action
             * 
             * @returns {object} Action
             */
            Actions.TransferItemNpcInventoryAction.prototype.buildAction = function() {
                return new Actions.TransferItemNpcInventoryAction();
            };

            /**
             * Returns the type of the action
             * 
             * @returns {number} Type of the action
             */
            Actions.TransferItemNpcInventoryAction.prototype.getType = function() {
                return actionTypeTransferItemToNpcInventory;
            };

            /**
             * Returns the label of the action
             * 
             * @returns {string} Label of the action
             */
            Actions.TransferItemNpcInventoryAction.prototype.getLabel = function() {
                return Tale.Localization.Actions.TransferItemToNpcInventoryLabel;
            };

            GoNorth.DefaultNodeShapes.Shapes.addAvailableAction(new Actions.TransferItemNpcInventoryAction());

        }(Tale.Actions = Tale.Actions || {}));
    }(GoNorth.Tale = GoNorth.Tale || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Actions) {

            /// Action Type for changing a quest value
            var actionTypeChangeQuestValue = 8;

            /**
             * Change quest value Action
             * @class
             */
            Actions.ChangeQuestValueAction = function()
            {
                GoNorth.DefaultNodeShapes.Actions.ChangeValueChooseObjectAction.apply(this);
            };

            Actions.ChangeQuestValueAction.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.Actions.ChangeValueChooseObjectAction.prototype);

            /**
             * Builds the action
             * 
             * @returns {object} Action
             */
            Actions.ChangeQuestValueAction.prototype.buildAction = function() {
                return new Actions.ChangeQuestValueAction();
            };

            /**
             * Returns the type of the action
             * 
             * @returns {number} Type of the action
             */
            Actions.ChangeQuestValueAction.prototype.getType = function() {
                return actionTypeChangeQuestValue;
            };

            /**
             * Returns the label of the action
             * 
             * @returns {string} Label of the action
             */
            Actions.ChangeQuestValueAction.prototype.getLabel = function() {
                return DefaultNodeShapes.Localization.Actions.ChangeQuestValueLabel;
            };

            /**
             * Returns the choose object label
             * 
             * @returns {string} Choose object label
             */
            Actions.ChangeQuestValueAction.prototype.getChooseLabel = function() {
                return DefaultNodeShapes.Localization.Actions.ChooseQuestLabel;
            };

            /**
             * Returns the object type name. Used for dependency objects
             * 
             * @returns {string} Object Type name used for depends on objects 
             */
            Actions.ChangeQuestValueAction.prototype.getObjectTypeName = function() {
                return Actions.RelatedToObjectQuest;
            };
            
            /**
             * Returns the object resource
             * 
             * @returns {int} Object Resource
             */
            Actions.ChangeQuestValueAction.prototype.getObjectResource = function() {
                return GoNorth.DefaultNodeShapes.Shapes.ObjectResourceQuest;
            };

            /**
             * Opens the search dialog
             * 
             * @returns {jQuery.Deferred} Deferred for the picking
             */
            Actions.ChangeQuestValueAction.prototype.openSearchDialog = function() {
                return GoNorth.DefaultNodeShapes.openQuestSearchDialog();
            };

            /**
             * Loads the quest
             * 
             * @returns {jQuery.Deferred} Deferred for the quest loading
             */
            Actions.ChangeQuestValueAction.prototype.loadObject = function() {
                var def = new jQuery.Deferred();

                var self = this;
                jQuery.ajax({ 
                    url: "/api/AikaApi/GetQuest?id=" + this.nodeModel.get("objectId"), 
                    type: "GET"
                }).done(function(data) {
                    def.resolve(data);
                }).fail(function(xhr) {
                    def.reject();
                });

                return def.promise();
            };

            GoNorth.DefaultNodeShapes.Shapes.addAvailableAction(new Actions.ChangeQuestValueAction());

        }(DefaultNodeShapes.Actions = DefaultNodeShapes.Actions || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Actions) {

            /// Action Type for changing a quest state
            Actions.actionTypeChangeQuestState = 9;

            /**
             * Set Quest State Action
             * @class
             */
            Actions.SetQuestStateAction = function()
            {
                GoNorth.DefaultNodeShapes.Actions.BaseAction.apply(this);
                GoNorth.DefaultNodeShapes.Shapes.SharedObjectLoading.apply(this);
            };

            Actions.SetQuestStateAction.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.Actions.BaseAction.prototype);
            Actions.SetQuestStateAction.prototype = jQuery.extend(Actions.SetQuestStateAction.prototype, GoNorth.DefaultNodeShapes.Shapes.SharedObjectLoading.prototype);

            /**
             * Returns the HTML Content of the action
             * 
             * @returns {string} HTML Content of the action
             */
            Actions.SetQuestStateAction.prototype.getContent = function() {
                return  "<div class='gn-actionNodeObjectSelectContainer'>" + 
                            "<a class='gn-clickable gn-nodeActionSelectQuest gn-nodeNonClickableOnReadonly'></a>&nbsp;" +
                            "<a class='gn-clickable gn-nodeActionOpenQuest' title='" + DefaultNodeShapes.Localization.Actions.OpenQuestTooltip + "' style='display: none'><i class='glyphicon glyphicon-eye-open'></i></a>" +
                        "</div>" +
                        "<div class='gn-nodeActionText'>" + DefaultNodeShapes.Localization.Actions.QuestState + "</div>" +
                        "<select class='gn-nodeActionQuestState'></select>";
            };

            /**
             * Gets called once the action was intialized
             * 
             * @param {object} contentElement Content element
             * @param {ActionNode} actionNode Parent Action node
             */
            Actions.SetQuestStateAction.prototype.onInitialized = function(contentElement, actionNode) {
                this.contentElement = contentElement;
                this.contentElement.find(".gn-nodeActionSelectQuest").html(DefaultNodeShapes.Localization.Actions.ChooseQuestLabel);
                GoNorth.Util.fillSelectFromArray(this.contentElement.find(".gn-nodeActionQuestState"), DefaultNodeShapes.Shapes.getQuestStates(), function(questState) { return questState.questState; }, function(questState) { return questState.label; });

                var questOpenLink = contentElement.find(".gn-nodeActionOpenQuest");

                // Deserialize
                var existingQuestId = this.deserializeData();
                if(existingQuestId)
                {
                    questOpenLink.show();

                    actionNode.showLoading();
                    actionNode.hideError();

                    this.loadObjectShared(existingQuestId).then(function(quest) {
                        contentElement.find(".gn-nodeActionSelectQuest").text(quest.name);
                        actionNode.hideLoading();
                    }).fail(function(xhr) {
                        actionNode.hideLoading();
                        actionNode.showError();
                    });
                }

                // Handlers
                var self = this;
                var selectQuestAction = contentElement.find(".gn-nodeActionSelectQuest");
                contentElement.find(".gn-nodeActionSelectQuest").on("click", function() {
                    DefaultNodeShapes.openQuestSearchDialog().then(function(quest) {
                        selectQuestAction.data("questid", quest.id);
                        selectQuestAction.text(quest.name);
                        self.saveData();

                        questOpenLink.show();
                    });
                });

                var questState = contentElement.find(".gn-nodeActionQuestState");
                questState.change(function(e) {
                    self.saveData();
                });

                questOpenLink.on("click", function() {
                    if(selectQuestAction.data("questid"))
                    {
                        window.open("/Aika/Quest#id=" + selectQuestAction.data("questid"));
                    }
                });
            };

            /**
             * Deserializes the data
             * 
             * @returns {string} Id of the selected quest
             */
            Actions.SetQuestStateAction.prototype.deserializeData = function() {
                var actionData = this.nodeModel.get("actionData");
                if(!actionData)
                {
                    return "";
                }

                var data = JSON.parse(actionData);
                
                var questId = "";
                if(data.questId)
                {
                    this.contentElement.find(".gn-nodeActionSelectQuest").data("questid", data.questId);
                    questId = data.questId;
                }
                else
                {
                    this.contentElement.find(".gn-nodeActionSelectQuest").data("questid", "");
                }

                this.contentElement.find(".gn-nodeActionQuestState").find("option[value='" + data.questState + "']").prop("selected", true);

                return questId;
            }

            /**
             * Saves the data
             */
            Actions.SetQuestStateAction.prototype.saveData = function() {
                // The serialized data is also used in the Aika changeQuestStateInNpcDialogAction. If anything changes this must be taken into consideration.
                
                var questId = this.getObjectId();
                var questState = this.contentElement.find(".gn-nodeActionQuestState").val();
                var serializeData = {
                    questId: questId,
                    questState: questState
                };

                this.nodeModel.set("actionData", JSON.stringify(serializeData));

                // Set related object data
                this.nodeModel.set("actionRelatedToObjectType", this.getObjectTypeName());
                this.nodeModel.set("actionRelatedToObjectId", questId);
            }

            /**
             * Builds the action
             * 
             * @returns {object} Action
             */
            Actions.SetQuestStateAction.prototype.buildAction = function() {
                return new Actions.SetQuestStateAction();
            };

            /**
             * Returns the type of the action
             * 
             * @returns {number} Type of the action
             */
            Actions.SetQuestStateAction.prototype.getType = function() {
                return Actions.actionTypeChangeQuestState;
            };

            /**
             * Returns the label of the action
             * 
             * @returns {string} Label of the action
             */
            Actions.SetQuestStateAction.prototype.getLabel = function() {
                return DefaultNodeShapes.Localization.Actions.SetQuestStateLabel;
            };

            /**
             * Returns the object type name. Used for dependency objects
             * 
             * @returns {string} Object Type name used for depends on objects 
             */
            Actions.SetQuestStateAction.prototype.getObjectTypeName = function() {
                return Actions.RelatedToObjectQuest;
            };

            /**
             * Returns the object id
             * 
             * @returns {string} Object Id
             */
            Actions.SetQuestStateAction.prototype.getObjectId = function() {
                return this.contentElement.find(".gn-nodeActionSelectQuest").data("questid");
            };
            
            /**
             * Returns the object resource
             * 
             * @returns {int} Object Resource
             */
            Actions.SetQuestStateAction.prototype.getObjectResource = function() {
                return GoNorth.DefaultNodeShapes.Shapes.ObjectResourceQuest;
            };

            /**
             * Loads the quest
             * 
             * @param {string} questId Quest Id
             * @returns {jQuery.Deferred} Deferred for the quest loading
             */
            Actions.SetQuestStateAction.prototype.loadObject = function(questId) {
                var def = new jQuery.Deferred();

                var self = this;
                jQuery.ajax({ 
                    url: "/api/AikaApi/GetQuest?id=" + questId, 
                    type: "GET"
                }).done(function(data) {
                    def.resolve(data);
                }).fail(function(xhr) {
                    def.reject();
                });

                return def.promise();
            };

            GoNorth.DefaultNodeShapes.Shapes.addAvailableAction(new Actions.SetQuestStateAction());

        }(DefaultNodeShapes.Actions = DefaultNodeShapes.Actions || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Actions) {

            /// Action Type for adding text to a quest
            Actions.actionTypeAddQuestToText = 10;

            /**
             * Add Text to Quest Action
             * @class
             */
            Actions.AddQuestTextAction = function()
            {
                GoNorth.DefaultNodeShapes.Actions.BaseAction.apply(this);
                GoNorth.DefaultNodeShapes.Shapes.SharedObjectLoading.apply(this);
            };

            Actions.AddQuestTextAction.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.Actions.BaseAction.prototype);
            Actions.AddQuestTextAction.prototype = jQuery.extend(Actions.AddQuestTextAction.prototype, GoNorth.DefaultNodeShapes.Shapes.SharedObjectLoading.prototype);

            /**
             * Returns the HTML Content of the action
             * 
             * @returns {string} HTML Content of the action
             */
            Actions.AddQuestTextAction.prototype.getContent = function() {
                return  "<div class='gn-actionNodeObjectSelectContainer'>" + 
                            "<a class='gn-clickable gn-nodeActionSelectQuest gn-nodeNonClickableOnReadonly'></a>&nbsp;" +
                            "<a class='gn-clickable gn-nodeActionOpenQuest' title='" + DefaultNodeShapes.Localization.Actions.OpenQuestTooltip + "' style='display: none'><i class='glyphicon glyphicon-eye-open'></i></a>" +
                        "</div>" +
                        "<div class='gn-nodeActionText'>" + DefaultNodeShapes.Localization.Actions.QuestText + "</div>" +
                        "<textarea class='gn-nodeActionQuestText'></textarea>";
            };

            /**
             * Gets called once the action was intialized
             * 
             * @param {object} contentElement Content element
             * @param {ActionNode} actionNode Parent Action node
             */
            Actions.AddQuestTextAction.prototype.onInitialized = function(contentElement, actionNode) {
                this.contentElement = contentElement;
                this.contentElement.find(".gn-nodeActionSelectQuest").html(DefaultNodeShapes.Localization.Actions.ChooseQuestLabel);

                var questOpenLink = contentElement.find(".gn-nodeActionOpenQuest");

                // Deserialize
                var existingQuestId = this.deserializeData();
                if(existingQuestId)
                {
                    questOpenLink.show();

                    actionNode.showLoading();
                    actionNode.hideError();

                    this.loadObjectShared(existingQuestId).then(function(quest) {
                        contentElement.find(".gn-nodeActionSelectQuest").text(quest.name);
                        actionNode.hideLoading();
                    }).fail(function(xhr) {
                        actionNode.hideLoading();
                        actionNode.showError();
                    });
                }

                // Handlers
                var self = this;
                var selectQuestAction = contentElement.find(".gn-nodeActionSelectQuest");
                contentElement.find(".gn-nodeActionSelectQuest").on("click", function() {
                    DefaultNodeShapes.openQuestSearchDialog().then(function(quest) {
                        selectQuestAction.data("questid", quest.id);
                        selectQuestAction.text(quest.name);
                        self.saveData();
                        
                        questOpenLink.show();
                    });
                });

                var questText = contentElement.find(".gn-nodeActionQuestText");
                questText.change(function(e) {
                    self.saveData();
                });

                questOpenLink.on("click", function() {
                    if(selectQuestAction.data("questid"))
                    {
                        window.open("/Aika/Quest#id=" + selectQuestAction.data("questid"));
                    }
                });
            };

            /**
             * Deserializes the data
             */
            Actions.AddQuestTextAction.prototype.deserializeData = function() {
                var actionData = this.nodeModel.get("actionData");
                if(!actionData)
                {
                    return "";
                }

                var data = JSON.parse(actionData);
                
                var questId = "";
                if(data.questId)
                {
                    this.contentElement.find(".gn-nodeActionSelectQuest").data("questid", data.questId);
                    questId = data.questId;
                }
                else
                {
                    this.contentElement.find(".gn-nodeActionSelectQuest").data("questid", "");
                }

                this.contentElement.find(".gn-nodeActionQuestText").val(data.questText);

                return questId;
            }

            /**
             * Saves the data
             */
            Actions.AddQuestTextAction.prototype.saveData = function() {
                // The serialized data is also used in the Aika changeQuestTextInNpcDialogAction. If anything changes this must be taken into consideration.
                
                var questId = this.getObjectId();
                var questText = this.contentElement.find(".gn-nodeActionQuestText").val();
                var serializeData = {
                    questId: questId,
                    questText: questText
                };

                this.nodeModel.set("actionData", JSON.stringify(serializeData));
            }

            /**
             * Builds the action
             * 
             * @returns {object} Action
             */
            Actions.AddQuestTextAction.prototype.buildAction = function() {
                return new Actions.AddQuestTextAction();
            };

            /**
             * Returns the type of the action
             * 
             * @returns {number} Type of the action
             */
            Actions.AddQuestTextAction.prototype.getType = function() {
                return Actions.actionTypeAddQuestToText;
            };

            /**
             * Returns the label of the action
             * 
             * @returns {string} Label of the action
             */
            Actions.AddQuestTextAction.prototype.getLabel = function() {
                return DefaultNodeShapes.Localization.Actions.AddQuestTextLabel;
            };

            /**
             * Returns the object type name. Used for dependency objects
             * 
             * @returns {string} Object Type name used for depends on objects 
             */
            Actions.AddQuestTextAction.prototype.getObjectTypeName = function() {
                return Actions.RelatedToObjectQuest;
            };

            /**
             * Returns the object id
             * 
             * @returns {string} Object Id
             */
            Actions.AddQuestTextAction.prototype.getObjectId = function() {
                return this.contentElement.find(".gn-nodeActionSelectQuest").data("questid");
            };
            
            /**
             * Returns the object resource
             * 
             * @returns {int} Object Resource
             */
            Actions.AddQuestTextAction.prototype.getObjectResource = function() {
                return GoNorth.DefaultNodeShapes.Shapes.ObjectResourceQuest;
            };

            /**
             * Loads the quest
             * 
             * @param {string} questId Quest Id
             * @returns {jQuery.Deferred} Deferred for the quest loading
             */
            Actions.AddQuestTextAction.prototype.loadObject = function(questId) {
                var def = new jQuery.Deferred();

                var self = this;
                jQuery.ajax({ 
                    url: "/api/AikaApi/GetQuest?id=" + questId, 
                    type: "GET"
                }).done(function(data) {
                    def.resolve(data);
                }).fail(function(xhr) {
                    def.reject();
                });

                return def.promise();
            };

            GoNorth.DefaultNodeShapes.Shapes.addAvailableAction(new Actions.AddQuestTextAction());

        }(DefaultNodeShapes.Actions = DefaultNodeShapes.Actions || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Actions) {

            /// Action Type for waiting
            var actionTypeWait = 14;


            /// Wait Type for Waiting in Real Time
            var waitTypeRealTime = 0;

            /// Wait Type for Waiting in Game Time
            var waitTypeGameTime = 1;


            /// Wait unit for milliseconds
            var waitUnitMilliseconds = 0;

            /// Wait unit for seconds
            var waitUnitSeconds = 1;
            
            /// Wait unit for minutes
            var waitUnitMinutes = 2;

            /// Wait unit for hours
            var waitUnitHours = 3;
            
            /// Wait unit for days
            var waitUnitDays = 4;



            /**
             * Wait Action
             * @class
             */
            Actions.WaitAction = function()
            {
                GoNorth.DefaultNodeShapes.Actions.BaseAction.apply(this);
            };

            Actions.WaitAction.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.Actions.BaseAction.prototype);

            /**
             * Returns the HTML Content of the action
             * 
             * @returns {string} HTML Content of the action
             */
            Actions.WaitAction.prototype.getContent = function() {
                return  "<input type='text' class='gn-actionNodeWaitAmount'/>" + 
                        "<select class='gn-actionNodeWaitType'></select>" +
                        "<select class='gn-actionNodeWaitUnit'></select>";
            };

            /**
             * Gets called once the action was intialized
             * 
             * @param {object} contentElement Content element
             * @param {ActionNode} actionNode Parent Action node
             */
            Actions.WaitAction.prototype.onInitialized = function(contentElement, actionNode) {
                this.contentElement = contentElement;

                this.contentElement.find(".gn-actionNodeWaitAmount").val("0");

                var availableWaitTypes = [
                    {
                        label: DefaultNodeShapes.Localization.Actions.WaitTypeRealTime,
                        value: waitTypeRealTime
                    },
                    {
                        label: DefaultNodeShapes.Localization.Actions.WaitTypeGameTime,
                        value: waitTypeGameTime
                    }
                ];
                var waitType = contentElement.find(".gn-actionNodeWaitType");
                GoNorth.Util.fillSelectFromArray(waitType, availableWaitTypes, function(waitType) { return waitType.value; }, function(waitType) { return waitType.label; });

                var self = this;
                waitType.on("change", function() {
                    self.syncTimeUnits();
                    self.serialize();
                });

                this.syncTimeUnits();
                contentElement.find(".gn-actionNodeWaitUnit").on("change", function() {
                    self.serialize();
                });

                var waitAmount = contentElement.find(".gn-actionNodeWaitAmount");
                waitAmount.keydown(function(e) {
                    GoNorth.Util.validateNumberKeyPress(waitAmount, e);
                });

                waitAmount.change(function(e) {
                    if(self.isNumberValueSelected)
                    {
                        self.ensureNumberValue();
                    }

                    self.serialize();
                });

                this.deserialize();
            };

            /**
             * Syncs the time units
             */
            Actions.WaitAction.prototype.syncTimeUnits = function() {
                var availableUnits = [
                    {
                        label: DefaultNodeShapes.Localization.Actions.WaitUnitMilliseconds,
                        value: waitUnitMilliseconds
                    },
                    {
                        label: DefaultNodeShapes.Localization.Actions.WaitUnitSeconds,
                        value: waitUnitSeconds
                    },
                    {
                        label: DefaultNodeShapes.Localization.Actions.WaitUnitMinutes,
                        value: waitUnitMinutes
                    }
                ];

                if(this.contentElement.find(".gn-actionNodeWaitType").val() == waitTypeGameTime)
                {
                    availableUnits = [
                        {
                            label: DefaultNodeShapes.Localization.Actions.WaitUnitMinutes,
                            value: waitUnitMinutes
                        },
                        {
                            label: DefaultNodeShapes.Localization.Actions.WaitUnitHours,
                            value: waitUnitHours
                        },
                        {
                            label: DefaultNodeShapes.Localization.Actions.WaitUnitDays,
                            value: waitUnitDays
                        }
                    ];
                }

                GoNorth.Util.fillSelectFromArray(this.contentElement.find(".gn-actionNodeWaitUnit"), availableUnits, function(waitType) { return waitType.value; }, function(waitType) { return waitType.label; });
            };

            /**
             * Ensures the user entered a number if a number field was selected
             */
            Actions.WaitAction.prototype.ensureNumberValue = function() {
                var parsedValue = parseFloat(this.contentElement.find(".gn-actionNodeWaitAmount").val());
                if(isNaN(parsedValue))
                {
                    this.contentElement.find(".gn-actionNodeWaitAmount").val("0");
                }
            };

            /**
             * Deserializes the data
             */
            Actions.WaitAction.prototype.deserialize = function() {
                var actionData = this.nodeModel.get("actionData");
                if(!actionData)
                {
                    return "";
                }

                var data = JSON.parse(actionData);
                
                this.contentElement.find(".gn-actionNodeWaitAmount").val(data.waitAmount);
                this.contentElement.find(".gn-actionNodeWaitType").find("option[value='" + data.waitType + "']").prop("selected", true);
                this.syncTimeUnits();
                this.contentElement.find(".gn-actionNodeWaitUnit").find("option[value='" + data.waitUnit + "']").prop("selected", true);
            };

            /**
             * Saves the data
             */
            Actions.WaitAction.prototype.serialize = function() {
                var waitAmount = parseFloat(this.contentElement.find(".gn-actionNodeWaitAmount").val());
                if(isNaN(waitAmount))
                {
                    waitAmount = 0;
                }

                var waitType = this.contentElement.find(".gn-actionNodeWaitType").val();
                var waitUnit = this.contentElement.find(".gn-actionNodeWaitUnit").val();

                var serializeData = {
                    waitAmount: waitAmount,
                    waitType: waitType,
                    waitUnit: waitUnit
                };

                this.nodeModel.set("actionData", JSON.stringify(serializeData));
            };

            /**
             * Builds the action
             * 
             * @returns {object} Action
             */
            Actions.WaitAction.prototype.buildAction = function() {
                return new Actions.WaitAction();
            };

            /**
             * Returns the type of the action
             * 
             * @returns {number} Type of the action
             */
            Actions.WaitAction.prototype.getType = function() {
                return actionTypeWait;
            };

            /**
             * Returns the label of the action
             * 
             * @returns {string} Label of the action
             */
            Actions.WaitAction.prototype.getLabel = function() {
                return DefaultNodeShapes.Localization.Actions.WaitLabel;
            };

            GoNorth.DefaultNodeShapes.Shapes.addAvailableAction(new Actions.WaitAction());

        }(DefaultNodeShapes.Actions = DefaultNodeShapes.Actions || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Actions) {

            /**
             * Set Object State Action
             * @class
             */
            Actions.SetObjectStateAction = function()
            {
                GoNorth.DefaultNodeShapes.Actions.BaseAction.apply(this);
            };

            Actions.SetObjectStateAction.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.Actions.BaseAction.prototype);

            /**
             * Returns the HTML Content of the action
             * 
             * @returns {string} HTML Content of the action
             */
            Actions.SetObjectStateAction.prototype.getContent = function() {
                return  "<input type='text' class='gn-nodeActionObjectState' placeholder='" + DefaultNodeShapes.Localization.Actions.StatePlaceholder + "'/>";
            };

            /**
             * Gets called once the action was intialized
             * 
             * @param {object} contentElement Content element
             * @param {ActionNode} actionNode Parent Action node
             */
            Actions.SetObjectStateAction.prototype.onInitialized = function(contentElement, actionNode) {
                this.contentElement = contentElement;

                // Deserialize
                this.deserializeData();

                // Handlers
                var self = this;
                var objectState = contentElement.find(".gn-nodeActionObjectState");
                objectState.change(function(e) {
                    self.saveData();
                });
            };

            /**
             * Deserializes the data
             */
            Actions.SetObjectStateAction.prototype.deserializeData = function() {
                var actionData = this.nodeModel.get("actionData");
                if(!actionData)
                {
                    return "";
                }

                var data = JSON.parse(actionData);
                
                this.contentElement.find(".gn-nodeActionObjectState").val(data.objectState);
            }

            /**
             * Saves the data
             */
            Actions.SetObjectStateAction.prototype.saveData = function() {
                var objectState = this.contentElement.find(".gn-nodeActionObjectState").val();
                var serializeData = {
                    objectState: objectState
                };

                this.nodeModel.set("actionData", JSON.stringify(serializeData));
            }

            /**
             * Builds the action
             * 
             * @returns {object} Action
             */
            Actions.SetObjectStateAction.prototype.buildAction = function() {
                return new Actions.SetObjectStateAction();
            };

            /**
             * Returns the type of the action
             * 
             * @returns {number} Type of the action
             */
            Actions.SetObjectStateAction.prototype.getType = function() {
                return -1;
            };

            /**
             * Returns the label of the action
             * 
             * @returns {string} Label of the action
             */
            Actions.SetObjectStateAction.prototype.getLabel = function() {
                return "";
            };

        }(DefaultNodeShapes.Actions = DefaultNodeShapes.Actions || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Actions) {

            /// Action Type for changing the player state
            var actionTypeChangePlayerState = 15;

            /**
             * Change player state Action
             * @class
             */
            Actions.SetPlayerStateAction = function()
            {
                GoNorth.DefaultNodeShapes.Actions.SetObjectStateAction.apply(this);
            };

            Actions.SetPlayerStateAction.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.Actions.SetObjectStateAction.prototype);

            /**
             * Builds the action
             * 
             * @returns {object} Action
             */
            Actions.SetPlayerStateAction.prototype.buildAction = function() {
                return new Actions.SetPlayerStateAction();
            };

            /**
             * Returns the type of the action
             * 
             * @returns {number} Type of the action
             */
            Actions.SetPlayerStateAction.prototype.getType = function() {
                return actionTypeChangePlayerState;
            };

            /**
             * Returns the label of the action
             * 
             * @returns {string} Label of the action
             */
            Actions.SetPlayerStateAction.prototype.getLabel = function() {
                return DefaultNodeShapes.Localization.Actions.SetPlayerStateLabel;
            };

            GoNorth.DefaultNodeShapes.Shapes.addAvailableAction(new Actions.SetPlayerStateAction());

        }(DefaultNodeShapes.Actions = DefaultNodeShapes.Actions || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(Tale) {
        (function(Actions) {

            /// Action Type for changing the npc state
            var actionTypeChangeNpcState = 17;

            /**
             * Change npc state Action
             * @class
             */
            Actions.SetNpcStateAction = function()
            {
                GoNorth.DefaultNodeShapes.Actions.SetObjectStateAction.apply(this);
            };

            Actions.SetNpcStateAction.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.Actions.SetObjectStateAction.prototype);

            /**
             * Builds the action
             * 
             * @returns {object} Action
             */
            Actions.SetNpcStateAction.prototype.buildAction = function() {
                return new Actions.SetNpcStateAction();
            };

            /**
             * Returns the type of the action
             * 
             * @returns {number} Type of the action
             */
            Actions.SetNpcStateAction.prototype.getType = function() {
                return actionTypeChangeNpcState;
            };

            /**
             * Returns the label of the action
             * 
             * @returns {string} Label of the action
             */
            Actions.SetNpcStateAction.prototype.getLabel = function() {
                return Tale.Localization.Actions.SetNpcStateLabel;
            };

            GoNorth.DefaultNodeShapes.Shapes.addAvailableAction(new Actions.SetNpcStateAction());

        }(Tale.Actions = Tale.Actions || {}));
    }(GoNorth.Tale = GoNorth.Tale || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Actions) {

            /**
             * Learn or Forget a Skill Action
             * @class
             */
            Actions.LearnForgetSkillAction = function()
            {
                GoNorth.DefaultNodeShapes.Actions.BaseAction.apply(this);
                GoNorth.DefaultNodeShapes.Shapes.SharedObjectLoading.apply(this);
            };

            Actions.LearnForgetSkillAction.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.Actions.BaseAction.prototype);
            Actions.LearnForgetSkillAction.prototype = jQuery.extend(Actions.LearnForgetSkillAction.prototype, GoNorth.DefaultNodeShapes.Shapes.SharedObjectLoading.prototype);

            /**
             * Returns the HTML Content of the action
             * 
             * @returns {string} HTML Content of the action
             */
            Actions.LearnForgetSkillAction.prototype.getContent = function() {
                return  "<div class='gn-actionNodeObjectSelectContainer'>" + 
                            "<a class='gn-clickable gn-nodeActionSelectSkill gn-nodeNonClickableOnReadonly'></a>&nbsp;" +
                            "<a class='gn-clickable gn-nodeActionOpenSkill' title='" + DefaultNodeShapes.Localization.Actions.OpenSkillTooltip + "' style='display: none'><i class='glyphicon glyphicon-eye-open'></i></a>" +
                        "</div>";
            };

            /**
             * Gets called once the action was intialized
             * 
             * @param {object} contentElement Content element
             * @param {ActionNode} actionNode Parent Action node
             */
            Actions.LearnForgetSkillAction.prototype.onInitialized = function(contentElement, actionNode) {
                this.contentElement = contentElement;
                this.contentElement.find(".gn-nodeActionSelectSkill").html(DefaultNodeShapes.Localization.Actions.ChooseSkillLabel);

                var skillOpenLink = contentElement.find(".gn-nodeActionOpenSkill");

                // Deserialize
                var existingSkillId = this.deserializeData();
                if(existingSkillId)
                {
                    skillOpenLink.show();

                    actionNode.showLoading();
                    actionNode.hideError();

                    this.loadObjectShared(existingSkillId).then(function(skill) {
                        contentElement.find(".gn-nodeActionSelectSkill").text(skill.name);
                        actionNode.hideLoading();
                    }).fail(function(xhr) {
                        actionNode.hideLoading();
                        actionNode.showError();
                    });
                }

                // Handlers
                var self = this;
                var selectSkillAction = contentElement.find(".gn-nodeActionSelectSkill");
                contentElement.find(".gn-nodeActionSelectSkill").on("click", function() {
                    DefaultNodeShapes.openSkillSearchDialog().then(function(skill) {
                        selectSkillAction.data("skillid", skill.id);
                        selectSkillAction.text(skill.name);
                        self.saveData();

                        skillOpenLink.show();
                    });
                });

                skillOpenLink.on("click", function() {
                    if(selectSkillAction.data("skillid"))
                    {
                        window.open("/Evne/Skill#id=" + selectSkillAction.data("skillid"));
                    }
                });
            };

            /**
             * Deserializes the data
             * 
             * @returns {string} Id of the selected skill
             */
            Actions.LearnForgetSkillAction.prototype.deserializeData = function() {
                var actionData = this.nodeModel.get("actionData");
                if(!actionData)
                {
                    return "";
                }

                var data = JSON.parse(actionData);
                
                var skillId = "";
                if(data.skillId)
                {
                    this.contentElement.find(".gn-nodeActionSelectSkill").data("skillid", data.skillId);
                    skillId = data.skillId;
                }
                else
                {
                    this.contentElement.find(".gn-nodeActionSelectSkill").data("skillid", "");
                }

                return skillId;
            }

            /**
             * Saves the data
             */
            Actions.LearnForgetSkillAction.prototype.saveData = function() {
                var skillId = this.getObjectId();
                var serializeData = {
                    skillId: skillId
                };

                this.nodeModel.set("actionData", JSON.stringify(serializeData));

                // Set related object data
                this.nodeModel.set("actionRelatedToObjectType", this.getObjectTypeName());
                this.nodeModel.set("actionRelatedToObjectId", skillId);
            }

            /**
             * Returns the object type name. Used for dependency objects
             * 
             * @returns {string} Object Type name used for depends on objects 
             */
            Actions.LearnForgetSkillAction.prototype.getObjectTypeName = function() {
                return Actions.RelatedToObjectSkill;
            };

            /**
             * Returns the object id
             * 
             * @returns {string} Object Id
             */
            Actions.LearnForgetSkillAction.prototype.getObjectId = function() {
                return this.contentElement.find(".gn-nodeActionSelectSkill").data("skillid");
            };

            /**
             * Returns the object resource
             * 
             * @returns {int} Object Resource
             */
            Actions.LearnForgetSkillAction.prototype.getObjectResource = function() {
                return GoNorth.DefaultNodeShapes.Shapes.ObjectResourceSkill;
            };

            /**
             * Loads the skill
             * 
             * @param {string} skillId Skill Id
             * @returns {jQuery.Deferred} Deferred for the skill loading
             */
            Actions.LearnForgetSkillAction.prototype.loadObject = function(skillId) {
                var def = new jQuery.Deferred();

                var self = this;
                jQuery.ajax({ 
                    url: "/api/EvneApi/FlexFieldObject?id=" + skillId, 
                    type: "GET"
                }).done(function(data) {
                    def.resolve(data);
                }).fail(function(xhr) {
                    def.reject();
                });

                return def.promise();
            };

        }(DefaultNodeShapes.Actions = DefaultNodeShapes.Actions || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Actions) {

            /// Action Type for learning a new skill for the player
            var actionTypePlayerLearnSkill = 18;

            /**
             * Player learn a new skill Action
             * @class
             */
            Actions.PlayerLearnSkillAction = function()
            {
                GoNorth.DefaultNodeShapes.Actions.LearnForgetSkillAction.apply(this);
            };

            Actions.PlayerLearnSkillAction.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.Actions.LearnForgetSkillAction.prototype);

            /**
             * Builds the action
             * 
             * @returns {object} Action
             */
            Actions.PlayerLearnSkillAction.prototype.buildAction = function() {
                return new Actions.PlayerLearnSkillAction();
            };

            /**
             * Returns the type of the action
             * 
             * @returns {number} Type of the action
             */
            Actions.PlayerLearnSkillAction.prototype.getType = function() {
                return actionTypePlayerLearnSkill;
            };

            /**
             * Returns the label of the action
             * 
             * @returns {string} Label of the action
             */
            Actions.PlayerLearnSkillAction.prototype.getLabel = function() {
                return DefaultNodeShapes.Localization.Actions.PlayerLearnSkillLabel;
            };

            GoNorth.DefaultNodeShapes.Shapes.addAvailableAction(new Actions.PlayerLearnSkillAction());

        }(DefaultNodeShapes.Actions = DefaultNodeShapes.Actions || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Actions) {

            /// Action Type for forgetting a skill for the player
            var actionTypePlayerForgetSkill = 19;

            /**
             * Player forget a skill Action
             * @class
             */
            Actions.PlayerForgetSkillAction = function()
            {
                GoNorth.DefaultNodeShapes.Actions.LearnForgetSkillAction.apply(this);
            };

            Actions.PlayerForgetSkillAction.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.Actions.LearnForgetSkillAction.prototype);

            /**
             * Builds the action
             * 
             * @returns {object} Action
             */
            Actions.PlayerForgetSkillAction.prototype.buildAction = function() {
                return new Actions.PlayerForgetSkillAction();
            };

            /**
             * Returns the type of the action
             * 
             * @returns {number} Type of the action
             */
            Actions.PlayerForgetSkillAction.prototype.getType = function() {
                return actionTypePlayerForgetSkill;
            };

            /**
             * Returns the label of the action
             * 
             * @returns {string} Label of the action
             */
            Actions.PlayerForgetSkillAction.prototype.getLabel = function() {
                return DefaultNodeShapes.Localization.Actions.PlayerForgetSkillLabel;
            };

            GoNorth.DefaultNodeShapes.Shapes.addAvailableAction(new Actions.PlayerForgetSkillAction());

        }(DefaultNodeShapes.Actions = DefaultNodeShapes.Actions || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(Tale) {
        (function(Actions) {

            /// Action Type for learning a skill for the npc
            var actionTypeNpcLearnSkill = 20;

            /**
             * Npc learn a skill Action
             * @class
             */
            Actions.NpcLearnSkillAction = function()
            {
                GoNorth.DefaultNodeShapes.Actions.LearnForgetSkillAction.apply(this);
            };

            Actions.NpcLearnSkillAction.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.Actions.LearnForgetSkillAction.prototype);

            /**
             * Builds the action
             * 
             * @returns {object} Action
             */
            Actions.NpcLearnSkillAction.prototype.buildAction = function() {
                return new Actions.NpcLearnSkillAction();
            };

            /**
             * Returns the type of the action
             * 
             * @returns {number} Type of the action
             */
            Actions.NpcLearnSkillAction.prototype.getType = function() {
                return actionTypeNpcLearnSkill;
            };

            /**
             * Returns the label of the action
             * 
             * @returns {string} Label of the action
             */
            Actions.NpcLearnSkillAction.prototype.getLabel = function() {
                return Tale.Localization.Actions.NpcLearnsSkillLabel;
            };

            GoNorth.DefaultNodeShapes.Shapes.addAvailableAction(new Actions.NpcLearnSkillAction());

        }(Tale.Actions = Tale.Actions || {}));
    }(GoNorth.Tale = GoNorth.Tale || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(Tale) {
        (function(Actions) {

            /// Action Type for forgetting a skill for the npc
            var actionTypeNpcForgetSkill = 21;

            /**
             * Npc forget a skill Action
             * @class
             */
            Actions.NpcForgetSkillAction = function()
            {
                GoNorth.DefaultNodeShapes.Actions.LearnForgetSkillAction.apply(this);
            };

            Actions.NpcForgetSkillAction.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.Actions.LearnForgetSkillAction.prototype);

            /**
             * Builds the action
             * 
             * @returns {object} Action
             */
            Actions.NpcForgetSkillAction.prototype.buildAction = function() {
                return new Actions.NpcForgetSkillAction();
            };

            /**
             * Returns the type of the action
             * 
             * @returns {number} Type of the action
             */
            Actions.NpcForgetSkillAction.prototype.getType = function() {
                return actionTypeNpcForgetSkill;
            };

            /**
             * Returns the label of the action
             * 
             * @returns {string} Label of the action
             */
            Actions.NpcForgetSkillAction.prototype.getLabel = function() {
                return Tale.Localization.Actions.NpcForgetSkillLabel;
            };

            GoNorth.DefaultNodeShapes.Shapes.addAvailableAction(new Actions.NpcForgetSkillAction());

        }(Tale.Actions = Tale.Actions || {}));
    }(GoNorth.Tale = GoNorth.Tale || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Actions) {
            
            /**
             * Change skill value Action
             * @class
             */
            Actions.ChangeSkillValueAction = function()
            {
                GoNorth.DefaultNodeShapes.Actions.ChangeValueChooseObjectAction.apply(this);
            };

            Actions.ChangeSkillValueAction.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.Actions.ChangeValueChooseObjectAction.prototype);

            /**
             * Returns the choose object label
             * 
             * @returns {string} Choose object label
             */
            Actions.ChangeSkillValueAction.prototype.getChooseLabel = function() {
                return DefaultNodeShapes.Localization.Actions.ChooseSkillLabel;
            };

            /**
             * Returns the object type name. Used for dependency objects
             * 
             * @returns {string} Object Type name used for depends on objects 
             */
            Actions.ChangeSkillValueAction.prototype.getObjectTypeName = function() {
                return Actions.RelatedToObjectSkill;
            };
            
            /**
             * Returns the object resource
             * 
             * @returns {int} Object Resource
             */
            Actions.ChangeSkillValueAction.prototype.getObjectResource = function() {
                return GoNorth.DefaultNodeShapes.Shapes.ObjectResourceSkill;
            };

            /**
             * Opens the search dialog
             * 
             * @returns {jQuery.Deferred} Deferred for the picking
             */
            Actions.ChangeSkillValueAction.prototype.openSearchDialog = function() {
                return GoNorth.DefaultNodeShapes.openSkillSearchDialog();
            };

            /**
             * Loads the skill
             * 
             * @returns {jQuery.Deferred} Deferred for the skill loading
             */
            Actions.ChangeSkillValueAction.prototype.loadObject = function() {
                var def = new jQuery.Deferred();

                var self = this;
                jQuery.ajax({ 
                    url: "/api/EvneApi/FlexFieldObject?id=" + this.nodeModel.get("objectId"), 
                    type: "GET"
                }).done(function(data) {
                    def.resolve(data);
                }).fail(function(xhr) {
                    def.reject();
                });

                return def.promise();
            };

        }(DefaultNodeShapes.Actions = DefaultNodeShapes.Actions || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Actions) {

            /// Action Type for changing a player skill value
            var actionTypeChangePlayerSkillValue = 22;

            /**
             * Change skill value Action
             * @class
             */
            Actions.ChangePlayerSkillValueAction = function()
            {
                GoNorth.DefaultNodeShapes.Actions.ChangeSkillValueAction.apply(this);
            };

            Actions.ChangePlayerSkillValueAction.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.Actions.ChangeSkillValueAction.prototype);

            /**
             * Builds the action
             * 
             * @returns {object} Action
             */
            Actions.ChangePlayerSkillValueAction.prototype.buildAction = function() {
                return new Actions.ChangePlayerSkillValueAction();
            };

            /**
             * Returns the type of the action
             * 
             * @returns {number} Type of the action
             */
            Actions.ChangePlayerSkillValueAction.prototype.getType = function() {
                return actionTypeChangePlayerSkillValue;
            };

            /**
             * Returns the label of the action
             * 
             * @returns {string} Label of the action
             */
            Actions.ChangePlayerSkillValueAction.prototype.getLabel = function() {
                return DefaultNodeShapes.Localization.Actions.ChangePlayerSkillValueLabel;
            };


            GoNorth.DefaultNodeShapes.Shapes.addAvailableAction(new Actions.ChangePlayerSkillValueAction());

        }(DefaultNodeShapes.Actions = DefaultNodeShapes.Actions || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(Tale) {
        (function(Actions) {

            /// Action Type for changing a npc skill value
            var actionTypeChangeNpcSkillValue = 23;

            /**
             * Change skill value Action
             * @class
             */
            Actions.ChangeNpcSkillValueAction = function()
            {
                GoNorth.DefaultNodeShapes.Actions.ChangeSkillValueAction.apply(this);
            };

            Actions.ChangeNpcSkillValueAction.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.Actions.ChangeSkillValueAction.prototype);

            /**
             * Builds the action
             * 
             * @returns {object} Action
             */
            Actions.ChangeNpcSkillValueAction.prototype.buildAction = function() {
                return new Actions.ChangeNpcSkillValueAction();
            };

            /**
             * Returns the type of the action
             * 
             * @returns {number} Type of the action
             */
            Actions.ChangeNpcSkillValueAction.prototype.getType = function() {
                return actionTypeChangeNpcSkillValue;
            };

            /**
             * Returns the label of the action
             * 
             * @returns {string} Label of the action
             */
            Actions.ChangeNpcSkillValueAction.prototype.getLabel = function() {
                return Tale.Localization.Actions.ChangeNpcSkillValueLabel;
            };


            GoNorth.DefaultNodeShapes.Shapes.addAvailableAction(new Actions.ChangeNpcSkillValueAction());

        }(Tale.Actions = Tale.Actions || {}));
    }(GoNorth.Tale = GoNorth.Tale || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(Tale) {
        (function(Actions) {

            /// Action Type for persisting the dialog state
            var actionTypePersistDialogState = 24;

            /**
             * Persist Dialog State Action
             * @class
             */
            Actions.PersistDialogStateAction = function()
            {
                GoNorth.DefaultNodeShapes.Actions.BaseAction.apply(this);
            };

            Actions.PersistDialogStateAction.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.Actions.BaseAction.prototype);

            /**
             * Returns the HTML Content of the action
             * 
             * @returns {string} HTML Content of the action
             */
            Actions.PersistDialogStateAction.prototype.getContent = function() {
                return  "<div class='gn-nodeActionText'>" + Tale.Localization.Actions.PersistDialogStateWillContinueOnThisPointNextTalk + "</div>";
            };

            /**
             * Gets called once the action was intialized
             * 
             * @param {object} contentElement Content element
             * @param {ActionNode} actionNode Parent Action node
             */
            Actions.PersistDialogStateAction.prototype.onInitialized = function(contentElement, actionNode) {
                this.contentElement = contentElement;
            };
            
            /**
             * Builds the action
             * 
             * @returns {object} Action
             */
            Actions.PersistDialogStateAction.prototype.buildAction = function() {
                return new Actions.PersistDialogStateAction();
            };

            /**
             * Returns the type of the action
             * 
             * @returns {number} Type of the action
             */
            Actions.PersistDialogStateAction.prototype.getType = function() {
                return actionTypePersistDialogState;
            };

            /**
             * Returns the label of the action
             * 
             * @returns {string} Label of the action
             */
            Actions.PersistDialogStateAction.prototype.getLabel = function() {
                return Tale.Localization.Actions.PersistDialogStateLabel;
            };

            GoNorth.DefaultNodeShapes.Shapes.addAvailableAction(new Actions.PersistDialogStateAction());

        }(Tale.Actions = Tale.Actions || {}));
    }(GoNorth.Tale = GoNorth.Tale || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(Tale) {
        (function(Actions) {

            /// Action Type for opening a shop
            var actionTypeOpenShop = 25;

            /**
             * Open Shop Action
             * @class
             */
            Actions.OpenShopAction = function()
            {
                GoNorth.DefaultNodeShapes.Actions.BaseAction.apply(this);
            };

            Actions.OpenShopAction.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.Actions.BaseAction.prototype);

            /**
             * Returns the HTML Content of the action
             * 
             * @returns {string} HTML Content of the action
             */
            Actions.OpenShopAction.prototype.getContent = function() {
                return  "<div class='gn-nodeActionText'>" + Tale.Localization.Actions.WillOpenAShopForTheCurrentNpc + "</div>";
            };

            /**
             * Gets called once the action was intialized
             * 
             * @param {object} contentElement Content element
             * @param {ActionNode} actionNode Parent Action node
             */
            Actions.OpenShopAction.prototype.onInitialized = function(contentElement, actionNode) {
                this.contentElement = contentElement;
            };
            
            /**
             * Builds the action
             * 
             * @returns {object} Action
             */
            Actions.OpenShopAction.prototype.buildAction = function() {
                return new Actions.OpenShopAction();
            };

            /**
             * Returns the type of the action
             * 
             * @returns {number} Type of the action
             */
            Actions.OpenShopAction.prototype.getType = function() {
                return actionTypeOpenShop;
            };

            /**
             * Returns the label of the action
             * 
             * @returns {string} Label of the action
             */
            Actions.OpenShopAction.prototype.getLabel = function() {
                return Tale.Localization.Actions.OpenShopLabel;
            };

            GoNorth.DefaultNodeShapes.Shapes.addAvailableAction(new Actions.OpenShopAction());

        }(Tale.Actions = Tale.Actions || {}));
    }(GoNorth.Tale = GoNorth.Tale || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Conditions) {

            /**
             * Condition Manager
             * @class
             */
            var conditionManager = function()
            {
                this.availableConditionTypes = [];
            };

            conditionManager.prototype = {
                /**
                 * Adds a new condition type to the manager
                 * 
                 * @param {object} condition Condition type to add
                 */
                addConditionType: function(condition) {
                    this.availableConditionTypes.push(condition);
                },

                /**
                 * Returns the available condition types
                 * 
                 * @returns {object} Condition Types
                 */
                getConditionTypes: function() {
                    return this.availableConditionTypes;
                },

                /**
                 * Returns the available condition types which can be selected
                 * 
                 * @returns {object} Condition Types which can be selected
                 */
                getSelectableConditionTypes: function() {
                    var selectableConditionTypes = [];
                    for(var curConditionType = 0; curConditionType < this.availableConditionTypes.length; ++curConditionType)
                    {
                        if(this.availableConditionTypes[curConditionType].canBeSelected())
                        {
                            selectableConditionTypes.push(this.availableConditionTypes[curConditionType]);
                        }
                    }
                    return selectableConditionTypes;
                },

                /**
                 * Returns the available condition types
                 * 
                 * @param {number} type Type of the condition
                 * @returns {string} Condition template
                 */
                getConditionTemplate: function(type) {
                    var conditionType = this.getConditionType(type);
                    if(conditionType)
                    {
                        return conditionType.getTemplateName();
                    }

                    return "gn-nodeConditionEmpty";
                },

                /**
                 * Returns true if a condition type is selectable, else false
                 * 
                 * @param {number} type Type of the condition
                 * @returns {bool} true if the condition type is selectable, else false
                 */
                isConditionTypeSelectable: function(type) {
                    var conditionType = this.getConditionType(type);
                    if(conditionType)
                    {
                        return conditionType.canBeSelected();
                    }

                    return true;
                },

                /**
                 * Builds the condition data
                 * 
                 * @param {number} type Type of the condition
                 * @param {object} existingData Existing data
                 * @param {object} element Element to which the data belongs
                 * @returns {object} Condition data
                 */
                buildConditionData: function(type, existingData, element) {
                    element.errorOccured(false);
                    var conditionType = this.getConditionType(type);
                    if(conditionType)
                    {
                        return conditionType.buildConditionData(existingData, element);
                    }

                    return null;
                },

                /**
                 * Serializes a condition
                 * 
                 * @param {object} existingData Existing Condition Data
                 * @returns {object} Serialized condition data
                 */
                serializeCondition: function(existingData) {
                    var serializedCondition = {
                        id: existingData.id,
                        dependsOnObjects: Conditions.getConditionManager().getConditionElementsDependsOnObject(existingData.conditionElements),
                        conditionElements: JSON.stringify(existingData.conditionElements)
                    };
                    return serializedCondition;
                },

                /**
                 * Deserializes a condition
                 * 
                 * @param {object} serializedCondition Serialized condition
                 * @returns {object} Deserialized condition data
                 */
                deserializeCondition: function(serializedCondition) {
                    var existingData = {
                        id: serializedCondition.id,
                        conditionElements: JSON.parse(serializedCondition.conditionElements)
                    };
                    return existingData;
                },

                /**
                 * Serializes a condition element
                 * 
                 * @param {object} conditionElement Condition Element
                 * @returns {object} Serialized Condition Element
                 */
                serializeConditionElement: function(conditionElement) {
                    var conditionType = this.getConditionType(conditionElement.conditionType());
                    if(conditionType)
                    {
                        return {
                            conditionType: conditionElement.conditionType(),
                            conditionData: conditionType.serializeConditionData(conditionElement.conditionData())
                        }
                    }

                    return null;
                },

                /**
                 * Returns the objects on which a group of condition element depends
                 * 
                 * @param {number} type Type of the condition
                 * @param {object} existingData Existing condition data
                 * @returns {object[]} Data of objects on which the condition element depends
                 */
                getConditionElementsDependsOnObject: function(conditionElements) {
                    var pushedObjects = {};
                    var allDependencies = [];
                    for(var curElement = 0; curElement < conditionElements.length; ++curElement)
                    {
                        var elementDependencies = Conditions.getConditionManager().getConditionElementDependsOnObject(conditionElements[curElement].conditionType, conditionElements[curElement].conditionData);
                        for(var curDependency = 0; curDependency < elementDependencies.length; ++curDependency)
                        {
                            var key = elementDependencies[curDependency].objectType + "|" + elementDependencies[curDependency].objectId;
                            if(!pushedObjects[key])
                            {
                                allDependencies.push(elementDependencies[curDependency]);
                                pushedObjects[key] = true;
                            }
                        }
                    }
                    return allDependencies;
                },

                /**
                 * Returns the objects on which a condition element depends
                 * 
                 * @param {number} type Type of the condition
                 * @param {object} existingData Existing condition data
                 * @returns {object[]} Data of objects on which the condition element depends
                 */
                getConditionElementDependsOnObject: function(type, existingData) {
                    var conditionType = this.getConditionType(type);
                    if(conditionType)
                    {
                        return conditionType.getConditionDependsOnObject(existingData);
                    }
                    return [];
                },
                
                /**
                 * Returns the condition type
                 * 
                 * @param {number} type Type of the condition
                 * @returns {object} Condition Type
                 */
                getConditionType: function(type) {
                    for(var curConditionType = 0; curConditionType < this.availableConditionTypes.length; ++curConditionType)
                    {
                        if(this.availableConditionTypes[curConditionType].getType() == type)
                        {
                            return this.availableConditionTypes[curConditionType];
                        }
                    }

                    return null;
                },

                /**
                 * Converts the condition elements
                 * 
                 * @param {object[]} elements Elements to convert
                 */
                convertElements: function(elements) {
                    var convertedElements = [];
                    for(var curElement = 0; curElement < elements.length; ++curElement)
                    {
                        var element = this.convertElement(elements[curElement]);
                        convertedElements.push(element);
                    }

                    return convertedElements;
                },

                /**
                 * Convertes an element
                 * 
                 * @param {object} element Element to convert
                 * @returns {object} Condition Element
                 */
                convertElement: function(element) {
                    var convertedElement = {
                        isSelected: new ko.observable(false),
                        conditionType: new ko.observable(element.conditionType),
                        conditionData: new ko.observable(null),
                        conditionTemplate: new ko.observable("gn-nodeConditionEmpty"),
                        parent: null,
                        errorOccured: new ko.observable(false)
                    };
                    convertedElement.conditionData(this.buildConditionData(element.conditionType, element.conditionData, convertedElement));
                    convertedElement.conditionTemplate(this.getConditionTemplate(element.conditionType));
                    this.addSharedFunctions(convertedElement);

                    return convertedElement;
                },

                /**
                 * Creates an empty element
                 * 
                 * @returns {object} Condition Element
                 */
                createEmptyElement: function() {
                    var element = {
                        isSelected: new ko.observable(false),
                        conditionType: new ko.observable(""),
                        conditionData: new ko.observable(null),
                        conditionTemplate: new ko.observable("gn-nodeConditionEmpty"),
                        parent: null,
                        errorOccured: new ko.observable(false)
                    };
                    this.addSharedFunctions(element);
                    return element;
                },

                /**
                 * Adds the shared functions to a condition
                 * 
                 * @param {object} element Condition Element
                 */
                addSharedFunctions: function(element) {
                    var self = this;
                    element.conditionType.subscribe(function() {
                        element.conditionTemplate("gn-nodeConditionEmpty");
                        element.conditionData(self.buildConditionData(element.conditionType(), null, element));
                        element.conditionTemplate(self.getConditionTemplate(element.conditionType()));
                    });
                },


                /**
                 * Returns the condition string for a condition
                 * @param {object[]} conditionElements Condition Elements
                 * @param {string} joinOperator Operator used for the join
                 * @param {bool} addBrackets true if brackets should be added around the result, else false
                 * @returns {jQuery.Deferred} Deferred for loading the text
                 */
                getConditionString: function(conditionElements, joinOperator, addBrackets) {
                    var conditionDef = new jQuery.Deferred();

                    var allElementsDef = [];
                    for(var curElement = 0; curElement < conditionElements.length; ++curElement)
                    {
                        var conditionType = this.getConditionType(conditionElements[curElement].conditionType);
                        allElementsDef.push(conditionType.getConditionString(conditionElements[curElement].conditionData));
                    }

                    jQuery.when.apply(jQuery, allElementsDef).then(function() {
                        if(arguments.length == 0)
                        {
                            conditionDef.resolve("");
                            return;
                        }

                        var allTextLines = [];
                        for(var curArgument = 0; curArgument < arguments.length; ++curArgument)
                        {
                            allTextLines.push(arguments[curArgument]);
                        }
                        var joinedValue = allTextLines.join(" " + joinOperator + " ");
                        if(addBrackets)
                        {
                            joinedValue = "(" + joinedValue + ")";
                        }
                        conditionDef.resolve(joinedValue);
                    }, function(err) {
                        conditionDef.reject(err);
                    });

                    return conditionDef.promise();
                }
            };


            var instance = new conditionManager();

            /**
             * Returns the condition manager instance
             * 
             * @returns {conditionManager} Condition Manager
             */
            Conditions.getConditionManager = function() {
                return instance;
            }

        }(DefaultNodeShapes.Conditions = DefaultNodeShapes.Conditions || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Conditions) {

            /// Conditions that are related to npcs
            Conditions.RelatedToObjectNpc = "Npc";

            /// Conditions that are related to items
            Conditions.RelatedToObjectItem = "Item";

            /// Conditions that are related to quests
            Conditions.RelatedToObjectQuest = "Quest";

            /// Conditions that are related to skills
            Conditions.RelatedToObjectSkill = "Skill";

            /**
             * Base Condition
             * @class
             */
            Conditions.BaseCondition = function()
            {
                this.nodeModel = null;
            };

            Conditions.BaseCondition.prototype = {
                /**
                 * Returns the type of the condition
                 * 
                 * @returns {number} Type of the condition
                 */
                getType: function() {
                    return -1;
                },

                /**
                 * Returns the label of the condition
                 * 
                 * @returns {string} Label of the condition
                 */
                getLabel: function() {

                },

                /**
                 * Returns true if the condition can be selected in the dropdown list, else false
                 * 
                 * @returns {bool} true if the condition can be selected, else false
                 */
                canBeSelected: function() {

                },

                /**
                 * Returns the template name for the condition
                 * 
                 * @returns {string} Template name
                 */
                getTemplateName: function() {

                },
                
                /**
                 * Returns the data for the condition
                 * 
                 * @param {object} existingData Existing condition data
                 * @param {object} element Element to which the data belongs
                 * @returns {object} Template data
                 */
                buildConditionData: function(existingData, element) {

                },

                /**
                 * Serializes condition data
                 * 
                 * @param {object} conditionData Condition data
                 * @returns {object} Serialized data
                 */
                serializeConditionData: function(conditionData) {

                },
                
                /**
                 * Returns the objects on which an object depends
                 * 
                 * @param {object} existingData Existing condition data
                 * @returns {object[]} Objects on which the condition depends
                 */
                getConditionDependsOnObject: function(existingData) {

                },


                /**
                 * Returns the condition data as a display string
                 * 
                 * @param {object} existingData Serialzied condition data
                 * @returns {jQuery.Deferred} Deferred for the loading process
                 */
                getConditionString: function(existingData) {

                }
            };

        }(DefaultNodeShapes.Conditions = DefaultNodeShapes.Conditions || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Conditions) {
            
            /// Group Condition type
            Conditions.GroupConditionType = 1;


            /// And Operator for group conditions
            Conditions.GroupConditionOperatorAnd = 0;

            /// Or Operator for group conditions
            Conditions.GroupConditionOperatorOr = 1;

            /**
             * Group condition (and/or)
             * @class
             */
            Conditions.GroupCondition = function()
            {
                Conditions.BaseCondition.apply(this);
            };

            Conditions.GroupCondition.prototype = jQuery.extend({ }, Conditions.BaseCondition.prototype);

            /**
             * Returns the type of the condition
             * 
             * @returns {number} Type of the condition
             */
            Conditions.GroupCondition.prototype.getType = function() {
                return Conditions.GroupConditionType;
            };

            /**
             * Returns the label of the condition
             * 
             * @returns {string} Label of the condition
             */
            Conditions.GroupCondition.prototype.getLabel = function() {
                return "";
            };

            /**
             * Returns true if the condition can be selected in the dropdown list, else false
             * 
             * @returns {bool} true if the condition can be selected, else false
             */
            Conditions.GroupCondition.prototype.canBeSelected = function() {
                return false;
            };

            /**
             * Returns the template name for the condition
             * 
             * @returns {string} Template name
             */
            Conditions.GroupCondition.prototype.getTemplateName = function() {
                return "gn-nodeConditionGroup";
            }

            /**
             * Returns the data for the condition
             * 
             * @param {object} existingData Existing condition data
             * @param {object} element Element to which the data belongs
             * @returns {object} Condition data
             */
            Conditions.GroupCondition.prototype.buildConditionData = function(existingData, element) {
                var conditionData = {
                    operator: new ko.observable(existingData.operator),
                    conditionElements: new ko.observableArray()
                };
                
                if(existingData.fromDialog)
                {
                    conditionData.conditionElements(existingData.conditionElements);
                }
                else
                {
                    var convertedElements = Conditions.getConditionManager().convertElements(existingData.conditionElements);
                    for(var curElement = 0; curElement < convertedElements.length; ++curElement)
                    {
                        convertedElements[curElement].parent = element;
                    }
                    conditionData.conditionElements(convertedElements);
                }

                conditionData.operatorText = new ko.computed(function() {
                    return conditionData.operator() == Conditions.GroupConditionOperatorAnd ? DefaultNodeShapes.Localization.Conditions.AndOperator : DefaultNodeShapes.Localization.Conditions.OrOperator;
                });

                conditionData.toggleOperator = function() {
                    if(conditionData.operator() == Conditions.GroupConditionOperatorAnd)
                    {
                        conditionData.operator(Conditions.GroupConditionOperatorOr);
                    }
                    else
                    {
                        conditionData.operator(Conditions.GroupConditionOperatorAnd);
                    }
                };

                return conditionData;
            }

            /**
             * Serializes condition data
             * 
             * @param {object} conditionData Condition data
             * @returns {object} Serialized data
             */
            Conditions.GroupCondition.prototype.serializeConditionData = function(conditionData) {
                var serializedData = {
                    operator: conditionData.operator(),
                    conditionElements: []
                };

                var conditionElements = conditionData.conditionElements();
                for(var curElement = 0; curElement < conditionElements.length; ++curElement)
                {
                    var element = Conditions.getConditionManager().serializeConditionElement(conditionElements[curElement]);
                    serializedData.conditionElements.push(element);
                }
                return serializedData;
            }

            /**
             * Returns the objects on which an object depends
             * 
             * @param {object} existingData Existing condition data
             * @returns {object[]} Objects on which the condition depends
             */
            Conditions.GroupCondition.prototype.getConditionDependsOnObject = function(existingData) {
                return Conditions.getConditionManager().getConditionElementsDependsOnObject(existingData.conditionElements);
            }


            /**
             * Returns the condition data as a display string
             * 
             * @param {object} existingData Serialzied condition data
             * @returns {jQuery.Deferred} Deferred for the loading process
             */
            Conditions.GroupCondition.prototype.getConditionString = function(existingData) {
                return Conditions.getConditionManager().getConditionString(existingData.conditionElements, existingData.operator == Conditions.GroupConditionOperatorAnd ? DefaultNodeShapes.Localization.Conditions.AndOperatorShort : DefaultNodeShapes.Localization.Conditions.OrOperatorShort, true);
            }

            Conditions.getConditionManager().addConditionType(new Conditions.GroupCondition());

        }(DefaultNodeShapes.Conditions = DefaultNodeShapes.Conditions || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Conditions) {

            /**
             * Check value condition
             * @class
             */
            Conditions.CheckValueCondition = function()
            {
                GoNorth.DefaultNodeShapes.Conditions.BaseCondition.apply(this);
                GoNorth.DefaultNodeShapes.Shapes.SharedObjectLoading.apply(this);

                this.fieldObjectId = "";
            };

            Conditions.CheckValueCondition.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.Conditions.BaseCondition.prototype);
            Conditions.CheckValueCondition.prototype = jQuery.extend(Conditions.CheckValueCondition.prototype, GoNorth.DefaultNodeShapes.Shapes.SharedObjectLoading.prototype);

            /**
             * Returns the template name for the condition
             * 
             * @returns {string} Template name
             */
            Conditions.CheckValueCondition.prototype.getTemplateName = function() {
                return "gn-nodeConditionValueCheck";
            };
            
            /**
             * Returns true if the condition can be selected in the dropdown list, else false
             * 
             * @returns {bool} true if the condition can be selected, else false
             */
            Conditions.CheckValueCondition.prototype.canBeSelected = function() {
                return true;
            };

            /**
             * Function to allow additional object condition data to be processed after loading
             * 
             * @param {object} conditionData Condition data build by calling buildConditionData before
             * @param {object} loadedObject Loaded object
             */
            Conditions.CheckValueCondition.prototype.processAditionalLoadedObjectConditionData = function(conditionData, loadedObject) {
                
            };

            /**
             * Returns the selected field, null if no field was found
             * 
             * @param {object} existingData Existing condition data
             * @param {objec[]} fields Flex fields
             * @returns {object} Selected field
             */
            Conditions.CheckValueCondition.prototype.getSelectedField = function(existingData, fields) {
                var selectedField = null;
                for(var curField = 0; curField < fields.length; ++curField)
                {
                    if(fields[curField].id == existingData.fieldId)
                    {
                        selectedField = fields[curField];
                        
                        if(fields[curField].name == existingData.fieldName)
                        {
                            break;
                        }
                    }
                }
                return selectedField;
            };

            
            /**
             * Returns the data for the condition without trying to load field data
             * 
             * @param {object} existingData Existing condition data
             * @param {object} element Element to which the data belongs
             * @returns {object} Condition data
             */
            Conditions.CheckValueCondition.prototype.buildConditionDataNoLoad = function(existingData, element) {
                var conditionData = {
                    selectedField: new ko.observable(),
                    operator: new ko.observable(),
                    compareValue: new ko.observable(),
                    availableFields: new ko.observable()
                };
                if(existingData)
                {
                    conditionData.compareValue(existingData.compareValue ? existingData.compareValue : null);
                }

                conditionData.validateInput = function(data, e) {
                    if(conditionData.selectedField().fieldType != GoNorth.FlexFieldDatabase.ObjectForm.FlexFieldTypeNumber)
                    {
                        return true;
                    }

                    var keypressValid = GoNorth.Util.validateNumberKeyPress(e.target, e);
                    return keypressValid;
                };

                conditionData.availableOperators = new ko.computed(function() {
                    if(!this.selectedField())
                    {
                        return [];
                    }

                    var operators = [ "=", "!=", "contains", "startsWith", "endsWith" ];
                    if(this.selectedField().fieldType == GoNorth.FlexFieldDatabase.ObjectForm.FlexFieldTypeNumber)
                    {
                        operators = [ "=", "!=", "<=", "<", ">=", ">" ];
                    }
                    return operators;
                }, conditionData);

                conditionData.selectedField.subscribe(function() {
                    if(conditionData.selectedField().fieldType != GoNorth.FlexFieldDatabase.ObjectForm.FlexFieldTypeNumber)
                    {
                        return;
                    }

                    var parsedValue =  parseFloat(conditionData.compareValue());
                    if(isNaN(parsedValue))
                    {
                        conditionData.compareValue("0");
                    }
                });

                return conditionData;
            };

            /**
             * Returns the data for the condition
             * 
             * @param {object} existingData Existing condition data
             * @param {object} element Element to which the data belongs
             * @returns {object} Condition data
             */
            Conditions.CheckValueCondition.prototype.buildConditionData = function(existingData, element) {
                var conditionData = this.buildConditionDataNoLoad(existingData, element);

                // Load field data
                if(this.canLoadFieldObject(existingData))
                {
                    this.loadAndParseFields(conditionData, existingData, element);
                }

                return conditionData;
            };
            
            /**
             * Returns true if the field object can be loaded, else false
             * 
             * @param {object} existingData Existing data
             * @returns {bool} true if the object can be loaded, else false
             */
            Conditions.CheckValueCondition.prototype.canLoadFieldObject = function(existingData) {
                return true;
            }

            /**
             * Loads and parses the fields for the condition dialog
             * 
             * @param {object} conditionData Condition Data 
             * @param {object} existingData Existing Data
             * @param {object} element Element
             */
            Conditions.CheckValueCondition.prototype.loadAndParseFields = function(conditionData, existingData, element)
            {
                var self = this;
                this.loadObjectShared(existingData).then(function(fieldObject) {
                    if(!fieldObject)
                    {
                        return;
                    }

                    self.fieldObjectId = fieldObject.id;
                    var filteredFields = GoNorth.Util.getFilteredFieldsForScript(fieldObject.fields);
                    for(var curField = 0; curField < filteredFields.length; ++curField)
                    {
                        var displayName = filteredFields[curField].name + " (";
                        if(filteredFields[curField].fieldType == GoNorth.FlexFieldDatabase.ObjectForm.FlexFieldTypeNumber)
                        {
                            displayName += DefaultNodeShapes.Localization.Conditions.NumberField;
                        }
                        else
                        {
                            displayName += DefaultNodeShapes.Localization.Conditions.TextField;
                        }
                        displayName += ")";
                        filteredFields[curField].displayName = displayName;
                    }

                    conditionData.availableFields(filteredFields);
                    
                    // Load old data
                    if(existingData)
                    {
                        var selectedField = self.getSelectedField(existingData, filteredFields);
                        if(selectedField)
                        {
                            conditionData.selectedField(selectedField);
                        }
                        conditionData.operator(existingData.operator ? existingData.operator : null);
                    }

                    // Additional processing
                    self.processAditionalLoadedObjectConditionData(conditionData, fieldObject);
                }, function(err) {
                    element.errorOccured(true);
                });
            }

            /**
             * Serializes condition data
             * 
             * @param {object} conditionData Condition data
             * @returns {object} Serialized data
             */
            Conditions.CheckValueCondition.prototype.serializeConditionData = function(conditionData) {
                return {
                    fieldId: conditionData.selectedField() ? conditionData.selectedField().id : null,
                    fieldName: conditionData.selectedField() ? conditionData.selectedField().name : null,
                    operator: conditionData.operator(),
                    compareValue: conditionData.compareValue() ? conditionData.compareValue() : null
                };
            };

            /**
             * Returns the object id for dependency checks
             * 
             * @param {object} existingData Existing condition data
             * @returns {string} Object Id on which the condition depends
             */
            Conditions.CheckValueCondition.prototype.getDependsOnObjectId = function(existingData) {
                return this.fieldObjectId;
            };

            /**
             * Returns the objects on which an object depends
             * 
             * @param {object} existingData Existing condition data
             * @returns {object[]} Objects on which the condition depends
             */
            Conditions.CheckValueCondition.prototype.getConditionDependsOnObject = function(existingData) {
                var objectId = this.getDependsOnObjectId(existingData);

                return [{
                    objectType: this.getObjectTypeName(),
                    objectId: objectId
                }];
            }

            /**
             * Returns the object type name. Used for dependency objects
             * 
             * @returns {string} Object Type name used for depends on objects 
             */
            Conditions.CheckValueCondition.prototype.getObjectTypeName = function() {

            };

            /**
             * Returns the title of the field object used in the string representation
             * 
             * @param {object} loadedFieldObject Loaded Field object for returning name if necessary
             * @returns {string} Title of the field object
             */
            Conditions.CheckValueCondition.prototype.getObjectTitle = function(loadedFieldObject) {
                
            };

            /**
             * Returns the condition data as a display string
             * 
             * @param {object} existingData Serialized condition data
             * @returns {jQuery.Deferred} Deferred for the loading process
             */
            Conditions.CheckValueCondition.prototype.getConditionString = function(existingData) {
                var def = new jQuery.Deferred();
                
                // Check if data is valid
                if(!this.canLoadFieldObject(existingData) || existingData.fieldId == null)
                {
                    def.resolve(DefaultNodeShapes.Localization.Conditions.MissingInformations);
                    return def.promise();
                }

                // Load data and build string
                var self = this;
                this.loadObjectShared(existingData).then(function(fieldObject) {
                    self.fieldObjectId = fieldObject.id;
                    var filteredFields = GoNorth.Util.getFilteredFieldsForScript(fieldObject.fields);
                    var selectedField = self.getSelectedField(existingData, filteredFields);
                    if(!selectedField)
                    {
                        def.reject(DefaultNodeShapes.Localization.Conditions.FieldWasDeleted);
                        return;
                    }

                    var conditionText = self.getObjectTitle(fieldObject) + "(\"" + selectedField.name + "\") " + existingData.operator + " ";
                    var isNumberField = selectedField.fieldType == GoNorth.FlexFieldDatabase.ObjectForm.FlexFieldTypeNumber;
                    var emptyValue = "0";
                    if(!isNumberField)
                    {
                        conditionText += "\"";
                        emptyValue = "";
                    }
                    conditionText += existingData.compareValue ? existingData.compareValue : emptyValue;
                    if(!isNumberField)
                    {
                        conditionText += "\"";
                    }

                    def.resolve(conditionText);
                }, function() {
                    def.reject();
                });

                return def.promise();
            };

        }(DefaultNodeShapes.Conditions = DefaultNodeShapes.Conditions || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Conditions) {

            /// Condition Type for checking the player value
            var conditionTypeCheckPlayerValue = 2;

            /**
             * Check player value condition
             * @class
             */
            Conditions.CheckPlayerValueCondition = function()
            {
                GoNorth.DefaultNodeShapes.Conditions.CheckValueCondition.apply(this);
            };

            Conditions.CheckPlayerValueCondition.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.Conditions.CheckValueCondition.prototype);

            /**
             * Returns the type of the condition
             * 
             * @returns {number} Type of the condition
             */
            Conditions.CheckPlayerValueCondition.prototype.getType = function() {
                return conditionTypeCheckPlayerValue;
            };

            /**
             * Returns the label of the condition
             * 
             * @returns {string} Label of the condition
             */
            Conditions.CheckPlayerValueCondition.prototype.getLabel = function() {
                return DefaultNodeShapes.Localization.Conditions.CheckPlayerValueLabel;
            };

            /**
             * Returns the title of the field object used in the string representation
             * 
             * @param {object} loadedFieldObject Loaded Field object for returning name if necessary
             * @returns {string} Title of the field object
             */
            Conditions.CheckPlayerValueCondition.prototype.getObjectTitle = function(loadedFieldObject) {
                return DefaultNodeShapes.Localization.Conditions.PlayerLabel;
            };

            /**
             * Returns the object type name. Used for dependency objects
             * 
             * @returns {string} Object Type name used for depends on objects 
             */
            Conditions.CheckPlayerValueCondition.prototype.getObjectTypeName = function() {
                return "Npc";
            };

            /**
             * Returns the object resource
             * 
             * @returns {int} Object Resource
             */
            Conditions.CheckPlayerValueCondition.prototype.getObjectId = function() {
                return "PlayerNpc";
            };

            /**
             * Returns the object resource
             * 
             * @returns {int} Object Resource
             */
            Conditions.CheckPlayerValueCondition.prototype.getObjectResource = function() {
                return GoNorth.DefaultNodeShapes.Shapes.ObjectResourceNpc;
            };

            /**
             * Loads the npc
             * 
             * @returns {jQuery.Deferred} Deferred for the async process
             */
            Conditions.CheckPlayerValueCondition.prototype.loadObject = function() {
                var def = new jQuery.Deferred();
                
                var self = this;
                jQuery.ajax({ 
                    url: "/api/KortistoApi/PlayerNpc", 
                    type: "GET"
                }).done(function(data) {
                    def.resolve(data);
                }).fail(function(xhr) {
                    def.reject();
                });

                return def.promise();
            };


            GoNorth.DefaultNodeShapes.Conditions.getConditionManager().addConditionType(new Conditions.CheckPlayerValueCondition());

        }(DefaultNodeShapes.Conditions = DefaultNodeShapes.Conditions || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(Tale) {
        (function(Conditions) {

            /// Condition Type for checking the npc value
            var conditionTypeCheckNpcValue = 3;

            /**
             * Check npc value condition
             * @class
             */
            Conditions.CheckNpcValueCondition = function()
            {
                GoNorth.DefaultNodeShapes.Conditions.CheckValueCondition.apply(this);
            };

            Conditions.CheckNpcValueCondition.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.Conditions.CheckValueCondition.prototype);

            /**
             * Returns the type of the condition
             * 
             * @returns {number} Type of the condition
             */
            Conditions.CheckNpcValueCondition.prototype.getType = function() {
                return conditionTypeCheckNpcValue;
            };

            /**
             * Returns the label of the condition
             * 
             * @returns {string} Label of the condition
             */
            Conditions.CheckNpcValueCondition.prototype.getLabel = function() {
                return Tale.Localization.Conditions.CheckNpcValueLabel;
            };

            /**
             * Returns the title of the field object used in the string representation
             * 
             * @param {object} loadedFieldObject Loaded Field object for returning name if necessary
             * @returns {string} Title of the field object
             */
            Conditions.CheckNpcValueCondition.prototype.getObjectTitle = function(loadedFieldObject) {
                return Tale.Localization.Conditions.NpcLabel;
            };

            /**
             * Returns the object type name. Used for dependency objects
             * 
             * @returns {string} Object Type name used for depends on objects 
             */
            Conditions.CheckNpcValueCondition.prototype.getObjectTypeName = function() {
                return "Npc";
            };

            /**
             * Returns the object resource
             * 
             * @returns {int} Object Resource
             */
            Conditions.CheckNpcValueCondition.prototype.getObjectId = function() {
                return Tale.getCurrentRelatedObjectId();
            };

            /**
             * Returns the object resource
             * 
             * @returns {int} Object Resource
             */
            Conditions.CheckNpcValueCondition.prototype.getObjectResource = function() {
                return GoNorth.DefaultNodeShapes.Shapes.ObjectResourceNpc;
            };

            /**
             * Loads the npc
             * 
             * @returns {jQuery.Deferred} Deferred for the async process
             */
            Conditions.CheckNpcValueCondition.prototype.loadObject = function() {
                var def = new jQuery.Deferred();
                
                var self = this;
                jQuery.ajax({ 
                    url: "/api/KortistoApi/FlexFieldObject?id=" + Tale.getCurrentRelatedObjectId(), 
                    type: "GET"
                }).done(function(data) {
                    def.resolve(data);
                }).fail(function(xhr) {
                    def.reject();
                });

                return def.promise();
            };


            GoNorth.DefaultNodeShapes.Conditions.getConditionManager().addConditionType(new Conditions.CheckNpcValueCondition());

        }(Tale.Conditions = Tale.Conditions || {}));
    }(GoNorth.Tale = GoNorth.Tale || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Conditions) {

            /// Condition Type for checking the alive state of a npc to choose
            var conditionTypeCheckNpcAliveState = 9;


            /// Npc state alive
            var npcStateAlive = 0;

            /// Npc state dead
            var npcStateDead = 1;

            /// Npc state label lookup
            var npcStateLabelLookup = { };
            npcStateLabelLookup[npcStateAlive] = DefaultNodeShapes.Localization.Conditions.NpcAliveStateAlive;
            npcStateLabelLookup[npcStateDead] = DefaultNodeShapes.Localization.Conditions.NpcAliveStateDead;


            /**
             * Check npc alive state condition
             * @class
             */
            Conditions.CheckNpcAliveStateCondition = function()
            {
                GoNorth.DefaultNodeShapes.Conditions.BaseCondition.apply(this);
                GoNorth.DefaultNodeShapes.Shapes.SharedObjectLoading.apply(this);
            };

            Conditions.CheckNpcAliveStateCondition.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.Conditions.BaseCondition.prototype);
            Conditions.CheckNpcAliveStateCondition.prototype = jQuery.extend(Conditions.CheckNpcAliveStateCondition.prototype, GoNorth.DefaultNodeShapes.Shapes.SharedObjectLoading.prototype);

            /**
             * Returns the template name for the condition
             * 
             * @returns {string} Template name
             */
            Conditions.CheckNpcAliveStateCondition.prototype.getTemplateName = function() {
                return "gn-nodeNpcAliveStateCheck";
            };
            
            /**
             * Returns true if the condition can be selected in the dropdown list, else false
             * 
             * @returns {bool} true if the condition can be selected, else false
             */
            Conditions.CheckNpcAliveStateCondition.prototype.canBeSelected = function() {
                return true;
            };

            /**
             * Returns the type of the condition
             * 
             * @returns {number} Type of the condition
             */
            Conditions.CheckNpcAliveStateCondition.prototype.getType = function() {
                return conditionTypeCheckNpcAliveState;
            };

            /**
             * Returns the label of the condition
             * 
             * @returns {string} Label of the condition
             */
            Conditions.CheckNpcAliveStateCondition.prototype.getLabel = function() {
                return DefaultNodeShapes.Localization.Conditions.CheckNpcAliveStateLabel;
            };

            /**
             * Returns the objects on which an object depends
             * 
             * @param {object} existingData Existing condition data
             * @returns {object[]} Objects on which the condition depends
             */
            Conditions.CheckNpcAliveStateCondition.prototype.getConditionDependsOnObject = function(existingData) {
                if(!existingData.npcId)
                {
                    return [];
                }

                return [{
                    objectType: Conditions.RelatedToObjectNpc,
                    objectId: existingData.npcId
                }];
            };

            /**
             * Returns the object resource
             * 
             * @returns {int} Object Resource
             */
            Conditions.CheckNpcAliveStateCondition.prototype.getObjectResource = function() {
                return GoNorth.DefaultNodeShapes.Shapes.ObjectResourceNpc;
            };

            /**
             * Returns the object id from existing condition data for request caching
             * 
             * @param {object} existingData Existing condition data
             * @returns {string} Object Id for caching
             */
            Conditions.CheckNpcAliveStateCondition.prototype.getObjectId = function(existingData) {
                return existingData.npcId;
            };

            /**
             * Loads an npc
             * 
             * @param {string} npcId Npc Id
             * @returns {jQuery.Deferred} Deferred for the loading process
             */
            Conditions.CheckNpcAliveStateCondition.prototype.loadObject = function(npcId) {
                var loadingDef = new jQuery.Deferred();

                jQuery.ajax({ 
                    url: "/api/KortistoApi/FlexFieldObject?id=" + npcId, 
                    type: "GET"
                }).done(function(npc) {
                    loadingDef.resolve(npc);
                }).fail(function(xhr) {
                    loadingDef.reject();
                });

                return loadingDef;
            };

            /**
             * Creates a npc alive state object
             * 
             * @param {number} npcState Alive State of the npc
             * @returns {object} Npc Alive State object
             */
            Conditions.CheckNpcAliveStateCondition.prototype.createState = function(npcState)
            {
                return {
                    npcState: npcState,
                    label: npcStateLabelLookup[npcState]
                };
            };
            
            /**
             * Returns the data for the condition
             * 
             * @param {object} existingData Existing condition data
             * @param {object} element Element to which the data belongs
             * @returns {object} Condition data
             */
            Conditions.CheckNpcAliveStateCondition.prototype.buildConditionData = function(existingData, element) {
                var conditionData = {
                    selectedNpcId: new ko.observable(),
                    selectedNpcName: new ko.observable(DefaultNodeShapes.Localization.Conditions.ChooseNpcLabel),
                    selectedNpcState: new ko.observable(),
                    npcStates: [ 
                        this.createState(npcStateAlive),
                        this.createState(npcStateDead)
                    ]
                };

                conditionData.chooseNpc = function() {
                    GoNorth.DefaultNodeShapes.openNpcSearchDialog().then(function(npc) {
                        conditionData.selectedNpcId(npc.id);
                        conditionData.selectedNpcName(npc.name);
                    });
                };

                // Load existing data
                if(existingData)
                {
                    conditionData.selectedNpcId(existingData.npcId);
                    conditionData.selectedNpcState(existingData.state);

                    if(existingData.npcId) 
                    {
                        this.loadObjectShared(existingData).then(function(npc) {
                            conditionData.selectedNpcName(npc.name);
                        }, function() {
                            element.errorOccured(true);
                        });
                    }
                }

                return conditionData;
            };

            /**
             * Serializes condition data
             * 
             * @param {object} conditionData Condition data
             * @returns {object} Serialized data
             */
            Conditions.CheckNpcAliveStateCondition.prototype.serializeConditionData = function(conditionData) {
                return {
                    npcId: conditionData.selectedNpcId(),
                    state: conditionData.selectedNpcState()
                };
            };

            /**
             * Returns the condition data as a display string
             * 
             * @param {object} existingData Serialzied condition data
             * @returns {jQuery.Deferred} Deferred for the loading process
             */
            Conditions.CheckNpcAliveStateCondition.prototype.getConditionString = function(existingData) {
                var def = new jQuery.Deferred();
                
                // Check if data is valid
                if(!existingData.npcId)
                {
                    def.resolve(DefaultNodeShapes.Localization.Conditions.MissingInformations);
                    return def.promise();
                }

                // Load data and build string
                var self = this;
                this.loadObjectShared(existingData).then(function(npc) {
                    var conditionText = DefaultNodeShapes.Localization.Conditions.StateLabel + "(" + npc.name + ") = " + npcStateLabelLookup[existingData.state];

                    def.resolve(conditionText);
                }, function() {
                    def.reject();
                });

                return def.promise();
            };

            GoNorth.DefaultNodeShapes.Conditions.getConditionManager().addConditionType(new Conditions.CheckNpcAliveStateCondition());

        }(DefaultNodeShapes.Conditions = DefaultNodeShapes.Conditions || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(Tale) {
        (function(Conditions) {

            /// Operator for the has at least operation
            var inventoryOperatorHasAtLeast = 0;

            /// Operator for the has at maximum operation
            var inventoryOperatorHasAtMaximum = 1;

            /**
             * Check inventory condition
             * @class
             */
            Conditions.CheckInventoryCondition = function()
            {
                GoNorth.DefaultNodeShapes.Conditions.BaseCondition.apply(this);
            };

            Conditions.CheckInventoryCondition.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.Conditions.BaseCondition.prototype);

            /**
             * Returns the template name for the condition
             * 
             * @returns {string} Template name
             */
            Conditions.CheckInventoryCondition.prototype.getTemplateName = function() {
                return "gn-taleConditionInventoryCheck";
            };
            
            /**
             * Returns true if the condition can be selected in the dropdown list, else false
             * 
             * @returns {bool} true if the condition can be selected, else false
             */
            Conditions.CheckInventoryCondition.prototype.canBeSelected = function() {
                return true;
            };

            /**
             * Returns the name of an item
             * 
             * @param {string} itemId Id of the item
             * @returns {jQuery.Deferred} Deferred for the loading proccess
             */
            Conditions.CheckInventoryCondition.prototype.getItemName = function(itemId) {
                var def = new jQuery.Deferred();

                jQuery.ajax({ 
                    url: "/api/StyrApi/ResolveFlexFieldObjectNames", 
                    headers: GoNorth.Util.generateAntiForgeryHeader(),
                    data: JSON.stringify([ itemId ]), 
                    type: "POST",
                    contentType: "application/json"
                }).done(function(itemNames) {
                    if(itemNames.length == 0)
                    {
                        def.reject();
                        return;
                    }

                    def.resolve(itemNames[0].name);
                }).fail(function(xhr) {
                    def.reject();
                });

                return def.promise();
            };

            /**
             * Returns the data for the condition
             * 
             * @param {object} existingData Existing condition data
             * @param {object} element Element to which the data belongs
             * @returns {object} Condition data
             */
            Conditions.CheckInventoryCondition.prototype.buildConditionData = function(existingData, element) {
                var conditionData = {
                    selectedItemId: new ko.observable(),
                    selectedItemName: new ko.observable(Tale.Localization.Conditions.ChooseItem),
                    operator: new ko.observable(),
                    availableOperators: [ { value: inventoryOperatorHasAtLeast, title: Tale.Localization.Conditions.ItemOperatorHasAtLeast }, { value: inventoryOperatorHasAtMaximum, title: Tale.Localization.Conditions.ItemOperatorHasMaximum }],
                    quantity: new ko.observable(0)
                };

                if(existingData)
                {
                    conditionData.selectedItemId(existingData.itemId);
                    conditionData.operator(existingData.operator);
                    conditionData.quantity(existingData.quantity);

                    this.getItemName(existingData.itemId).then(function(name) {
                        conditionData.selectedItemName(name);
                    }, function() {
                        element.errorOccured(true);
                    });
                }

                conditionData.chooseItem = function() {
                    Tale.openItemSearchDialog().then(function(item) {
                        conditionData.selectedItemId(item.id);
                        conditionData.selectedItemName(item.name);
                    });
                };
                
                return conditionData;
            };
            
            /**
             * Serializes condition data
             * 
             * @param {object} conditionData Condition data
             * @returns {object} Serialized data
             */
            Conditions.CheckInventoryCondition.prototype.serializeConditionData = function(conditionData) {
                var quantity = parseInt(conditionData.quantity());
                if(isNaN(quantity))
                {
                    quantity = 0;
                }

                return {
                    itemId: conditionData.selectedItemId(),
                    operator: conditionData.operator(),
                    quantity: quantity
                };
            };

            /**
             * Returns the objects on which an object depends
             * 
             * @param {object} existingData Existing condition data
             * @returns {object[]} Objects on which the condition depends
             */
            Conditions.CheckInventoryCondition.prototype.getConditionDependsOnObject = function(existingData) {
                return [{
                    objectType: Conditions.RelatedToObjectItem,
                    objectId: existingData.itemId
                }];
            }

            /**
             * Returns the title of the inventory
             * 
             * @returns {string} Title of the inventory
             */
            Conditions.CheckInventoryCondition.prototype.getInventoryTitle = function() {
                
            };

            /**
             * Returns the condition data as a display string
             * 
             * @param {object} existingData Serialzied condition data
             * @returns {jQuery.Deferred} Deferred for the loading process
             */
            Conditions.CheckInventoryCondition.prototype.getConditionString = function(existingData) {
                var def = new jQuery.Deferred();
                if(!existingData.itemId)
                {
                    def.resolve(Tale.Localization.Conditions.ChooseItem);
                    return def.promise();
                }

                var self = this;
                this.getItemName(existingData.itemId).then(function(name) {
                    var conditionString = self.getInventoryTitle() + " " + Tale.Localization.Conditions.ItemCount + "(\"" + name + "\") ";
                    if(existingData.operator == inventoryOperatorHasAtLeast)
                    {
                        conditionString += ">=";
                    }
                    else if(existingData.operator == inventoryOperatorHasAtMaximum)
                    {
                        conditionString += "<=";
                    }
                    conditionString += " " + existingData.quantity;

                    def.resolve(conditionString);
                }, function() {
                    def.reject();
                });

                return def.promise();
            }

        }(Tale.Conditions = Tale.Conditions || {}));
    }(GoNorth.Tale = GoNorth.Tale || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(Tale) {
        (function(Conditions) {

            /// Condition Type for checking the player inventory
            var conditionTypeCheckPlayerInventory = 4;

            /**
             * Check player inventory condition
             * @class
             */
            Conditions.CheckPlayerInventoryCondition = function()
            {
                Conditions.CheckInventoryCondition.apply(this);
            };

            Conditions.CheckPlayerInventoryCondition.prototype = jQuery.extend({ }, Conditions.CheckInventoryCondition.prototype);

            /**
             * Returns the type of the condition
             * 
             * @returns {number} Type of the condition
             */
            Conditions.CheckPlayerInventoryCondition.prototype.getType = function() {
                return conditionTypeCheckPlayerInventory;
            };

            /**
             * Returns the label of the condition
             * 
             * @returns {string} Label of the condition
             */
            Conditions.CheckPlayerInventoryCondition.prototype.getLabel = function() {
                return Tale.Localization.Conditions.CheckPlayerInventoryLabel;
            };

            /**
             * Returns the title of the inventory
             * 
             * @returns {string} Title of the inventory
             */
            Conditions.CheckPlayerInventoryCondition.prototype.getInventoryTitle = function() {
                return Tale.Localization.Conditions.PlayerInventoryLabel;
            };


            GoNorth.DefaultNodeShapes.Conditions.getConditionManager().addConditionType(new Conditions.CheckPlayerInventoryCondition());

        }(Tale.Conditions = Tale.Conditions || {}));
    }(GoNorth.Tale = GoNorth.Tale || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(Tale) {
        (function(Conditions) {

            /// Condition Type for checking the npc inventory
            var conditionTypeCheckNpcInventory = 5;

            /**
             * Check npc inventory condition
             * @class
             */
            Conditions.CheckNpcInventoryCondition = function()
            {
                Conditions.CheckInventoryCondition.apply(this);
            };

            Conditions.CheckNpcInventoryCondition.prototype = jQuery.extend({ }, Conditions.CheckInventoryCondition.prototype);

            /**
             * Returns the type of the condition
             * 
             * @returns {number} Type of the condition
             */
            Conditions.CheckNpcInventoryCondition.prototype.getType = function() {
                return conditionTypeCheckNpcInventory;
            };

            /**
             * Returns the label of the condition
             * 
             * @returns {string} Label of the condition
             */
            Conditions.CheckNpcInventoryCondition.prototype.getLabel = function() {
                return Tale.Localization.Conditions.CheckNpcInventoryLabel;
            };

            /**
             * Returns the title of the inventory
             * 
             * @returns {string} Title of the inventory
             */
            Conditions.CheckNpcInventoryCondition.prototype.getInventoryTitle = function() {
                return Tale.Localization.Conditions.NpcInventoryLabel;
            };


            GoNorth.DefaultNodeShapes.Conditions.getConditionManager().addConditionType(new Conditions.CheckNpcInventoryCondition());

        }(Tale.Conditions = Tale.Conditions || {}));
    }(GoNorth.Tale = GoNorth.Tale || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Conditions) {

            /**
             * Check current quest value condition
             * @class
             */
            Conditions.CheckChooseObjectValueCondition = function()
            {
                DefaultNodeShapes.Conditions.CheckValueCondition.apply(this);
            };

            Conditions.CheckChooseObjectValueCondition.prototype = jQuery.extend({ }, DefaultNodeShapes.Conditions.CheckValueCondition.prototype);

            /**
             * Opens the object search dialog
             * 
             * @returns {jQuery.Deferred} Deferred for the choosing process
             */
            Conditions.CheckChooseObjectValueCondition.prototype.openObjectSearchDialog = function() {

            };

            /**
             * Returns the label used if no object name is selected to prompt the user to choose an object
             * 
             * @returns {string} Label used if no object name is selected to prompt the user to choose an object
             */
            Conditions.CheckChooseObjectValueCondition.prototype.getChooseObjectLabel = function() {

            };

            /**
             * Returns the template name for the condition
             * 
             * @returns {string} Template name
             */
            Conditions.CheckChooseObjectValueCondition.prototype.getTemplateName = function() {
                return "gn-nodeConditionChooseObjectValueCheck";
            };

            /**
             * Returns true if the field object can be loaded, else false
             * 
             * @param {object} existingData Existing data
             * @returns {bool} true if the object can be loaded, else false
             */
            Conditions.CheckChooseObjectValueCondition.prototype.canLoadFieldObject = function(existingData) {
                return existingData && existingData.selectedObjectId;
            }

            /**
             * Function to allow additional object condition data to be processed after loading
             * 
             * @param {object} conditionData Condition data build by calling buildConditionData before
             * @param {object} loadedObject Loaded object
             */
            Conditions.CheckChooseObjectValueCondition.prototype.processAditionalLoadedObjectConditionData = function(conditionData, loadedObject) {
                conditionData.selectedObjectName(loadedObject.name);                
            };

            /**
             * Returns the object id for dependency checks
             * 
             * @param {object} existingData Existing condition data
             * @returns {string} Object Id on which the condition depends
             */
            Conditions.CheckChooseObjectValueCondition.prototype.getDependsOnObjectId = function(existingData) {
                return this.getObjectId(existingData);
            };

            /**
             * Returns the object id from existing condition data for request caching
             * 
             * @param {object} existingData Existing condition data
             * @returns {string} Object Id for caching
             */
            Conditions.CheckChooseObjectValueCondition.prototype.getObjectId = function(existingData) {
                return existingData.selectedObjectId;
            };

            /**
             * Returns the data for the condition
             * 
             * @param {object} existingData Existing condition data
             * @param {object} element Element to which the data belongs
             * @returns {object} Condition data
             */
            Conditions.CheckChooseObjectValueCondition.prototype.buildConditionData = function(existingData, element) {
                var conditionData = Conditions.CheckValueCondition.prototype.buildConditionDataNoLoad.apply(this, [existingData, element]);

                conditionData.selectedObjectId = new ko.observable("");
                conditionData.selectedObjectName = new ko.observable(this.getChooseObjectLabel());

                if(existingData)
                {
                    conditionData.selectedObjectId(existingData.selectedObjectId);
                }

                var self = this;
                conditionData.chooseObject = function() {
                    self.openObjectSearchDialog().then(function(chosenObject) {
                        conditionData.selectedObjectId(chosenObject.id);
                        conditionData.selectedObjectName(chosenObject.name);

                        var updatedExistingData = self.serializeConditionData(conditionData);
                        self.loadAndParseFields(conditionData, updatedExistingData, element);
                    });
                };

                // Load field data
                if(this.canLoadFieldObject(existingData))
                {
                    this.loadAndParseFields(conditionData, existingData, element);
                }

                return conditionData;
            };

            /**
             * Serializes condition data
             * 
             * @param {object} conditionData Condition data
             * @returns {object} Serialized data
             */
            Conditions.CheckChooseObjectValueCondition.prototype.serializeConditionData = function(conditionData) {
                var serializedData = Conditions.CheckValueCondition.prototype.serializeConditionData.apply(this, [conditionData]);
                
                serializedData.selectedObjectId = conditionData.selectedObjectId();

                return serializedData;
            };

        }(DefaultNodeShapes.Conditions = DefaultNodeShapes.Conditions || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Conditions) {

            /// Condition Type for checking value of a quest to choose
            var conditionTypeCheckChooseQuestValue = 7;

            /**
             * Check quest value condition where quest is chosen
             * @class
             */
            Conditions.CheckChooseQuestValueCondition = function()
            {
                DefaultNodeShapes.Conditions.CheckChooseObjectValueCondition.apply(this);
            };

            Conditions.CheckChooseQuestValueCondition.prototype = jQuery.extend({ }, DefaultNodeShapes.Conditions.CheckChooseObjectValueCondition.prototype);

            /**
             * Returns the type of the condition
             * 
             * @returns {number} Type of the condition
             */
            Conditions.CheckChooseQuestValueCondition.prototype.getType = function() {
                return conditionTypeCheckChooseQuestValue;
            };

            /**
             * Returns the label of the condition
             * 
             * @returns {string} Label of the condition
             */
            Conditions.CheckChooseQuestValueCondition.prototype.getLabel = function() {
                return DefaultNodeShapes.Localization.Conditions.CheckChooseQuestValueLabel;
            };

            /**
             * Returns the title of the field object used in the string representation
             * 
             * @param {object} loadedFieldObject Loaded Field object for returning name if necessary
             * @returns {string} Title of the field object
             */
            Conditions.CheckChooseQuestValueCondition.prototype.getObjectTitle = function(loadedFieldObject) {
                return loadedFieldObject.name;
            };

            /**
             * Opens the object search dialog
             * 
             * @returns {jQuery.Deferred} Deferred for the choosing process
             */
            Conditions.CheckChooseQuestValueCondition.prototype.openObjectSearchDialog = function() {
                return GoNorth.DefaultNodeShapes.openQuestSearchDialog();
            };

            
            /**
             * Returns the label used if no object name is selected to prompt the user to choose an object
             * 
             * @returns {string} Label used if no object name is selected to prompt the user to choose an object
             */
            Conditions.CheckChooseQuestValueCondition.prototype.getChooseObjectLabel = function() {
                return DefaultNodeShapes.Localization.Conditions.ChooseQuestLabel;
            };

            /**
             * Returns the object type name. Used for dependency objects
             * 
             * @returns {string} Object Type name used for depends on objects 
             */
            Conditions.CheckChooseQuestValueCondition.prototype.getObjectTypeName = function() {
                return Conditions.RelatedToObjectQuest;
            };

            /**
             * Returns the object resource
             * 
             * @returns {int} Object Resource
             */
            Conditions.CheckChooseQuestValueCondition.prototype.getObjectResource = function() {
                return GoNorth.DefaultNodeShapes.Shapes.ObjectResourceQuest;
            };

            /**
             * Loads the quest
             * 
             * @param {object} objectId Optional object id
             * @returns {jQuery.Deferred} Deferred for the async process
             */
            Conditions.CheckChooseQuestValueCondition.prototype.loadObject = function(objectId) {
                var def = new jQuery.Deferred();
                
                jQuery.ajax({ 
                    url: "/api/AikaApi/GetQuest?id=" + objectId, 
                    type: "GET"
                }).done(function(data) {
                    def.resolve(data);
                }).fail(function(xhr) {
                    def.reject();
                });

                return def.promise();
            };

            GoNorth.DefaultNodeShapes.Conditions.getConditionManager().addConditionType(new Conditions.CheckChooseQuestValueCondition());

        }(DefaultNodeShapes.Conditions = DefaultNodeShapes.Conditions || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Conditions) {

            /// Condition Type for checking the state of a quest to choose
            var conditionTypeCheckChooseQuestState = 8;
            
            /**
             * Check quest state condition
             * @class
             */
            Conditions.CheckQuestStateCondition = function()
            {
                GoNorth.DefaultNodeShapes.Conditions.BaseCondition.apply(this);
                GoNorth.DefaultNodeShapes.Shapes.SharedObjectLoading.apply(this);
            };

            Conditions.CheckQuestStateCondition.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.Conditions.BaseCondition.prototype);
            Conditions.CheckQuestStateCondition.prototype = jQuery.extend(Conditions.CheckQuestStateCondition.prototype, GoNorth.DefaultNodeShapes.Shapes.SharedObjectLoading.prototype);

            /**
             * Returns the template name for the condition
             * 
             * @returns {string} Template name
             */
            Conditions.CheckQuestStateCondition.prototype.getTemplateName = function() {
                return "gn-nodeQuestStateCheck";
            };
            
            /**
             * Returns true if the condition can be selected in the dropdown list, else false
             * 
             * @returns {bool} true if the condition can be selected, else false
             */
            Conditions.CheckQuestStateCondition.prototype.canBeSelected = function() {
                return true;
            };

            /**
             * Returns the type of the condition
             * 
             * @returns {number} Type of the condition
             */
            Conditions.CheckQuestStateCondition.prototype.getType = function() {
                return conditionTypeCheckChooseQuestState;
            };

            /**
             * Returns the label of the condition
             * 
             * @returns {string} Label of the condition
             */
            Conditions.CheckQuestStateCondition.prototype.getLabel = function() {
                return DefaultNodeShapes.Localization.Conditions.CheckQuestStateLabel;
            };

            /**
             * Returns the objects on which an object depends
             * 
             * @param {object} existingData Existing condition data
             * @returns {object[]} Objects on which the condition depends
             */
            Conditions.CheckQuestStateCondition.prototype.getConditionDependsOnObject = function(existingData) {
                if(!existingData.questId)
                {
                    return [];
                }

                return [{
                    objectType: Conditions.RelatedToObjectQuest,
                    objectId: existingData.questId
                }];
            };

            /**
             * Returns the object resource
             * 
             * @returns {int} Object Resource
             */
            Conditions.CheckQuestStateCondition.prototype.getObjectResource = function() {
                return GoNorth.DefaultNodeShapes.Shapes.ObjectResourceQuest;
            };

            /**
             * Returns the object id from existing condition data for request caching
             * 
             * @param {object} existingData Existing condition data
             * @returns {string} Object Id for caching
             */
            Conditions.CheckQuestStateCondition.prototype.getObjectId = function(existingData) {
                return existingData.questId;
            };

            /**
             * Loads a quest
             * 
             * @param {string} questId Quest Id
             * @returns {jQuery.Deferred} Deferred for the loading process
             */
            Conditions.CheckQuestStateCondition.prototype.loadObject = function(questId) {
                var loadingDef = new jQuery.Deferred();

                jQuery.ajax({ 
                    url: "/api/AikaApi/GetQuest?id=" + questId, 
                    type: "GET"
                }).done(function(quest) {
                    loadingDef.resolve(quest);
                }).fail(function(xhr) {
                    loadingDef.reject();
                });

                return loadingDef;
            };
            
            /**
             * Returns the data for the condition
             * 
             * @param {object} existingData Existing condition data
             * @param {object} element Element to which the data belongs
             * @returns {object} Condition data
             */
            Conditions.CheckQuestStateCondition.prototype.buildConditionData = function(existingData, element) {
                var conditionData = {
                    selectedQuestId: new ko.observable(),
                    selectedQuestName: new ko.observable(DefaultNodeShapes.Localization.Conditions.ChooseQuestLabel),
                    selectedQuestState: new ko.observable(),
                    questStates: DefaultNodeShapes.Shapes.getQuestStates()
                };

                conditionData.chooseQuest = function() {
                    GoNorth.DefaultNodeShapes.openQuestSearchDialog().then(function(quest) {
                        conditionData.selectedQuestId(quest.id);
                        conditionData.selectedQuestName(quest.name);
                    });
                };

                // Load existing data
                if(existingData)
                {
                    conditionData.selectedQuestId(existingData.questId);
                    conditionData.selectedQuestState(existingData.state)

                    if(existingData.questId) 
                    {
                        this.loadObjectShared(existingData).then(function(quest) {
                            conditionData.selectedQuestName(quest.name);
                        }, function() {
                            element.errorOccured(true);
                        });
                    }
                }

                return conditionData;
            };

            /**
             * Serializes condition data
             * 
             * @param {object} conditionData Condition data
             * @returns {object} Serialized data
             */
            Conditions.CheckQuestStateCondition.prototype.serializeConditionData = function(conditionData) {
                return {
                    questId: conditionData.selectedQuestId(),
                    state: conditionData.selectedQuestState()
                };
            };

            /**
             * Returns the condition data as a display string
             * 
             * @param {object} existingData Serialzied condition data
             * @returns {jQuery.Deferred} Deferred for the loading process
             */
            Conditions.CheckQuestStateCondition.prototype.getConditionString = function(existingData) {
                var def = new jQuery.Deferred();
                
                // Check if data is valid
                if(!existingData.questId)
                {
                    def.resolve(DefaultNodeShapes.Localization.Conditions.MissingInformations);
                    return def.promise();
                }

                // Load data and build string
                var self = this;
                this.loadObjectShared(existingData).then(function(quest) {
                    var conditionText = DefaultNodeShapes.Localization.Conditions.StateLabel + "(" + quest.name + ") = " + DefaultNodeShapes.Shapes.getQuestStateLabel(existingData.state);

                    def.resolve(conditionText);
                }, function() {
                    def.reject();
                });

                return def.promise();
            };

            GoNorth.DefaultNodeShapes.Conditions.getConditionManager().addConditionType(new Conditions.CheckQuestStateCondition());

        }(DefaultNodeShapes.Conditions = DefaultNodeShapes.Conditions || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Conditions) {

            /// Condition Type for checking the game time
            var conditionTypeCheckGameTime = 12;

            /// Game time Operator before
            var gameTimeOperatorBefore = 0;

            /// Game time Operator after
            var gameTimeOperatorAfter = 1;

            /// Game time operator label lookup
            var gameTimeOperatorLabelLookup = { };
            gameTimeOperatorLabelLookup[gameTimeOperatorBefore] = DefaultNodeShapes.Localization.Conditions.GameTimeOperatorBefore;
            gameTimeOperatorLabelLookup[gameTimeOperatorAfter] = DefaultNodeShapes.Localization.Conditions.GameTimeOperatorAfter;

            /**
             * Check game time condition
             * @class
             */
            Conditions.CheckGameTimeCondition = function()
            {
                GoNorth.DefaultNodeShapes.Conditions.BaseCondition.apply(this);
            };

            Conditions.CheckGameTimeCondition.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.Conditions.BaseCondition.prototype);

            /**
             * Returns the template name for the condition
             * 
             * @returns {string} Template name
             */
            Conditions.CheckGameTimeCondition.prototype.getTemplateName = function() {
                return "gn-nodeGameTimeCheck";
            };
            
            /**
             * Returns true if the condition can be selected in the dropdown list, else false
             * 
             * @returns {bool} true if the condition can be selected, else false
             */
            Conditions.CheckGameTimeCondition.prototype.canBeSelected = function() {
                return true;
            };

            /**
             * Returns the type of the condition
             * 
             * @returns {number} Type of the condition
             */
            Conditions.CheckGameTimeCondition.prototype.getType = function() {
                return conditionTypeCheckGameTime;
            };

            /**
             * Returns the label of the condition
             * 
             * @returns {string} Label of the condition
             */
            Conditions.CheckGameTimeCondition.prototype.getLabel = function() {
                return DefaultNodeShapes.Localization.Conditions.CheckGameTimeLabel;
            };

            /**
             * Returns the objects on which an object depends
             * 
             * @param {object} existingData Existing condition data
             * @returns {object[]} Objects on which the condition depends
             */
            Conditions.CheckGameTimeCondition.prototype.getConditionDependsOnObject = function(existingData) {
                return [];
            };

            /**
             * Creates a time operator object
             * 
             * @param {number} timeOperator Time operator
             * @returns {object} Time operator object
             */
            Conditions.CheckGameTimeCondition.prototype.createTimeOperator = function(timeOperator)
            {
                return {
                    operator: timeOperator,
                    label: gameTimeOperatorLabelLookup[timeOperator]
                };
            };

            /**
             * Returns the data for the condition
             * 
             * @param {object} existingData Existing condition data
             * @param {object} element Element to which the data belongs
             * @returns {object} Condition data
             */
            Conditions.CheckGameTimeCondition.prototype.buildConditionData = function(existingData, element) {
                var gameTimeHours = [];
                for(var curHour = 0; curHour < 24; ++curHour)
                {
                    gameTimeHours.push(curHour);
                }

                var gameTimeMinutes = [];
                for(var curMinute = 0; curMinute < 60; curMinute += 5)
                {
                    gameTimeMinutes.push(curMinute);
                }
                gameTimeMinutes.push(59);

                var conditionData = {
                    selectedGameTimeOperator: new ko.observable(),
                    selectedGameTimeHour: new ko.observable(),
                    selectedGameTimeMinutes: new ko.observable(),
                    gameTimeOperators: [
                        this.createTimeOperator(gameTimeOperatorBefore),
                        this.createTimeOperator(gameTimeOperatorAfter)
                    ],
                    gameTimeHours: gameTimeHours,
                    gameTimeMinutes: gameTimeMinutes
                };

                // Load existing data
                if(existingData)
                {
                    conditionData.selectedGameTimeOperator(existingData.operator);
                    conditionData.selectedGameTimeHour(existingData.hour);
                    conditionData.selectedGameTimeMinutes(existingData.minutes)
                }

                return conditionData;
            };

            /**
             * Serializes condition data
             * 
             * @param {object} conditionData Condition data
             * @returns {object} Serialized data
             */
            Conditions.CheckGameTimeCondition.prototype.serializeConditionData = function(conditionData) {
                return {
                    operator: conditionData.selectedGameTimeOperator(),
                    hour: conditionData.selectedGameTimeHour(),
                    minutes: conditionData.selectedGameTimeMinutes()
                };
            };

            /**
             * Returns the condition data as a display string
             * 
             * @param {object} existingData Serialzied condition data
             * @returns {jQuery.Deferred} Deferred for the loading process
             */
            Conditions.CheckGameTimeCondition.prototype.getConditionString = function(existingData) {
                var def = new jQuery.Deferred();
                
                var conditionString = DefaultNodeShapes.Localization.Conditions.GameTime;
                conditionString += " " + gameTimeOperatorLabelLookup[existingData.operator];
                conditionString += " " + this.formatTwoDigits(existingData.hour) + ":" + this.formatTwoDigits(existingData.minutes);
                def.resolve(conditionString);

                return def.promise();
            };

            /**
             * Formats a value as a two digit number
             * 
             * @param {number} number Number to format
             * @returns {string} Number as two digit
             */
            Conditions.CheckGameTimeCondition.prototype.formatTwoDigits = function(number) {
                if(!number) {
                    return "00";
                }

                var numberFormated = number.toString();
                if(numberFormated.length < 2)
                {
                    numberFormated = "0" + numberFormated;
                }

                return numberFormated;
            };

            GoNorth.DefaultNodeShapes.Conditions.getConditionManager().addConditionType(new Conditions.CheckGameTimeCondition());

        }(DefaultNodeShapes.Conditions = DefaultNodeShapes.Conditions || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Conditions) {

            /**
             * Check skill value condition where skill is chosen
             * @class
             */
            Conditions.CheckChooseSkillValueCondition = function()
            {
                DefaultNodeShapes.Conditions.CheckChooseObjectValueCondition.apply(this);
            };

            Conditions.CheckChooseSkillValueCondition.prototype = jQuery.extend({ }, DefaultNodeShapes.Conditions.CheckChooseObjectValueCondition.prototype);

            /**
             * Returns the skill prefix
             * 
             * @returns {string} Skill Prefix
             */
            Conditions.CheckChooseSkillValueCondition.prototype.getSkillPrefix = function() {
                return "";
            };

            /**
             * Returns the title of the field object used in the string representation
             * 
             * @param {object} loadedFieldObject Loaded Field object for returning name if necessary
             * @returns {string} Title of the field object
             */
            Conditions.CheckChooseSkillValueCondition.prototype.getObjectTitle = function(loadedFieldObject) {
                return this.getSkillPrefix() + loadedFieldObject.name;
            };

            /**
             * Opens the object search dialog
             * 
             * @returns {jQuery.Deferred} Deferred for the choosing process
             */
            Conditions.CheckChooseSkillValueCondition.prototype.openObjectSearchDialog = function() {
                return GoNorth.DefaultNodeShapes.openSkillSearchDialog();
            };

            
            /**
             * Returns the label used if no object name is selected to prompt the user to choose an object
             * 
             * @returns {string} Label used if no object name is selected to prompt the user to choose an object
             */
            Conditions.CheckChooseSkillValueCondition.prototype.getChooseObjectLabel = function() {
                return DefaultNodeShapes.Localization.Conditions.ChooseSkillLabel;
            };

            /**
             * Returns the object type name. Used for dependency objects
             * 
             * @returns {string} Object Type name used for depends on objects 
             */
            Conditions.CheckChooseSkillValueCondition.prototype.getObjectTypeName = function() {
                return Conditions.RelatedToObjectSkill;
            };

            /**
             * Returns the object resource
             * 
             * @returns {int} Object Resource
             */
            Conditions.CheckChooseSkillValueCondition.prototype.getObjectResource = function() {
                return GoNorth.DefaultNodeShapes.Shapes.ObjectResourceSkill;
            };

            /**
             * Loads the skill
             * 
             * @param {object} objectId Optional object id
             * @returns {jQuery.Deferred} Deferred for the async process
             */
            Conditions.CheckChooseSkillValueCondition.prototype.loadObject = function(objectId) {
                var def = new jQuery.Deferred();
                
                jQuery.ajax({ 
                    url: "/api/EvneApi/FlexFieldObject?id=" + objectId, 
                    type: "GET"
                }).done(function(data) {
                    def.resolve(data);
                }).fail(function(xhr) {
                    def.reject();
                });

                return def.promise();
            };

        }(DefaultNodeShapes.Conditions = DefaultNodeShapes.Conditions || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Conditions) {

            /// Condition Type for checking value of a skill to choose
            var conditionTypeCheckChoosePlayerSkillValue = 13;

            /**
             * Check player skill value condition where skill is chosen
             * @class
             */
            Conditions.CheckChoosePlayerSkillValueCondition = function()
            {
                DefaultNodeShapes.Conditions.CheckChooseSkillValueCondition.apply(this);
            };

            Conditions.CheckChoosePlayerSkillValueCondition.prototype = jQuery.extend({ }, DefaultNodeShapes.Conditions.CheckChooseSkillValueCondition.prototype);

            /**
             * Returns the skill prefix
             * 
             * @returns {string} Skill Prefix
             */
            Conditions.CheckChoosePlayerSkillValueCondition.prototype.getSkillPrefix = function() {
                return DefaultNodeShapes.Localization.Conditions.PlayerSkillPrefix;
            };

            /**
             * Returns the type of the condition
             * 
             * @returns {number} Type of the condition
             */
            Conditions.CheckChoosePlayerSkillValueCondition.prototype.getType = function() {
                return conditionTypeCheckChoosePlayerSkillValue;
            };

            /**
             * Returns the label of the condition
             * 
             * @returns {string} Label of the condition
             */
            Conditions.CheckChoosePlayerSkillValueCondition.prototype.getLabel = function() {
                return DefaultNodeShapes.Localization.Conditions.CheckChoosePlayerSkillValueLabel;
            };

            GoNorth.DefaultNodeShapes.Conditions.getConditionManager().addConditionType(new Conditions.CheckChoosePlayerSkillValueCondition());

        }(DefaultNodeShapes.Conditions = DefaultNodeShapes.Conditions || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(Tale) {
        (function(Conditions) {

            /// Condition Type for checking value of a skill to choose
            var conditionTypeCheckChooseNpcSkillValue = 14;

            /**
             * Check npc skill value condition where skill is chosen
             * @class
             */
            Conditions.CheckChooseNpcSkillValueCondition = function()
            {
                GoNorth.DefaultNodeShapes.Conditions.CheckChooseSkillValueCondition.apply(this);
            };

            Conditions.CheckChooseNpcSkillValueCondition.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.Conditions.CheckChooseSkillValueCondition.prototype);

            /**
             * Returns the skill prefix
             * 
             * @returns {string} Skill Prefix
             */
            Conditions.CheckChooseNpcSkillValueCondition.prototype.getSkillPrefix = function() {
                return Tale.Localization.Conditions.NpcSkillPrefix;
            };

            /**
             * Returns the type of the condition
             * 
             * @returns {number} Type of the condition
             */
            Conditions.CheckChooseNpcSkillValueCondition.prototype.getType = function() {
                return conditionTypeCheckChooseNpcSkillValue;
            };

            /**
             * Returns the label of the condition
             * 
             * @returns {string} Label of the condition
             */
            Conditions.CheckChooseNpcSkillValueCondition.prototype.getLabel = function() {
                return Tale.Localization.Conditions.CheckChooseNpcSkillValueLabel;
            };

            GoNorth.DefaultNodeShapes.Conditions.getConditionManager().addConditionType(new Conditions.CheckChooseNpcSkillValueCondition());

        }(Tale.Conditions = Tale.Conditions || {}));
    }(GoNorth.Tale = GoNorth.Tale || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Conditions) {

            /**
             * Checks if a skill is learned or not
             * @class
             */
            Conditions.CheckLearnedSkillCondition = function()
            {
                GoNorth.DefaultNodeShapes.Conditions.BaseCondition.apply(this);
                GoNorth.DefaultNodeShapes.Shapes.SharedObjectLoading.apply(this);
            };

            Conditions.CheckLearnedSkillCondition.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.Conditions.BaseCondition.prototype);
            Conditions.CheckLearnedSkillCondition.prototype = jQuery.extend(Conditions.CheckLearnedSkillCondition.prototype, GoNorth.DefaultNodeShapes.Shapes.SharedObjectLoading.prototype);

            /**
             * Returns the template name for the condition
             * 
             * @returns {string} Template name
             */
            Conditions.CheckLearnedSkillCondition.prototype.getTemplateName = function() {
                return "gn-nodeConditionChooseSkillCheck";
            };

            /**
             * Returns true if the condition can be selected in the dropdown list, else false
             * 
             * @returns {bool} true if the condition can be selected, else false
             */
            Conditions.CheckLearnedSkillCondition.prototype.canBeSelected = function() {
                return true;
            };

            /**
             * Returns the object id for dependency checks
             * 
             * @param {object} existingData Existing condition data
             * @returns {string} Object Id on which the condition depends
             */
            Conditions.CheckLearnedSkillCondition.prototype.getDependsOnObjectId = function(existingData) {
                return this.getObjectId(existingData);
            };

            /**
             * Returns the object id from existing condition data for request caching
             * 
             * @param {object} existingData Existing condition data
             * @returns {string} Object Id for caching
             */
            Conditions.CheckLearnedSkillCondition.prototype.getObjectId = function(existingData) {
                return existingData.selectedSkillId;
            };

            /**
             * Returns the object resource
             * 
             * @returns {int} Object Resource
             */
            Conditions.CheckLearnedSkillCondition.prototype.getObjectResource = function() {
                return GoNorth.DefaultNodeShapes.Shapes.ObjectResourceSkill;
            };

            /**
             * Returns the data for the condition
             * 
             * @param {object} existingData Existing condition data
             * @param {object} element Element to which the data belongs
             * @returns {object} Condition data
             */
            Conditions.CheckLearnedSkillCondition.prototype.buildConditionData = function(existingData, element) {
                var conditionData = {
                    selectedSkillId: new ko.observable(""),
                    selectedSkillName: new ko.observable(DefaultNodeShapes.Localization.Conditions.ChooseSkillLabel)
                }

                if(existingData)
                {
                    conditionData.selectedSkillId(existingData.selectedSkillId);
                }

                var self = this;
                conditionData.chooseSkill = function() {
                    GoNorth.DefaultNodeShapes.openSkillSearchDialog().then(function(chosenSkill) {
                        conditionData.selectedSkillId(chosenSkill.id);
                        conditionData.selectedSkillName(chosenSkill.name);
                    });
                };

                // Load field data
                if(existingData && existingData.selectedSkillId)
                {
                    this.loadObjectShared(existingData).then(function(skill) {
                        conditionData.selectedSkillName(skill.name);
                    }).fail(function(xhr) {
                        element.errorOccured(true);
                    });
                }

                return conditionData;
            };

            /**
             * Serializes condition data
             * 
             * @param {object} conditionData Condition data
             * @returns {object} Serialized data
             */
            Conditions.CheckLearnedSkillCondition.prototype.serializeConditionData = function(conditionData) {
                var serializedData = {
                    selectedSkillId: conditionData.selectedSkillId()
                };

                return serializedData;
            };

            /**
             * Returns the objects on which an object depends
             * 
             * @param {object} existingData Existing condition data
             * @returns {object[]} Objects on which the condition depends
             */
            Conditions.CheckLearnedSkillCondition.prototype.getConditionDependsOnObject = function(existingData) {
                if(!existingData || !existingData.selectedSkillId)
                {
                    return [];
                }

                return [{
                    objectType: Conditions.RelatedToObjectSkill,
                    objectId: existingData.selectedSkillId
                }];
            }

            /**
             * Loads the skill
             * 
             * @param {object} objectId Optional object id
             * @returns {jQuery.Deferred} Deferred for the async process
             */
            Conditions.CheckLearnedSkillCondition.prototype.loadObject = function(objectId) {
                var def = new jQuery.Deferred();
                
                jQuery.ajax({ 
                    url: "/api/EvneApi/FlexFieldObject?id=" + objectId, 
                    type: "GET"
                }).done(function(data) {
                    def.resolve(data);
                }).fail(function(xhr) {
                    def.reject();
                });

                return def.promise();
            };

            /**
             * Returns the condition string prefix infront of the skill name
             * 
             * @returns {string} Condition String prefix
             */
            Conditions.CheckLearnedSkillCondition.prototype.getConditionStringPrefix = function() {
                return "";
            }

            /**
             * Returns the condition data as a display string
             * 
             * @param {object} existingData Serialized condition data
             * @returns {jQuery.Deferred} Deferred for the loading process
             */
            Conditions.CheckLearnedSkillCondition.prototype.getConditionString = function(existingData) {
                var def = new jQuery.Deferred();
                
                // Check if data is valid
                if(!existingData || !existingData.selectedSkillId)
                {
                    def.resolve(DefaultNodeShapes.Localization.Conditions.MissingInformations);
                    return def.promise();
                }

                // Load data and build string
                var self = this;
                this.loadObjectShared(existingData).then(function(skill) {
                    var conditionText = self.getConditionStringPrefix() + skill.name;                    
                    def.resolve(conditionText);
                }, function() {
                    def.reject();
                });

                return def.promise();
            };

        }(DefaultNodeShapes.Conditions = DefaultNodeShapes.Conditions || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Conditions) {

            /// Condition Type for checking if the player has learned a skill
            var conditionTypeCheckSkillPlayerLearned = 15;

            /**
             * Check if player has learned a skill
             * @class
             */
            Conditions.CheckPlayerLearnedSkillCondition = function()
            {
                DefaultNodeShapes.Conditions.CheckLearnedSkillCondition.apply(this);
            };

            Conditions.CheckPlayerLearnedSkillCondition.prototype = jQuery.extend({ }, DefaultNodeShapes.Conditions.CheckLearnedSkillCondition.prototype);

            /**
             * Returns the type of the condition
             * 
             * @returns {number} Type of the condition
             */
            Conditions.CheckPlayerLearnedSkillCondition.prototype.getType = function() {
                return conditionTypeCheckSkillPlayerLearned;
            };

            /**
             * Returns the label of the condition
             * 
             * @returns {string} Label of the condition
             */
            Conditions.CheckPlayerLearnedSkillCondition.prototype.getLabel = function() {
                return DefaultNodeShapes.Localization.Conditions.CheckPlayerLearnedSkillLabel;
            };

            /**
             * Returns the condition string prefix infront of the skill name
             * 
             * @returns {string} Condition String prefix
             */
            Conditions.CheckPlayerLearnedSkillCondition.prototype.getConditionStringPrefix = function() {
                return DefaultNodeShapes.Localization.Conditions.CheckPlayerLearnedSkillPrefixLabel;
            };

            GoNorth.DefaultNodeShapes.Conditions.getConditionManager().addConditionType(new Conditions.CheckPlayerLearnedSkillCondition());

        }(DefaultNodeShapes.Conditions = DefaultNodeShapes.Conditions || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Conditions) {

            /// Condition Type for checking if the player has not learned a skill
            var conditionTypeCheckSkillPlayerNotLearned = 16;

            /**
             * Check if player has not learned a skill
             * @class
             */
            Conditions.CheckPlayerNotLearnedSkillCondition = function()
            {
                DefaultNodeShapes.Conditions.CheckLearnedSkillCondition.apply(this);
            };

            Conditions.CheckPlayerNotLearnedSkillCondition.prototype = jQuery.extend({ }, DefaultNodeShapes.Conditions.CheckLearnedSkillCondition.prototype);

            /**
             * Returns the type of the condition
             * 
             * @returns {number} Type of the condition
             */
            Conditions.CheckPlayerNotLearnedSkillCondition.prototype.getType = function() {
                return conditionTypeCheckSkillPlayerNotLearned;
            };

            /**
             * Returns the label of the condition
             * 
             * @returns {string} Label of the condition
             */
            Conditions.CheckPlayerNotLearnedSkillCondition.prototype.getLabel = function() {
                return DefaultNodeShapes.Localization.Conditions.CheckPlayerNotLearnedSkillLabel;
            };

            /**
             * Returns the condition string prefix infront of the skill name
             * 
             * @returns {string} Condition String prefix
             */
            Conditions.CheckPlayerNotLearnedSkillCondition.prototype.getConditionStringPrefix = function() {
                return DefaultNodeShapes.Localization.Conditions.CheckPlayerNotLearnedSkillPrefixLabel;
            };

            GoNorth.DefaultNodeShapes.Conditions.getConditionManager().addConditionType(new Conditions.CheckPlayerNotLearnedSkillCondition());

        }(DefaultNodeShapes.Conditions = DefaultNodeShapes.Conditions || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(Tale) {
        (function(Conditions) {

            /// Condition Type for checking if the npc has learned a skill
            var conditionTypeCheckSkillNpcLearned = 17;

            /**
             * Check if npc has learned a skill
             * @class
             */
            Conditions.CheckNpcLearnedSkillCondition = function()
            {
                GoNorth.DefaultNodeShapes.Conditions.CheckLearnedSkillCondition.apply(this);
            };

            Conditions.CheckNpcLearnedSkillCondition.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.Conditions.CheckLearnedSkillCondition.prototype);

            /**
             * Returns the type of the condition
             * 
             * @returns {number} Type of the condition
             */
            Conditions.CheckNpcLearnedSkillCondition.prototype.getType = function() {
                return conditionTypeCheckSkillNpcLearned;
            };

            /**
             * Returns the label of the condition
             * 
             * @returns {string} Label of the condition
             */
            Conditions.CheckNpcLearnedSkillCondition.prototype.getLabel = function() {
                return Tale.Localization.Conditions.CheckNpcLearnedSkillLabel;
            };

            /**
             * Returns the condition string prefix infront of the skill name
             * 
             * @returns {string} Condition String prefix
             */
            Conditions.CheckNpcLearnedSkillCondition.prototype.getConditionStringPrefix = function() {
                return Tale.Localization.Conditions.CheckNpcLearnedSkillPrefixLabel;
            };

            GoNorth.DefaultNodeShapes.Conditions.getConditionManager().addConditionType(new Conditions.CheckNpcLearnedSkillCondition());

        }(Tale.Conditions = Tale.Conditions || {}));
    }(GoNorth.Tale = GoNorth.Tale || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(Tale) {
        (function(Conditions) {

            /// Condition Type for checking if the npc has not learned a skill
            var conditionTypeCheckSkillNpcNotLearned = 18;

            /**
             * Check if npc has not learned a skill
             * @class
             */
            Conditions.CheckNpcNotLearnedSkillCondition = function()
            {
                GoNorth.DefaultNodeShapes.Conditions.CheckLearnedSkillCondition.apply(this);
            };

            Conditions.CheckNpcNotLearnedSkillCondition.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.Conditions.CheckLearnedSkillCondition.prototype);

            /**
             * Returns the type of the condition
             * 
             * @returns {number} Type of the condition
             */
            Conditions.CheckNpcNotLearnedSkillCondition.prototype.getType = function() {
                return conditionTypeCheckSkillNpcNotLearned;
            };

            /**
             * Returns the label of the condition
             * 
             * @returns {string} Label of the condition
             */
            Conditions.CheckNpcNotLearnedSkillCondition.prototype.getLabel = function() {
                return Tale.Localization.Conditions.CheckNpcNotLearnedSkillLabel;
            };

            /**
             * Returns the condition string prefix infront of the skill name
             * 
             * @returns {string} Condition String prefix
             */
            Conditions.CheckNpcNotLearnedSkillCondition.prototype.getConditionStringPrefix = function() {
                return Tale.Localization.Conditions.CheckNpcNotLearnedSkillPrefixLabel;
            };

            GoNorth.DefaultNodeShapes.Conditions.getConditionManager().addConditionType(new Conditions.CheckNpcNotLearnedSkillCondition());

        }(Tale.Conditions = Tale.Conditions || {}));
    }(GoNorth.Tale = GoNorth.Tale || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Shapes) {

            // Function needs to be set in view model to open condition dialog
            if(!DefaultNodeShapes.openConditionDialog)
            {
                DefaultNodeShapes.openConditionDialog = function() {
                    var def = new jQuery.Deferred();
                    def.reject("Not implemented");
                    return def.promise();
                }
            }

            /// Condition Type
            var conditionType = "default.Condition";
            
            /// Condition Target Array
            var conditionTargetArray = "condition";


            /// Condition node width
            var conditionWidth = 350;
            
            /// Min Condition Height
            var conditionMinHeight = 50;

            /// Height of condition item in pixel
            var conditionItemHeight = 66;

            /// Initial Offset of the port
            var conditionPortInitialOffset = 76;
            

            joint.shapes.default = joint.shapes.default || {};

            /**
             * Creates the condition shape
             * @returns {object} Condition shape
             */
            function createConditionShape() {
                var model = joint.shapes.devs.Model.extend(
                {
                    defaults: joint.util.deepSupplement
                    (
                        {
                            type: conditionType,
                            icon: "glyphicon-question-sign",
                            size: { width: conditionWidth, height: conditionMinHeight },
                            inPorts: ['input'],
                            outPorts: [],
                            attrs:
                            {
                                '.inPorts circle': { "magnet": "passive", "port-type": "input" },
                                '.outPorts circle': { "magnet": "true" }
                            },
                            conditions: [],
                            currentConditionId: 0
                        },
                        joint.shapes.default.Base.prototype.defaults
                    )
                });
                return model;
            }

            /**
             * Creates a condition view
             * @returns {object} Condition view
             */
            function createConditionView() {
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
                            '<button class="gn-nodeAddCondition gn-nodeDeleteOnReadonly cornerButton" title="' + GoNorth.DefaultNodeShapes.Localization.Conditions.AddCondition + '">+</button>',
                        '</div>',
                    ].join(''),

                    /** 
                     * Additiona Callback Buttons 
                     */
                    additionalCallbackButtons: {
                        "gn-nodeAddCondition": function() {
                            this.addCondition();
                        }
                    },

                    /**
                     * Initializes the shape
                     */
                    initialize: function() {
                        _.bindAll(this, 'addCondition');
                        joint.shapes.default.BaseView.prototype.initialize.apply(this, arguments);

                        this.model.on('change:conditions', this.syncConditions, this);

                        if(this.model.get("conditions").length == 0)
                        {
                            this.addCondition();
                        }
                        else
                        {
                            this.syncConditions();
                        }
                    },

                    /**
                     * Adds a new condition
                     * 
                     * @param {object} existingCondition Existing condition to add, null to create new one
                     */
                    addCondition: function(existingCondition) {
                        var condition = existingCondition;
                        if(!condition)
                        {
                            condition = {
                                id: this.model.get("currentConditionId"),
                                conditionElements: []
                            };
                            this.model.set("currentConditionId", this.model.get("currentConditionId") + 1);
                        }

                        // Copy conditions and update using set
                        var newConditions = (this.model.get("conditions") || {}).slice();
                        newConditions.push(condition);
                        this.model.set("conditions", newConditions);
                    },

                    /**
                     * Moves a condition
                     * 
                     * @param {number} conditionId Condition Id
                     * @param {number} direction Direction to move
                     */
                    moveCondition: function(conditionId, direction) {
                        var newConditions = (this.model.get("conditions") || {}).slice();
                        for(var curCondition = 0; curCondition < newConditions.length; ++curCondition)
                        {
                            if(newConditions[curCondition].id == conditionId)
                            {
                                var newIndex = curCondition + direction;
                                if(newIndex >= 0 && newIndex < newConditions.length)
                                {
                                    var tmpCondition = newConditions[curCondition];
                                    newConditions[curCondition] = newConditions[newIndex];
                                    newConditions[newIndex] = tmpCondition;
                                    this.model.set("conditions", newConditions);
                                }
                                return;
                            }
                        }
                    },

                    /**
                     * Delets a condition
                     * 
                     * @param {number} conditionId Condition Id
                     */
                    deleteCondition: function(conditionId) {
                        var newCondition = (this.model.get("conditions") || {}).slice();
                        for(var curCondition = 0; curCondition < newCondition.length; ++curCondition)
                        {
                            if(newCondition[curCondition].id == conditionId)
                            {
                                newCondition.splice(curCondition, 1);
                                this.model.set("conditions", newCondition);
                                return;
                            }
                        }
                    },


                    /** 
                     * Opens a condition
                     * 
                     * @param {number} conditionId Condition Id
                     */
                    openConditionDialog: function(conditionId) {
                        var conditions = (this.model.get("conditions") || {}).slice();
                        for(var curCondition = 0; curCondition < conditions.length; ++curCondition)
                        {
                            if(conditions[curCondition].id == conditionId)
                            {
                                var self = this;
                                DefaultNodeShapes.openConditionDialog(conditions[curCondition]).then(function() {
                                    self.syncConditions();
                                });
                                return;
                            }
                        }
                    },
                    
                    
                    /**
                     * Syncs the conditions (ports, size, ...)
                     */
                    syncConditions: function() {
                        var outPorts = [];
                        var conditions = this.model.get("conditions");
                        for(var curCondition = 0; curCondition < conditions.length; ++curCondition)
                        {
                            outPorts.push("condition" + conditions[curCondition].id);
                        }
                        outPorts.push("else");
                        this.model.set("outPorts", outPorts);

                        // Update Html
                        var allTextDeferreds = [];
                        var self = this;
                        
                        this.model.set("size", { width: conditionWidth, height: conditionMinHeight + outPorts.length * conditionItemHeight});
                        var conditionTable = "<table class='gn-nodeConditionTable'>";
                        jQuery.each(conditions, function(key, condition) {
                            var conditionText = self.buildConditionString(condition, allTextDeferreds);
                            conditionText = jQuery("<div></div>").text(conditionText).html();

                            conditionTable += "<tr>";
                            conditionTable += "<td class='gn-nodeConditionTableConditionCell'><a class='gn-clickable gn-nodeNonClickableOnReadonly' data-conditionid='" + condition.id + "'>" + conditionText + "</a></td>";
                            conditionTable += "<td class='gn-nodeDeleteOnReadonly'><i class='glyphicon glyphicon-arrow-up gn-nodeMoveConditionUp gn-nodeConditionIcon' data-conditionid='" + condition.id + "' title='" + DefaultNodeShapes.Localization.Conditions.MoveConditionUp + "'></i></td>";
                            conditionTable += "<td class='gn-nodeDeleteOnReadonly'><i class='glyphicon glyphicon-arrow-down gn-nodeMoveConditionDown gn-nodeConditionIcon' data-conditionid='" + condition.id + "' title='" + DefaultNodeShapes.Localization.Conditions.MoveConditionDown + "'></i></td>";
                            conditionTable += "<td class='gn-nodeDeleteOnReadonly'><i class='glyphicon glyphicon-trash gn-nodeDeleteCondition gn-nodeConditionIcon' data-conditionid='" + condition.id + "' title='" + DefaultNodeShapes.Localization.Conditions.DeleteCondition + "'></i></td>";
                            conditionTable += "</tr>";
                        });

                        conditionTable += "<tr>";
                        conditionTable += "<td class='gn-nodeConditionTableConditionCell'>" + DefaultNodeShapes.Localization.Conditions.Else + "</td>";
                        conditionTable += "</tr>";

                        conditionTable += "</table>";
                        if(this.$box.find(".gn-nodeConditionTable").length > 0)
                        {
                            this.$box.find(".gn-nodeConditionTable").replaceWith(conditionTable);
                        }
                        else
                        {
                            this.$box.append(conditionTable);
                        }

                        this.hideError();
                        if(allTextDeferreds.length > 0)
                        {
                            this.showLoading();
                            jQuery.when.apply(jQuery, allTextDeferreds).then(function() {
                                self.hideLoading();
                            }, function() {
                                self.hideLoading();
                                self.showError();
                            });
                        }

                        // Update Port Positions
                        for(var curCondition = 0; curCondition < outPorts.length; ++curCondition)
                        {
                            this.model.attr(".outPorts>.port" + curCondition, { "ref-y": (conditionPortInitialOffset + conditionItemHeight * curCondition) + "px", "ref": ".body" });
                        }

                        // Bind events
                        this.$box.find(".gn-nodeMoveConditionUp").on("click", function() {
                            self.moveCondition(jQuery(this).data("conditionid"), -1);
                        });

                        this.$box.find(".gn-nodeMoveConditionDown").on("click", function() {
                            self.moveCondition(jQuery(this).data("conditionid"), +1);
                        });

                        this.$box.find(".gn-nodeDeleteCondition").on("click", function() {
                            self.deleteCondition(jQuery(this).data("conditionid"));
                        });

                        this.$box.find(".gn-nodeConditionTableConditionCell a").on("click", function() {
                            self.openConditionDialog(jQuery(this).data("conditionid"));
                        });
                    },

                    /**
                     * Builds a condition string and sets it
                     * 
                     * @param {object} condition Condition
                     * @param {jQuery.Deferred[]} allTextDeferreds All Text Deferreds
                     * @returns {string} Condition text
                     */
                    buildConditionString: function(condition, allTextDeferreds) {
                        var conditionText = "";
                        var self = this;
                        if(condition.conditionElements && condition.conditionElements.length > 0)
                        {
                            conditionText = DefaultNodeShapes.Localization.Conditions.LoadingConditionText;

                            var selectorString = ".gn-nodeConditionTableConditionCell>a[data-conditionid='" + condition.id + "']";
                            var textDef = GoNorth.DefaultNodeShapes.Conditions.getConditionManager().getConditionString(condition.conditionElements, GoNorth.DefaultNodeShapes.Localization.Conditions.AndOperatorShort, false);
                            textDef.then(function(generatedText) {
                                if(!generatedText) 
                                {
                                    generatedText = DefaultNodeShapes.Localization.Conditions.EditCondition;
                                }
                                else 
                                { 
                                    self.$box.find(selectorString).attr("title", generatedText);
                                }
                                self.$box.find(selectorString).text(generatedText);
                                conditionText = generatedText;  // Update condition text in case no async operation was necessary
                            }, function(err) {
                                var errorText = DefaultNodeShapes.Localization.Conditions.ErrorLoadingConditionText;
                                if(err) 
                                {
                                    errorText += ": " + err;
                                }
                                self.$box.find(selectorString).text(errorText);
                                self.$box.find(selectorString).attr("title", errorText);
                                conditionText = errorText;
                            });
                            allTextDeferreds.push(textDef);
                        }
                        else
                        {
                            conditionText = DefaultNodeShapes.Localization.Conditions.EditCondition;
                        }

                        return conditionText;
                    },

                    /**
                     * Reloads the shared data
                     * 
                     * @param {number} objectType Object Type
                     * @param {string} objectId Object Id
                     */
                    reloadSharedLoadedData: function(objectType, objectId) {
                        var conditions = this.model.get("conditions");
                        var allTextDeferreds = [];
                        for(var curCondition = 0; curCondition < conditions.length; ++curCondition)
                        {
                            var dependsOnObject = GoNorth.DefaultNodeShapes.Conditions.getConditionManager().getConditionElementsDependsOnObject(conditions[curCondition].conditionElements);
                            for(var curDependency = 0; curDependency < dependsOnObject.length; ++curDependency)
                            {
                                if(dependsOnObject[curDependency].objectId == objectId)
                                {
                                    this.buildConditionString(conditions[curCondition], allTextDeferreds);
                                }
                            }
                        }

                        this.hideError();
                        if(allTextDeferreds.length > 0)
                        {
                            this.showLoading();
                            var self = this;
                            jQuery.when.apply(jQuery, allTextDeferreds).then(function() {
                                self.hideLoading();
                            }, function() {
                                self.hideLoading();
                                self.showError();
                            });
                        }
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
             * Condition Shape
             */
            joint.shapes.default.Condition = createConditionShape();

            /**
             * Condition View
             */
            joint.shapes.default.ConditionView = createConditionView();


            /** 
             * Condition Serializer 
             * 
             * @class
             */
            Shapes.ConditionSerializer = function()
            {
                GoNorth.DefaultNodeShapes.Serialize.BaseNodeSerializer.apply(this, [ joint.shapes.default.Condition, conditionType, conditionTargetArray ]);
            };

            Shapes.ConditionSerializer.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.Serialize.BaseNodeSerializer.prototype)

            /**
             * Serializes a node
             * 
             * @param {object} node Node Object
             * @returns {object} Serialized NOde
             */
            Shapes.ConditionSerializer.prototype.serialize = function(node) {
                var serializedConditions = [];
                for(var curCondition = 0; curCondition < node.conditions.length; ++curCondition)
                {
                    var serializedCondition = GoNorth.DefaultNodeShapes.Conditions.getConditionManager().serializeCondition(node.conditions[curCondition]);
                    serializedConditions.push(serializedCondition);
                }

                var serializedData = {
                    id: node.id,
                    x: node.position.x,
                    y: node.position.y,
                    conditions: serializedConditions,
                    currentConditionId: node.currentConditionId
                };

                return serializedData;
            };

            /**
             * Deserializes a serialized node
             * 
             * @param {object} node Serialized Node Object
             * @returns {object} Deserialized Node
             */
            Shapes.ConditionSerializer.prototype.deserialize = function(node) {
                var deserializedConditions = [];
                for(var curCondition = 0; curCondition < node.conditions.length; ++curCondition)
                {
                    var deserializedCondition = GoNorth.DefaultNodeShapes.Conditions.getConditionManager().deserializeCondition(node.conditions[curCondition]);
                    deserializedConditions.push(deserializedCondition);
                }

                var initOptions = {
                    id: node.id,
                    position: { x: node.x, y: node.y },
                    conditions: deserializedConditions,
                    currentConditionId: node.currentConditionId
                };

                var node = new this.classType(initOptions);
                return node;
            };

            // Register Serializers
            var conditionSerializer = new Shapes.ConditionSerializer();
            GoNorth.DefaultNodeShapes.Serialize.getNodeSerializerInstance().addNodeSerializer(conditionSerializer);

        }(DefaultNodeShapes.Shapes = DefaultNodeShapes.Shapes || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Conditions) {

            /**
             * Condition Dialog Model
             * @class
             */
            Conditions.ConditionDialog = function()
            {
                this.isOpen = new ko.observable(false);
                this.condition = null;
                this.closingDeferred = null;

                this.conditionElements = new ko.observableArray();

                this.showGroupWarning = new ko.observable(false);
                this.showDragParentToChildWarning = new ko.observable(false);
                this.warningHideTimeout = null;
                
                this.selectableConditionTypes = Conditions.getConditionManager().getSelectableConditionTypes();
            };

            Conditions.ConditionDialog.prototype = {
                /**
                 * Shows the dialog
                 * 
                 * @param {object} condition Condition to edit
                 * @param {jQuery.Deferred} closingDeferred optional deferred that will be resolved on save
                 */
                openDialog: function(condition, closingDeferred) {
                    this.condition = condition;
                    this.closingDeferred = closingDeferred;
                    this.conditionElements(Conditions.getConditionManager().convertElements(condition.conditionElements));
                    if(this.conditionElements().length == 0)
                    {
                        this.addNewConditionElement();
                    }

                    this.isOpen(true);
                },

                /**
                 * Adds a new condition element
                 */
                addNewConditionElement: function() {
                    var element = Conditions.getConditionManager().createEmptyElement();

                    this.conditionElements.push(element);
                },

                /**
                 * Groups the selected elements as and
                 */
                andGroupElements: function() {
                    this.groupElements(Conditions.GroupConditionOperatorAnd);
                },
                
                /**
                 * Groups the selected elements as or
                 */
                orGroupElements: function() {
                    this.groupElements(Conditions.GroupConditionOperatorOr);
                },

                /**
                 * Groups the selected elements
                 * 
                 * @param {number} operator Operator for the element
                 */
                groupElements: function(operator) {
                    this.showGroupWarning(false);
                    
                    var selectedElements = [];
                    this.collectSelectedElements(selectedElements, this.conditionElements());
                    if(selectedElements.length < 2)
                    {
                        return;
                    }

                    for(var curElement = 1; curElement < selectedElements.length; ++curElement)
                    {
                        if(selectedElements[0].parent != selectedElements[curElement].parent)
                        {
                            this.displayWarning(this.showGroupWarning);
                            return;
                        }
                    }

                    // Group Elements
                    var groupData = {
                        conditionType: Conditions.GroupConditionType,
                        conditionData: {
                            fromDialog: true,
                            operator: operator,
                            conditionElements: selectedElements
                        }
                    };
                    var groupElement = Conditions.getConditionManager().convertElement(groupData);
                    groupElement.parent = selectedElements[0].parent;

                    // Push array
                    var targetArray = this.conditionElements;
                    if(selectedElements[0].parent)
                    {
                        targetArray = selectedElements[0].parent.conditionData().conditionElements;
                    }

                    var firstIndex = targetArray.indexOf(selectedElements[0]);
                    targetArray.removeAll(selectedElements);
                    if(firstIndex < targetArray().length)
                    {
                        targetArray.splice(firstIndex, 0, groupElement);
                    }
                    else
                    {
                        targetArray.push(groupElement);
                    }

                    // Set parent
                    for(var curElement = 0; curElement < selectedElements.length; ++curElement)
                    {
                        selectedElements[curElement].parent = groupElement;
                        selectedElements[curElement].isSelected(false);
                    }
                },

                /**
                 * Collects all selected elements
                 * 
                 * @param {object[]} targetArray Target array to fill
                 * @param {object[]} conditionElements Source array to search
                 */
                collectSelectedElements: function(targetArray, conditionElements) {
                    for(var curElement = 0; curElement < conditionElements.length; ++curElement)
                    {
                        if(conditionElements[curElement].isSelected())
                        {
                            targetArray.push(conditionElements[curElement]);
                        }

                        if(conditionElements[curElement].conditionData().conditionElements)
                        {
                            this.collectSelectedElements(targetArray, conditionElements[curElement].conditionData().conditionElements());
                        }
                    }
                },

                /**
                 * Moves a condition element up
                 * 
                 * @param {object} element Condition Element to move
                 */
                moveConditionElementUp: function(element) {
                    this.moveSingleConditionElement(element, -1);
                },

                /**
                 * Moves a condition element down
                 * 
                 * @param {object} element Condition Element to move
                 */
                moveConditionElementDown: function(element) {
                    this.moveSingleConditionElement(element, 1);
                },

                /**
                 * Moves a single condition element
                 * 
                 * @param {object} element Condition Element to move
                 * @param {number} direction Direction to move the element in
                 */
                moveSingleConditionElement: function(element, direction) {
                    var conditionElements = null;
                    if(element.parent)
                    {
                        conditionElements = element.parent.conditionData().conditionElements;
                    }
                    else
                    {
                        conditionElements = this.conditionElements;
                    }

                    var elementIndex = conditionElements.indexOf(element);
                    var newIndex = elementIndex + direction;
                    var unwrappedElements = conditionElements();
                    if(newIndex >= 0 && newIndex < unwrappedElements.length)
                    {
                        var tmp = unwrappedElements[elementIndex];
                        unwrappedElements[elementIndex] = unwrappedElements[newIndex];
                        unwrappedElements[newIndex] = tmp;
                        conditionElements.valueHasMutated();
                    }
                },

                /**
                 * Moves a condition to a group using drag and drop
                 */
                dropConditionToGroup: function(group, conditionElement) {
                    // Check data
                    if(conditionElement.parent == group)
                    {
                        return;
                    }

                    var parent = group ? group.parent : null;
                    while(parent != null)
                    {
                        if(parent == conditionElement)
                        {
                            this.displayWarning(this.showDragParentToChildWarning);
                            return;
                        }
                        parent = parent.parent;
                    }

                    // Remove from old array
                    if(!conditionElement.parent)
                    {
                        this.conditionElements.remove(conditionElement);
                    }
                    else
                    {
                        conditionElement.parent.conditionData().conditionElements.remove(conditionElement);
                        if(conditionElement.parent.conditionData().conditionElements().length < 2)
                        {
                            this.deleteConditionElement(conditionElement.parent);
                        }
                    }

                    if(!group)
                    {
                        this.conditionElements.push(conditionElement);
                    }
                    else
                    {
                        group.conditionData().conditionElements.push(conditionElement);
                    }

                    conditionElement.parent = group;
                },

                /**
                 * Displays a warning
                 * 
                 * @param {ko.observable} obs Observable to set to true to display the warning
                 */
                displayWarning: function(obs) {
                    if(this.warningHideTimeout)
                    {
                        clearTimeout(this.warningHideTimeout);
                        this.showGroupWarning(false);
                        this.showDragParentToChildWarning(false);
                    }

                    obs(true);
                    this.warningHideTimeout = setTimeout(function() {
                        obs(false);
                    }, 5000);
                },

                /**
                 * Deletes a condition element
                 * 
                 * @param {object} element Condition Element
                 */
                deleteConditionElement: function(element) {
                    if(element.conditionData().conditionElements)
                    {
                        var conditionElements = element.conditionData().conditionElements();
                        if(element.parent && element.parent.conditionData().conditionElements)
                        {
                            this.moveConditionElements(conditionElements, element.parent.conditionData().conditionElements, element.parent, element);
                        }
                        else
                        {
                            this.moveConditionElements(conditionElements, this.conditionElements, null, element);
                        }
                    }

                    if(!element.parent || !element.parent.conditionData().conditionElements)
                    {
                        this.conditionElements.remove(element);
                    }
                    else
                    {
                        element.parent.conditionData().conditionElements.remove(element);
                        if(element.parent.conditionData().conditionElements().length < 2)
                        {
                            this.deleteConditionElement(element.parent);
                        }
                    }
                },

                /**
                 * Moves the condition elements 
                 * 
                 * @param {object[]} conditionElements Condition elements to move
                 * @param {ko.observableArray} targetArray Target array to move the elements too
                 * @param {object} parent New parent
                 */
                moveConditionElements: function(conditionElements, targetArray, parent, element) {
                    // Move elements
                    var targetIndex = targetArray.indexOf(element);
                    for(var curElement = 0; curElement < conditionElements.length; ++curElement)
                    {
                        conditionElements[curElement].parent = parent;
                        if(targetIndex < targetArray().length)
                        {
                            targetArray.splice(targetIndex + curElement, 0, conditionElements[curElement]);
                        }
                        else
                        {
                            targetArray.push(conditionElements[curElement]);
                        }
                    }
                },

                /**
                 * Returns the condition template
                 * 
                 * @param {object} element Condition Element
                 * @returns {string} Condition Element template
                 */
                getConditionTemplate: function(element) {
                    if(element)
                    {
                        return Conditions.getConditionManager().getConditionTemplate(element.conditionType());
                    }

                    return "gn-nodeConditionEmpty";
                },

                /**
                 * Returns the condition template
                 * 
                 * @param {object} element Condition Element
                 * @returns {string} Condition Element template
                 */
                isConditionTypeSelectable: function(element) {
                    if(element)
                    {
                        return Conditions.getConditionManager().isConditionTypeSelectable(element.conditionType());
                    }

                    return true;
                },


                /**
                 * Saves the condition
                 */
                saveCondition: function() {
                    var serializedData = [];
                    var conditionElements = this.conditionElements();
                    for(var curElement = 0; curElement < conditionElements.length; ++curElement)
                    {
                        serializedData.push(Conditions.getConditionManager().serializeConditionElement(conditionElements[curElement]));
                    }
                    
                    this.condition.conditionElements = serializedData;
                    if(this.closingDeferred)
                    {
                        this.closingDeferred.resolve();
                    }
                    this.closeDialog();
                },

                /**
                 * Closes the dialog
                 */
                closeDialog: function() {
                    this.condition = null;
                    this.closingDeferred = null;
                    this.isOpen(false);
                }
            };

        }(DefaultNodeShapes.Conditions = DefaultNodeShapes.Conditions || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(Tale) {
        (function(Dialog) {

            /**
             * Dialog View Model
             * @class
             */
            Dialog.ViewModel = function()
            {
                GoNorth.DefaultNodeShapes.BaseViewModel.apply(this);

                this.id = new ko.observable("");
                this.dialogId = new ko.observable("");

                this.headerName = new ko.observable(Tale.Dialog.Localization.Tale);

                this.isLoading = new ko.observable(false);
                this.isReadonly = new ko.observable(false);
                this.lockedByUser = new ko.observable("");

                this.conditionDialog = new GoNorth.DefaultNodeShapes.Conditions.ConditionDialog();

                this.objectDialog = new GoNorth.ChooseObjectDialog.ViewModel();

                this.isImplemented = new ko.observable(false);
                this.compareDialog = new GoNorth.ImplementationStatus.CompareDialog.ViewModel();

                this.showReturnToNpcButton = new ko.observable(false);
                
                var npcId = GoNorth.Util.getParameterFromHash("npcId");
                if(npcId)
                {
                    this.id(npcId);
                    this.loadNpcName();
                    this.load();
                    this.acquireLock();
                    this.showReturnToNpcButton(true);
                }
                else
                {
                    this.errorOccured(true);
                    this.isReadonly(true);
                }
                

                // Add access to object id for actions and conditions
                var self = this;
                Tale.getCurrentRelatedObjectId = function() {
                    return self.id();
                };

                // Add access to condition dialog
                GoNorth.DefaultNodeShapes.openConditionDialog = function(condition) {
                    if(self.isReadonly())
                    {
                        var readonlyDeferred = new jQuery.Deferred();
                        readonlyDeferred.reject();
                        return readonlyDeferred.promise();
                    }

                    var conditionDialogDeferred = new jQuery.Deferred();
                    self.conditionDialog.openDialog(condition, conditionDialogDeferred);
                    return conditionDialogDeferred;
                };

                // Add access to object dialog
                Tale.openItemSearchDialog = function() {
                    if(self.isReadonly())
                    {
                        var readonlyDeferred = new jQuery.Deferred();
                        readonlyDeferred.reject();
                        return readonlyDeferred.promise();
                    }

                    return self.objectDialog.openItemSearch(Tale.Localization.ViewModel.ChooseItem);
                };

                // Opens the quest search dialog 
                GoNorth.DefaultNodeShapes.openQuestSearchDialog = function() {
                    if(self.isReadonly())
                    {
                        var readonlyDeferred = new jQuery.Deferred();
                        readonlyDeferred.reject();
                        return readonlyDeferred.promise();
                    }

                    return self.objectDialog.openQuestSearch(Tale.Localization.ViewModel.ChooseQuest);                    
                };
                
                // Opens the npc search dialog 
                GoNorth.DefaultNodeShapes.openNpcSearchDialog = function() {
                    if(self.isReadonly())
                    {
                        var readonlyDeferred = new jQuery.Deferred();
                        readonlyDeferred.reject();
                        return readonlyDeferred.promise();
                    }

                    return self.objectDialog.openNpcSearch(Tale.Localization.ViewModel.ChooseNpc);                    
                };

                // Opens the skill search dialog 
                GoNorth.DefaultNodeShapes.openSkillSearchDialog = function() {
                    if(self.isReadonly())
                    {
                        var readonlyDeferred = new jQuery.Deferred();
                        readonlyDeferred.reject();
                        return readonlyDeferred.promise();
                    }

                    return self.objectDialog.openSkillSearch(Tale.Localization.ViewModel.ChooseSkill);                    
                };
            };

            Dialog.ViewModel.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.BaseViewModel.prototype);

            /**
             * Loads the npc name
             */
            Dialog.ViewModel.prototype.loadNpcName = function() {
                this.errorOccured(false);
                var self = this;
                jQuery.ajax({ 
                    url: "/api/KortistoApi/ResolveFlexFieldObjectNames", 
                    headers: GoNorth.Util.generateAntiForgeryHeader(),
                    data: JSON.stringify([ this.id() ]), 
                    type: "POST",
                    contentType: "application/json"
                }).done(function(npcNames) {
                    self.headerName(npcNames[0].name);
                }).fail(function(xhr) {
                    self.errorOccured(true);
                });
            };

            /**
             * Saves the node graph
             */
            Dialog.ViewModel.prototype.save = function() {
                if(!this.nodeGraph() || !this.id())
                {
                    return;
                }

                var serializedGraph = GoNorth.DefaultNodeShapes.Serialize.getNodeSerializerInstance().serializeGraph(this.nodeGraph());

                this.isLoading(true);
                this.errorOccured(false);
                var self = this;
                jQuery.ajax({ 
                    url: "/api/TaleApi/SaveDialog?relatedObjectId=" + this.id(), 
                    headers: GoNorth.Util.generateAntiForgeryHeader(),
                    data: JSON.stringify(serializedGraph), 
                    type: "POST",
                    contentType: "application/json"
                }).done(function(data) {
                    self.isLoading(false);

                    if(!self.dialogId())
                    {
                        self.dialogId(data.id);
                    }

                    self.isImplemented(data.isImplemented);

                    if(window.taleDialogSaved) {
                        window.taleDialogSaved(self.id());
                    }
                }).fail(function(xhr) {
                    self.isLoading(false);
                    self.errorOccured(true);
                });
            };

            /**
             * Loads the data
             */
            Dialog.ViewModel.prototype.load = function() {
                if(!this.id())
                {
                    return;
                }

                this.isLoading(true);
                this.errorOccured(false);
                var self = this;
                jQuery.ajax({ 
                    url: "/api/TaleApi/GetDialogByRelatedObjectId?relatedObjectId=" + this.id(), 
                    type: "GET"
                }).done(function(data) {
                    self.isLoading(false);

                    // Only deserialize data if a dialog already exists, will be null before someone saves a dialog
                    if(data)
                    {
                        self.dialogId(data.id);
                        self.isImplemented(data.isImplemented);

                        GoNorth.DefaultNodeShapes.Serialize.getNodeSerializerInstance().deserializeGraph(self.nodeGraph(), data, function(newNode) { self.setupNewNode(newNode); });

                        if(self.isReadonly())
                        {
                            self.setGraphToReadonly();
                        }
                    }
                    else
                    {
                        self.dialogId("");
                        self.isImplemented(false);
                    }
                }).fail(function(xhr) {
                    self.isLoading(false);
                    self.errorOccured(true);
                });
            };

            /**
             * Opens the compare dialog
             */
            Dialog.ViewModel.prototype.openCompareDialog = function() {
                var self = this;
                this.compareDialog.openDialogCompare(this.dialogId(), this.headerName()).done(function() {
                    self.isImplemented(true);
                });
            };

            /**
             * Returns to the npc
             */
            Dialog.ViewModel.prototype.returnToNpc = function() {
                if(!this.id())
                {
                    return;
                }

                window.location = "/Kortisto/Npc#id=" + this.id();
            };

            
            /**
             * Acquires a lock
             */
            Dialog.ViewModel.prototype.acquireLock = function() {
                this.lockedByUser("");
                this.isReadonly(false);

                var self = this;
                GoNorth.LockService.acquireLock("TaleDialog", this.id()).done(function(isLocked, lockedUsername) { 
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

        }(Tale.Dialog = Tale.Dialog || {}));
    }(GoNorth.Tale = GoNorth.Tale || {}));
}(window.GoNorth = window.GoNorth || {}));