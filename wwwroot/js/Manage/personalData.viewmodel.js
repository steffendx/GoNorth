(function(GoNorth) {
    "use strict";
    (function(Manage) {
        (function(PersonalData) {

            /**
             * Personal Data View Model
             * @class
             */
            PersonalData.ViewModel = function()
            {
                this.showConfirmDeleteDialog = new ko.observable();
            };

            PersonalData.ViewModel.prototype = {
                /**
                 * Opens the confirm delete dialog
                 */
                openConfirmDeleteDialog: function() {
                    this.showConfirmDeleteDialog(true);
                },

                /**
                 * Closes the confirm delete dialog
                 */
                closeConfirmDeleteDialog: function() {
                    this.showConfirmDeleteDialog(false);
                }
            };

        }(Manage.PersonalData = Manage.PersonalData || {}));
    }(GoNorth.Manage = GoNorth.Manage || {}));
}(window.GoNorth = window.GoNorth || {}));