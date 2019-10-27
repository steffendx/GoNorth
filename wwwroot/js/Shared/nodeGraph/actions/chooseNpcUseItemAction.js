(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Actions) {

            /// Action Type for a choose npc using an item
            var actionTypeNpcUseItem = 55;

            /**
             * Choose Npc Use Item Action
             * @class
             */
            Actions.ChooseNpcUseItemAction = function()
            {
                GoNorth.DefaultNodeShapes.Actions.BaseAction.apply(this);
            };

            Actions.ChooseNpcUseItemAction.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.Actions.BaseAction.prototype);

            /**
             * Builds the action
             * 
             * @returns {object} Action
             */
            Actions.ChooseNpcUseItemAction.prototype.buildAction = function() {
                return new Actions.ChooseNpcUseItemAction();
            };

            /**
             * Returns the type of the action
             * 
             * @returns {number} Type of the action
             */
            Actions.ChooseNpcUseItemAction.prototype.getType = function() {
                return actionTypeNpcUseItem;
            };
            
            /**
             * Returns the label of the action
             * 
             * @returns {string} Label of the action
             */
            Actions.ChooseNpcUseItemAction.prototype.getLabel = function() {
                return DefaultNodeShapes.Localization.Actions.ChooseNpcUseItemLabel;
            };

            /**
             * Returns the HTML Content of the action
             * 
             * @returns {string} HTML Content of the action
             */
            Actions.ChooseNpcUseItemAction.prototype.getContent = function() {
                return "<div class='gn-actionNodeObjectSelectContainer'>" + 
                            "<a class='gn-clickable gn-nodeSelectNpcAction gn-nodeNonClickableOnReadonly'></a>&nbsp;" +
                            "<a class='gn-clickable gn-nodeActionOpenNpc' title='" + DefaultNodeShapes.Localization.Actions.OpenNpcTooltip + "' style='display: none'><i class='glyphicon glyphicon-eye-open'></i></a>" +
                        "</div>" +
                        "<div class='gn-nodeActionText'>" + DefaultNodeShapes.Localization.Actions.UsesItem + "</div>" +
                        "<div class='gn-actionNodeObjectSelectContainer'>" + 
                            "<a class='gn-clickable gn-nodeSelectItemAction gn-nodeNonClickableOnReadonly'></a>&nbsp;" +
                            "<a class='gn-clickable gn-nodeActionOpenItem' title='" + DefaultNodeShapes.Localization.Actions.OpenItemTooltip + "' style='display: none'><i class='glyphicon glyphicon-eye-open'></i></a>" +
                        "</div>";
            };

            /**
             * Gets called once the action was intialized
             * 
             * @param {object} contentElement Content element
             * @param {ActionNode} actionNode Parent Action node
             */
            Actions.ChooseNpcUseItemAction.prototype.onInitialized = function(contentElement, actionNode) {
                this.contentElement = contentElement;
                this.contentElement.find(".gn-nodeSelectNpcAction").text(DefaultNodeShapes.Localization.Actions.ChooseNpc);
                this.contentElement.find(".gn-nodeSelectItemAction").text(DefaultNodeShapes.Localization.Actions.ChooseItem);

                var npcOpenLink = contentElement.find(".gn-nodeActionOpenNpc");
                var itemOpenLink = contentElement.find(".gn-nodeActionOpenItem");

                // Deserialize
                var existingIds = this.deserializeData();
                var loadingDefs = [];
                if(existingIds.itemId)
                {
                    itemOpenLink.show();
                    
                    var itemDef = new jQuery.Deferred();
                    loadingDefs.push(itemDef);
                    jQuery.ajax({ 
                        url: "/api/StyrApi/ResolveFlexFieldObjectNames", 
                        headers: GoNorth.Util.generateAntiForgeryHeader(),
                        data: JSON.stringify([ existingIds.itemId ]), 
                        type: "POST",
                        contentType: "application/json"
                    }).done(function(itemNames) {
                        if(itemNames.length == 0)
                        {
                            itemDef.reject();
                            return;
                        }

                        contentElement.find(".gn-nodeSelectItemAction").text(itemNames[0].name);
                        itemDef.resolve();
                    }).fail(function(xhr) {
                        itemDef.reject();
                    });
                }

                if(existingIds.npcId)
                {
                    npcOpenLink.show();

                    var npcDef = new jQuery.Deferred();
                    loadingDefs.push(npcDef);
                    jQuery.ajax({ 
                        url: "/api/KortistoApi/ResolveFlexFieldObjectNames", 
                        headers: GoNorth.Util.generateAntiForgeryHeader(),
                        data: JSON.stringify([ existingIds.npcId ]), 
                        type: "POST",
                        contentType: "application/json"
                    }).done(function(npcNames) {
                        if(npcNames.length == 0)
                        {
                            npcDef.reject();
                            return;
                        }

                        contentElement.find(".gn-nodeSelectNpcAction").text(npcNames[0].name);
                        npcDef.resolve();
                    }).fail(function(xhr) {
                        npcDef.reject();
                    });
                }

                if(loadingDefs.length > 0)
                {
                    actionNode.showLoading();
                    actionNode.hideError();
                    jQuery.when.apply(jQuery, loadingDefs).done(function() {
                        actionNode.hideLoading();
                    }).fail(function() {
                        actionNode.hideLoading();
                        actionNode.showError();
                    })
                }

                // Handlers
                var self = this;
                var selectNpcAction = contentElement.find(".gn-nodeSelectNpcAction");
                selectNpcAction.on("click", function() {
                    DefaultNodeShapes.openNpcSearchDialog().then(function(npc) {
                        selectNpcAction.data("npcid", npc.id);
                        selectNpcAction.text(npc.name);
                        self.saveData();

                        npcOpenLink.show();
                    });
                });  

                var selectItemAction = contentElement.find(".gn-nodeSelectItemAction");
                contentElement.find(".gn-nodeSelectItemAction").on("click", function() {
                    DefaultNodeShapes.openItemSearchDialog().then(function(item) {
                        selectItemAction.data("itemid", item.id);
                        selectItemAction.text(item.name);
                        self.saveData();

                        itemOpenLink.show();
                    });
                });

                itemOpenLink.on("click", function() {
                    if(selectItemAction.data("itemid"))
                    {
                        window.open("/Styr/Item?id=" + selectItemAction.data("itemid"));
                    }
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
             * @returns {string} Deserialized item id
             */
            Actions.ChooseNpcUseItemAction.prototype.deserializeData = function() {
                var actionData = this.nodeModel.get("actionData");
                if(!actionData)
                {
                    return "";
                }

                var data = JSON.parse(actionData);
                
                var itemId = "";
                if(data.itemId)
                {
                    this.contentElement.find(".gn-nodeSelectItemAction").data("itemid", data.itemId);
                    itemId = data.itemId;
                }
                else
                {
                    this.contentElement.find(".gn-nodeSelectItemAction").data("itemid", "");
                }

                var npcId = "";
                if(data.npcId)
                {
                    this.contentElement.find(".gn-nodeSelectNpcAction").data("npcid", data.npcId);
                    npcId = data.npcId;
                }
                else
                {
                    this.contentElement.find(".gn-nodeSelectNpcAction").data("npcid", "");
                }

                return {
                    itemId: itemId,
                    npcId: npcId
                };
            }

            /**
             * Saves the data
             */
            Actions.ChooseNpcUseItemAction.prototype.saveData = function() {
                var npcId = this.contentElement.find(".gn-nodeSelectNpcAction").data("npcid");
                var itemId = this.contentElement.find(".gn-nodeSelectItemAction").data("itemid");

                var serializeData = {
                    npcId: npcId,
                    itemId: itemId
                };

                this.nodeModel.set("actionData", JSON.stringify(serializeData));

                // Set related object data
                this.nodeModel.set("actionRelatedToObjectType", GoNorth.DefaultNodeShapes.Actions.RelatedToObjectItem);
                this.nodeModel.set("actionRelatedToObjectId", itemId);
            }

            GoNorth.DefaultNodeShapes.Shapes.addAvailableAction(new Actions.ChooseNpcUseItemAction());

        }(DefaultNodeShapes.Actions = DefaultNodeShapes.Actions || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));