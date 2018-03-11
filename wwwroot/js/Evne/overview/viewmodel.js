(function(GoNorth) {
    "use strict";
    (function(Evne) {
        (function(Overview) {

            /**
             * Overview Management View Model
             * @class
             */
            Overview.ViewModel = function()
            {
                GoNorth.FlexFieldDatabase.Overview.BaseViewModel.apply(this, [ "EvneApi", "/Evne/Skill" ]);
            };

            Overview.ViewModel.prototype = jQuery.extend({ }, GoNorth.FlexFieldDatabase.Overview.BaseViewModel.prototype);

        }(Evne.Overview = Evne.Overview || {}));
    }(GoNorth.Evne = GoNorth.Evne || {}));
}(window.GoNorth = window.GoNorth || {}));