(function(GoNorth) {
    "use strict";
    (function(Tale) {
        (function(Config) {

            /**
             * Config View Model
             * @class
             */
            Config.ViewModel = function()
            {
                this.animationConfigSection = new Config.TextAreaConfigSection(Tale.ConfigKeys.PlayAnimationAction, Config.Localization.AnimationConfigSectionHeader, Config.Localization.AnimationConfigSectionDescription);
                this.stateConfigSection = new Config.TextAreaConfigSection(Tale.ConfigKeys.SetNpcStateAction, Config.Localization.StateConfigSectionHeader, Config.Localization.StateConfigSectionDescription);

                this.isReadonly = new ko.observable(false);
                this.lockedByUser = new ko.observable("");
                this.errorOccured = new ko.observable(false);

                this.acquireLock();
            };

            Config.ViewModel.prototype = {
                /**
                 * Acquires a lock
                 */
                acquireLock: function() {
                    var self = this;
                    GoNorth.LockService.acquireLock("TaleConfig", "").done(function(isLocked, lockedUsername) { 
                        if(isLocked)
                        {
                            self.isReadonly(true);
                            self.lockedByUser(lockedUsername);
                        }
                    }).fail(function() {
                        self.errorOccured(true);
                        self.isReadonly(true);
                    });
                }
            };

        }(Tale.Config = Tale.Config || {}));
    }(GoNorth.Tale = GoNorth.Tale || {}));
}(window.GoNorth = window.GoNorth || {}));