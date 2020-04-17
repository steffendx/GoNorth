(function(GoNorth) {
    "use strict";
    (function(Export) {
        (function(ManageTemplate) {

            /**
             * Supported rendering engines
             */
            var renderingEngines = {
                legacy: "Legacy",
                scriban: "Scriban"
            }

            /**
             * Character Width for calculating the character width
             */
            var autoCompleteCharWidth = 8;

            /**
             * Min Width for the autocomplete width
             */
            var autoCompleteMinWidth = 300;

            /**
             * Manage Template View Model
             * @class
             */
            ManageTemplate.ViewModel = function()
            {
                this.templateType = GoNorth.Util.getParameterFromUrl("templateType");
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
                this.placeholderLookupTree = {};

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

                this.templateRenderingEngine = new ko.observable(renderingEngines.scriban);
                this.legacyRenderingEngine = renderingEngines.legacy;

                this.isLoading = new ko.observable(false);
                this.isLoadingPlaceholders = new ko.observable(false);
                this.errorOccured = new ko.observable(false);
                this.additionalError = new ko.observable(null);
                this.isReadonly = new ko.observable(false);
                this.lockedByUser = new ko.observable("");

                this.setupAutoComplete();

                if(this.templateType)
                {
                    this.loadInvalidSnippets();
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
                 * Resets the error state
                 */
                resetErrorState: function() {
                    this.errorOccured(false);
                    this.additionalError(null);
                },

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
                    this.resetErrorState();
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
                        self.templateRenderingEngine(template.template.renderingEngine);
                        self.templateCode(template.template.code);
                        
                        self.loadTemplatePlaceholders();
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
                        url: "/api/ExportApi/GetTemplatePlaceholders?templateType=" + this.templateType + "&renderingEngine=" + this.templateRenderingEngine(),
                        type: "GET"
                    }).done(function(placeholders) {
                        self.templatePlaceholders(placeholders);
                        self.prepareTemplateAutoCompleteLookupTree(placeholders);
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
                    var url = "/api/ExportApi/SaveDefaultExportTemplate?templateType=" + this.templateType + "&renderingEngine=" + this.templateRenderingEngine();
                    if(this.customizedObjectId())
                    {
                        url = "/api/ExportApi/SaveExportTemplateByObjectId?id=" + this.customizedObjectId() + "&templateType=" + this.templateType + "&renderingEngine=" + this.templateRenderingEngine();
                    }

                    this.isLoading(true);
                    this.resetErrorState();
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
                    }).fail(function(xhr) {
                        self.isLoading(false);
                        self.errorOccured(true);

                        // If there are template errors a bad request (400) will be returned
                        if(xhr.status == 400 && xhr.responseJSON)
                        {
                            self.additionalError(xhr.responseJSON);
                        }
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
                    this.resetErrorState();
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
                    this.resetErrorState();
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
                 * Converst the current template to a modern template
                 */
                convertToModernTemplate: function() {
                    this.templateRenderingEngine(renderingEngines.scriban);
                    this.loadTemplatePlaceholders();
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
                 * Prepares the template placeholders for the autocompletion
                 * @param {object[]} placeholders Loaded placeholders
                 */
                prepareTemplateAutoCompleteLookupTree: function(placeholders) {
                    this.placeholderLookupTree = {};
                    if(!placeholders)
                    {
                        return;
                    }

                    for(var curPlaceholder = 0; curPlaceholder < placeholders.length; ++curPlaceholder)
                    {
                        if(placeholders[curPlaceholder].ignoreForAutocomplete || placeholders[curPlaceholder].name.indexOf(" ") >= 0)
                        {
                            continue;
                        }

                        var placeholderName = placeholders[curPlaceholder].name.replace(/<.*?>$/i, "").trim();

                        var splittedKey = placeholderName.split(".");
                        var currentParentObject = this.placeholderLookupTree;
                        var currentRefObject = this.placeholderLookupTree;
                        for(var curKeyPart = 0; curKeyPart < splittedKey.length; ++curKeyPart)
                        {
                            var objectKey = splittedKey[curKeyPart].toLowerCase();
                            var isPlaceholderPart = /^<.*>$/.test(objectKey);
                            if(!currentParentObject[objectKey])
                            {
                                currentParentObject[objectKey] = {
                                    originalKey: splittedKey[curKeyPart],
                                    isPlaceholderPart: isPlaceholderPart,
                                    anyPlaceholderChild: null,
                                    children: {}
                                };

                                if(isPlaceholderPart)
                                {
                                    currentRefObject.anyPlaceholderChild = currentParentObject[objectKey];
                                }
                            }

                            currentRefObject = currentParentObject[objectKey];
                            currentParentObject = currentParentObject[objectKey].children;
                        }
                    }
                },

                /**
                 * Initializes the auto complete tool
                 */
                setupAutoComplete: function() {
                    var self = this;
                    var langTools = ace.require("ace/ext/language_tools");
                    var autoCompleter = {
                        identifierRegexps: [/[^\s]+/],
                        getCompletions: function(editor, session, pos, prefix, callback) {
                            var splittedPrefix = prefix.split(".");
                            var prefixes = "";
                            var currentParentObject = self.placeholderLookupTree;
                            var currentAnyPlaceholderChild = self.placeholderLookupTree.anyPlaceholderChild;
                            var endsWithUnknown = false;
                            for(var curKeyPart = 0; curKeyPart < splittedPrefix.length; ++curKeyPart)
                            {
                                var objectKey = splittedPrefix[curKeyPart].toLowerCase();
                                if(currentParentObject[objectKey])
                                {
                                    if(prefixes) 
                                    {
                                        prefixes += ".";
                                    }
                                    prefixes += currentParentObject[objectKey].originalKey;
                                    currentAnyPlaceholderChild = currentParentObject[objectKey].anyPlaceholderChild;
                                    currentParentObject = currentParentObject[objectKey].children;
                                }
                                else if(currentAnyPlaceholderChild && objectKey)
                                {
                                    if(prefixes) 
                                    {
                                        prefixes += ".";
                                    }
                                    prefixes += splittedPrefix[curKeyPart];
                                    var originalAnyPlaceholderChild = currentAnyPlaceholderChild;
                                    currentAnyPlaceholderChild = originalAnyPlaceholderChild.anyPlaceholderChild;
                                    currentParentObject = originalAnyPlaceholderChild.children;
                                }
                                else
                                {
                                    endsWithUnknown = true;
                                    break;
                                }
                            }

                            if(prefixes)
                            {
                                prefixes += ".";
                            }
                            var placeholders = [];
                            var maxKeyLength = 0;
                            for(var curKey in currentParentObject)
                            {
                                let currentKey = currentParentObject[curKey].originalKey;
                                if(currentParentObject[curKey].isPlaceholderPart && endsWithUnknown)
                                {
                                    currentKey = splittedPrefix[splittedPrefix.length - 1] + " ";
                                }
                                currentKey = prefixes + currentKey;
                                maxKeyLength = Math.max(maxKeyLength, currentKey.length)

                                placeholders.push({
                                    caption: currentKey,
                                    value: currentKey,
                                    meta: "placeholder",
                                    score: 300
                                });
                            }

                            var textWidth = maxKeyLength * autoCompleteCharWidth;
                            if(textWidth < 300)
                            {
                                textWidth = autoCompleteMinWidth;
                            }

                            if(editor.completer && editor.completer.popup)
                            {
                                var popup = editor.completer.popup; 
                                popup.container.style.width = textWidth + "px"; 
                                popup.resize();
                            }

                            callback(
                                null,
                                placeholders
                            );
                        }
                    }
                    
                    langTools.addCompleter(autoCompleter);
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