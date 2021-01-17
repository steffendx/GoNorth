(function(GoNorth) {
    "use strict";
    (function(HttpClient) {
        
        /**
         * Sends a get request
         * @param {string} url Url to send the request for
         * @returns {jQuery.Promise} Promise for the request
         */
        HttpClient.get = function(url) {
            return jQuery.ajax(url);
        };

        /**
         * Sends a post request
         * @param {string} url Url to send the request for
         * @param {object} body Body to send
         * @returns {jQuery.Promise} Promise for the request
         */
        HttpClient.post = function(url, body) {
            return jQuery.ajax({ 
                url: url, 
                headers: GoNorth.Util.generateAntiForgeryHeader(),
                data: JSON.stringify(body), 
                type: "POST",
                contentType: "application/json"
            });
        };
        
        /**
         * Sends a delete request
         * @param {string} url Url to send the request for
         * @returns {jQuery.Promise} Promise for the request
         */
        HttpClient.delete = function(url) {
            return jQuery.ajax({ 
                url: url, 
                headers: GoNorth.Util.generateAntiForgeryHeader(),
                type: "DELETE",
                contentType: "application/json"
            });
        };

    }(GoNorth.HttpClient = GoNorth.HttpClient || {}));
}(window.GoNorth = window.GoNorth || {}));