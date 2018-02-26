(function(GoNorth) {
    "use strict";
    (function(Aika) {
        (function(Localization) {

            // Start
            GoNorth.DefaultNodeShapes.Localization.TypeNames["aika.Start"] = "Start";

            // Finish
            GoNorth.DefaultNodeShapes.Localization.TypeNames["aika.Finish"] = "Finish";

            Localization.Finish = {};
            Localization.Finish.FinishName = "Name";
            Localization.Finish.Colors = {
                White: "White",
                Red: "Red",
                Green: "Green",
                Blue: "Blue",
                Yellow: "Yellow",
                Purple: "Purple"
            };

            // All Done
            GoNorth.DefaultNodeShapes.Localization.TypeNames["aika.AllDone"] = "All done";

        }(Aika.Localization = Aika.Localization || {}));
    }(GoNorth.Aika = GoNorth.Aika || {}));
}(window.GoNorth = window.GoNorth || {}));