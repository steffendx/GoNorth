(function(GoNorth) {
    "use strict";
    (function(Administration) {
        (function(ConfigEncryption) {

            /**
             * Config Encryption View Model
             * @class
             */
            ConfigEncryption.ViewModel = function()
            {
                this.configValue = new ko.observable("");
                this.encryptedConfigValue = new ko.observable("");

                this.isLoading = new ko.observable(false);

                this.errorOccured = new ko.observable(false);

                GoNorth.Util.setupValidation("#gn-encryptionDialogForm");
            };

            ConfigEncryption.ViewModel.prototype = {
                /**
                 * Encryptes the config value
                 */
                encryptConfigValue: function() {
                    if(!jQuery("#gn-encryptionDialogForm").valid())
                    {
                        return;
                    }

                    var request = {
                        configValue: this.configValue()
                    };

                    this.isLoading(true);
                    this.errorOccured(false);
                    var self = this;
                    jQuery.ajax({ 
                        url: "/api/AdministrationApi/EncryptConfigValue", 
                        headers: GoNorth.Util.generateAntiForgeryHeader(),
                        data: JSON.stringify(request), 
                        type: "POST",
                        contentType: "application/json"
                    }).done(function(data) {
                        self.encryptedConfigValue(data);
                        self.isLoading(false);
                    }).fail(function(xhr) {
                        self.isLoading(false);
                        self.errorOccured(true);
                    });
                }
            };

        }(Administration.ConfigEncryption = Administration.ConfigEncryption || {}));
    }(GoNorth.Administration = GoNorth.Administration || {}));
}(window.GoNorth = window.GoNorth || {}));