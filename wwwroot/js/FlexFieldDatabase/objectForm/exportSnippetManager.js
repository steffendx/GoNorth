(function(GoNorth) {
    "use strict";
    (function(FlexFieldDatabase) {
        (function(ObjectForm) {

            /// Script Type value for a non existing script
            var scriptTypeNone = -1;

            /**
             * Class that allows the user to manage export snippets
             * @param {string} objectType Object Type Name
             * @param {ko.observable} isImplementedObs Observable to show if the object is implemented
             * @class
             */
            ObjectForm.ExportSnippetManager = function(objectType, isImplementedObs) {
                this.objectType = objectType;
                this.isImplementedObs = isImplementedObs;

                this.chooseObjectDialog = new GoNorth.ChooseObjectDialog.ViewModel();

                this.showSnippetManagerDialog = new ko.observable(false);

                this.objectId = new ko.observable("");

                this.validSnippets = new ko.observableArray();
                this.invalidSnippets = new ko.observableArray();

                this.snippetManagerDialogLoading = new ko.observable(false);
                this.snippetManagerDialogErrorOccured = new ko.observable(false);
                               
                this.chooseScriptTypeDialog = new GoNorth.Shared.ChooseScriptTypeDialog.ViewModel();
                this.codeScriptDialog = new GoNorth.ScriptDialog.CodeScriptDialog(this.errorOccured);
                this.nodeScriptDialog = new GoNorth.ScriptDialog.NodeScriptDialog(this.objectId, this.chooseObjectDialog, this.codeScriptDialog, this.snippetManagerDialogErrorOccured);

                this.showConfirmDeleteDialog = new ko.observable(false);
                this.snippetToDelete = null;
            }

            ObjectForm.ExportSnippetManager.prototype = {
                /**
                 * Opens the snippet manager dialog
                 * 
                 * @param {string} id Id of the object
                 * @param {number} templateType Template type
                 */
                openSnippetManagerDialog: function(id, templateType) {
                    this.objectId(id);

                    this.validSnippets.removeAll();
                    this.invalidSnippets.removeAll();

                    this.showSnippetManagerDialog(true);

                    this.loadSnippets(id, templateType);
                },

                /**
                 * Closes the snippet manager dialog
                 */
                closeSnippetManagerDialog: function(id, templateType) {
                    this.showSnippetManagerDialog(false);
                },

                /**
                 * Loads the snippets for the object
                 * 
                 * @param {string} id Id of the object
                 * @param {number} templateType Template type
                 */
                loadSnippets: function(id, templateType) {
                    this.snippetManagerDialogLoading(true);
                    this.snippetManagerDialogErrorOccured(false);
                    var availableSnippets = null;
                    var existingSnippets = null;

                    var templateSnippetsDef = GoNorth.HttpClient.get("/api/ExportApi/GetExportTemplateSnippetsByObjectId?id=" + id + "&templateType=" + templateType);
                    templateSnippetsDef.done(function(data) {
                        availableSnippets = data;
                    })

                    var existingSnippetsDef = GoNorth.HttpClient.get("/api/ExportApi/GetFilledExportTemplateSnippetsByObjectId?id=" + id);
                    existingSnippetsDef.done(function(data) {
                        existingSnippets = data;
                    })

                    var self = this;
                    jQuery.when(templateSnippetsDef, existingSnippetsDef).done(function() {
                        self.mergeSnippets(availableSnippets, existingSnippets);

                        self.snippetManagerDialogLoading(false);
                    }).fail(function(xhr) {
                        self.snippetManagerDialogLoading(false);
                        self.snippetManagerDialogErrorOccured(true);
                    });
                },


                /**
                 * Merges the available snippets and the existing snippets
                 * @param {object[]} availableSnippets Available snippets
                 * @param {object[]} existingSnippets Existing Snippets
                 */
                mergeSnippets: function(availableSnippets, existingSnippets) {
                    var availableSnippetsLookup = {};
                    for(var curSnippet = 0; curSnippet < availableSnippets.length; ++curSnippet)
                    {
                        availableSnippetsLookup[availableSnippets[curSnippet].name.toLowerCase()] = availableSnippets[curSnippet];
                    }

                    for(var curSnippet = 0; curSnippet < existingSnippets.length; ++curSnippet)
                    {
                        var snippetObject = this.createSnippetObject(existingSnippets[curSnippet].snippetName);
                        snippetObject.id = existingSnippets[curSnippet].id;
                        snippetObject.scriptName(existingSnippets[curSnippet].scriptName);
                        snippetObject.scriptType = existingSnippets[curSnippet].scriptType;
                        snippetObject.scriptNodeGraph = existingSnippets[curSnippet].scriptNodeGraph;
                        snippetObject.scriptCode = existingSnippets[curSnippet].scriptCode;

                        if(availableSnippetsLookup[snippetObject.snippetName.toLowerCase()])
                        {
                            availableSnippetsLookup[snippetObject.snippetName.toLowerCase()].wasUsed = true;
                            this.validSnippets.push(snippetObject);
                        }
                        else
                        {
                            this.invalidSnippets.push(snippetObject);
                        }
                    }

                    for(var curSnippet = 0; curSnippet < availableSnippets.length; ++curSnippet)
                    {
                        if(!availableSnippetsLookup[availableSnippets[curSnippet].name.toLowerCase()].wasUsed)
                        {
                            this.validSnippets.push(this.createSnippetObject(availableSnippets[curSnippet].name));
                        }
                    }
                },

                /**
                 * Creates a snippet object
                 * @param {string} snippetName Name of the snippet
                 * @returns {object} Snippet Object
                 */
                createSnippetObject: function(snippetName) {
                    return {
                        id: "",
                        objectId: this.objectId(),
                        snippetName: snippetName,
                        scriptName: new ko.observable(""),
                        scriptType: scriptTypeNone,
                        scriptNodeGraph: null,
                        scriptCode: null,
                    }
                },


                /**
                 * Creates or updates a snippet
                 * @param {object} snippet Snippet to create or update
                 */
                createUpdateSnippet: function(snippet) {
                    var self = this;
                    if(snippet.scriptType == scriptTypeNone)
                    {
                        this.chooseScriptTypeDialog.openDialog().done(function(selectedType) {
                            if(selectedType == GoNorth.Shared.ChooseScriptTypeDialog.nodeGraph)
                            {
                                self.nodeScriptDialog.openCreateDialog().done(function(result) {
                                    snippet.scriptName(result.name);
                                    snippet.scriptType = GoNorth.Shared.ChooseScriptTypeDialog.nodeGraph;
                                    snippet.scriptNodeGraph = result.graph;
                                    snippet.scriptCode = null;

                                    self.saveSnippet(snippet);
                                });
                            }
                            else if(selectedType == GoNorth.Shared.ChooseScriptTypeDialog.codeScript)
                            {
                                self.codeScriptDialog.openCreateDialog().done(function(result) {
                                    snippet.scriptName(result.name);
                                    snippet.scriptType = GoNorth.Shared.ChooseScriptTypeDialog.codeScript;
                                    snippet.scriptNodeGraph = null;
                                    snippet.scriptCode = result.code;

                                    self.saveSnippet(snippet);
                                });
                            }
                        });
                    }
                    else if(snippet.scriptType == GoNorth.Shared.ChooseScriptTypeDialog.nodeGraph)
                    {
                        this.nodeScriptDialog.openEditDialog(snippet.scriptName(), snippet.scriptNodeGraph).done(function(result) {
                            snippet.scriptName(result.name);
                            snippet.scriptNodeGraph = result.graph;

                            self.saveSnippet(snippet);
                        });
                    }
                    else if(snippet.scriptType == GoNorth.Shared.ChooseScriptTypeDialog.codeScript)
                    {
                        this.codeScriptDialog.openEditDialog(snippet.scriptName(), snippet.scriptCode).done(function(result) {
                            snippet.scriptName(result.name);
                            snippet.scriptCode = result.code;
                            
                            self.saveSnippet(snippet);
                        });
                    }
                },

                /**
                 * Saves a snippet
                 * @param {object} snippet Snippet to save
                 */
                saveSnippet: function(snippet) {
                    var url = "/api/ExportApi/CreateObjectExportSnippet?objectType=" + this.objectType;
                    if(snippet.id) 
                    {
                        url = "/api/ExportApi/UpdateObjectExportSnippet?id=" + snippet.id + "&objectType=" + this.objectType;
                    }

                    var requestData = {
                        id: snippet.id,
                        objectId: snippet.objectId,
                        snippetName: snippet.snippetName,
                        scriptName: snippet.scriptName(),
                        scriptType: snippet.scriptType,
                        scriptNodeGraph: snippet.scriptNodeGraph,
                        scriptCode: snippet.scriptCode
                    }

                    this.snippetManagerDialogLoading(false);
                    this.snippetManagerDialogErrorOccured(false);
                    var self = this;
                    GoNorth.HttpClient.post(url, requestData).done(function(result) {
                        self.snippetManagerDialogLoading(false);
                        
                        if(!snippet.id) 
                        {
                            snippet.id = result.id;
                        }

                        if(!result.isImplemented)
                        {
                            self.isImplementedObs(false);
                        }
                    }).fail(function() {
                        self.snippetManagerDialogLoading(false);
                        self.snippetManagerDialogErrorOccured(true);
                    });
                },


                /**
                 * Opens the confirm dialog to delete a snippet
                 * @param {object} snippet Snippet to delete
                 */
                openDeleteSnippetDialog: function(snippet) {
                    this.showConfirmDeleteDialog(true);
                    this.snippetToDelete = snippet;
                },

                /**
                 * Opens the confirm dialog to delete a snippet
                 * @param {object} snippet Snippet to delete
                 */
                deleteSnippet: function() {
                    if(!this.snippetToDelete)
                    {
                        return;
                    }

                    this.showConfirmDeleteDialog(false);

                    this.snippetManagerDialogLoading(false);
                    this.snippetManagerDialogErrorOccured(false);
                    var self = this;
                    GoNorth.HttpClient.delete("/api/ExportApi/DeleteObjectExportSnippet?id=" + this.snippetToDelete.id + "&objectType=" + this.objectType).done(function(result) {
                        self.snippetManagerDialogLoading(false);

                        self.resetSnippet(self.snippetToDelete);
                        self.invalidSnippets.remove(self.snippetToDelete);
                        self.snippetToDelete = null;
                        
                        if(!result.isImplemented)
                        {
                            self.isImplementedObs(false);
                        }
                    }).fail(function() {
                        self.snippetManagerDialogLoading(false);
                        self.snippetManagerDialogErrorOccured(true);
                        self.snippetToDelete = null;
                    });
                },

                /**
                 * Resets a snippet to its initial state
                 * @param {object} snippet Snippet to reset
                 */
                resetSnippet: function(snippet) {
                    snippet.id = "";
                    snippet.objectId = this.objectId();
                    snippet.scriptName("");
                    snippet.scriptType = scriptTypeNone;
                    snippet.scriptNodeGraph = null;
                    snippet.scriptCode = null;
                },

                /**
                 * Cancels the confirm delete snippet dialog
                 */
                cancelDeleteSnippetDialog: function() {
                    this.showConfirmDeleteDialog(false);
                    this.snippetToDelete = null;
                }
            }

        }(FlexFieldDatabase.ObjectForm = FlexFieldDatabase.ObjectForm || {}));
    }(GoNorth.FlexFieldDatabase = GoNorth.FlexFieldDatabase || {}));
}(window.GoNorth = window.GoNorth || {}));