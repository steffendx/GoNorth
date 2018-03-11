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
                GoNorth.FlexFieldDatabase.ObjectForm.BaseViewModel.apply(this, [ "/Styr", "StyrApi", "StyrItem", "StyrTemplate", "GetPagesByItem?itemId=", "GetMapsByItemId?itemId=" ]);

                this.containedInNpcInventory = new ko.observableArray();
                this.loadingContainedInNpcInventory = new ko.observable(false);
                this.errorLoadingContainedInNpcInventory = new ko.observable(false);

                this.init();
            };

            Item.ViewModel.prototype = jQuery.extend({ }, GoNorth.FlexFieldDatabase.ObjectForm.BaseViewModel.prototype);

            /**
             * Loads additional dependencies
             */
            Item.ViewModel.prototype.loadAdditionalDependencies = function() {
                if(GoNorth.FlexFieldDatabase.ObjectForm.hasKortistoRights && !this.isTemplateMode())
                {
                    this.loadNpcsByItemInInventory();
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
                jQuery.ajax({ 
                    url: "/api/KortistoApi/GetNpcsByItemInInventory?itemId=" + this.id(), 
                    type: "GET"
                }).done(function(data) {
                    self.containedInNpcInventory(data);
                    self.loadingContainedInNpcInventory(false);
                }).fail(function(xhr) {
                    self.errorLoadingContainedInNpcInventory(true);
                    self.loadingContainedInNpcInventory(false);
                });
            };

            /**
             * Builds the url for a Kortisto Npc
             * 
             * @param {object} npc Npc to open
             * @returns {string} Url for the npc
             */
            Item.ViewModel.prototype.buildNpcInventoryUrl = function(npc) {
                return "/Kortisto/Npc#id=" + npc.id;
            };

        }(Styr.Item = Styr.Item || {}));
    }(GoNorth.Styr = GoNorth.Styr || {}));
}(window.GoNorth = window.GoNorth || {}));