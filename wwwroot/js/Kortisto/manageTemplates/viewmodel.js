(function(GoNorth) {
    "use strict";
    (function(Kortisto) {
        (function(ManageTemplates) {

            // Page Size
            var pageSize = 50;

            /**
             * Manage Templates Management View Model
             * @class
             */
            ManageTemplates.ViewModel = function()
            {
                GoNorth.FlexFieldDatabase.ManageTemplates.BaseViewModel.apply(this, [ "KortistoApi", "/Kortisto/Npc" ]);
            };

            ManageTemplates.ViewModel.prototype = jQuery.extend({ }, GoNorth.FlexFieldDatabase.ManageTemplates.BaseViewModel.prototype);

        }(Kortisto.ManageTemplates = Kortisto.ManageTemplates || {}));
    }(GoNorth.Kortisto = GoNorth.Kortisto || {}));
}(window.GoNorth = window.GoNorth || {}));