(function(GoNorth) {
    "use strict";
    (function(Task) {
        (function(TaskBoard) {

            /// Available Columns for Tasks
            var availableColumnsForTasks = 9;

            /**
             * Task Board View Model
             * @param {object[]} taskStatus Possible Task Status
             * @class
             */
            TaskBoard.ViewModel = function(taskStatus)
            {
                this.initialTaskGroupToOpenId = GoNorth.Util.getParameterFromUrl("taskGroupId");
                this.initialTaskToOpenId = GoNorth.Util.getParameterFromUrl("taskId");

                this.id = new ko.observable("");
                var paramId = GoNorth.Util.getParameterFromUrl("id");
                if(paramId)
                {
                    this.setId(paramId);
                }

                this.taskStatus = taskStatus;

                var taskColumnWidth = Math.floor(availableColumnsForTasks / taskStatus.length);
                this.taskColumnClass = "col-sm-" + taskColumnWidth + " col-md-" + taskColumnWidth + " col-lg-" + taskColumnWidth;

                this.isLoading = new ko.observable(false);
                this.isReadonly = new ko.observable(false);

                this.errorOccured = new ko.observable(false);
                this.additionalErrorDetails = new ko.observable("");

                this.allBoards = new ko.observableArray();
                this.allUsers = new ko.observableArray();

                this.boardName = new ko.observable(Task.TaskBoard.Localization.Tasks);
                this.currentBoardDates = new ko.observable("");
                this.taskGroups = new ko.observableArray();

                this.showTaskDialog = new ko.observable(false);
                this.taskDialogTitle = new ko.observable("");
                this.taskDialogEditNumber = new ko.observable(null);
                this.taskDialogName = new ko.observable("");
                this.taskDialogDescription = new ko.observable("");
                this.taskDialogAssignedTo = new ko.observable(null);
                this.taskDialogStatus = new ko.observable(null);
                this.isTaskEditDialog = new ko.observable(false);
                this.isTaskDialogReadonly = new ko.observable(false);
                this.taskDialogLockedPrefix = new ko.observable("");
                this.taskDialogLockedByUser = new ko.observable("");
                this.editTaskGroup = null;
                this.addTaskToGroup = null;
                this.editTask = null;
                this.groupForEditTask = null;

                this.linkDialog = new GoNorth.ChooseObjectDialog.ViewModel();
                this.linkDialogInsertHtmlCallback = null;

                this.showDeleteDialog = new ko.observable(false);
                this.deleteDialogText = new ko.observable("");


                this.userDeferred = this.loadAllUsers();
                this.lastOpenedBoardIdDef = this.getLastOpenedBoardId();
                this.loadAllOpenBoards();
                
                var self = this;
                this.showTaskDialog.subscribe(function(newValue) {
                    if(!newValue)
                    {
                        self.releaseLock();
                        self.setTaskDialogParameter("");
                    }
                });

                if(this.id())
                {
                    this.userDeferred.done(function() {
                        self.loadBoard(self.id());
                    });
                    this.saveLastOpenedBoardId(this.id());
                }

                var lastId = this.id();
                GoNorth.Util.onUrlParameterChanged(function() {
                    var id = GoNorth.Util.getParameterFromUrl("id");
                    if(id != lastId) {
                        lastId = id;
                        self.switchBoard(id);
                    }
                });
            };

            TaskBoard.ViewModel.prototype = {
                /**
                 * Resets the error state
                 */
                resetErrorState: function() {
                    this.errorOccured(false);
                    this.additionalErrorDetails("");
                },

                /**
                 * Loads all open boards
                 */
                loadAllOpenBoards: function() {
                    this.resetErrorState();
                    this.isLoading(true);
                    var self = this;
                    jQuery.ajax({ 
                        url: "/api/TaskApi/GetOpenTaskBoards?start=0&pageSize=100", 
                        type: "GET"
                    }).done(function(data) {
                        self.allBoards(data.boards);
                        self.isLoading(false);

                        if(!self.id() && data.boards.length > 0)
                        {
                            self.lastOpenedBoardIdDef.done(function(lastOpenedBoardId) {
                                self.userDeferred.done(function() {
                                    self.loadBoard(lastOpenedBoardId ? lastOpenedBoardId : data.boards[0].id);
                                });
                            });
                        }
                    }).fail(function() {
                        self.errorOccured(true);
                        self.isLoading(false);
                    });
                },

                /**
                 * Loads all users
                 */
                loadAllUsers: function() {
                    var def = new jQuery.Deferred();

                    var self = this;
                    jQuery.ajax({ 
                        url: "/api/UtilApi/GetAllUsers", 
                        type: "GET"
                    }).done(function(users) {
                        self.allUsers(users);
                        def.resolve();
                    }).fail(function() {
                        self.errorOccured(true);
                        def.reject();
                    });

                    return def.promise();
                },

                /**
                 * Sets the id
                 * 
                 * @param {string} id Id of the board
                 */
                setId: function(id) {
                    var pushIdAsNewState = this.id() && this.id() != id;
                    this.id(id);
                    var parameterValue = "id=" + id;
                    if(pushIdAsNewState)
                    {
                        GoNorth.Util.setUrlParameters(parameterValue);
                    }
                    else
                    {
                        GoNorth.Util.replaceUrlParameters(parameterValue);
                    }
                },

                /**
                 * Switches the board
                 * 
                 * @param {string} boardId Id of the board
                 */
                switchBoard: function(boardId) {
                    if(this.id() == boardId)
                    {
                        return;
                    }

                    this.loadBoard(boardId);
                    this.saveLastOpenedBoardId(boardId);
                },

                /**
                 * Loads a board
                 * 
                 * @param {string} id Id of the board
                 */
                loadBoard: function(id) {
                    this.errorOccured(false);
                    this.isLoading(true);
                    this.setId(id);
                    var self = this;
                    jQuery.ajax({
                        url: "/api/TaskApi/GetTaskBoard?id=" + encodeURIComponent(id),
                        method: "GET"
                    }).done(function(board) {
                        self.boardName(board.name);
                        self.currentBoardDates(self.formatTaskBoardDates(board));
                        self.isReadonly(board.isClosed);

                        if(board.taskGroups)
                        {
                            self.taskGroups(self.parseTaskGroups(board.taskGroups))
                        }
                        else
                        {
                            self.taskGroups([]);
                        }

                        self.isLoading(false);

                        if(self.initialTaskGroupToOpenId)
                        {
                            self.openTaskGroupById(self.initialTaskGroupToOpenId);
                            self.initialTaskGroupToOpenId = null;
                        }

                        if(self.initialTaskToOpenId)
                        {
                            self.openTaskById(self.initialTaskToOpenId);
                            self.initialTaskToOpenId = null;
                        }
                    }).fail(function() {
                        self.errorOccured(true);
                        self.isLoading(false);
                    });
                },

                /**
                 * Parses a list of task groups
                 * 
                 * @param {object[]} taskGroups Task Groups returned from the server
                 * @returns {objec[]} Parsed Task Groups
                 */
                parseTaskGroups: function(taskGroups) {
                    var parsedTaskGroups = [];
                    for(var curTaskGroup = 0; curTaskGroup < taskGroups.length; ++curTaskGroup)
                    {
                        parsedTaskGroups.push(new TaskBoard.TaskGroup(this, taskGroups[curTaskGroup]));
                    }

                    return parsedTaskGroups;
                },


                /**
                 * Formats the task board dates for display
                 */
                formatTaskBoardDates: function(taskBoard) {
                    var formatedDates = "";
                    if(taskBoard.plannedStart)
                    {
                        formatedDates = moment(taskBoard.plannedStart).format("L");
                    }

                    if(taskBoard.plannedStart && taskBoard.plannedEnd)
                    {
                        formatedDates += " - " + moment(taskBoard.plannedEnd).format("L");
                    }
                    else if(formatedDates)
                    {
                        formatedDates = Task.TaskBoard.Localization.StartingFrom + " " + formatedDates;
                    }

                    if(formatedDates)
                    {
                        formatedDates = "(" + formatedDates + ")";
                    }

                    return formatedDates;
                },

                /**
                 * Loads the last opened board id
                 * 
                 * @returns {jQuery.Deferred} Deferred for the loading process
                 */
                getLastOpenedBoardId: function() {
                    var def = new jQuery.Deferred();
                    jQuery.ajax({
                        url: "/api/TaskApi/GetLastOpenedTaskBoard",
                        method: "GET"
                    }).done(function(boardId) {
                        def.resolve(boardId);
                    }).fail(function() {
                        def.reject();
                    });

                    return def.promise();
                },

                /**
                 * Saves the last opened board id
                 * 
                 * @param {string} boardId Id of the board
                 */
                saveLastOpenedBoardId: function(boardId) {
                    jQuery.ajax({
                        headers: GoNorth.Util.generateAntiForgeryHeader(),
                        url: "/api/TaskApi/SetLastOpenedTaskBoard?boardId=" + encodeURIComponent(boardId),
                        method: "POST"
                    });
                },


                /**
                 * Opens a task group by id
                 * 
                 * @param {string} taskGroupId Task group id
                 */
                openTaskGroupById: function(taskGroupId) {
                    var taskGroups = this.taskGroups();
                    for(var curTaskGroup = 0; curTaskGroup < taskGroups.length; ++curTaskGroup)
                    {
                        if(taskGroups[curTaskGroup].id == taskGroupId)
                        {
                            this.openEditTaskGroupDialog(taskGroups[curTaskGroup]);
                            return;
                        }
                    }
                },

                /**
                 * Opens a task by id
                 * 
                 * @param {string} taskId Task id
                 */
                openTaskById: function(taskId) {
                    var taskGroups = this.taskGroups();
                    for(var curTaskGroup = 0; curTaskGroup < taskGroups.length; ++curTaskGroup)
                    {
                        var taskGroup = taskGroups[curTaskGroup];
                        for(var curColumn = 0; curColumn < taskGroup.statusColumns.length; ++curColumn)
                        {
                            var statusColumnTasks = taskGroup.statusColumns[curColumn].tasks();
                            for(var curTask = 0; curTask < statusColumnTasks.length; ++curTask)
                            {
                                if(statusColumnTasks[curTask].id == taskId)
                                {
                                    this.openEditTaskDialog(taskGroup, statusColumnTasks[curTask]);
                                    return;
                                }
                            }
                        }
                    }
                },


                /**
                 * Opens the create task group dialog
                 */
                openCreateTaskGroupDialog: function() {
                    this.taskDialogTitle(Task.TaskBoard.Localization.NewTaskGroup);
                    this.taskDialogEditNumber(null);
                    this.taskDialogLockedPrefix(Task.TaskBoard.Localization.LockedTaskGroupPrefix);

                    this.resetTaskDialogValues();
                    this.isTaskEditDialog(false);
                    this.editTaskGroup = null;
                    this.addTaskToGroup = null;
                    this.editTask = null;
                    this.groupForEditTask = null;
                    
                    this.releaseLock();

                    this.openSharedTaskDialog();
                },

                /**
                 * Opens the edit task group dialog
                 * 
                 * @param {object} taskGroup Task Group to edit
                 */
                openEditTaskGroupDialog: function(taskGroup) {
                    if(this.isLoading())
                    {
                        return;
                    }

                    this.taskDialogTitle(Task.TaskBoard.Localization.EditTaskGroup);
                    this.taskDialogEditNumber(taskGroup.taskNumber);
                    this.taskDialogLockedPrefix(Task.TaskBoard.Localization.LockedTaskGroupPrefix);

                    this.setTaskDialogValuesFromTask(taskGroup);
                    this.isTaskEditDialog(true);
                    this.editTaskGroup = taskGroup;
                    this.addTaskToGroup = null;
                    this.editTask = null;
                    this.groupForEditTask = null;

                    this.acquireLock("TaskGroup", taskGroup.id);

                    this.setTaskDialogParameter("taskGroupId=" + taskGroup.id);

                    this.openSharedTaskDialog();
                },

                /**
                 * Opens the dialog for creating a new task
                 * 
                 * @param {object} taskGroup Taskgroup to which the new task should be added
                 */
                openCreateNewTaskDialog: function(taskGroup) {
                    this.taskDialogTitle(Task.TaskBoard.Localization.NewTask);
                    this.taskDialogEditNumber(null);
                    this.taskDialogLockedPrefix(Task.TaskBoard.Localization.LockedTaskPrefix);

                    this.resetTaskDialogValues();
                    this.isTaskEditDialog(false);
                    this.editTaskGroup = null;
                    this.addTaskToGroup = taskGroup;
                    this.editTask = null;
                    this.groupForEditTask = null;

                    this.releaseLock();

                    this.openSharedTaskDialog();
                },

                /**
                 * Opens the edit task dialog
                 * 
                 * @param {TaskGroup} taskGroup Task Group to which the task belongs
                 * @param {Task} task Task To edit
                 */
                openEditTaskDialog: function(taskGroup, task) {
                    if(this.isLoading())
                    {
                        return;
                    }

                    this.taskDialogTitle(Task.TaskBoard.Localization.EditTask);
                    this.taskDialogEditNumber(task.taskNumber);
                    this.taskDialogLockedPrefix(Task.TaskBoard.Localization.LockedTaskPrefix);

                    this.setTaskDialogValuesFromTask(task);
                    this.isTaskEditDialog(true);
                    this.editTaskGroup = null;
                    this.addTaskToGroup = null;
                    this.editTask = task;
                    this.groupForEditTask = taskGroup;
                    
                    this.acquireLock("Task", task.id);

                    this.setTaskDialogParameter("taskId=" + task.id);

                    this.openSharedTaskDialog();
                },

                /**
                 * Sets the task dialog parameters
                 * 
                 * @param {string} dialogParameters Dialog Parameters to set
                 */
                setTaskDialogParameter: function(dialogParameters) {
                    var parameterValue = "id=" + this.id();
                    if(dialogParameters)
                    {
                        parameterValue += "&" + dialogParameters;
                    }

                    GoNorth.Util.replaceUrlParameters(parameterValue);
                },

                /**
                 * Resets the task dialog values to empty
                 */
                resetTaskDialogValues: function() {
                    this.taskDialogName("");
                    this.taskDialogDescription("");
                    this.taskDialogAssignedTo(null);
                    this.taskDialogStatus(null);
                },

                /**
                 * Sets the task dialog values from a task
                 * 
                 * @param {object} task Task to read the values from
                 */
                setTaskDialogValuesFromTask: function(task) {
                    this.taskDialogName(task.name());
                    this.taskDialogDescription(task.description());
                    this.taskDialogAssignedTo(task.assignedTo());
                    this.taskDialogStatus(task.status());
                },

                /**
                 * Opens the task dialog and sets shared values
                 */
                openSharedTaskDialog: function() {
                    this.resetErrorState();
                    this.showTaskDialog(true);
                    GoNorth.Util.setupValidation("#gn-taskDialogForm");
                },

                /**
                 * Saves the task dialog
                 * 
                 * @param {bool} closeDialog true if the dialog should be closed after save, else false
                 */
                saveTaskDialog: function(closeDialog) {
                    // Validate Data
                    if(!jQuery("#gn-taskDialogForm").valid())
                    {
                        return;
                    }

                    // Send Request
                    var url = "/api/TaskApi/CreateTaskGroup?boardId=" + this.id();
                    if(this.editTaskGroup)
                    {
                        url = "/api/TaskApi/UpdateTaskGroup?boardId=" + this.id() + "&groupId=" + this.editTaskGroup.id;
                    }
                    else if(this.addTaskToGroup)
                    {
                        url = "/api/TaskApi/CreateTask?boardId=" + this.id() + "&groupId=" + this.addTaskToGroup.id;
                    }
                    else if(this.editTask)
                    {
                        url = "/api/TaskApi/UpdateTask?boardId=" + this.id() + "&groupId=" + this.groupForEditTask.id + "&taskId=" + this.editTask.id;
                    }

                    var request = {
                        name: this.taskDialogName(),
                        description: this.taskDialogDescription(),
                        assignedTo: this.taskDialogAssignedTo(),
                        status: this.taskDialogStatus()
                    };

                    this.isLoading(true);
                    this.resetErrorState();
                    var self = this;
                    jQuery.ajax({ 
                        url: url, 
                        headers: GoNorth.Util.generateAntiForgeryHeader(),
                        data: JSON.stringify(request), 
                        type: "POST",
                        contentType: "application/json"
                    }).done(function(data) {
                        if(self.editTaskGroup)
                        {
                            self.editTaskGroup.parseFromServerResponse(data);
                        }
                        else if(self.addTaskToGroup)
                        {
                            var newTask = new TaskBoard.Task(data);
                            self.addTaskToGroup.addTask(newTask);
                            if(!closeDialog)
                            {
                                self.editTask = newTask;
                                self.groupForEditTask = self.addTaskToGroup;
                                self.addTaskToGroup = null;
                            }
                        }
                        else if(self.editTask)
                        {
                            var oldTaskStatus = self.editTask.status();
                            self.editTask.parseTaskFromServerResponse(data);
                            if(self.editTask.status() != oldTaskStatus)
                            {
                                self.groupForEditTask.moveTaskToCorrectStatusColumn(self.editTask, oldTaskStatus);
                            }
                        }
                        else
                        {
                            var newTaskGroup = new TaskBoard.TaskGroup(self, data);
                            self.taskGroups.push(newTaskGroup);
                            if(!closeDialog)
                            {
                                self.editTaskGroup = newTaskGroup;
                            }
                        }

                        self.isLoading(false);
                    }).fail(function(xhr) {
                        self.isLoading(false);
                        self.errorOccured(true);
                    });
                
                    if(closeDialog)
                    {
                        this.closeTaskDialog();
                    }
                },

                /**
                 * Closes the task dialog
                 */
                closeTaskDialog: function() {
                    this.resetErrorState();
                    this.showTaskDialog(false);
                },


                /**
                 * Saves a task or task group after a quick edit
                 * 
                 * @param {TaskGroup} taskGroup Task Group to save
                 * @param {Task} task Task to save, if null an update for the group will be saved
                 * @returns {jQuery.Deferred} Deferred for the save process
                 */
                saveTaskQuickEdit: function(taskGroup, task) {
                    if(this.isLoading())
                    {
                        return;
                    }

                    var saveObj = task;
                    if(!saveObj)
                    {
                        saveObj = taskGroup;
                    }

                    var request = {
                        name: saveObj.name(),
                        description: saveObj.description(),
                        assignedTo: saveObj.assignedTo() ? saveObj.assignedTo() : null,
                        status: saveObj.status()
                    };

                    var url = "/api/TaskApi/UpdateTaskGroup?boardId=" + this.id() + "&groupId=" + taskGroup.id; 
                    if(task)
                    {
                        url = "/api/TaskApi/UpdateTask?boardId=" + this.id() + "&groupId=" + taskGroup.id + "&taskId=" + task.id;
                    }

                    var def = new jQuery.Deferred();
                    this.isLoading(true);
                    this.resetErrorState();
                    var self = this;
                    jQuery.ajax({ 
                        url: url, 
                        headers: GoNorth.Util.generateAntiForgeryHeader(),
                        data: JSON.stringify(request), 
                        type: "POST",
                        contentType: "application/json"
                    }).done(function(data) {
                        self.isLoading(false);
                        def.resolve();
                    }).fail(function(xhr) {
                        self.isLoading(false);
                        self.errorOccured(true);
                        def.reject();
                    });

                    return def.promise();
                },

                /**
                 * Drops a task to a new status
                 * 
                 * @param {TaskGroup} taskGroup Task group
                 * @param {Task} task Task
                 * @param {int} newStatus New Status
                 */
                dropTaskToStatus: function(taskGroup, task, newStatus) {
                    if(task.status() == newStatus || this.isLoading())
                    {
                        return;
                    }

                    var oldStatus = task.status();
                    task.status(newStatus);
                    taskGroup.moveTaskToCorrectStatusColumn(task, oldStatus);

                    this.saveTaskQuickEdit(taskGroup, task).fail(function() {
                        // Move back to old column on error
                        task.status(oldStatus);
                        taskGroup.moveTaskToCorrectStatusColumn(task, newStatus);
                    });
                },


                /**
                 * Generates the rich text buttons
                 * 
                 * @returns {object} Rich text buttons
                 */
                generateRichTextButtons: function() {
                    var self = this;

                    var allButtons = {};
                    if(GoNorth.Task.TaskBoard.hasKirjaRights)
                    {
                        allButtons.insertWikiLink = {
                            title: GoNorth.Task.TaskBoard.Localization.ToolbarButtonInsertKirjaLinkTitle,
                            icon: "glyphicon-book",
                            callback: function(htmlInsert) {
                                self.linkDialogInsertHtmlCallback = htmlInsert;
                                self.linkDialog.openKirjaPageSearch(GoNorth.Task.TaskBoard.Localization.ToolbarButtonInsertKirjaLinkTitle).then(function(selectedObject) {
                                    self.addLinkFromLinkDialog(selectedObject);
                                });
                            }
                        };
                    }

                    if(GoNorth.Task.TaskBoard.hasAikaRights)
                    {
                        allButtons.insertQuestLink = {
                            title: GoNorth.Task.TaskBoard.Localization.ToolbarButtonInsertAikaQuestLinkTitle,
                            icon: "glyphicon-king",
                            callback: function(htmlInsert) {
                                self.linkDialogInsertHtmlCallback = htmlInsert;
                                self.linkDialog.openQuestSearch(GoNorth.Task.TaskBoard.Localization.ToolbarButtonInsertAikaQuestLinkTitle).then(function(selectedObject) {
                                    self.addLinkFromLinkDialog(selectedObject);
                                });
                            }
                        };
                    }

                    if(GoNorth.Task.TaskBoard.hasKortistoRights)
                    {
                        allButtons.insertNpcLink = {
                            title: GoNorth.Task.TaskBoard.Localization.ToolbarButtonInsertKortistoNpcLinkTitle,
                            icon: "glyphicon-user",
                            callback: function(htmlInsert) {
                                self.linkDialogInsertHtmlCallback = htmlInsert;
                                self.linkDialog.openNpcSearch(GoNorth.Task.TaskBoard.Localization.ToolbarButtonInsertKortistoNpcLinkTitle).then(function(selectedObject) {
                                    self.addLinkFromLinkDialog(selectedObject);
                                });
                            }
                        };
                    }

                    if(GoNorth.Task.TaskBoard.hasStyrRights)
                    {
                        allButtons.insertItemLink = {
                            title: GoNorth.Task.TaskBoard.Localization.ToolbarButtonInsertStyrItemLinkTitle,
                            icon: "glyphicon-apple",
                            callback: function(htmlInsert) {
                                self.linkDialogInsertHtmlCallback = htmlInsert;
                                self.linkDialog.openItemSearch(GoNorth.Task.TaskBoard.Localization.ToolbarButtonInsertStyrItemLinkTitle).then(function(selectedObject) {
                                    self.addLinkFromLinkDialog(selectedObject);
                                });
                            }
                        };
                    }

                    return allButtons;
                },

                /**
                 * Adds a link from the link dialog
                 * 
                 * @param {object} linkObj Link object
                 */
                addLinkFromLinkDialog: function(linkObj) {
                    this.linkDialogInsertHtmlCallback("<a href='" + linkObj.openLink + "' target='_blank'>" + linkObj.name + "</a>");
                },

                /**
                 * Callback if a new image file was uploaded
                 * 
                 * @param {string} image Image Filename that was uploaded
                 * @returns {string} Url of the new image
                 */
                imageUploaded: function(image) {
                    return "/api/TaskApi/TaskImage?imageFile=" + encodeURIComponent(image);
                },

                /**
                 * Callback if an error occured during upload
                 * 
                 * @param {string} errorMessage Error Message
                 * @param {object} xhr Xhr Object
                 */
                uploadError: function(errorMessage, xhr) {
                    this.errorOccured(true);
                    if(xhr && xhr.responseText)
                    {
                        this.additionalErrorDetails(xhr.responseText);
                    }
                    else
                    {
                        this.additionalErrorDetails(errorMessage);
                    }
                },

                /**
                 * Checks if a user wants to open a link from the description
                 * 
                 * @param {object} viewModel Viewmodel
                 * @param {object} e Event object
                 */
                checkDescriptionOpenLink: function(viewModel, e) {
                    if(e.ctrlKey && jQuery(e.target).is("a"))
                    {
                        window.open(jQuery(e.target).prop("href"));
                        return false;
                    }

                    return true;
                },


                /**
                 * Opens the delete dialog
                 */
                openDeleteDialog: function() {
                    this.showDeleteDialog(true);
                    
                    if(this.editTaskGroup)
                    {
                        this.deleteDialogText(Task.TaskBoard.Localization.AreYouSureYouWantToDeleteTheTaskGroup);
                    }
                    else
                    {
                        this.deleteDialogText(Task.TaskBoard.Localization.AreYouSureYouWantToDeleteTheTask);
                    }
                },

                /**
                 * Deletes the currently selected task or task group
                 */
                deleteTask: function() {
                    // Build Url
                    var url = ""
                    if(this.editTaskGroup)
                    {
                        url = "/api/TaskApi/DeleteTaskGroup?boardId=" + this.id() + "&groupId=" + this.editTaskGroup.id;
                    }
                    else if(this.editTask)
                    {
                        url = "/api/TaskApi/DeleteTask?boardId=" + this.id() + "&groupId=" + this.groupForEditTask.id + "&taskId=" + this.editTask.id;
                    }

                    if(!url)
                    {
                        return;
                    }

                    // Send request
                    this.closeDeleteDialog();
                    this.closeTaskDialog();

                    var def = new jQuery.Deferred();
                    this.isLoading(true);
                    this.resetErrorState();
                    var self = this;
                    jQuery.ajax({ 
                        url: url, 
                        headers: GoNorth.Util.generateAntiForgeryHeader(),
                        type: "DELETE",
                    }).done(function(data) {
                        if(self.editTaskGroup)
                        {
                            self.taskGroups.remove(self.editTaskGroup);
                        }
                        else
                        {
                            self.groupForEditTask.removeTask(self.editTask);
                        }

                        self.isLoading(false);
                    }).fail(function(xhr) {
                        self.isLoading(false);
                        self.errorOccured(true);

                        // If object is related to anything that prevents deleting a bad request (400) will be returned
                        if(xhr.status == 400 && xhr.responseText)
                        {
                            self.additionalErrorDetails(xhr.responseText);
                        }
                    });
                },

                /**
                 * Closes the delete dialog
                 */
                closeDeleteDialog: function() {
                    this.showDeleteDialog(false);
                },


                /**
                 * Releases the current lock
                 */
                releaseLock: function() {
                    this.isTaskDialogReadonly(false);
                    this.taskDialogLockedByUser("");
                    GoNorth.LockService.releaseCurrentLock();
                },

                /**
                 * Acquires a lock
                 * 
                 * @param {string} category Categroy of the task / taskgroup
                 * @param {string} id Id of the task / taskgroup
                 */
                acquireLock: function(category, id) {
                    this.releaseLock();
                    if(this.isReadonly())
                    {
                        return;
                    }

                    var self = this;
                    GoNorth.LockService.acquireLock(category, id).done(function(isLocked, lockedUsername) { 
                        if(isLocked)
                        {
                            self.isTaskDialogReadonly(true);
                            self.taskDialogLockedByUser(lockedUsername);
                        }
                    }).fail(function() {
                        self.errorOccured(true);
                    });
                }
            };

        }(Task.TaskBoard = Task.TaskBoard || {}));
    }(GoNorth.Task = GoNorth.Task || {}));
}(window.GoNorth = window.GoNorth || {}));