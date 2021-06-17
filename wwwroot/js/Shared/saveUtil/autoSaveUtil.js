(function(GoNorth) {
    "use strict";
    (function(SaveUtil) {

        /**
         * Prepares a save hotkey
         * @param {function} callback Callback function for saving
         */
         SaveUtil.setupSaveHotkey = function(callback) {
            jQuery(document).on("keydown", "*", "ctrl+s", function(event) {
                event.stopPropagation();
                event.preventDefault();
                callback();
            });
        };

    }(GoNorth.SaveUtil = GoNorth.SaveUtil || {}));
}(window.GoNorth = window.GoNorth || {}));