(function(GoNorth) {
    "use strict";
    (function(Task) {
        (function(TaskBoard) {

            /**
             * Task Group
             * @param {object} viewModel ViewModel to which the task belongs
             * @param {object} taskGroup Task Group with data
             * @class
             */
            TaskBoard.TaskGroup = function(viewModel, taskGroup)
            {
                TaskBoard.Task.apply(this, [ taskGroup ]);

                this.viewModel = viewModel;
                this.isExpanded = new ko.observable(true);

                this.statusColumns = [];
                this.statusColumnLookup = {};
                for(var curStatus = 0; curStatus < viewModel.taskStatus.length; ++curStatus)
                {
                    var statusValue = viewModel.taskStatus[curStatus].value;
                    var statusColumn = new TaskBoard.StatusColumnTaskContainer(statusValue);
                    this.statusColumns.push(statusColumn);
                    this.statusColumnLookup[statusValue] = statusColumn;
                }

                this.parseFromServerResponse(taskGroup)
            };
            
            TaskBoard.TaskGroup.prototype = jQuery.extend({ }, TaskBoard.Task.prototype)

            /**
             * Parses the values from a server response
             */
            TaskBoard.TaskGroup.prototype.parseFromServerResponse = function(taskGroup) {
                TaskBoard.Task.prototype.parseTaskFromServerResponse.apply(this, [ taskGroup ]);

                this.isExpanded(taskGroup.status != this.viewModel.taskStatus[this.viewModel.taskStatus.length - 1].value);

                this.clearColumns();
                if(taskGroup.tasks)
                {
                    this.parseTasks(taskGroup.tasks);
                }
            };

            /**
             * Parses a list of tasks
             * 
             * @param {object[]} tasks Tasks returned from the server
             */
            TaskBoard.TaskGroup.prototype.parseTasks = function(tasks) {
                for(var curTask = 0; curTask < tasks.length; ++curTask)
                {
                    var newTask = new TaskBoard.Task(tasks[curTask]);
                    this.addTask(newTask);
                }
            };

            /**
             * Adds a task to the group
             * 
             * @param {Task} task Task to add
             */
            TaskBoard.TaskGroup.prototype.addTask = function(task) {
                var addToColumn = this.statusColumnLookup[task.status()];
                if(!addToColumn)
                {
                    addToColumn = this.statusColumns[0]; 
                }

                addToColumn.tasks.push(task);
            };

            /**
             * Moves a task to its correct column after status change
             * 
             * @param {Task} task Task to move
             * @param {int} oldStatus Old Status of the task
             */
            TaskBoard.TaskGroup.prototype.moveTaskToCorrectStatusColumn = function(task, oldStatus) {
                var oldColumn = this.statusColumnLookup[oldStatus];
                if(oldColumn)
                {
                    oldColumn.tasks.remove(task);
                }

                this.addTask(task);
            };

            /**
             * Removes a task
             * 
             * @param {Task} Task Task to remove
             */
            TaskBoard.TaskGroup.prototype.removeTask = function(task) {
                var removeFromColumn = this.statusColumnLookup[task.status()];
                if(removeFromColumn)
                {
                    removeFromColumn.tasks.remove(task);
                }
            }

            /**
             * Clears all tasks from the task columns
             */
            TaskBoard.TaskGroup.prototype.clearColumns = function() {
                for(var curColumn = 0; curColumn < this.statusColumns.length; ++curColumn)
                {
                    this.statusColumns[curColumn].tasks([]);
                }
            };

            /**
             * Toogles the expanded state
             */
            TaskBoard.TaskGroup.prototype.toogleExpanded = function() {
                this.isExpanded(!this.isExpanded());
            };
            
        }(Task.TaskBoard = Task.TaskBoard || {}));
    }(GoNorth.Task = GoNorth.Task || {}));
}(window.GoNorth = window.GoNorth || {}));