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
                var self = this;
                this.isOpen.subscribe(function(newValue) {
                    if(!newValue && self.markAsImplementedPromise)
                    {
                        self.markAsImplementedPromise.reject();
                    }
                });
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
                        if(window.refreshImplementationStatusList)
                        {
                            window.refreshImplementationStatusList();
                        }

                        self.markAsImplementedPromise.resolve();
                        self.markAsImplementedPromise = null;

                        self.isLoading(false);
                        self.isOpen(false);
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
    (function(ImplementationStatus) {
        (function(Overview) {

            /**
             * Base Implementation for implementation status object list
             * 
             * @param {ko.observable} loadingObs Observbale for loading display
             * @param {ko.observable} errorOccuredObs Observable if an error occurs
             * @param {GoNorth.ImplementationStatus.CompareDialog.ViewModel} compareDialog Compare Dialog
             * @class
             */
            Overview.ImplementationStatusObjectList = function(loadingObs, errorOccuredObs, compareDialog)
            {
                this.isInitialized = false;
                this.hasMarkerTypeRow = false;

                this.compareDialog = compareDialog;
                this.initialCompareObjId = null;

                this.objects = new ko.observableArray();
                this.hasMore = new ko.observable(false);
                this.currentPage = new ko.observable(0);

                this.isLoading = loadingObs;
                this.prevLoading = new ko.observable(false);
                this.nextLoading = new ko.observable(false);

                this.errorOccured = errorOccuredObs;

                this.pageSize = 50;
            };

            Overview.ImplementationStatusObjectList.prototype = {
                /**
                 * Loads the objects
                 * 
                 * @returns {jQuery.Deferred} Deferred for the loading process
                 */
                loadObjects: function() {
                    var def = new jQuery.Deferred();
                    def.reject("Not implemented");
                    return def.promise();
                },

                /**
                 * Opens the compare for an object by id
                 * 
                 * @param {string} id Id of the object to check
                 */
                openCompareById: function(id) {
                    var objects = this.objects();
                    for(var curObject = 0; curObject < objects.length; ++curObject)
                    {
                        if(objects[curObject].id == id)
                        {
                            this.openCompare(objects[curObject]);
                            break;
                        }
                    }
                },

                /**
                 * Opens the compare
                 * 
                 * @param {object} obj Object to check
                 */
                openCompare: function(obj) {
                    this.saveCompareIdInUrl(obj.id);
                    var self = this;
                    this.openCompareDialog(obj).done(function() {
                        self.saveCompareIdInUrl(null);
                        self.loadPage();
                    }).fail(function() {
                        self.saveCompareIdInUrl(null);
                    });
                },

                /**
                 * Opens the compare dialog for an object
                 * 
                 * @param {object} obj Object to check
                 * @return {jQuery.Deferred} Deferred that will get resolved after the object was marked as implemented
                 */
                openCompareDialog: function(obj) {

                },

                /**
                 * Builds the url for an object
                 * 
                 * @param {object} obj Object to open
                 * @returns {string}  Url of the object
                 */
                buildObjectUrl: function(obj) {

                },
                

                /**
                 * Initializes the list
                 */
                init: function() {
                    this.savePagingInfoInUrl();
                    if(!this.isInitialized)
                    {
                        this.loadPage();
                        this.isInitialized = true;
                    }
                },

                /**
                 * Loads a page with objects
                 */
                loadPage: function() {
                    this.savePagingInfoInUrl();

                    this.errorOccured(false);
                    this.isLoading(true);
                    var self = this;
                    this.loadObjects().done(function(data) {
                       self.objects(data.objects);
                       self.hasMore(data.hasMore);

                       self.resetLoadingState();

                       if(self.initialCompareObjId) {
                           self.openCompareById(self.initialCompareObjId);
                           self.initialCompareObjId = null;
                       }
                    }).fail(function() {
                        self.errorOccured(true);
                        self.resetLoadingState();
                    });
                },

                /**
                 * Resets the loading state
                 */
                resetLoadingState: function() {
                    this.isLoading(false);
                    this.prevLoading(false);
                    this.nextLoading(false);
                },

                /**
                 * Loads the previous page
                 */
                prevPage: function() {
                    this.currentPage(this.currentPage() - 1);
                    this.prevLoading(true);

                    this.loadPage();
                },

                /**
                 * Loads the next page
                 */
                nextPage: function() {
                    this.currentPage(this.currentPage() + 1);
                    this.nextLoading(true);

                    this.loadPage();
                },


                /**
                 * Manipulates the url data
                 * 
                 * @param {string} paramName Name of the parameter
                 * @param {string} paramValue Value of hte parameter
                 */
                manipulateUrlData: function(paramName, paramValue) {
                    var urlParameters = window.location.search;
                    if(urlParameters)
                    {
                        var paramRegex = new RegExp("&" + paramName + "=.*?(&|$)", "i")
                        urlParameters = urlParameters.substr(1).replace(paramRegex, "");
                        if(paramValue != null)
                        {
                            urlParameters += "&" + paramName + "=" + paramValue;
                        }
                    }
                    else
                    {
                        if(paramValue != null)
                        {
                            urlParameters = paramName + "=" + paramValue;
                        }
                        else
                        {
                            urlParameters = "";
                        }
                    }

                    GoNorth.Util.replaceUrlParameters(urlParameters);
                },

                /**
                 * Saves the paging info in the url
                 */
                savePagingInfoInUrl: function() {
                    this.manipulateUrlData("page", this.currentPage());
                },

                /**
                 * Sets the current page
                 * 
                 * @param {number} currentPage Page to set
                 */
                setCurrentPage: function(currentPage) {
                    this.currentPage(currentPage);
                },

                /**
                 * Saves the compare dialog object id in the url
                 * 
                 * @param {string} compareObjId Id of the object to save in the url
                 */
                saveCompareIdInUrl: function(compareObjId) {
                    this.manipulateUrlData("compareId", compareObjId);
                },

                /**
                 * Sets the initial compare id
                 * 
                 * @param {string} compareObjId Id of the object for which the compare dialog should be opened
                 */
                setInitialCompareId: function(compareObjId) {
                    this.initialCompareObjId = compareObjId;
                }
            };

        }(ImplementationStatus.Overview = ImplementationStatus.Overview || {}));
    }(GoNorth.ImplementationStatus = GoNorth.ImplementationStatus || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(ImplementationStatus) {
        (function(Overview) {

            /**
             * Implementation for implementation status npc list
             * 
             * @param {ko.observable} loadingObs Observbale for loading display
             * @param {ko.observable} errorOccuredObs Observable if an error occurs
             * @param {GoNorth.ImplementationStatus.CompareDialog.ViewModel} compareDialog Compare Dialog
             * @class
             */
            Overview.ImplementationStatusNpcList = function(loadingObs, errorOccuredObs, compareDialog)
            {
                Overview.ImplementationStatusObjectList.apply(this, [ loadingObs, errorOccuredObs, compareDialog ]);
            };

            Overview.ImplementationStatusNpcList.prototype = jQuery.extend({ }, Overview.ImplementationStatusObjectList.prototype)

            /**
             * Loads the objects
             * 
             * @returns {jQuery.Deferred} Deferred for the loading process
             */
            Overview.ImplementationStatusNpcList.prototype.loadObjects = function() {
                var def = new jQuery.Deferred();

                jQuery.ajax({ 
                    url: "/api/KortistoApi/GetNotImplementedNpcs?&start=" + (this.currentPage() * this.pageSize) + "&pageSize=" + this.pageSize, 
                    type: "GET"
                }).done(function(data) {
                   def.resolve({
                      objects: data.flexFieldObjects,
                      hasMore: data.hasMore
                   });
                }).fail(function() {
                    def.reject();
                });

                return def.promise();
            };

            /**
             * Opens the compare dialog for an object
             * 
             * @param {object} obj Object to check
             * @return {jQuery.Deferred} Deferred that will get resolved after the object was marked as implemented
             */
            Overview.ImplementationStatusNpcList.prototype.openCompareDialog = function(obj) {
                return this.compareDialog.openNpcCompare(obj.id, obj.name);
            };

            /**
             * Builds the url for an object
             * 
             * @param {object} obj Object to open
             * @returns {string} Url of the object
             */
            Overview.ImplementationStatusNpcList.prototype.buildObjectUrl = function(obj) {
                return "/Kortisto/Npc?id=" + obj.id;
            };

        }(ImplementationStatus.Overview = ImplementationStatus.Overview || {}));
    }(GoNorth.ImplementationStatus = GoNorth.ImplementationStatus || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(ImplementationStatus) {
        (function(Overview) {

            /**
             * Implementation for implementation status dialog list
             * 
             * @param {ko.observable} loadingObs Observbale for loading display
             * @param {ko.observable} errorOccuredObs Observable if an error occurs
             * @param {GoNorth.ImplementationStatus.CompareDialog.ViewModel} compareDialog Compare Dialog
             * @class
             */
            Overview.ImplementationStatusDialogList = function(loadingObs, errorOccuredObs, compareDialog)
            {
                Overview.ImplementationStatusObjectList.apply(this, [ loadingObs, errorOccuredObs, compareDialog ]);
            };

            Overview.ImplementationStatusDialogList.prototype = jQuery.extend({ }, Overview.ImplementationStatusObjectList.prototype)

            /**
             * Loads the objects
             * 
             * @returns {jQuery.Deferred} Deferred for the loading process
             */
            Overview.ImplementationStatusDialogList.prototype.loadObjects = function() {
                var def = new jQuery.Deferred();

                jQuery.ajax({ 
                    url: "/api/TaleApi/GetNotImplementedDialogs?&start=" + (this.currentPage() * this.pageSize) + "&pageSize=" + this.pageSize, 
                    type: "GET"
                }).done(function(data) {
                   def.resolve({
                      objects: data.dialogs,
                      hasMore: data.hasMore
                   });
                }).fail(function() {
                    def.reject();
                });

                return def.promise();
            };

            /**
             * Opens the compare dialog for an object
             * 
             * @param {object} obj Object to check
             * @return {jQuery.Deferred} Deferred that will get resolved after the object was marked as implemented
             */
            Overview.ImplementationStatusDialogList.prototype.openCompareDialog = function(obj) {
                return this.compareDialog.openDialogCompare(obj.id, obj.name);
            };

            /**
             * Builds the url for an object
             * 
             * @param {object} obj Object to open
             * @returns {string}  Url of the object
             */
            Overview.ImplementationStatusDialogList.prototype.buildObjectUrl = function(obj) {
                return "/Tale?npcId=" + obj.relatedObjectId;
            };

        }(ImplementationStatus.Overview = ImplementationStatus.Overview || {}));
    }(GoNorth.ImplementationStatus = GoNorth.ImplementationStatus || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(ImplementationStatus) {
        (function(Overview) {

            /**
             * Implementation for implementation status item list
             * 
             * @param {ko.observable} loadingObs Observbale for loading display
             * @param {ko.observable} errorOccuredObs Observable if an error occurs
             * @param {GoNorth.ImplementationStatus.CompareDialog.ViewModel} compareDialog Compare Dialog
             * @class
             */
            Overview.ImplementationStatusItemList = function(loadingObs, errorOccuredObs, compareDialog)
            {
                Overview.ImplementationStatusObjectList.apply(this, [ loadingObs, errorOccuredObs, compareDialog ]);
            };

            Overview.ImplementationStatusItemList.prototype = jQuery.extend({ }, Overview.ImplementationStatusObjectList.prototype)

            /**
             * Loads the objects
             * 
             * @returns {jQuery.Deferred} Deferred for the loading process
             */
            Overview.ImplementationStatusItemList.prototype.loadObjects = function() {
                var def = new jQuery.Deferred();

                jQuery.ajax({ 
                    url: "/api/StyrApi/GetNotImplementedItems?&start=" + (this.currentPage() * this.pageSize) + "&pageSize=" + this.pageSize, 
                    type: "GET"
                }).done(function(data) {
                   def.resolve({
                      objects: data.flexFieldObjects,
                      hasMore: data.hasMore
                   });
                }).fail(function() {
                    def.reject();
                });

                return def.promise();
            };

            /**
             * Opens the compare dialog for an object
             * 
             * @param {object} obj Object to check
             * @return {jQuery.Deferred} Deferred that will get resolved after the object was marked as implemented
             */
            Overview.ImplementationStatusItemList.prototype.openCompareDialog = function(obj) {
                return this.compareDialog.openItemCompare(obj.id, obj.name);
            };

            /**
             * Builds the url for an object
             * 
             * @param {object} obj Object to open
             * @returns {string}  Url of the object
             */
            Overview.ImplementationStatusItemList.prototype.buildObjectUrl = function(obj) {
                return "/Styr/Item?id=" + obj.id;
            };

        }(ImplementationStatus.Overview = ImplementationStatus.Overview || {}));
    }(GoNorth.ImplementationStatus = GoNorth.ImplementationStatus || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(ImplementationStatus) {
        (function(Overview) {

            /**
             * Implementation for implementation status skill list
             * 
             * @param {ko.observable} loadingObs Observable for loading display
             * @param {ko.observable} errorOccuredObs Observable if an error occurs
             * @param {GoNorth.ImplementationStatus.CompareDialog.ViewModel} compareDialog Compare Dialog
             * @class
             */
            Overview.ImplementationStatusSkillList = function(loadingObs, errorOccuredObs, compareDialog)
            {
                Overview.ImplementationStatusObjectList.apply(this, [ loadingObs, errorOccuredObs, compareDialog ]);
            };

            Overview.ImplementationStatusSkillList.prototype = jQuery.extend({ }, Overview.ImplementationStatusObjectList.prototype)

            /**
             * Loads the objects
             * 
             * @returns {jQuery.Deferred} Deferred for the loading process
             */
            Overview.ImplementationStatusSkillList.prototype.loadObjects = function() {
                var def = new jQuery.Deferred();

                jQuery.ajax({ 
                    url: "/api/EvneApi/GetNotImplementedSkills?&start=" + (this.currentPage() * this.pageSize) + "&pageSize=" + this.pageSize, 
                    type: "GET"
                }).done(function(data) {
                   def.resolve({
                      objects: data.flexFieldObjects,
                      hasMore: data.hasMore
                   });
                }).fail(function() {
                    def.reject();
                });

                return def.promise();
            };

            /**
             * Opens the compare dialog for an object
             * 
             * @param {object} obj Object to check
             * @return {jQuery.Deferred} Deferred that will get resolved after the object was marked as implemented
             */
            Overview.ImplementationStatusSkillList.prototype.openCompareDialog = function(obj) {
                return this.compareDialog.openSkillCompare(obj.id, obj.name);
            };

            /**
             * Builds the url for an object
             * 
             * @param {object} obj Object to open
             * @returns {string}  Url of the object
             */
            Overview.ImplementationStatusSkillList.prototype.buildObjectUrl = function(obj) {
                return "/Evne/Skill?id=" + obj.id;
            };

        }(ImplementationStatus.Overview = ImplementationStatus.Overview || {}));
    }(GoNorth.ImplementationStatus = GoNorth.ImplementationStatus || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(ImplementationStatus) {
        (function(Overview) {

            /**
             * Implementation for implementation status quest list
             * 
             * @param {ko.observable} loadingObs Observbale for loading display
             * @param {ko.observable} errorOccuredObs Observable if an error occurs
             * @param {GoNorth.ImplementationStatus.CompareDialog.ViewModel} compareDialog Compare Dialog
             * @class
             */
            Overview.ImplementationStatusQuestList = function(loadingObs, errorOccuredObs, compareDialog)
            {
                Overview.ImplementationStatusObjectList.apply(this, [ loadingObs, errorOccuredObs, compareDialog ]);
            };

            Overview.ImplementationStatusQuestList.prototype = jQuery.extend({ }, Overview.ImplementationStatusObjectList.prototype)

            /**
             * Loads the objects
             * 
             * @returns {jQuery.Deferred} Deferred for the loading process
             */
            Overview.ImplementationStatusQuestList.prototype.loadObjects = function() {
                var def = new jQuery.Deferred();

                jQuery.ajax({ 
                    url: "/api/AikaApi/GetNotImplementedQuests?&start=" + (this.currentPage() * this.pageSize) + "&pageSize=" + this.pageSize, 
                    type: "GET"
                }).done(function(data) {
                   def.resolve({
                      objects: data.quests,
                      hasMore: data.hasMore
                   });
                }).fail(function() {
                    def.reject();
                });

                return def.promise();
            };

            /**
             * Opens the compare dialog for an object
             * 
             * @param {object} obj Object to check
             * @return {jQuery.Deferred} Deferred that will get resolved after the object was marked as implemented
             */
            Overview.ImplementationStatusQuestList.prototype.openCompareDialog = function(obj) {
                return this.compareDialog.openQuestCompare(obj.id, obj.name);
            };

            /**
             * Builds the url for an object
             * 
             * @param {object} obj Object to open
             * @returns {string} Url of the object
             */
            Overview.ImplementationStatusQuestList.prototype.buildObjectUrl = function(obj) {
                return "/Aika/Quest?id=" + obj.id;
            };

        }(ImplementationStatus.Overview = ImplementationStatus.Overview || {}));
    }(GoNorth.ImplementationStatus = GoNorth.ImplementationStatus || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(ImplementationStatus) {
        (function(Overview) {

            /**
             * Implementation for implementation status marker list
             * 
             * @param {object} markerTypes Marker types Lookup Object to marker names for passing to karta
             * @param {ko.observable} loadingObs Observbale for loading display
             * @param {ko.observable} errorOccuredObs Observable if an error occurs
             * @param {GoNorth.ImplementationStatus.CompareDialog.ViewModel} compareDialog Compare Dialog
             * @class
             */
            Overview.ImplementationStatusMarkerList = function(markerTypes, loadingObs, errorOccuredObs, compareDialog)
            {
                Overview.ImplementationStatusObjectList.apply(this, [ loadingObs, errorOccuredObs, compareDialog ]);

                this.markerTypes = markerTypes;
                this.hasMarkerTypeRow = true;
            };

            Overview.ImplementationStatusMarkerList.prototype = jQuery.extend({ }, Overview.ImplementationStatusObjectList.prototype)

            /**
             * Loads the objects
             * 
             * @returns {jQuery.Deferred} Deferred for the loading process
             */
            Overview.ImplementationStatusMarkerList.prototype.loadObjects = function() {
                var def = new jQuery.Deferred();

                jQuery.ajax({ 
                    url: "/api/KartaApi/GetNotImplementedMarkers?&start=" + (this.currentPage() * this.pageSize) + "&pageSize=" + this.pageSize, 
                    type: "GET"
                }).done(function(data) {
                   def.resolve({
                      objects: data.markers,
                      hasMore: data.hasMore
                   });
                }).fail(function() {
                    def.reject();
                });

                return def.promise();
            };

            /**
             * Opens the compare dialog for an object
             * 
             * @param {object} obj Object to check
             * @return {jQuery.Deferred} Deferred that will get resolved after the object was marked as implemented
             */
            Overview.ImplementationStatusMarkerList.prototype.openCompareDialog = function(obj) {
                return this.compareDialog.openMarkerCompare(obj.mapId, obj.id, obj.type);
            };

            /**
             * Builds the url for an object
             * 
             * @param {object} obj Object to open
             * @returns {string} Url of the object
             */
            Overview.ImplementationStatusMarkerList.prototype.buildObjectUrl = function(obj) {
                var zoomOnMarkerParam = "&zoomOnMarkerType=" + this.markerTypes[obj.type] + "&zoomOnMarkerId=" + obj.id;
                return "/Karta?id=" + obj.mapId + zoomOnMarkerParam;
            };

        }(ImplementationStatus.Overview = ImplementationStatus.Overview || {}));
    }(GoNorth.ImplementationStatus = GoNorth.ImplementationStatus || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(ImplementationStatus) {
        (function(Overview) {

            /// List Type for npcs
            var listTypeNpc = 0;

            /// List Type for dialogs
            var listTypeDialog = 1;

            /// List Type for items
            var listTypeItem = 2;

            /// List Type for skills
            var listTypeSkill = 3;

            /// List Type for quests
            var listTypeQuest = 4;

            /// List Type for marker
            var listTypeMarker = 5;

            /**
             * Overview View Model
             * @param {object} nonLocalizedMarkerTypes Non Localized Marker Types
             * @param {object} markerTypes Marker Types
             * @class
             */
            Overview.ViewModel = function(nonLocalizedMarkerTypes, markerTypes)
            {
                this.markerTypes = markerTypes;

                this.compareDialog = new ImplementationStatus.CompareDialog.ViewModel();

                this.isLoading = new ko.observable(false);
                this.errorOccured = new ko.observable(false); 

                this.currentListToShow = new ko.observable(-1);
                this.isNpcListSelected = new ko.computed(function() {
                    return this.currentListToShow() == listTypeNpc;
                }, this);
                this.isDialogListSelected = new ko.computed(function() {
                    return this.currentListToShow() == listTypeDialog;
                }, this);
                this.isItemListSelected = new ko.computed(function() {
                    return this.currentListToShow() == listTypeItem;
                }, this);
                this.isSkillListSelected = new ko.computed(function() {
                    return this.currentListToShow() == listTypeSkill;
                }, this);
                this.isQuestListSelected = new ko.computed(function() {
                    return this.currentListToShow() == listTypeQuest;
                }, this);
                this.isMarkerListSelected = new ko.computed(function() {
                    return this.currentListToShow() == listTypeMarker;
                }, this);

                this.npcList = new Overview.ImplementationStatusNpcList(this.isLoading, this.errorOccured, this.compareDialog);
                this.dialogList = new Overview.ImplementationStatusDialogList(this.isLoading, this.errorOccured, this.compareDialog);
                this.itemList = new Overview.ImplementationStatusItemList(this.isLoading, this.errorOccured, this.compareDialog);
                this.skillList = new Overview.ImplementationStatusSkillList(this.isLoading, this.errorOccured, this.compareDialog);
                this.questList = new Overview.ImplementationStatusQuestList(this.isLoading, this.errorOccured, this.compareDialog);
                this.markerList = new Overview.ImplementationStatusMarkerList(nonLocalizedMarkerTypes, this.isLoading, this.errorOccured, this.compareDialog);

                // Select first list user has access to
                var existingListType = parseInt(GoNorth.Util.getParameterFromUrl("listType"));
                var existingPage = parseInt(GoNorth.Util.getParameterFromUrl("page"));
                var compareId = GoNorth.Util.getParameterFromUrl("compareId");
                var preSelected = false;
                if(!isNaN(existingListType))
                {
                    preSelected = this.selectListByType(existingListType, existingPage, compareId);
                }

                if(!preSelected)
                {
                    this.selectFirstListWithRights();
                }
                
                var self = this;
                GoNorth.Util.onUrlParameterChanged(function() {
                    var listType = parseInt(GoNorth.Util.getParameterFromUrl("listType"));
                    if(!isNaN(listType) && listType != self.currentListToShow()) {
                        self.selectListByType(listType, null, null);
                    }
                });
            };

            Overview.ViewModel.prototype = {
                /**
                 * Selects the npc list
                 */
                selectNpcList: function() {
                    this.setCurrentListToShow(listTypeNpc);
                    this.npcList.init();
                },

                /**
                 * Selects the dialog list
                 */
                selectDialogList: function() {
                    this.setCurrentListToShow(listTypeDialog);
                    this.dialogList.init();
                },

                /**
                 * Selects the item list
                 */
                selectItemList: function() {
                    this.setCurrentListToShow(listTypeItem);
                    this.itemList.init();
                },

                /**
                 * Selects the item list
                 */
                selectSkillList: function() {
                    this.setCurrentListToShow(listTypeSkill);
                    this.skillList.init();
                },

                /**
                 * Selects the quest list
                 */
                selectQuestList: function() {
                    this.setCurrentListToShow(listTypeQuest);
                    this.questList.init();
                },

                /**
                 * Selects the marker list
                 */
                selectMarkerList: function() {
                    this.setCurrentListToShow(listTypeMarker);
                    this.markerList.init();
                },


                /**
                 * Sets the current list to show
                 * 
                 * @param {number} listType List Type to select
                 */
                setCurrentListToShow: function(listType) {
                    this.currentListToShow(listType);
                    var parameterValue = "listType=" + listType;
                    if(window.location.search)
                    {
                        GoNorth.Util.setUrlParameters(parameterValue);
                    }
                    else
                    {
                        GoNorth.Util.replaceUrlParameters(parameterValue);
                    }
                },

                /**
                 * Selects the first list the user has access to
                 */
                selectFirstListWithRights: function() {
                    if(GoNorth.ImplementationStatus.Overview.hasKortistoRights)
                    {
                        this.selectNpcList();
                    }
                    else if(GoNorth.ImplementationStatus.Overview.hasTaleRights)
                    {
                        this.selectDialogList();
                    }
                    else if(GoNorth.ImplementationStatus.Overview.hasStyrRights)
                    {
                        this.selectItemList();
                    }
                    else if(GoNorth.ImplementationStatus.Overview.hasEvneRights)
                    {
                        this.selectSkillList();
                    }
                    else if(GoNorth.ImplementationStatus.Overview.hasAikaRights)
                    {
                        this.selectQuestList();
                    }
                    else if(GoNorth.ImplementationStatus.Overview.hasKartaRights)
                    {
                        this.selectMarkerList();
                    }
                },

                /**
                 * Selects a list type by the type
                 * 
                 * @param {number} listType List Type to select
                 * @param {number} page Page to select
                 * @param {string} compareId Id of the object to open the compare dialog for
                 * @returns {bool} true if the List can be selected, else false
                 */
                selectListByType: function(listType, page, compareId) {
                    if(GoNorth.ImplementationStatus.Overview.hasKortistoRights && listType == listTypeNpc)
                    {
                        this.setPageFromUrl(this.npcList, page);
                        this.setInitialCompareIdFromUrl(this.npcList, compareId);
                        this.selectNpcList();
                        return true;
                    }
                    else if(GoNorth.ImplementationStatus.Overview.hasTaleRights && listType == listTypeDialog)
                    {
                        this.setPageFromUrl(this.dialogList, page);
                        this.setInitialCompareIdFromUrl(this.dialogList, compareId);
                        this.selectDialogList();
                        return true;
                    }
                    else if(GoNorth.ImplementationStatus.Overview.hasStyrRights && listType == listTypeItem)
                    {
                        this.setPageFromUrl(this.itemList, page);
                        this.setInitialCompareIdFromUrl(this.itemList, compareId);
                        this.selectItemList();
                        return true;
                    }
                    else if(GoNorth.ImplementationStatus.Overview.hasEvneRights && listType == listTypeSkill)
                    {
                        this.setPageFromUrl(this.skillList, page);
                        this.setInitialCompareIdFromUrl(this.skillList, compareId);
                        this.selectSkillList();
                        return true;
                    }
                    else if(GoNorth.ImplementationStatus.Overview.hasAikaRights && listType == listTypeQuest)
                    {
                        this.setPageFromUrl(this.questList, page);
                        this.setInitialCompareIdFromUrl(this.questList, compareId);
                        this.selectQuestList();
                        return true;
                    }
                    else if(GoNorth.ImplementationStatus.Overview.hasKartaRights && listType == listTypeMarker)
                    {
                        this.setPageFromUrl(this.markerList, page);
                        this.setInitialCompareIdFromUrl(this.markerList, compareId);
                        this.selectMarkerList();
                        return true;
                    }

                    return false;
                },

                /**
                 * Sets the page from url
                 * 
                 * @param {object} list List to update
                 * @param {number} page Page
                 */
                setPageFromUrl: function(list, page) {
                    if(list == null || isNaN(page) || page == null)
                    {
                        return;
                    }

                    list.setCurrentPage(page);
                },

                /**
                 * Sets the initial compare id
                 * 
                 * @param {object} list List to update
                 * @param {number} compareId Compare Id
                 */
                setInitialCompareIdFromUrl: function(list, compareId) {
                    if(list == null || compareId == null)
                    {
                        return;
                    }

                    list.setInitialCompareId(compareId);
                }
            };

        }(ImplementationStatus.Overview = ImplementationStatus.Overview || {}));
    }(GoNorth.ImplementationStatus = GoNorth.ImplementationStatus || {}));
}(window.GoNorth = window.GoNorth || {}));