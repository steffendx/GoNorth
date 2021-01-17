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
(function(GoNorth) {
    "use strict";
    (function(ProjectConfig) {
        (function(Config) {

            /**
             * Textarea Config View Model
             * @param {string} configKey Configurationkey
             * @param {string} title Title of the section
             * @param {string} description Description of the section
             * @class
             */
            Config.TextAreaConfigSection = function(configKey, title, description)
            {
                this.configKey = configKey;
                this.title = title;
                this.description = description;

                this.configData = new ko.observable();

                this.isLoading = new ko.observable(false);
                this.errorOccured = new ko.observable(false);

                this.isExpanded = new ko.observable(false);

                this.loadConfig();
            };

            Config.TextAreaConfigSection.prototype = {
                /**
                 * Loads the config
                 */
                loadConfig: function() {
                    var self = this;
                    this.isLoading(true);
                    this.errorOccured(false);
                    GoNorth.HttpClient.get("/api/ProjectConfigApi/GetJsonConfigByKey?configKey=" + encodeURIComponent(this.configKey)).done(function(loadedConfigData) {
                        self.isLoading(false);
                        
                        if(!loadedConfigData)
                        {
                            self.configData("");
                            return;
                        }
                        
                        try
                        {
                            var configData = "";
                            var configLines = JSON.parse(loadedConfigData)
                            for(var curLine = 0; curLine < configLines.length; ++curLine)
                            {
                                if(configData)
                                {
                                    configData += "\n";
                                }

                                configData += configLines[curLine];
                            }
                            self.configData(configData);
                        }
                        catch(e)
                        {
                            self.errorOccured(true);
                        }
                    }).fail(function() {
                        self.isLoading(false);
                        self.errorOccured(true);
                    });
                },

                /**
                 * Saves the config
                 */
                saveConfig: function() {
                    var configLines = [];
                    if(this.configData())
                    {
                        configLines = this.configData().split("\n");
                    }

                    this.isLoading(true);
                    this.errorOccured(false);
                    var self = this;
                    GoNorth.HttpClient.post("/api/ProjectConfigApi/SaveJsonConfigByKey?configKey=" + encodeURIComponent(this.configKey), configLines).done(function() {
                        self.isLoading(false);
                    }).fail(function() {
                        self.isLoading(false);
                        self.errorOccured(true);
                    });
                },

                /**
                 * Toggles the visibility of the section
                 */
                toggleVisibility: function() {
                    this.isExpanded(!this.isExpanded());
                }
            };

        }(ProjectConfig.Config = ProjectConfig.Config || {}));
    }(GoNorth.ProjectConfig = GoNorth.ProjectConfig || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(ProjectConfig) {
        (function(Config) {

            /**
             * Hours and Minutes per Day Config section
             * @class
             */
            Config.DayHourMinuteConfigSection = function()
            {
                var self = this;
                this.hoursPerDay = new ko.observable(24);
                this.hoursPerDay.subscribe(function(newValue) {
                    if(newValue <= 0) {
                        self.hoursPerDay(1);
                    }
                });
                this.minutesPerHour = new ko.observable(60);
                this.minutesPerHour.subscribe(function(newValue) {
                    if(newValue <= 0) {
                        self.minutesPerHour(1);
                    }
                });

                this.isLoading = new ko.observable(false);
                this.errorOccured = new ko.observable(false);

                this.isExpanded = new ko.observable(false);

                this.npcsOutsideTimeRange = new ko.observableArray();
                this.showNpcsOutsideSpecifiedTimeSpanDialog = new ko.observable(false);

                this.loadConfig();
                this.checkNpcOutsideTimeRange();
            };

            Config.DayHourMinuteConfigSection.prototype = {
                /**
                 * Loads the config
                 */
                loadConfig: function() {
                    var self = this;
                    this.isLoading(true);
                    this.errorOccured(false);
                    GoNorth.HttpClient.get("/api/ProjectConfigApi/GetMiscConfig").done(function(loadedConfigData) {
                        self.isLoading(false);
                        self.hoursPerDay(loadedConfigData.hoursPerDay);
                        self.minutesPerHour(loadedConfigData.minutesPerHour);
                    }).fail(function() {
                        self.isLoading(false);
                        self.errorOccured(true);
                    });
                },

                /**
                 * Checks if npcs outside of the time range exist
                 */
                checkNpcOutsideTimeRange: function() {
                    if(!GoNorth.ProjectConfig.Config.hasKortistoRights) {
                        return;
                    }

                    var self = this;
                    GoNorth.HttpClient.get("/api/KortistoApi/GetNpcsWithDailyRoutineOutsideTimeRange").done(function(npcsOutsideRange) {
                        self.npcsOutsideTimeRange(npcsOutsideRange);
                    }).fail(function() {
                        self.errorOccured(true);
                        self.npcsOutsideTimeRange.removeAll();
                    });
                },

                /**
                 * Saves the config
                 */
                saveConfig: function() {
                    if(this.hoursPerDay() <= 0 || this.minutesPerHour() <= 0)
                    {
                        this.errorOccured(true);
                        return;
                    }

                    var postData = {
                        hoursPerDay: this.hoursPerDay(),
                        minutesPerHour: this.minutesPerHour()
                    };

                    this.isLoading(true);
                    this.errorOccured(false);
                    var self = this;
                    GoNorth.HttpClient.post("/api/ProjectConfigApi/SaveMiscConfig", postData).done(function() {
                        self.isLoading(false);
                        self.checkNpcOutsideTimeRange();
                    }).fail(function() {
                        self.isLoading(false);
                        self.errorOccured(true);
                    });
                },

                /**
                 * Toggles the visibility of the section
                 */
                toggleVisibility: function() {
                    this.isExpanded(!this.isExpanded());
                },


                /**
                 * Opens the dialog that shows the npcs with a daily routine outside of the given timespan
                 */
                openNpcsOutsideSpecifiedTimeSpanDialog: function() {
                    this.showNpcsOutsideSpecifiedTimeSpanDialog(true);
                },

                /**
                 * Closes the dialog that shows the npcs with a daily routine outside of the given timespan
                 */
                closeNpcsOutsideSpecifiedTimeSpanDialog: function() {
                    this.showNpcsOutsideSpecifiedTimeSpanDialog(false);
                },

                /**
                 * Builds a link to open an npc
                 * @param {object} npc Npc to open
                 * @returns {string} Url
                 */
                buildNpcLink: function(npc) {
                    return "/Kortisto/Npc?id=" + npc.id;
                }
            };

        }(ProjectConfig.Config = ProjectConfig.Config || {}));
    }(GoNorth.ProjectConfig = GoNorth.ProjectConfig || {}));
}(window.GoNorth = window.GoNorth || {}));
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