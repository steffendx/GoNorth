(function(GoNorth) {
    "use strict";
    (function(Manage) {
        (function(Preferences) {

            /**
             * Preferences View Model
             * @class
             */
            Preferences.ViewModel = function()
            {
                this.themes = ace.require("ace/ext/themelist").themes;
                this.codeEditorTheme = new ko.observable(null);
                
                this.isLoading = new ko.observable(false);
                this.errorOccured = new ko.observable(false);

                this.loadUserPreferences();
            };

            Preferences.ViewModel.prototype = {
                /**
                 * Loads the user preferences
                 */
                loadUserPreferences: function() {
                    this.isLoading(true);
                    this.errorOccured(false);
                    var self = this;
                    GoNorth.HttpClient.get("/api/UserPreferencesApi/GetUserPreferences").done(function(userPreferences) {
                        for(var curTheme = 0; curTheme < self.themes.length; ++curTheme)
                        {
                            if(self.themes[curTheme].theme == userPreferences.codeEditorTheme)
                            {
                                self.codeEditorTheme(self.themes[curTheme]);
                                break;
                            }
                        }
                        
                        self.isLoading(false);
                    }).fail(function() {
                        self.isLoading(false);
                        self.errorOccured(true);
                    });
                },

                /**
                 * Saves the user preferences
                 */
                save: function() {
                    if(!this.codeEditorTheme)
                    {
                        this.errorOccured(true);
                        return;
                    }

                    var userPreferences = {
                        codeEditorTheme: this.codeEditorTheme().theme
                    };

                    this.isLoading(true);
                    this.errorOccured(false);
                    var self = this;
                    GoNorth.HttpClient.post("/api/UserPreferencesApi/SaveUserPreferences", userPreferences).done(function(userPreferences) {
                        self.isLoading(false);
                    }).fail(function() {
                        self.isLoading(false);
                        self.errorOccured(true);
                    });
                }
            };

        }(Manage.Preferences = Manage.Preferences || {}));
    }(GoNorth.Manage = GoNorth.Manage || {}));
}(window.GoNorth = window.GoNorth || {}));