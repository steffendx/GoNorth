(function(GoNorth) {
    "use strict";
    (function(Tale) {
        (function(Dialog) {

            /**
             * Dialog View Model
             * @class
             */
            Dialog.ViewModel = function()
            {
                GoNorth.DefaultNodeShapes.BaseViewModel.apply(this);

                this.id = new ko.observable("");
                this.dialogId = new ko.observable("");

                this.headerName = new ko.observable(Tale.Dialog.Localization.Tale);

                this.isLoading = new ko.observable(false);
                this.isReadonly = new ko.observable(false);
                this.lockedByUser = new ko.observable("");

                this.conditionDialog = new GoNorth.DefaultNodeShapes.Conditions.ConditionDialog();

                this.objectDialog = new GoNorth.ChooseObjectDialog.ViewModel();

                this.codeScriptDialog = new GoNorth.ScriptDialog.CodeScriptDialog(this.errorOccured);

                this.isImplemented = new ko.observable(false);
                this.compareDialog = new GoNorth.ImplementationStatus.CompareDialog.ViewModel();

                this.dialogStatistics = new ko.observable(null);
                this.dialogStatisticsWordCountExpanded = new ko.observable(false);
                this.dialogStatisticsConditionCountExpanded = new ko.observable(false);
                this.dialogStatisticsNodeCountExpanded = new ko.observable(false);
                this.showStatisticsDialog = new ko.observable(false);

                this.showReturnToNpcButton = new ko.observable(false);
                
                var npcId = GoNorth.Util.getParameterFromUrl("npcId");
                if(npcId)
                {
                    this.id(npcId);
                    this.loadNpcName();
                    this.load();
                    this.acquireLock();
                    this.showReturnToNpcButton(true);
                }
                else
                {
                    this.errorOccured(true);
                    this.isReadonly(true);
                }
                

                // Add access to object id for actions and conditions
                var self = this;
                GoNorth.DefaultNodeShapes.getCurrentRelatedObjectId = function() {
                    return self.id();
                };

                // Add access to condition dialog
                GoNorth.DefaultNodeShapes.openConditionDialog = function(condition) {
                    if(self.isReadonly())
                    {
                        var readonlyDeferred = new jQuery.Deferred();
                        readonlyDeferred.reject();
                        return readonlyDeferred.promise();
                    }

                    var conditionDialogDeferred = new jQuery.Deferred();
                    self.conditionDialog.openDialog(condition, conditionDialogDeferred);
                    return conditionDialogDeferred;
                };

                // Opens the general object search dialog 
                GoNorth.DefaultNodeShapes.openGeneralObjectSearchDialog = function() {
                    if(self.isReadonly())
                    {
                        var readonlyDeferred = new jQuery.Deferred();
                        readonlyDeferred.reject();
                        return readonlyDeferred.promise();
                    }

                    return self.objectDialog.openGeneralObjectSearch(Tale.Localization.ViewModel.ChooseGeneralObject);                    
                };
                
                // Add access to object dialog
                GoNorth.DefaultNodeShapes.openItemSearchDialog = function() {
                    if(self.isReadonly())
                    {
                        var readonlyDeferred = new jQuery.Deferred();
                        readonlyDeferred.reject();
                        return readonlyDeferred.promise();
                    }

                    return self.objectDialog.openItemSearch(GoNorth.DefaultNodeShapes.Localization.Dialogs.ChooseItem);
                };

                // Opens the quest search dialog 
                GoNorth.DefaultNodeShapes.openQuestSearchDialog = function() {
                    if(self.isReadonly())
                    {
                        var readonlyDeferred = new jQuery.Deferred();
                        readonlyDeferred.reject();
                        return readonlyDeferred.promise();
                    }

                    return self.objectDialog.openQuestSearch(Tale.Localization.ViewModel.ChooseQuest);                    
                };
                
                // Opens the npc search dialog 
                GoNorth.DefaultNodeShapes.openNpcSearchDialog = function() {
                    if(self.isReadonly())
                    {
                        var readonlyDeferred = new jQuery.Deferred();
                        readonlyDeferred.reject();
                        return readonlyDeferred.promise();
                    }

                    return self.objectDialog.openNpcSearch(Tale.Localization.ViewModel.ChooseNpc);                    
                };

                // Opens the skill search dialog 
                GoNorth.DefaultNodeShapes.openSkillSearchDialog = function() {
                    if(self.isReadonly())
                    {
                        var readonlyDeferred = new jQuery.Deferred();
                        readonlyDeferred.reject();
                        return readonlyDeferred.promise();
                    }

                    return self.objectDialog.openSkillSearch(Tale.Localization.ViewModel.ChooseSkill);                    
                };

                // Opens the daily routine event dialog
                GoNorth.DefaultNodeShapes.openDailyRoutineEventSearchDialog = function() {
                    if(self.isReadonly())
                    {
                        var readonlyDeferred = new jQuery.Deferred();
                        readonlyDeferred.reject();
                        return readonlyDeferred.promise();
                    }

                    return self.objectDialog.openDailyRoutineSearch(Tale.Localization.ViewModel.ChooseDailyRoutineEvent);                    
                };

                // Opens the marker search dialog
                GoNorth.DefaultNodeShapes.openMarkerSearchDialog = function() {
                    if(self.isReadonly())
                    {
                        var readonlyDeferred = new jQuery.Deferred();
                        readonlyDeferred.reject();
                        return readonlyDeferred.promise();
                    }

                    return self.objectDialog.openMarkerSearch(Tale.Localization.ViewModel.ChooseMarker);                    
                };

                // Opens the code editor
                GoNorth.DefaultNodeShapes.openCodeEditor = function(name, scriptCode) {
                    if(self.isReadonly())
                    {
                        var readonlyDeferred = new jQuery.Deferred();
                        readonlyDeferred.reject();
                        return readonlyDeferred.promise();
                    }

                    return self.codeScriptDialog.openEditDialog(name, scriptCode);              
                };

                // Load config lists
                GoNorth.DefaultNodeShapes.Shapes.loadConfigLists().fail(function() {
                    self.errorOccured(true);
                });

                // Dirty Check
                this.dirtyChecker = new GoNorth.SaveUtil.DirtyChecker(function() {
                    return self.buildSaveRequestObject();
                }, GoNorth.Tale.Dialog.Localization.DirtyMessage, GoNorth.Tale.Dialog.disableAutoSaving, function() {
                    self.save();
                });

                GoNorth.SaveUtil.setupSaveHotkey(function() {
                    self.save();
                });
            };

            Dialog.ViewModel.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.BaseViewModel.prototype);

            /**
             * Loads the npc name
             */
            Dialog.ViewModel.prototype.loadNpcName = function() {
                this.errorOccured(false);
                var self = this;
                GoNorth.HttpClient.post("/api/KortistoApi/ResolveFlexFieldObjectNames", [ this.id() ]).done(function(npcNames) {
                    if(npcNames && npcNames.length == 1)
                    {
                        self.headerName(npcNames[0].name);
                    }
                    else
                    {
                        self.errorOccured(true);
                    }
                }).fail(function(xhr) {
                    self.errorOccured(true);
                });
            };

            /**
             * Builds the save request object
             * @returns {object} Save request object
             */
            Dialog.ViewModel.prototype.buildSaveRequestObject = function() {
                return GoNorth.DefaultNodeShapes.Serialize.getNodeSerializerInstance().serializeGraph(this.nodeGraph());
            }

            /**
             * Saves the node graph
             */
            Dialog.ViewModel.prototype.save = function() {
                if(!this.nodeGraph() || !this.id())
                {
                    return;
                }

                var serializedGraph = this.buildSaveRequestObject();

                this.isLoading(true);
                this.errorOccured(false);
                var self = this;
                GoNorth.HttpClient.post("/api/TaleApi/SaveDialog?relatedObjectId=" + this.id(), serializedGraph).done(function(data) {
                    self.isLoading(false);

                    if(!self.dialogId())
                    {
                        self.dialogId(data.id);
                    }

                    self.isImplemented(data.isImplemented);

                    if(window.taleDialogSaved) {
                        window.taleDialogSaved(self.id());
                    }
                    self.dirtyChecker.saveCurrentSnapshot();
                }).fail(function(xhr) {
                    self.isLoading(false);
                    self.errorOccured(true);
                });
            };

            /**
             * Loads the data
             */
            Dialog.ViewModel.prototype.load = function() {
                if(!this.id())
                {
                    return;
                }

                this.isLoading(true);
                this.errorOccured(false);
                var self = this;
                GoNorth.HttpClient.get("/api/TaleApi/GetDialogByRelatedObjectId?relatedObjectId=" + this.id()).done(function(data) {
                    self.isLoading(false);

                    // Only deserialize data if a dialog already exists, will be null before someone saves a dialog
                    if(data)
                    {
                        self.dialogId(data.id);
                        self.isImplemented(data.isImplemented);

                        GoNorth.DefaultNodeShapes.Serialize.getNodeSerializerInstance().deserializeGraph(self.nodeGraph(), data, function(newNode) { self.setupNewNode(newNode); });
                        self.focusNodeFromUrl();

                        if(self.isReadonly())
                        {
                            self.setGraphToReadonly();
                        }
                    }
                    else
                    {
                        self.dialogId("");
                        self.isImplemented(false);
                    }
                    
                    self.dirtyChecker.saveCurrentSnapshot();
                }).fail(function(xhr) {
                    self.isLoading(false);
                    self.errorOccured(true);
                });
            };

            /**
             * Opens the compare dialog
             */
            Dialog.ViewModel.prototype.openCompareDialog = function() {
                var self = this;
                this.compareDialog.openDialogCompare(this.dialogId(), this.headerName()).done(function() {
                    self.isImplemented(true);
                });
            };

            /**
             * Opens the statistics dialog
             */
            Dialog.ViewModel.prototype.openStatisticsDialog = function() {
                var graph = this.nodeGraph();
                var paper = this.nodePaper();

                var statistics = GoNorth.DefaultNodeShapes.getNodeStatistics(graph, paper);
                
                this.dialogStatistics(statistics);
                this.dialogStatisticsWordCountExpanded(false);
                this.dialogStatisticsConditionCountExpanded(false);
                this.dialogStatisticsNodeCountExpanded(false);
                this.showStatisticsDialog(true);
            };

            /**
             * Toggles the visibility of the detailed word count statistics
             */
            Dialog.ViewModel.prototype.toggleDialogStatisticsWordCount = function() {
                this.dialogStatisticsWordCountExpanded(!this.dialogStatisticsWordCountExpanded());
            }
            
            /**
             * Toggles the visibility of the detailed condition count statistics
             */
            Dialog.ViewModel.prototype.toggleDialogStatisticsConditionCount = function() {
                this.dialogStatisticsConditionCountExpanded(!this.dialogStatisticsConditionCountExpanded());
            }
            
            /**
             * Toggles the visibility of the detailed node count statistics
             */
            Dialog.ViewModel.prototype.toggleDialogStatisticsNodeCount = function() {
                this.dialogStatisticsNodeCountExpanded(!this.dialogStatisticsNodeCountExpanded());
            }

            /**
             * Closes the statistics dialog
             */
            Dialog.ViewModel.prototype.closeStatisticsDialog = function() {
                this.showStatisticsDialog(false);
            };

            /**
             * Returns to the npc
             */
            Dialog.ViewModel.prototype.returnToNpc = function() {
                if(!this.id())
                {
                    return;
                }

                window.location = "/Kortisto/Npc?id=" + this.id();
            };

            
            /**
             * Acquires a lock
             */
            Dialog.ViewModel.prototype.acquireLock = function() {
                this.lockedByUser("");
                this.isReadonly(false);

                var self = this;
                GoNorth.LockService.acquireLock("TaleDialog", this.id()).done(function(isLocked, lockedUsername) { 
                    if(isLocked)
                    {
                        self.isReadonly(true);
                        self.lockedByUser(lockedUsername);
                        self.setGraphToReadonly();
                    }
                }).fail(function() {
                    self.errorOccured(true);
                });
            };

        }(Tale.Dialog = Tale.Dialog || {}));
    }(GoNorth.Tale = GoNorth.Tale || {}));
}(window.GoNorth = window.GoNorth || {}));