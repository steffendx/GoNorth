(function(GoNorth) {
    "use strict";
    (function(Evne) {
        (function(Skill) {

            /**
             * Skill View Model
             * @class
             */
            Skill.ViewModel = function()
            {
                GoNorth.DefaultNodeShapes.BaseViewModel.apply(this);
                GoNorth.FlexFieldDatabase.ObjectForm.BaseViewModel.apply(this, [ "/Evne", "EvneApi", "Skill", "EvneSkill", "EvneTemplate", "GetPagesBySkill?skillId=", null ]);

                this.isSkillFlowExpanded = new ko.observable(false);
                this.loadedGraph = null;

                this.learnedByNpcs = new ko.observableArray();
                this.loadingLearnedByNpcs = new ko.observable(false);
                this.errorLoadingLearnedByNpcs = new ko.observable(false);

                this.init();

                // Add access to object id for actions and conditions
                var self = this;
                Evne.getCurrentSkillId = function() {
                    return self.id();
                };
            };

            Skill.ViewModel.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.BaseViewModel.prototype);
            Skill.ViewModel.prototype = jQuery.extend(Skill.ViewModel.prototype, GoNorth.FlexFieldDatabase.ObjectForm.BaseViewModel.prototype);

            /**
             * Toogles the skill flow visibility
             */
            Skill.ViewModel.prototype.toogleSkillFlowVisibility = function() {
                this.isSkillFlowExpanded(!this.isSkillFlowExpanded());

                if(this.isSkillFlowExpanded() && this.loadedGraph)
                {
                    this.parseGraph(this.loadedGraph);
                    this.loadedGraph = null;
                }
            };

            /**
             * Parses additional data from a loaded object
             * 
             * @param {object} data Data returned from the webservice
             */
            Skill.ViewModel.prototype.parseAdditionalData = function(data) {
                // Graph can not be expanded if its hidden or else JointJS will throw an error
                if(this.isSkillFlowExpanded())
                {
                    this.parseGraph(data);
                }
                else
                {
                    this.loadedGraph = data;
                }
            };

            /**
             * Parses the graph from loaded data
             * 
             * @param {object} data Data returned from the webservice
             */
            Skill.ViewModel.prototype.parseGraph = function(data) {
                var self = this;
                GoNorth.DefaultNodeShapes.Serialize.getNodeSerializerInstance().deserializeGraph(this.nodeGraph(), data, function(newNode) { self.setupNewNode(newNode); });
            
                if(this.isReadonly())
                {
                    this.setGraphToReadonly();
                }
            };

            /**
             * Sets Additional save data
             * 
             * @param {object} data Save data
             * @returns {object} Save data with additional values
             */
            Skill.ViewModel.prototype.setAdditionalSaveData = function(data) {
                var nodeSerializer = GoNorth.DefaultNodeShapes.Serialize.getNodeSerializerInstance();
                var serializedGraph = nodeSerializer.serializeGraph(this.nodeGraph());
                if(this.loadedGraph)
                {
                    serializedGraph = {};
                    for(var curGraphProperty in this.loadedGraph)
                    {
                        if(nodeSerializer.hasDeserializerForArray(curGraphProperty))
                        {
                            serializedGraph[curGraphProperty] = this.loadedGraph[curGraphProperty];
                        }
                    }
                }

                for(var curNodeArray in serializedGraph)
                {
                    if(serializedGraph.hasOwnProperty(curNodeArray))
                    {
                        data[curNodeArray] = serializedGraph[curNodeArray];
                    }
                }

                return data;
            };
            
            /**
             * Runs logic after save
             * 
             * @param {object} data Returned data after save
             */
            Skill.ViewModel.prototype.runAfterSave = function(data) {
                this.reloadFieldsForNodes(GoNorth.DefaultNodeShapes.Shapes.ObjectResourceSkill, this.id());
                
                GoNorth.BindingHandlers.nodeGraphRefreshPositionZoomUrl();
            };

            /**
             * Loads additional dependencies
             */
            Skill.ViewModel.prototype.loadAdditionalDependencies = function() {
                if(GoNorth.FlexFieldDatabase.ObjectForm.hasKortistoRights && !this.isTemplateMode())
                {
                    this.loadNpcsByLearnedSkill();
                }
            };

            /**
             * Opens the compare dialog for the current object
             * 
             * @returns {jQuery.Deferred} Deferred which gets resolved after the object is marked as implemented
             */
            Skill.ViewModel.prototype.openCompareDialogForObject = function() {
                return this.compareDialog.openSkillCompare(this.id(), this.objectName());
            };

            /**
             * Sets additional data to readonly
             */
            Skill.ViewModel.prototype.setAdditionalDataToReadonly = function() {
                this.setGraphToReadonly();
            };

            /**
             * Loads the npcs which have learned the skill
             */
            Skill.ViewModel.prototype.loadNpcsByLearnedSkill = function() {
                this.loadingLearnedByNpcs(true);
                this.errorLoadingLearnedByNpcs(false);
                var self = this;
                jQuery.ajax({ 
                    url: "/api/KortistoApi/GetNpcsByLearnedSkill?skillId=" + this.id(), 
                    type: "GET"
                }).done(function(data) {
                    self.learnedByNpcs(data);
                    self.loadingLearnedByNpcs(false);
                }).fail(function(xhr) {
                    self.errorLoadingLearnedByNpcs(true);
                    self.loadingLearnedByNpcs(false);
                });
            };

            /**
             * Builds the url for a Kortisto Npc
             * 
             * @param {object} npc Npc to open
             * @returns {string} Url for the npc
             */
            Skill.ViewModel.prototype.buildNpcSkillUrl = function(npc) {
                return "/Kortisto/Npc?id=" + npc.id;
            };

        }(Evne.Skill = Evne.Skill || {}));
    }(GoNorth.Evne = GoNorth.Evne || {}));
}(window.GoNorth = window.GoNorth || {}));