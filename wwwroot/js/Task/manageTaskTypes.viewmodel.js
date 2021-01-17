(function (GoNorth) {
    "use strict";
    (function (BindingHandlers) {

        if (typeof ko !== "undefined") {
            /**
             * Colorpicker Binding Handler
             */
            ko.bindingHandlers.colorpicker = {
                init: function (element, valueAccessor) {
                    jQuery(element).colorpicker({
                        format: "hex"
                    });

                    var value = valueAccessor();
                    if (ko.isObservable(value)) {
                        jQuery(element).on('changeColor', function (event) {
                            value(event.color.toHex());
                        });
                    }
                },
                update: function (element, valueAccessor) {
                    var newColor = ko.utils.unwrapObservable(valueAccessor());
                    jQuery(element).colorpicker("setValue", newColor);
                }
            }
        }

    }(GoNorth.BindingHandlers = GoNorth.BindingHandlers || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(Task) {
        (function(ManageTaskTypes) {

            /// Regex to check for a valid hex color
            var hexColorRegex = /#[0-9a-fA-F]{6}/i;

            /**
             * Task type list
             * 
             * @param {string} idPostfix Postfix for all ids to have unique ids
             * @param {string} title Title of the list
             * @param {string} createDialogTitle Title of the create dialog
             * @param {string} editDialogTitle Title of the edit dialog
             * @param {string} createNewButtonLabel Label for the create new button
             * @param {string} taskWithoutTypeExistsText Text to show a hint if tasks without a type exist
             * @param {string} loadingApiFunction Name of the api function to load the entries
             * @param {string} anyTaskWithOutTypeApiFunction Name of the api function that checks if task types exist without 
             * @param {string} createApiFunction Name of the api function to create an entry
             * @param {string} updateApiFunction Name of the api function to update an entry
             * @param {string} deleteApiFunction Name of the api function to delete an entry
             * @param {string} lockCategory Name of the lock category
             * @class
             */
            ManageTaskTypes.TaskTypeList = function(idPostfix, title, createDialogTitle, editDialogTitle, createNewButtonLabel, taskWithoutTypeExistsText, loadingApiFunction, anyTaskWithOutTypeApiFunction, createApiFunction, updateApiFunction, deleteApiFunction, lockCategory)
            {
                this.idPostfix = idPostfix;
                this.title = title;
                this.createDialogTitle = createDialogTitle;
                this.editDialogTitle = editDialogTitle;
                this.createNewButtonLabel = createNewButtonLabel;
                this.taskWithoutTypeExistsText = taskWithoutTypeExistsText;
                this.loadingApiFunction = loadingApiFunction;
                this.anyTaskWithOutTypeApiFunction = anyTaskWithOutTypeApiFunction;
                this.createApiFunction = createApiFunction;
                this.updateApiFunction = updateApiFunction;
                this.deleteApiFunction = deleteApiFunction;
                this.lockCategory = lockCategory;

                this.taskTypes = new ko.observableArray();

                this.isExpanded = new ko.observable(true);
                
                this.showCreateEditTaskTypeDialog = new ko.observable(false);
                this.isEditingTaskType = new ko.observable(false);
                this.createEditTaskTypeDialogTitle = new ko.observable(false);
                this.createEditTaskTypeName = new ko.observable("");
                this.createEditTaskTypeColor = new ko.observable("");
                this.createEditTaskTypeIsDefault = new ko.observable(false);
                this.createEditTaskShowColorValidationError = new ko.observable(false);
                this.taskTypeToEdit = null;

                this.showDeleteTaskTypeDialog = new ko.observable(false);
                this.taskTypeToDelete = new ko.observable(null);
                this.taskTypeToRemapDelete = new ko.observable(null);
                this.taskTypesForRemapping = new ko.pureComputed(function() {
                    var taskTypes = this.taskTypes();
                    var taskTypeToDelete = this.taskTypeToDelete();
                    if(!taskTypeToDelete)
                    {
                        return taskTypes;
                    }

                    var filteredTypes = [];
                    for(var curType = 0; curType < taskTypes.length; ++curType)
                    {
                        if(taskTypes[curType].id != taskTypeToDelete.id)
                        {
                            filteredTypes.push(taskTypes[curType]);
                        }
                    }

                    return filteredTypes;
                }, this);
                this.disableDeleteButton = new ko.pureComputed(function() {
                    var isLoading = this.isLoading();
                    var taskTypeToRemapDelete = this.taskTypeToRemapDelete();
                    var taskTypesForRemapping = this.taskTypesForRemapping();
                    var isDialogLocked = this.isDialogLocked();
                    return isDialogLocked || isLoading || (!taskTypeToRemapDelete && taskTypesForRemapping.length > 0);
                }, this);

                this.anyTaskWithoutType = new ko.observable(false);

                this.isDialogLocked = new ko.observable(false);
                this.dialogLockedByUser = new ko.observable("");

                var self = this;
                this.showCreateEditTaskTypeDialog.subscribe(function(newValue) {
                    if(!newValue)
                    {
                        self.releaseLock();
                    }
                });
                this.showDeleteTaskTypeDialog.subscribe(function(newValue) {
                    if(!newValue)
                    {
                        self.releaseLock();
                    }
                });

                this.isLoading = new ko.observable(false);
                this.errorOccured = new ko.observable(false);
            };

            ManageTaskTypes.TaskTypeList.prototype = {
                /**
                 * Toggles the visibility
                 */
                toogleVisibility: function() {
                    this.isExpanded(!this.isExpanded());
                },

                /**
                 * Loads the types
                 */
                loadTypes: function() {
                    this.errorOccured(false);
                    this.isLoading(true);
                    var self = this;
                    GoNorth.HttpClient.get("/api/TaskApi/" + this.loadingApiFunction).done(function(data) {
                        var loadedTypes = [];

                        // Ignore default task types
                        for(var curType = 0; curType < data.length; ++curType)
                        {
                            if(data[curType].id)
                            {
                                loadedTypes.push(data[curType]);
                            }
                        }
                        self.taskTypes(loadedTypes);
                        self.isLoading(false);
                    }).fail(function() {
                        self.errorOccured(true);
                        self.isLoading(false);
                    });
                },

                /**
                 * Loads the types
                 */
                loadAnyTaskWithoutType: function() {
                    var self = this;
                    GoNorth.HttpClient.get("/api/TaskApi/" + this.anyTaskWithOutTypeApiFunction).done(function(data) {
                        self.anyTaskWithoutType(data);
                    }).fail(function() {
                        self.errorOccured(true);
                    });
                },
                


                /**
                 * Opens the new task type dialog
                 */
                openNewTaskTypeDialog: function() {
                    this.isEditingTaskType(false);
                    this.createEditTaskTypeDialogTitle(this.createDialogTitle);
                    this.createEditTaskTypeName("");
                    this.createEditTaskTypeColor("#FFFFFF");
                    this.createEditTaskTypeIsDefault(false);
                    this.createEditTaskShowColorValidationError(false);
                    this.taskTypeToEdit = null;

                    this.openSharedCreateEditTaskTypeDialog();

                    this.releaseLock();
                },

                /**
                 * Opens the edit task type dialog
                 * @param {object} taskType Task type to edit
                 */
                openEditTaskTypeDialog: function(taskType) {
                    this.isEditingTaskType(true);
                    this.createEditTaskTypeDialogTitle(this.editDialogTitle);
                    this.createEditTaskTypeName(taskType.name);
                    this.createEditTaskTypeColor(taskType.color);
                    this.createEditTaskTypeIsDefault(taskType.isDefault);
                    this.createEditTaskShowColorValidationError(!hexColorRegex.test(taskType.color));
                    this.taskTypeToEdit = taskType;

                    this.openSharedCreateEditTaskTypeDialog();

                    this.acquireLock(taskType.id);
                },

                /**
                 * Sets the shared values for opening the create edit task type dialog
                 */
                openSharedCreateEditTaskTypeDialog: function() {
                    this.showCreateEditTaskTypeDialog(true);
                    GoNorth.Util.setupValidation("#gn-taskTypeCreateEditForm" + this.idPostfix);
                },

                /**
                 * Saves the task type
                 */
                saveTaskType: function() {
                    // validate data
                    var colorIsInvalid = false;
                    if(!hexColorRegex.test(this.createEditTaskTypeColor()))
                    {
                        colorIsInvalid = true;
                    }

                    this.createEditTaskShowColorValidationError(colorIsInvalid);
                    if(!jQuery("#gn-taskTypeCreateEditForm" + this.idPostfix).valid() || colorIsInvalid)
                    {
                        return;
                    }

                    // Save task type
                    var url = "/api/TaskApi/" + this.createApiFunction;
                    if(this.taskTypeToEdit)
                    {
                        url = "/api/TaskApi/" + this.updateApiFunction + "?id=" + this.taskTypeToEdit.id;
                    }

                    var request = {
                        name: this.createEditTaskTypeName(),
                        color: this.createEditTaskTypeColor(),
                        isDefault: this.createEditTaskTypeIsDefault()
                    };

                    this.errorOccured(false);
                    this.isLoading(true);
                    var self = this;
                    GoNorth.HttpClient.post(url, request).done(function() {
                        self.isLoading(false);
                        self.loadTypes();
                        self.cancelCreateEditTaskTypeDialog();
                    }).fail(function() {
                        self.isLoading(false);
                        self.errorOccured(true);
                    });
                },

                /**
                 * Cancels the task type dialog
                 */
                cancelCreateEditTaskTypeDialog: function() {
                    this.showCreateEditTaskTypeDialog(false);
                },


                /**
                 * Opens the delete task type dialog
                 * @param {object} taskType Task type to delete
                 */
                openDeleteTaskTypeDialog: function(taskType) {
                    this.taskTypeToDelete(taskType);
                    this.taskTypeToRemapDelete(null);
                    this.showDeleteTaskTypeDialog(true);

                    this.acquireLock(taskType.id);
                },
                
                /**
                 * Deletes a task type
                 */
                deleteTaskType: function()  {
                    var url = "/api/TaskApi/" + this.deleteApiFunction + "?id=" + this.taskTypeToDelete().id;
                    if(this.taskTypeToRemapDelete())
                    {
                        url +=  "&newTaskTypeId=" + this.taskTypeToRemapDelete();
                    }

                    var self = this;
                    this.isLoading(true);
                    this.errorOccured(false);
                    GoNorth.HttpClient.delete(url).done(function() {
                        self.isLoading(false);
                        self.loadTypes();
                        self.cancelDeleteTaskTypeDialog();
                    }).fail(function() {
                        self.isLoading(false);
                        self.errorOccured(true);
                    });
                },

                /**
                 * Cancels the delete task type dialog
                 */
                cancelDeleteTaskTypeDialog: function() {
                    this.showDeleteTaskTypeDialog(false);
                },


                /**
                 * Releases the current lock
                 */
                releaseLock: function() {
                    this.isDialogLocked(false);
                    this.dialogLockedByUser("");
                    GoNorth.LockService.releaseCurrentLock();
                },

                /**
                 * Acquires a lock for the task type dialog
                 * 
                 * @param {string} id Id of the task type
                 */
                acquireLock: function(id) {
                    this.releaseLock();
                    var self = this;
                    GoNorth.LockService.acquireLock(this.lockCategory, id).done(function(isLocked, lockedUsername) { 
                        if(isLocked)
                        {
                            self.isDialogLocked(true);
                            self.dialogLockedByUser(lockedUsername);
                        }
                    }).fail(function() {
                        self.errorOccured(true);
                    });
                }
            };

        }(Task.ManageTaskTypes = Task.ManageTaskTypes || {}));
    }(GoNorth.Task = GoNorth.Task || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(Task) {
        (function(ManageTaskTypes) {

            /**
             * Manage Task types View Model
             * @class
             */
            ManageTaskTypes.ViewModel = function()
            {
                this.taskGroupTypeList = new ManageTaskTypes.TaskTypeList("groupType", GoNorth.Task.ManageTaskTypes.Localization.TaskGroupTypes, GoNorth.Task.ManageTaskTypes.Localization.CreateNewTaskGroupType, 
                                                                          GoNorth.Task.ManageTaskTypes.Localization.EditTaskGroupType, GoNorth.Task.ManageTaskTypes.Localization.CreateNewTaskGroupType, 
                                                                          GoNorth.Task.ManageTaskTypes.Localization.TaskGroupsWithoutTypeExist, "GetTaskGroupTypes", "AnyTaskBoardHasTaskGroupsWithoutType", 
                                                                          "CreateTaskGroupType", "UpdateTaskGroupType", "DeleteTaskGroupType", "TaskGroupType");
                this.taskTypeList = new ManageTaskTypes.TaskTypeList("taskType", GoNorth.Task.ManageTaskTypes.Localization.TaskTypes, GoNorth.Task.ManageTaskTypes.Localization.CreateNewTaskType, 
                                                                     GoNorth.Task.ManageTaskTypes.Localization.EditTaskType, GoNorth.Task.ManageTaskTypes.Localization.CreateNewTaskType, 
                                                                     GoNorth.Task.ManageTaskTypes.Localization.TasksWithoutTypeExist, "GetTaskTypes", "AnyTaskBoardHasTasksWithoutType", 
                                                                     "CreateTaskType", "UpdateTaskType", "DeleteTaskType", "TaskType");

                this.taskGroupTypeList.loadTypes();
                this.taskGroupTypeList.loadAnyTaskWithoutType();
                this.taskTypeList.loadTypes();
                this.taskTypeList.loadAnyTaskWithoutType();
            };

            ManageTaskTypes.ViewModel.prototype = {
            };

        }(Task.ManageTaskTypes = Task.ManageTaskTypes || {}));
    }(GoNorth.Task = GoNorth.Task || {}));
}(window.GoNorth = window.GoNorth || {}));