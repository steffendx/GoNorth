(function(GoNorth) {
    "use strict";
    (function(ProjectConfig) {
        (function(ConfigKeys) {

            /**
             * Config key for play an animation
             */
            ConfigKeys.PlayAnimationAction = "PlayAnimationAction";

            /**
             * Config key for setting the npc state
             */
            ConfigKeys.SetNpcStateAction = "SetNpcStateAction";

        }(ProjectConfig.ConfigKeys = ProjectConfig.ConfigKeys || {}));
    }(GoNorth.ProjectConfig = GoNorth.ProjectConfig || {}));
}(window.GoNorth = window.GoNorth || {}));