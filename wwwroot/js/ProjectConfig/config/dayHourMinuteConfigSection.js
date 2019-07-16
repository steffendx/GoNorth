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
                    jQuery.ajax("/api/ProjectConfigApi/GetMiscConfig").done(function(loadedConfigData) {
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
                    jQuery.ajax("/api/KortistoApi/GetNpcsWithDailyRoutineOutsideTimeRange").done(function(npcsOutsideRange) {
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
                    jQuery.ajax({ 
                        url: "/api/ProjectConfigApi/SaveMiscConfig", 
                        headers: GoNorth.Util.generateAntiForgeryHeader(),
                        data: JSON.stringify(postData), 
                        type: "POST",
                        contentType: "application/json"
                    }).done(function() {
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