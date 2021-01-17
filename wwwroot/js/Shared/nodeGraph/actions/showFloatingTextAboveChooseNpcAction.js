(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Actions) {

            /// Action Type for showing a floating text above the player
            var actionTypeShowFloatingTextAboveChooseNpc = 31;

            /**
             * Show floating text above pc action
             * @class
             */
            Actions.ShowFloatingTextAboveChooseNpcAction = function()
            {
                GoNorth.DefaultNodeShapes.Actions.BaseAction.apply(this);
                GoNorth.DefaultNodeShapes.Shapes.SharedObjectLoading.apply(this);
            };

            Actions.ShowFloatingTextAboveChooseNpcAction.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.Actions.BaseAction.prototype);
            Actions.ShowFloatingTextAboveChooseNpcAction.prototype = jQuery.extend(Actions.ShowFloatingTextAboveChooseNpcAction.prototype, GoNorth.DefaultNodeShapes.Shapes.SharedObjectLoading.prototype);

            /**
             * Returns the HTML Content of the action
             * 
             * @returns {string} HTML Content of the action
             */
            Actions.ShowFloatingTextAboveChooseNpcAction.prototype.getContent = function() {
                return "<div class='gn-actionNodeObjectSelectContainer'>" +
                            "<a class='gn-actionNodeNpcSelect gn-clickable'>" + DefaultNodeShapes.Localization.Actions.ChooseNpcLabel + "</a>" +
                            "<a class='gn-clickable gn-nodeActionOpenObject' title='" + DefaultNodeShapes.Localization.Actions.OpenNpcTooltip + "' style='display: none'><i class='glyphicon glyphicon-eye-open'></i></a>" +
                        "</div>" +
                       "<div class='gn-nodeActionText'>" + DefaultNodeShapes.Localization.Actions.FloatingText + "</div>" +
                       "<textarea class='gn-nodeActionFloatingText'></textarea>";
            };

            /**
             * Gets called once the action was intialized
             * 
             * @param {object} contentElement Content element
             * @param {ActionNode} actionNode Parent Action node
             */
            Actions.ShowFloatingTextAboveChooseNpcAction.prototype.onInitialized = function(contentElement, actionNode) {
                this.contentElement = contentElement;

                var npcOpenLink = contentElement.find(".gn-nodeActionOpenObject");

                // Deserialize
                var npcId = this.deserializeData();
                if(npcId)
                {
                    // Set related object data
                    this.nodeModel.set("actionRelatedToObjectType", Actions.RelatedToObjectNpc);
                    this.nodeModel.set("actionRelatedToObjectId", npcId);

                    npcOpenLink.show();

                    actionNode.showLoading();
                    actionNode.hideError();

                    this.loadObjectShared(npcId).then(function(npc) {
                        contentElement.find(".gn-actionNodeNpcSelect").text(npc.name);
                        actionNode.hideLoading();
                    }).fail(function(xhr) {
                        actionNode.hideLoading();
                        actionNode.showError();
                    });
                }

                // Handlers
                var self = this;
                var floatingText = contentElement.find(".gn-nodeActionFloatingText");
                floatingText.change(function(e) {
                    self.saveData();
                });

                var selectNpcAction = contentElement.find(".gn-actionNodeNpcSelect");
                selectNpcAction.on("click", function() {
                    GoNorth.DefaultNodeShapes.openNpcSearchDialog().then(function(npc) {
                        selectNpcAction.data("npcid", npc.id);
                        selectNpcAction.text(npc.name);
                        
                        // Set related object data
                        self.nodeModel.set("actionRelatedToObjectType", Actions.RelatedToObjectNpc);
                        self.nodeModel.set("actionRelatedToObjectId", npc.id);

                        npcOpenLink.show();
                    });
                });
                
                npcOpenLink.on("click", function() {
                    if(selectNpcAction.data("npcid"))
                    {
                        window.open("/Kortisto/Npc?id=" + selectNpcAction.data("npcid"));
                    }
                });
            };

            /**
             * Deserializes the data
             */
            Actions.ShowFloatingTextAboveChooseNpcAction.prototype.deserializeData = function() {
                var actionData = this.nodeModel.get("actionData");
                if(!actionData)
                {
                    return "";
                }

                var data = JSON.parse(actionData);
                
                this.contentElement.find(".gn-nodeActionFloatingText").val(data.floatingText);
                var npcId = "";
                if(data.npcId)
                {
                    this.contentElement.find(".gn-actionNodeNpcSelect").data("npcid", data.npcId);
                    npcId = data.npcId;
                }
                else
                {
                    this.contentElement.find(".gn-actionNodeNpcSelect").data("npcid", "");
                }

                return npcId;
            };

            /**
             * Saves the data
             */
            Actions.ShowFloatingTextAboveChooseNpcAction.prototype.saveData = function() {
                var floatingText = this.contentElement.find(".gn-nodeActionFloatingText").val();
                var serializeData = {
                    floatingText: floatingText,
                    npcId: this.contentElement.find(".gn-actionNodeNpcSelect").data("npcid")
                };

                this.nodeModel.set("actionData", JSON.stringify(serializeData));
            };

            /**
             * Builds the action
             * 
             * @returns {object} Action
             */
            Actions.ShowFloatingTextAboveChooseNpcAction.prototype.buildAction = function() {
                return new Actions.ShowFloatingTextAboveChooseNpcAction();
            };

            /**
             * Returns the type of the action
             * 
             * @returns {number} Type of the action
             */
            Actions.ShowFloatingTextAboveChooseNpcAction.prototype.getType = function() {
                return actionTypeShowFloatingTextAboveChooseNpc;
            };

            /**
             * Returns the label of the action
             * 
             * @returns {string} Label of the action
             */
            Actions.ShowFloatingTextAboveChooseNpcAction.prototype.getLabel = function() {
                return DefaultNodeShapes.Localization.Actions.ShowFloatingTextAboveChooseNpcLabel;
            };


            /**
             * Returns the object id
             * 
             * @returns {string} Object Id
             */
            Actions.ShowFloatingTextAboveChooseNpcAction.prototype.getObjectId = function() {
                return this.contentElement.find(".gn-actionNodeNpcSelect").data("npcid");
            };
            
            /**
             * Returns the object resource
             * 
             * @returns {int} Object Resource
             */
            Actions.ShowFloatingTextAboveChooseNpcAction.prototype.getObjectResource = function() {
                return GoNorth.DefaultNodeShapes.Shapes.ObjectResourceNpc;
            };

            /**
             * Loads the npc
             * 
             * @param {string} npcId Npc Id
             * @returns {jQuery.Deferred} Deferred for the npc loading
             */
            Actions.ShowFloatingTextAboveChooseNpcAction.prototype.loadObject = function(npcId) {
                var def = new jQuery.Deferred();

                GoNorth.HttpClient.get("/api/KortistoApi/FlexFieldObject?id=" + npcId).done(function(data) {
                    def.resolve(data);
                }).fail(function(xhr) {
                    def.reject();
                });

                return def.promise();
            };

            GoNorth.DefaultNodeShapes.Shapes.addAvailableAction(new Actions.ShowFloatingTextAboveChooseNpcAction());

        }(DefaultNodeShapes.Actions = DefaultNodeShapes.Actions || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));