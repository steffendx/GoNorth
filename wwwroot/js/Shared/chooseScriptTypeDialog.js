(function(GoNorth) {
    "use strict";
    (function(Shared) {
        (function(ChooseScriptTypeDialog) {

            /**
             * Value that will be returned in the openDialog promise if a node graph was selected. If changed, please make sure that the script types in the daily routines event object or code snippets are matching.
             */
            ChooseScriptTypeDialog.nodeGraph = 0;
            
            /**
             * Value that will be returned in the openDialog promise if a code script was selected. If changed, please make sure that the script types in the daily routines event object or code snippets are matching.
             */
            ChooseScriptTypeDialog.codeScript = 1;

            /**
             * Viewmodel for a dialog to choose the script type
             * @class
             */
            ChooseScriptTypeDialog.ViewModel = function()
            {
                this.isVisible = new ko.observable(false);

                this.creationDeferred = null;
            };

            ChooseScriptTypeDialog.ViewModel.prototype = {
                /**
                 * Opens the script type choosing dialog
                 * @returns {jQuery.Deferred} Deferred that will be resolved with the result of the selection
                 */
                openDialog: function() {
                    if(this.creationDeferred != null)
                    {
                        this.creationDeferred.reject();
                    }

                    this.isVisible(true);
                    this.creationDeferred = new jQuery.Deferred();
                    return this.creationDeferred.promise();
                },

                /**
                 * Creates a node graph
                 */
                createNodeGraph: function() {
                    this.isVisible(false);
                    if(this.creationDeferred != null)
                    {
                        this.creationDeferred.resolve(ChooseScriptTypeDialog.nodeGraph);
                    }
                },
                
                /**
                 * Creates a code script
                 */
                createCodeScript: function() {
                    this.isVisible(false);
                    if(this.creationDeferred != null)
                    {
                        this.creationDeferred.resolve(ChooseScriptTypeDialog.codeScript);
                    }
                },

                /**
                 * Cancels the dialog
                 */
                cancelDialog: function() {
                    this.isVisible(false);
                    if(this.creationDeferred != null)
                    {
                        this.creationDeferred.reject();
                    }
                }
            };

        }(Shared.ChooseScriptTypeDialog = Shared.ChooseScriptTypeDialog || {}));
    }(GoNorth.Shared = GoNorth.Shared || {}));
}(window.GoNorth = window.GoNorth || {}));