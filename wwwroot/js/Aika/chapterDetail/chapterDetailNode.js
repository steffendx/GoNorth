(function(GoNorth) {
    "use strict";
    (function(Aika) {
        (function(ChapterDetail) {

            /// Chapter Detail Type
            var chapterDetailType = "aika.ChapterDetail";

            /// Chapter Detail Target Array
            var chapterDetailTargetArray = "detail";

            joint.shapes.aika = joint.shapes.aika || {};

            /**
             * Creates the chapter detail shape
             * @returns {object} Chapter Detail shape
             * @memberof ChapterDetail
             */
            function createChapterDetailShape() {
                var model = joint.shapes.devs.Model.extend(
                {
                    defaults: joint.util.deepSupplement
                    (
                        {
                            type: chapterDetailType,
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
                            detailName: ""
                        },
                        joint.shapes.default.Base.prototype.defaults
                    )
                });
                return model;
            }

            /**
             * Creates a chapter detail view
             * @returns {object} Chapter Detail view
             * @memberof ChapterDetail
             */
            function createChapterDetailView() {
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
                            '<input type="text" class="gn-aikaChapterDetailName" placeholder="' + Aika.Localization.ChapterDetail.DetailName + '"/>',
                        '</div>',
                    ].join(''),

                    /**
                     * Initializes the shape
                     */
                    initialize: function() {
                        joint.shapes.default.BaseView.prototype.initialize.apply(this, arguments);

                        var self = this;

                        var chapterDetailName = this.$box.find(".gn-aikaChapterDetailName");
                        chapterDetailName.on("change", function() {
                            self.model.set("detailName", chapterDetailName.val());
                        });
                        chapterDetailName.val(this.model.get("detailName"));

                        this.model.on('change:detailViewId', this.initChapterDetail, this);
                        if(this.model.get("detailViewId"))
                        {
                            this.initChapterDetail();
                        }
                    },

                    /**
                     * Initializes the chapter detail
                     */
                    initChapterDetail: function() {
                        var self = this;
                        Aika.Shared.initDetailView(this, this.model.get("detailViewId")).then(function(detail) {
                            self.model.set("detailName", detail.name);
                            self.$box.find(".gn-aikaChapterDetailName").val(detail.name);
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
             * Chapter Detail Shape
             */
            joint.shapes.aika.ChapterDetail = createChapterDetailShape();

            /**
             * Chapter Detail View
             */
            joint.shapes.aika.ChapterDetailView = createChapterDetailView();


            /** 
             * Chapter Detail Serializer 
             * 
             * @class
             */
            ChapterDetail.ChapterDetailSerializer = function()
            {
                GoNorth.DefaultNodeShapes.Serialize.BaseNodeSerializer.apply(this, [ joint.shapes.aika.ChapterDetail, chapterDetailType, chapterDetailTargetArray ]);
            };

            ChapterDetail.ChapterDetailSerializer.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.Serialize.BaseNodeSerializer.prototype)

            /**
             * Serializes a node
             * 
             * @param {object} node Node Object
             * @returns {object} Serialized NOde
             */
            ChapterDetail.ChapterDetailSerializer.prototype.serialize = function(node) 
            {
                var serializedData = {
                    id: node.id,
                    x: node.position.x,
                    y: node.position.y,
                    detailViewId: node.detailViewId,
                    name: node.detailName
                };

                return serializedData;
            };

            /**
             * Deserializes a serialized node
             * 
             * @param {object} node Serialized Node Object
             * @returns {object} Deserialized Node
             */
            ChapterDetail.ChapterDetailSerializer.prototype.deserialize = function(node) 
            {
                var initOptions = {
                    id: node.id,
                    position: { x: node.x, y: node.y },
                    detailViewId: node.detailViewId,
                    detailName: node.name
                };

                var node = new this.classType(initOptions);
                return node;
            };

            // Register Serializers
            var chapterDetailSerializer = new ChapterDetail.ChapterDetailSerializer();
            GoNorth.DefaultNodeShapes.Serialize.getNodeSerializerInstance().addNodeSerializer(chapterDetailSerializer);

        }(Aika.ChapterDetail = Aika.ChapterDetail || {}));
    }(GoNorth.Aika = GoNorth.Aika || {}));
}(window.GoNorth = window.GoNorth || {}));