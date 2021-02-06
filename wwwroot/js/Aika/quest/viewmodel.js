(function(GoNorth) {
    "use strict";
    (function(Aika) {
        (function(Quest) {

            /// X-Coordinate of the start node on create
            var startNodeX = 20;

            /// Y-Coordinate of the start node on create
            var startNodeY = 350;

            /**
             * Quest View Model
             * @class
             */
            Quest.ViewModel = function()
            {
                GoNorth.DefaultNodeShapes.BaseViewModel.apply(this);
                GoNorth.FlexFieldDatabase.ObjectForm.FlexFieldHandlingViewModel.apply(this);

                this.id = new ko.observable("");
                var paramId = GoNorth.Util.getParameterFromUrl("id");
                if(paramId)
                {
                    this.id(paramId);
                }

                this.name = new ko.observable("");
                this.description = new ko.observable("");
                this.isMainQuest = new ko.observable(false);

                this.isHeaderExpanded = new ko.observable(false);

                this.areFieldsExpanded = new ko.observable(false);

                this.areConnectionsExpanded = new ko.observable(false);

                this.mentionedInAikaDetails = new ko.observableArray();
                this.loadingMentionedInAikaDetails = new ko.observable(false);
                this.errorLoadingMentionedInAikaDetails = new ko.observable(false);

                this.usedInAikaQuests = new ko.observableArray();
                this.loadingUsedInAikaQuests = new ko.observable(false);
                this.errorLoadingUsedInAikaQuests = new ko.observable(false);

                this.mentionedInKirjaPages = new ko.observableArray();
                this.loadingMentionedInKirjaPages = new ko.observable(false);
                this.errorLoadingMentionedInKirjaPages = new ko.observable(false);

                this.referencedInTaleDialogs = new ko.observableArray();
                this.loadingReferencedInTaleDialogs = new ko.observable(false);
                this.errorLoadingReferencedInTaleDialogs = new ko.observable(false);

                this.hasMarkersInKartaMaps = new ko.observableArray();
                this.loadingHasMarkersInKartaMaps = new ko.observable(false);
                this.errorLoadingHasMarkersInKartaMaps = new ko.observable(false);

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
                
                this.showDeleteDialog = new ko.observable(false);

                this.questStatistics = new ko.observable(null);
                this.questStatisticsDescriptionWordCount = new ko.observable(0);
                this.questStatisticsWordCountExpanded = new ko.observable(false);
                this.questStatisticsNodeCountExpanded = new ko.observable(false);
                this.showStatisticsDialog = new ko.observable(false);

                this.isLoading = new ko.observable(false);
                this.isReadonly = new ko.observable(false);
                this.lockedByUser = new ko.observable("");

                this.conditionDialog = new GoNorth.DefaultNodeShapes.Conditions.ConditionDialog();
            
                this.chooseObjectDialog = new GoNorth.ChooseObjectDialog.ViewModel();

                this.isImplemented = new ko.observable(false);
                this.compareDialog = new GoNorth.ImplementationStatus.CompareDialog.ViewModel();

                this.additionalErrorDetails = new ko.observable("");
                this.questNotFound = new ko.observable(false);
                
                this.extendedReferenceCallout = new ko.observable(null);
                
                if(this.id())
                {
                    this.load();

                    this.loadAikaDetails();
                    this.loadAikaQuests();
                    if(GoNorth.Aika.Quest.hasKirjaRights)
                    {
                        this.loadKirjaPages();
                    }

                    if(GoNorth.Aika.Quest.hasTaleRights)
                    {
                        this.loadTaleDialogs();
                    }

                    if(GoNorth.Aika.Quest.hasKartaRights)
                    {
                        this.loadKartaMaps();
                    }

                    if(GoNorth.Aika.Quest.hasEvneRights)
                    {
                        this.loadUsedInEvneSkills();
                    }

                    if(GoNorth.Aika.Quest.hasKortistoRights)
                    {
                        this.loadUsedInDailyRoutines();
                        this.loadUsedInStateMachines();
                    }

                    if(GoNorth.Aika.Quest.hasExportObjectsRights)
                    {
                        this.loadUsedInExportSnippets();
                    }

                    this.acquireLock();
                }
                else
                {
                    this.isHeaderExpanded(true);
                    var self = this;
                    var subscription = this.nodePaper.subscribe(function(paperValue) {
                        if(paperValue)
                        {
                            subscription.dispose();
                            self.addStartNode();
                        }
                    });
                }

                GoNorth.Util.setupValidation("#gn-questHeader");

                // Add access to object id for actions and conditions
                var self = this;
                Aika.getCurrentQuestId = function() {
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

                    return self.chooseObjectDialog.openGeneralObjectSearch(Aika.Localization.QuestViewModel.ChooseGeneralObject);                    
                };
                
                // Opens the quest search dialog 
                GoNorth.DefaultNodeShapes.openQuestSearchDialog = function() {
                    if(self.isReadonly())
                    {
                        var readonlyDeferred = new jQuery.Deferred();
                        readonlyDeferred.reject();
                        return readonlyDeferred.promise();
                    }

                    return self.chooseObjectDialog.openQuestSearch(Aika.Localization.QuestViewModel.ChooseQuest);                    
                };
                
                // Opens the npc search dialog 
                GoNorth.DefaultNodeShapes.openNpcSearchDialog = function() {
                    if(self.isReadonly())
                    {
                        var readonlyDeferred = new jQuery.Deferred();
                        readonlyDeferred.reject();
                        return readonlyDeferred.promise();
                    }

                    return self.chooseObjectDialog.openNpcSearch(Aika.Localization.QuestViewModel.ChooseNpc);                    
                };

                // Opens the item search dialog 
                GoNorth.DefaultNodeShapes.openItemSearchDialog = function() {
                    if(self.isReadonly())
                    {
                        var readonlyDeferred = new jQuery.Deferred();
                        readonlyDeferred.reject();
                        return readonlyDeferred.promise();
                    }

                    return self.chooseObjectDialog.openItemSearch(Aika.Localization.QuestViewModel.ChooseItem);                    
                };
                
                // Opens the skill search dialog 
                GoNorth.DefaultNodeShapes.openSkillSearchDialog = function() {
                    if(self.isReadonly())
                    {
                        var readonlyDeferred = new jQuery.Deferred();
                        readonlyDeferred.reject();
                        return readonlyDeferred.promise();
                    }

                    return self.chooseObjectDialog.openSkillSearch(Aika.Localization.QuestViewModel.ChooseSkill);                    
                };

                // Opens the daily routine event dialog
                GoNorth.DefaultNodeShapes.openDailyRoutineEventSearchDialog = function() {
                    if(self.isReadonly())
                    {
                        var readonlyDeferred = new jQuery.Deferred();
                        readonlyDeferred.reject();
                        return readonlyDeferred.promise();
                    }

                    return self.chooseObjectDialog.openDailyRoutineSearch(Aika.Localization.QuestViewModel.ChooseDailyRoutineEvent);                    
                };

                // Opens the marker search dialog
                GoNorth.DefaultNodeShapes.openMarkerSearchDialog = function() {
                    if(self.isReadonly())
                    {
                        var readonlyDeferred = new jQuery.Deferred();
                        readonlyDeferred.reject();
                        return readonlyDeferred.promise();
                    }

                    return self.chooseObjectDialog.openMarkerSearch(Aika.Localization.QuestViewModel.ChooseMarker);                    
                };

                // Load config lists
                GoNorth.DefaultNodeShapes.Shapes.loadConfigLists().fail(function() {
                    self.errorOccured(true);
                });
            };

            Quest.ViewModel.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.BaseViewModel.prototype);
            Quest.ViewModel.prototype = jQuery.extend(Quest.ViewModel.prototype, GoNorth.FlexFieldDatabase.ObjectForm.FlexFieldHandlingViewModel.prototype);

            /**
             * Adds a start node
             */
            Quest.ViewModel.prototype.addStartNode = function() {
                var initOptions = this.calcNodeInitOptionsPosition(startNodeX, startNodeY);
                this.addNodeByType(Aika.Shared.startType, initOptions);
            };

            /**
             * Toogles the header visibility
             */
            Quest.ViewModel.prototype.toogleHeaderVisibility = function() {
                this.isHeaderExpanded(!this.isHeaderExpanded());
            };


            /**
             * Toogles the field visibility
             */
            Quest.ViewModel.prototype.toogleFieldVisibility = function() {
                this.areFieldsExpanded(!this.areFieldsExpanded());
            };

            /**
             * Function gets called after a new field was added. Expands the field area
             */
            Quest.ViewModel.prototype.onFieldAdded = function() {
                this.areFieldsExpanded(true);
            };


            /**
             * Toogles the connections visibility
             */
            Quest.ViewModel.prototype.toogleConnectionsVisibility = function() {
                this.areConnectionsExpanded(!this.areConnectionsExpanded());
            };

            /**
             * Loads the aika details
             */
            Quest.ViewModel.prototype.loadAikaDetails = function() {
                this.loadingMentionedInAikaDetails(true);
                this.errorLoadingMentionedInAikaDetails(false);
                var self = this;
                GoNorth.HttpClient.get("/api/AikaApi/GetChapterDetailsByQuest?questId=" + this.id()).done(function(data) {
                    self.mentionedInAikaDetails(data);
                    self.loadingMentionedInAikaDetails(false);
                }).fail(function(xhr) {
                    self.errorLoadingMentionedInAikaDetails(true);
                    self.loadingMentionedInAikaDetails(false);
                });
            };

            /**
             * Builds a link to a Aika detail view
             * 
             * @param {object} detail Detail view to to build the url for
             * @returns {string} Url to the detail view
             */
            Quest.ViewModel.prototype.buildAikaDetailUrl = function(detail) {
                return "/Aika/Detail?id=" + detail.id;
            };

            
            /**
             * Loads the Aika quests
             */
            Quest.ViewModel.prototype.loadAikaQuests = function() {
                this.loadingUsedInAikaQuests(true);
                this.errorLoadingUsedInAikaQuests(false);
                var self = this;
                GoNorth.HttpClient.get("/api/AikaApi/GetQuestsObjectIsReferenced?objectId=" + this.id()).done(function(data) {
                    var quests = [];
                    for(var curQuest = 0; curQuest < data.length; ++curQuest)
                    {
                        if(data[curQuest].id != self.id())
                        {
                            quests.push(data[curQuest]);
                        }
                    }

                    self.usedInAikaQuests(quests);
                    self.loadingUsedInAikaQuests(false);
                }).fail(function(xhr) {
                    self.errorLoadingUsedInAikaQuests(true);
                    self.loadingUsedInAikaQuests(false);
                });
            };

            /**
             * Builds the url to an Aika quest
             * 
             * @param {object} quest Quest to build the url for
             * @param {object} detailedReference Detailed reference to build the object reference for
             * @returns {string} Url to the quest
             */
            Quest.ViewModel.prototype.buildAikaQuestUrl = function(quest, detailedReference) {
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
             * Loads the Kirja pages
             */
            Quest.ViewModel.prototype.loadKirjaPages = function() {
                this.loadingMentionedInKirjaPages(true);
                this.errorLoadingMentionedInKirjaPages(false);
                var self = this;
                GoNorth.HttpClient.get("/api/KirjaApi/GetPagesByQuest?questId=" + this.id()).done(function(data) {
                    self.mentionedInKirjaPages(data);
                    self.loadingMentionedInKirjaPages(false);
                }).fail(function(xhr) {
                    self.errorLoadingMentionedInKirjaPages(true);
                    self.loadingMentionedInKirjaPages(false);
                });
            };

            /**
             * Builds a url to a Kirja page
             * 
             * @param {object} page Page to build the url to
             * @returns {string} Url to the kirja page
             */
            Quest.ViewModel.prototype.buildKirjaPageUrl = function(page) {
                return "/Kirja?id=" + page.id;
            };


            /**
             * Loads the Tale dialogs
             */
            Quest.ViewModel.prototype.loadTaleDialogs = function() {
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
            Quest.ViewModel.prototype.buildTaleDialogUrl = function(dialogRef, detailedReference) {
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
             * Loads the Karta maps
             */
            Quest.ViewModel.prototype.loadKartaMaps = function() {
                this.loadingHasMarkersInKartaMaps(true);
                this.errorLoadingHasMarkersInKartaMaps(false);
                var self = this;
                GoNorth.HttpClient.get("/api/KartaApi/GetMapsByQuestId?questId=" + this.id()).done(function(data) {
                    self.hasMarkersInKartaMaps(data);
                    self.loadingHasMarkersInKartaMaps(false);
                }).fail(function(xhr) {
                    self.errorLoadingHasMarkersInKartaMaps(true);
                    self.loadingHasMarkersInKartaMaps(false);
                });
            };

            /**
             * Builds a url to a Karta map
             * 
             * @param {object} map Map to build the Url for
             * @returns {string} Url to the map 
             */
            Quest.ViewModel.prototype.buildKartaMapUrl = function(map) {
               return "/Karta?id=" + map.id + "&preSelectType=Quest&preSelectId=" + this.id();
            };


            /**
             * Loads the npcs in which the quest is used in the daily routines are used
             */
            Quest.ViewModel.prototype.loadUsedInDailyRoutines = function() {
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
            Quest.ViewModel.prototype.buildDailyRoutineNpcUrl = function(npc) {
                return "/Kortisto/Npc?id=" + npc.id;
            };

            
            /**
             * Loads the npcs in which the quest is used in state machines
             */
            Quest.ViewModel.prototype.loadUsedInStateMachines = function() {
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
            Quest.ViewModel.prototype.buildStateMachineUrl = function(stateMachine) {
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
             * Loads the skills in which the quest is used
             */
            Quest.ViewModel.prototype.loadUsedInEvneSkills = function() {
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
            Quest.ViewModel.prototype.buildEvneSkillUrl = function(npc) {
                return "/Evne/Skill?id=" + npc.id;
            };

            
            /**
             * Loads export snippets in which the object is used
             */
            Quest.ViewModel.prototype.loadUsedInExportSnippets = function() {
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
            Quest.ViewModel.prototype.buildUsedExportSnippetName = function(snippet) {
                var objectType = "";
                if(snippet.objectType == "npc")
                {
                    objectType = GoNorth.Aika.Quest.Localization.Npc;
                }
                else if(snippet.objectType == "item")
                {
                    objectType = GoNorth.Aika.Quest.Localization.Item;
                }
                else if(snippet.objectType == "skill")
                {
                    objectType = GoNorth.Aika.Quest.Localization.Skill;
                }
                
                return snippet.objectName + " (" + objectType + ")";
            };

            /**
             * Builds the url for a snippet
             * 
             * @param {object} snippet Snippet to build the url for
             * @returns {string} Url for the snippet
             */
            Quest.ViewModel.prototype.buildUsedExportSnippetUrl = function(snippet) {
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
            Quest.ViewModel.prototype.setExtendedReferenceCallout = function(refObj) {
                if(this.extendedReferenceCallout() == refObj)
                {
                    refObj = null;
                }
                this.extendedReferenceCallout(refObj);
            };


            /**
             * Saves the quest
             */
            Quest.ViewModel.prototype.save = function() {
                // Validate Data
                if(!this.nodeGraph())
                {
                    return;
                }

                if(!jQuery("#gn-questHeader").valid())
                {
                    return;
                }

                // Serialize quest
                var serializedQuest = GoNorth.DefaultNodeShapes.Serialize.getNodeSerializerInstance().serializeGraph(this.nodeGraph());
                serializedQuest.name = this.name();
                serializedQuest.description = this.description();
                serializedQuest.isMainQuest = this.isMainQuest();
                serializedQuest.fields = this.fieldManager.serializeFields();

                var url = "";
                if(this.id())
                {
                    url = "/api/AikaApi/UpdateQuest?id=" + this.id();
                }
                else
                {
                    url = "/api/AikaApi/CreateQuest";
                }

                this.isLoading(true);
                this.errorOccured(false);
                var self = this;
                GoNorth.HttpClient.post(url, serializedQuest).done(function(data) {
                    if(!self.id())
                    {
                        self.id(data.id);
                        self.acquireLock();

                        GoNorth.Util.replaceUrlParameters("id=" + data.id);
                        GoNorth.BindingHandlers.nodeGraphRefreshPositionZoomUrl();
                    }

                    self.isImplemented(data.isImplemented);

                    self.fieldManager.syncFieldIds(data);

                    self.reloadFieldsForNodes(GoNorth.DefaultNodeShapes.Shapes.ObjectResourceQuest, self.id());

                    self.callOnQuestSaved();
                    self.isLoading(false);
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
             * Loads the data
             */
            Quest.ViewModel.prototype.load = function() {
                this.isLoading(true);
                this.errorOccured(false);
                var self = this;
                GoNorth.HttpClient.get("/api/AikaApi/GetQuest?id=" + this.id()).done(function(data) {
                    self.isLoading(false);
                    if(!data)
                    {
                        self.errorOccured(true);
                        self.questNotFound(true);
                        return;
                    }

                    self.name(data.name);
                    self.description(data.description);
                    self.isMainQuest(data.isMainQuest);

                    self.isImplemented(data.isImplemented);

                    if(!data.fields)
                    {
                        data.fields = [];
                    }
                    self.fieldManager.deserializeFields(data.fields);

                    GoNorth.DefaultNodeShapes.Serialize.getNodeSerializerInstance().deserializeGraph(self.nodeGraph(), data, function(newNode) { self.setupNewNode(newNode); });
                    self.focusNodeFromUrl();

                    if(self.isReadonly())
                    {
                        self.setGraphToReadonly();
                    }
                }).fail(function(xhr) {
                    self.isLoading(false);
                    self.errorOccured(true);
                });
            };


            /**
             * Opens the statistics dialog
             */
            Quest.ViewModel.prototype.openStatisticsDialog = function() {
                var graph = this.nodeGraph();
                var paper = this.nodePaper();

                var statistics = GoNorth.DefaultNodeShapes.getNodeStatistics(graph, paper);

                this.questStatistics(statistics);
                this.questStatisticsDescriptionWordCount(GoNorth.Util.getWordCount(this.description()));
                this.questStatisticsWordCountExpanded(false);
                this.questStatisticsNodeCountExpanded(false);
                this.showStatisticsDialog(true);
            };

            /**
             * Toggles the visibility of the detailed word count statistics
             */
            Quest.ViewModel.prototype.toggleQuestStatisticsWordCount = function() {
                this.questStatisticsWordCountExpanded(!this.questStatisticsWordCountExpanded());
            }

            /**
             * Toggles the visibility of the detailed node count statistics
             */
            Quest.ViewModel.prototype.toggleQuestStatisticsNodeCount = function() {
                this.questStatisticsNodeCountExpanded(!this.questStatisticsNodeCountExpanded());
            }

            /**
             * Closes the statistics dialog
             */
            Quest.ViewModel.prototype.closeStatisticsDialog = function() {
                this.showStatisticsDialog(false);
            };


            /**
             * Acquires a lock
             */
            Quest.ViewModel.prototype.acquireLock = function() {
                this.lockedByUser("");
                this.isReadonly(false);

                var self = this;
                GoNorth.LockService.acquireLock("Quest", this.id()).done(function(isLocked, lockedUsername) { 
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


            /**
             * Opens the delete quest Dialog
             */
            Quest.ViewModel.prototype.openDeleteQuestDialog = function() {
                this.showDeleteDialog(true);
            };

            /**
             * Deletes the current open quest
             */
            Quest.ViewModel.prototype.deleteQuest = function() {
                if(!this.id())
                {
                    return;
                }

                this.isLoading(true);
                this.errorOccured(false);
                this.additionalErrorDetails("");
                var self = this;
                GoNorth.HttpClient.delete("/api/AikaApi/DeleteQuest?id=" + this.id()).done(function() {
                    self.callOnQuestSaved();
                    
                    // In case quest was not opened by script, user must be redirected to prevent error
                    if(window.opener != null)
                    {
                        window.close();
                    }
                    else
                    {
                        window.location = "/Aika/QuestList";
                    }
                }).fail(function(xhr) {
                    self.isLoading(false);
                    self.errorOccured(true);
                    self.closeDeleteQuestDialog();

                    // If object is related to anything that prevents deleting a bad request (400) will be returned
                    if(xhr.status == 400 && xhr.responseText)
                    {
                        self.additionalErrorDetails(xhr.responseText);
                    }
                });
            };

            /**
             * Closes the delete quest Dialog
             */
            Quest.ViewModel.prototype.closeDeleteQuestDialog = function() {
                this.showDeleteDialog(false);
            };


            /**
             * Opens the compare dialog
             */
            Quest.ViewModel.prototype.openCompareDialog = function() {
                var self = this;
                this.compareDialog.openQuestCompare(this.id(), this.name()).done(function() {
                    self.isImplemented(true);
                });
            };


            /**
             * Calls the on save callback if provided
             */
            Quest.ViewModel.prototype.callOnQuestSaved = function() {
                if(window.onQuestSaved)
                {
                    window.onQuestSaved(this.id());
                }
            };


            /**
             * Opens the quest list
             */
            Quest.ViewModel.prototype.openQuestList = function() {
                window.location = "/Aika/QuestList";
            };

        }(Aika.Quest = Aika.Quest || {}));
    }(GoNorth.Aika = GoNorth.Aika || {}));
}(window.GoNorth = window.GoNorth || {}));