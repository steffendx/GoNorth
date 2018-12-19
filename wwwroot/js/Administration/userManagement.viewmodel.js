(function(GoNorth) {
    "use strict";
    (function(Administration) {
        (function(UserManagement) {

            /**
             * Page Size
             */
            var pageSize = 50;

            /**
             * User Management View Model
             * @class
             */
            UserManagement.ViewModel = function()
            {
                this.availableRoles = new ko.observableArray();

                this.currentPage = new ko.observable(0);
                this.users = new ko.observableArray();
                this.hasMore = new ko.observable(false);

                this.isLoading = new ko.observable(false);
                this.prevLoading = new ko.observable(false);
                this.nextLoading = new ko.observable(false);

                this.dialogLoading = new ko.observable(false);

                this.showUserCreateDialog = new ko.observable(false);
                this.createName = new ko.observable();
                this.createEmail = new ko.observable();
                this.createPassword = new ko.observable();
                this.createPasswordRepeat = new ko.observable();
                this.createError = new ko.observable();

                this.showUpdateSecurityStampDialog = new ko.observable(false);
                this.userToUpdateSecurityStamp = null;
                this.updateSecurityStampErrorOccured = new ko.observable(false);

                this.showConfirmDeleteDialog = new ko.observable(false);
                this.userToDelete = null;
                this.deleteErrorOccured = new ko.observable(false);
                this.deleteErrorAdditionalDetails = new ko.observable("");

                this.showUserRolesDialog = new ko.observable(false);
                this.userToEdit = null;
                this.availableUserRoles = new ko.observableArray();
                this.selectedAvailableUserRoles = new ko.observableArray();
                this.assignedUserRoles = new ko.observableArray();
                this.selectedAssignedUserRoles = new ko.observableArray();
                this.roleError = new ko.observable();

                this.showConfirmEmailDialog = new ko.observable(false);
                this.userToConfirmEmail = null;
                this.confirmEmailErrorOccured = new ko.observable(false);

                this.errorOccured = new ko.observable(false);

                this.nextLoading(true);
                this.loadPage();
                this.loadAvailableRoles();
            };

            UserManagement.ViewModel.prototype = {
                /**
                 * Loads the available roles
                 */
                loadAvailableRoles: function() {
                    var self = this;
                    jQuery.ajax("/api/RoleApi/AvailableRoles").done(function(data) {
                        self.availableRoles(data);
                    }).fail(function() {
                        self.errorOccured(true);
                    });
                },

                /**
                 * Loads a page
                 */
                loadPage: function() {
                    var self = this;
                    this.errorOccured(false);
                    this.isLoading(true);
    
                    jQuery.ajax("/api/UserApi/Entries?start=" + (this.currentPage() * pageSize) + "&pageSize=" + pageSize).done(function(data) {
                        self.users(data.users);
                        self.hasMore(data.hasMore);

                        self.isLoading(false);
                        self.prevLoading(false);
                        self.nextLoading(false);
                    }).fail(function() {
                        self.errorOccured(true);
                        self.isLoading(false);
                        self.prevLoading(false);
                        self.nextLoading(false);
                    });
                },

                /**
                 * Loads the previous page
                 */
                prevPage: function() {
                    this.currentPage(this.currentPage() - 1);
                    this.prevLoading(true);

                    this.loadPage();
                },

                /**
                 * Loads the next page
                 */
                nextPage: function() {
                    this.currentPage(this.currentPage() + 1);
                    this.nextLoading(true);

                    this.loadPage();
                },


                /**
                 * Opens the create user dialog
                 */
                openCreateUserDialog: function() {
                    this.createName("");
                    this.createEmail("");
                    this.createPassword("");
                    this.createPasswordRepeat("");
                    this.createError("");
                    
                    GoNorth.Util.setupValidation("#gn-userForm");

                    this.showUserCreateDialog(true);
                },

                /**
                 * Closes the create user dialog
                 */
                closeCreateUserDialog: function() {
                    this.showUserCreateDialog(false);
                    this.dialogLoading(false);
                },

                /**
                 * Creates a user 
                 */
                createUser: function() {
                    if(!jQuery("#gn-userForm").valid())
                    {
                        return;
                    }

                    // Send Data
                    var requestUser = {
                        DisplayName: this.createName(),
                        Email: this.createEmail(),
                        Password: this.createPassword()
                    };

                    var self = this;
                    this.dialogLoading(true);
                    jQuery.ajax({ 
                        url: "/api/UserApi/CreateUser", 
                        headers: GoNorth.Util.generateAntiForgeryHeader(),
                        data: JSON.stringify(requestUser), 
                        type: "POST",
                        contentType: "application/json"
                    }).done(function(data) {
                        self.closeCreateUserDialog();
                        self.loadPage();
                    }).fail(function(xhr) {
                        self.dialogLoading(false);
                        self.createError(xhr.responseJSON && xhr.responseJSON.length > 0 ? xhr.responseJSON.join(", ") : GoNorth.Administration.UserManagement.Localization.ErrorOccured);
                    });
                },


                /**
                 * Opens the confirm update security stamp dialog
                 * 
                 * @param {user} user User to update
                 */
                openUpdateSecurityStampDialog: function(user) {
                    this.showUpdateSecurityStampDialog(true);
                    this.updateSecurityStampErrorOccured(false);
                    this.userToUpdateSecurityStamp = user;
                },

                /**
                 * Closes the confirm update security stamp dialog
                 */
                closeUpdateSecurityStampDialog: function() {
                    this.showUpdateSecurityStampDialog(false);
                    this.dialogLoading(false);
                    this.userToUpdateSecurityStamp = null;
                },

                /**
                 * Updates the security stamp for a user
                 */
                updateSecurityStampForUser: function() {
                    if(!this.userToUpdateSecurityStamp) {
                        return;
                    }

                    var self = this;
                    this.dialogLoading(true);
                    this.updateSecurityStampErrorOccured(false);
                    jQuery.ajax({ 
                        url: "/api/UserApi/UpdateSecurityStampForUser?id=" + this.userToUpdateSecurityStamp.id, 
                        headers: GoNorth.Util.generateAntiForgeryHeader(),
                        type: "POST"
                    }).done(function(data) {
                        self.closeUpdateSecurityStampDialog();
                        self.loadPage();
                    }).fail(function() {
                        self.dialogLoading(false);
                        self.updateSecurityStampErrorOccured(true);
                    });
                },


                /**
                 * Deletes a user
                 * 
                 * @param {user} user User to delete
                 */
                openDeleteUserDialog: function(user) {
                    this.showConfirmDeleteDialog(true);
                    this.deleteErrorOccured(false);
                    this.deleteErrorAdditionalDetails("");
                    this.userToDelete = user;
                },

                /**
                 * Closes the confirm delete dialog
                 */
                closeConfirmDeleteDialog: function() {
                    this.showConfirmDeleteDialog(false);
                    this.dialogLoading(false);
                    this.userToDelete = null;
                },

                /**
                 * Deletes the user
                 */
                deleteUser: function() {
                    if(!this.userToDelete) {
                        return;
                    }

                    var self = this;
                    this.dialogLoading(true);
                    this.deleteErrorOccured(false);
                    this.deleteErrorAdditionalDetails("");
                    jQuery.ajax({ 
                        url: "/api/UserApi/DeleteUser?id=" + this.userToDelete.id, 
                        headers: GoNorth.Util.generateAntiForgeryHeader(),
                        type: "DELETE"
                    }).done(function(data) {
                        self.closeConfirmDeleteDialog();
                        if(self.users().length <= 1 && self.currentPage() > 0) {
                            self.currentPage(self.currentPage() - 1);
                        }
                        self.loadPage();
                    }).fail(function(xhr) {
                        self.dialogLoading(false);
                        self.deleteErrorOccured(true);

                        // If user tries to delete himself a bad request (400) will be returned
                        if(xhr.status == 400 && xhr.responseText)
                        {
                            self.deleteErrorAdditionalDetails(xhr.responseText);
                        }
                    });
                },


                /**
                 * Opens the user role dialog
                 * 
                 * @param {object} user User to edit
                 */
                openUserRoleDialog: function(user) {
                    this.showUserRolesDialog(true);
                    this.userToEdit = user;

                    this.availableUserRoles.removeAll();
                    var availableRoles = this.availableRoles();
                    for(var curRole = 0; curRole < availableRoles.length; ++curRole)
                    {
                        this.availableUserRoles.push(availableRoles[curRole]);
                    }

                    if(user.roles.length > 0)
                    {
                        this.availableUserRoles.removeAll(user.roles);
                    }

                    this.assignedUserRoles.removeAll();
                    for(var curRole = 0; curRole < user.roles.length; ++curRole)
                    {
                        this.assignedUserRoles.push(user.roles[curRole]);
                    }
                },

                /**
                 * Adds the selected user roles to the user
                 */
                addSelectedUserRoles: function() {
                    var selectedRoles = this.selectedAvailableUserRoles();
                    this.availableUserRoles.removeAll(selectedRoles);
                    for(var curRole = 0; curRole < selectedRoles.length; ++curRole)
                    {
                        this.assignedUserRoles.push(selectedRoles[curRole]);
                    }
                },

                /**
                 * Removes the selected user roles
                 */
                removeSelectedUserRoles: function() {
                    var selectedRoles = this.selectedAssignedUserRoles();
                    this.assignedUserRoles.removeAll(selectedRoles);
                    for(var curRole = 0; curRole < selectedRoles.length; ++curRole)
                    {
                        if(this.availableRoles.indexOf(selectedRoles[curRole]) > -1)
                        {
                            this.availableUserRoles.push(selectedRoles[curRole]);
                        }
                    }
                },

                /**
                 * Closes the user roles dialog
                 */
                closeUserRolesDialog: function() {
                    this.showUserRolesDialog(false);
                    this.dialogLoading(false);
                    this.userToEdit = null;
                },

                /**
                 * Saves the user roles
                 */
                saveUserRoles: function() {
                    if(!this.userToEdit) {
                        return;
                    }

                    var userRoles = this.assignedUserRoles();
                    var self = this;
                    this.dialogLoading(true);
                    jQuery.ajax({ 
                        url: "/api/UserApi/SetUserRoles?id=" + this.userToEdit.id, 
                        headers: GoNorth.Util.generateAntiForgeryHeader(),
                        data: JSON.stringify(userRoles),
                        type: "POST",
                        contentType: "application/json"
                    }).done(function(data) {
                        self.closeUserRolesDialog();
                        self.loadPage();
                    }).fail(function(xhr) {
                        self.dialogLoading(false);
                        self.roleError(xhr.responseJSON.join(", "));
                    });
                },


                /**
                 * Opens the confirm email dialog for a user
                 * 
                 * @param {object} user User to confirm the email for
                 */
                openConfirmEmailDialog: function(user) {
                    this.showConfirmEmailDialog(true);
                    this.confirmEmailErrorOccured(false);
                    this.userToConfirmEmail = user;
                },

                /**
                 * Closes the confirm email dialog
                 */
                closeConfirmEmailDialog: function() {
                    this.showConfirmEmailDialog(false);
                    this.dialogLoading(false);
                    this.userToConfirmEmail = null;
                },

                /**
                 * Confirms the email for a user
                 */
                confirmEmailForUser: function() {
                    if(!this.userToConfirmEmail) {
                        return;
                    }

                    var self = this;
                    this.confirmEmailErrorOccured(false);
                    this.dialogLoading(true);
                    jQuery.ajax({ 
                        url: "/api/UserApi/ConfirmEmailForUser?id=" + this.userToConfirmEmail.id, 
                        headers: GoNorth.Util.generateAntiForgeryHeader(),
                        type: "POST"
                    }).done(function(data) {
                        self.closeConfirmEmailDialog();
                        self.loadPage();
                    }).fail(function() {
                        self.dialogLoading(false);
                        self.confirmEmailErrorOccured(true);
                    });
                },
            };

        }(Administration.UserManagement = Administration.UserManagement || {}));
    }(GoNorth.Administration = GoNorth.Administration || {}));
}(window.GoNorth = window.GoNorth || {}));