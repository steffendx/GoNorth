(function(GoNorth) {
    "use strict";
    (function(Aika) {
        (function(ChapterDetail) {

            /**
             * Chapter Detail View Model
             * @class
             */
            ChapterDetail.ViewModel = function()
            {
                GoNorth.DefaultNodeShapes.BaseViewModel.apply(this);

                this.id = new ko.observable("");
                var paramId = GoNorth.Util.getParameterFromUrl("id");
                if(paramId)
                {
                    this.id(paramId);
                }

                this.objectDialog = new GoNorth.ChooseObjectDialog.ViewModel();

                this.name = new ko.observable("");

                this.isLoading = new ko.observable(false);
                this.isReadonly = new ko.observable(false);
                this.lockedByUser = new ko.observable("");

                this.showWaitNewObjectDialog = new ko.observable(false);
            
                this.additionalErrorDetails = new ko.observable("");

                this.load();
                this.acquireLock();
            };

            ChapterDetail.ViewModel.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.BaseViewModel.prototype);

            /**
             * Adds a new node
             * 
             * @param {object} dropElement Element that was dropped
             * @param {float} x X-Drop Coordinate
             * @param {float} z X-Drop Coordinate
             */
            ChapterDetail.ViewModel.prototype.addNewNode = function(dropElement, x, y) {
                if(jQuery(dropElement).hasClass("gn-nodeNewQuest"))
                {
                    this.createNewQuestNode(x, y);
                    return;
                }
                else if(jQuery(dropElement).hasClass("gn-nodeExistingQuest"))
                {
                    this.createExistingQuestNode(x, y);
                    return;
                }
                else if(jQuery(dropElement).hasClass("gn-nodeExistingDetailView"))
                {
                    this.createExistingChapterDetailNode(x, y);
                    return;
                }

                GoNorth.DefaultNodeShapes.BaseViewModel.prototype.addNewNode.apply(this, arguments);
            };

            /**
             * Creates a quest node from a new quest
             * 
             * @param {float} x X-Drop Coordinate
             * @param {float} z X-Drop Coordinate
             */
            ChapterDetail.ViewModel.prototype.createNewQuestNode = function(x, y) {
                var self = this;
                this.showWaitNewObjectDialog(true);

                var questWindow = window.open("/Aika/Quest");
                questWindow.onbeforeunload = function() {
                    self.showWaitNewObjectDialog(false);
                };
                questWindow.onQuestSaved = function(questId) {
                    questWindow.onQuestSaved = null;
                    self.showWaitNewObjectDialog(false);
                    self.addNewQuestNode(questId, x, y);
                };
            };

            /**
             * Creates a quest node from an existing quest
             * 
             * @param {float} x X-Drop Coordinate
             * @param {float} z X-Drop Coordinate
             */
            ChapterDetail.ViewModel.prototype.createExistingQuestNode = function(x, y) {
                var self = this;
                this.objectDialog.openQuestSearch(Aika.Localization.ViewModel.ChooseQuest).then(function(quest) {
                    self.addNewQuestNode(quest.id, x, y);
                });
            };

            /**
             * Creates a quest node from a quest id
             * 
             * @param {string} questId Id of the quest
             * @param {float} x X-Drop Coordinate
             * @param {float} z X-Drop Coordinate
             */
            ChapterDetail.ViewModel.prototype.addNewQuestNode = function(questId, x, y) {
                var initOptions = this.calcNodeInitOptionsPosition(x, y);
                initOptions.questId = questId;
                this.addNodeByType("aika.Quest", initOptions);
            };

            /**
             * Creates a chapter detail node from an existing chapter detail
             * 
             * @param {float} x X-Drop Coordinate
             * @param {float} z X-Drop Coordinate
             */
            ChapterDetail.ViewModel.prototype.createExistingChapterDetailNode = function(x, y) {
                var self = this;
                this.objectDialog.openChapterDetailSearch(Aika.Localization.ViewModel.ChooseChapterDetail, null, this.id).then(function(detail) {
                    var initOptions = self.calcNodeInitOptionsPosition(x, y);
                    initOptions.detailViewId = detail.id;
                    self.addNodeByType("aika.ChapterDetail", initOptions);
                });
            };


            /**
             * Saves the chapter detail
             */
            ChapterDetail.ViewModel.prototype.save = function() {
                if(!this.nodeGraph())
                {
                    return;
                }

                var serializedGraph = GoNorth.DefaultNodeShapes.Serialize.getNodeSerializerInstance().serializeGraph(this.nodeGraph());

                this.isLoading(true);
                this.errorOccured(false);
                var self = this;
                jQuery.ajax({ 
                    url: "/api/AikaApi/UpdateChapterDetail?id=" + this.id(), 
                    headers: GoNorth.Util.generateAntiForgeryHeader(),
                    data: JSON.stringify(serializedGraph), 
                    type: "POST",
                    contentType: "application/json"
                }).done(function(data) {
                    Aika.Shared.setDetailViewIds(self.nodeGraph(), data.detail);

                    if(!self.id())
                    {
                        self.id(data.id);
                        self.acquireLock();
                    }

                    if(window.refreshChapterNode)
                    {
                        window.refreshChapterNode();
                    }

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
            ChapterDetail.ViewModel.prototype.load = function() {
                this.isLoading(true);
                this.errorOccured(false);
                var self = this;
                jQuery.ajax({ 
                    url: "/api/AikaApi/GetChapterDetail?id=" + this.id(), 
                    type: "GET"
                }).done(function(data) {
                    self.isLoading(false);
                    self.name(data.name);

                    GoNorth.DefaultNodeShapes.Serialize.getNodeSerializerInstance().deserializeGraph(self.nodeGraph(), data, function(newNode) { self.setupNewNode(newNode); });

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
             * Acquires a lock
             */
            ChapterDetail.ViewModel.prototype.acquireLock = function() {
                if(!this.id())
                {
                    return;
                }

                this.lockedByUser("");
                this.isReadonly(false);

                var self = this;
                GoNorth.LockService.acquireLock("ChapterDetail", this.id()).done(function(isLocked, lockedUsername) { 
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
             * Opens the quest list
             */
            ChapterDetail.ViewModel.prototype.openQuestList = function() {
                window.location = "/Aika/QuestList";
            };

        }(Aika.ChapterDetail = Aika.ChapterDetail || {}));
    }(GoNorth.Aika = GoNorth.Aika || {}));
}(window.GoNorth = window.GoNorth || {}));