(function(GoNorth) {
    "use strict";
    (function(Styr) {
        (function(ManageTemplates) {

            // Page Size
            var pageSize = 50;

            /**
             * Manage Templates Management View Model
             * @class
             */
            ManageTemplates.ViewModel = function()
            {
                GoNorth.FlexFieldDatabase.ManageTemplates.BaseViewModel.apply(this, [ "StyrApi", "/Styr/Item" ]);
            };

            ManageTemplates.ViewModel.prototype = jQuery.extend({ }, GoNorth.FlexFieldDatabase.ManageTemplates.BaseViewModel.prototype);

        }(Styr.ManageTemplates = Styr.ManageTemplates || {}));
    }(GoNorth.Styr = GoNorth.Styr || {}));
}(window.GoNorth = window.GoNorth || {}));