(function(GoNorth) {
    "use strict";
    (function(Administration) {
        (function(ProjectManagement) {

            /**
             * Project Management View Model
             * @class
             */
            ProjectManagement.ViewModel = function()
            {
                this.projects = new ko.observableArray();

                this.showConfirmDeleteDialog = new ko.observable(false);
                this.deleteErrorOccured = new ko.observable(false);
                this.deleteErrorAdditionalDetails = new ko.observable("");
                this.deleteProjectId = "";

                this.showProjectCreateEditDialog = new ko.observable(false);
                this.createEditName = new ko.observable();
                this.createEditIsDefault = new ko.observable();
                this.createEditDialogErrorOccured = new ko.observable(false);
                this.editProjectId = new ko.observable("");
                
                this.dialogLoading = new ko.observable(false);

                this.errorOccured = new ko.observable(false);

                this.loadProjects();
            };

            ProjectManagement.ViewModel.prototype = {
                /**
                 * Loads all projects
                 */
                loadProjects: function() {
                    var self = this;
                    jQuery.ajax("/api/ProjectApi/Entries").done(function(data) {
                        self.projects(data);
                    }).fail(function() {
                        self.errorOccured(true);
                    });
                },


                /**
                 * Opens the create project dialog
                 */
                openCreateProjectDialog: function() {
                    this.showProjectCreateEditDialog(true);
                    this.createEditName("");
                    this.createEditIsDefault(false);
                    this.resetSharedCreateEditDialog();
                    this.editProjectId("");
                },

                /**
                 * Opens the edit project dialog
                 * 
                 * @param {object} project Project to edit
                 */
                openEditProjectDialog: function(project) {
                    this.showProjectCreateEditDialog(true);
                    this.createEditName(project.name);
                    this.createEditIsDefault(project.isDefault);
                    this.resetSharedCreateEditDialog();
                    this.editProjectId(project.id);
                },

                /**
                 * Resets the shared create / edit dialog values
                 */
                resetSharedCreateEditDialog: function() {
                    this.createEditDialogErrorOccured(false);
                    this.dialogLoading(false);
                    GoNorth.Util.setupValidation("#gn-projectCreateEditForm");
                },

                /**
                 * Closes the create/edit project
                 */
                closeCreateEditProjectDialog: function() {
                    this.showProjectCreateEditDialog(false);
                    this.dialogLoading(false);
                },

                /**
                 * Saves the project
                 */
                saveProject: function() {
                    if(!jQuery("#gn-projectCreateEditForm").valid())
                    {
                        return;
                    }

                    // Send data
                    var requestProject = {
                        Name: this.createEditName(),
                        IsDefault: this.createEditIsDefault()
                    };

                    var url = "/api/ProjectApi/CreateProject";
                    if(this.editProjectId())
                    {
                        url = "/api/ProjectApi/UpdateProject?id=" + this.editProjectId();
                    }

                    var self = this;
                    this.dialogLoading(true);
                    jQuery.ajax({ 
                        url: url, 
                        headers: GoNorth.Util.generateAntiForgeryHeader(),
                        data: JSON.stringify(requestProject), 
                        type: "POST",
                        contentType: "application/json"
                    }).done(function(data) {
                        self.closeCreateEditProjectDialog();
                        self.loadProjects();
                    }).fail(function(xhr) {
                        self.dialogLoading(false);
                        self.createEditDialogErrorOccured(true);
                    });
                },


                /**
                 * Opens the delete project dialog
                 * 
                 * @param {object} project Project to delete
                 */
                openDeleteProjectDialog: function(project) {
                    this.showConfirmDeleteDialog(true);
                    this.deleteErrorOccured(false);
                    this.deleteErrorAdditionalDetails("");
                    this.dialogLoading(false);
                    this.deleteProjectId = project.id;
                },

                /**
                 * Closes the confirm delete dialog
                 */
                closeConfirmDeleteDialog: function() {
                    this.showConfirmDeleteDialog(false);
                    this.dialogLoading(false);
                    this.deleteProjectId = "";
                },

                /**
                 * Deletes the project for which the dialog was shown
                 */
                deleteProject: function() {
                    var self = this;
                    this.dialogLoading(true);
                    jQuery.ajax({ 
                        url: "/api/ProjectApi/DeleteProject?id=" + this.deleteProjectId, 
                        headers: GoNorth.Util.generateAntiForgeryHeader(),
                        type: "DELETE"
                    }).done(function(data) {
                        self.closeConfirmDeleteDialog();
                        self.loadProjects();
                    }).fail(function(xhr) {
                        self.dialogLoading(false);
                        self.deleteErrorOccured(true);

                        // If project is related to anything that prevents deleting a bad request (400) will be returned
                        if(xhr.status == 400 && xhr.responseText)
                        {
                            self.deleteErrorAdditionalDetails(xhr.responseText);
                        }
                    });
                }
            };

        }(Administration.ProjectManagement = Administration.ProjectManagement || {}));
    }(GoNorth.Administration = GoNorth.Administration || {}));
}(window.GoNorth = window.GoNorth || {}));