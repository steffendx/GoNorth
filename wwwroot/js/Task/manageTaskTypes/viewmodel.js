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