(function(GoNorth) {
    "use strict";
    (function(ProjectConfig) {
        (function(Config) {

            /**
             * Config View Model
             * @class
             */
            Config.ViewModel = function()
            {
                this.animationConfigSection = new Config.TextAreaConfigSection(ProjectConfig.ConfigKeys.PlayAnimationAction, Config.Localization.AnimationConfigSectionHeader, Config.Localization.AnimationConfigSectionDescription);
                this.stateConfigSection = new Config.TextAreaConfigSection(ProjectConfig.ConfigKeys.SetNpcStateAction, Config.Localization.StateConfigSectionHeader, Config.Localization.StateConfigSectionDescription);
                this.dayHourMinuteConfigSection = new Config.DayHourMinuteConfigSection();

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
                    GoNorth.LockService.acquireLock("ProjectConfig", "Config", true).done(function(isLocked, lockedUsername) { 
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

        }(ProjectConfig.Config = ProjectConfig.Config || {}));
    }(GoNorth.ProjectConfig = GoNorth.ProjectConfig || {}));
}(window.GoNorth = window.GoNorth || {}));