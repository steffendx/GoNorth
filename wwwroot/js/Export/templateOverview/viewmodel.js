(function(GoNorth) {
    "use strict";
    (function(Export) {
        (function(TemplateOverview) {

            /**
             * Template Overview View Model
             * @class
             */
            TemplateOverview.ViewModel = function()
            {
                this.templateCategories = new ko.observableArray();
                this.selectedCategoryLabel = new ko.observable("");
                this.selectedCategory = new ko.observable(-1);
                var category = GoNorth.Util.getParameterFromUrl("category");
                if(category)
                {
                    this.selectedCategory(category);
                }

                this.templates = new ko.observableArray();
                
                this.dialogLoading = new ko.observable(false);
                this.dialogErrorOccured = new ko.observable(false);
                this.isSettingsDialogOpen = new ko.observable(false);
                this.selectedCodeEditorMode = new ko.observable(null);
                this.codeEditorModes = ace.require("ace/ext/modelist").modes;
                this.escapeCharacter = new ko.observable("");
                this.charactersNeedingEscaping = new ko.observable("");
                this.newlineCharacter = new ko.observable("");
                this.languageSelectedCodeEditorMode = new ko.observable(null);
                this.languageEscapeCharacter = new ko.observable("");
                this.languageCharactersNeedingEscaping = new ko.observable("");
                this.languageNewlineCharacter = new ko.observable("");

                this.isLoading = new ko.observable(false);
                this.errorOccured = new ko.observable(false);

                this.loadTemplateCategories();
                this.loadSettings();

                var self = this;
                GoNorth.Util.onUrlParameterChanged(function() {
                    var category = GoNorth.Util.getParameterFromUrl("category");
                    if(category != self.selectedCategory()) {
                        self.selectTemplateCategoryFromUrl(category);
                    }
                });
            };

            TemplateOverview.ViewModel.prototype = {
                /**
                 * Loads the template categories
                 */
                loadTemplateCategories: function() {
                    this.isLoading(true);
                    this.errorOccured(false);
                    var self = this;
                    jQuery.ajax({
                        url: "/api/ExportApi/GetTemplateCategories",
                        method: "GET"
                    }).done(function(templateCategories) {
                        self.templateCategories(templateCategories);
                        self.isLoading(false);

                        if(self.selectedCategory() < 0 && templateCategories.length > 0)
                        {
                            self.selectTemplateCategory(templateCategories[0]);
                        }
                        else
                        {
                            self.selectTemplateCategoryFromUrl(self.selectedCategory());
                        }
                    }).fail(function() {
                        self.isLoading(false);
                        self.errorOccured(true);
                    });
                },

                /**
                 * Selects a template category from the url
                 * 
                 * @param {number} category Category to select
                 */
                selectTemplateCategoryFromUrl: function(category) {
                    var label = "";
                    var templateCategories = this.templateCategories();
                    for(var curCategory = 0; curCategory < templateCategories.length; ++curCategory)
                    {
                        if(templateCategories[curCategory].category == category)
                        {
                            label = templateCategories[curCategory].label;
                            break;
                        }
                    }

                    this.selectedCategory(category);
                    this.selectedCategoryLabel(label);
                    this.loadTemplatesForSelectedCategory();
                },

                /**
                 * Selects a template category
                 * 
                 * @param {object} category Category to select
                 */
                selectTemplateCategory: function(category) {
                    // Will load templates because of url change
                    var parameterValue = "category=" + category.category;
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
                 * Loads the templates for the selected category
                 */
                loadTemplatesForSelectedCategory: function() {
                    this.isLoading(true);
                    this.errorOccured(false);
                    var self = this;
                    jQuery.ajax({
                        url: "/api/ExportApi/GetDefaultTemplatesByCategory?category=" + self.selectedCategory(),
                        type: "GET"
                    }).done(function(templates) {
                        self.isLoading(false);
                        self.templates(templates);
                    }).fail(function() {
                        self.isLoading(false);
                        self.errorOccured(true);
                    });
                },


                /**
                 * Builds a template url
                 * 
                 * @param {object} template Template to build the url for
                 * @returns {string} Templat Url
                 */
                buildTemplateUrl: function(template) {
                    return "/Export/ManageTemplate?templateType=" + template.template.templateType;
                },



                /**
                 * Loads the script settings
                 */
                loadSettings: function() {
                    this.dialogLoading(true);
                    this.dialogErrorOccured(false);
                    var self = this;
                    jQuery.ajax({
                        url: "/api/ExportApi/GetExportSettings",
                        type: "GET"
                    }).done(function(data) {
                        self.selectedCodeEditorMode(self.searchCodeEditorMode(data.scriptLanguage));
                        self.escapeCharacter(data.escapeCharacter);
                        self.charactersNeedingEscaping(data.charactersNeedingEscaping);
                        self.newlineCharacter(data.newlineCharacter);
                        self.languageSelectedCodeEditorMode(self.searchCodeEditorMode(data.languageFileLanguage));
                        self.languageEscapeCharacter(data.languageEscapeCharacter);
                        self.languageCharactersNeedingEscaping(data.languageCharactersNeedingEscaping);
                        self.languageNewlineCharacter(data.languageNewlineCharacter);

                        self.dialogLoading(false);
                    }).fail(function() {
                        self.dialogLoading(false);
                        self.dialogErrorOccured(true);
                    });
                },

                /**
                 * Searches a code editor mode
                 * 
                 * @param {string} editorMode Editor mode to search
                 * @returns {object} Editor Mode
                 */
                searchCodeEditorMode: function(editorMode) 
                {
                    for(var curEditorMode = 0; curEditorMode < this.codeEditorModes.length; ++curEditorMode)
                    {
                        if(this.codeEditorModes[curEditorMode].mode == editorMode)
                        {
                            return this.codeEditorModes[curEditorMode];
                        }
                    }

                    return null;
                },

                /**
                 * Opens the settings dialog
                 */
                openSettingsDialog: function() {
                    this.dialogLoading(false);
                    this.dialogErrorOccured(false);
                    this.isSettingsDialogOpen(true);
                },

                /**
                 * Saves the settings
                 */
                saveSettings: function() {
                    if(!this.selectedCodeEditorMode() || !this.languageSelectedCodeEditorMode())
                    {
                        this.dialogErrorOccured(true);
                        return;
                    }

                    var exportSettings = {
                        scriptLanguage: this.selectedCodeEditorMode().mode,
                        scriptExtension: this.selectedCodeEditorMode().extensions.split("|")[0],
                        escapeCharacter: this.escapeCharacter(),
                        charactersNeedingEscaping: this.charactersNeedingEscaping(),
                        newlineCharacter: this.newlineCharacter(),
                        languageFileLanguage: this.languageSelectedCodeEditorMode().mode,
                        languageFileExtension: this.languageSelectedCodeEditorMode().extensions.split("|")[0],
                        languageEscapeCharacter: this.languageEscapeCharacter(),
                        languageCharactersNeedingEscaping: this.languageCharactersNeedingEscaping(),
                        languageNewlineCharacter: this.languageNewlineCharacter()
                    };

                    this.dialogLoading(true);
                    this.dialogErrorOccured(false);
                    var self = this;
                    jQuery.ajax({
                        headers: GoNorth.Util.generateAntiForgeryHeader(),
                        url: "/api/ExportApi/SaveExportSettings",
                        type: "POST",
                        data: JSON.stringify(exportSettings),
                        contentType: "application/json"
                    }).done(function(templates) {
                        self.dialogLoading(false);
                        self.closeSettingsDialog();
                    }).fail(function() {
                        self.dialogLoading(false);
                        self.dialogErrorOccured(true);
                    });
                },

                /**
                 * Closes the settings dialog
                 */
                closeSettingsDialog: function() {
                    this.isSettingsDialogOpen(false);
                },


                /**
                 * Opens the function generation condition page
                 */
                openFunctionGenerationConditions: function() {
                    window.location = "/Export/FunctionGenerationCondition";
                }
            };

        }(Export.TemplateOverview = Export.TemplateOverview || {}));
    }(GoNorth.Export = GoNorth.Export || {}));
}(window.GoNorth = window.GoNorth || {}));