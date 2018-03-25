(function(GoNorth) {
    "use strict";
    (function(Karta) {
        (function(Map) {

            /**
             * Adds the colorpicker to the draw toolbar
             */
            Map.addColorpickerToDrawToolbar = function() {
                var originalFunc = L.DrawToolbar.prototype.getActions;
                L.DrawToolbar.prototype.getActions = function(handler) {
                    var allActions = originalFunc.apply(this, arguments);
                    if(handler.overwriteAction)
                    {
                        allActions = handler.overwriteAction();
                    }
                    return allActions;
                };

                L.DrawToolbar.include({
                    getModeHandlers: function (map) {
                        return [
                            {
                                enabled: this.options.polyline,
                                handler: new L.Draw.Polyline(map, this.options.polyline),
                                title: L.drawLocal.draw.toolbar.buttons.polyline
                            },
                            {
                                enabled: this.options.polygon,
                                handler: new L.Draw.Polygon(map, this.options.polygon),
                                title: L.drawLocal.draw.toolbar.buttons.polygon
                            },
                            {
                                enabled: this.options.rectangle,
                                handler: new L.Draw.Rectangle(map, this.options.rectangle),
                                title: L.drawLocal.draw.toolbar.buttons.rectangle
                            },
                            {
                                enabled: this.options.circle,
                                handler: new L.Draw.Circle(map, this.options.circle),
                                title: L.drawLocal.draw.toolbar.buttons.circle
                            },
                            {
                                enabled: this.options.colorPicker,
                                handler: new L.Draw.ColorPicker(map, this.options.colorPicker),
                                title: L.drawLocal.draw.toolbar.buttons.circle
                            }
                        ];
                    }
                });
            };

        }(Karta.Map = Karta.Map || {}));
    }(GoNorth.Karta = GoNorth.Karta || {}));
}(window.GoNorth = window.GoNorth || {}));