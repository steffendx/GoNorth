(function(GoNorth) {
    "use strict";
    (function(Shared) {

        /**
         * Class to trigger a download
         * @class
         */
        Shared.DownloadSubmitter = function()
        {
            this.creationDeferred = null;
        };

        Shared.DownloadSubmitter.prototype = {
            /**
             * Triggers a download
             * @param url Url to download
             * @param paramValues Parameter
             */
            triggerDownload: function(url, paramValues) {
                var antiforgeryHeader = GoNorth.Util.generateAntiForgeryHeader();
                var submitForm = jQuery("<form style='display: none'></form>");
                submitForm.prop("action", url);
                submitForm.prop("method", "POST");

                var antiforgeryHeaderControl = jQuery("<input type='hidden' name='__RequestVerificationToken'/>");
                antiforgeryHeaderControl.val(antiforgeryHeader["RequestVerificationToken"]);
                submitForm.append(antiforgeryHeaderControl);

                for(var curParam in paramValues) 
                {
                    if(!Array.isArray(paramValues[curParam]))
                    {
                        var paramInput = jQuery("<input type='hidden'/>");
                        paramInput.prop("name", curParam);
                        paramInput.val(paramValues[curParam]);
                        submitForm.append(paramInput);
                    }
                    else
                    {
                        var paramArray = paramValues[curParam];
                        for(var curValue = 0; curValue < paramArray.length; ++curValue)
                        {
                            var paramInput = jQuery("<input type='hidden'/>");
                            paramInput.prop("name", curParam + "[]");
                            paramInput.val(paramArray[curValue]);
                            submitForm.append(paramInput);
                        }
                    }
                }
                
                submitForm.appendTo("body");
                submitForm.submit();
                submitForm.remove();
            }
        };

    }(GoNorth.Shared = GoNorth.Shared || {}));
}(window.GoNorth = window.GoNorth || {}));