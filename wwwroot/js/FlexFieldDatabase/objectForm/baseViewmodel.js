(function(GoNorth) {
    "use strict";
    (function(FlexFieldDatabase) {
        (function(ObjectForm) {

            /**
             * Object Form Base View Model
             * @param {string} rootPage Root Page
             * @param {string} apiControllerName Api Controller name
             * @param {string} objectType Object Type Name
             * @param {string} lockName Name of the resource used for the lock for an object of this type
             * @param {string} templateLockName Name of the resource used for the lock for a template of this type
             * @param {string} kirjaApiMentionedMethod Method of the kirja api which is used to load the pages in which the object is mentioned
             * @param {string} kartaApiMentionedMethod Method of the karta api which is used to load the maps in which the object is mentioned
             * @class
             */
            ObjectForm.BaseViewModel = function(rootPage, apiControllerName, objectType, lockName, templateLockName, kirjaApiMentionedMethod, kartaApiMarkedMethod)
            {
                GoNorth.FlexFieldDatabase.ObjectForm.FlexFieldHandlingViewModel.apply(this);

                this.rootPage = rootPage;
                this.apiControllerName = apiControllerName;

                this.lockName = lockName;
                this.templateLockName = templateLockName;

                this.kirjaApiMentionedMethod = kirjaApiMentionedMethod;
                this.kartaApiMarkedMethod = kartaApiMarkedMethod;

                this.isTemplateMode = new ko.observable(false);
                if(GoNorth.Util.getParameterFromUrl("template"))
                {
                    this.isTemplateMode(true);
                }

                this.id = new ko.observable("");
                var paramId = GoNorth.Util.getParameterFromUrl("id");
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

                var templateId = GoNorth.Util.getParameterFromUrl("templateId");
                this.templateId = templateId;
                this.parentFolderId = GoNorth.Util.getParameterFromUrl("folderId");
                
                this.isReadonly = new ko.observable(false);
                this.lockedByUser = new ko.observable("");

                this.isLoading = new ko.observable(false);

                this.isImplemented = new ko.observable(false);
                this.compareDialog = new GoNorth.ImplementationStatus.CompareDialog.ViewModel();

                this.objectName = new ko.observable("");
                this.imageFilename = new ko.observable("");
                this.thumbnailImageFilename = new ko.observable("");
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
                this.showCustomizedExportTemplateWarningOnDelete = new ko.observable(false);

                this.showConfirmRegenerateLanguageKeysDialog = new ko.observable(false);

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

                this.referencedInDailyRoutines = new ko.observableArray();
                this.loadingReferencedInDailyRoutines = new ko.observable(false);
                this.errorLoadingReferencedInDailyRoutines = new ko.observable(false);

                this.referencedInStateMachines = new ko.observableArray();
                this.loadingReferencedInStateMachines = new ko.observable(false);
                this.errorLoadingReferencedInStateMachines = new ko.observable(false);

                this.referencedInEvneSkills = new ko.observableArray();
                this.loadingReferencedInEvneSkills = new ko.observable(false);
                this.errorLoadingReferencedInEvneSkills = new ko.observable(false);

                this.referencedInExportSnippets = new ko.observableArray();
                this.loadingReferencedInExportSnippets = new ko.observable(false);
                this.errorLoadingReferencedInExportSnippets = new ko.observable(false);
                
                this.extendedReferenceCallout = new ko.observable(null);
                
                this.exportSnippetManager = new ObjectForm.ExportSnippetManager(objectType, this.isImplemented);

                this.errorOccured = new ko.observable(false);
                this.additionalErrorDetails = new ko.observable("");
                this.objectNotFound = new ko.observable(false);

                this.exportObjectDialog = new GoNorth.Shared.ExportObjectDialog.ViewModel(this.isLoading, this.errorOccured);

                this.allowScriptSettingsForAllFieldTypes = GoNorth.FlexFieldDatabase.ObjectForm.allowScriptSettingsForAllFieldTypes;

                GoNorth.Util.setupValidation("#gn-objectFields");

                if(this.id() && this.isTemplateMode())
                {
                    this.checkIfCustomizedExportTemplateExists();
                }

                var self = this;
                this.dirtyChecker = new GoNorth.SaveUtil.DirtyChecker(function() {
                    return self.buildSaveRequestObject();
                }, GoNorth.FlexFieldDatabase.ObjectForm.dirtyMessage, GoNorth.FlexFieldDatabase.ObjectForm.disableAutoSaving, function() {
                    self.sendSaveRequest(false, true);
                });

                GoNorth.SaveUtil.setupSaveHotkey(function() {
                    self.save();
                });
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

                    if(GoNorth.FlexFieldDatabase.ObjectForm.hasEvneRights && !this.isTemplateMode())
                    {
                        this.loadUsedInEvneSkills();
                    } 

                    if(GoNorth.FlexFieldDatabase.ObjectForm.hasKortistoRights && !this.isTemplateMode())
                    {
                        this.loadUsedInDailyRoutines();
                        this.loadUsedInStateMachines();
                    } 

                    if(GoNorth.FlexFieldDatabase.ObjectForm.hasExportObjectsRights && !this.isTemplateMode())
                    {
                        this.loadUsedInExportSnippets();
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
             * Checks if a customized export template exists
             */
            ObjectForm.BaseViewModel.prototype.checkIfCustomizedExportTemplateExists = function() {
                if(!this.id())
                {
                    return;
                }
                
                var self = this;
                GoNorth.HttpClient.get("/api/ExportApi/DoesExportTemplateExistForObjectId?id=" + this.id()).done(function(data) {
                    self.showCustomizedExportTemplateWarningOnDelete(data.doesTemplateExist);
                }).fail(function(xhr) {
                    self.errorOccured(true);
                });
            };

            /**
             * Resets the error state
             */
            ObjectForm.BaseViewModel.prototype.resetErrorState = function() {
                this.errorOccured(false);
                this.additionalErrorDetails("");
                this.objectNotFound(false);
            };

            /**
             * Loads all existing objects tags for the tag dropdown list
             */
            ObjectForm.BaseViewModel.prototype.loadExistingObjectTags = function() {
                var self = this;
                GoNorth.HttpClient.get("/api/" + this.apiControllerName + "/FlexFieldObjectTags").done(function(data) {
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
                GoNorth.HttpClient.get(url).done(function(data) {
                    self.isLoading(false);
                    if(!data)
                    {
                        self.errorOccured(true);
                        self.objectNotFound(true);
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
                    
                    self.thumbnailImageFilename(data.thumbnailImageFile);
                    self.imageFilename(data.imageFile);
                    self.fieldManager.deserializeFields(data.fields);

                    if(fromTemplate && !self.isTemplateMode())
                    {
                        self.fieldManager.flagFieldsAsCreatedFromTemplate();
                    }

                    self.objectTags(data.tags);

                    self.saveLastObjectState();
                }).fail(function(xhr) {
                    self.isLoading(false);
                    self.errorOccured(true);
                });
            };

            /**
             * Saves the last saved object state from the current state
             */
            ObjectForm.BaseViewModel.prototype.saveLastObjectState = function() {
                this.dirtyChecker.saveCurrentSnapshot();
            };   

            /**
             * Saves the form
             */
            ObjectForm.BaseViewModel.prototype.save = function() {
                this.sendSaveRequest(false, false);
            };

            /**
             * Saves the form and distribute the fields to objects
             */
            ObjectForm.BaseViewModel.prototype.saveAndDistributeFields = function() {
                this.sendSaveRequest(true, false);
            };
            
            /**
             * Builds the save request object
             * 
             * @returns {object} Save request object
             */
            ObjectForm.BaseViewModel.prototype.buildSaveRequestObject = function() {
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

                    if(this.thumbnailImageFilename())
                    {
                        requestObject.thumbnailImageFile = this.thumbnailImageFilename();
                    }
                }

                return requestObject;
            };

            /**
             * Saves the form
             * 
             * @param {bool} distributeFields true if the fields should be distributed, else false
             * @param {bool} isAutoSave true if the save request is from an auto save, else fasle
             */
            ObjectForm.BaseViewModel.prototype.sendSaveRequest = function(distributeFields, isAutoSave) {
                if(!GoNorth.Util.validateForm("#gn-objectFields", !isAutoSave))
                {
                    return;
                }

                // Send Data
                var requestObject = this.buildSaveRequestObject();

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
                GoNorth.HttpClient.post(url, requestObject).done(function(data) {
                    if(!self.id())
                    {
                        self.id(data.id);
                        var idAdd = "id=" + data.id;
                        if(self.isTemplateMode())
                        {
                            GoNorth.Util.replaceUrlParameters("template=1&" + idAdd);
                        }
                        else
                        {
                            GoNorth.Util.replaceUrlParameters(idAdd);
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

                    self.runAfterSave(data);

                    self.callObjectGridRefresh();

                    self.dirtyChecker.saveCurrentSnapshot();
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
             * Runs logic after save
             * 
             * @param {object} data Returned data after save
             */
            ObjectForm.BaseViewModel.prototype.runAfterSave = function(data) {

            };


            /**
             * Distributes the fields
             */
            ObjectForm.BaseViewModel.prototype.distributeFields = function() {
                var self = this;
                GoNorth.HttpClient.post("/api/" + this.apiControllerName + "/DistributeFlexFieldTemplateFields?id=" + this.id(), {}).done(function(data) {
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
                GoNorth.HttpClient.delete(url).done(function(data) {
                    self.callObjectGridRefresh();
                    self.closeConfirmObjectDeleteDialog();
                    window.location = self.rootPage;
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
                this.thumbnailImageFilename(image);
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
             * Opens the export template
             * 
             * @param {number} templateType Type of the template
             */
            ObjectForm.BaseViewModel.prototype.openExportTemplate = function(templateType) {
                if(!this.id())
                {
                    return;
                }

                var url = "/Export/ManageTemplate?templateType=" + templateType + "&customizedObjectId=" + this.id();
                if(this.isTemplateMode())
                {
                    url += "&objectIsTemplate=1";
                }
                window.location = url;
            };

            /**
             * Exports an object
             * 
             * @param {number} templateType Type of the template
             * @param {string} exportFormat Format to export to (Script, JSON, Language)
             */
            ObjectForm.BaseViewModel.prototype.exportObject = function(templateType, exportFormat) {
                this.exportObjectDialog.exportObject("/api/ExportApi/ExportObject?exportFormat=" + exportFormat + "&id=" + this.id() + "&templateType=" + templateType, 
                                                     "/api/ExportApi/ExportObjectDownload?exportFormat=" + exportFormat + "&id=" + this.id() + "&templateType=" + templateType, 
                                                     this.dirtyChecker.isDirty());
            };

            /**
             * Opens the code snippet dialog
             * 
             * @param {number} templateType Type of the template
             */
            ObjectForm.BaseViewModel.prototype.openCodeSnippetDialog = function(templateType) {
                this.exportSnippetManager.openSnippetManagerDialog(this.id(), templateType);
            }


            /**
             * Opens the confirm regenerate language keys dialog
             */
            ObjectForm.BaseViewModel.prototype.openConfirmRegenerateLanguageKeysDialog = function() {
                this.showConfirmRegenerateLanguageKeysDialog(true);
            };

            /**
             * Regenerates the language keys
             */
            ObjectForm.BaseViewModel.prototype.regenerateLanguageKeys = function() {
                this.isLoading(true);
                this.resetErrorState();
                var self = this;
                GoNorth.HttpClient.delete("/api/ExportApi/DeleteLanguageKeysByGroupId?groupId=" + this.id()).done(function(data) {
                    self.isLoading(false);
                    self.closeConfirmRegenerateLanguageKeysDialog();
                }).fail(function(xhr) {
                    self.isLoading(false);
                    self.errorOccured(true);
                    self.closeConfirmRegenerateLanguageKeysDialog();
                });
            };

            /**
             * Closes the confirm regenerate language keys dialog
             */
            ObjectForm.BaseViewModel.prototype.closeConfirmRegenerateLanguageKeysDialog = function() {
                this.showConfirmRegenerateLanguageKeysDialog(false);
            };


            /**
             * Loads the Aika quests
             */
            ObjectForm.BaseViewModel.prototype.loadAikaQuests = function() {
                this.loadingReferencedInQuests(true);
                this.errorLoadingReferencedInQuests(false);
                var self = this;
                GoNorth.HttpClient.get("/api/AikaApi/GetQuestsObjectIsReferenced?objectId=" + this.id()).done(function(data) {
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
             * @param {object} detailedReference Detailed reference to build the object reference for
             * @returns {string} Url for quest
             */
            ObjectForm.BaseViewModel.prototype.buildAikaQuestUrl = function(quest, detailedReference) {
                var url = "/Aika/Quest?id=" + quest.objectId;
                if(!detailedReference && quest.detailedReferences && quest.detailedReferences.length == 1)
                {
                    detailedReference = quest.detailedReferences[0];
                }

                if(detailedReference)
                {
                    url += "&nodeFocusId=" + detailedReference.objectId;
                }
                return url;
            };


            /**
             * Loads the kirja pages
             */
            ObjectForm.BaseViewModel.prototype.loadKirjaPages = function() {
                this.loadingMentionedInKirjaPages(true);
                this.errorLoadingMentionedInKirjaPages(false);
                var self = this;
                GoNorth.HttpClient.get("/api/KirjaApi/" + this.kirjaApiMentionedMethod + this.id()).done(function(data) {
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
                return "/Kirja?id=" + page.id;
            };


            /**
             * Loads the karta maps
             */
            ObjectForm.BaseViewModel.prototype.loadKartaMaps = function() {
                if(!this.kartaApiMarkedMethod)
                {
                    return;
                }

                this.loadingMarkedInKartaMaps(true);
                this.errorLoadingMarkedInKartaMaps(false);
                var self = this;
                GoNorth.HttpClient.get("/api/KartaApi/" + this.kartaApiMarkedMethod + this.id()).done(function(data) {
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
                var url = "/Karta?id=" + map.mapId;
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
                GoNorth.HttpClient.get("/api/TaleApi/GetDialogsObjectIsReferenced?objectId=" + this.id()).done(function(dialogs) {
                    self.referencedInTaleDialogs(dialogs);
                    self.loadingReferencedInTaleDialogs(false);
                }).fail(function(xhr) {
                    self.errorLoadingReferencedInTaleDialogs(true);
                    self.loadingReferencedInTaleDialogs(false);
                });
            };

            /**
             * Builds the url for a Tale dialog
             * 
             * @param {object} dialogRef Dialog in which the object is referenced
             * @param {object} detailedReference Detailed reference to build the object reference for
             * @returns {string} Url for the dialog
             */
            ObjectForm.BaseViewModel.prototype.buildTaleDialogUrl = function(dialogRef, detailedReference) {
                var url = "/Tale?npcId=" + dialogRef.objectId;
                if(!detailedReference && dialogRef.detailedReferences && dialogRef.detailedReferences.length == 1)
                {
                    detailedReference = dialogRef.detailedReferences[0];
                }

                if(detailedReference)
                {
                    url += "&nodeFocusId=" + detailedReference.objectId;
                }
                return url;
            };


            /**
             * Loads the npcs in daily routines the object is are used
             */
            ObjectForm.BaseViewModel.prototype.loadUsedInDailyRoutines = function() {
                this.loadingReferencedInDailyRoutines(true);
                this.errorLoadingReferencedInDailyRoutines(false);
                var self = this;
                GoNorth.HttpClient.get("/api/KortistoApi/GetNpcsObjectIsReferencedInDailyRoutine?objectId=" + this.id()).done(function(data) {
                    self.referencedInDailyRoutines(data);
                    self.loadingReferencedInDailyRoutines(false);
                }).fail(function(xhr) {
                    self.errorLoadingReferencedInDailyRoutines(true);
                    self.loadingReferencedInDailyRoutines(false);
                });
            };

            /**
             * Builds the url for a Npcs
             * 
             * @param {object} npc Npc to build the url for
             * @returns {string} Url for the npc
             */
            ObjectForm.BaseViewModel.prototype.buildDailyRoutineNpcUrl = function(npc) {
                return "/Kortisto/Npc?id=" + npc.id;
            };


            /**
             * Loads the npcs in which the quest is used in state machines
             */
            ObjectForm.BaseViewModel.prototype.loadUsedInStateMachines = function() {
                this.loadingReferencedInStateMachines(true);
                this.errorLoadingReferencedInStateMachines(false);
                var self = this;
                GoNorth.HttpClient.get("/api/StateMachineApi/GetStateMachineObjectIsReferenced?objectId=" + this.id()).done(function(data) {
                    self.referencedInStateMachines(data);
                    self.loadingReferencedInStateMachines(false);
                }).fail(function(xhr) {
                    self.errorLoadingReferencedInStateMachines(true);
                    self.loadingReferencedInStateMachines(false);
                });
            };

            /**
             * Builds the url for a state machine
             * 
             * @param {object} stateMachine State Machine to build the url for
             * @returns {string} Url for the state machine
             */
            ObjectForm.BaseViewModel.prototype.buildStateMachineUrl = function(stateMachine) {
                var url = "/StateMachine?";
                if(stateMachine.objectType == "NpcTemplate") {
                    url += "npcTemplateId="
                } else if(stateMachine.objectType == "Npc") {
                    url += "npcId=";
                } else {
                    throw "Unknown state machine object";
                }
                
                url += stateMachine.objectId;

                return url;
            };


            /**
             * Loads the skills in which the object is used
             */
            ObjectForm.BaseViewModel.prototype.loadUsedInEvneSkills = function() {
                this.loadingReferencedInEvneSkills(true);
                this.errorLoadingReferencedInEvneSkills(false);
                var self = this;
                GoNorth.HttpClient.get("/api/EvneApi/GetSkillsObjectIsReferencedIn?objectId=" + this.id()).done(function(data) {
                    self.referencedInEvneSkills(data);
                    self.loadingReferencedInEvneSkills(false);
                }).fail(function(xhr) {
                    self.errorLoadingReferencedInEvneSkills(true);
                    self.loadingReferencedInEvneSkills(false);
                });
            };

            /**
             * Builds the url for a Skill
             * 
             * @param {object} skill Skill to build the url for
             * @returns {string} Url for the skill
             */
            ObjectForm.BaseViewModel.prototype.buildEvneSkillUrl = function(npc) {
                return "/Evne/Skill?id=" + npc.id;
            };


            /**
             * Loads export snippets in which the object is used
             */
            ObjectForm.BaseViewModel.prototype.loadUsedInExportSnippets = function() {
                this.loadingReferencedInExportSnippets(true);
                this.errorLoadingReferencedInExportSnippets(false);
                var self = this;
                GoNorth.HttpClient.get("/api/ExportApi/GetSnippetsObjectIsReferencedIn?id=" + this.id()).done(function(data) {
                    self.referencedInExportSnippets(data);
                    self.loadingReferencedInExportSnippets(false);
                }).fail(function(xhr) {
                    self.errorLoadingReferencedInExportSnippets(true);
                    self.loadingReferencedInExportSnippets(false);
                });
            };

            /**
             * Builds the reference name for a used export snippet
             * 
             * @param {object} snippet Snippet to build the name for
             * @returns {string} Name for the snippet
             */
            ObjectForm.BaseViewModel.prototype.buildUsedExportSnippetName = function(snippet) {
                var objectType = "";
                if(snippet.objectType == "npc")
                {
                    objectType = GoNorth.FlexFieldDatabase.ObjectForm.Localization.Npc;
                }
                else if(snippet.objectType == "item")
                {
                    objectType = GoNorth.FlexFieldDatabase.ObjectForm.Localization.Item;
                }
                else if(snippet.objectType == "skill")
                {
                    objectType = GoNorth.FlexFieldDatabase.ObjectForm.Localization.Skill;
                }
                
                return snippet.objectName + " (" + objectType + ")";
            };

            /**
             * Builds the url for a snippet
             * 
             * @param {object} snippet Snippet to build the url for
             * @returns {string} Url for the snippet
             */
            ObjectForm.BaseViewModel.prototype.buildUsedExportSnippetUrl = function(snippet) {
                if(snippet.objectType == "npc")
                {
                    return "/Kortisto/Npc?id=" + snippet.objectId;
                }
                else if(snippet.objectType == "item")
                {
                    return "/Styr/Item?id=" + snippet.objectId;
                }
                else if(snippet.objectType == "skill")
                {
                    return "/Evne/Skill?id=" + snippet.objectId;
                }
                
                return "";
            };


            /**
             * Sets the extended reference callout
             * @param {object} refObj Reference callout to extend
             */
            ObjectForm.BaseViewModel.prototype.setExtendedReferenceCallout = function(refObj) {
                if(this.extendedReferenceCallout() == refObj)
                {
                    refObj = null;
                }
                this.extendedReferenceCallout(refObj);
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
                        self.setAdditionalDataToReadonly();
                    }
                }).fail(function() {
                    self.errorOccured(true);
                    self.isReadonly(true);
                });
            };

            /**
             * Sets additional data to readonly
             */
            ObjectForm.BaseViewModel.prototype.setAdditionalDataToReadonly = function() {

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