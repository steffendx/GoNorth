(function(GoNorth) {
    "use strict";
    (function(Kortisto) {
        (function(Npc) {

            /**
             * Checks if an object exists in a flex field array
             * 
             * @param {ko.observableArray} searchArray Array to search
             * @param {object} objectToSearch Flex Field object to search
             */
            Npc.doesObjectExistInFlexFieldArray = function(searchArray, objectToSearch)
            {
                var searchObjects = searchArray();
                for(var curObject = 0; curObject < searchObjects.length; ++curObject)
                {
                    if(searchObjects[curObject].id == objectToSearch.id)
                    {
                        return true;
                    }
                }

                return false;
            }

        }(Kortisto.Npc = Kortisto.Npc || {}));
    }(GoNorth.Kortisto = GoNorth.Kortisto || {}));
}(window.GoNorth = window.GoNorth || {}));