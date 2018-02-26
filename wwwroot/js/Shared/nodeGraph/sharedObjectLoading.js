(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Shapes) {

            /// Object Resource for npcs
            Shapes.ObjectResourceNpc = 0;

            /// Object Resource for items
            Shapes.ObjectResourceItem = 1;

            /// Object Resource for quests
            Shapes.ObjectResourceQuest = 2;
            
            /// Object Resource for dialogs
            Shapes.ObjectResourceDialogs = 3;

            /// Object Resource for Map Marker
            Shapes.ObjectResourceMapMarker = 4;


            /// Cached loaded objects
            var loadedObjects = {};

            /// Deferreds for loading objects
            var objectsLoadingDeferreds = {};


            /**
             * Shared object loading
             * @class
             */
            Shapes.SharedObjectLoading = function()
            {
            };

            Shapes.SharedObjectLoading.prototype = {
                /**
                 * Returns the id for an object
                 * 
                 * @param {object} existingData Optional Existing data
                 * @returns {string} Object Id
                 */
                getObjectId: function(existingData) {

                },

                /**
                 * Returns the object resource
                 * 
                 * @returns {int} Object Resource
                 */
                getObjectResource: function() {

                },

                /**
                 * Clears a loaded shared object
                 * 
                 * @param {object} existingData Optional Existing data
                 */
                clearLoadedSharedObject: function(existingData) {
                    var objectId = this.getObjectId(existingData);
                    if(loadedObjects[this.getObjectResource()]) {
                        loadedObjects[this.getObjectResource()][objectId] = null;
                    }

                    if(objectsLoadingDeferreds[this.getObjectResource()]) {
                        objectsLoadingDeferreds[this.getObjectResource()][objectId] = null;
                    }
                },

                /**
                 * Loads a shared object
                 * 
                 * @param {object} existingData Optional Existing data
                 */
                loadObjectShared: function(existingData) {
                    var objectId = this.getObjectId(existingData);
    
                    if(loadedObjects[this.getObjectResource()]) {
                        var existingObject = loadedObjects[this.getObjectResource()][objectId];
                        if(existingObject)
                        {
                            var def = new jQuery.Deferred();
                            def.resolve(existingObject);
                            return def.promise();
                        }
                    }
    
                    if(objectsLoadingDeferreds[this.getObjectResource()])
                    {
                        var existingDef = objectsLoadingDeferreds[this.getObjectResource()][objectId];
                        if(existingDef)
                        {
                            return existingDef;
                        }
                    }
    
                    var loadingDef = this.loadObject(objectId);
                    if(!objectsLoadingDeferreds[this.getObjectResource()])
                    {
                        objectsLoadingDeferreds[this.getObjectResource()] = {};
                    }

                    objectsLoadingDeferreds[this.getObjectResource()][objectId] = loadingDef;
    
                    var self = this;
                    loadingDef.then(function(object) {
                        if(!loadedObjects[self.getObjectResource()])
                        {
                            loadedObjects[self.getObjectResource()] = {};
                        }

                        loadedObjects[self.getObjectResource()][objectId] = object;
                    });
    
                    return loadingDef;
                },

                /**
                 * Loads and object
                 * 
                 * @param {string} objectId Optional Object Id extracted using getObjectId before
                 * @returns {jQuery.Deferred} Deferred for the loading process
                 */
                loadObject: function(objectId) {

                }
            };


        }(DefaultNodeShapes.Shapes = DefaultNodeShapes.Shapes || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));