(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Serialize) {

            /** 
             * Node Serializer Base
             * 
             * @param {object} classType Class Type
             * @param {string} type Type for the serialization
             * @param {string} serializeArrayName Name of the target array for the serialization
             * @class
             */
            Serialize.BaseNodeSerializer = function(classType, type, serializeArrayName) {
                this.classType = classType;
                this.type = type;
                this.serializeArrayName = serializeArrayName;
            }

            Serialize.BaseNodeSerializer.prototype = {
                /**
                 * Serializes a node
                 * 
                 * @param {object} node Node Object
                 * @returns {object} Serialized NOde
                 */
                serialize: function(node) {

                },

                /**
                 * Deserializes a serialized node
                 * 
                 * @param {object} node Serialized Node Object
                 * @returns {object} Deserialized Node
                 */
                deserialize: function(node) {

                },

                /**
                 * Creates a new node
                 * @param {object} initOptions Init Options
                 * @returns {object} New Node
                 */
                createNewNode: function(initOptions) {
                    return new this.classType(initOptions);
                }
            }

        }(DefaultNodeShapes.Serialize = DefaultNodeShapes.Serialize || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));