(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {

        /**
         * Node Shapes Base View Model
         * @class
         */
        DefaultNodeShapes.BaseViewModel = function()
        {
            this.nodeGraph = new ko.observable();
            this.nodePaper = new ko.observable();
        
            this.showConfirmNodeDeleteDialog = new ko.observable(false);
            this.deleteDeferred = null;

            this.errorOccured = new ko.observable(false);
        };

        DefaultNodeShapes.BaseViewModel.prototype = {

            /**
             * Adds a new node
             * 
             * @param {object} dropElement Element that was dropped
             * @param {float} x X-Drop Coordinate
             * @param {float} z X-Drop Coordinate
             */
            addNewNode: function(dropElement, x, y) {
                if(!this.nodeGraph() || !this.nodePaper())
                {
                    return;
                }

                var initOptions = this.calcNodeInitOptionsPosition(x, y);
                this.addNodeByType(dropElement.data("nodetype"), initOptions);
            },

            /**
             * Creates the node init options with the node position
             * 
             * @param {float} x X-Drop Coordinate
             * @param {float} z X-Drop Coordinate
             */
            calcNodeInitOptionsPosition: function(x, y) {
                var scale = this.nodePaper().scale();
                var translate = this.nodePaper().translate();
                var initOptions = {
                    position: { x: (x - translate.tx) / scale.sx, y: (y - translate.ty) / scale.sy }
                };
                return initOptions;
            },

            /**
             * Adds a new node by the type
             * 
             * @param {string} nodeType Type of the new node
             * @param {object} initOptions Init Options for the node
             */
            addNodeByType: function(nodeType, initOptions) {
                var newNode = GoNorth.DefaultNodeShapes.Serialize.getNodeSerializerInstance().createNewNode(nodeType, initOptions);
                if(newNode == null)
                {
                    this.errorOccured(true);
                    return;
                }

                this.nodeGraph().addCells(newNode);
                this.setupNewNode(newNode);
            },

            /**
             * Prepares a new node
             * 
             * @param {object} newNode New Node to setup
             */
            setupNewNode: function(newNode) {
                newNode.attr(".inPorts circle/magnet", "passive");
                
                var self = this;
                newNode.onDelete = function() {
                    return self.onDelete();
                };
            },


            /**
             * Delete Callback if a user wants to delete a node
             */
            onDelete: function() {
                this.showConfirmNodeDeleteDialog(true);

                this.deleteDeferred = new jQuery.Deferred();
                return this.deleteDeferred.promise();
            },

            /**
             * Deletes the node for which the dialog is opened
             */
            deleteNode: function() {
                if(this.deleteDeferred)
                {
                    this.deleteDeferred.resolve();
                    this.deleteDeferred = null;
                }
                this.closeConfirmNodeDeleteDialog();
            },

            /**
             * Closes the confirm delete node dialog
             */
            closeConfirmNodeDeleteDialog: function() {
                if(this.deleteDeferred)
                {
                    this.deleteDeferred.reject();
                    this.deleteDeferred = null;
                }
                this.showConfirmNodeDeleteDialog(false);
            },

            /**
             * Sets the graph to readonly mode
             */
            setGraphToReadonly: function() {
                jQuery(".gn-nodeGraphContainer").find("input,textarea,select").prop("disabled", true);
                jQuery(".gn-nodeGraphContainer").find(".joint-cell").css("pointer-events", "none");
                jQuery(".gn-nodeGraphContainer").find(".gn-nodeDeleteOnReadonly").remove();
                jQuery(".gn-nodeGraphContainer").find(".gn-nodeNonClickableOnReadonly").css("pointer-events", "none");
            }
        };

    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(Aika) {
        (function(Shared) {

            /**
             * Set the detail view id for new nodes
             * 
             * @param {object} nodeGraph Node Graph
             * @param {string} detailNodes Nodes with detail view ids
             */
            Shared.setDetailViewIds = function (nodeGraph, detailNodes) {
                if(!detailNodes)
                {
                    return;
                }

                var graphElements = nodeGraph.getElements();
                for(var curElement = 0; curElement < graphElements.length; ++curElement)
                {
                    var element = graphElements[curElement];
                    if(element.get("detailViewId"))
                    {
                        continue;
                    }

                    for(var curNode = 0; curNode < detailNodes.length; ++curNode)
                    {
                        if(element.id != detailNodes[curNode].id)
                        {
                            continue;
                        }

                        element.set("detailViewId", detailNodes[curNode].detailViewId);
                        break;
                    }
                }
            };

        }(Aika.Shared = Aika.Shared || {}));
    }(GoNorth.Aika = GoNorth.Aika || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(Aika) {
        (function(Shared) {

            
            /// Width for nodes which have finish nodes as outports
            Shared.finishNodeOutportNodeWidth = 250;

            /// Minimum Height for nodes which have finish nodes as outports
            Shared.finishNodeOutportNodeMinHeight = 150;

            /// Count of outports after which the node begins to grow
            var finishNodeOutportGrowStartCount = 3;

            /// Amount of pixel by which a node grows for each outports bigger than the grow start count
            var finishNodeOutportGrowHeight = 30;


            /**
             * Loads the detail view data
             * 
             * @param {object} chapterNode Chapter Node to fill
             * @param {string} detailViewId Id of the detail view
             * @returns {jQuery.Deferred} Deferred for the loading process
             */
            function loadDetailViewData(chapterNode, detailViewId) {
                var def = new jQuery.Deferred();

                // Load finish nodes
                chapterNode.showLoading();
                chapterNode.hideError();
                jQuery.ajax({ 
                    url: "/api/AikaApi/GetChapterDetail?id=" + detailViewId, 
                    type: "GET"
                }).done(function(data) {
                    chapterNode.hideLoading();
                    
                    Shared.addFinishNodesAsOutports(chapterNode, data.finish);

                    def.resolve(data);
                }).fail(function(xhr) {
                    chapterNode.hideLoading();
                    chapterNode.showError();
                    def.reject();
                });

                return def.promise();
            }

            /**
             * Adds a finish nodes as outports for a node
             * @param {object} node Target node to which the outports should be added
             * @param {object[]} finishNodes Finish Nodes
             */
            Shared.addFinishNodesAsOutports = function(node, finishNodes)
            {
                if(!finishNodes)
                {
                    finishNodes = [];
                }

                var links = {};
                var allLinks = node.model.graph.getLinks();
                for(var curLink = 0; curLink < allLinks.length; ++curLink)
                {
                    var link = allLinks[curLink];
                    if(link.get("source") && link.get("source").id == node.model.id)
                    {
                        links[link.get("source").port] = link;
                    }
                }

                var outPorts = [];
                var portColors = {};
                for(var curFinish = 0; curFinish < finishNodes.length; ++curFinish)
                {
                    var portName = "finish" + finishNodes[curFinish].id; 
                    outPorts.push(portName);
                    portColors[portName] = finishNodes[curFinish].color;
                    var colorStyle = "fill: " + finishNodes[curFinish].color;
                    node.model.attr(".outPorts>.port" + curFinish + " circle", { "title": finishNodes[curFinish].name, "style": colorStyle });
                    node.model.attr(".outPorts>.port" + curFinish + " .port-label", { "title": finishNodes[curFinish].name, "class": "gn-aikaChapterFinishPort", "style": colorStyle, "dx": 13 });

                    if(links[portName])
                    {
                        links[portName].attr(".connection", { style: "stroke: " + finishNodes[curFinish].color });
                        links[portName].attr(".marker-target", { style: colorStyle });
                        delete links[portName];
                    }
                }
                node.model.set("outPorts", outPorts);

                var targetHeight = Shared.finishNodeOutportNodeMinHeight;
                if(outPorts.length > finishNodeOutportGrowStartCount)
                {
                    targetHeight = Shared.finishNodeOutportNodeMinHeight + (outPorts.length - finishNodeOutportGrowStartCount) * finishNodeOutportGrowHeight;
                }
                node.model.set("size", { width: Shared.finishNodeOutportNodeWidth, height: targetHeight });

                jQuery(".gn-aikaChapterFinishPort").each(function() {
                    jQuery(this).find("tspan").text(jQuery(this).attr("title"));
                });

                // Remove deleted port links
                for(var curPort in links)
                {
                    node.model.graph.removeCells([ links[curPort] ]);
                }

                // Handel add of new links
                node.model.graph.on('add', function(cell) {
                    if(!cell.isLink() || !cell.get("source"))
                    {
                        return;
                    }
                    
                    var source = cell.get("source");
                    if(source.id != node.model.id)
                    {
                        return;
                    }

                    if(portColors[source.port])
                    {
                        cell.attr(".connection", { style: "stroke: " + portColors[source.port] });
                        cell.attr(".marker-target", { style: "fill: " + portColors[source.port] });
                    }
                });
            }

            /**
             * Initializes the detail view connection
             * 
             * @param {object} chapterNode Chapter Node to fill
             * @param {string} detailViewId Id of the detail view
             * @returns {jQuery.Deferred} Deferred for the loading process
             */
            Shared.initDetailView = function (chapterNode, detailViewId) {
                if(chapterNode.$box.find(".gn-aikaChapterDetailButton").length > 0)
                {
                    return;
                }

                chapterNode.$box.append("<button class='gn-aikaChapterDetailButton'>" + Aika.Localization.Chapter.OpenDetailView + "</button>");

                chapterNode.$box.find(".gn-aikaChapterDetailButton").click(function() {
                    var detailWindow = window.open("/Aika/Detail#id=" + detailViewId);
                    detailWindow.refreshChapterNode = function() {
                        loadDetailViewData(chapterNode, detailViewId);
                    };
                });

                return loadDetailViewData(chapterNode, detailViewId);
            };

        }(Aika.Shared = Aika.Shared || {}));
    }(GoNorth.Aika = GoNorth.Aika || {}));
}(window.GoNorth = window.GoNorth || {}));
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
                jQuery.ajax({ 
                    url: "/api/AikaApi/SaveChapterOverview", 
                    headers: GoNorth.Util.generateAntiForgeryHeader(),
                    data: JSON.stringify(serializedGraph), 
                    type: "POST",
                    contentType: "application/json"
                }).done(function(data) {
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
                jQuery.ajax({ 
                    url: "/api/AikaApi/GetChapterOverview", 
                    type: "GET"
                }).done(function(data) {
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