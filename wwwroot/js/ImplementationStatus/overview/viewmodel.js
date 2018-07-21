(function(GoNorth) {
    "use strict";
    (function(ImplementationStatus) {
        (function(Overview) {

            /// List Type for npcs
            var listTypeNpc = 0;

            /// List Type for dialogs
            var listTypeDialog = 1;

            /// List Type for items
            var listTypeItem = 2;

            /// List Type for skills
            var listTypeSkill = 3;

            /// List Type for quests
            var listTypeQuest = 4;

            /// List Type for marker
            var listTypeMarker = 5;

            /**
             * Overview View Model
             * @param {object} nonLocalizedMarkerTypes Non Localized Marker Types
             * @param {object} markerTypes Marker Types
             * @class
             */
            Overview.ViewModel = function(nonLocalizedMarkerTypes, markerTypes)
            {
                this.markerTypes = markerTypes;

                this.compareDialog = new ImplementationStatus.CompareDialog.ViewModel();

                this.isLoading = new ko.observable(false);
                this.errorOccured = new ko.observable(false); 

                this.currentListToShow = new ko.observable(-1);
                this.isNpcListSelected = new ko.computed(function() {
                    return this.currentListToShow() == listTypeNpc;
                }, this);
                this.isDialogListSelected = new ko.computed(function() {
                    return this.currentListToShow() == listTypeDialog;
                }, this);
                this.isItemListSelected = new ko.computed(function() {
                    return this.currentListToShow() == listTypeItem;
                }, this);
                this.isSkillListSelected = new ko.computed(function() {
                    return this.currentListToShow() == listTypeSkill;
                }, this);
                this.isQuestListSelected = new ko.computed(function() {
                    return this.currentListToShow() == listTypeQuest;
                }, this);
                this.isMarkerListSelected = new ko.computed(function() {
                    return this.currentListToShow() == listTypeMarker;
                }, this);

                this.npcList = new Overview.ImplementationStatusNpcList(this.isLoading, this.errorOccured, this.compareDialog);
                this.dialogList = new Overview.ImplementationStatusDialogList(this.isLoading, this.errorOccured, this.compareDialog);
                this.itemList = new Overview.ImplementationStatusItemList(this.isLoading, this.errorOccured, this.compareDialog);
                this.skillList = new Overview.ImplementationStatusSkillList(this.isLoading, this.errorOccured, this.compareDialog);
                this.questList = new Overview.ImplementationStatusQuestList(this.isLoading, this.errorOccured, this.compareDialog);
                this.markerList = new Overview.ImplementationStatusMarkerList(nonLocalizedMarkerTypes, this.isLoading, this.errorOccured, this.compareDialog);

                // Select first list user has access to
                var existingListType = parseInt(GoNorth.Util.getParameterFromHash("listType"));
                var preSelected = false;
                if(!isNaN(existingListType))
                {
                    preSelected = this.selectListByType(existingListType);
                }

                if(!preSelected)
                {
                    this.selectFirstListWithRights();
                }
                
                var self = this;
                window.onhashchange = function() {
                    var listType = parseInt(GoNorth.Util.getParameterFromHash("listType"));
                    if(!isNaN(listType) && listType != self.currentListToShow()) {
                        self.selectListByType(listType);
                    }
                }
            };

            Overview.ViewModel.prototype = {
                /**
                 * Selects the npc list
                 */
                selectNpcList: function() {
                    this.setCurrentListToShow(listTypeNpc);
                    this.npcList.init();
                },

                /**
                 * Selects the dialog list
                 */
                selectDialogList: function() {
                    this.setCurrentListToShow(listTypeDialog);
                    this.dialogList.init();
                },

                /**
                 * Selects the item list
                 */
                selectItemList: function() {
                    this.setCurrentListToShow(listTypeItem);
                    this.itemList.init();
                },

                /**
                 * Selects the item list
                 */
                selectSkillList: function() {
                    this.setCurrentListToShow(listTypeSkill);
                    this.skillList.init();
                },

                /**
                 * Selects the quest list
                 */
                selectQuestList: function() {
                    this.setCurrentListToShow(listTypeQuest);
                    this.questList.init();
                },

                /**
                 * Selects the marker list
                 */
                selectMarkerList: function() {
                    this.setCurrentListToShow(listTypeMarker);
                    this.markerList.init();
                },


                /**
                 * Sets the current list to show
                 * 
                 * @param {number} listType List Type to select
                 */
                setCurrentListToShow: function(listType) {
                    this.currentListToShow(listType);
                    var hashValue = "#listType=" + listType;
                    if(window.location.hash)
                    {
                        window.location.hash = hashValue; 
                    }
                    else
                    {
                        window.location.replace(hashValue);
                    }
                },

                /**
                 * Selects the first list the user has access to
                 */
                selectFirstListWithRights: function() {
                    if(GoNorth.ImplementationStatus.Overview.hasKortistoRights)
                    {
                        this.selectNpcList();
                    }
                    else if(GoNorth.ImplementationStatus.Overview.hasTaleRights)
                    {
                        this.selectDialogList();
                    }
                    else if(GoNorth.ImplementationStatus.Overview.hasStyrRights)
                    {
                        this.selectItemList();
                    }
                    else if(GoNorth.ImplementationStatus.Overview.hasEvneRights)
                    {
                        this.selectSkillList();
                    }
                    else if(GoNorth.ImplementationStatus.Overview.hasAikaRights)
                    {
                        this.selectQuestList();
                    }
                    else if(GoNorth.ImplementationStatus.Overview.hasKartaRights)
                    {
                        this.selectMarkerList();
                    }
                },

                /**
                 * Selects a list type by the type
                 * 
                 * @param {number} listType List Type to select
                 * @returns {bool} true if the List can be selected, else false
                 */
                selectListByType: function(listType) {
                    if(GoNorth.ImplementationStatus.Overview.hasKortistoRights && listType == listTypeNpc)
                    {
                        this.selectNpcList();
                        return true;
                    }
                    else if(GoNorth.ImplementationStatus.Overview.hasTaleRights && listType == listTypeDialog)
                    {
                        this.selectDialogList();
                        return true;
                    }
                    else if(GoNorth.ImplementationStatus.Overview.hasStyrRights && listType == listTypeItem)
                    {
                        this.selectItemList();
                        return true;
                    }
                    else if(GoNorth.ImplementationStatus.Overview.hasEvneRights && listType == listTypeSkill)
                    {
                        this.selectSkillList();
                        return true;
                    }
                    else if(GoNorth.ImplementationStatus.Overview.hasAikaRights && listType == listTypeQuest)
                    {
                        this.selectQuestList();
                        return true;
                    }
                    else if(GoNorth.ImplementationStatus.Overview.hasKartaRights && listType == listTypeMarker)
                    {
                        this.selectMarkerList();
                        return true;
                    }

                    return false;
                }
            };

        }(ImplementationStatus.Overview = ImplementationStatus.Overview || {}));
    }(GoNorth.ImplementationStatus = GoNorth.ImplementationStatus || {}));
}(window.GoNorth = window.GoNorth || {}));