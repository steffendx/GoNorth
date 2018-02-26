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