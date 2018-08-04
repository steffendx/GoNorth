(function(GoNorth) {
    "use strict";
    (function(Task) {
        (function(TaskBoard) {

            /**
             * Task
             * @param {object} serverData Server Data
             * @class
             */
            TaskBoard.Task = function(serverData)
            {
                this.id = serverData.id;
                this.taskNumber = 0;
                this.name = new ko.observable("");
                this.description = new ko.observable("");
                this.assignedTo = new ko.observable("");
                this.status = new ko.observable(0);

                this.parseTaskFromServerResponse(serverData)
            };

            TaskBoard.Task.prototype = {
                /**
                 * Parses the task values from a server response
                 * 
                 * @param {object} serverData Server Data
                 */
                parseTaskFromServerResponse: function(serverData) {
                    this.taskNumber = serverData.taskNumber;
                    this.name(serverData.name);
                    this.description(serverData.description);
                    this.assignedTo(serverData.assignedTo);
                    this.status(serverData.status);
                }
            };

        }(Task.TaskBoard = Task.TaskBoard || {}));
    }(GoNorth.Task = GoNorth.Task || {}));
}(window.GoNorth = window.GoNorth || {}));