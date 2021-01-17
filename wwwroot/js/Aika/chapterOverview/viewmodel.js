(function(GoNorth) {
    "use strict";
    (function(Aika) {
        (function(ChapterOverview) {

            /**
             * Chapter Overview View Model
             * @class
             */
            ChapterOverview.ViewModel = function()
            {
                GoNorth.DefaultNodeShapes.BaseViewModel.apply(this);

                this.id = new ko.observable("");

                this.isLoading = new ko.observable(false);
                this.isReadonly = new ko.observable(false);
                this.lockedByUser = new ko.observable("");
            
                this.additionalErrorDetails = new ko.observable("");

                this.load();
            };

            ChapterOverview.ViewModel.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.BaseViewModel.prototype);

            /**
             * Saves the chapter overview
             */
            ChapterOverview.ViewModel.prototype.save = function() {
                if(!this.nodeGraph())
                {
                    return;
                }

                var serializedGraph = GoNorth.DefaultNodeShapes.Serialize.getNodeSerializerInstance().serializeGraph(this.nodeGraph());

                this.isLoading(true);
                this.errorOccured(false);
                var self = this;
                GoNorth.HttpClient.post("/api/AikaApi/SaveChapterOverview", serializedGraph).done(function(data) {
                    Aika.Shared.setDetailViewIds(self.nodeGraph(), data.chapter);

                    if(!self.id())
                    {
                        self.id(data.id);
                        self.acquireLock();
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
            ChapterOverview.ViewModel.prototype.load = function() {
                this.isLoading(true);
                this.errorOccured(false);
                var self = this;
                GoNorth.HttpClient.get("/api/AikaApi/GetChapterOverview").done(function(data) {
                    self.isLoading(false);

                    // Only deserialize data if a chapter overview already exists, will be null before someone saves it
                    if(data)
                    {
                        self.id(data.id);
                        self.acquireLock();

                        GoNorth.DefaultNodeShapes.Serialize.getNodeSerializerInstance().deserializeGraph(self.nodeGraph(), data, function(newNode) { self.setupNewNode(newNode); });

                        if(self.isReadonly())
                        {
                            self.setGraphToReadonly();
                        }
                    }
                }).fail(function(xhr) {
                    self.isLoading(false);
                    self.errorOccured(true);
                });
            };


            /**
             * Acquires a lock
             */
            ChapterOverview.ViewModel.prototype.acquireLock = function() {
                this.lockedByUser("");
                this.isReadonly(false);

                var self = this;
                GoNorth.LockService.acquireLock("ChapterOverview", this.id()).done(function(isLocked, lockedUsername) { 
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
            ChapterOverview.ViewModel.prototype.openQuestList = function() {
                window.location = "/Aika/QuestList";
            };

        }(Aika.ChapterOverview = Aika.ChapterOverview || {}));
    }(GoNorth.Aika = GoNorth.Aika || {}));
}(window.GoNorth = window.GoNorth || {}));