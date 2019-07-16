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
             * Opens the dialog to search for daily routines
             * 
             * @param {string} dialogTitle Title of the dialog
             * @returns {jQuery.Deferred} Deferred for the selecting process
             */
            openDailyRoutineSearch: function(dialogTitle) {
                return this.openDialog(dialogTitle, this.searchDailyRoutines, null, null);
            },

            /**
             * Opens the dialog to search for markers
             * 
             * @param {string} dialogTitle Title of the dialog
             * @returns {jQuery.Deferred} Deferred for the selecting process
             */
            openMarkerSearch: function(dialogTitle) {
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
                jQuery.ajax({ 
                    url: "/api/KortistoApi/FlexFieldObject?id=" + dailyRoutineEventNpc.id, 
                    type: "GET"
                }).done(function(data) {
                    var dailyRoutineObjects = [];
                    if(data.dailyRoutine)
                    {
                        for(var curEvent = 0; curEvent < data.dailyRoutine.length; ++curEvent)
                        {
                            data.dailyRoutine[curEvent].parentObject = dailyRoutineEventNpc;
                            data.dailyRoutine[curEvent].name = GoNorth.DailyRoutines.Util.formatTimeSpan("hh:mm", data.dailyRoutine[curEvent].earliestTime, data.dailyRoutine[curEvent].latestTime);
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
                jQuery.ajax({ 
                    url: "/api/KartaApi/SearchMarkersByExportName?searchPattern=" + encodeURIComponent(searchPattern) + "&start=" + (this.dialogCurrentPage() * dialogPageSize) + "&pageSize=" + dialogPageSize, 
                    type: "GET"
                }).done(function(data) {
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
        (function(Page) {

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

        }(Kirja.Page = Kirja.Page || {}));
    }(GoNorth.Kirja = GoNorth.Kirja || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(Kirja) {
        (function(Page) {

            /// Version Dialog Page Size
            var versionDialogPageSize = 25;

            /// Scroll Offset
            var headerScrollOffset = 45;

            /// Mouse Button left
            var mouseButtonLeft = 1;

            /// Kirja Id Url Prefix
            var kirjaIdUrlPrefx = "/Kirja?id=";

            /**
             * Page View Model
             * @class
             */
            Page.ViewModel = function()
            {
                this.id = new ko.observable("");
                var paramId = GoNorth.Util.getParameterFromUrl("id");
                if(paramId)
                {
                    this.id(paramId);
                }

                this.isLoading = new ko.observable(false);
                this.isReadonly = new ko.observable(false);
                this.lockedByUser = new ko.observable("");

                this.isEditMode = new ko.observable(false);
                this.isDirty = new ko.observable(false);

                this.blockPageReload = false;
                var self = this;
                this.pageName = new ko.observable("");
                this.pageName.subscribe(function() {
                    self.isDirty(true);
                });
                this.originalPageContent = null;
                this.pageContent = new ko.observable("");
                this.pageContent.subscribe(function() {
                    self.isDirty(true);
                });

                this.displayVersionId = new ko.observable(null);
                this.displayVersionName = new ko.observable(null);
                this.displayVersionHtml = new ko.observable(null);
                this.displayVersionNumber = new ko.observable(null);

                this.compareVersionId = new ko.observable(null);
                this.compareVersionName = new ko.observable(null);
                this.compareVersionHtml = new ko.observable(null);
                this.compareVersionNumber = new ko.observable(null);

                this.pageContentTransformed = new ko.computed(function() {
                    var pageContent = null;
                    if(this.displayVersionHtml())
                    {
                        pageContent = this.displayVersionHtml();
                    }
                    else
                    {
                        pageContent = this.pageContent();
                    }

                    if(this.isEditMode())
                    {
                        return pageContent;
                    }

                    var comparePageContent = this.compareVersionHtml();
                    pageContent = this.transformPageContent(pageContent);
                    if(comparePageContent)
                    {
                        comparePageContent = this.transformPageContent(comparePageContent);
                        return htmldiff(comparePageContent, pageContent);
                    }

                    return pageContent;
                }, this);
                this.currentPageName = new ko.computed(function() {
                    var displayVersionName = this.displayVersionName();
                    var pageName = this.pageName();

                    if(displayVersionName)
                    {
                        return displayVersionName;
                    }

                    return pageName;
                }, this);
                this.pageModifiedOn = new ko.observable("");

                this.isDefault = new ko.observable(false);

                this.showConfirmDirtyExitEdit = new ko.observable(false);
                this.confirmDirtyExitPromise = null;

                this.showConfirmDeleteDialog = new ko.observable(false);

                this.showVersionDialog = new ko.observable(false);
                this.showVersionDialog.subscribe(function() {
                    self.syncUrlParamters();
                });
                this.versionDialogErrorOccured = new ko.observable(false);
                this.loadingVersions = new ko.observable(false);
                this.currentVersionPage = new ko.observable(0);
                this.hasMoreVersions = new ko.observable(false);
                this.versionDialogMostRecentVersion = new ko.observable(0);
                this.versions = new ko.observableArray();

                this.showConfirmRestoreDialog = new ko.observable(false);
                this.confirmRestoreDialogLoading = new ko.observable(false);
                this.confirmRestoreDialogErrorOccured = new ko.observable(false);
                this.confirmRestoreBrokenLinks = new ko.observableArray();

                this.linkDialog = new GoNorth.ChooseObjectDialog.ViewModel();
                this.linkDialogInsertHtmlCallback = null;

                this.showNewWaitPageDialog = new ko.observable(false);

                this.showSidebar = new ko.observable(false);

                this.mentionedInPages = new ko.observableArray();
                this.loadingMentionedInPages = new ko.observable(false);
                this.loadingMentionedInPagesError = new ko.observable(false);

                this.mentionedQuests = new ko.observableArray();
                this.loadingMentionedQuests = new ko.observable(false);
                this.loadingMentionedQuestsError = new ko.observable(false);

                this.mentionedNpcs = new ko.observableArray();
                this.loadingMentionedNpcs = new ko.observable(false);
                this.loadingMentionedNpcsError = new ko.observable(false);

                this.mentionedItems = new ko.observableArray();
                this.loadingMentionedItems = new ko.observable(false);
                this.loadingMentionedItemsError = new ko.observable(false);

                this.mentionedSkills = new ko.observableArray();
                this.loadingMentionedSkills = new ko.observable(false);
                this.loadingMentionedSkillsError = new ko.observable(false);

                this.markedInMaps = new ko.observableArray();
                this.loadingMarkedInMaps = new ko.observable(false);
                this.loadingMarkedInMapsError = new ko.observable(false);

                this.errorOccured = new ko.observable(false);
                this.additionalErrorDetails = new ko.observable("");
                this.pageNotFound = new ko.observable(false);

                this.attachmentFiles = new ko.observableArray();
                this.showConfirmDeleteAttachmentDialog = new ko.observable(false);
                this.attachmentToDelete = null;

                var isNewPage = GoNorth.Util.getParameterFromUrl("newPage") == "1";
                if(this.id() || !isNewPage)
                {
                    this.loadPage();
                }
                else if(isNewPage)
                {
                    this.isEditMode(true);
                    setTimeout(function() {
                        jQuery("#gn-kirjaPageName").focus();
                    }, 1);
                }

                var isVersionDialogOpen = GoNorth.Util.getParameterFromUrl("versionDialog") == "1";
                var initialVersionPage = parseInt(GoNorth.Util.getParameterFromUrl("versionPage"));
                var compareVersionId = GoNorth.Util.getParameterFromUrl("compareVersionId");
                var displayVersionId = GoNorth.Util.getParameterFromUrl("displayVersionId");
                if(isVersionDialogOpen && !isNaN(initialVersionPage))
                {
                    this.openVersionDialogWithPage(initialVersionPage);
                }

                if(compareVersionId)
                {
                    this.compareVersion(compareVersionId);
                }

                if(displayVersionId)
                {
                    this.showVersion(displayVersionId);
                }

                if(compareVersionId === "" && displayVersionId === "")
                {
                    this.syncUrlParamters();
                }

                this.attachmentUploadUrl = new ko.computed(function() {
                    return "/api/KirjaApi/UploadPageAttachment?id=" + this.id();
                }, this);
                
                GoNorth.Util.setupValidation("#gn-kirjaHeaderFields");

                GoNorth.Util.onUrlParameterChanged(function() {
                    if(!self.blockPageReload) {
                        self.switchPage(GoNorth.Util.getParameterFromUrl("id"));
                    }
                    self.blockPageReload = false;
                });

                // Access function for scrolling in the table of content
                Page.scrollToHeader = function(id) {
                    jQuery('html, body').animate({
                        scrollTop: Math.max(0, jQuery(".gn-header_" + id).offset().top - headerScrollOffset)
                    }, 250);
                }
            };

            Page.ViewModel.prototype = {
                /**
                 * Resets the error state
                 */
                resetErrorState: function() {
                    this.errorOccured(false);
                    this.additionalErrorDetails("");
                    this.pageNotFound(false);
                },

                /**
                 * Syncs the url parameters with the valid values
                 */
                syncUrlParamters: function() {
                    var targetUrl = "id=" + this.id();
                    if(this.compareVersionId())
                    {
                        targetUrl += "&compareVersionId=" + this.compareVersionId();
                    }

                    if(this.displayVersionId())
                    {
                        targetUrl += "&displayVersionId=" + this.displayVersionId();
                    }
                    
                    if(this.showVersionDialog())
                    {
                        targetUrl += "&versionDialog=1&versionPage=" + this.currentVersionPage();
                    }

                    this.blockPageReload = true;
                    GoNorth.Util.replaceUrlParameters(targetUrl);
                    this.blockPageReload = false;
                },

                /**
                 * Switches the page to a different page
                 * 
                 * @param {string} id Id of the page to switch to
                 * @param {object} e Event
                 */
                switchPage: function(id) {
                    this.isEditMode(false);
                    this.id(id);
                    this.resetErrorState();
                    this.showSidebar(false);
                    this.showVersionDialog(false);
                    this.displayVersionId(null);
                    this.displayVersionName(null);
                    this.displayVersionHtml(null);
                    this.displayVersionNumber(null);
                    this.compareVersionId(null);
                    this.compareVersionName(null);
                    this.compareVersionHtml(null);
                    this.compareVersionNumber(null);
                    this.syncUrlParamters();
                    this.loadPage();
                },

                /**
                 * Loads a page
                 */
                loadPage: function() {
                    var url = "/api/KirjaApi/Page";
                    if(this.id())
                    {
                        url += "?id=" + this.id();
                    }

                    this.isLoading(true);
                    this.resetErrorState();
                    var self = this;
                    jQuery.ajax({ 
                        url: url, 
                        type: "GET"
                    }).done(function(data) {
                        self.isLoading(false);
                        if(!data)
                        {
                            self.errorOccured(true);
                            self.pageNotFound(true);
                            return;
                        }

                        self.pageName(data.name);
                        self.pageContent(self.fixOldLinks(data.content));
                        self.originalPageContent = self.pageContent();
                        self.pageModifiedOn(data.modifiedOn);
                        self.isDefault(data.isDefault);
                        if(!self.id())
                        {
                            self.setId(data.id);
                        }

                        self.loadMentionedInPages();
                        self.loadMentionedQuests(data.mentionedQuests);
                        self.loadMentionedNpcs(data.mentionedNpcs);
                        self.loadMentionedItems(data.mentionedItems);
                        self.loadMentionedSkills(data.mentionedSkills);
                        self.loadMarkedInMaps();

                        self.attachmentFiles(data.attachments ? data.attachments : []);

                        self.isDirty(false);
                        self.checkLock();
                    }).fail(function(xhr) {
                        self.errorOccured(true);
                        self.isLoading(false);
                    });
                },

                /**
                 * Generates the rich text buttons
                 * 
                 * @returns {object} Rich text buttons
                 */
                generateRichTextButtons: function() {
                    var self = this;

                    var allKirjaButtons = {};
                    allKirjaButtons.insertTableOfContent = {
                        title: GoNorth.Kirja.Page.toolbarButtonInsertTableOfContentTitle,
                        icon: "glyphicon-list-alt",
                        callback: function(htmlInsert) {
                            htmlInsert("<br/><span contenteditable='false'><gn-kirjaTableOfContent></gn-kirjaTableOfContent></span><br/>")
                        }
                    };

                    allKirjaButtons.insertWikiLink = {
                        title: GoNorth.Kirja.Page.toolbarButtonInsertKirjaLinkTitle,
                        icon: "glyphicon-book",
                        callback: function(htmlInsert) {
                            self.linkDialogInsertHtmlCallback = htmlInsert;
                            self.linkDialog.openKirjaPageSearch(GoNorth.Kirja.Page.toolbarButtonInsertKirjaLinkTitle, function() { self.openCreatePage() }, self.id).then(function(selectedObject) {
                                self.addLinkFromLinkDialog(selectedObject, true);
                            });
                        }
                    };

                    if(GoNorth.Kirja.Page.hasAikaRights)
                    {
                        allKirjaButtons.insertQuestLink = {
                            title: GoNorth.Kirja.Page.toolbarButtonInsertAikaQuestLinkTitle,
                            icon: "glyphicon-king",
                            callback: function(htmlInsert) {
                                self.linkDialogInsertHtmlCallback = htmlInsert;
                                self.linkDialog.openQuestSearch(GoNorth.Kirja.Page.toolbarButtonInsertAikaQuestLinkTitle).then(function(selectedObject) {
                                    self.addLinkFromLinkDialog(selectedObject, false);
                                });
                            }
                        };
                    }

                    if(GoNorth.Kirja.Page.hasKortistoRights)
                    {
                        allKirjaButtons.insertNpcLink = {
                            title: GoNorth.Kirja.Page.toolbarButtonInsertKortistoNpcLinkTitle,
                            icon: "glyphicon-user",
                            callback: function(htmlInsert) {
                                self.linkDialogInsertHtmlCallback = htmlInsert;
                                self.linkDialog.openNpcSearch(GoNorth.Kirja.Page.toolbarButtonInsertKortistoNpcLinkTitle).then(function(selectedObject) {
                                    self.addLinkFromLinkDialog(selectedObject, false);
                                });
                            }
                        };
                    }

                    if(GoNorth.Kirja.Page.hasStyrRights)
                    {
                        allKirjaButtons.insertItemLink = {
                            title: GoNorth.Kirja.Page.toolbarButtonInsertStyrItemLinkTitle,
                            icon: "glyphicon-apple",
                            callback: function(htmlInsert) {
                                self.linkDialogInsertHtmlCallback = htmlInsert;
                                self.linkDialog.openItemSearch(GoNorth.Kirja.Page.toolbarButtonInsertStyrItemLinkTitle).then(function(selectedObject) {
                                    self.addLinkFromLinkDialog(selectedObject, false);
                                });
                            }
                        };
                    }

                    if(GoNorth.Kirja.Page.hasEvneRights)
                    {
                        allKirjaButtons.insertSkillLink = {
                            title: GoNorth.Kirja.Page.toolbarButtonInsertEvneSkillLinkTitle,
                            icon: "glyphicon-flash",
                            callback: function(htmlInsert) {
                                self.linkDialogInsertHtmlCallback = htmlInsert;
                                self.linkDialog.openSkillSearch(GoNorth.Kirja.Page.toolbarButtonInsertEvneSkillLinkTitle).then(function(selectedObject) {
                                    self.addLinkFromLinkDialog(selectedObject, false);
                                });
                            }
                        };
                    }

                    return allKirjaButtons;
                },

                /**
                 * Pushes the new kirja page state if a kirja page link is clicked
                 * 
                 * @param {string} href Href to the new page
                 * @param {event} event Click event
                 */
                pushKirjaPageState: function(href, event) {
                    if(event.which != mouseButtonLeft) 
                    {
                        return;
                    }

                    if(!href || !href.toLowerCase().indexOf("/kirja") == 0)
                    {
                        return;
                    }

                    href = href.toLowerCase().replace("/kirja?", "")
                    GoNorth.Util.setUrlParameters(href);
                    event.preventDefault();
                    return false;
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
                },

                /**
                 * Transforms the page content, adding table of contents etc.
                 * 
                 * @param {string} pageContent Page content
                 * @returns {string} Transformed page content
                 */
                transformPageContent: function(pageContent) {
                    var jQueryContent = jQuery("<div>" + pageContent + "</div>");

                    var headers = this.transformHeaders(jQueryContent);
                    var self = this;
                    jQueryContent.find("gn-kirjaTableOfContent").each(function() {
                        jQuery(this).replaceWith(self.buildTableOfContent(headers))
                    });

                    return jQueryContent.html();
                },

                /**
                 * Transform headers
                 * 
                 * @param {object} jQueryContent jQuery Content
                 * @returns {object[]} Headers
                 */
                transformHeaders: function(jQueryContent) {
                    var headers = [];
                    var currentMainHeader = null;

                    var curHeader = 0;
                    jQueryContent.find("h4,h5").each(function() {
                        var headerContent = this.outerHTML;
                        headerContent = "<span class='gn-header_" + curHeader + "'>" + headerContent + "</span>";

                        var headerName = jQuery(this).text();
                        if(jQuery(this).prop("tagName").toLowerCase() == "h4")
                        {
                            currentMainHeader = {
                                name: headerName,
                                id: curHeader,
                                subHeaders: []
                            }
                            headers.push(currentMainHeader);
                        }
                        else
                        {
                            var header = {
                                name: headerName,
                                id: curHeader
                            }

                            if(currentMainHeader)
                            {
                                currentMainHeader.subHeaders.push(header);
                            }
                            else
                            {
                                headers.push(header);
                            }
                        }

                        jQuery(this).replaceWith(headerContent);
                        ++curHeader;
                    });

                    return headers;
                },

                /**
                 * Builds the table of content
                 * 
                 * @param {object[]} headers Headers 
                 * @returns {string} Table of content html
                 */
                buildTableOfContent: function(headers) {
                    var tableOfContentHtml = "<div class='gn-kirjaTableOfContentTransformed'>";
                    tableOfContentHtml += "<div class='gn-kirjaTableOfContentTransformedHeader'>" + GoNorth.Kirja.Page.tableOfContent + "</div>";
                    tableOfContentHtml += this.buildTableOfContentForHeaders(headers);
                    tableOfContentHtml += "</div>";

                    return tableOfContentHtml;
                },

                /**
                 * Returns the table of content for headers
                 * 
                 * @param {objec[]} headers Header to build
                 * @returns {string} Html for the table of content
                 */
                buildTableOfContentForHeaders: function(headers)
                {
                    var tableOfContentHtml = "<ul>";
                    for(var curHeader = 0; curHeader < headers.length; ++curHeader)
                    {
                        tableOfContentHtml += "<li><a class='gn-clickable' onclick='GoNorth.Kirja.Page.scrollToHeader(" + headers[curHeader].id + ")'>" + headers[curHeader].name + "<a>";
                        if(headers[curHeader].subHeaders && headers[curHeader].subHeaders.length > 0)
                        {
                            tableOfContentHtml += this.buildTableOfContentForHeaders(headers[curHeader].subHeaders);
                        }
                    }
                    tableOfContentHtml += "</ul>";

                    return tableOfContentHtml;
                },

                /**
                 * Switches to edit mode
                 */
                enterEditMode: function() {
                    this.showSidebar(false);
                    this.isEditMode(true);
                    this.displayVersionId(null);
                    this.displayVersionName(null);
                    this.displayVersionHtml(null);
                    this.displayVersionNumber(null);
                    this.compareVersionId(null);
                    this.compareVersionName(null);
                    this.compareVersionHtml(null);
                    this.compareVersionNumber(null);
                    this.syncUrlParamters();
                    this.acquireLock();
                },

                /**
                 * Exits the edit mode
                 */
                exitEditMode: function() {
                    var confirmDirtyExitPromise = new jQuery.Deferred();
                    this.confirmDirtyExitPromise = confirmDirtyExitPromise;

                    if(this.isDirty())
                    {
                        this.showConfirmDirtyExitEdit(true);
                    }
                    else
                    {
                        this.exitEditModeWithoutDirtyCheck()
                    }

                    return confirmDirtyExitPromise.promise();
                },

                /**
                 * Discards the changes that are not saved yet
                 */
                discardChanges: function() {
                    this.pageContent(this.originalPageContent);
                    this.exitEditModeWithoutDirtyCheck();
                },

                /**
                 * Exits the edit mode without dirty check
                 */
                exitEditModeWithoutDirtyCheck: function() {
                    this.isEditMode(false);
                    this.showConfirmDirtyExitEdit(false);
                    GoNorth.LockService.releaseCurrentLock();

                    if(this.confirmDirtyExitPromise)
                    {
                        this.confirmDirtyExitPromise.resolve();
                        this.confirmDirtyExitPromise = null;
                    }
                },

                /**
                 * Closes the confirm dirty exit edit dialog
                 */
                closeConfirmDirtyExitEdit: function() {
                    if(this.confirmDirtyExitPromise)
                    {
                        this.confirmDirtyExitPromise.reject();
                        this.confirmDirtyExitPromise = null;
                    }
                    this.showConfirmDirtyExitEdit(false);
                },


                /**
                 * Callback if a new image file was uploaded
                 * 
                 * @param {string} image Image Filename that was uploaded
                 * @returns {string} Url of the new image
                 */
                imageUploaded: function(image) {
                    return "/api/KirjaApi/KirjaImage?imageFile=" + encodeURIComponent(image);
                },

                /**
                 * Callback if a new attachment file was uploaded
                 * 
                 * @param {string} image Filename that was uploaded
                 */
                attachmentUploaded: function(file) {
                    this.attachmentFiles.push(file);
                    this.attachmentFiles.sort(function(a1, a2) {
                        return a1.originalFilename.localeCompare(a2.originalFilename);
                    });
                },

                /**
                 * Builds the url for an attachment
                 * 
                 * @param {object} attachment Attachment to build the url for
                 * @returns {string} Attachment Url
                 */
                buildAttachmentUrl: function(attachment) {
                    return "/api/KirjaApi/KirjaAttachment?pageId=" + this.id() + "&attachmentFile=" + encodeURIComponent(attachment.filename);
                },

                /**
                 * Callback if an image upload is started
                 */
                uploadStart: function() {
                    this.isLoading(true);
                    this.resetErrorState();
                },

                /**
                 * Callback if an error occured during upload
                 * 
                 * @param {string} errorMessage Error Message
                 * @param {object} xhr Xhr Object
                 */
                uploadError: function(errorMessage, xhr) {
                    this.errorOccured(true);
                    if(xhr && xhr.responseText)
                    {
                        this.additionalErrorDetails(xhr.responseText);
                    }
                    else
                    {
                        this.additionalErrorDetails(errorMessage);
                    }
                },


                /**
                 * Opens the delete confirm dialog for an attachment
                 * 
                 * @param {object} attachment Attachment to delete
                 */
                openDeleteAttachmentDialog: function(attachment) {
                    this.showConfirmDeleteAttachmentDialog(true);
                    this.attachmentToDelete = attachment;
                },

                /**
                 * Deletes the attachment for which the confirm dialog is open
                 */
                deleteAttachment: function() {
                    var attachment = this.attachmentToDelete;

                    this.isLoading(true);
                    this.resetErrorState();
                    var self = this;
                    jQuery.ajax({ 
                        url: "/api/KirjaApi/DeleteAttachment?pageId=" + this.id() + "&attachmentFile=" + encodeURIComponent(attachment.filename), 
                        headers: GoNorth.Util.generateAntiForgeryHeader(),
                        type: "DELETE",
                    }).done(function(savedPage) {
                        self.attachmentFiles.remove(attachment);
                        self.isLoading(false);
                    }).fail(function() {
                        self.isLoading(false);
                        self.errorOccured(true);
                    });

                    this.closeConfirmAttachmentDeleteDialog();
                },

                /**
                 * Closes the delete confirm dialog
                 */
                closeConfirmAttachmentDeleteDialog: function() {
                    this.showConfirmDeleteAttachmentDialog(false);
                    this.attachmentToDelete = null;
                },


                /**
                 * Saves the page
                 */
                save: function() {
                    if(!jQuery("#gn-kirjaHeaderFields").valid())
                    {
                        return;
                    }

                    // Send Data
                    var url = "/api/KirjaApi/CreatePage";
                    if(this.id())
                    {
                        url = "/api/KirjaApi/UpdatePage?id=" + this.id();
                    }

                    var request = {
                        name: this.pageName(),
                        content: this.pageContent()
                    };

                    this.isLoading(true);
                    this.resetErrorState();
                    var self = this;
                    jQuery.ajax({ 
                        url: url, 
                        headers: GoNorth.Util.generateAntiForgeryHeader(),
                        data: JSON.stringify(request), 
                        type: "POST",
                        contentType: "application/json"
                    }).done(function(savedPage) {
                        if(!self.id())
                        {
                            self.setId(savedPage.id);
                            self.acquireLock();

                            if(window.newKirjaPageSaved) {
                                window.newKirjaPageSaved(savedPage.id, self.pageName());
                                window.newKirjaPageSaved = null;
                            }
                        }
                        self.loadMentionedQuests(savedPage.mentionedQuests);
                        self.loadMentionedNpcs(savedPage.mentionedNpcs);
                        self.loadMentionedItems(savedPage.mentionedItems);
                        self.loadMentionedSkills(savedPage.mentionedSkills);
                        self.pageModifiedOn(savedPage.modifiedOn);
                        self.callPageRefreshGrid();
                        self.isDirty(false);
                        self.isLoading(false);
                        self.originalPageContent = self.pageContent();
                    }).fail(function(xhr) {
                        self.isLoading(false);
                        self.errorOccured(true);
                    });
                },


                /**
                 * Opens the version dialog
                 */
                openVersionDialog: function() {
                    this.openVersionDialogWithPage(0);
                },

                /**
                 * Opens the version dialog with an initial page
                 * @param {number} initialPage Initial page
                 */
                openVersionDialogWithPage: function(initialPage) {
                    if(!this.id())
                    {
                        return;
                    }

                    this.showSidebar(false);
                    this.showVersionDialog(true);
                    this.versions.removeAll();
                    this.currentVersionPage(initialPage);
                    this.hasMoreVersions(false);
                    this.loadVersionPage();
                },

                /**
                 * Previous version page
                 */
                prevVersionPage: function() {
                    if(this.currentVersionPage() == 0)
                    {
                        return;
                    }                 

                    this.currentVersionPage(this.currentVersionPage() - 1);
                    this.loadVersionPage();
                },
                
                /**
                 * Next version page
                 */
                nextVersionPage: function() {
                    if(!this.hasMoreVersions())
                    {
                        return;
                    }                 

                    this.currentVersionPage(this.currentVersionPage() + 1);
                    this.loadVersionPage();
                },

                /**
                 * Loads the version page
                 */
                loadVersionPage: function() {
                    this.syncUrlParamters();

                    var startPageIndex = this.currentVersionPage() * versionDialogPageSize;
                    var pageSizeToLoad = versionDialogPageSize;
                    if(this.currentVersionPage() == 0)
                    {
                        pageSizeToLoad = versionDialogPageSize - 1;
                    }
                    else
                    {
                        startPageIndex = startPageIndex - 1;
                    }

                    if(pageSizeToLoad == 0)
                    {
                        this.hasMoreVersions(true);
                        this.versions.removeAll();
                        return;
                    }

                    this.loadingVersions(true);
                    this.versionDialogErrorOccured(false);
                    var self = this;
                    jQuery.ajax({ 
                        url: "/api/KirjaApi/GetPageVersions?pageId=" + this.id() + "&start=" + startPageIndex + "&pageSize=" + pageSizeToLoad, 
                        type: "GET"
                    }).done(function(data) {
                        self.loadingVersions(false);
                        self.hasMoreVersions(data.hasMore);
                        self.versionDialogMostRecentVersion(data.mostRecentVersion);
                        self.versions(data.versions);
                    }).fail(function() {
                        self.loadingVersions(false);
                        self.versions.removeAll();
                        self.versionDialogErrorOccured(true);
                    });
                },

                /**
                 * Closes the version dialog
                 */
                closeVersionDialog: function() {
                    this.showVersionDialog(false);
                },

                /**
                 * Compares the currently loaded version with another version
                 * 
                 * @param {object} version Version object to compare with
                 */
                compareWithVersionObject: function(version) {
                    if(this.isEditMode())
                    {
                        var self = this;
                        this.exitEditMode().done(function() {
                            self.closeVersionDialog();
                            self.compareVersion(version.id);
                        });
                    }
                    else
                    {
                        this.closeVersionDialog();
                        this.compareVersion(version.id);
                    }
                },

                /**
                 * Compares the currently loaded version with another version
                 * 
                 * @param {string} versionId Id of the version to compare with
                 */
                compareVersion: function(versionId) {
                    this.isLoading(true);
                    this.errorOccured(false);
                    var self = this;
                    this.loadPageVersion(versionId).done(function(loadedVersion) {
                        self.isLoading(false);
                        var version = loadedVersion.version;
                        if(version && version.id != self.displayVersionId())
                        {
                            self.compareVersionId(version.id);
                            self.compareVersionName(version.name);
                            self.compareVersionHtml(version.content);
                            self.compareVersionNumber(version.versionNumber);

                            self.syncUrlParamters();
                        }
                        else
                        {
                            self.exitCompareMode();
                        }

                    }).fail(function() {
                        self.isLoading(false);
                        self.errorOccured(true);
                    });
                },

                /**
                 * Exits the compare mode
                 */
                exitCompareMode: function() {
                    this.compareVersionId(null);
                    this.compareVersionName(null);
                    this.compareVersionHtml(null);
                    this.compareVersionNumber(null);

                    this.syncUrlParamters();
                },

                /**
                 * Shows a version from an version object
                 * 
                 * @param {object} version Version object
                 */
                showVersionWithObject: function(version) {
                    if(this.isEditMode())
                    {
                        var self = this;
                        this.exitEditMode().done(function() {
                            self.closeVersionDialog();
                            self.exitCompareMode(); 
                            self.showVersion(version.id);
                        });
                    }
                    else
                    {
                        this.closeVersionDialog();
                        this.exitCompareMode(); 
                        this.showVersion(version.id);
                    }
                },

                /**
                 * Shows a version
                 * 
                 * @param {string} versionId Version Id
                 */
                showVersion: function(versionId) {
                    this.isLoading(true);
                    this.errorOccured(false);
                    var self = this;
                    this.loadPageVersion(versionId).done(function(loadedVersion) {
                        self.isLoading(false);
                        
                        var version = loadedVersion.version;
                        if(version && version.versionNumber != loadedVersion.mostRecentVersion)
                        {
                            self.displayVersionId(version.id);
                            self.displayVersionName(version.name);
                            self.displayVersionHtml(version.content);
                            self.displayVersionNumber(version.versionNumber);

                            self.syncUrlParamters();
                        }
                        else
                        {
                            self.exitDisplayMode();
                        }
                    }).fail(function() {
                        self.isLoading(false);
                        self.errorOccured(true);
                    });
                },

                /**
                 * Exits the display mode
                 */
                exitDisplayMode: function() {
                    this.displayVersionId(null);
                    this.displayVersionName(null);
                    this.displayVersionHtml(null);
                    this.displayVersionNumber(null);
                    this.syncUrlParamters();
                },

                /**
                 * Exits the display and compare mode
                 */
                exitDisplayAndCompareMode: function() {
                    this.exitDisplayMode();
                    this.exitCompareMode(); 
                },

                /**
                 * Opens the restore dialog
                 */
                openRestoreDialog: function() {
                    if(!this.displayVersionId())
                    {
                        return;
                    }

                    this.showConfirmRestoreDialog(true);
                    this.confirmRestoreBrokenLinks.removeAll();

                    this.confirmRestoreDialogLoading(true);
                    this.confirmRestoreDialogErrorOccured(false);
                    var self = this;
                    jQuery.ajax({
                        url: "/api/KirjaApi/ValidateVersionReferences?versionId=" + this.displayVersionId(),
                        type: "GET"
                    }).done(function(compareResult) {
                        self.confirmRestoreDialogLoading(false);

                        var compareHtml = jQuery("<div>" + self.displayVersionHtml() + "</div>");
                        self.findMissingReferences(compareHtml, "/Kortisto/Npc", GoNorth.Kirja.Page.Npc, compareResult.missingNpcs);
                        self.findMissingReferences(compareHtml, "/Styr/Item", GoNorth.Kirja.Page.Item, compareResult.missingItems);
                        self.findMissingReferences(compareHtml, "/Evne/Skill", GoNorth.Kirja.Page.Skill, compareResult.missingSkills);
                        self.findMissingReferences(compareHtml, "/Aika/Quest", GoNorth.Kirja.Page.Quest, compareResult.missingQuests);
                        self.findMissingReferences(compareHtml, "/Kirja", GoNorth.Kirja.Page.KirjaPage, compareResult.missingPages);
                    }).fail(function() {
                        self.confirmRestoreDialogLoading(false);
                        self.confirmRestoreDialogErrorOccured(true);
                    });
                },

                /**
                 * Finds missing references in a compare html
                 * @param {object} compareHtml Compare Html object
                 * @param {string} urlPrefix Prefix for links
                 * @param {string} objectLabel Object label 
                 * @param {object[]} compareResult Compare results to check
                 */
                findMissingReferences: function(compareHtml, urlPrefix, objectLabel, compareResult) {
                    var self = this;
                    for(var curResult = 0; curResult < compareResult.length; ++curResult)
                    {
                        var linkSelector = "a[href^='" + urlPrefix + "?id=" + compareResult[curResult] + "']";
                        compareHtml.find(linkSelector).each(function() {
                            self.confirmRestoreBrokenLinks.push({
                                selector: linkSelector,
                                linkText: jQuery(this).text(),
                                objectLabel: objectLabel
                            })
                        });
                    }
                },

                /**
                 * Restores the current displayed version
                 */
                restoreVersion: function() {
                    var newHtml = this.removeMissingReferences(this.displayVersionHtml());

                    this.pageName(this.displayVersionName());
                    this.pageContent(newHtml);
                    this.closeConfirmRestoreDialog();
                    this.exitCompareMode();
                    this.exitDisplayMode();

                    this.save();
                },

                /**
                 * Removes the missing references
                 * @param {string} htmlContent Html Content
                 * @returns {string} Html without missing references
                 */
                removeMissingReferences: function(htmlContent) {
                    var brokenLinks = this.confirmRestoreBrokenLinks();
                    if(brokenLinks.length == 0)
                    {
                        return htmlContent;
                    }

                    var htmlContentFix = jQuery("<div>" + htmlContent + "</div>");
                    for(var curBrokenLink = 0; curBrokenLink < brokenLinks.length; ++curBrokenLink)
                    {
                        htmlContentFix.find(brokenLinks[curBrokenLink].selector).contents().unwrap();
                    }

                    return htmlContentFix.html();
                },

                /**
                 * Closes the confirm restore dialog
                 */
                closeConfirmRestoreDialog: function() {
                    this.showConfirmRestoreDialog(false);
                },

                /**
                 * Loads a page version
                 * @param {string} id Id of the version
                 * @returns {jQuery.Deferred} Deferred
                 */
                loadPageVersion: function(id) {
                    return jQuery.ajax({
                        url: "/api/KirjaApi/PageVersion?versionId=" + id,
                        type: "GET"
                    });
                },


                /**
                 * Loads the pages in which the current page is mentioned
                 */
                loadMentionedInPages: function() {
                    if(!this.id())
                    {
                        return;
                    }

                    this.loadingMentionedInPages(true);
                    this.loadingMentionedInPagesError(false);
                    var self = this;
                    jQuery.ajax({ 
                        url: "/api/KirjaApi/GetPagesByPage?pageId=" + this.id(), 
                        type: "GET"
                    }).done(function(pages) {
                        var loadedPages = [];
                        for(var curPage = 0; curPage < pages.length; ++curPage)
                        {
                            loadedPages.push({
                                openLink: "/Kirja?id=" + pages[curPage].id,
                                name: pages[curPage].name
                            });
                        }
                        self.mentionedInPages(loadedPages);
                        self.loadingMentionedInPages(false);
                    }).fail(function(xhr) {
                        self.mentionedInPages([]);
                        self.loadingMentionedInPages(false);
                        self.loadingMentionedInPagesError(true);
                    });
                },

                /**
                 * Loads the mentioned quests
                 * @param {string[]} questIds Quest Ids
                 */
                loadMentionedQuests: function(questIds) {
                    if(!GoNorth.Kirja.Page.hasAikaRights || !questIds)
                    {
                        return;
                    }

                    this.loadingMentionedQuests(true);
                    this.loadingMentionedQuestsError(false);
                    var self = this;
                    jQuery.ajax({ 
                        url: "/api/AikaApi/ResolveQuestNames", 
                        headers: GoNorth.Util.generateAntiForgeryHeader(),
                        data: JSON.stringify(questIds), 
                        type: "POST",
                        contentType: "application/json"
                    }).done(function(questNames) {
                        var loadedQuestNames = [];
                        for(var curQuest = 0; curQuest < questNames.length; ++curQuest)
                        {
                            loadedQuestNames.push({
                                openLink: "/Aika/Quest?id=" + questNames[curQuest].id,
                                name: questNames[curQuest].name
                            });
                        }
                        self.mentionedQuests(loadedQuestNames);
                        self.loadingMentionedQuests(false);
                    }).fail(function(xhr) {
                        self.mentionedQuests([]);
                        self.loadingMentionedQuests(false);
                        self.loadingMentionedQuestsError(true);
                    });
                },

                /**
                 * Loads the mentioned npcs
                 * @param {string[]} npcIds Npc Ids
                 */
                loadMentionedNpcs: function(npcIds) {
                    if(!GoNorth.Kirja.Page.hasKortistoRights || !npcIds)
                    {
                        return;
                    }

                    this.loadingMentionedNpcs(true);
                    this.loadingMentionedNpcsError(false);
                    var self = this;
                    jQuery.ajax({ 
                        url: "/api/KortistoApi/ResolveFlexFieldObjectNames", 
                        headers: GoNorth.Util.generateAntiForgeryHeader(),
                        data: JSON.stringify(npcIds), 
                        type: "POST",
                        contentType: "application/json"
                    }).done(function(npcNames) {
                        var loadedNpcNames = [];
                        for(var curNpc = 0; curNpc < npcNames.length; ++curNpc)
                        {
                            loadedNpcNames.push({
                                openLink: "/Kortisto/Npc?id=" + npcNames[curNpc].id,
                                name: npcNames[curNpc].name
                            });
                        }
                        self.mentionedNpcs(loadedNpcNames);
                        self.loadingMentionedNpcs(false);
                    }).fail(function(xhr) {
                        self.mentionedNpcs([]);
                        self.loadingMentionedNpcs(false);
                        self.loadingMentionedNpcsError(true);
                    });
                },

                /**
                 * Loads the mentioned items
                 * @param {string[]} itemIds Item Ids
                 */
                loadMentionedItems: function(itemIds) {
                    if(!GoNorth.Kirja.Page.hasKortistoRights || !itemIds)
                    {
                        return;
                    }

                    this.loadingMentionedItems(true);
                    this.loadingMentionedItemsError(false);
                    var self = this;
                    jQuery.ajax({ 
                        url: "/api/StyrApi/ResolveFlexFieldObjectNames", 
                        headers: GoNorth.Util.generateAntiForgeryHeader(),
                        data: JSON.stringify(itemIds), 
                        type: "POST",
                        contentType: "application/json"
                    }).done(function(itemNames) {
                        var loadedItemNames = [];
                        for(var curItem = 0; curItem < itemNames.length; ++curItem)
                        {
                            loadedItemNames.push({
                                openLink: "/Styr/Item?id=" + itemNames[curItem].id,
                                name: itemNames[curItem].name
                            });
                        }
                        self.mentionedItems(loadedItemNames);
                        self.loadingMentionedItems(false);
                    }).fail(function(xhr) {
                        self.mentionedItems([]);
                        self.loadingMentionedItems(false);
                        self.loadingMentionedItemsError(true);
                    });
                },

                /**
                 * Loads the mentioned skills
                 * @param {string[]} skillIds Skill Ids
                 */
                loadMentionedSkills: function(skillIds) {
                    if(!GoNorth.Kirja.Page.hasEvneRights || !skillIds)
                    {
                        return;
                    }

                    this.loadingMentionedSkills(true);
                    this.loadingMentionedSkillsError(false);
                    var self = this;
                    jQuery.ajax({ 
                        url: "/api/EvneApi/ResolveFlexFieldObjectNames", 
                        headers: GoNorth.Util.generateAntiForgeryHeader(),
                        data: JSON.stringify(skillIds), 
                        type: "POST",
                        contentType: "application/json"
                    }).done(function(skillNames) {
                        var loadedSkillNames = [];
                        for(var curSkill = 0; curSkill < skillNames.length; ++curSkill)
                        {
                            loadedSkillNames.push({
                                openLink: "/Evne/Skill?id=" + skillNames[curSkill].id,
                                name: skillNames[curSkill].name
                            });
                        }
                        self.mentionedSkills(loadedSkillNames);
                        self.loadingMentionedSkills(false);
                    }).fail(function(xhr) {
                        self.mentionedSkills([]);
                        self.loadingMentionedSkills(false);
                        self.loadingMentionedSkillsError(true);
                    });
                },

                /**
                 * Loads the maps in which the pages was marked
                 */
                loadMarkedInMaps: function() {
                    if(!GoNorth.Kirja.Page.hasKartaRights)
                    {
                        return;
                    }

                    this.markedInMaps([]);
                    this.loadingMarkedInMaps(true);
                    this.loadingMarkedInMapsError(false);
                    var self = this;
                    jQuery.ajax({ 
                        url: "/api/KartaApi/GetMapsByKirjaPageId?pageId=" + this.id(), 
                        type: "GET"
                    }).done(function(maps) {
                        var loadedMaps = [];
                        for(var curMap = 0; curMap < maps.length; ++curMap)
                        {
                            var url = "/Karta?id=" + maps[curMap].mapId;
                            if(maps[curMap].markerIds.length == 1)
                            {
                                url += "&zoomOnMarkerId=" + maps[curMap].markerIds[0] + "&zoomOnMarkerType=" + maps[curMap].mapMarkerType
                            }

                            loadedMaps.push({
                                openLink: url,
                                name: maps[curMap].name,
                                markerCount: maps[curMap].markerIds.length,
                                tooltip: GoNorth.Kirja.Page.kirjaMapMarkerCountTooltip.replace("{0}", maps[curMap].markerIds.length)
                            });
                        }
                        self.markedInMaps(loadedMaps);
                        self.loadingMarkedInMaps(false);
                    }).fail(function(xhr) {
                        self.loadingMarkedInMaps(false);
                        self.loadingMarkedInMapsError(true);
                    });
                },

                /**
                 * Sets the id
                 * 
                 * @param {string} id Id of the page
                 */
                setId: function(id) {
                    var hasId = !!this.id();
                    this.id(id);
                    this.blockPageReload = true;
                    var parameterValue = "id=" + id;
                    if(hasId)
                    {
                        GoNorth.Util.setUrlParameters(parameterValue); 
                    }
                    else
                    {
                        GoNorth.Util.replaceUrlParameters(parameterValue);
                    }
                },


                /**
                 * Opens the confirm delete dialog
                 */
                openConfirmDeleteDialog: function() {
                    this.showConfirmDeleteDialog(true);
                },

                /**
                 * Closes the confirm delete dialog
                 */
                closeConfirmDeleteDialog: function() {
                    this.showConfirmDeleteDialog(false);
                },

                /**
                 * Deletes the current page
                 */
                deletePage: function() {
                    this.closeConfirmDeleteDialog();
                    this.isLoading(true);
                    this.resetErrorState();
                    var self = this;
                    jQuery.ajax({ 
                        url: "/api/KirjaApi/DeletePage?id=" + this.id(), 
                        headers: GoNorth.Util.generateAntiForgeryHeader(),
                        type: "DELETE"
                    }).done(function(data) {
                        self.isLoading(false);
                        if(self.callPageRefreshGrid())
                        {
                            window.close();
                        }
                        else
                        {
                            window.location = "/Kirja";
                        }
                    }).fail(function(xhr) {
                        self.isLoading(false);
                        self.errorOccured(true);

                        // If npc is related to anything that prevents deleting a bad request (400) will be returned
                        if(xhr.status == 400 && xhr.responseText)
                        {
                            self.additionalErrorDetails(xhr.responseText);
                        }
                    });
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
                 * Opens a page to create a new kirja page
                 */
                openCreatePage: function() {
                    this.linkDialog.closeDialog();
                    this.showNewWaitPageDialog(true);

                    var self = this;
                    var newPage = window.open("/Kirja?newPage=1");
                    newPage.onbeforeunload = function() {
                        self.showNewWaitPageDialog(false);
                    };
                    newPage.newKirjaPageSaved = function(id, name) {
                        self.addLinkFromLinkDialog({ name: name, openLink: kirjaIdUrlPrefx + id, id }, true);
                        self.showNewWaitPageDialog(false);
                        self.save();
                    };
                },

                /**
                 * Toogles the sidebar
                 */
                toogleSidebar: function() {
                    this.showSidebar(!this.showSidebar());
                },


                /**
                 * Checks the lock without locking it
                 */
                checkLock: function() {
                    var self = this;
                    GoNorth.LockService.checkLock("KirjaPage", this.id()).done(function(isLocked, lockedUsername) { 
                        self.handleLockResult(isLocked, lockedUsername);
                    }).fail(function() {
                        self.errorOccured(true);
                        self.exitEditModeWithoutDirtyCheck();
                    });
                },

                /**
                 * Acquires a lock
                 */
                acquireLock: function() {
                    var self = this;
                    GoNorth.LockService.acquireLock("KirjaPage", this.id()).done(function(isLocked, lockedUsername) { 
                        self.handleLockResult(isLocked, lockedUsername);
                    }).fail(function() {
                        self.errorOccured(true);
                        self.exitEditModeWithoutDirtyCheck();
                    });
                },

                /**
                 * Handles the lock result
                 * 
                 * @param {bool} isLocked true if the resource is locked, else false
                 * @param {string} lockedUsername Name of the user who owns the lock at the moment
                 */
                handleLockResult: function(isLocked, lockedUsername) {
                    if(isLocked)
                    {
                        this.isReadonly(true);
                        this.lockedByUser(lockedUsername);
                        this.exitEditModeWithoutDirtyCheck();
                    }
                    else
                    {
                        this.isReadonly(false);
                        this.lockedByUser("");
                    }
                },


                /**
                 * Calls the npc refresh for the grid of the parent window
                 * 
                 * @returns {bool} true if a refresh was triggered, else false 
                 */
                callPageRefreshGrid: function() {
                    if(window.refreshKirjaPageGrid)
                    {
                        window.refreshKirjaPageGrid();
                        return true;
                    }

                    return false;
                }
            };

        }(Kirja.Page = Kirja.Page || {}));
    }(GoNorth.Kirja = GoNorth.Kirja || {}));
}(window.GoNorth = window.GoNorth || {}));