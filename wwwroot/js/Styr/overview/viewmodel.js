(function(GoNorth) {
    "use strict";
    (function(Styr) {
        (function(Overview) {

            /**
             * Overview Management View Model
             * @class
             */
            Overview.ViewModel = function()
            {
                GoNorth.FlexFieldDatabase.Overview.BaseViewModel.apply(this, [ "StyrApi", "/Styr/Item" ]);
            };

            Overview.ViewModel.prototype = jQuery.extend({ }, GoNorth.FlexFieldDatabase.Overview.BaseViewModel.prototype);

        }(Styr.Overview = Styr.Overview || {}));
    }(GoNorth.Styr = GoNorth.Styr || {}));
}(window.GoNorth = window.GoNorth || {}));