(function(GoNorth) {
    "use strict";
    (function(Evne) {
        (function(ManageTemplates) {

            // Page Size
            var pageSize = 50;

            /**
             * Manage Templates Management View Model
             * @class
             */
            ManageTemplates.ViewModel = function()
            {
                GoNorth.FlexFieldDatabase.ManageTemplates.BaseViewModel.apply(this, [ "EvneApi", "/Evne/Skill" ]);
            };

            ManageTemplates.ViewModel.prototype = jQuery.extend({ }, GoNorth.FlexFieldDatabase.ManageTemplates.BaseViewModel.prototype);

        }(Evne.ManageTemplates = Evne.ManageTemplates || {}));
    }(GoNorth.Evne = GoNorth.Evne || {}));
}(window.GoNorth = window.GoNorth || {}));