(function(GoNorth) {
    "use strict";
    (function(StateMachine) {

        /// X-Coordinate of the start node on create
        var startNodeX = 80;

        /// Y-Coordinate of the start node on create
        var startNodeY = 350;

        /**
         * State machine View Model
         * @class
         */
        StateMachine.ViewModel = function()
        {
            GoNorth.DefaultNodeShapes.BaseViewModel.apply(this);

            this.nodeDropOffsetX = 75;
            this.nodeDropOffsetY = -15;

            this.id = new ko.observable("");
            this.stateMachineId = new ko.observable("");

            this.headerName = new ko.observable(GoNorth.StateMachine.Localization.ViewModel.StateMachine);

            this.isTemplateMode = new ko.observable(false);
            this.templateId = new ko.observable(null);
            this.parentStateMachineUrl = new ko.computed(function() {
                return "/StateMachine?npcTemplateId=" + this.templateId();
            }, this);

            this.customizedStateMachineIsDefault = new ko.observable(false);

            this.isLoading = new ko.observable(false);
            this.isReadonly = new ko.observable(false);
            this.lockedByUser = new ko.observable("");

            this.conditionDialog = new GoNorth.DefaultNodeShapes.Conditions.ConditionDialog();

            this.objectDialog = new GoNorth.ChooseObjectDialog.ViewModel();

            this.chooseScriptTypeDialog = new GoNorth.Shared.ChooseScriptTypeDialog.ViewModel();
            this.codeScriptDialog = new GoNorth.ScriptDialog.CodeScriptDialog(this.errorOccured);
            this.nodeScriptDialog = new GoNorth.ScriptDialog.NodeScriptDialog(this.id, this.objectDialog, this.codeScriptDialog, this.errorOccured);

            this.showReturnToNpcButton = new ko.observable(false);

            this.showLabelDialog = new ko.observable(false);
            this.transitionLabel = new ko.observable("");
            this.stateTransitionToUpdate = null;

            this.showStateSettings = new ko.observable(false);
            this.stateDescription = new ko.observable("");
            this.stateScript = new ko.observable("");
            this.stateScriptType = StateMachine.Shapes.StateScriptTypes.none;
            this.stateScriptCode = "";
            this.stateScriptGraph = null;
            this.stateDontExportToScript = new ko.observable(false);
            this.stateToUpdate = null;
            
            this.showConfirmDeleteScriptDialog = new ko.observable(false);

            this.customizedStateMachines = new ko.observableArray([]);

            this.layouter = new StateMachine.StateMachineLayouter(this.nodeGraph, this.nodePaper);

            this.initEvents();
            this.init();

            var self = this;
            GoNorth.Util.onUrlParameterChanged(function() {
                var nodePaper = self.nodePaper();
                if(nodePaper) {
                    nodePaper.translate(0, 0);
                    nodePaper.scale(1.0);
                }

                self.customizedStateMachineIsDefault(false);
                self.customizedStateMachines.removeAll();
                GoNorth.LockService.releaseCurrentLock();
                self.init();
            });

            // Add access to object id for actions and conditions
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

                return self.objectDialog.openGeneralObjectSearch(StateMachine.Localization.ViewModel.ChooseGeneralObject);                    
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

                return self.objectDialog.openQuestSearch(StateMachine.Localization.ViewModel.ChooseQuest);                    
            };
            
            // Opens the npc search dialog 
            GoNorth.DefaultNodeShapes.openNpcSearchDialog = function() {
                if(self.isReadonly())
                {
                    var readonlyDeferred = new jQuery.Deferred();
                    readonlyDeferred.reject();
                    return readonlyDeferred.promise();
                }

                return self.objectDialog.openNpcSearch(StateMachine.Localization.ViewModel.ChooseNpc);                    
            };

            // Opens the skill search dialog 
            GoNorth.DefaultNodeShapes.openSkillSearchDialog = function() {
                if(self.isReadonly())
                {
                    var readonlyDeferred = new jQuery.Deferred();
                    readonlyDeferred.reject();
                    return readonlyDeferred.promise();
                }

                return self.objectDialog.openSkillSearch(StateMachine.Localization.ViewModel.ChooseSkill);                    
            };

            // Opens the daily routine event dialog
            GoNorth.DefaultNodeShapes.openDailyRoutineEventSearchDialog = function() {
                if(self.isReadonly())
                {
                    var readonlyDeferred = new jQuery.Deferred();
                    readonlyDeferred.reject();
                    return readonlyDeferred.promise();
                }

                return self.objectDialog.openDailyRoutineSearch(StateMachine.Localization.ViewModel.ChooseDailyRoutineEvent);                    
            };

            // Opens the marker search dialog
            GoNorth.DefaultNodeShapes.openMarkerSearchDialog = function() {
                if(self.isReadonly())
                {
                    var readonlyDeferred = new jQuery.Deferred();
                    readonlyDeferred.reject();
                    return readonlyDeferred.promise();
                }

                return self.objectDialog.openMarkerSearch(StateMachine.Localization.ViewModel.ChooseMarker);                    
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

            // Access to editing a node extended settings
            StateMachine.openStateSettings = function(stateModel) {
                self.openStateSettingsDialog(stateModel);
            };
        };

        StateMachine.ViewModel.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.BaseViewModel.prototype);

        /**
         * Creates the state transition link
         * @param {object} initData Data for initalizing
         * @returns {object} State transition link
         */
        StateMachine.ViewModel.prototype.createStateTransition = function(initData) {
            return StateMachine.Shapes.createStateTransition(initData);
        };


        /**
         * Initializes the state machine
         */
        StateMachine.ViewModel.prototype.init = function() {
            var self = this;

            var npcId = GoNorth.Util.getParameterFromUrl("npcId");
            var npcTemplateId = GoNorth.Util.getParameterFromUrl("npcTemplateId");
            if(npcId || npcTemplateId)
            {
                this.id(npcId || npcTemplateId);
                this.isTemplateMode(!!npcTemplateId);
                this.loadNpcName(this.isTemplateMode()).done(function() {
                    self.load();
                });

                if(this.isTemplateMode())
                {
                    this.loadCustomizedStateMachines();
                }

                this.acquireLock();
                this.showReturnToNpcButton(true);
            }
            else
            {
                this.errorOccured(true);
                this.isReadonly(true);
            }
        }

        /**
         * Initialisiert die Events
         */
        StateMachine.ViewModel.prototype.initEvents = function() {
            var self = this;
            var subscription = this.nodePaper.subscribe(function(paperValue) {
                if(paperValue)
                {
                    subscription.dispose();
                    paperValue.on('link:pointerdown', function(linkView, evt) {
                        if(jQuery(evt.target).parents(".marker-arrowheads, .link-tools").length == 0 && linkView.model.getSourceElement() && linkView.model.getTargetElement()) {
                            self.onChangeTransitionLabel(linkView.model);
                        }
                    });
                }
            });
        };

        /**
         * Loads the npc name
         * @param {boolean} isTemplate True if the obejct is a template, else false
         * @returns {jQuery.Deferred} Deferred for the loading process
         */
        StateMachine.ViewModel.prototype.loadNpcName = function(isTemplate) {
            var def = new jQuery.Deferred();

            var url = "/api/KortistoApi/FlexFieldObject?id=" + this.id();
            if(isTemplate) 
            {
                url = "/api/KortistoApi/FlexFieldTemplate?id=" + this.id();
            }

            this.errorOccured(false);
            var self = this;
            GoNorth.HttpClient.get(url).done(function(npc) {
                if(npc && npc.name)
                {
                    self.headerName(npc.name);

                    if(!isTemplate) {
                        self.templateId(npc.templateId);
                    } else {
                        self.templateId(null);
                    }
                }
                else
                {
                    self.errorOccured(true);
                }

                def.resolve();
            }).fail(function(xhr) {
                self.errorOccured(true);
                def.reject();
            });

            return def.promise();
        };

        /**
         * Saves the node graph
         */
        StateMachine.ViewModel.prototype.save = function() {
            if(!this.nodeGraph() || !this.id())
            {
                return;
            }

            var serializedGraph = GoNorth.DefaultNodeShapes.Serialize.getNodeSerializerInstance().serializeGraph(this.nodeGraph());

            this.isLoading(true);
            this.errorOccured(false);
            var self = this;
            GoNorth.HttpClient.post("/api/StateMachineApi/SaveStateMachine?relatedObjectId=" + this.id(), serializedGraph).done(function(data) {
                self.isLoading(false);
                self.customizedStateMachineIsDefault(false);

                if(!self.stateMachineId())
                {
                    self.stateMachineId(data.id);
                }
            }).fail(function(xhr) {
                self.isLoading(false);
                self.errorOccured(true);
            });
        };

        /**
         * Loads the data
         */
        StateMachine.ViewModel.prototype.load = function() {
            if(!this.id())
            {
                return;
            }

            this.isLoading(true);
            this.errorOccured(false);
            var self = this;
            GoNorth.HttpClient.get("/api/StateMachineApi/GetStateMachineByRelatedObjectId?relatedObjectId=" + this.id()).done(function(data) {
                self.isLoading(false);

                // Only deserialize data if a state machine already exists, will be null before someone saves a state machine
                if(data)
                {
                    self.processStateMachine(data);
                }
                else if(!self.isTemplateMode())
                {
                    GoNorth.HttpClient.get("/api/StateMachineApi/GetStateMachineByRelatedObjectId?relatedObjectId=" + self.templateId()).done(function(templateStateMachine) {
                        if(templateStateMachine)
                        {
                            self.processStateMachine(templateStateMachine);
                            self.customizedStateMachineIsDefault(true);
                        }
                        else
                        {
                            self.stateMachineId("");
                            self.addStartNodeToPaper();
                        }
                    }).fail(function(xhr) {
                        self.isLoading(false);
                        self.errorOccured(true);
                    });
                }
                else
                {
                    self.stateMachineId("");
                    self.addStartNodeToPaper();
                }
            }).fail(function(xhr) {
                self.isLoading(false);
                self.errorOccured(true);
            });
        };

        /**
         * Processes a state machine and adds it to the graph
         * @param {object} stateMachine Loaded state machine
         */
        StateMachine.ViewModel.prototype.processStateMachine = function(stateMachine) {
            this.stateMachineId(stateMachine.id);

            var self = this;
            GoNorth.DefaultNodeShapes.Serialize.getNodeSerializerInstance().deserializeGraph(this.nodeGraph(), stateMachine, function(newNode) { self.setupNewNode(newNode); }, this.createStateTransition);
            this.focusNodeFromUrl();

            if(this.isReadonly())
            {
                this.setGraphToReadonly();
            }
        };

        /**
         * Loads the customized state machines
         */
        StateMachine.ViewModel.prototype.loadCustomizedStateMachines = function() {
            if(!this.id())
            {
                return;
            }

            var self = this;
            GoNorth.HttpClient.get("/api/StateMachineApi/GetCustomizedStateMachinesByParentObject?relatedObjectId=" + this.id()).done(function(data) {
                self.customizedStateMachines(data);
            }).fail(function(xhr) {
                self.errorOccured(true);
            });
        };

        /**
         * Returns to the npc
         */
        StateMachine.ViewModel.prototype.returnToNpc = function() {
            if(!this.id())
            {
                return;
            }

            var targetUrl = "/Kortisto/Npc?";
            if(this.isTemplateMode())
            {
                targetUrl += "template=1&";
            }

            window.location = targetUrl + "id=" + this.id();
        };

        /**
         * Builds the url for a child state machine
         * @param {Referenced} referencedObject Referenced object
         * @returns {string} Url to the child object state machine
         */
        StateMachine.ViewModel.prototype.buildChildStateMachineUrl = function(referencedObject) {
            return "/StateMachine?npcId=" + referencedObject.objectId;
        }

        /**
         * Adds the state start node to the paper once the paper is ready
         */
        StateMachine.ViewModel.prototype.addStartNodeToPaper = function() {
            var paper = this.nodePaper();
            if(!paper) {
                var self = this;
                var subscription = this.nodePaper.subscribe(function(paperValue) {
                    if(paperValue)
                    {
                        subscription.dispose();
                        self.addStartNode();
                    }
                });
            } else {
                this.addStartNode();
            }
        };

        /**
         * Adds the state start node to the paper
         */
        StateMachine.ViewModel.prototype.addStartNodeToPaper = function() {
            var initOptions = this.calcNodeInitOptionsPosition(startNodeX, startNodeY);
            this.addNodeByType(StateMachine.Shapes.startType, initOptions);
        };


        /**
         * Gets called if the state transition label must be changed
         * @param {object} stateTransition State Transition
         */
        StateMachine.ViewModel.prototype.onChangeTransitionLabel = function(stateTransition) {
            var label = stateTransition.label(0);
            if(!label || !label.attrs || !label.attrs.text) {
                return;
            }

            this.showLabelDialog(true);
            this.transitionLabel(label.attrs.text.text);
            this.stateTransitionToUpdate = stateTransition;
        };
        
        /**
         * Saves the transition label
         */
        StateMachine.ViewModel.prototype.saveTransitionLabel = function() {
            if(this.stateTransitionToUpdate) {
                this.stateTransitionToUpdate.label(0, { attrs: { text: { text: this.transitionLabel() } } });
            }

            this.closeStateTransitionDialog();
        };

        /**
         * Gets called if the state transition dialog must be closed
         */
        StateMachine.ViewModel.prototype.closeStateTransitionDialog = function() {
            this.showLabelDialog(false);
            this.stateTransitionToUpdate = null;
        };
        


        /**
         * Opens the state settings dialog
         * @param {object} stateModel State that is being updated
         */
        StateMachine.ViewModel.prototype.openStateSettingsDialog = function(stateModel) {
            this.showStateSettings(true);

            this.stateToUpdate = stateModel;
            this.stateDescription(stateModel.get("description"));
            this.stateScript(stateModel.get("scriptName"));
            this.stateScriptType = stateModel.get("scriptType");
            this.stateScriptCode = stateModel.get("scriptCode");
            this.stateScriptGraph = stateModel.get("scriptNodeGraph");
            this.stateDontExportToScript(stateModel.get("dontExportToScript"));
        };

        /**
         * Saves the state settings
         */
        StateMachine.ViewModel.prototype.saveStateSettings = function() {
            if(this.stateToUpdate) {
                this.stateToUpdate.set("description", this.stateDescription());
                this.stateToUpdate.set("scriptName", this.stateScript());
                this.stateToUpdate.set("scriptType", this.stateScriptType);
                this.stateToUpdate.set("scriptCode", this.stateScriptCode);
                this.stateToUpdate.set("scriptNodeGraph", this.stateScriptGraph);
                this.stateToUpdate.set("dontExportToScript", this.stateDontExportToScript());
            }
            this.closeStateSettingsDialog();
        };

        /**
         * Closes the state settings dialog
         */
        StateMachine.ViewModel.prototype.closeStateSettingsDialog = function() {
            this.showStateSettings(false);
            this.stateToUpdate = null;
        };

        /**
         * Adds or edits the script of a state
         */
        StateMachine.ViewModel.prototype.addEditStateScript = function() {
            if(this.stateScriptType == StateMachine.Shapes.StateScriptTypes.none)
            {
                this.addStateScript();
            }
            else
            {
                this.editStateScript();
            }
        }

        /**
         * Adds a new state script
         */
        StateMachine.ViewModel.prototype.addStateScript = function() {
            var self = this;
            this.chooseScriptTypeDialog.openDialog().done(function(selectedType) {
                if(selectedType == GoNorth.Shared.ChooseScriptTypeDialog.nodeGraph)
                {
                    self.nodeScriptDialog.openCreateDialog().done(function(result) {
                        self.stateScript(result.name);
                        self.stateScriptType = StateMachine.Shapes.StateScriptTypes.nodeGraph;
                        self.stateScriptCode = "";
                        self.stateScriptGraph = result.graph;
                    });
                }
                else if(selectedType == GoNorth.Shared.ChooseScriptTypeDialog.codeScript)
                {
                    self.codeScriptDialog.openCreateDialog().done(function(result) {
                        self.stateScript(result.name);
                        self.stateScriptType = StateMachine.Shapes.StateScriptTypes.codeScript;
                        self.stateScriptCode = result.code;
                        self.stateScriptGraph = null;
                    });
                }
            });
        };

        /**
         * Edits a state script
         */
        StateMachine.ViewModel.prototype.editStateScript = function() {
            var self = this;
            if(this.stateScriptType == StateMachine.Shapes.StateScriptTypes.nodeGraph)
            {
                this.nodeScriptDialog.openEditDialog(this.stateScript(), this.stateScriptGraph).done(function(result) {
                    self.stateScript(result.name);
                    self.stateScriptGraph = result.graph;
                });
            }
            else if(this.stateScriptType == StateMachine.Shapes.StateScriptTypes.codeScript)
            {
                this.codeScriptDialog.openEditDialog(this.stateScript(), this.stateScriptCode).done(function(result) {
                    self.stateScript(result.name);
                    self.stateScriptCode = result.code;
                });
            }
        };

        /**
         * Opens the confirm dialog to delete a script
         */
        StateMachine.ViewModel.prototype.openConfirmDeleteScriptDialog = function() {
            this.showConfirmDeleteScriptDialog(true);
        };

        /**
         * Removes the state script
         */
        StateMachine.ViewModel.prototype.removeStateScript = function() {
            this.stateScript("");
            this.stateScriptType = StateMachine.Shapes.StateScriptTypes.none;
            this.stateScriptCode = "";
            this.stateScriptGraph = null;

            this.closeConfirmDeleteScriptDialog();
        };

        /**
         * Closes the confirm delete script dialog
         */
        StateMachine.ViewModel.prototype.closeConfirmDeleteScriptDialog = function() {
            this.showConfirmDeleteScriptDialog(false);
        };


        /**
         * Acquires a lock
         */
        StateMachine.ViewModel.prototype.acquireLock = function() {
            this.lockedByUser("");
            this.isReadonly(false);

            var self = this;
            GoNorth.LockService.acquireLock("StateMachine", this.id()).done(function(isLocked, lockedUsername) { 
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

    }(GoNorth.StateMachine = GoNorth.StateMachine || {}));
}(window.GoNorth = window.GoNorth || {}));