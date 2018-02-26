(function(GoNorth) {
    "use strict";
    (function(Task) {
        (function(TaskBoard) {

            /**
             * Container for Tasks for a status
             * @param {int} status Status for the column
             * @class
             */
            TaskBoard.StatusColumnTaskContainer = function(status)
            {
                this.status = status;
                this.tasks = new ko.observableArray();
            };

            TaskBoard.StatusColumnTaskContainer.prototype = {
            };

        }(Task.TaskBoard = Task.TaskBoard || {}));
    }(GoNorth.Task = GoNorth.Task || {}));
}(window.GoNorth = window.GoNorth || {}));