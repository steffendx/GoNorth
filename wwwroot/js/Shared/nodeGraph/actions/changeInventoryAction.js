(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Actions) {

            /**
             * Change Inventory Action
             * @class
             */
            Actions.ChangeInventoryAction = function()
            {
                GoNorth.DefaultNodeShapes.Actions.BaseAction.apply(this);
            };

            Actions.ChangeInventoryAction.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.Actions.BaseAction.prototype);

            /**
             * Returns the HTML Content of the action
             * 
             * @returns {string} HTML Content of the action
             */
            Actions.ChangeInventoryAction.prototype.getContent = function() {
                return  "<div class='gn-actionNodeObjectSelectContainer'>" + 
                            "<a class='gn-clickable gn-nodeSelectItemAction gn-nodeNonClickableOnReadonly'></a>&nbsp;" +
                            "<a class='gn-clickable gn-nodeActionOpenItem' title='" + DefaultNodeShapes.Localization.Actions.OpenItemTooltip + "' style='display: none'><i class='glyphicon glyphicon-eye-open'></i></a>" +
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
            Actions.ChangeInventoryAction.prototype.onInitialized = function(contentElement, actionNode) {
                this.contentElement = contentElement;
                this.contentElement.find(".gn-nodeSelectItemAction").text(DefaultNodeShapes.Localization.Actions.ChooseItem);

                var itemOpenLink = contentElement.find(".gn-nodeActionOpenItem");

                // Deserialize
                var existingItemId = this.deserializeData();
                if(existingItemId)
                {
                    itemOpenLink.show();

                    actionNode.showLoading();
                    actionNode.hideError();
                    GoNorth.HttpClient.post("/api/StyrApi/ResolveFlexFieldObjectNames", [ existingItemId ]).done(function(itemNames) {
                        if(itemNames.length == 0)
                        {
                            actionNode.hideLoading();
                            actionNode.showError();
                            return;
                        }

                        contentElement.find(".gn-nodeSelectItemAction").text(itemNames[0].name);
                        actionNode.hideLoading();
                    }).fail(function(xhr) {
                        actionNode.hideLoading();
                        actionNode.showError();
                    });
                }

                // Handlers
                var self = this;
                var selectItemAction = contentElement.find(".gn-nodeSelectItemAction");
                contentElement.find(".gn-nodeSelectItemAction").on("click", function() {
                    DefaultNodeShapes.openItemSearchDialog().then(function(item) {
                        selectItemAction.data("itemid", item.id);
                        selectItemAction.text(item.name);
                        self.saveData();

                        itemOpenLink.show();
                    });
                });

                var itemQuantity = contentElement.find(".gn-nodeItemQuantity");
                itemQuantity.keydown(function(e) {
                    GoNorth.Util.validateNumberKeyPress(itemQuantity, e);
                });

                itemQuantity.on("input", function(e) {
                    self.ensureNumberValue();
                    self.saveData();
                });

                itemOpenLink.on("click", function() {
                    if(selectItemAction.data("itemid"))
                    {
                        window.open("/Styr/Item?id=" + selectItemAction.data("itemid"));
                    }
                });
            };

            /**
             * Ensures a number value was entered for the item quantity
             */
            Actions.ChangeInventoryAction.prototype.ensureNumberValue = function() {
                var parsedValue = parseFloat(this.contentElement.find(".gn-nodeItemQuantity").val());
                if(isNaN(parsedValue))
                {
                    this.contentElement.find(".gn-nodeItemQuantity").val("");
                }
            };

            /**
             * Deserializes the data
             * @returns {string} Deserialized item id
             */
            Actions.ChangeInventoryAction.prototype.deserializeData = function() {
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

                var quantity = data.quantity;
                if(isNaN(parseInt(data.quantity)))
                {
                    quantity = "";
                }
                this.contentElement.find(".gn-nodeItemQuantity").val(quantity);

                return itemId;
            }

            /**
             * Saves the data
             */
            Actions.ChangeInventoryAction.prototype.saveData = function() {
                var itemId = this.contentElement.find(".gn-nodeSelectItemAction").data("itemid");
                var quantity = parseInt(this.contentElement.find(".gn-nodeItemQuantity").val());
                if(isNaN(quantity))
                {
                    quantity = null;
                }

                var serializeData = {
                    itemId: itemId,
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