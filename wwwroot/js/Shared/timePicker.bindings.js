(function(GoNorth) {
    "use strict";
    (function(BindingHandlers) {

        if(typeof ko !== "undefined")
        {
            /**
             * Builds a time object for custom time frame
             * @param {number} hours Hours
             * @param {number} minutes Minutes
             * @returns {object} Time object
             */
            BindingHandlers.buildTimeObject = function(hours, minutes) {
                return {
                    hours: hours,
                    minutes: minutes
                };
            }

            /**
             * Compares two time objects
             * @param {object} d1 Time object 1
             * @param {object} d2 Time object 2
             * @returns {number} Compare value
             */
            BindingHandlers.compareTimes = function(d1, d2) {
                if(d1.hours < d2.hours) {
                    return -1;
                } else if(d2.hours < d1.hours) {
                    return 1;
                } else if(d1.minutes < d2.minutes) {
                    return -1;
                } else if(d2.minutes < d1.minutes) {
                    return 1;
                }

                return 0;
            }

            /**
             * Returns the time values for a timepicker
             * @param {object} containerElement Container element
             * @param {object} hoursPerDay Hours per day
             * @param {object} minutesPerHour Minutes per hour
             * @returns {object} Time Values
             */
            function getTimeValue(containerElement, hoursPerDay, minutesPerHour) {
                var hours = parseInt(containerElement.find(".gn-timePickerHour").val());
                if(isNaN(hours)) {
                    hours = 0;
                }

                var minutes = parseInt(containerElement.find(".gn-timePickerMinutes").val());
                if(isNaN(minutes)) {
                    minutes = 0;
                }

                hoursPerDay = ko.utils.unwrapObservable(hoursPerDay);
                minutesPerHour = ko.utils.unwrapObservable(minutesPerHour);
                hours = Math.abs(hours) % hoursPerDay;
                minutes = Math.abs(minutes) % minutesPerHour;

                return BindingHandlers.buildTimeObject(hours, minutes);
            }

            /**
             * Updates the time value
             * @param {object} containerElement Container Element
             * @param {function} changeCallback Change callback
             * @param {object} hoursPerDay Hours per day
             * @param {object} minutesPerHour Minutes per hour
             */
            function updateTimeValue(containerElement, changeCallback, hoursPerDay, minutesPerHour)
            {
                changeCallback(getTimeValue(containerElement, hoursPerDay, minutesPerHour));

                updateTimeDisplay(containerElement, hoursPerDay, minutesPerHour);
            }

            /**
             * Updates the time display
             * @param {object} element HTML Element to fill
             * @param {object} hoursPerDay Hours per day
             * @param {object} minutesPerHour Minutes per hour
             */
            function updateTimeDisplay(element, hoursPerDay, minutesPerHour) {
                var containerElement = jQuery(element).closest(".gn-timePickerMainContainer");
                var timeValues = getTimeValue(containerElement, hoursPerDay, minutesPerHour);

                var targetElement = containerElement.find(".gn-timePickerMain");
                var format = targetElement.data("gn-timePickerFormat");
                var formattedTime = GoNorth.Util.formatTime(timeValues.hours, timeValues.minutes, format);
                targetElement.val(formattedTime);
            }

            /**
             * Changes the time value in a given direction
             * @param {object} element HTML Input element
             * @param {number} direction Direction
             * @param {function} changeCallback Change callback
             * @param {number} hoursPerDay Hours per day
             * @param {number} minutesPerHour Minutes per hour
             */
            function changeTimeValue(element, direction, changeCallback, hoursPerDay, minutesPerHour) {
                var value = parseInt(jQuery(element).val());
                if(isNaN(value)) {
                    value = 0;
                } else {
                    value += direction;
                }

                var maxValue = 0;
                if(jQuery(element).hasClass("gn-timePickerHour")) {
                    maxValue = ko.utils.unwrapObservable(hoursPerDay);
                } else {
                    maxValue = ko.utils.unwrapObservable(minutesPerHour);
                }

                if(value < 0) {
                    value = maxValue - 1;
                } else if(value >= maxValue) {
                    value = 0;
                }

                jQuery(element).val(value);
                updateTimeDisplay(element, hoursPerDay, minutesPerHour);
                updateTimeValue(jQuery(element).closest(".gn-timePickerMainContainer"), changeCallback, hoursPerDay, minutesPerHour);
            }

            /**
             * Initializes the time picker
             * @param {object} element HTML Element
             * @param {function} changeCallback Change callback function
             * @param {number} hoursPerDay Hours per day
             * @param {number} minutesPerHour Minutes per hour
             * @param {string} timeFormat Time format
             * @param {function} onOpen Optional callback function on opening the time callout
             * @param {function} onClose Optiona callback function on closing the time callout
             * @param {boolean} dontStyle true if the timepicker formats should not be applied, else false
             */
            BindingHandlers.initTimePicker = function(element, changeCallback, hoursPerDay, minutesPerHour, timeFormat, onOpen, onClose, dontStyle) {
                jQuery(element).wrap("<div class='gn-timePickerMainContainer" + (!dontStyle ? " gn-timePickerMainContainerStyling" : "") + "'></div>");
                jQuery('<div class="dropdown-menu">' +
                    '<div class="gn-timePickerControlContainer">' +
                        '<div class="gn-timePickerSingleControlContainer gn-timePickerSingleControlContainerHours">' +
                            '<button class="btn btn-link gn-timePickerButtonUp gn-timePickerButtonHours" tabindex="-1" type="button"><span class="glyphicon glyphicon-chevron-up"></span></button>' +
                            '<input type="text" class="' + (!dontStyle ? 'form-control ' : '') + 'gn-timePickerInput gn-timePickerHour">' +
                            '<button class="btn btn-link gn-timePickerButtonDown gn-timePickerButtonHours" tabindex="-1" type="button"><span class="glyphicon glyphicon-chevron-down"></span></button>' +
                        '</div>' +
                        '<div class="gn-timePickerSeperator">:</div>' +
                        '<div class="gn-timePickerSingleControlContainer">' +
                            '<button class="btn btn-link gn-timePickerButtonUp gn-timePickerButtonMinutes" tabindex="-1" type="button"><span class="glyphicon glyphicon-chevron-up"></span></button>' +
                            '<input type="text" class="' + (!dontStyle ? 'form-control ' : '') + 'gn-timePickerInput gn-timePickerMinutes"> ' +
                            '<button class="btn btn-link gn-timePickerButtonDown gn-timePickerButtonMinutes" tabindex="-1" type="button"><span class="glyphicon glyphicon-chevron-down"></span></button>' +
                        '</div>' +
                    '</div>' +
                '</div>').insertAfter(element);
                jQuery(element).prop("readonly", true);
                jQuery(element).addClass("gn-timePickerMain");
                if(!dontStyle) {
                    jQuery(element).addClass("gn-timePickerMainStyling");
                }
                if(!timeFormat) {
                    timeFormat = "hh:mm";
                }
                jQuery(element).data("gn-timePickerFormat", timeFormat);

                var containerElement = jQuery(element).parent();
                jQuery(element).focus(function() {
                    if(onOpen) {
                        onOpen();
                    }
                    containerElement.children(".dropdown-menu").addClass("show");
                    containerElement.find(".gn-timePickerHour").focus();
                    setTimeout(function() {
                        containerElement.find(".gn-timePickerHour").focus();
                    }, 50);
                });
                containerElement.find("input").blur(function() {
                    var target = jQuery(event.relatedTarget);
                    if(!target.closest(containerElement).length) {
                        containerElement.children(".dropdown-menu").removeClass("show");
                        if(onClose) {
                            onClose();
                        }
                    }

                    updateTimeValue(containerElement, changeCallback, hoursPerDay, minutesPerHour);
                });
                var closeHandler = null;
                closeHandler = function() {
                    if(!jQuery.contains(document, containerElement[0]))
                    {
                        jQuery(document).unbind("click", closeHandler);
                        return;
                    }

                    var target = jQuery(event.target);
                    if(!target.closest(containerElement).length) {
                        containerElement.children(".dropdown-menu").removeClass("show");
                        if(onClose) {
                            onClose();
                        }
                    }
                };
                jQuery(document).on("click", closeHandler);

                containerElement.find("input").keydown(function(e) {
                    if(e.keyCode == 38) {           // Arrow up
                        changeTimeValue(this, 1, changeCallback, hoursPerDay, minutesPerHour);
                        e.preventDefault();
                        return;
                    } else if(e.keyCode == 40) {    // Arrow down
                        changeTimeValue(this, -1, changeCallback, hoursPerDay, minutesPerHour);
                        e.preventDefault();
                        return;
                    }

                    GoNorth.Util.validateNumberKeyPress(element, e);
                });

                containerElement.find(".btn-link").click(function() {
                    var targetElement = ".gn-timePickerHour";
                    if(jQuery(this).hasClass("gn-timePickerButtonMinutes")) {
                        targetElement = ".gn-timePickerMinutes";
                    }

                    var direction = 1;
                    if(jQuery(this).hasClass("gn-timePickerButtonDown")) {
                        direction = -1;
                    }

                    changeTimeValue(containerElement.find(targetElement), direction, changeCallback, hoursPerDay, minutesPerHour);
                });
            }

            /**
             * Sets the time picker value
             * @param {object} element HTML Element
             * @param {number} hours Hours
             * @param {number} minutes Minutes
             * @param {number} hoursPerDay Hours per day
             * @param {number} minutesPerHour Minutes per hours
             */
            BindingHandlers.setTimePickerValue = function(element, hours, minutes, hoursPerDay, minutesPerHour) {
                var containerElement = jQuery(element).parent();
                containerElement.find(".gn-timePickerHour").val(hours);
                containerElement.find(".gn-timePickerMinutes").val(minutes);
                updateTimeDisplay(element, hoursPerDay, minutesPerHour);
            }

            /**
             * Timepicker Binding Handler with custom timeframe (hours, minutes)
             */
            ko.bindingHandlers.timepicker = {
                init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
                    var updatedFunction = function(newValue) {
                        valueAccessor()(newValue);
                    };
                    BindingHandlers.initTimePicker(element, updatedFunction, allBindings.get("timepickerHoursPerDay"), allBindings.get("timepickerMinutesPerHour"), allBindings.get("timepickerFormat"));
                },
                update: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
                    var timeValues = ko.utils.unwrapObservable(valueAccessor());
                    BindingHandlers.setTimePickerValue(element, timeValues.hours, timeValues.minutes, allBindings.get("timepickerHoursPerDay"), allBindings.get("timepickerMinutesPerHour"));
                }
            };
        }

    }(GoNorth.BindingHandlers = GoNorth.BindingHandlers || {}));
}(window.GoNorth = window.GoNorth || {}));