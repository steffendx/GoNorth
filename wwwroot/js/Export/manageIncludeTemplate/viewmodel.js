(function(GoNorth) {
    "use strict";
    (function(Export) {
        (function(ManageIncludeTemplate) {

            /**
             * Manage Include Template View Model
             * @class
             */
            ManageIncludeTemplate.ViewModel = function()
            {
                this.id = new ko.observable("");
                var id = GoNorth.Util.getParameterFromUrl("id");
                if(id)
                {
                    this.id(id);
                }

                this.templateName = new ko.observable("");
                this.templateCode = new ko.observable("");

                this.referencedInTemplates = new ko.observableArray();
                this.isReferencedInTemplatesExpanded = new ko.observable(false);

                this.showConfirmTemplateDeleteDialog = new ko.observable(false);

                this.isLoading = new ko.observable(false);
                this.errorOccured = new ko.observable(false);
                this.additionalErrorDetails = new ko.observable(null);
                this.isReadonly = new ko.observable(false);
                this.lockedByUser = new ko.observable("");

                if(this.id())
                {
                    this.loadIncludeTemplateData();
                }

                GoNorth.Util.setupValidation("#gn-includeExportTemplateForm");
            };

            ManageIncludeTemplate.ViewModel.prototype = {
                /**
                 * Resets the error state
                 */
                resetErrorState: function() {
                    this.errorOccured(false);
                    this.additionalErrorDetails(null);
                },

                /**
                 * Loads the include template data
                 */
                loadIncludeTemplateData: function() {
                    var templateDef = this.loadIncludeTemplate();
                    var referenceDef = this.loadReferencedInTemplates();

                    this.isLoading(true);
                    this.resetErrorState();
                    var self = this;
                    jQuery.when(templateDef, referenceDef).done(function() {
                        self.isLoading(false);
                    }).fail(function() {
                        self.isLoading(false);
                        self.errorOccured(true);
                    });
                },

                /**
                 * Loads the include template
                 * @returns {jQuery.Deferred} Deferred for the loading process
                 */
                loadIncludeTemplate: function() {
                    var self = this;
                    var def = GoNorth.HttpClient.get("/api/ExportApi/GetIncludeExportTemplateById?id=" + this.id());
                    def.done(function(template) {
                        self.templateName(template.name);
                        self.templateCode(template.code);
                    })

                    return def;
                },

                /**
                 * Loads the templates in which the include template is referenced
                 * @returns {jQuery.Deferred} Deferred for the loading process
                 */
                loadReferencedInTemplates: function() {
                    var self = this;
                    var def = GoNorth.HttpClient.get("/api/ExportApi/GetExportTemplatesReferencingIncludeTemplate?id=" + this.id());
                    def.done(function(references) {
                        self.referencedInTemplates(references);
                    })

                    return def;
                },

                /**
                 * Saves the template
                 */
                save: function() {
                    if(!jQuery("#gn-includeExportTemplateForm").valid())
                    {
                        return;
                    }

                    var url = "/api/ExportApi/CreateIncludeExportTemplate";
                    if(this.id())
                    {
                        url = "/api/ExportApi/UpdateIncludeExportTemplate?id=" + this.id();
                    }

                    var saveRequest = {
                        name: this.templateName(),
                        code: this.templateCode()
                    }

                    this.isLoading(true);
                    this.resetErrorState();
                    var self = this;
                    GoNorth.HttpClient.post(url, saveRequest).done(function(id) {
                        self.isLoading(false);
                        if(!self.id())
                        {
                            self.id(id);
                            GoNorth.Util.replaceUrlParameters("id=" + id);
                            self.acquireLock();
                        }
                        
                        // Dont show error here to not have user think that save did not work
                        self.loadReferencedInTemplates();
                    }).fail(function(xhr) {
                        self.isLoading(false);
                        self.errorOccured(true);

                        if(xhr.status == 400 && xhr.responseJSON && xhr.responseJSON.value)
                        {
                            self.additionalErrorDetails(xhr.responseJSON.value);
                        }
                    });
                },
                
                /**
                 * Opens the delete template dialog
                 */
                openDeleteTemplateDialog: function() {
                    this.showConfirmTemplateDeleteDialog(true);
                },

                /**
                 * Closes the delete template dialog
                 */
                closeDeleteTemplateDialog: function() {
                    this.showConfirmTemplateDeleteDialog(false);
                },

                /**
                 * Deletes the template
                 */
                deleteTemplate: function() {
                    if(!this.id())
                    {
                        return;
                    }

                    this.isLoading(true);
                    this.resetErrorState();
                    var self = this;
                    GoNorth.HttpClient.delete("/api/ExportApi/DeleteIncludeExportTemplate?id=" + this.id()).done(function(data) {
                        self.closeDeleteTemplateDialog();
                        self.redirectToObjectPage();
                    }).fail(function(xhr) {
                        self.isLoading(false);
                        self.errorOccured(true);
                        self.closeDeleteTemplateDialog();
                    });
                },

                /**
                 * Redirects back to object page
                 */
                redirectToObjectPage: function() {
                    window.location = "/Export?category=IncludeTemplates&page=0";
                },

                /**
                 * Toggles the reference section visibitly
                 */
                toogleReferenceVisibility: function() {
                    this.isReferencedInTemplatesExpanded(!this.isReferencedInTemplatesExpanded());
                },

                /**
                 * Acquires a lock
                 */
                acquireLock: function() {
                    var self = this;
                    GoNorth.LockService.acquireLock("ExportIncludeTemplate", this.id()).done(function(isLocked, lockedUsername) { 
                        if(isLocked)
                        {
                            self.isReadonly(true);
                            self.lockedByUser(lockedUsername);
                        }
                    }).fail(function() {
                        self.errorOccured(true);
                        self.isReadonly(true);
                    });
                }
            };

        }(Export.ManageIncludeTemplate = Export.ManageIncludeTemplate || {}));
    }(GoNorth.Export = GoNorth.Export || {}));
}(window.GoNorth = window.GoNorth || {}));