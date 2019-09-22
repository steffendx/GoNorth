(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Actions) {

            /**
             * Change Inventory choose npc Action
             * @class
             */
            Actions.ChangeInventoryChooseNpcAction = function()
            {
                GoNorth.DefaultNodeShapes.Actions.BaseAction.apply(this);
            };

            Actions.ChangeInventoryChooseNpcAction.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.Actions.BaseAction.prototype);

            /**
             * Returns the HTML Content of the action
             * 
             * @returns {string} HTML Content of the action
             */
            Actions.ChangeInventoryChooseNpcAction.prototype.getContent = function() {
                return  "<div class='gn-actionNodeObjectSelectContainer'>" + 
                            "<a class='gn-clickable gn-nodeSelectItemAction gn-nodeNonClickableOnReadonly'></a>&nbsp;" +
                            "<a class='gn-clickable gn-nodeActionOpenItem' title='" + DefaultNodeShapes.Localization.Actions.OpenItemTooltip + "' style='display: none'><i class='glyphicon glyphicon-eye-open'></i></a>" +
                        "</div>" +
                        "<div class='gn-actionNodeObjectSelectionSeperator'>" + DefaultNodeShapes.Localization.Actions.InInventoryOf + "</div>" +
                        "<div class='gn-actionNodeObjectSelectContainer'>" + 
                            "<a class='gn-clickable gn-nodeSelectNpcAction gn-nodeNonClickableOnReadonly'></a>&nbsp;" +
                            "<a class='gn-clickable gn-nodeActionOpenNpc' title='" + DefaultNodeShapes.Localization.Actions.OpenNpcTooltip + "' style='display: none'><i class='glyphicon glyphicon-eye-open'></i></a>" +
                        "</div>" +
                        "<div class='gn-nodeActionText'>" + DefaultNodeShapes.Localization.Actions.ItemQuantity + "</div>" +
                        "<input type='text' class='gn-nodeItemQuantity'/>";
            };

            /**
             * Gets called once the action was intialized
             * 
             * @param {object} contentElement Content element
             * @param {ActionNode} actionNode Parent Action node
             */
            Actions.ChangeInventoryChooseNpcAction.prototype.onInitialized = function(contentElement, actionNode) {
                this.contentElement = contentElement;
                this.contentElement.find(".gn-nodeSelectItemAction").text(DefaultNodeShapes.Localization.Actions.ChooseItem);
                this.contentElement.find(".gn-nodeSelectNpcAction").text(DefaultNodeShapes.Localization.Actions.ChooseNpc);

                var itemOpenLink = contentElement.find(".gn-nodeActionOpenItem");
                var npcOpenLink = contentElement.find(".gn-nodeActionOpenNpc");

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
                var selectItemAction = contentElement.find(".gn-nodeSelectItemAction");
                selectItemAction.on("click", function() {
                    DefaultNodeShapes.openItemSearchDialog().then(function(item) {
                        selectItemAction.data("itemid", item.id);
                        selectItemAction.text(item.name);
                        self.saveData();

                        itemOpenLink.show();
                    });
                });

                var selectNpcAction = contentElement.find(".gn-nodeSelectNpcAction");
                selectNpcAction.on("click", function() {
                    DefaultNodeShapes.openNpcSearchDialog().then(function(npc) {
                        selectNpcAction.data("npcid", npc.id);
                        selectNpcAction.text(npc.name);
                        self.saveData();

                        npcOpenLink.show();
                    });
                });  

                var itemQuantity = contentElement.find(".gn-nodeItemQuantity");
                itemQuantity.keydown(function(e) {
                    GoNorth.Util.validateNumberKeyPress(itemQuantity, e);
                });

                itemQuantity.change(function(e) {
                    self.ensureNumberValue();
                    self.saveData();
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
             * Ensures a number value was entered for the item quantity
             */
            Actions.ChangeInventoryChooseNpcAction.prototype.ensureNumberValue = function() {
                var parsedValue = parseFloat(this.contentElement.find(".gn-nodeItemQuantity").val());
                if(isNaN(parsedValue))
                {
                    this.contentElement.find(".gn-nodeItemQuantity").val("");
                }
            };

            /**
             * Deserializes the data
             * @returns {object} Deserialized ids
             */
            Actions.ChangeInventoryChooseNpcAction.prototype.deserializeData = function() {
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

                var quantity = data.quantity;
                if(isNaN(parseInt(data.quantity)))
                {
                    quantity = "";
                }
                this.contentElement.find(".gn-nodeItemQuantity").val(quantity);

                return {
                    itemId: itemId,
                    npcId: npcId
                };
            }

            /**
             * Saves the data
             */
            Actions.ChangeInventoryChooseNpcAction.prototype.saveData = function() {
                var itemId = this.contentElement.find(".gn-nodeSelectItemAction").data("itemid");
                var npcId = this.contentElement.find(".gn-nodeSelectNpcAction").data("npcid");
                var quantity = parseInt(this.contentElement.find(".gn-nodeItemQuantity").val());
                if(isNaN(quantity))
                {
                    quantity = null;
                }

                var serializeData = {
                    itemId: itemId,
                    npcId: npcId,
                    quantity: quantity
                };

                this.nodeModel.set("actionData", JSON.stringify(serializeData));

                // Set related object data
                this.nodeModel.set("actionRelatedToObjectType", GoNorth.DefaultNodeShapes.Actions.RelatedToObjectItem);
                this.nodeModel.set("actionRelatedToObjectId", itemId);
            }

        }(DefaultNodeShapes.Actions = DefaultNodeShapes.Actions || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));