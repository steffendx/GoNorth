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
                errorElement: "span",
                errorClass: "text-danger"
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
         * Returns true if the current screen size is a bootstrap xs size, else false
         * @returns {bool} true if the current screen size is a bootstrap xs size, else false
         */
        Util.isBootstrapXs = function() {
            var testElement = jQuery("<div class='hidden-xs'></div>");
            testElement.appendTo(jQuery('body'));
        
            var isXs = testElement.is(':hidden');
            testElement.remove();
            return isXs;
        };

    }(GoNorth.Util = GoNorth.Util || {}));
}(window.GoNorth = window.GoNorth || {}));