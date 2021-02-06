(function(GoNorth) {
    "use strict";
    (function(StateMachine) {
        (function(Shapes) {

            /**
             * Builds an svg move cross
             * @returns {string} SVG move cross
             */
            Shapes.buildMoveCross = function() {
                return [
                    '<rect width="30" height="30" fill="transparent"></rect>',
                    '<line x1="15" y1="0" x2="15" y2="30"/>',
                    '<line x1="1" y1="15" x2="29" y2="15"/>',
                    '<polyline points="7 9 1 15 7 21" fill="none" stroke-linejoin="round"></polyline>',
                    '<polyline points="23 9 29 15 23 21" fill="none" stroke-linejoin="round"></polyline>',
                    '<polyline points="9 7 15 0 21 7" fill="none" stroke-linejoin="round"></polyline>',
                    '<polyline points="9 23 15 30 21 23" fill="none" stroke-linejoin="round"></polyline>',
                ].join('');
            }

        }(StateMachine.Shapes = StateMachine.Shapes || {}));
    }(GoNorth.StateMachine = GoNorth.StateMachine || {}));
}(window.GoNorth = window.GoNorth || {}));