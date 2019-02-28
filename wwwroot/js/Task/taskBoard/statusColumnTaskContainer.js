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
                this.isHovering = new ko.observable(false);
            };

            TaskBoard.StatusColumnTaskContainer.prototype = {
                /**
                 * Sets the state of the column to being hovered by a task
                 */
                activateTaskHovering: function() {
                    this.isHovering(true);
                },

                /**
                 * Sets the state of the column to not being hovered by a task
                 */
                disableTaskHovering: function() {
                    this.isHovering(false);
                }
            };

        }(Task.TaskBoard = Task.TaskBoard || {}));
    }(GoNorth.Task = GoNorth.Task || {}));
}(window.GoNorth = window.GoNorth || {}));