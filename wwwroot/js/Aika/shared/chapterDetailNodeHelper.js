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
                GoNorth.HttpClient.get("/api/AikaApi/GetChapterDetail?id=" + detailViewId).done(function(data) {
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
                    var detailWindow = window.open("/Aika/Detail?id=" + detailViewId);
                    detailWindow.refreshChapterNode = function() {
                        loadDetailViewData(chapterNode, detailViewId);
                    };
                });

                return loadDetailViewData(chapterNode, detailViewId);
            };

            /**
            * Checks if a chapter or chapter detail node can be deleted
            * 
            * @param {string} detailNodeId Detail Node id
            * @returns {jQuery.Deferred} Deferred for the validation process
            */
            Shared.validateChapterDetailDelete = function(detailNodeId) {
               if(!detailNodeId)
               {
                   return null;
               }

               var def = new jQuery.Deferred();
               GoNorth.HttpClient.get("/api/AikaApi/ValidateChapterDetailDelete?id=" + detailNodeId).done(function(data) {
                   if(data.canBeDeleted)
                   {
                       def.resolve();
                   }
                   else
                   {
                       def.reject(data.errorMessage);
                   }
               }).fail(function(xhr) {
                   def.reject("");
               });

               return def.promise();
           };

        }(Aika.Shared = Aika.Shared || {}));
    }(GoNorth.Aika = GoNorth.Aika || {}));
}(window.GoNorth = window.GoNorth || {}));