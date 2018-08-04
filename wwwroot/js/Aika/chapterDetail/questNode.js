(function(GoNorth) {
    "use strict";
    (function(Aika) {
        (function(ChapterDetail) {

            /// Quest Type
            var questType = "aika.Quest";

            /// Quest Target Array
            var questTargetArray = "quest";

            joint.shapes.aika = joint.shapes.aika || {};

            /**
             * Creates the quest shape
             * @returns {object} Quest shape
             * @memberof ChapterDetail
             */
            function createQuestShape() {
                var model = joint.shapes.devs.Model.extend(
                {
                    defaults: joint.util.deepSupplement
                    (
                        {
                            type: questType,
                            icon: "glyphicon-king",
                            size: { width: Aika.Shared.finishNodeOutportNodeWidth, height: Aika.Shared.finishNodeOutportNodeMinHeight },
                            inPorts: ['input'],
                            outPorts: [],
                            attrs:
                            {
                                '.inPorts circle': { "magnet": "passive", "port-type": "input" },
                                '.outPorts circle': { "magnet": "true" } 
                            },
                            questId: ""
                        },
                        joint.shapes.default.Base.prototype.defaults
                    )
                });
                return model;
            }

            /**
             * Creates a quest view
             * @returns {object} Quest view
             * @memberof ChapterDetail
             */
            function createQuestView() {
                return joint.shapes.default.BaseView.extend(
                {
                    /**
                     * Template
                     */
                    template:
                    [
                        '<div class="node">',
                            '<span class="label"><i class="nodeIcon glyphicon"></i><span class="labelText"></span></span>',
                            '<span class="gn-nodeLoading" style="display: none"><i class="glyphicon glyphicon-refresh spinning"></i></span>',
                            '<span class="gn-nodeError text-danger" style="display: none" title="' + GoNorth.DefaultNodeShapes.Localization.ErrorOccured + '"><i class="glyphicon glyphicon-warning-sign"></i></span>',
                            '<button class="delete gn-nodeDeleteOnReadonly cornerButton" title="' + GoNorth.DefaultNodeShapes.Localization.DeleteNode + '">x</button>',
                            '<a class="gn-clickable gn-aikaNodeQuestName"></div>',
                        '</div>',
                    ].join(''),

                    /**
                     * Initializes the shape
                     */
                    initialize: function() {
                        joint.shapes.default.BaseView.prototype.initialize.apply(this, arguments);

                        if(this.model.get("questId"))
                        {
                            this.loadQuestData();
                            var self = this;
                            this.$box.find(".gn-aikaNodeQuestName").click(function() {
                                var questWindow = window.open("/Aika/Quest?id=" + self.model.get("questId"));
                                questWindow.onQuestSaved = function() {
                                    self.loadQuestData();
                                };
                            });
                        }
                        else
                        {
                            this.showError();
                        }
                    },

                    /**
                     * Loads the quest data
                     */
                    loadQuestData: function() {
                        // Load finish nodes
                        var self = this;
                        this.showLoading();
                        this.hideError();
                        jQuery.ajax({ 
                            url: "/api/AikaApi/GetQuest?id=" + self.model.get("questId"), 
                            type: "GET"
                        }).done(function(data) {
                            self.hideLoading();
                            if(!data)
                            {
                                self.showError();
                                return;
                            }

                            self.$box.find(".gn-aikaNodeQuestName").text(data.name);
                            if(data.isMainQuest)
                            {
                                self.$box.find(".gn-aikaNodeQuestName").prepend("<i class='glyphicon glyphicon-star gn-aikaNodeQuestMain' title='" + Aika.Localization.QuestNode.IsMainQuestTooltip + "'></i>")
                            }
                            Aika.Shared.addFinishNodesAsOutports(self, data.finish);
                        }).fail(function(xhr) {
                            self.hideLoading();
                            self.showError();
                        });
                    },


                    /**
                     * Shows the loading indicator
                     */
                    showLoading: function() {
                        this.$box.find(".gn-nodeLoading").show();
                    },

                    /**
                     * Hides the loading indicator
                     */
                    hideLoading: function() {
                        this.$box.find(".gn-nodeLoading").hide();
                    },


                    /**
                     * Shows the error indicator
                     */
                    showError: function() {
                        this.$box.find(".gn-nodeError").show();
                    },

                    /**
                     * Hides the error indicator
                     */
                    hideError: function() {
                        this.$box.find(".gn-nodeError").hide();
                    }
                });
            }

            /**
             * Quest Shape
             */
            joint.shapes.aika.Quest = createQuestShape();

            /**
             * Quest View
             */
            joint.shapes.aika.QuestView = createQuestView();


            /** 
             * Quest Serializer 
             * 
             * @class
             */
            ChapterDetail.QuestSerializer = function()
            {
                GoNorth.DefaultNodeShapes.Serialize.BaseNodeSerializer.apply(this, [joint.shapes.aika.Quest, questType, questTargetArray ]);
            };

            ChapterDetail.QuestSerializer.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.Serialize.BaseNodeSerializer.prototype)

            /**
             * Serializes a node
             * 
             * @param {object} node Node Object
             * @returns {object} Serialized NOde
             */
            ChapterDetail.QuestSerializer.prototype.serialize = function(node) {
                var serializedData = {
                    id: node.id,
                    x: node.position.x,
                    y: node.position.y,
                    questId: node.questId,
                };

                return serializedData;
            };

            /**
             * Deserializes a serialized node
             * 
             * @param {object} node Serialized Node Object
             * @returns {object} Deserialized Node
             */
            ChapterDetail.QuestSerializer.prototype.deserialize = function(node) {
                var initOptions = {
                    id: node.id,
                    position: { x: node.x, y: node.y },
                    questId: node.questId,
                };

                var node = new this.classType(initOptions);
                return node;
            };

            // Register Serializers
            var questSerializer = new ChapterDetail.QuestSerializer();
            GoNorth.DefaultNodeShapes.Serialize.getNodeSerializerInstance().addNodeSerializer(questSerializer);

        }(Aika.ChapterDetail = Aika.ChapterDetail || {}));
    }(GoNorth.Aika = GoNorth.Aika || {}));
}(window.GoNorth = window.GoNorth || {}));