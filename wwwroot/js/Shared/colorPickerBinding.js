(function (GoNorth) {
    "use strict";
    (function (BindingHandlers) {

        if (typeof ko !== "undefined") {
            /**
             * Colorpicker Binding Handler
             */
            ko.bindingHandlers.colorpicker = {
                init: function (element, valueAccessor) {
                    jQuery(element).colorpicker({
                        format: "hex"
                    });

                    var value = valueAccessor();
                    if (ko.isObservable(value)) {
                        jQuery(element).on('changeColor', function (event) {
                            value(event.color.toHex());
                        });
                    }
                },
                update: function (element, valueAccessor) {
                    var newColor = ko.utils.unwrapObservable(valueAccessor());
                    jQuery(element).colorpicker("setValue", newColor);
                }
            }
        }

    }(GoNorth.BindingHandlers = GoNorth.BindingHandlers || {}));
}(window.GoNorth = window.GoNorth || {}));