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
                    jQuery.ajax("/api/ProjectConfigApi/GetJsonConfigByKey?configKey=" + encodeURIComponent(this.configKey)).done(function(loadedConfigData) {
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
                    jQuery.ajax({ 
                        url: "/api/ProjectConfigApi/SaveJsonConfigByKey?configKey=" + encodeURIComponent(this.configKey), 
                        headers: GoNorth.Util.generateAntiForgeryHeader(),
                        data: JSON.stringify(configLines), 
                        type: "POST",
                        contentType: "application/json"
                    }).done(function() {
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