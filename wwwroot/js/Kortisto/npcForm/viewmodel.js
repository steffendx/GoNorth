(function(GoNorth) {
    "use strict";
    (function(Kortisto) {
        (function(Npc) {

            /**
             * Npc View Model
             * @class
             */
            Npc.ViewModel = function()
            {
                GoNorth.FlexFieldDatabase.ObjectForm.BaseViewModel.apply(this, [ "KortistoApi", "KortistoNpc", "KortistoTemplate", "GetPagesByNpc?npcId=", "GetMapsByNpcId?npcId=" ]);

                this.objectDialog = new GoNorth.ChooseObjectDialog.ViewModel();
                this.inventoryItems = new ko.observableArray();
                this.showConfirmItemRemoveDialog = new ko.observable(false);
                this.itemToRemove = null;
                this.isLoadingInventory = new ko.observable(false);
                this.loadingInventoryError = new ko.observable(false);

                this.isPlayerNpc = new ko.observable(false);

                this.showMarkAsPlayerDialog = new ko.observable(false);

                this.dialogExists = new ko.observable(false);
                this.dialogImplemented = new ko.observable(false);

                this.init();

                if(GoNorth.FlexFieldDatabase.ObjectForm.hasImplementationStatusTrackerRights && GoNorth.FlexFieldDatabase.ObjectForm.hasTaleRights && this.id())
                {
                    this.loadDialogImplementationState();
                }
            };

            Npc.ViewModel.prototype = jQuery.extend({ }, GoNorth.FlexFieldDatabase.ObjectForm.BaseViewModel.prototype);

            /**
             * Parses additional data from a loaded object
             * 
             * @param {object} data Data returned from the webservice
             */
            Npc.ViewModel.prototype.parseAdditionalData = function(data) {
                if(!this.isTemplateMode())
                {
                    this.isPlayerNpc(data.isPlayerNpc);
                }

                if(data.inventory)
                {
                    this.loadInventory(data.inventory);
                }
            };

            /**
             * Opens the compare dialog for the current object
             * 
             * @returns {jQuery.Deferred} Deferred which gets resolved after the object is marked as implemented
             */
            Npc.ViewModel.prototype.openCompareDialogForObject = function() {
                return this.compareDialog.openNpcCompare(this.id(), this.objectName());
            };

            /**
             * Loads the state of the dialog implementation state
             */
            Npc.ViewModel.prototype.loadDialogImplementationState = function() {
                var self = this;
                jQuery.ajax({ 
                    url: "/api/TaleApi/IsDialogImplementedByRelatedObjectId?relatedObjectId=" + this.id(), 
                    type: "GET"
                }).done(function(data) {
                    self.dialogExists(data.exists);
                    self.dialogImplemented(data.isImplemented);
                }).fail(function(xhr) {
                    self.errorOccured(true);
                });
            }

            /**
             * Loads the inventory
             * 
             * @param {object[]} inventory Inventory to load
             */
            Npc.ViewModel.prototype.loadInventory = function(inventory) {
                var inventoryItemIds = [];
                var itemLookup = {};
                for(var curItem = 0; curItem < inventory.length; ++curItem)
                {
                    inventoryItemIds.push(inventory[curItem].itemId);
                    itemLookup[inventory[curItem].itemId] = inventory[curItem];
                }

                this.isLoadingInventory(true);
                this.loadingInventoryError(false);
                var self = this;
                jQuery.ajax({ 
                    url: "/api/StyrApi/ResolveFlexFieldObjectNames", 
                    headers: GoNorth.Util.generateAntiForgeryHeader(),
                    data: JSON.stringify(inventoryItemIds), 
                    type: "POST",
                    contentType: "application/json"
                }).done(function(itemNames) {
                    var loadedInventoryItems = [];
                    for(var curItem = 0; curItem < itemNames.length; ++curItem)
                    {
                        loadedInventoryItems.push({
                            id: itemNames[curItem].id,
                            name: itemNames[curItem].name,
                            quantity: new ko.observable(itemLookup[itemNames[curItem].id].quantity),
                            isEquipped: new ko.observable(itemLookup[itemNames[curItem].id].isEquipped)
                        });
                    }

                    self.inventoryItems(loadedInventoryItems);
                    self.isLoadingInventory(false);
                }).fail(function(xhr) {
                    self.inventoryItems([]);
                    self.isLoadingInventory(false);
                    self.loadingInventoryError(true);
                });
            };

            /**
             * Sets Additional save data
             * 
             * @param {object} data Save data
             * @returns {object} Save data with additional values
             */
            Npc.ViewModel.prototype.setAdditionalSaveData = function(data) {
                data.isPlayerNpc = this.isPlayerNpc();
                data.inventory = [];
                var inventoryItems = this.inventoryItems();
                for(var curItem = 0; curItem < inventoryItems.length; ++curItem)
                {
                    var quantity = parseInt(inventoryItems[curItem].quantity());
                    if(isNaN(quantity))
                    {
                        quantity = 1;
                    }

                    var item = {
                        itemId: inventoryItems[curItem].id,
                        quantity: quantity,
                        isEquipped: inventoryItems[curItem].isEquipped(),
                    };
                    data.inventory.push(item);
                }

                return data;
            };


            /**
             * Adds an item to the inventory
             */
            Npc.ViewModel.prototype.addItemToInventory = function() {
                var self = this;
                this.objectDialog.openItemSearch(Npc.Localization.AddItemToInventory).then(function(item) {
                    var inventoryItems = self.inventoryItems();
                    for(var curItem = 0; curItem < inventoryItems.length; ++curItem)
                    {
                        if(inventoryItems[curItem].id == item.id)
                        {
                            return;
                        }
                    }

                    self.inventoryItems.push({
                        id: item.id,
                        name: item.name,
                        quantity: new ko.observable(1),
                        isEquipped: new ko.observable(false)
                    });

                    self.inventoryItems.sort(function(item1, item2) {
                        return item1.name.localeCompare(item2.name);
                    });
                });
            };

            /**
             * Removes an item from the inventory
             * 
             * @param {object} item Item to remove
             */
            Npc.ViewModel.prototype.openRemoveItemDialog = function(item) {
                this.itemToRemove = item;
                this.showConfirmItemRemoveDialog(true);
            };

            /**
             * Removes the item which should be removed from the inventory
             */
            Npc.ViewModel.prototype.removeItemFromInventory = function() {
                if(this.itemToRemove)
                {
                    this.inventoryItems.remove(this.itemToRemove);
                }

                this.closeConfirmItemRemoveDialog();
            };

            /**
             * Closes the confirm item remove dialog
             */
            Npc.ViewModel.prototype.closeConfirmItemRemoveDialog = function() {
                this.itemToRemove = null;
                this.showConfirmItemRemoveDialog(false);
            };

            /**
             * Builds the url for an item
             * 
             * @param {object} item Item which should be opened
             * @returns {string} Url for the item
             */
            Npc.ViewModel.prototype.buildItemUrl = function(item) {
                return "/Styr/Item#id=" + item.id;
            };

            /**
             * Opens the tale dialog for the npc
             */
            Npc.ViewModel.prototype.openTale = function() {
                if(!this.id())
                {
                    return;
                }

                window.location = "/Tale#npcId=" + this.id();
            };


            /**
             * Opens the mark as playe dialog
             */
            Npc.ViewModel.prototype.openMarkAsPlayerDialog = function() {
                this.showMarkAsPlayerDialog(true);
            };

            /**
             * Closes the mark as player dialog
             */
            Npc.ViewModel.prototype.closeMarkAsPlayerDialog = function() {
                this.showMarkAsPlayerDialog(false);
            };

            /**
             * Marks the npc as a player
             */
            Npc.ViewModel.prototype.markAsPlayer = function() {
                this.isPlayerNpc(true);
                this.closeMarkAsPlayerDialog();
                this.save();
            };

        }(Kortisto.Npc = Kortisto.Npc || {}));
    }(GoNorth.Kortisto = GoNorth.Kortisto || {}));
}(window.GoNorth = window.GoNorth || {}));