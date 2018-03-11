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
                GoNorth.FlexFieldDatabase.ObjectForm.BaseViewModel.apply(this, [ "/Kortisto", "KortistoApi", "KortistoNpc", "KortistoTemplate", "GetPagesByNpc?npcId=", "GetMapsByNpcId?npcId=" ]);

                this.showConfirmRemoveDialog = new ko.observable(false);
                this.isRemovingItem = new ko.observable(false);

                this.objectDialog = new GoNorth.ChooseObjectDialog.ViewModel();
                this.inventoryItems = new ko.observableArray();
                this.itemToRemove = null;
                this.isLoadingInventory = new ko.observable(false);
                this.loadingInventoryError = new ko.observable(false);

                this.learnedSkills = new ko.observableArray();
                this.skillToRemove = null;
                this.isLoadingSkills = new ko.observable(false);
                this.loadingSkillsError = new ko.observable(false);

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

                if(Npc.hasStyrRights && data.inventory && data.inventory.length > 0)
                {
                    this.loadInventory(data.inventory);
                }

                if(Npc.hasEvneRights && data.skills && data.skills.length > 0)
                {
                    this.loadSkills(data.skills);
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
             * Loads the skills of the npc
             * 
             * @param {object[]} skills Skills of the npc
             */
            Npc.ViewModel.prototype.loadSkills = function(skills) {
                var learnedSkillIds = [];
                for(var curSkill = 0; curSkill < skills.length; ++curSkill )
                {
                    learnedSkillIds.push(skills[curSkill].skillId);
                }

                this.isLoadingSkills(true);
                this.loadingSkillsError(false);
                var self = this;
                jQuery.ajax({ 
                    url: "/api/EvneApi/ResolveFlexFieldObjectNames", 
                    headers: GoNorth.Util.generateAntiForgeryHeader(),
                    data: JSON.stringify(learnedSkillIds), 
                    type: "POST",
                    contentType: "application/json"
                }).done(function(skillNames) {
                    var loadedSkills = [];
                    for(var curSkill = 0; curSkill < skillNames.length; ++curSkill)
                    {
                        loadedSkills.push({
                            id: skillNames[curSkill].id,
                            name: skillNames[curSkill].name,
                        });
                    }

                    self.learnedSkills(loadedSkills);
                    self.isLoadingSkills(false);
                }).fail(function(xhr) {
                    self.learnedSkills([]);
                    self.isLoadingSkills(false);
                    self.loadingSkillsError(true);
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
                data.inventory = this.serializeInventory();
                data.skills = this.serializeSkills();

                return data;
            };

            /**
             * Serializes the inventory
             * 
             * @returns {object[]} Serialized inventory
             */
            Npc.ViewModel.prototype.serializeInventory = function() {
                var inventory = [];
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
                    inventory.push(item);
                }

                return inventory;
            };

            /**
             * Serializes the skills
             * 
             * @returns {object[]} Serialized skills
             */
            Npc.ViewModel.prototype.serializeSkills = function() {
                var skills = [];
                var learnedSkills = this.learnedSkills();
                for(var curSkill = 0; curSkill < learnedSkills.length; ++curSkill)
                {
                    var skill = {
                        skillId: learnedSkills[curSkill].id
                    };
                    skills.push(skill);
                }

                return skills;
            };



            /**
             * Checks if an object exists in a flex field array
             * 
             * @param {ko.observableArray} searchArray Array to search
             * @param {object} objectToSearch Flex Field object to search
             */
            Npc.ViewModel.prototype.doesObjectExistInFlexFieldArray = function(searchArray, objectToSearch)
            {
                var searchObjects = searchArray();
                for(var curObject = 0; curObject < searchObjects.length; ++curObject)
                {
                    if(searchObjects[curObject].id == objectToSearch.id)
                    {
                        return true;
                    }
                }

                return false;
            }


            /**
             * Adds an item to the inventory
             */
            Npc.ViewModel.prototype.addItemToInventory = function() {
                var self = this;
                this.objectDialog.openItemSearch(Npc.Localization.AddItemToInventory).then(function(item) {
                    if(self.doesObjectExistInFlexFieldArray(self.inventoryItems, item))
                    {
                        return;
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
             * Opens a dialog to add a new skill
             */
            Npc.ViewModel.prototype.addSkill = function() {
                var self = this;
                this.objectDialog.openSkillSearch(Npc.Localization.AddSkill).then(function(skill) {
                    if(self.doesObjectExistInFlexFieldArray(self.learnedSkills, skill))
                    {
                        return;
                    }

                    self.learnedSkills.push({
                        id: skill.id,
                        name: skill.name
                    });

                    self.learnedSkills.sort(function(skill1, skill2) {
                        return skill1.name.localeCompare(skill2.name);
                    });
                });
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
             * Builds the url for a skill
             * 
             * @param {object} skill Skill which should be opened
             * @returns {string} Url for the skill
             */
            Npc.ViewModel.prototype.buildSkillUrl = function(skill) {
                return "/Evne/Skill#id=" + skill.id;
            };

            /**
             * Removes an item from the inventory
             * 
             * @param {object} item Item to remove
             */
            Npc.ViewModel.prototype.openRemoveItemDialog = function(item) {
                this.itemToRemove = item;
                this.skillToRemove = null;
                this.isRemovingItem(true);
                this.showConfirmRemoveDialog(true);
            };

            /**
             * Removes a skill
             * 
             * @param {object} skill Skill to remove
             */
            Npc.ViewModel.prototype.openRemoveSkillDialog = function(skill) {
                this.skillToRemove = skill;
                this.itemToRemove = null;
                this.isRemovingItem(false);
                this.showConfirmRemoveDialog(true);
            };

            /**
             * Removes the object which should be removed
             */
            Npc.ViewModel.prototype.removeObject = function() {
                if(this.itemToRemove)
                {
                    this.inventoryItems.remove(this.itemToRemove);
                }

                if(this.skillToRemove)
                {
                    this.learnedSkills.remove(this.skillToRemove);
                }

                this.closeConfirmRemoveDialog();
            };

            /**
             * Closes the confirm remove dialog
             */
            Npc.ViewModel.prototype.closeConfirmRemoveDialog = function() {
                this.itemToRemove = null;
                this.skillToRemove = null;
                this.showConfirmRemoveDialog(false);
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