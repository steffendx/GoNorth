(function(GoNorth) {
    "use strict";
    (function(Util) {
        /// Callback function that gets called when the url parameter changed
        var urlParameterChangedCallback = null;

        /**
         * Calls the url parameter changed function
         */
        function callUrlParameterChanged() {
            if(urlParameterChangedCallback) 
            {
                urlParameterChangedCallback();
            }
        }

        /**
         * Adds a function that will be called if the url parameter is changed
         *
         * @param {function} callback 
         */
        Util.onUrlParameterChanged = function(callback) {
            urlParameterChangedCallback = callback;
            window.onpopstate = callUrlParameterChanged;
        }

        /**
         * Manipulates the history state
         * 
         * @param {string} parameter Parameter change
         * @param {bool} replaceState true if the state should be replaced, false to push the state
         */
        function manipulateHistoryState(parameter, replaceState) {
            var dontUse = false;
            if(parameter) 
            {
                parameter = "?" + parameter;
                if(window.location.search == parameter)
                {
                    dontUse = true;
                }
            } 
            else if(!parameter)
            {
                parameter = window.location.pathname;
                if(!window.location.search)
                {
                    dontUse = true;
                }
            }

            if(!dontUse) 
            {
                if(!replaceState) 
                {
                    window.history.pushState(parameter, null, parameter);
                }
                else
                {
                    window.history.replaceState(parameter, null, parameter);
                }
                callUrlParameterChanged();
            }
        }

        /**
         * Sets the url parameters
         * 
         * @param {string} parameters Parameters
         */
        Util.setUrlParameters = function(parameter) {
            manipulateHistoryState(parameter, false);
        }

        /**
         * Replace the url parameters without pushing a new history state
         * 
         * @param {string} parameters Parameters
         */
        Util.replaceUrlParameters = function(parameter) {
            manipulateHistoryState(parameter, true);
        }

        /**
         * Returns a parameter value (will search the query parameter or hash, depending on browser support)
         * 
         * @param {string} parameter Name of the parameter
         * @returns {string} Value, null if not present
         */
        Util.getParameterFromUrl = function(parameter) {
            var url = window.location.search;

            // If search string is not given, fallback to old hash notatation to allow old links to still work (Kirja etc.)
            if(!url)
            {
                url = window.location.hash;
            }

            parameter = parameter.replace(/[\[\]]/g, "\\$&");
            var regex = new RegExp(parameter + "(=([^&#]*)|&|#|$)");
            var results = regex.exec(url);
            if (!results) 
            {
                return null;
            }

            if (!results[2]) 
            {
                return '';
            }

            return decodeURIComponent(results[2].replace(/\+/g, " "));
        }

        /**
         * Generates the anti forgery header
         * 
         * @returns {object} Anti Forgery Header
         */
        Util.generateAntiForgeryHeader = function() {
            var headers = {};
            headers["RequestVerificationToken"] = jQuery("#__RequestVerificationToken").val();

            return headers;
        }

        /**
         * Sets the jQuery validation up
         * 
         * @param {string} selector jQuery Selector
         */
        Util.setupValidation = function(selector) {
            jQuery(selector).validate({
                errorElement: "div",
                errorClass: "text-danger",
                ignore: ".gn-flexFieldObjectFormRichText"
            }).resetForm();
        }

        /**
         * Fills a select box from an array
         * @param {object} selectBox jQuery Select Element
         * @param {object[]} options Array with options
         * @param {function} valueFunc Function to get the value
         * @param {function} labelFunc Function to get the label
         */
        Util.fillSelectFromArray = function(selectBox, options, valueFunc, labelFunc) {
            selectBox.find("option").remove();
            for(var curOption = 0; curOption < options.length; ++curOption)
            {
                selectBox.append(jQuery("<option>", {
                    value: valueFunc(options[curOption], curOption),
                    text: labelFunc(options[curOption], curOption)
                }));
            }
        }

        /**
         * Validates a number key press
         * @param {object} element Input Element
         * @param {object} e Event Data
         * @returns {bool} true if the value is valid, else false
         */
        Util.validateNumberKeyPress = function(element, e) {
            if (jQuery.inArray(e.keyCode, [46, 8, 9, 27, 13, 110, 190]) !== -1 ||
                (e.keyCode === 65 && (e.ctrlKey === true || e.metaKey === true)) || 
                (e.keyCode >= 35 && e.keyCode <= 40)) 
            {
                return true;
            }

            var isValid = true;
            if(e.keyCode == 189)
            {
                if(jQuery(element).val().indexOf("-") >= 0)
                {
                    e.preventDefault();
                    isValid = false;
                }
                return isValid;
            }

            if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
                e.preventDefault();
                isValid = false;
            }
            return isValid;
        }

        /**
         * Validates a positive integer key press
         * @param {object} element Input Element
         * @param {object} e Event Data
         * @returns {bool} true if the value is valid, else false
         */
        Util.validatePositiveIntegerKeyPress = function(element, e) {
            if(e.keyCode == 189 || e.keyCode == 190) {
                e.preventDefault();
                return false;
            }

            return Util.validateNumberKeyPress(element, e);
        }

        /**
         * Throttles the function execution
         * @param {function} fn Function to throttle
         * @param {number} threshold Throttle time in milliseconds
         * @param {object} scope This scope for the function
         * @returns {function} Throttled function
         */
        Util.throttle = function(fn, threshold, scope) {
            threshold = threshold ? threshold : 250;
            var last;
            var deferTimer;
            
            return function() {
                var context = scope || this;
                var now = +new Date();
                var args = arguments;
                
                if (last && now < last + threshold) {
                    clearTimeout(deferTimer);
                    deferTimer = setTimeout(function() {
                        last = now;
                        fn.apply(context, args);
                    }, threshold);
                } else {
                    last = now;
                    fn.apply(context, args);
                }
            };
        }

        /**
         * Debounces a function
         * @param {function} fn Function to debounce
         * @param {number} wait Timeout for milliseconds
         */
        Util.debounce = function(fn, wait) {
            var timeout;
            return function() {
                var context = this, args = arguments;
                var later = function() {
                    timeout = null;
                    fn.apply(context, args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        };


        /**
         * Formats a time value
         * @param {number} hours Hours
         * @param {minutes} minutes Minutes
         * @param {string} timeFormat Timeformat string
         * @returns {string} Formatted time
         */
        Util.formatTime = function(hours, minutes, timeFormat) {
            var hoursStr = hours.toString();
            if(hoursStr.length < 2) {
                hoursStr = "0" + hoursStr;
            }

            var minutesStr = minutes.toString();
            if(minutesStr.length < 2) {
                minutesStr = "0" + minutesStr;
            }

            return timeFormat.replace(/hh/gi, hoursStr).replace(/mm/gi, minutesStr);
        }

    
        /**
         * Compares to objects
         * @param {object} item1 Item 1
         * @param {object} item2 Item 2
         */
        function compareObject(item1, item2) {
            var itemType = Object.prototype.toString.call(item1);
    
            if (['[object Array]', '[object Object]'].indexOf(itemType) >= 0) 
            {
                if (!Util.isEqual(item1, item2))
                {
                    return false;
                }
            }
            else 
            {
                if (itemType !== Object.prototype.toString.call(item2))
                {
                    return false;
                }

                if (itemType === '[object Function]') 
                {
                    if (item1.toString() !== item2.toString())
                    {
                        return false;
                    }
                } 
                else 
                {
                    if (item1 !== item2)
                    {
                        return false;
                    }
                }
    
            }

            return true;
        };

        /**
         * Checks if two objects are equal
         * 
         * @param {object} value1 First object to compare
         * @param {object} value2 Second object to compare
         */
        Util.isEqual = function(value1, value2) {
            // Compare types
            var type = Object.prototype.toString.call(value1);
            if (type !== Object.prototype.toString.call(value2))
            {
                return false;
            }

            if (type != '[object Array]' && type != '[object Object]')
            {
                return value1 === value2;
            }
        
            var valueLen = type === '[object Array]' ? value1.length : Object.keys(value1).length;
            var otherLen = type === '[object Array]' ? value2.length : Object.keys(value2).length;
            if (valueLen !== otherLen)
            {
                return false;
            }

            // Compare properties
            if (type === '[object Array]') 
            {
                for (var i = 0; i < valueLen; i++) 
                {
                    if (compareObject(value1[i], value2[i]) === false)
                    {
                        return false;
                    }
                }
            } 
            else 
            {
                for (var key in value1) 
                {
                    if (value1.hasOwnProperty(key)) 
                    {
                        if (compareObject(value1[key], value2[key]) === false)
                        {
                            return false;
                        }
                    }
                }
            }
        
            // If nothing failed, return true
            return true;
        };


        /**
         * Checks if the window has a certain bootstrap size
         * @param {string} bootstrapHiddenClass Bootstrap hidden class
         * @param {string} elementCheckSelector jQuery Element selector to check 
         * @returns {bool} true if the current screen size is the size, else false
         */
        function checkBootstrapSize(bootstrapHiddenClass, elementCheckSelector) {
            var testElement = jQuery("<div class='" + bootstrapHiddenClass + "'></div>");
            testElement.appendTo(jQuery('body'));
        
            var isSize = testElement.is(elementCheckSelector);
            testElement.remove();
            return isSize;
        }

        /**
         * Returns true if the current screen size is a bootstrap xs size, else false
         * @returns {bool} true if the current screen size is a bootstrap xs size, else false
         */
        Util.isBootstrapXs = function() {
            return checkBootstrapSize("hidden-xs", ":hidden");
        };

        /**
         * Returns true if the current screen size is a bootstrap md size, else false
         * @returns {bool} true if the current screen size is a bootstrap md size, else false
         */
        Util.isBootstrapMd = function() {
            return checkBootstrapSize("visible-md-block", ":visible");
        };

    }(GoNorth.Util = GoNorth.Util || {}));
}(window.GoNorth = window.GoNorth || {}));