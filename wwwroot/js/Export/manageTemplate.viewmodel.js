(function(GoNorth) {
    "use strict";
    (function(BindingHandlers) {

        if(typeof ko !== "undefined")
        {

            /**
             * Code Editor Binding Handler
             */
            ko.bindingHandlers.codeEditor = {
                init: function (element, valueAccessor, allBindings) {
                    ace.require("ace/ext/language_tools");

                    var obs = valueAccessor();

                    // Read Config Values
                    var theme = null;
                    if(allBindings.get("codeEditorTheme"))
                    {
                        theme = ko.unwrap(allBindings.get("codeEditorTheme"));
                    }

                    if(!theme)
                    {
                        theme = "ace/theme/monokai";
                    }

                    var mode = null;
                    if(allBindings.get("codeEditorMode"))
                    {
                        mode = ko.unwrap(allBindings.get("codeEditorMode"));
                    }

                    if(!mode)
                    {
                        mode = "ace/mode/lua";
                    }

                    obs._editor = ace.edit(element);
                    obs._editor.setTheme(theme);
                    obs._editor.session.setMode(mode);
                    obs._editor.setOptions({
                        enableBasicAutocompletion: true,
                        enableLiveAutocompletion: true
                    });

                    if(ko.isObservable(obs))
                    {
                        obs._editor.session.on('change', function(delta) {
                            obs._blockUpdate = true;
                            try
                            {
                                obs(obs._editor.getValue());
                                obs._blockUpdate = false;
                            }
                            catch(e)
                            {
                                obs._blockUpdate = false;
                            }
                        });
                    }
                },
                update: function (element, valueAccessor, allBindings) {
                    var obs = valueAccessor();
                    var blockUpdate = obs._blockUpdate;
                    var value = obs;
                    if(ko.isObservable(value))
                    {
                        value = value();
                    }

                    var isReadonly = allBindings.get("codeEditorReadonly");
                    if(isReadonly)
                    {
                        isReadonly = ko.unwrap(isReadonly);
                        obs._editor.setReadOnly(isReadonly);
                    }

                    if(!blockUpdate)
                    {
                        obs._editor.session.setValue(value);
                    }
                }
            }

        }

    }(GoNorth.BindingHandlers = GoNorth.BindingHandlers || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(Export) {
        (function(ManageTemplate) {

            /**
             * Manage Template View Model
             * @class
             */
            ManageTemplate.ViewModel = function()
            {
                this.templateType = parseInt(GoNorth.Util.getParameterFromUrl("templateType"));
                this.customizedObjectId = new ko.observable("");
                var customizedObjectId = GoNorth.Util.getParameterFromUrl("customizedObjectId");
                if(customizedObjectId)
                {
                    this.customizedObjectId(customizedObjectId);
                }
                this.customizedObjectIsTemplate = new ko.observable(false);
                if(GoNorth.Util.getParameterFromUrl("objectIsTemplate"))
                {
                    this.customizedObjectIsTemplate(true);
                }

                this.templateLabel = new ko.observable("");
                this.templateCode = new ko.observable("");

                this.arePlaceholdersExpanded = new ko.observable(false);
                this.templatePlaceholders = new ko.observableArray();

                this.customizedObjectTemplateIsDefault = new ko.observable(false);
                this.parentTemplateId = new ko.observable("");
                this.parentTemplateUrl = new ko.computed(function() {
                    var url = "/Export/ManageTemplate?templateType=" + this.templateType;
                    if(this.parentTemplateId())
                    {
                        url += "&customizedObjectId=" + this.parentTemplateId() + "&objectIsTemplate=1"; // Parent customized object is always a template
                    }
                    return url;
                }, this);

                this.customizedChildTemplates = new ko.observableArray();

                this.objectWithInvalidSnippets = new ko.observableArray([]);

                this.showConfirmTemplateDeleteDialog = new ko.observable(false);

                this.isLoading = new ko.observable(false);
                this.isLoadingPlaceholders = new ko.observable(false);
                this.errorOccured = new ko.observable(false);
                this.isReadonly = new ko.observable(false);
                this.lockedByUser = new ko.observable("");

                if(!isNaN(this.templateType))
                {
                    this.loadInvalidSnippets();
                    this.loadTemplatePlaceholders();
                    this.initTemplateData();
                }
                else
                {
                    this.errorOccured(true);
                }

                var self = this;
                GoNorth.Util.onUrlParameterChanged(function() {
                    var customizedObjectId = GoNorth.Util.getParameterFromUrl("customizedObjectId");
                    if(customizedObjectId)
                    {
                        self.customizedObjectId(customizedObjectId);
                    }
                    else
                    {
                        self.customizedObjectId("");
                    }
                    if(GoNorth.Util.getParameterFromUrl("objectIsTemplate"))
                    {
                        self.customizedObjectIsTemplate(true);
                    }
                    else
                    {
                        self.customizedObjectIsTemplate(false);
                    }

                    GoNorth.LockService.releaseCurrentLock();
                    self.initTemplateData();
                });
            };

            ManageTemplate.ViewModel.prototype = {
                /**
                 * Initializes the template data
                 */
                initTemplateData: function() {
                    this.acquireLock();
                    this.loadDefaultTemplateData();
                },

                /**
                 * Loads the default template data
                 */
                loadDefaultTemplateData: function() {
                    var url = "/api/ExportApi/GetDefaultTemplateByType?templateType=" + this.templateType;
                    if(this.customizedObjectId())
                    {
                        url = "/api/ExportApi/GetExportTemplateByObjectId?id=" + this.customizedObjectId() + "&templateType=" + this.templateType;
                    }

                    this.isLoading(true);
                    this.errorOccured(false);
                    var self = this;
                    jQuery.ajax({
                        url: url,
                        type: "GET"
                    }).done(function(template) {
                        self.isLoading(false);
                        if(self.customizedObjectId())
                        {
                            self.customizedObjectTemplateIsDefault(template.isDefaultCode);
                            self.parentTemplateId(template.exportTemplate.template.customizedObjectId);
                            template = template.exportTemplate;

                            if(!template.isDefaultCode)
                            {
                                self.loadChildCustomizedTemplates();
                            }
                        }
                        else
                        {
                            self.customizedObjectTemplateIsDefault(false);
                            self.loadChildCustomizedTemplates();
                        }
                        self.templateLabel(template.label);
                        self.templateCode(template.template.code);
                    }).fail(function() {
                        self.isLoading(false);
                        self.errorOccured(true);
                    });
                },

                /**
                 * Loads the template placeholders
                 */
                loadTemplatePlaceholders: function() {
                    this.isLoadingPlaceholders(true);
                    var self = this;
                    jQuery.ajax({
                        url: "/api/ExportApi/GetTemplatePlaceholders?templateType=" + this.templateType,
                        type: "GET"
                    }).done(function(placeholders) {
                        self.templatePlaceholders(placeholders);
                        self.isLoadingPlaceholders(false);
                    }).fail(function() {
                        self.isLoadingPlaceholders(false);
                        self.errorOccured(true);
                    });
                },

                /**
                 * Saves the template
                 */
                save: function() {
                    var url = "/api/ExportApi/SaveDefaultExportTemplate?templateType=" + this.templateType;
                    if(this.customizedObjectId())
                    {
                        url = "/api/ExportApi/SaveExportTemplateByObjectId?id=" + this.customizedObjectId() + "&templateType=" + this.templateType;
                    }

                    this.isLoading(true);
                    this.errorOccured(false);
                    var self = this;
                    jQuery.ajax({
                        headers: GoNorth.Util.generateAntiForgeryHeader(),
                        url: url,
                        type: "POST",
                        data: JSON.stringify(this.templateCode()),
                        contentType: "application/json"
                    }).done(function() {
                        self.customizedObjectTemplateIsDefault(false);
                        self.isLoading(false);

                        self.loadInvalidSnippets();
                    }).fail(function() {
                        self.isLoading(false);
                        self.errorOccured(true);
                    });
                },


                /**
                 * Toggles the placeholder visibility
                 */
                tooglePlaceholderVisibility: function() {
                    this.arePlaceholdersExpanded(!this.arePlaceholdersExpanded());
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
                    if(!this.customizedObjectId())
                    {
                        return;
                    }

                    this.isLoading(true);
                    this.errorOccured(false);
                    var self = this;
                    jQuery.ajax({ 
                        url: "/api/ExportApi/DeleteExportTemplateByObjectId?id=" + this.customizedObjectId(), 
                        headers: GoNorth.Util.generateAntiForgeryHeader(),
                        type: "DELETE"
                    }).done(function(data) {
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
                    if(!GoNorth.Export.ManageTemplate.templateTypeMapping[this.templateType])
                    {
                        window.location = "/Export";
                    }

                    var targetUrl = GoNorth.Export.ManageTemplate.templateTypeMapping[this.templateType].replace("{0}", this.customizedObjectId());
                    if(this.customizedObjectIsTemplate())
                    {
                        targetUrl += "&template=1";
                    }
                    window.location = targetUrl;
                },


                /**
                 * Loads child export templates that are based on the template but use a customized template
                 */
                loadChildCustomizedTemplates: function() {
                    var url = "/api/ExportApi/GetCustomizedTemplatesByType?templateType=" + this.templateType;
                    if(this.customizedObjectId())
                    {
                        url = "/api/ExportApi/GetCustomizedTemplatesByParentObject?customizedObjectId=" + this.customizedObjectId() + "&templateType=" + this.templateType;
                    }

                    this.isLoading(true);
                    this.errorOccured(false);
                    var self = this;
                    jQuery.ajax({
                        url: url,
                        type: "GET"
                    }).done(function(data) {
                        self.customizedChildTemplates(data);
                        self.isLoading(false);
                    }).fail(function() {
                        self.isLoading(false);
                        self.errorOccured(true);
                    });
                },

                /**
                 * Builds a child template url
                 * @param {object} childTemplate Child Template
                 * @returns {string} Url for the child template
                 */
                buildChildTemplateUrl: function(childTemplate) {
                    if(!GoNorth.Export.ManageTemplate.templateTypeMapping[this.templateType])
                    {
                        return "";
                    }

                    var targetUrl = GoNorth.Export.ManageTemplate.templateTypeMapping[this.templateType].replace("{0}", childTemplate.objectId);
                    if(childTemplate.isObjectTemplate)
                    {
                        targetUrl += "&template=1";
                    }
                    return targetUrl;
                },


                /**
                 * Loads all invalid snippets based on the template
                 */
                loadInvalidSnippets: function() {
                    if(!GoNorth.Export.ManageTemplate.templateTypeMapping[this.templateType])
                    {
                        return;
                    }

                    var url = "/api/ExportApi/GetObjectsWithInvalidSnippets?templateType=" + this.templateType;
                    if(this.customizedObjectId())
                    {
                        url += "&id=" + this.customizedObjectId();
                    }
                    var self = this;
                    jQuery.ajax({
                        url: url,
                        type: "GET"
                    }).done(function(data) {
                        self.objectWithInvalidSnippets(data);
                    }).fail(function() {
                        self.errorOccured(true);
                    });
                },


                /**
                 * Acquires a lock
                 */
                acquireLock: function() {
                    var self = this;
                    GoNorth.LockService.acquireLock("ExportTemplate", this.templateType).done(function(isLocked, lockedUsername) { 
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

        }(Export.ManageTemplate = Export.ManageTemplate || {}));
    }(GoNorth.Export = GoNorth.Export || {}));
}(window.GoNorth = window.GoNorth || {}));