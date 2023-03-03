(function(GoNorth) {
    "use strict";
    (function(Styr) {
        (function(Item) {

            /**
             * Item View Model
             * @class
             */
            Item.ViewModel = function()
            {
                GoNorth.FlexFieldDatabase.ObjectForm.BaseViewModel.apply(this, [ "/Styr", "StyrApi", "Item", "StyrItem", "StyrTemplate", "GetPagesByItem?itemId=", "GetMapsByItemId?itemId=" ]);
                
                this.objectDialog = new GoNorth.ChooseObjectDialog.ViewModel();
                this.inventoryForm = new GoNorth.FlexFieldDatabase.ObjectForm.InventoryForm(this.objectDialog, true);

                this.containedInNpcInventory = new ko.observableArray();
                this.loadingContainedInNpcInventory = new ko.observable(false);
                this.errorLoadingContainedInNpcInventory = new ko.observable(false);

                this.containedInItemInventory = new ko.observableArray();
                this.loadingContainedInItemInventory = new ko.observable(false);
                this.errorLoadingContainedInItemInventory = new ko.observable(false);

                this.init();

                // Add access to object id for actions and conditions
                var self = this;
                Styr.getCurrentItemId = function() {
                    return self.id();
                };
            };

            Item.ViewModel.prototype = jQuery.extend({ }, GoNorth.FlexFieldDatabase.ObjectForm.BaseViewModel.prototype);

            /**
             * Parses additional data from a loaded object
             * 
             * @param {object} data Data returned from the webservice
             */
            Item.ViewModel.prototype.parseAdditionalData = function(data) {
                var self = this;
                if(data.inventory && data.inventory.length > 0)
                {
                    this.inventoryForm.loadInventory(data.inventory).done(function() {
                        self.saveLastObjectState();
                    });
                }
            };

            /**
             * Sets Additional save data
             * 
             * @param {object} data Save data
             * @returns {object} Save data with additional values
             */
            Item.ViewModel.prototype.setAdditionalSaveData = function(data) {
                data.inventory = this.inventoryForm.serializeInventory();

                return data;
            };

            /**
             * Loads additional dependencies
             */
            Item.ViewModel.prototype.loadAdditionalDependencies = function() {
                if(GoNorth.FlexFieldDatabase.ObjectForm.hasKortistoRights && !this.isTemplateMode())
                {
                    this.loadNpcsByItemInInventory();
                } 

                if(!GoNorth.FlexFieldDatabase.ObjectForm.disableItemInventory && !this.isTemplateMode())
                {
                    this.loadItemsByItemInInventory();
                } 
            };

            /**
             * Opens the compare dialog for the current object
             * 
             * @returns {jQuery.Deferred} Deferred which gets resolved after the object is marked as implemented
             */
            Item.ViewModel.prototype.openCompareDialogForObject = function() {
                return this.compareDialog.openItemCompare(this.id(), this.objectName());
            };


            /**
             * Loads the npcs in which the item is in the inventory
             */
            Item.ViewModel.prototype.loadNpcsByItemInInventory = function() {
                this.loadingContainedInNpcInventory(true);
                this.errorLoadingContainedInNpcInventory(false);
                var self = this;
                GoNorth.HttpClient.get("/api/KortistoApi/GetNpcsByItemInInventory?itemId=" + this.id()).done(function(data) {
                    self.containedInNpcInventory(data);
                    self.loadingContainedInNpcInventory(false);
                }).fail(function(xhr) {
                    self.errorLoadingContainedInNpcInventory(true);
                    self.loadingContainedInNpcInventory(false);
                });
            };

            /**
             * Loads the items in which the item is in the inventory
             */
            Item.ViewModel.prototype.loadItemsByItemInInventory = function() {
                this.loadingContainedInItemInventory(true);
                this.errorLoadingContainedInItemInventory(false);
                var self = this;
                GoNorth.HttpClient.get("/api/StyrApi/GetItemsByItemInInventory?itemId=" + this.id()).done(function(data) {
                    self.containedInItemInventory(data);
                    self.loadingContainedInItemInventory(false);
                }).fail(function(xhr) {
                    self.errorLoadingContainedInItemInventory(true);
                    self.loadingContainedInItemInventory(false);
                });
            };

            /**
             * Builds the url for a Kortisto Npc
             * 
             * @param {object} npc Npc to open
             * @returns {string} Url for the npc
             */
            Item.ViewModel.prototype.buildNpcInventoryUrl = function(npc) {
                return "/Kortisto/Npc?id=" + npc.id;
            };

            /**
             * Builds the url for a Kortisto Item
             * 
             * @param {object} item Item to open
             * @returns {string} Url for the item
             */
            Item.ViewModel.prototype.buildItemInventoryUrl = function(item) {
                return "/Styr/Item?id=" + item.id;
            };

        }(Styr.Item = Styr.Item || {}));
    }(GoNorth.Styr = GoNorth.Styr || {}));
}(window.GoNorth = window.GoNorth || {}));