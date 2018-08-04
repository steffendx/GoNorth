(function(GoNorth) {
    "use strict";
    (function(Kirja) {
        (function(Page) {

            /**
             * Child Link Click Binding Handler
             */
            ko.bindingHandlers.childLinkClick = {
                init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
                    var callbackFunction = valueAccessor();
                    jQuery(element).on("click", "a", function(event) {
                        var href = jQuery(this).attr("href");
                        if(bindingContext.$data)
                        {
                            callbackFunction.apply(bindingContext.$data, [ href, event ]);
                        }
                        else
                        {
                            callbackFunction(href, event);
                        }
                    });
                },
                update: function () {
                }
            };

        }(Kirja.Page = Kirja.Page || {}));
    }(GoNorth.Kirja = GoNorth.Kirja || {}));
}(window.GoNorth = window.GoNorth || {}));