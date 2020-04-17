(function(GoNorth) {
    "use strict";
    (function(ScriptDialog) {

            ScriptDialog.currentNodeDialogIndex = 0;

            /**
             * Viewmodel for a dialog to enter a script using a node system
             * @param {ko.observable} npcId Npc id to which the node system is related
             * @param {GoNorth.ChooseObjectDialog.ViewModel} objectDialog Object choose dialog
             * @param {GoNorth.ScriptDialog.CodeEditor} codeEditor Code editor dialog
             * @param {ko.observable} errorOccured Error occured observable
             * @class
             */
            ScriptDialog.NodeScriptDialog = function(npcId, objectDialog, codeEditor, errorOccured)
            {
                GoNorth.DefaultNodeShapes.BaseViewModel.apply(this);

                this.dialogId = ScriptDialog.currentNodeDialogIndex;
                ++ScriptDialog.currentNodeDialogIndex;

                this.npcId = npcId;

                this.chooseObjectDialog = objectDialog;
                this.errorOccured = errorOccured;

                this.isVisible = new ko.observable(false);
                this.isEditing = new ko.observable(false);

                this.originalScriptName = "";
                this.originalScriptNodes = {};
                this.scriptName = new ko.observable("");

                this.conditionDialog = new GoNorth.DefaultNodeShapes.Conditions.ConditionDialog();

                this.codeEditor = codeEditor;

                this.editDeferred = null;

                this.showConfirmCloseDialog = new ko.observable(false);
                this.confirmedClose = false;

                // Add access to object id for actions and conditions
                var self = this;
                GoNorth.DefaultNodeShapes.getCurrentRelatedObjectId = function() {
                    return self.npcId();
                };

                // Add access to condition dialog
                GoNorth.DefaultNodeShapes.openConditionDialog = function(condition) {
                    var conditionDialogDeferred = new jQuery.Deferred();
                    self.conditionDialog.openDialog(condition, conditionDialogDeferred);
                    return conditionDialogDeferred;
                };

                // Opens the item search dialog
                GoNorth.DefaultNodeShapes.openItemSearchDialog = function() {
                    return self.chooseObjectDialog.openItemSearch(GoNorth.DefaultNodeShapes.Localization.Dialogs.ChooseItem);
                };

                // Opens the quest search dialog 
                GoNorth.DefaultNodeShapes.openQuestSearchDialog = function() {
                    return self.chooseObjectDialog.openQuestSearch(ScriptDialog.Localization.NodeScripts.ChooseQuest);                    
                };
                
                // Opens the npc search dialog 
                GoNorth.DefaultNodeShapes.openNpcSearchDialog = function() {
                    return self.chooseObjectDialog.openNpcSearch(ScriptDialog.Localization.NodeScripts.ChooseNpc);                    
                };

                // Opens the skill search dialog 
                GoNorth.DefaultNodeShapes.openSkillSearchDialog = function() {
                    return self.chooseObjectDialog.openSkillSearch(ScriptDialog.Localization.NodeScripts.ChooseSkill);                    
                };

                // Opens the daily routine event dialog
                GoNorth.DefaultNodeShapes.openDailyRoutineEventSearchDialog = function() {
                    return self.chooseObjectDialog.openDailyRoutineSearch(ScriptDialog.Localization.NodeScripts.ChooseDailyRoutineEvent);                    
                };

                // Opens the daily routine event dialog
                GoNorth.DefaultNodeShapes.openMarkerSearchDialog = function() {
                    return self.chooseObjectDialog.openMarkerSearch(ScriptDialog.Localization.NodeScripts.ChooseMarker);                    
                };
                
                // Opens the code editor
                GoNorth.DefaultNodeShapes.openCodeEditor = function(name, scriptCode) {
                    return self.codeEditor.openEditDialog(name, scriptCode);              
                };

                // Load config lists
                GoNorth.DefaultNodeShapes.Shapes.loadConfigLists().fail(function() {
                    self.errorOccured(true);
                });
            };

            
            ScriptDialog.NodeScriptDialog.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.BaseViewModel.prototype);

            ScriptDialog.NodeScriptDialog.prototype = jQuery.extend(ScriptDialog.NodeScriptDialog.prototype, {
                /**
                 * Opens the create node script dialog
                 * @returns {jQuery.Deferred} Deferred that will be resolved with the result of the dialog
                 */
                openCreateDialog: function() {
                    return this.openDialogInternally("", {});
                },
                
                /**
                 * Opens the edit node script dialog
                 * 
                 * @param {string} name Name to edit
                 * @param {string} nodes Nodes to edit
                 * @returns {jQuery.Deferred} Deferred that will be resolved with the result of the dialog
                 */
                openEditDialog: function(name, nodes) {
                    return this.openDialogInternally(name, nodes);
                },

                /**
                 * Opens the node script dialog
                 * @param {string} name Name to edit
                 * @param {string} nodes Nodes to edit
                 * @returns {jQuery.Deferred} Deferred that will be resolved with the result of the dialog
                 */
                openDialogInternally: function(name, nodes) {
                    if(this.editDeferred != null)
                    {
                        this.editDeferred.reject();
                    }

                    this.isVisible(true);
                    this.isEditing(!!name);
                    
                    var nodeSerializer = GoNorth.DefaultNodeShapes.Serialize.getNodeSerializerInstance();
                    var self = this;
                    this.scriptName(name);
                    setTimeout(function() { // Timeout needed to prevent errors with styles because dialog is still opening
                        nodeSerializer.deserializeGraph(self.nodeGraph(), nodes, function(newNode) { self.setupNewNode(newNode); });
                        self.originalScriptNodes = nodeSerializer.serializeGraph(self.nodeGraph());
                        self.resetDependsOnObject(self.originalScriptNodes);
                    }, 150);

                    this.originalScriptName = name;

                    this.showConfirmCloseDialog(false);
                    this.confirmedClose = false;
                    
                    GoNorth.Util.setupValidation("#gn-nodeScriptEditorForm" + this.dialogId);

                    this.editDeferred = new jQuery.Deferred();
                    return this.editDeferred.promise();
                },

                /**
                 * Saves the nodes
                 */
                saveNodes: function() {
                    if(!jQuery("#gn-nodeScriptEditorForm" + this.dialogId).valid())
                    {
                        return;
                    }

                    this.confirmedClose = true;
                    this.isVisible(false);
                    if(this.editDeferred != null)
                    {
                        var nodeSerializer = GoNorth.DefaultNodeShapes.Serialize.getNodeSerializerInstance();
                        var serializedGraph = nodeSerializer.serializeGraph(this.nodeGraph());
                        this.editDeferred.resolve({
                            name: this.scriptName(),
                            graph: serializedGraph
                        });
                    }
                },

                /**
                 * Cancels the dialog
                 */
                cancelDialog: function() {
                    this.isVisible(false);
                    if(this.editDeferred != null)
                    {
                        this.editDeferred.reject();
                    }
                },

                /**
                 * Callback gets called before the dialog gets closed
                 * @returns {boolean} true if the dialog should be closed, else false
                 */
                onClosingDialog: function() {
                    if(this.confirmedClose)
                    {
                        return true;
                    }

                    if(!this.nodeGraph())
                    {
                        return true;
                    }
                    
                    var nodeSerializer = GoNorth.DefaultNodeShapes.Serialize.getNodeSerializerInstance();
                    var serializedGraph = nodeSerializer.serializeGraph(this.nodeGraph());
                    this.resetDependsOnObject(serializedGraph);
                    if(JSON.stringify(this.originalScriptNodes) != JSON.stringify(serializedGraph) || this.originalScriptName != this.scriptName())
                    {
                        this.showConfirmCloseDialog(true);
                        return false;
                    }
                    else
                    {
                        this.showConfirmCloseDialog(false);
                        return true;
                    }
                },

                /**
                 * Confirms the close dialog
                 */
                confirmCloseDialog: function() {
                    this.confirmedClose = true;

                    this.showConfirmCloseDialog(false);
                    this.isVisible(false);
                },

                
                /**
                 * Cancels the close dialog
                 */
                cancelCloseDialog: function() {
                    this.showConfirmCloseDialog(false);
                },

                
                /**
                 * Resets the depends objects
                 * @param {object} serializedNodeGraph Serialized node graph
                 */
                resetDependsOnObject: function(serializedNodeGraph) {
                    if(serializedNodeGraph.action) {
                        for(var curAction = 0; curAction < serializedNodeGraph.action.length; ++curAction) {
                            serializedNodeGraph.action[curAction].actionRelatedToObjectId = "";
                            serializedNodeGraph.action[curAction].actionRelatedToObjectType = "";
                        }
                    }

                    if(serializedNodeGraph.condition) {
                        for(var curCondition = 0; curCondition < serializedNodeGraph.condition.length; ++curCondition) {
                            if(!serializedNodeGraph.condition[curCondition].conditions) {
                                continue;
                            }

                            for(var curConditionPart = 0; curConditionPart < serializedNodeGraph.condition[curCondition].conditions.length; ++curConditionPart)
                            {
                                serializedNodeGraph.condition[curCondition].conditions[curConditionPart].dependsOnObjects = [];
                            }
                        }
                    }
                }
            });

    }(GoNorth.ScriptDialog = GoNorth.ScriptDialog || {}));
}(window.GoNorth = window.GoNorth || {}));