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

            /// List Type for quests
            var listTypeQuest = 3;

            /// List Type for marker
            var listTypeMarker = 4;

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
                this.isQuestListSelected = new ko.computed(function() {
                    return this.currentListToShow() == listTypeQuest;
                }, this);
                this.isMarkerListSelected = new ko.computed(function() {
                    return this.currentListToShow() == listTypeMarker;
                }, this);

                this.npcList = new Overview.ImplementationStatusNpcList(this.isLoading, this.errorOccured, this.compareDialog);
                this.dialogList = new Overview.ImplementationStatusDialogList(this.isLoading, this.errorOccured, this.compareDialog);
                this.itemList = new Overview.ImplementationStatusItemList(this.isLoading, this.errorOccured, this.compareDialog);
                this.questList = new Overview.ImplementationStatusQuestList(this.isLoading, this.errorOccured, this.compareDialog);
                this.markerList = new Overview.ImplementationStatusMarkerList(nonLocalizedMarkerTypes, this.isLoading, this.errorOccured, this.compareDialog);

                // Select first list user has access to
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
                else if(GoNorth.ImplementationStatus.Overview.hasAikaRights)
                {
                    this.selectQuestList();
                }
                else if(GoNorth.ImplementationStatus.Overview.hasKartaRights)
                {
                    this.selectMarkerList();
                }
            };

            Overview.ViewModel.prototype = {
                /**
                 * Selects the npc list
                 */
                selectNpcList: function() {
                    this.currentListToShow(listTypeNpc);
                    this.npcList.init();
                },

                /**
                 * Selects the dialog list
                 */
                selectDialogList: function() {
                    this.currentListToShow(listTypeDialog);
                    this.dialogList.init();
                },

                /**
                 * Selects the item list
                 */
                selectItemList: function() {
                    this.currentListToShow(listTypeItem);
                    this.itemList.init();
                },

                /**
                 * Selects the quest list
                 */
                selectQuestList: function() {
                    this.currentListToShow(listTypeQuest);
                    this.questList.init();
                },

                /**
                 * Selects the marker list
                 */
                selectMarkerList: function() {
                    this.currentListToShow(listTypeMarker);
                    this.markerList.init();
                }
            };

        }(ImplementationStatus.Overview = ImplementationStatus.Overview || {}));
    }(GoNorth.ImplementationStatus = GoNorth.ImplementationStatus || {}));
}(window.GoNorth = window.GoNorth || {}));