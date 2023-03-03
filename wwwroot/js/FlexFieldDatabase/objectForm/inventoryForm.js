(function (GoNorth) {
    "use strict";
    (function (FlexFieldDatabase) {
        (function (ObjectForm) {

            /**
             * Inventory Form
             * @param {GoNorth.ChooseObjectDialog.ViewModel} objectDialog Object dialog
             * @param {boolean} useItemRoles true if item roles must be used instead of equipped state
             * @class
             */
            ObjectForm.InventoryForm = function (objectDialog, useItemRoles) {
                this.objectDialog = objectDialog;

                this.isInventoryExpanded = new ko.observable(false);
                this.inventoryItems = new ko.observableArray();
                this.itemToRemove = null;
                this.showConfirmRemoveDialog = new ko.observable(false);
                this.isLoadingInventory = new ko.observable(false);
                this.loadingInventoryError = new ko.observable(false);
                this.useItemRoles = useItemRoles;
                this.suggestedItemRoles = new ko.observableArray([]);
                
                if(useItemRoles) {
                    this.loadItemRoles();
                }
            };

            ObjectForm.InventoryForm.prototype = {
                /**
                 * Loads the inventory
                 * 
                 * @param {object[]} inventory Inventory to load
                 * @returns {jQuery.Deferred} Deferred for the loading
                 */
                loadInventory: function (inventory) {
                    var inventoryDef = new jQuery.Deferred();

                    var inventoryItemIds = [];
                    var itemLookup = {};
                    for (var curItem = 0; curItem < inventory.length; ++curItem) {
                        inventoryItemIds.push(inventory[curItem].itemId);
                        itemLookup[inventory[curItem].itemId] = inventory[curItem];
                    }

                    this.isLoadingInventory(true);
                    this.loadingInventoryError(false);
                    var self = this;
                    GoNorth.HttpClient.post("/api/StyrApi/ResolveFlexFieldObjectNames", inventoryItemIds).done(function (itemNames) {
                        var loadedInventoryItems = [];
                        for (var curItem = 0; curItem < itemNames.length; ++curItem) {
                            loadedInventoryItems.push({
                                id: itemNames[curItem].id,
                                name: itemNames[curItem].name,
                                quantity: new ko.observable(itemLookup[itemNames[curItem].id].quantity),
                                isEquipped: new ko.observable(itemLookup[itemNames[curItem].id].isEquipped),
                                role: new ko.observable(itemLookup[itemNames[curItem].id].role),
                            });
                        }

                        self.inventoryItems(loadedInventoryItems);
                        self.isLoadingInventory(false);

                        inventoryDef.resolve();
                    }).fail(function (xhr) {
                        self.inventoryItems([]);
                        self.isLoadingInventory(false);
                        self.loadingInventoryError(true);

                        inventoryDef.reject();
                    });

                    return inventoryDef.promise();
                },

                /**
                 * Loads the item roles
                 */
                loadItemRoles: function() {
                    var def = new jQuery.Deferred();

                    var self = this;
                    GoNorth.HttpClient.get("/api/ProjectConfigApi/GetJsonConfigByKey?configKey=" + encodeURIComponent(GoNorth.ProjectConfig.ConfigKeys.ItemRoles)).done(function(loadedConfigData) {
                        if(!loadedConfigData)
                        {
                            def.resolve();
                            return;
                        }
                        
                        var configLines = JSON.parse(loadedConfigData)
                        self.suggestedItemRoles(configLines);
                        def.resolve();
                    }).fail(function() {
                        def.reject();
                    })

                    return def.promise();
                },

                /**
                 * Toggles the inventory visibility
                 */
                toogleInventoryVisibility: function () {
                    this.isInventoryExpanded(!this.isInventoryExpanded());
                },

                /**
                 * Adds an item to the inventory
                 */
                addItemToInventory: function () {
                    var self = this;
                    this.objectDialog.openItemSearch(FlexFieldDatabase.InventoryFormLocalization.AddItemToInventory).then(function (item) {
                        if (GoNorth.Util.doesObjectExistInFlexFieldArray(self.inventoryItems, item)) {
                            return;
                        }

                        self.inventoryItems.push({
                            id: item.id,
                            name: item.name,
                            quantity: new ko.observable(1),
                            isEquipped: new ko.observable(false),
                            role: new ko.observable("")
                        });

                        self.inventoryItems.sort(function (item1, item2) {
                            return item1.name.localeCompare(item2.name);
                        });
                    });
                },

                /**
                 * Removes an item from the inventory
                 * 
                 * @param {object} item Item to remove
                 */
                openRemoveItemDialog: function (item) {
                    this.itemToRemove = item;
                    this.showConfirmRemoveDialog(true);
                },

                /**
                 * Removes the item which should be removed
                 */
                removeItem: function () {
                    if (this.itemToRemove) {
                        this.inventoryItems.remove(this.itemToRemove);
                    }

                    this.closeConfirmRemoveDialog();
                },

                /**
                 * Closes the confirm remove dialog
                 */
                closeConfirmRemoveDialog: function () {
                    this.itemToRemove = null;
                    this.skillToRemove = null;
                    this.showConfirmRemoveDialog(false);
                },

                /**
                 * Serializes the inventory
                 * 
                 * @returns {object[]} Serialized inventory
                 */
                serializeInventory: function () {
                    var inventory = [];
                    var inventoryItems = this.inventoryItems();
                    for (var curItem = 0; curItem < inventoryItems.length; ++curItem) {
                        var quantity = parseInt(inventoryItems[curItem].quantity());
                        if (isNaN(quantity)) {
                            quantity = 1;
                        }

                        var item = {
                            itemId: inventoryItems[curItem].id,
                            quantity: quantity
                        }
                        if(!this.useItemRoles) {
                            item.isEquipped = inventoryItems[curItem].isEquipped();
                        } else {
                            item.role = inventoryItems[curItem].role();
                        }
                        inventory.push(item);
                    }

                    return inventory;
                },
                
                /**
                 * Builds the url for an item
                 * 
                 * @param {object} item Item which should be opened
                 * @returns {string} Url for the item
                 */
                buildItemUrl: function(item) {
                    return "/Styr/Item?id=" + item.id;
                }
            };

        }(FlexFieldDatabase.ObjectForm = FlexFieldDatabase.ObjectForm || {}));
    }(GoNorth.FlexFieldDatabase = GoNorth.FlexFieldDatabase || {}));
}(window.GoNorth = window.GoNorth || {}));