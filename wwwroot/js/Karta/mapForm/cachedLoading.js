(function(GoNorth) {
    "use strict";
    (function(Karta) {
        (function(Map) {

            /// Cached npcs
            var npcCache = {};

            /// Promises for loading npcs
            var npcPromises = {};

            /**
             * Loads an npc and caches the npc
             * @param {string} npcId Id of the npc
             * @returns {JQuery.Deferred} jQuery Deferred for the loading process
             */
            Map.loadNpcCached = function(npcId) {
                if(npcCache[npcId]) {
                    var def = new jQuery.Deferred();

                    // setTimeout is required to prevent the content to be overwritten with loading circle again
                    setTimeout(function() {
                        def.resolve(npcCache[npcId]);
                    }, 1);
                    
                    return def.promise();
                }

                if(npcPromises[npcId]) {
                    return npcPromises[npcId].promise();
                }                

                var def = new jQuery.Deferred();
                npcPromises[npcId] = def;

                jQuery.ajax({
                    url: "/api/KortistoApi/FlexFieldObject?id=" + npcId
                }).done(function(npc) {
                    npcCache[npcId] = npc;
                    npcPromises[npcId] = null;
                    def.resolve(npc);
                }).fail(function() {
                    npcPromises[npcId] = null;
                    def.reject();
                });

                return def.promise();
            }

            /**
             * Invalidates a cached npc
             * @param {string} npcId Id of the npc
             */
            Map.invalidateCachedNpc = function(npcId) {
                npcCache[npcId] = null;
                npcPromises[npcId] = null;
            }

        }(Karta.Map = Karta.Map || {}));
    }(GoNorth.Karta = GoNorth.Karta || {}));
}(window.GoNorth = window.GoNorth || {}));