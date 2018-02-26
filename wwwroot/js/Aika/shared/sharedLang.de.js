(function(GoNorth) {
    "use strict";
    (function(Aika) {
        (function(Localization) {

            // Start
            GoNorth.DefaultNodeShapes.Localization.TypeNames["aika.Start"] = "Start";

            // Finish
            GoNorth.DefaultNodeShapes.Localization.TypeNames["aika.Finish"] = "Abschluss";

            Localization.Finish = {};
            Localization.Finish.FinishName = "Name";
            Localization.Finish.Colors = {
                White: "Weiss",
                Red: "Rot",
                Green: "Grün",
                Blue: "Blau",
                Yellow: "Gelb",
                Purple: "Lila"
            };

            // All Done
            GoNorth.DefaultNodeShapes.Localization.TypeNames["aika.AllDone"] = "Alles abgeschlossen";

        }(Aika.Localization = Aika.Localization || {}));
    }(GoNorth.Aika = GoNorth.Aika || {}));
}(window.GoNorth = window.GoNorth || {}));