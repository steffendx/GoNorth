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
                GoNorth.FlexFieldDatabase.ObjectForm.BaseViewModel.apply(this, [ "/Kortisto", "KortistoApi", "Npc", "KortistoNpc", "KortistoTemplate", "GetPagesByNpc?npcId=", "GetMapsByNpcId?npcId=" ]);

                this.showConfirmRemoveDialog = new ko.observable(false);

                this.objectDialog = new GoNorth.ChooseObjectDialog.ViewModel();
                this.inventoryForm = new Npc.InventoryForm(this.objectDialog);
                this.skillForm = new Npc.SkillForm(this.objectDialog);
                this.dailyRoutinesForm = new Npc.DailyRoutinesForm(this.id, this.objectDialog, this.markedInKartaMaps, this.errorOccured);

                this.isPlayerNpc = new ko.observable(false);

                this.showMarkAsPlayerDialog = new ko.observable(false);

                this.nameGenTemplate = new ko.observable("ss"); // Default Setting is very simple name
                this.nameGenDialogTemplate = new ko.observable("");
                this.showNameGenSettingsDialog = new ko.observable(false);
                this.nameGenSample = new ko.observable("");
                this.nameGenTemplateError = new ko.observable(false);
                this.nameGenTemplateErrorDescription = new ko.observable("");

                var self = this;
                this.nameGenDialogTemplate.subscribe(function() {
                    self.generateSampleNameGenName();
                });

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

                this.nameGenTemplate(data.nameGenTemplate ? data.nameGenTemplate : "");

                var self = this;
                if(Npc.hasStyrRights && data.inventory && data.inventory.length > 0)
                {
                    this.inventoryForm.loadInventory(data.inventory).done(function() {
                        self.saveLastObjectState();
                    });
                }

                if(Npc.hasEvneRights && data.skills && data.skills.length > 0)
                {
                    this.skillForm.loadSkills(data.skills).done(function() {
                        self.saveLastObjectState();
                    });
                }

                this.dailyRoutinesForm.loadEvents(data.dailyRoutine);
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
            };

            /**
             * Sets Additional save data
             * 
             * @param {object} data Save data
             * @returns {object} Save data with additional values
             */
            Npc.ViewModel.prototype.setAdditionalSaveData = function(data) {
                data.isPlayerNpc = this.isPlayerNpc();
                data.nameGenTemplate = this.nameGenTemplate();
                data.inventory = this.inventoryForm.serializeInventory();
                data.skills = this.skillForm.serializeSkills();
                data.dailyRoutine = this.dailyRoutinesForm.serializeEvents();

                return data;
            };

            /**
             * Runs logic after save
             * 
             * @param {object} data Returned data after save
             */
            Npc.ViewModel.prototype.runAfterSave = function(data) {
                this.dailyRoutinesForm.setNewEventIds(data.dailyRoutine);
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
             * Opens the tale dialog for the npc
             */
            Npc.ViewModel.prototype.openTale = function() {
                if(!this.id())
                {
                    return;
                }

                window.location = "/Tale?npcId=" + this.id();
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


            /**
             * Opens the name generator settings
             */
            Npc.ViewModel.prototype.openNameGenSettings = function() {
                this.showNameGenSettingsDialog(true);
                this.nameGenTemplateError(false);
                this.nameGenTemplateErrorDescription("");
                this.nameGenDialogTemplate(this.nameGenTemplate());
            };

            /**
             * Saves the name generator settings
             */
            Npc.ViewModel.prototype.saveNameGenSettings = function() {
                if(this.nameGenTemplateError())
                {
                    return;
                }

                this.nameGenTemplate(this.nameGenDialogTemplate());
                this.closeNameGenDialog();
            };

            /**
             * Generates a sample name for the name gen settings
             */
            Npc.ViewModel.prototype.generateSampleNameGenName = function() {
                this.nameGenTemplateError(false);
                this.nameGenTemplateErrorDescription("");
                if(!this.nameGenDialogTemplate())
                {
                    this.nameGenSample("");
                    return;
                }

                try
                {
                    this.nameGenSample(this.createRandomName(this.nameGenDialogTemplate()));
                }
                catch(e)
                {
                    this.nameGenSample("");
                    this.nameGenTemplateError(true);
                    switch(e.message)
                    {
                    case "MISSING_CLOSING_BRACKET":
                        this.nameGenTemplateErrorDescription(GoNorth.Kortisto.Npc.Localization.NameGenMissingClosingBracket)
                        break;
                    case "UNBALANCED_BRACKETS":
                        this.nameGenTemplateErrorDescription(GoNorth.Kortisto.Npc.Localization.NameGenUnbalancedBrackets)
                        break;
                    case "UNEXPECTED_<_IN_INPUT":
                        this.nameGenTemplateErrorDescription(GoNorth.Kortisto.Npc.Localization.NameGenUnexpectedPointyBracketInInput)
                        break;
                    case "UNEXPECTED_)_IN_INPUT":
                        this.nameGenTemplateErrorDescription(GoNorth.Kortisto.Npc.Localization.NameGenUnexpectedRoundBracketInInput)
                        break;
                    default:
                        this.nameGenTemplateErrorDescription(GoNorth.Kortisto.Npc.Localization.NameGenUnknownError)
                    }
                }
            };

            /**
             * Closes the name generator settings
             */
            Npc.ViewModel.prototype.closeNameGenDialog = function() {
                this.showNameGenSettingsDialog(false);
            };


            /**
             * Generates a new name for the npc
             */
            Npc.ViewModel.prototype.generateName = function() {
                this.objectName(this.createRandomName(this.nameGenTemplate()));
            };
            
            /**
             * Creates a random name
             * 
             * @returns {string} Random Name 
             */
            Npc.ViewModel.prototype.createRandomName = function(template) {
                var generator = NameGen.compile(template);
                var name = generator.toString();

                // Capitalize first letter
                if(name && name.length > 0)
                {
                    name = name.charAt(0).toUpperCase() + name.slice(1);
                }

                return name;
            };

        }(Kortisto.Npc = Kortisto.Npc || {}));
    }(GoNorth.Kortisto = GoNorth.Kortisto || {}));
}(window.GoNorth = window.GoNorth || {}));