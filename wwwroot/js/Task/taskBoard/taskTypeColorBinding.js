(function (GoNorth) {
    "use strict";
    (function (BindingHandlers) {

        if (typeof ko !== "undefined") {
            /**
             * Sets the task type color for an element
             * @param {object} element HTML Element
             * @param {object[]} allTaskTypes All task types
             * @param {string} taskTypeId Task type id
             */
            function setTaskTypeColor(element, allTaskTypes, taskTypeId)
            {
                var targetColor = null;
                var defaultColor = null;
                for(var curTaskType = 0; curTaskType < allTaskTypes.length; ++curTaskType)
                {
                    if(allTaskTypes[curTaskType].id == taskTypeId)
                    {
                        targetColor = allTaskTypes[curTaskType].color;
                        break;
                    }

                    if(allTaskTypes[curTaskType].isDefault)
                    {
                        defaultColor = allTaskTypes[curTaskType].color;
                    }
                }

                if(!defaultColor && allTaskTypes.length > 0)
                {
                    defaultColor = allTaskTypes[allTaskTypes.length - 1].color;
                }

                if(!targetColor)
                {
                    targetColor = defaultColor;
                }

                if(!targetColor)
                {
                    return;
                }

                jQuery(element).css("border-color", targetColor);
            }

            /**
             * Task type color binding
             */
            ko.bindingHandlers.taskTypeColorBinding = {
                init: function (element, valueAccessor, allBindings) {
                    var allTaskTypes = allBindings.get("taskTypes");
                    var taskTypeId = ko.utils.unwrapObservable(valueAccessor());

                    if(ko.isObservable(allTaskTypes)) {
                        allTaskTypes.subscribe(function() {
                            setTaskTypeColor(element, ko.utils.unwrapObservable(allTaskTypes), taskTypeId);
                        });
                    }

                    setTaskTypeColor(element, ko.utils.unwrapObservable(allTaskTypes), taskTypeId);
                },
                update: function (element, valueAccessor, allBindings) {
                    var allTaskTypes = allBindings.get("taskTypes");
                    var taskTypeId = ko.utils.unwrapObservable(valueAccessor());
                    setTaskTypeColor(element, ko.utils.unwrapObservable(allTaskTypes), taskTypeId);
                }
            }
        }

    }(GoNorth.BindingHandlers = GoNorth.BindingHandlers || {}));
}(window.GoNorth = window.GoNorth || {}));