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

                this.isImplemented = new ko.observable(false);
                this.compareDialog = new GoNorth.ImplementationStatus.CompareDialog.ViewModel();

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
                Tale.getCurrentRelatedObjectId = function() {
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

                // Add access to object dialog
                Tale.openItemSearchDialog = function() {
                    if(self.isReadonly())
                    {
                        var readonlyDeferred = new jQuery.Deferred();
                        readonlyDeferred.reject();
                        return readonlyDeferred.promise();
                    }

                    return self.objectDialog.openItemSearch(Tale.Localization.ViewModel.ChooseItem);
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

                // Load config lists
                GoNorth.DefaultNodeShapes.Shapes.loadConfigLists().fail(function() {
                    self.errorOccured(true);
                });
            };

            Dialog.ViewModel.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.BaseViewModel.prototype);

            /**
             * Loads the npc name
             */
            Dialog.ViewModel.prototype.loadNpcName = function() {
                this.errorOccured(false);
                var self = this;
                jQuery.ajax({ 
                    url: "/api/KortistoApi/ResolveFlexFieldObjectNames", 
                    headers: GoNorth.Util.generateAntiForgeryHeader(),
                    data: JSON.stringify([ this.id() ]), 
                    type: "POST",
                    contentType: "application/json"
                }).done(function(npcNames) {
                    self.headerName(npcNames[0].name);
                }).fail(function(xhr) {
                    self.errorOccured(true);
                });
            };

            /**
             * Saves the node graph
             */
            Dialog.ViewModel.prototype.save = function() {
                if(!this.nodeGraph() || !this.id())
                {
                    return;
                }

                var serializedGraph = GoNorth.DefaultNodeShapes.Serialize.getNodeSerializerInstance().serializeGraph(this.nodeGraph());

                this.isLoading(true);
                this.errorOccured(false);
                var self = this;
                jQuery.ajax({ 
                    url: "/api/TaleApi/SaveDialog?relatedObjectId=" + this.id(), 
                    headers: GoNorth.Util.generateAntiForgeryHeader(),
                    data: JSON.stringify(serializedGraph), 
                    type: "POST",
                    contentType: "application/json"
                }).done(function(data) {
                    self.isLoading(false);

                    if(!self.dialogId())
                    {
                        self.dialogId(data.id);
                    }

                    self.isImplemented(data.isImplemented);

                    if(window.taleDialogSaved) {
                        window.taleDialogSaved(self.id());
                    }
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
                jQuery.ajax({ 
                    url: "/api/TaleApi/GetDialogByRelatedObjectId?relatedObjectId=" + this.id(), 
                    type: "GET"
                }).done(function(data) {
                    self.isLoading(false);

                    // Only deserialize data if a dialog already exists, will be null before someone saves a dialog
                    if(data)
                    {
                        self.dialogId(data.id);
                        self.isImplemented(data.isImplemented);

                        GoNorth.DefaultNodeShapes.Serialize.getNodeSerializerInstance().deserializeGraph(self.nodeGraph(), data, function(newNode) { self.setupNewNode(newNode); });

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
             * Opens the config page
             */
            Dialog.ViewModel.prototype.openConfigPage = function() {
                window.location = "/Tale/Config";
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