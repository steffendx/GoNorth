(function(GoNorth) {
    "use strict";
    (function(Aika) {
        (function(ChapterOverview) {

            /// Chapter Type
            var chapterType = "aika.Chapter";

            /// Chapter Target Array
            var chapterTargetArray = "chapter";

            joint.shapes.aika = joint.shapes.aika || {};

            /**
             * Creates the chapter shape
             * @returns {object} Chapter shape
             * @memberof ChapterOverview
             */
            function createChapterShape() {
                var model = joint.shapes.devs.Model.extend(
                {
                    defaults: joint.util.deepSupplement
                    (
                        {
                            type: chapterType,
                            icon: "glyphicon-king",
                            size: { width: Aika.Shared.finishNodeOutportNodeWidth, height: Aika.Shared.finishNodeOutportNodeMinHeight },
                            inPorts: ['input'],
                            outPorts: [],
                            attrs:
                            {
                                '.inPorts circle': { "magnet": "passive", "port-type": "input" },
                                '.outPorts circle': { "magnet": "true" } 
                            },
                            detailViewId: "",
                            chapterName: "",
                            chapterNumber: 1
                        },
                        joint.shapes.default.Base.prototype.defaults
                    )
                });
                return model;
            }

            /**
             * Creates a chapter view
             * @returns {object} Chapter view
             * @memberof ChapterOverview
             */
            function createChapterView()
            {
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
                            '<input type="text" class="gn-aikaChapterName" placeholder="' + Aika.Localization.Chapter.ChapterName + '"/>',
                            '<input type="text" class="gn-aikaChapterNumber" placeholder="' + Aika.Localization.Chapter.ChapterNumber + '"/>',
                        '</div>',
                    ].join(''),

                    /**
                     * Initializes the shape
                     */
                    initialize: function() {
                        joint.shapes.default.BaseView.prototype.initialize.apply(this, arguments);

                        var self = this;

                        var chapterName = this.$box.find(".gn-aikaChapterName");
                        chapterName.on("change", function() {
                            self.model.set("chapterName", chapterName.val());
                        });
                        chapterName.val(this.model.get("chapterName"));

                        var chapterNumber = this.$box.find(".gn-aikaChapterNumber");
                        chapterNumber.on("change", function() {
                            var number = parseInt(chapterNumber.val());
                            if(isNaN(number))
                            {
                                number = 1;
                                chapterNumber.val(number);
                            }
                            self.model.set("chapterNumber", number);
                        });
                        chapterNumber.on("keydown", function(e) {
                            GoNorth.Util.validateNumberKeyPress(chapterNumber, e);
                        });
                        chapterNumber.val(this.model.get("chapterNumber"));

                        this.model.on('change:detailViewId', function() { Aika.Shared.initDetailView(self, self.model.get("detailViewId")) }, this);
                        if(this.model.get("detailViewId"))
                        {
                            Aika.Shared.initDetailView(this, this.model.get("detailViewId"));
                        }
                    },

                    /**
                     * Checks if a node can be deleted
                     * 
                     * @returns {jQuery.Deferred} Deferred for the validation process
                     */
                    validateDelete: function() {
                        return Aika.Shared.validateChapterDetailDelete(this.model.get("detailViewId"));
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
             * Chapter Shape
             */
            joint.shapes.aika.Chapter = createChapterShape();

            /**
             * Chapter View
             */
            joint.shapes.aika.ChapterView = createChapterView();


            /** 
             * Chapter Serializer 
             * 
             * @class
             */
            ChapterOverview.ChapterSerializer = function()
            {
                GoNorth.DefaultNodeShapes.Serialize.BaseNodeSerializer.apply(this, [joint.shapes.aika.Chapter, chapterType, chapterTargetArray ]);
            };

            ChapterOverview.ChapterSerializer.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.Serialize.BaseNodeSerializer.prototype)

            /**
             * Serializes a node
             * 
             * @param {object} node Node Object
             * @returns {object} Serialized NOde
             */
            ChapterOverview.ChapterSerializer.prototype.serialize = function(node) 
            {
                var serializedData = {
                    id: node.id,
                    x: node.position.x,
                    y: node.position.y,
                    detailViewId: node.detailViewId,
                    name: node.chapterName,
                    chapterNumber: node.chapterNumber
                };

                return serializedData;
            };

            /**
             * Deserializes a serialized node
             * 
             * @param {object} node Serialized Node Object
             * @returns {object} Deserialized Node
             */
            ChapterOverview.ChapterSerializer.prototype.deserialize = function(node) 
            {
                var initOptions = {
                    id: node.id,
                    position: { x: node.x, y: node.y },
                    detailViewId: node.detailViewId,
                    chapterName: node.name,
                    chapterNumber: node.chapterNumber
                };

                var node = new this.classType(initOptions);
                return node;
            };

            // Register Serializers
            var chapterSerializer = new ChapterOverview.ChapterSerializer();
            GoNorth.DefaultNodeShapes.Serialize.getNodeSerializerInstance().addNodeSerializer(chapterSerializer);

        }(Aika.ChapterOverview = Aika.ChapterOverview || {}));
    }(GoNorth.Aika = GoNorth.Aika || {}));
}(window.GoNorth = window.GoNorth || {}));