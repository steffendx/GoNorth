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
            ObjectForm.IFlexField = function() {
                this.id = new ko.observable("");
                this.name = new ko.observable();
                this.scriptSettings = new ObjectForm.FlexFieldScriptSettings();
            }

            ObjectForm.IFlexField.prototype = {
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
                deserializeValue: function(value) { }
            }

        }(FlexFieldDatabase.ObjectForm = FlexFieldDatabase.ObjectForm || {}));
    }(GoNorth.FlexFieldDatabase = GoNorth.FlexFieldDatabase || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(FlexFieldDatabase) {
        (function(ObjectForm) {

            /**
             * Type of the single text line field
             */
            ObjectForm.FlexFieldTypeSingleLine = 0;

            /**
             * Class for a single text line field
             * 
             * @class
             */
            ObjectForm.SingleLineFlexField = function() {
                ObjectForm.IFlexField.apply(this);

                this.value = new ko.observable("");
            }

            ObjectForm.SingleLineFlexField.prototype = jQuery.extend(true, {}, ObjectForm.IFlexField.prototype);

            /**
             * Returns the type of the field
             * 
             * @returns {int} Type of the field
             */
            ObjectForm.SingleLineFlexField.prototype.getType = function() { return ObjectForm.FlexFieldTypeSingleLine; }

            /**
             * Returns the template name
             * 
             * @returns {string} Template Name
             */
            ObjectForm.SingleLineFlexField.prototype.getTemplateName = function() { return "gn-singleLineField"; }

            /**
             * Returns if the field can be exported to a script
             * 
             * @returns {bool} true if the value can be exported to a script, else false
             */
            ObjectForm.SingleLineFlexField.prototype.canExportToScript = function() { return true; }

            /**
             * Serializes the value to a string
             * 
             * @returns {string} Value of the field as a string
             */
            ObjectForm.SingleLineFlexField.prototype.serializeValue = function() { return this.value(); }

            /**
             * Deserializes a value from a string
             * 
             * @param {string} value Value to Deserialize
             */
            ObjectForm.SingleLineFlexField.prototype.deserializeValue = function(value) { this.value(value); }

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
                ObjectForm.IFlexField.apply(this);

                this.value = new ko.observable("");
            }

            ObjectForm.MultiLineFlexField.prototype = jQuery.extend(true, {}, ObjectForm.IFlexField.prototype);

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
                ObjectForm.IFlexField.apply(this);

                this.value = new ko.observable(0.0);
            }

            ObjectForm.NumberFlexField.prototype = jQuery.extend(true, {}, ObjectForm.IFlexField.prototype);

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
             * Class for managing flex fields
             * 
             * @class
             */
            ObjectForm.FlexFieldManager = function() {
                this.fields = new ko.observableArray();
            }

            ObjectForm.FlexFieldManager.prototype = {
                /**
                 * Adds a single line field to the manager
                 * 
                 * @param {string} name Name of the field
                 */
                addSingleLineField: function(name) {
                    this.addField(ObjectForm.FlexFieldTypeSingleLine, name);
                },

                /**
                 * Adds a multi line field to the manager
                 * 
                 * @param {string} name Name of the field
                 */
                addMultiLineField: function(name) {
                    this.addField(ObjectForm.FlexFieldTypeMultiLine, name);
                },

                /**
                 * Adds a number field to the manager
                 * 
                 * @param {string} name Name of the field
                 */
                addNumberField: function(name) {
                    this.addField(ObjectForm.FlexFieldTypeNumber, name);
                },

                /**
                 * Adds a field to the manager
                 * 
                 * @param {int} fieldType Type of the field
                 * @param {string} name Name of the field
                 */
                addField: function(fieldType, name) {
                    var field = this.resolveFieldByType(fieldType);
                    if(!field)
                    {
                        throw "Unknown field type";
                    }

                    field.name(name);
                    this.fields.push(field);
                },

                /**
                 * Resolves a field by a type
                 * 
                 * @param {int} fieldType Field Type
                 */
                resolveFieldByType: function(fieldType) {
                    switch(fieldType)
                    {
                    case ObjectForm.FlexFieldTypeSingleLine:
                        return new ObjectForm.SingleLineFlexField();
                    case ObjectForm.FlexFieldTypeMultiLine:
                        return new ObjectForm.MultiLineFlexField();
                    case ObjectForm.FlexFieldTypeNumber:
                        return new ObjectForm.NumberFlexField();
                    }

                    return null;
                },


                /**
                 * Deletes a field
                 * 
                 * @param {IFlexField} field Field to delete
                 */
                deleteField: function(field) {
                    this.fields.remove(field);
                },


                /**
                 * Moves a field up
                 * 
                 * @param {IFlexField} field Field to move up
                 */
                moveFieldUp: function(field) {
                    var fieldIndex = this.fields.indexOf(field);
                    if(fieldIndex >= this.fields().length - 1 || fieldIndex < 0)
                    {
                        return;
                    }

                    this.swapFields(fieldIndex, fieldIndex + 1);
                },

                /**
                 * Moves a field down
                 * 
                 * @param {IFlexField} field Field to move down
                 */
                moveFieldDown: function(field) {
                    var fieldIndex = this.fields.indexOf(field);
                    if(fieldIndex <= 0)
                    {
                        return;
                    }

                    this.swapFields(fieldIndex, fieldIndex - 1);
                },

                /**
                 * Swaps to fields
                 * 
                 * @param {int} index1 Index of the first field
                 * @param {int} index2 Index of the second field
                 */
                swapFields: function(index1, index2) {
                    // Needs to remove and add again for multiline field
                    var fieldValue1 = this.fields()[index1];
                    var fieldValue2 = this.fields()[index2];
                    this.fields.remove(fieldValue1);
                    this.fields.remove(fieldValue2);

                    var firstIndex = index1;
                    var firstItem = fieldValue2;
                    var secondIndex = index2;
                    var secondItem = fieldValue1;
                    if(index1 > index2)
                    {
                        firstIndex = index2;
                        firstItem = fieldValue1;
                        secondIndex = index1;
                        secondItem = fieldValue2;
                    }

                    if(firstIndex >= this.fields().length)
                    {
                        this.fields.push(firstItem);
                    }
                    else
                    {
                        this.fields.splice(firstIndex, 0, firstItem);
                    }

                    if(secondIndex >= this.fields().length)
                    {
                        this.fields.push(secondItem);
                    }
                    else
                    {
                        this.fields.splice(secondIndex, 0, secondItem);
                    }
                },


                /**
                 * Serializes the fields to an array with values
                 * 
                 * @returns {object[]} Serialized values
                 */
                serializeFields: function() {
                    var serializedValues = [];
                    var fields = this.fields();
                    for(var curField = 0; curField < fields.length; ++curField)
                    {
                        var serializedValue = {
                            id: fields[curField].id(),
                            fieldType: fields[curField].getType(),
                            name: fields[curField].name(),
                            value: fields[curField].serializeValue(),
                            scriptSettings: fields[curField].scriptSettings.serialize()
                        };
                        serializedValues.push(serializedValue);
                    }

                    return serializedValues;
                },

                /**
                 * Deserializes saved fields fields
                 * 
                 * @param {objec[]} serializedValues Serialized values 
                 */
                deserializeFields: function(serializedValues) {
                    var fields = [];
                    for(var curField = 0; curField < serializedValues.length; ++curField)
                    {
                        var deserializedField = this.resolveFieldByType(serializedValues[curField].fieldType);
                        deserializedField.id(serializedValues[curField].id);
                        deserializedField.name(serializedValues[curField].name);
                        deserializedField.deserializeValue(serializedValues[curField].value);
                        deserializedField.scriptSettings.deserialize(serializedValues[curField].scriptSettings);
                        fields.push(deserializedField);
                    }
                    this.fields(fields);
                },

                /**
                 * Syncs the field ids back after save
                 * 
                 * @param {object} flexFieldObjectData Response flex field object data after save
                 */
                syncFieldIds: function(flexFieldObjectData) {
                    var fieldLookup = {};
                    for(var curField = 0; curField < flexFieldObjectData.fields.length; ++curField)
                    {
                        fieldLookup[flexFieldObjectData.fields[curField].name] = flexFieldObjectData.fields[curField].id;
                    }

                    var fields = this.fields();
                    for(var curField = 0; curField < fields.length; ++curField)
                    {
                        fields[curField].id(fieldLookup[fields[curField].name()]);
                    }
                },
            }

        }(FlexFieldDatabase.ObjectForm = FlexFieldDatabase.ObjectForm || {}));
    }(GoNorth.FlexFieldDatabase = GoNorth.FlexFieldDatabase || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(FlexFieldDatabase) {
        (function(ObjectForm) {

            /**
             * Flex Field Handling Viewmodel with pure field handling
             * @class
             */
            ObjectForm.FlexFieldHandlingViewModel = function()
            {
                this.fieldManager = new GoNorth.FlexFieldDatabase.ObjectForm.FlexFieldManager();

                this.showFieldCreateEditDialog = new ko.observable(false);
                this.isEditingField = new ko.observable(false);
                this.createEditFieldName = new ko.observable("");
                this.createEditFieldDeferred = null;

                this.showConfirmFieldDeleteDialog = new ko.observable(false);
                this.fieldToDelete = null;

                this.showFieldScriptSettingsDialog = new ko.observable(false);
                this.dontExportFieldToScript = new ko.observable();
                this.additionalFieldScriptNames = new ko.observable();
                this.scriptSettingsField = null;
            };

            ObjectForm.FlexFieldHandlingViewModel.prototype = {
                /**
                 * Function gets called after a new field was added
                 */
                onFieldAdded: function() {

                },

                /**
                 * Adds a single line field to the object
                 */
                addSingleLineField: function() {
                    var self = this;
                    this.openCreateEditFieldDialog(false, "").done(function(name) {
                        self.fieldManager.addSingleLineField(name);
                        self.onFieldAdded();
                    });
                },

                /**
                 * Adds a multi line field to the object
                 */
                addMultiLineField: function() {
                    var self = this;
                    this.openCreateEditFieldDialog(false, "").done(function(name) {
                        self.fieldManager.addMultiLineField(name);
                        self.onFieldAdded();
                    });
                },

                /**
                 * Adds a number field to the object
                 */
                addNumberField: function() {
                    var self = this;
                    this.openCreateEditFieldDialog(false, "").done(function(name) {
                        self.fieldManager.addNumberField(name);
                        self.onFieldAdded();
                    });
                },


                /**
                 * Renames a field
                 * 
                 * @param {IFlexField} field Object Field
                 */
                renameField: function(field) {
                    this.openCreateEditFieldDialog(true, field.name()).done(function(name) {
                        field.name(name);
                    });
                },


                /**
                 * Opens the create/edit field dialog
                 * 
                 * @param {bool} isEdit true if its an edit operation, else false
                 * @param {string} existingName Existing name of the field
                 * @returns {jQuery.Deferred} Deferred which will be resolved once the user presses save
                 */
                openCreateEditFieldDialog: function(isEdit, existingName) {
                    this.createEditFieldDeferred = new jQuery.Deferred();

                    this.isEditingField(isEdit);
                    if(existingName)
                    {
                        this.createEditFieldName(existingName);
                    }
                    else
                    {
                        this.createEditFieldName("");
                    }

                    GoNorth.Util.setupValidation("#gn-fieldCreateEditForm");
                    this.showFieldCreateEditDialog(true);

                    return this.createEditFieldDeferred.promise();
                },

                /**
                 * Saves the field
                 */
                saveField: function() {
                    if(!jQuery("#gn-fieldCreateEditForm").valid())
                    {
                        return;
                    }

                    if(this.createEditFieldDeferred)
                    {
                        this.createEditFieldDeferred.resolve(this.createEditFieldName());
                    }
                    this.createEditFieldDeferred = null;
                    this.showFieldCreateEditDialog(false);
                },

                /**
                 * Cancels the field dialog
                 */
                cancelFieldDialog: function() {
                    if(this.createEditFieldDeferred)
                    {
                        this.createEditFieldDeferred.reject();
                    }
                    this.createEditFieldDeferred = null; 
                    this.showFieldCreateEditDialog(false);
                },


                /**
                 * Moves a field up
                 * 
                 * @param {IFlexField} field Field to move up
                 */
                moveFieldUp: function(field) {
                    this.fieldManager.moveFieldUp(field);
                },

                /**
                 * Moves a field down
                 * 
                 * @param {IFlexField} field Field to move down
                 */
                moveFieldDown: function(field) {
                    this.fieldManager.moveFieldDown(field);
                },


                /**
                 * Opens the delete field dialog
                 * 
                 * @param {IFlexField} field Field to delete
                 */
                openConfirmDeleteFieldDialog: function(field) {
                    this.showConfirmFieldDeleteDialog(true);
                    this.fieldToDelete = field;
                },

                /**
                 * Closes the confirm field delete dialog
                 */
                closeConfirmFieldDeleteDialog: function() {
                    this.showConfirmFieldDeleteDialog(false);
                    this.fieldToDelete = null;
                },

                /**
                 * Deletes the field for which the dialog is opened
                 */
                deleteField: function() {
                    this.fieldManager.deleteField(this.fieldToDelete);
                    this.closeConfirmFieldDeleteDialog();
                },


                /**
                 * Opens the script settings for a field
                 * 
                 * @param {IFlexField} field Field for which the settings should be opened
                 */
                openScriptSettings: function(field) {
                    this.showFieldScriptSettingsDialog(true);
                    this.dontExportFieldToScript(field.scriptSettings.dontExportToScript);
                    this.additionalFieldScriptNames(field.scriptSettings.additionalScriptNames);
                    this.scriptSettingsField = field;
                },

                /**
                 * Saves the field script settings
                 */
                saveFieldScriptSettings: function() {
                    this.scriptSettingsField.scriptSettings.dontExportToScript = this.dontExportFieldToScript();
                    this.scriptSettingsField.scriptSettings.additionalScriptNames = this.additionalFieldScriptNames();
                    this.closeFieldScriptSettingsDialog();
                },

                /**
                 * Closes the field script settings dialog
                 */
                closeFieldScriptSettingsDialog: function() {
                    this.showFieldScriptSettingsDialog(false);
                    this.scriptSettingsField = null;
                }
            };

        }(FlexFieldDatabase.ObjectForm = FlexFieldDatabase.ObjectForm || {}));
    }(GoNorth.FlexFieldDatabase = GoNorth.FlexFieldDatabase || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(FlexFieldDatabase) {
        (function(ObjectForm) {

            /**
             * Object Form Base View Model
             * @param {string} apiControllerName Api Controller name
             * @param {string} lockName Name of the resource used for the lock for an object of this type
             * @param {string} templateLockName Name of the resource used for the lock for a template of this type
             * @param {string} kirjaApiMentionedMethod Method of the kirja api which is used to load the pages in which the object is mentioned
             * @param {string} kartaApiMentionedMethod Method of the karta api which is used to load the maps in which the object is mentioned
             * @class
             */
            ObjectForm.BaseViewModel = function(apiControllerName, lockName, templateLockName, kirjaApiMentionedMethod, kartaApiMarkedMethod)
            {
                GoNorth.FlexFieldDatabase.ObjectForm.FlexFieldHandlingViewModel.apply(this);

                this.apiControllerName = apiControllerName;

                this.lockName = lockName;
                this.templateLockName = templateLockName;

                this.kirjaApiMentionedMethod = kirjaApiMentionedMethod;
                this.kartaApiMarkedMethod = kartaApiMarkedMethod;

                this.isTemplateMode = new ko.observable(false);
                if(GoNorth.Util.getParameterFromHash("template"))
                {
                    this.isTemplateMode(true);
                }

                this.id = new ko.observable("");
                var paramId = GoNorth.Util.getParameterFromHash("id");
                if(paramId)
                {
                    this.id(paramId);
                }

                this.objectImageUploadUrl = new ko.computed(function() {
                    if(this.isTemplateMode())
                    {
                        return "/api/" + this.apiControllerName + "/FlexFieldTemplateImageUpload?id=" + this.id();
                    }
                    else
                    {
                        return "/api/" + this.apiControllerName + "/FlexFieldImageUpload?id=" + this.id();
                    }
                }, this);

                var templateId = GoNorth.Util.getParameterFromHash("templateId");
                this.templateId = templateId;
                this.parentFolderId = GoNorth.Util.getParameterFromHash("folderId");
                
                this.isReadonly = new ko.observable(false);
                this.lockedByUser = new ko.observable("");

                this.isLoading = new ko.observable(false);

                this.isImplemented = new ko.observable(false);
                this.compareDialog = new GoNorth.ImplementationStatus.CompareDialog.ViewModel();

                this.objectName = new ko.observable("");
                this.imageFilename = new ko.observable("");
                this.objectTags = new ko.observableArray();
                this.existingObjectTags = new ko.observableArray();

                this.objectNameDisplay = new ko.computed(function() {
                    var name = this.objectName();
                    if(name)
                    {
                        return " - " + name;
                    }

                    return "";
                }, this);

                this.showConfirmObjectDeleteDialog = new ko.observable(false);

                this.referencedInQuests = new ko.observableArray();
                this.loadingReferencedInQuests = new ko.observable(false);
                this.errorLoadingReferencedInQuests = new ko.observable(false);

                this.mentionedInKirjaPages = new ko.observableArray();
                this.loadingMentionedInKirjaPages = new ko.observable(false);
                this.errorLoadingMentionedInKirjaPages = new ko.observable(false);

                this.markedInKartaMaps = new ko.observableArray();
                this.loadingMarkedInKartaMaps = new ko.observable(false);
                this.errorLoadingMarkedInKartaMaps = new ko.observable(false);

                this.referencedInTaleDialogs = new ko.observableArray();
                this.loadingReferencedInTaleDialogs = new ko.observable(false);
                this.errorLoadingReferencedInTaleDialogs = new ko.observable(false);

                this.errorOccured = new ko.observable(false);
                this.additionalErrorDetails = new ko.observable("");
                
                GoNorth.Util.setupValidation("#gn-objectFields");
            };

            
            ObjectForm.BaseViewModel.prototype = jQuery.extend({ }, GoNorth.FlexFieldDatabase.ObjectForm.FlexFieldHandlingViewModel.prototype);

            /**
             * Loads additional dependencies
             */
            ObjectForm.BaseViewModel.prototype.loadAdditionalDependencies = function() {

            };

            /**
             * Parses additional data from a loaded object
             * 
             * @param {object} data Data returned from the webservice
             */
            ObjectForm.BaseViewModel.prototype.parseAdditionalData = function(data) {

            };

            /**
             * Sets Additional save data
             * 
             * @param {object} data Save data
             * @returns {object} Save data with additional values
             */
            ObjectForm.BaseViewModel.prototype.setAdditionalSaveData = function(data) {
                return data;
            };



            /**
             * Initializes the form, called by implementations
             */
            ObjectForm.BaseViewModel.prototype.init = function() {
                if(this.id())
                {
                    this.loadObjectData(this.id(), this.isTemplateMode());
                    
                    if(GoNorth.FlexFieldDatabase.ObjectForm.hasAikaRights && !this.isTemplateMode())
                    {
                        this.loadAikaQuests();
                    }

                    if(GoNorth.FlexFieldDatabase.ObjectForm.hasKirjaRights && !this.isTemplateMode())
                    {
                        this.loadKirjaPages();
                    }

                    if(GoNorth.FlexFieldDatabase.ObjectForm.hasKartaRights && !this.isTemplateMode())
                    {
                        this.loadKartaMaps();
                    }

                    if(GoNorth.FlexFieldDatabase.ObjectForm.hasTaleRights && !this.isTemplateMode())
                    {
                        this.loadTaleDialogs();
                    } 

                    this.loadAdditionalDependencies();

                    this.acquireLock();
                }
                else if(this.templateId)
                {
                    this.loadObjectData(this.templateId, true);
                }
                this.loadExistingObjectTags();
            };

            /**
             * Resets the error state
             */
            ObjectForm.BaseViewModel.prototype.resetErrorState = function() {
                this.errorOccured(false);
                this.additionalErrorDetails("");
            };

            /**
             * Loads all existing objects tags for the tag dropdown list
             */
            ObjectForm.BaseViewModel.prototype.loadExistingObjectTags = function() {
                var self = this;
                jQuery.ajax({ 
                    url: "/api/" + this.apiControllerName + "/FlexFieldObjectTags", 
                    type: "GET"
                }).done(function(data) {
                    self.existingObjectTags(data);
                }).fail(function(xhr) {
                    self.errorOccured(true);
                });
            };

            /**
             * Loads the object data
             * 
             * @param {string} id Id of the data to load
             * @param {bool} fromTemplate true if the value should be loaded from a template
             */
            ObjectForm.BaseViewModel.prototype.loadObjectData = function(id, fromTemplate) {
                var url = "/api/" + this.apiControllerName + "/FlexFieldObject";
                if(fromTemplate)
                {
                    url = "/api/" + this.apiControllerName + "/FlexFieldTemplate"
                }
                url += "?id=" + id;

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
                        return;
                    }
                    
                    if(!fromTemplate)
                    {
                        self.templateId = !self.isTemplateMode() ? data.templateId : "";
                        self.isImplemented(!self.isTemplateMode() ? data.isImplemented : false);
                    }

                    if(!fromTemplate || self.isTemplateMode())
                    {
                        self.objectName(data.name);
                    }
                    else
                    {
                        self.objectName("");
                    }
                    self.parseAdditionalData(data);
                    
                    self.imageFilename(data.imageFile);
                    self.fieldManager.deserializeFields(data.fields);
                    self.objectTags(data.tags);
                }).fail(function(xhr) {
                    self.isLoading(false);
                    self.errorOccured(true);
                });
            };

            /**
             * Saves the form
             */
            ObjectForm.BaseViewModel.prototype.save = function() {
                this.sendSaveRequest(false);
            };

            /**
             * Saves the form and distribute the fields to objects
             */
            ObjectForm.BaseViewModel.prototype.saveAndDistributeFields = function() {
                this.sendSaveRequest(true);
            };

            /**
             * Saves the form
             * 
             * @param {bool} distributeFields true if the fields should be distributed, else false
             */
            ObjectForm.BaseViewModel.prototype.sendSaveRequest = function(distributeFields) {
                if(!jQuery("#gn-objectFields").valid())
                {
                    return;
                }

                // Send Data
                var serializedFields = this.fieldManager.serializeFields();
                var requestObject = {
                    templateId: !this.isTemplateMode() ? this.templateId : "",
                    name: this.objectName(),
                    fields: serializedFields,
                    tags: this.objectTags()
                };
                requestObject = this.setAdditionalSaveData(requestObject);

                // Create mode values
                if(!this.isTemplateMode() && !this.id())
                {
                    requestObject.parentFolderId = this.parentFolderId;
                    if(this.imageFilename())
                    {
                        requestObject.imageFile = this.imageFilename();
                    }
                }

                var url = "";
                if(this.isTemplateMode())
                {
                    if(this.id())
                    {
                        url = "/api/" + this.apiControllerName + "/UpdateFlexFieldTemplate?id=" + this.id();
                    }
                    else
                    {
                        url = "/api/" + this.apiControllerName + "/CreateFlexFieldTemplate";
                    }
                }
                else
                {
                    if(this.id())
                    {
                        url = "/api/" + this.apiControllerName + "/UpdateFlexFieldObject?id=" + this.id();
                    }
                    else
                    {
                        url = "/api/" + this.apiControllerName + "/CreateFlexFieldObject";
                    }
                }

                this.isLoading(true);
                this.resetErrorState();
                var self = this;
                jQuery.ajax({ 
                    url: url, 
                    headers: GoNorth.Util.generateAntiForgeryHeader(),
                    data: JSON.stringify(requestObject), 
                    type: "POST",
                    contentType: "application/json"
                }).done(function(data) {
                    if(!self.id())
                    {
                        self.id(data.id);
                        var idAdd = "id=" + data.id;
                        if(self.isTemplateMode())
                        {
                            window.location.hash += "&" + idAdd;
                        }
                        else
                        {
                            window.location.hash = idAdd;
                        }
                        self.acquireLock();
                    }

                    if(!self.isTemplateMode())
                    {
                        self.fieldManager.syncFieldIds(data);
                        self.isImplemented(data.isImplemented);
                    }

                    if(distributeFields)
                    {
                        self.distributeFields();
                    }
                    else
                    {
                        self.isLoading(false);
                    }

                    self.callObjectGridRefresh();
                }).fail(function(xhr) {
                    self.isLoading(false);
                    self.errorOccured(true);
                });
            };

            /**
             * Distributes the fields
             */
            ObjectForm.BaseViewModel.prototype.distributeFields = function() {
                var self = this;
                jQuery.ajax({ 
                    url: "/api/" + this.apiControllerName + "/DistributeFlexFieldTemplateFields?id=" + this.id(), 
                    headers: GoNorth.Util.generateAntiForgeryHeader(),
                    type: "POST",
                    contentType: "application/json"
                }).done(function(data) {
                    self.isLoading(false);
                }).fail(function(xhr) {
                    self.isLoading(false);
                    self.errorOccured(true);
                });
            };

            /**
             * Opens the delete object dialog
             */
            ObjectForm.BaseViewModel.prototype.openDeleteObjectDialog = function() {
                this.showConfirmObjectDeleteDialog(true);
            };

            /**
             * Closes the confirm delete dialog
             */
            ObjectForm.BaseViewModel.prototype.closeConfirmObjectDeleteDialog = function() {
                this.showConfirmObjectDeleteDialog(false);
            };

            /**
             * Deletes the object
             */
            ObjectForm.BaseViewModel.prototype.deleteObject = function() {
                var url = "/api/" + this.apiControllerName + "/DeleteFlexFieldObject";
                if(this.isTemplateMode())
                {
                    url = "/api/" + this.apiControllerName + "/DeleteFlexFieldTemplate"
                }
                url += "?id=" + this.id();

                this.isLoading(true);
                this.resetErrorState();
                var self = this;
                jQuery.ajax({ 
                    url: url, 
                    headers: GoNorth.Util.generateAntiForgeryHeader(),
                    type: "DELETE"
                }).done(function(data) {
                    self.callObjectGridRefresh();
                    self.closeConfirmObjectDeleteDialog();
                    window.close();
                }).fail(function(xhr) {
                    self.isLoading(false);
                    self.errorOccured(true);
                    self.closeConfirmObjectDeleteDialog();

                    // If object is related to anything that prevents deleting a bad request (400) will be returned
                    if(xhr.status == 400 && xhr.responseText)
                    {
                        self.additionalErrorDetails(xhr.responseText);
                    }
                });
            };


            /**
             * Callback if a new image file was uploaded
             * 
             * @param {string} image Image Filename that was uploaded
             */
            ObjectForm.BaseViewModel.prototype.imageUploaded = function(image) {
                this.imageFilename(image);
                this.callObjectGridRefresh();
            };

            /**
             * Callback if an error occured during upload
             * 
             * @param {string} errorMessage Error Message
             * @param {object} xhr Xhr Object
             */
            ObjectForm.BaseViewModel.prototype.imageUploadError = function(errorMessage, xhr) {
                this.errorOccured(true);
                if(xhr && xhr.responseText)
                {
                    this.additionalErrorDetails(xhr.responseText);
                }
                else
                {
                    this.additionalErrorDetails(errorMessage);
                }
            };


            /**
             * Opens the compare dialog for the current object
             * 
             * @returns {jQuery.Deferred} Deferred which gets resolved after the object is marked as implemented
             */
            ObjectForm.BaseViewModel.prototype.openCompareDialogForObject = function() {
                var def = new jQuery.Deferred();
                def.reject("Not implemented");
                return def.promise();
            };

            /**
             * Opens the compare dialog
             */
            ObjectForm.BaseViewModel.prototype.openCompareDialog = function() {
                var self = this;
                this.openCompareDialogForObject().done(function() {
                    self.isImplemented(true);
                });
            };


            /**
             * Loads the Aika quests
             */
            ObjectForm.BaseViewModel.prototype.loadAikaQuests = function() {
                this.loadingReferencedInQuests(true);
                this.errorLoadingReferencedInQuests(false);
                var self = this;
                jQuery.ajax({ 
                    url: "/api/AikaApi/GetQuestsObjectIsReferenced?objectId=" + this.id(), 
                    type: "GET"
                }).done(function(data) {
                    self.referencedInQuests(data);
                    self.loadingReferencedInQuests(false);
                }).fail(function(xhr) {
                    self.errorLoadingReferencedInQuests(true);
                    self.loadingReferencedInQuests(false);
                });
            };

            /**
             * Builds the url for an Aika quest
             * 
             * @param {object} quest Quest to build the url
             * @returns {string} Url for quest
             */
            ObjectForm.BaseViewModel.prototype.buildAikaQuestUrl = function(quest) {
                return "/Aika/Quest#id=" + quest.id;
            };


            /**
             * Loads the kirja pages
             */
            ObjectForm.BaseViewModel.prototype.loadKirjaPages = function() {
                this.loadingMentionedInKirjaPages(true);
                this.errorLoadingMentionedInKirjaPages(false);
                var self = this;
                jQuery.ajax({ 
                    url: "/api/KirjaApi/" + this.kirjaApiMentionedMethod + this.id(), 
                    type: "GET"
                }).done(function(data) {
                    self.mentionedInKirjaPages(data);
                    self.loadingMentionedInKirjaPages(false);
                }).fail(function(xhr) {
                    self.errorLoadingMentionedInKirjaPages(true);
                    self.loadingMentionedInKirjaPages(false);
                });
            };

            /**
             * Builds the url for a Kirja page
             * 
             * @param {object} page Page to build the url for
             * @returns {string} Url for the page
             */
            ObjectForm.BaseViewModel.prototype.buildKirjaPageUrl = function(page) {
                return "/Kirja#id=" + page.id;
            };


            /**
             * Loads the karta maps
             */
            ObjectForm.BaseViewModel.prototype.loadKartaMaps = function() {
                this.loadingMarkedInKartaMaps(true);
                this.errorLoadingMarkedInKartaMaps(false);
                var self = this;
                jQuery.ajax({ 
                    url: "/api/KartaApi/" + this.kartaApiMarkedMethod + this.id(), 
                    type: "GET"
                }).done(function(data) {
                    for(var curMap = 0; curMap < data.length; ++curMap)
                    {
                        data[curMap].tooltip = self.buildKartaMapMarkerCountTooltip(data[curMap]);
                    }
                    self.markedInKartaMaps(data);
                    self.loadingMarkedInKartaMaps(false);
                }).fail(function(xhr) {
                    self.errorLoadingMarkedInKartaMaps(true);
                    self.loadingMarkedInKartaMaps(false);
                });
            };

            /**
             * Builds the Tooltip for a marker count
             * 
             * @param {object} map Map to build the tooltip for
             * @returns {string} Tooltip for marker count
             */
            ObjectForm.BaseViewModel.prototype.buildKartaMapMarkerCountTooltip = function(map) {
                return GoNorth.FlexFieldDatabase.ObjectForm.Localization.MarkedInMapNTimes.replace("{0}", map.markerIds.length);
            };

            /**
             * Builds the url for a Karta map
             * 
             * @param {object} map Map to build the url for
             * @returns {string} Url for the map
             */
            ObjectForm.BaseViewModel.prototype.buildKartaMapUrl = function(map) {
                var url = "/Karta#id=" + map.mapId;
                if(map.markerIds.length == 1)
                {
                    url += "&zoomOnMarkerId=" + map.markerIds[0] + "&zoomOnMarkerType=" + map.mapMarkerType
                }
                return url;
            };


            /**
             * Loads the tale dialogs
             */
            ObjectForm.BaseViewModel.prototype.loadTaleDialogs = function() {
                this.loadingReferencedInTaleDialogs(true);
                this.errorLoadingReferencedInTaleDialogs(false);
                var self = this;
                jQuery.ajax({ 
                    url: "/api/TaleApi/GetDialogsObjectIsReferenced?objectId=" + this.id(), 
                    type: "GET"
                }).done(function(dialogs) {
                    var npcIds = [];
                    for(var curDialog = 0; curDialog < dialogs.length; ++curDialog)
                    {
                        if(dialogs[curDialog].relatedObjectId != self.id())
                        {
                            npcIds.push(dialogs[curDialog].relatedObjectId);
                        }
                    }

                    if(npcIds.length == 0)
                    {
                        self.referencedInTaleDialogs([]);
                        self.loadingReferencedInTaleDialogs(false);
                        return;
                    }

                    // Get Npc names of the dialog npcs
                    jQuery.ajax({ 
                        url: "/api/KortistoApi/ResolveFlexFieldObjectNames", 
                        headers: GoNorth.Util.generateAntiForgeryHeader(),
                        data: JSON.stringify(npcIds), 
                        type: "POST",
                        contentType: "application/json"
                    }).done(function(npcNames) {
                        self.referencedInTaleDialogs(npcNames);
                        self.loadingReferencedInTaleDialogs(false);
                    }).fail(function(xhr) {
                        self.errorLoadingReferencedInTaleDialogs(true);
                        self.loadingReferencedInTaleDialogs(false);
                    });
                }).fail(function(xhr) {
                    self.errorLoadingReferencedInTaleDialogs(true);
                    self.loadingReferencedInTaleDialogs(false);
                });
            };

            /**
             * Builds the url for a Tale dialog
             * 
             * @param {object} dialogNpc Npc for which to open the dialog
             * @returns {string} Url for the dialog
             */
            ObjectForm.BaseViewModel.prototype.buildTaleDialogUrl = function(dialogNpc) {
                return "/Tale#npcId=" + dialogNpc.id;
            };


            /**
             * Acquires a lock
             */
            ObjectForm.BaseViewModel.prototype.acquireLock = function() {
                var category = this.lockName;
                if(this.isTemplateMode())
                {
                    category = this.templateLockName;
                }

                var self = this;
                GoNorth.LockService.acquireLock(category, this.id()).done(function(isLocked, lockedUsername) {
                    if(isLocked)
                    {
                        self.isReadonly(true);
                        self.lockedByUser(lockedUsername);
                    }
                }).fail(function() {
                    self.errorOccured(true);
                    self.isReadonly(true);
                });
            };


            /**
             * Calls the refresh for the object grid of the parent window
             */
            ObjectForm.BaseViewModel.prototype.callObjectGridRefresh = function() {
                if(window.refreshFlexFieldObjectGrid)
                {
                    window.refreshFlexFieldObjectGrid();
                }
            };

        }(FlexFieldDatabase.ObjectForm = FlexFieldDatabase.ObjectForm || {}));
    }(GoNorth.FlexFieldDatabase = GoNorth.FlexFieldDatabase || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(Kortisto) {
        (function(Npc) {

            /**
             * Npc View Model
             * @class
             */
            Npc.ViewModel = function()
            {
                GoNorth.FlexFieldDatabase.ObjectForm.BaseViewModel.apply(this, [ "KortistoApi", "KortistoNpc", "KortistoTemplate", "GetPagesByNpc?npcId=", "GetMapsByNpcId?npcId=" ]);

                this.objectDialog = new GoNorth.ChooseObjectDialog.ViewModel();
                this.inventoryItems = new ko.observableArray();
                this.showConfirmItemRemoveDialog = new ko.observable(false);
                this.itemToRemove = null;
                this.isLoadingInventory = new ko.observable(false);
                this.loadingInventoryError = new ko.observable(false);

                this.isPlayerNpc = new ko.observable(false);

                this.showMarkAsPlayerDialog = new ko.observable(false);

                this.dialogExists = new ko.observable(false);
                this.dialogImplemented = new ko.observable(false);

                this.init();

                if(GoNorth.FlexFieldDatabase.ObjectForm.hasImplementationStatusTrackerRights && GoNorth.FlexFieldDatabase.ObjectForm.hasTaleRights && this.id())
                {
                    this.loadDialogImplementationState();
                }
            };

            Npc.ViewModel.prototype = jQuery.extend({ }, GoNorth.FlexFieldDatabase.ObjectForm.BaseViewModel.prototype);

            /**
             * Parses additional data from a loaded object
             * 
             * @param {object} data Data returned from the webservice
             */
            Npc.ViewModel.prototype.parseAdditionalData = function(data) {
                if(!this.isTemplateMode())
                {
                    this.isPlayerNpc(data.isPlayerNpc);
                }

                if(data.inventory)
                {
                    this.loadInventory(data.inventory);
                }
            };

            /**
             * Opens the compare dialog for the current object
             * 
             * @returns {jQuery.Deferred} Deferred which gets resolved after the object is marked as implemented
             */
            Npc.ViewModel.prototype.openCompareDialogForObject = function() {
                return this.compareDialog.openNpcCompare(this.id(), this.objectName());
            };

            /**
             * Loads the state of the dialog implementation state
             */
            Npc.ViewModel.prototype.loadDialogImplementationState = function() {
                var self = this;
                jQuery.ajax({ 
                    url: "/api/TaleApi/IsDialogImplementedByRelatedObjectId?relatedObjectId=" + this.id(), 
                    type: "GET"
                }).done(function(data) {
                    self.dialogExists(data.exists);
                    self.dialogImplemented(data.isImplemented);
                }).fail(function(xhr) {
                    self.errorOccured(true);
                });
            }

            /**
             * Loads the inventory
             * 
             * @param {object[]} inventory Inventory to load
             */
            Npc.ViewModel.prototype.loadInventory = function(inventory) {
                var inventoryItemIds = [];
                var itemLookup = {};
                for(var curItem = 0; curItem < inventory.length; ++curItem)
                {
                    inventoryItemIds.push(inventory[curItem].itemId);
                    itemLookup[inventory[curItem].itemId] = inventory[curItem];
                }

                this.isLoadingInventory(true);
                this.loadingInventoryError(false);
                var self = this;
                jQuery.ajax({ 
                    url: "/api/StyrApi/ResolveFlexFieldObjectNames", 
                    headers: GoNorth.Util.generateAntiForgeryHeader(),
                    data: JSON.stringify(inventoryItemIds), 
                    type: "POST",
                    contentType: "application/json"
                }).done(function(itemNames) {
                    var loadedInventoryItems = [];
                    for(var curItem = 0; curItem < itemNames.length; ++curItem)
                    {
                        loadedInventoryItems.push({
                            id: itemNames[curItem].id,
                            name: itemNames[curItem].name,
                            quantity: new ko.observable(itemLookup[itemNames[curItem].id].quantity),
                            isEquipped: new ko.observable(itemLookup[itemNames[curItem].id].isEquipped)
                        });
                    }

                    self.inventoryItems(loadedInventoryItems);
                    self.isLoadingInventory(false);
                }).fail(function(xhr) {
                    self.inventoryItems([]);
                    self.isLoadingInventory(false);
                    self.loadingInventoryError(true);
                });
            };

            /**
             * Sets Additional save data
             * 
             * @param {object} data Save data
             * @returns {object} Save data with additional values
             */
            Npc.ViewModel.prototype.setAdditionalSaveData = function(data) {
                data.isPlayerNpc = this.isPlayerNpc();
                data.inventory = [];
                var inventoryItems = this.inventoryItems();
                for(var curItem = 0; curItem < inventoryItems.length; ++curItem)
                {
                    var quantity = parseInt(inventoryItems[curItem].quantity());
                    if(isNaN(quantity))
                    {
                        quantity = 1;
                    }

                    var item = {
                        itemId: inventoryItems[curItem].id,
                        quantity: quantity,
                        isEquipped: inventoryItems[curItem].isEquipped(),
                    };
                    data.inventory.push(item);
                }

                return data;
            };


            /**
             * Adds an item to the inventory
             */
            Npc.ViewModel.prototype.addItemToInventory = function() {
                var self = this;
                this.objectDialog.openItemSearch(Npc.Localization.AddItemToInventory).then(function(item) {
                    var inventoryItems = self.inventoryItems();
                    for(var curItem = 0; curItem < inventoryItems.length; ++curItem)
                    {
                        if(inventoryItems[curItem].id == item.id)
                        {
                            return;
                        }
                    }

                    self.inventoryItems.push({
                        id: item.id,
                        name: item.name,
                        quantity: new ko.observable(1),
                        isEquipped: new ko.observable(false)
                    });

                    self.inventoryItems.sort(function(item1, item2) {
                        return item1.name.localeCompare(item2.name);
                    });
                });
            };

            /**
             * Removes an item from the inventory
             * 
             * @param {object} item Item to remove
             */
            Npc.ViewModel.prototype.openRemoveItemDialog = function(item) {
                this.itemToRemove = item;
                this.showConfirmItemRemoveDialog(true);
            };

            /**
             * Removes the item which should be removed from the inventory
             */
            Npc.ViewModel.prototype.removeItemFromInventory = function() {
                if(this.itemToRemove)
                {
                    this.inventoryItems.remove(this.itemToRemove);
                }

                this.closeConfirmItemRemoveDialog();
            };

            /**
             * Closes the confirm item remove dialog
             */
            Npc.ViewModel.prototype.closeConfirmItemRemoveDialog = function() {
                this.itemToRemove = null;
                this.showConfirmItemRemoveDialog(false);
            };

            /**
             * Builds the url for an item
             * 
             * @param {object} item Item which should be opened
             * @returns {string} Url for the item
             */
            Npc.ViewModel.prototype.buildItemUrl = function(item) {
                return "/Styr/Item#id=" + item.id;
            };

            /**
             * Opens the tale dialog for the npc
             */
            Npc.ViewModel.prototype.openTale = function() {
                if(!this.id())
                {
                    return;
                }

                window.location = "/Tale#npcId=" + this.id();
            };


            /**
             * Opens the mark as playe dialog
             */
            Npc.ViewModel.prototype.openMarkAsPlayerDialog = function() {
                this.showMarkAsPlayerDialog(true);
            };

            /**
             * Closes the mark as player dialog
             */
            Npc.ViewModel.prototype.closeMarkAsPlayerDialog = function() {
                this.showMarkAsPlayerDialog(false);
            };

            /**
             * Marks the npc as a player
             */
            Npc.ViewModel.prototype.markAsPlayer = function() {
                this.isPlayerNpc(true);
                this.closeMarkAsPlayerDialog();
                this.save();
            };

        }(Kortisto.Npc = Kortisto.Npc || {}));
    }(GoNorth.Kortisto = GoNorth.Kortisto || {}));
}(window.GoNorth = window.GoNorth || {}));