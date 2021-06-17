(function(GoNorth) {
    "use strict";
    (function(PromptService) {

        /**
         * Prompt Service viewmodel
         */
        PromptService.ViewModel = function()
        {
            this.inputPromptVisible = new ko.observable(false);
            this.inputPromptTitle = new ko.observable("");
            this.inputPromptText = new ko.observable("");
            this.inputPromptTextMandatory = new ko.observable(false);
            this.inputPromptIsMultiLine = new ko.observable(false);
            this.inputPromptDeferred = null;

            this.yesNoPromptVisible = new ko.observable(false);
            this.yesNoPromptTitle = new ko.observable("");
            this.yesNoPromptText = new ko.observable("");
            this.yesNoPromptDeferred = null;

            var self = this;

            /**
             * Opens an input prompt
             * @param {string} title Title of the dialog
             * @param {string} existingText Optional existing text
             * @param {boolean} isTextMandatory true if its mandatory to enter a text, else false
             * @param {boolena} isMultiLine true if the text must be displayed as a multiline text
             * @returns {jQuery.Deferred} Promise that will be resolved with the new text
             */
            PromptService.openInputPrompt = function(title, existingText, isTextMandatory, isMultiLine) {
                if(!existingText) {
                    existingText = "";
                }

                self.inputPromptTitle(title);
                self.inputPromptText(existingText);
                self.inputPromptVisible(true);
                self.inputPromptTextMandatory(!!isTextMandatory);
                self.inputPromptIsMultiLine(!!isMultiLine);
                self.inputPromptDeferred = new jQuery.Deferred();

                GoNorth.Util.setupValidation("#gn-inputPromptForm");

                return self.inputPromptDeferred.promise();
            };

            /**
             * Opens a yes/no prompt
             * @param {string} title Title of the dialog
             * @param {string} text Optional existing text
             * @returns {jQuery.Deferred} Promise that will be resolved if the user accepts, else rejected
             */
             PromptService.openYesNoPrompt = function(title, text) {
                self.yesNoPromptVisible(true);
                self.yesNoPromptTitle(title);
                self.yesNoPromptText(text);
                self.yesNoPromptDeferred = new jQuery.Deferred();

                return self.yesNoPromptDeferred.promise();
            }
        };

        PromptService.ViewModel.prototype = {
            /**
             * Confirms the input prompt
             */
            confirmInputPrompt: function() {
                var text = this.inputPromptText();
                if(this.inputPromptTextMandatory() && !jQuery("#gn-inputPromptForm").valid())
                {
                    return;
                }
                
                this.inputPromptVisible(false);

                if(this.inputPromptDeferred)
                {
                    this.inputPromptDeferred.resolve(text);
                    this.inputPromptDeferred = null;
                }
            },

            /**
             * Cancels the input prompt
             */
            cancelInputPrompt: function() {
                this.inputPromptVisible(false);
                if(this.inputPromptDeferred)
                {
                    this.inputPromptDeferred.reject();
                    this.inputPromptDeferred = null;
                }
            },


            /**
             * Confirms the yes/no prompt
             */
             confirmYesNoPrompt: function() {
                this.yesNoPromptVisible(false);

                if(this.yesNoPromptDeferred)
                {
                    this.yesNoPromptDeferred.resolve();
                    this.yesNoPromptDeferred = null;
                }
            },

            /**
             * Cancels the yes/no prompt
             */
            cancelYesNoPrompt: function() {
                this.yesNoPromptVisible(false);

                if(this.yesNoPromptDeferred)
                {
                    this.yesNoPromptDeferred.reject();
                    this.yesNoPromptDeferred = null;
                }
            }
        };

    }(GoNorth.PromptService = GoNorth.PromptService || {}));
}(window.GoNorth = window.GoNorth || {}));