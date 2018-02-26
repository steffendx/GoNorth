(function(GoNorth) {
    "use strict";
    (function(Kortisto) {
        (function(Overview) {

            /**
             * Overview Management View Model
             * @class
             */
            Overview.ViewModel = function()
            {
                GoNorth.FlexFieldDatabase.Overview.BaseViewModel.apply(this, [ "KortistoApi", "/Kortisto/Npc" ]);
            };

            Overview.ViewModel.prototype = jQuery.extend({ }, GoNorth.FlexFieldDatabase.Overview.BaseViewModel.prototype);

        }(Kortisto.Overview = Kortisto.Overview || {}));
    }(GoNorth.Kortisto = GoNorth.Kortisto || {}));
}(window.GoNorth = window.GoNorth || {}));