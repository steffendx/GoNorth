(function(GoNorth) {
    "use strict";
    (function(Karta) {
        (function(Map) {

            /**
             * Leaflet Draw Color Picker
             * @class L.Draw.ColorPicker
             */
            L.Draw.ColorPicker = L.Draw.Feature.extend({
                /// Statics
                statics: {
                    TYPE: 'colorpicker'
                },

                /// Options
                options: {
                    availableGeometryColors: [],
                    viewModel: null
                },

                /**
                 * Initalizes the color picker
                 * 
                 * @param {object} map Map Object
                 * @param {object} options Options Object
                 */
                initialize: function (map, options) {
                    // Save the type so super can fire, need to do this as cannot do this.TYPE :(
                    this.type = L.Draw.ColorPicker.TYPE;

                    L.Draw.Feature.prototype.initialize.call(this, map, options);
                },

                /**
                 * Overwrites the actions
                 */
                overwriteAction: function() {
                    var actions = [];
                    var colorPickerSelf = this;
                    jQuery.each(this.options.availableGeometryColors, function(index, color) {
                        actions.push({
                            title: color.name,
                            text: color.name,
                            callback: function() { this.pickColor(color.color); },
                            context: colorPickerSelf
                        });
                    });
                    return actions;
                },

                /**
                 * Picks a color
                 * 
                 * @param {string} color The picked color
                 */
                pickColor: function(color) {
                    this.options.viewModel.mapGeometryToolbar.options.draw.rectangle.shapeOptions.color = color;
                    this.options.viewModel.mapGeometryToolbar.options.draw.polyline.shapeOptions.color = color;
                    this.options.viewModel.mapGeometryToolbar.options.draw.polygon.shapeOptions.color = color;
                    this.options.viewModel.mapGeometryToolbar.options.draw.circle.shapeOptions.color = color;
                    this.disable();
                }
            });

        }(Karta.Map = Karta.Map || {}));
    }(GoNorth.Karta = GoNorth.Karta || {}));
}(window.GoNorth = window.GoNorth || {}));