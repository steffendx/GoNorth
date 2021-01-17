(function(GoNorth) {
    "use strict";
    (function(Home) {

            /**
             * Home View Model
             * @class
             */
            Home.ViewModel = function()
            {
                this.selectedProject = new ko.observable(GoNorth.Home.currentProject);
                this.projects = new ko.observableArray();

                this.isLoading = new ko.observable(false);
                this.errorOccured = new ko.observable(false);

                this.loadProjects();
            };

            Home.ViewModel.prototype = {
                /**
                 * Loads the projects
                 */
                loadProjects: function() {
                    this.isLoading(true);

                    var self = this;
                    GoNorth.HttpClient.get("/api/ProjectApi/Entries").done(function(data) {
                        self.isLoading(false);
                        self.projects(data);
                    }).fail(function() {
                        self.isLoading(false);
                        self.errorOccured(true);
                    });
                },

                /**
                 * Selects an project
                 * @param {object} project Project
                 */
                selectProject: function(project) {
                    var oldProjectName = this.selectedProject();

                    this.selectedProject(project.name);
                    this.isLoading(true);
                    this.errorOccured(false);

                    var self = this;
                    GoNorth.HttpClient.post("/api/ProjectApi/SetUserSelectedProject?projectId=" + encodeURIComponent(project.id), {}).done(function() {
                        self.isLoading(false);
                    }).fail(function() {
                        self.isLoading(false);
                        self.errorOccured(true);
                        self.selectedProject(oldProjectName);
                    });
                }
            };

    }(GoNorth.Home = GoNorth.Home || {}));
}(window.GoNorth = window.GoNorth || {}));