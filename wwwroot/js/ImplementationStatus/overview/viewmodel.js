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
             * @param {object} markerTypes Marker Types
             * @class
             */
            Overview.ViewModel = function(markerTypes)
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
                this.markerList = new Overview.ImplementationStatusMarkerList(this.isLoading, this.errorOccured, this.compareDialog);

                // Select first list user has access to
                var existingListType = parseInt(GoNorth.Util.getParameterFromUrl("listType"));
                var existingPage = parseInt(GoNorth.Util.getParameterFromUrl("page"));
                var compareId = GoNorth.Util.getParameterFromUrl("compareId");
                var preSelected = false;
                if(!isNaN(existingListType))
                {
                    preSelected = this.selectListByType(existingListType, existingPage, compareId);
                }

                if(!preSelected)
                {
                    this.selectFirstListWithRights();
                }
                
                var self = this;
                GoNorth.Util.onUrlParameterChanged(function() {
                    var listType = parseInt(GoNorth.Util.getParameterFromUrl("listType"));
                    if(!isNaN(listType) && listType != self.currentListToShow()) {
                        self.selectListByType(listType, null, null);
                    }
                });
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
                    var parameterValue = "listType=" + listType;
                    if(window.location.search)
                    {
                        GoNorth.Util.setUrlParameters(parameterValue);
                    }
                    else
                    {
                        GoNorth.Util.replaceUrlParameters(parameterValue);
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
                 * @param {number} page Page to select
                 * @param {string} compareId Id of the object to open the compare dialog for
                 * @returns {bool} true if the List can be selected, else false
                 */
                selectListByType: function(listType, page, compareId) {
                    if(GoNorth.ImplementationStatus.Overview.hasKortistoRights && listType == listTypeNpc)
                    {
                        this.setPageFromUrl(this.npcList, page);
                        this.setInitialCompareIdFromUrl(this.npcList, compareId);
                        this.selectNpcList();
                        return true;
                    }
                    else if(GoNorth.ImplementationStatus.Overview.hasTaleRights && listType == listTypeDialog)
                    {
                        this.setPageFromUrl(this.dialogList, page);
                        this.setInitialCompareIdFromUrl(this.dialogList, compareId);
                        this.selectDialogList();
                        return true;
                    }
                    else if(GoNorth.ImplementationStatus.Overview.hasStyrRights && listType == listTypeItem)
                    {
                        this.setPageFromUrl(this.itemList, page);
                        this.setInitialCompareIdFromUrl(this.itemList, compareId);
                        this.selectItemList();
                        return true;
                    }
                    else if(GoNorth.ImplementationStatus.Overview.hasEvneRights && listType == listTypeSkill)
                    {
                        this.setPageFromUrl(this.skillList, page);
                        this.setInitialCompareIdFromUrl(this.skillList, compareId);
                        this.selectSkillList();
                        return true;
                    }
                    else if(GoNorth.ImplementationStatus.Overview.hasAikaRights && listType == listTypeQuest)
                    {
                        this.setPageFromUrl(this.questList, page);
                        this.setInitialCompareIdFromUrl(this.questList, compareId);
                        this.selectQuestList();
                        return true;
                    }
                    else if(GoNorth.ImplementationStatus.Overview.hasKartaRights && listType == listTypeMarker)
                    {
                        this.setPageFromUrl(this.markerList, page);
                        this.setInitialCompareIdFromUrl(this.markerList, compareId);
                        this.selectMarkerList();
                        return true;
                    }

                    return false;
                },

                /**
                 * Sets the page from url
                 * 
                 * @param {object} list List to update
                 * @param {number} page Page
                 */
                setPageFromUrl: function(list, page) {
                    if(list == null || isNaN(page) || page == null)
                    {
                        return;
                    }

                    list.setCurrentPage(page);
                },

                /**
                 * Sets the initial compare id
                 * 
                 * @param {object} list List to update
                 * @param {number} compareId Compare Id
                 */
                setInitialCompareIdFromUrl: function(list, compareId) {
                    if(list == null || compareId == null)
                    {
                        return;
                    }

                    list.setInitialCompareId(compareId);
                }
            };

        }(ImplementationStatus.Overview = ImplementationStatus.Overview || {}));
    }(GoNorth.ImplementationStatus = GoNorth.ImplementationStatus || {}));
}(window.GoNorth = window.GoNorth || {}));